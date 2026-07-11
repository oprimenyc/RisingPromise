import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import path from "path";
import { storage } from "./storage";
import { insertNewsletterSignupSchema, insertProgramApplicationSchema } from "@shared/schema";
import { RAFFLE_TIERS_BY_ID } from "@shared/raffleConfig";
import Stripe from "stripe";
import { sendDonationReceipt, sendApplicationConfirmation, sendRaffleConfirmation } from "./email";
import { requireAdmin, requireBasicAdmin, rateLimit, verifyAdminPassword, adminConfigured } from "./security";
import { publishEvent, startDispatcher, queueStats } from "./core/events";
import { ensurePerson, ensureParticipation, seedPrograms } from "./core/identity";
import { seedDecisionLedger, recentDecisions } from "./core/decisions";
import { runVerification, startVerificationSchedule } from "./core/registry";
import { registerGraphProjector, projectPrograms, neighbors, graphStats } from "./core/graph";
import { db } from "./db";
import { capabilities as capabilitiesTable, features as featuresTable } from "@shared/schema";

// Initialize Stripe - will use test keys for development
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-10-29.clover" })
  : null;

// Boot-time capability visibility — never fail silently at request time only
if (!stripe) {
  console.warn("[boot] STRIPE_SECRET_KEY not set — donation/raffle checkout DISABLED");
}
if (!adminConfigured()) {
  console.warn("[boot] no ADMIN_PASSWORD_SHA256/ADMIN_PASSWORD — admin endpoints DISABLED");
}

// Rate limiters (in-memory; durable limiter lands with the M1 spine)
const publicFormLimiter = rateLimit({ name: "public-form", max: 10, windowMs: 60_000 });
const checkoutLimiter = rateLimit({ name: "checkout", max: 10, windowMs: 60_000 });
const adminAuthLimiter = rateLimit({ name: "admin-auth", max: 5, windowMs: 60_000 });

export async function registerRoutes(app: Express): Promise<Server> {
  // ── M1 core spine boot ────────────────────────────────────────────────────
  await seedPrograms();
  await seedDecisionLedger();
  registerGraphProjector();
  await projectPrograms();
  startDispatcher();
  startVerificationSchedule();
  runVerification().catch((e) => console.error("[verify] boot verification error:", e));

  // Internal exec bible — auth-gated (was publicly served from the static
  // build; moved to internal/ and placed behind Basic auth per M0)
  app.get(["/execbible", "/execbible.html"], adminAuthLimiter, requireBasicAdmin, (_req, res) => {
    res.sendFile(path.resolve(process.cwd(), "internal", "execbible.html"));
  });

  // Newsletter signup endpoint
  app.post("/api/newsletter/signup", publicFormLimiter, async (req, res) => {
    try {
      const data = insertNewsletterSignupSchema.parse(req.body);
      
      // Check if email already exists
      const existing = await storage.getNewsletterSignupByEmail(data.email);
      if (existing) {
        return res.status(400).json({ error: "Email already subscribed" });
      }
      
      const signup = await storage.createNewsletterSignup(data);

      const personId = await ensurePerson(data.email, { first: data.name ?? undefined });
      await publishEvent("NewsletterSubscribed", { personId, email: data.email, source: data.source }, personId);

      res.json({ success: true, data: signup });
    } catch (error) {
      console.error("Newsletter signup error:", error);
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  // Get all newsletter signups (admin)
  app.get("/api/newsletter/signups", adminAuthLimiter, requireAdmin, async (_req, res) => {
    try {
      const signups = await storage.getAllNewsletterSignups();
      res.json({ data: signups });
    } catch (error) {
      console.error("Get newsletter signups error:", error);
      res.status(500).json({ error: "Failed to fetch signups" });
    }
  });

  // Program application submission endpoint
  app.post("/api/programs/apply", publicFormLimiter, async (req, res) => {
    try {
      const data = insertProgramApplicationSchema.parse(req.body);
      
      const application = await storage.createProgramApplication(data);

      // Unified identity + program participation (site programType 'it' maps
      // to the comptia program under the Workforce umbrella)
      const programSlug = data.programType === "it" ? "comptia" : data.programType;
      const personId = await ensurePerson(data.email, { first: data.firstName, last: data.lastName });
      await ensureParticipation(personId, programSlug, "applicant", String(application.id));
      await publishEvent("ApplicationSubmitted", { personId, email: data.email, programSlug, applicationId: application.id }, personId);

      sendApplicationConfirmation(data.email, data.firstName, data.programType).catch((err) => {
        console.error("Application confirmation email failed:", err);
      });

      res.json({ success: true, data: application });
    } catch (error) {
      console.error("Program application error:", error);
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  // Get all program applications (admin) — applications no longer land in a void
  app.get("/api/programs/applications", adminAuthLimiter, requireAdmin, async (req, res) => {
    try {
      const { programType } = req.query;
      const applications = programType
        ? await storage.getProgramApplicationsByType(programType as string)
        : await storage.getAllProgramApplications();
      res.json({ data: applications });
    } catch (error) {
      console.error("Get program applications error:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  // Update program application status (admin)
  app.patch("/api/programs/applications/:id/status", adminAuthLimiter, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!status || !['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const application = await storage.updateProgramApplicationStatus(id, status);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json({ success: true, data: application });
    } catch (error) {
      console.error("Update application status error:", error);
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  // Raffle ticket purchase — Create Checkout Session
  app.post("/api/raffle/create-checkout-session", checkoutLimiter, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: "Stripe is not configured." });
      }

      const { tierId, email, name, drawDate, legal } = req.body;
      const tier = RAFFLE_TIERS_BY_ID[tierId];
      if (!tier) {
        return res.status(400).json({ error: "Invalid ticket tier." });
      }
      if (!email) {
        return res.status(400).json({ error: "Email is required." });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `${tier.label} — Rising Promise Raffle`,
              description: `${tier.entries} raffle ${tier.entries === 1 ? "entry" : "entries"}`,
            },
            unit_amount: tier.priceInCents,
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${req.headers.origin || "http://localhost:5000"}/raffle?purchase=success`,
        cancel_url:  `${req.headers.origin || "http://localhost:5000"}/raffle`,
        customer_email: email,
        metadata: {
          type: "raffle",
          tierId,
          entryCount: String(tier.entries),
          buyerName: name || "",
          buyerEmail: email,
          drawDate: drawDate || "To Be Announced",
          legal: (legal || "No purchase necessary. Must be 18+. See official rules.").slice(0, 500),
        },
      });

      await storage.createRaffleEntry({
        email,
        name: name || null,
        ticketTierId: tierId,
        entryCount: tier.entries,
        entryNumbers: [],
        stripeSessionId: session.id,
        paymentStatus: "pending",
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Raffle checkout error:", error);
      res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
  });

  // Stripe donation routes - Create Checkout Session
  app.post("/api/donations/create-checkout-session", checkoutLimiter, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: "Stripe is not configured. Please add STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY to your secrets." });
      }

      const { amount, donorName, donorEmail } = req.body;

      if (!amount || amount < 100) { // Minimum $1.00
        return res.status(400).json({ error: "Amount must be at least $1.00" });
      }

      if (!donorEmail) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Donation to Rising Promise',
                description: 'Supporting Rising Promise and changing lives',
              },
              unit_amount: amount, // Amount in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.origin || 'http://localhost:5000'}/?donation=success`,
        cancel_url: `${req.headers.origin || 'http://localhost:5000'}/?donation=cancelled`,
        customer_email: donorEmail,
        metadata: {
          donorName: donorName || '',
          donorEmail,
        },
      });

      // Store donation in database with pending status
      await storage.createDonation({
        donorName: donorName || null,
        donorEmail,
        amount,
        currency: 'usd',
        stripeSessionId: session.id,
        stripePaymentIntentId: null,
        stripePaymentStatus: 'pending',
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
      console.error("Create checkout session error:", error);
      res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
  });

  // Stripe webhook endpoint - Handle payment confirmation
  app.post("/api/webhooks/stripe", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: "Stripe is not configured" });
      }

      const sig = req.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig) {
        console.error("Missing stripe-signature header");
        return res.status(400).json({ error: "Missing signature" });
      }

      if (!webhookSecret) {
        console.error("STRIPE_WEBHOOK_SECRET not configured");
        return res.status(500).json({ error: "Webhook secret not configured" });
      }

      // Verify the webhook signature
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.rawBody as Buffer,
          sig,
          webhookSecret
        );
      } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
      }

      // Handle the checkout.session.completed event
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const sessionType = session.metadata?.type;

        if (sessionType === "raffle") {
          // ── Raffle purchase ──────────────────────────────────────────────
          const tierId      = session.metadata?.tierId ?? "";
          const entryCount  = parseInt(session.metadata?.entryCount ?? "1", 10);
          const buyerName   = session.metadata?.buyerName ?? "";
          const buyerEmail  = session.customer_email ?? session.metadata?.buyerEmail ?? "";
          const drawDate    = session.metadata?.drawDate ?? "To Be Announced";
          const legal       = session.metadata?.legal ?? "No purchase necessary. Must be 18+.";
          const tierLabel   = RAFFLE_TIERS_BY_ID[tierId]?.label ?? tierId;

          // Generate unique entry codes (RP-XXXX, 36^4 = 1.68M possible codes)
          // Cryptographically random — Math.random() is predictable and has no
          // place in a money-linked drawing (M0 hardening).
          const existingNumbers = await storage.getAllRaffleEntryNumbers();
          const existingSet = new Set(existingNumbers);
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
          const newEntryNumbers: string[] = [];

          while (newEntryNumbers.length < entryCount) {
            let code = "RP-";
            for (let i = 0; i < 4; i++) {
              code += chars.charAt(crypto.randomInt(chars.length));
            }
            if (!existingSet.has(code) && !newEntryNumbers.includes(code)) {
              newEntryNumbers.push(code);
              existingSet.add(code);
            }
          }

          await storage.updateRaffleEntry(session.id, newEntryNumbers, "paid");

          if (buyerEmail) {
            const personId = await ensurePerson(buyerEmail, { first: buyerName || undefined });
            await publishEvent("RaffleTicketPurchased", { personId, email: buyerEmail, entryCount, tierId, sessionId: session.id }, "webhook:stripe");
          }

          if (buyerEmail) {
            sendRaffleConfirmation(buyerEmail, buyerName, newEntryNumbers, tierLabel, drawDate, legal).catch((err) => {
              console.error("Raffle confirmation email failed:", err);
            });
          }

          console.log(`✅ Raffle purchase confirmed: ${session.id} — entries: ${newEntryNumbers.join(", ")}`);

        } else {
          // ── Donation ─────────────────────────────────────────────────────
          await storage.updateDonationPaymentStatus(
            session.id,
            session.payment_intent as string,
            "succeeded"
          );

          const donorEmail = session.customer_email ?? (session.metadata?.donorEmail ?? "");
          const donorName  = session.metadata?.donorName ?? "";
          if (donorEmail) {
            const personId = await ensurePerson(donorEmail, { first: donorName || undefined });
            await publishEvent("DonationReceived", { personId, email: donorEmail, amountCents: session.amount_total ?? 0, sessionId: session.id }, "webhook:stripe");
          }
          if (donorEmail) {
            sendDonationReceipt(donorEmail, donorName, session.amount_total ?? 0, session.id).catch((err) => {
              console.error("Donation receipt email failed:", err);
            });
          }

          console.log(`✅ Donation completed: ${session.id}`);
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(400).json({ error: error.message || "Webhook error" });
    }
  });

  // Admin — verify password (timing-safe hash compare + rate limit; see security.ts)
  app.post("/api/admin/verify-password", adminAuthLimiter, (req, res) => {
    if (!adminConfigured()) {
      return res.status(500).json({ error: "Admin access is not configured on the server." });
    }
    if (!verifyAdminPassword(req.body?.password)) {
      return res.status(401).json({ error: "Invalid password." });
    }
    res.json({ success: true });
  });

  // Admin — get all raffle entries
  app.get("/api/admin/raffle-entries", adminAuthLimiter, requireAdmin, async (req, res) => {
    try {
      const entries = await storage.getAllRaffleEntries();
      res.json({ data: entries });
    } catch (error: any) {
      console.error("Admin raffle entries error:", error);
      res.status(500).json({ error: "Failed to fetch entries." });
    }
  });

  // ── Observability (M1 §8) ────────────────────────────────────────────────
  // public: coarse summary only — no config details, no evidence payloads
  app.get("/api/health", async (_req, res) => {
    try {
      const caps = await db.select({ status: capabilitiesTable.status }).from(capabilitiesTable);
      const counts: Record<string, number> = {};
      for (const c of caps) counts[c.status] = (counts[c.status] ?? 0) + 1;
      const queue = await queueStats();
      const failed = (counts["failed"] ?? 0) + queue.deadLettered;
      res.status(failed > 0 ? 503 : 200).json({
        ok: failed === 0,
        capabilities: counts,
        eventQueue: queue,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Health check error:", error);
      res.status(503).json({ ok: false, error: "health check failed" });
    }
  });

  // admin: full detail — capabilities with evidence, features, ledger, graph
  app.get("/api/admin/observability", adminAuthLimiter, requireAdmin, async (_req, res) => {
    try {
      const [caps, feats, queue, graph, ledger] = await Promise.all([
        db.select().from(capabilitiesTable),
        db.select().from(featuresTable),
        queueStats(),
        graphStats(),
        recentDecisions(10),
      ]);
      res.json({ capabilities: caps, features: feats, eventQueue: queue, graph, recentDecisions: ledger });
    } catch (error) {
      console.error("Observability error:", error);
      res.status(500).json({ error: "Failed to assemble observability report" });
    }
  });

  // admin: run runtime verification on demand
  app.post("/api/admin/verify", adminAuthLimiter, requireAdmin, async (_req, res) => {
    try {
      const counts = await runVerification();
      res.json({ success: true, counts });
    } catch (error) {
      console.error("On-demand verification error:", error);
      res.status(500).json({ error: "Verification run failed" });
    }
  });

  // admin: graph neighborhood query (restricted nodes visible to admin only)
  app.get("/api/admin/graph/:kind/:refId", adminAuthLimiter, requireAdmin, async (req, res) => {
    try {
      const result = await neighbors(req.params.kind, req.params.refId, true);
      if (!result) return res.status(404).json({ error: "Node not found" });
      res.json(result);
    } catch (error) {
      console.error("Graph query error:", error);
      res.status(500).json({ error: "Graph query failed" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

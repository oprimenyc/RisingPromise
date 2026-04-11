import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSignupSchema, insertProgramApplicationSchema } from "@shared/schema";
import Stripe from "stripe";
import { sendDonationReceipt, sendApplicationConfirmation, sendRaffleConfirmation } from "./email";

// Raffle ticket tier definitions — server-side source of truth for pricing
const RAFFLE_TICKET_TIERS: Record<string, { label: string; priceInCents: number; entries: number }> = {
  single:    { label: "Single Entry",   priceInCents: 2500,  entries: 1  },
  supporter: { label: "Supporter Pack", priceInCents: 10000, entries: 5  },
  champion:  { label: "Champion Pack",  priceInCents: 17500, entries: 10 },
};

// Initialize Stripe - will use test keys for development
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-11-20.acacia" })
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Newsletter signup endpoint
  app.post("/api/newsletter/signup", async (req, res) => {
    try {
      const data = insertNewsletterSignupSchema.parse(req.body);
      
      // Check if email already exists
      const existing = await storage.getNewsletterSignupByEmail(data.email);
      if (existing) {
        return res.status(400).json({ error: "Email already subscribed" });
      }
      
      const signup = await storage.createNewsletterSignup(data);
      res.json({ success: true, data: signup });
    } catch (error) {
      console.error("Newsletter signup error:", error);
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  // Get all newsletter signups (for admin) - TODO: Add authentication before enabling
  // app.get("/api/newsletter/signups", async (req, res) => {
  //   try {
  //     const signups = await storage.getAllNewsletterSignups();
  //     res.json({ data: signups });
  //   } catch (error) {
  //     console.error("Get newsletter signups error:", error);
  //     res.status(500).json({ error: "Failed to fetch signups" });
  //   }
  // });

  // Program application submission endpoint
  app.post("/api/programs/apply", async (req, res) => {
    try {
      const data = insertProgramApplicationSchema.parse(req.body);
      
      const application = await storage.createProgramApplication(data);

      sendApplicationConfirmation(data.email, data.firstName, data.programType).catch((err) => {
        console.error("Application confirmation email failed:", err);
      });

      res.json({ success: true, data: application });
    } catch (error) {
      console.error("Program application error:", error);
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  // Get all program applications (for admin) - TODO: Add authentication before enabling
  // app.get("/api/programs/applications", async (req, res) => {
  //   try {
  //     const { programType } = req.query;
  //     
  //     const applications = programType
  //       ? await storage.getProgramApplicationsByType(programType as string)
  //       : await storage.getAllProgramApplications();
  //     
  //     res.json({ data: applications });
  //   } catch (error) {
  //     console.error("Get program applications error:", error);
  //     res.status(500).json({ error: "Failed to fetch applications" });
  //   }
  // });

  // Update program application status (for admin) - TODO: Add authentication before enabling
  // app.patch("/api/programs/applications/:id/status", async (req, res) => {
  //   try {
  //     const id = parseInt(req.params.id);
  //     const { status } = req.body;
  //     
  //     if (!status || !['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
  //       return res.status(400).json({ error: "Invalid status" });
  //     }
  //     
  //     const application = await storage.updateProgramApplicationStatus(id, status);
  //     
  //     if (!application) {
  //       return res.status(404).json({ error: "Application not found" });
  //     }
  //     
  //     res.json({ success: true, data: application });
  //   } catch (error) {
  //     console.error("Update application status error:", error);
  //     res.status(500).json({ error: "Failed to update status" });
  //     }
  // });

  // Raffle ticket purchase — Create Checkout Session
  app.post("/api/raffle/create-checkout-session", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: "Stripe is not configured." });
      }

      const { tierId, email, name, drawDate, legal } = req.body;
      const tier = RAFFLE_TICKET_TIERS[tierId];
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
  app.post("/api/donations/create-checkout-session", async (req, res) => {
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
                description: 'Supporting workforce training and community empowerment',
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
          const tierLabel   = RAFFLE_TICKET_TIERS[tierId]?.label ?? tierId;

          // Generate unique entry codes (RP-XXXX, 36^4 = 1.68M possible codes)
          const existingNumbers = await storage.getAllRaffleEntryNumbers();
          const existingSet = new Set(existingNumbers);
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
          const newEntryNumbers: string[] = [];

          while (newEntryNumbers.length < entryCount) {
            let code = "RP-";
            for (let i = 0; i < 4; i++) {
              code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            if (!existingSet.has(code) && !newEntryNumbers.includes(code)) {
              newEntryNumbers.push(code);
              existingSet.add(code);
            }
          }

          await storage.updateRaffleEntry(session.id, newEntryNumbers, "paid");

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

  // Admin — verify password
  app.post("/api/admin/verify-password", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return res.status(500).json({ error: "ADMIN_PASSWORD is not configured on the server." });
    }
    if (password !== adminPassword) {
      return res.status(401).json({ error: "Invalid password." });
    }
    res.json({ success: true });
  });

  // Admin — get all raffle entries
  app.get("/api/admin/raffle-entries", async (req, res) => {
    const password = req.headers["x-admin-password"];
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || password !== adminPassword) {
      return res.status(401).json({ error: "Unauthorized." });
    }
    try {
      const entries = await storage.getAllRaffleEntries();
      res.json({ data: entries });
    } catch (error: any) {
      console.error("Admin raffle entries error:", error);
      res.status(500).json({ error: "Failed to fetch entries." });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

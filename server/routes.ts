import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSignupSchema, insertProgramApplicationSchema } from "@shared/schema";
import Stripe from "stripe";

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

      // In production, verify the webhook signature
      // const sig = req.headers['stripe-signature'];
      // const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

      // For now, accept the event directly (development mode)
      const event = req.body;

      // Handle the checkout.session.completed event
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Update donation status in database
        await storage.updateDonationPaymentStatus(
          session.id,
          session.payment_intent as string,
          'succeeded'
        );

        // TODO: Send confirmation email with tax receipt
        // This will be implemented next
        console.log(`✅ Donation completed: ${session.id}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(400).json({ error: error.message || "Webhook error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

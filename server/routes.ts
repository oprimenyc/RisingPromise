import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSignupSchema, insertProgramApplicationSchema } from "@shared/schema";

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

  const httpServer = createServer(app);

  return httpServer;
}

import type { 
  InsertNewsletterSignup, 
  NewsletterSignup,
  InsertProgramApplication,
  ProgramApplication,
  InsertDonation,
  Donation
} from "@shared/schema";
import { newsletterSignups, programApplications, donations } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Newsletter operations
  createNewsletterSignup(signup: InsertNewsletterSignup): Promise<NewsletterSignup>;
  getNewsletterSignupByEmail(email: string): Promise<NewsletterSignup | undefined>;
  getAllNewsletterSignups(): Promise<NewsletterSignup[]>;
  
  // Program application operations
  createProgramApplication(application: InsertProgramApplication): Promise<ProgramApplication>;
  getProgramApplication(id: number): Promise<ProgramApplication | undefined>;
  getAllProgramApplications(): Promise<ProgramApplication[]>;
  getProgramApplicationsByType(programType: string): Promise<ProgramApplication[]>;
  updateProgramApplicationStatus(id: number, status: string): Promise<ProgramApplication | undefined>;

  // Donation operations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonationBySessionId(sessionId: string): Promise<Donation | undefined>;
  updateDonationPaymentStatus(sessionId: string, paymentIntentId: string, status: string): Promise<Donation | undefined>;
  markReceiptSent(id: number): Promise<Donation | undefined>;
  getAllDonations(): Promise<Donation[]>;
}

export class DbStorage implements IStorage {
  // Newsletter operations
  async createNewsletterSignup(signup: InsertNewsletterSignup): Promise<NewsletterSignup> {
    const [result] = await db.insert(newsletterSignups).values(signup).returning();
    return result;
  }

  async getNewsletterSignupByEmail(email: string): Promise<NewsletterSignup | undefined> {
    const [result] = await db.select().from(newsletterSignups).where(eq(newsletterSignups.email, email));
    return result;
  }

  async getAllNewsletterSignups(): Promise<NewsletterSignup[]> {
    return await db.select().from(newsletterSignups);
  }

  // Program application operations
  async createProgramApplication(application: InsertProgramApplication): Promise<ProgramApplication> {
    const [result] = await db.insert(programApplications).values(application).returning();
    return result;
  }

  async getProgramApplication(id: number): Promise<ProgramApplication | undefined> {
    const [result] = await db.select().from(programApplications).where(eq(programApplications.id, id));
    return result;
  }

  async getAllProgramApplications(): Promise<ProgramApplication[]> {
    return await db.select().from(programApplications);
  }

  async getProgramApplicationsByType(programType: string): Promise<ProgramApplication[]> {
    return await db.select().from(programApplications).where(eq(programApplications.programType, programType));
  }

  async updateProgramApplicationStatus(id: number, status: string): Promise<ProgramApplication | undefined> {
    const [result] = await db
      .update(programApplications)
      .set({ status })
      .where(eq(programApplications.id, id))
      .returning();
    return result;
  }

  // Donation operations
  async createDonation(donation: InsertDonation): Promise<Donation> {
    const [result] = await db.insert(donations).values(donation).returning();
    return result;
  }

  async getDonationBySessionId(sessionId: string): Promise<Donation | undefined> {
    const [result] = await db.select().from(donations).where(eq(donations.stripeSessionId, sessionId));
    return result;
  }

  async updateDonationPaymentStatus(sessionId: string, paymentIntentId: string, status: string): Promise<Donation | undefined> {
    const [result] = await db
      .update(donations)
      .set({ 
        stripePaymentIntentId: paymentIntentId,
        stripePaymentStatus: status 
      })
      .where(eq(donations.stripeSessionId, sessionId))
      .returning();
    return result;
  }

  async markReceiptSent(id: number): Promise<Donation | undefined> {
    const [result] = await db
      .update(donations)
      .set({ receiptSent: new Date() })
      .where(eq(donations.id, id))
      .returning();
    return result;
  }

  async getAllDonations(): Promise<Donation[]> {
    return await db.select().from(donations);
  }
}

export const storage = new DbStorage();

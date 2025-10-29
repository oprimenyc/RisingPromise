import type { 
  InsertNewsletterSignup, 
  NewsletterSignup,
  InsertProgramApplication,
  ProgramApplication 
} from "@shared/schema";
import { newsletterSignups, programApplications } from "@shared/schema";
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
}

export const storage = new DbStorage();

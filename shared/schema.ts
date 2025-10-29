import { z } from "zod";

/**
 * Rising Promise Website Configuration Schema
 * This file defines all the types and schemas for the website content
 */

// Feature toggles
export const featureTogglesSchema = z.object({
  raffleActive: z.boolean(),
  programsActive: z.boolean(),
  cnaApplicationOpen: z.boolean(),
  itApplicationOpen: z.boolean(),
  showRaffleInNav: z.boolean(),
});

export type FeatureToggles = z.infer<typeof featureTogglesSchema>;

// Navigation
export const navItemSchema = z.object({
  text: z.string(),
  href: z.string(),
});

export type NavItem = z.infer<typeof navItemSchema>;

// Hero section
export const heroSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  primaryButtonText: z.string(),
  primaryButtonHref: z.string(),
  secondaryButtonText: z.string(),
  secondaryButtonHref: z.string(),
  backgroundImage: z.string(),
});

export type Hero = z.infer<typeof heroSchema>;

// Story section
export const storySchema = z.object({
  headline: z.string(),
  paragraphs: z.array(z.string()),
  closing: z.string(),
});

export type Story = z.infer<typeof storySchema>;

// Who We See section
export const whoWeSeeSchema = z.object({
  headline: z.string(),
  paragraphs: z.array(z.string()),
  closing: z.string(),
});

export type WhoWeSee = z.infer<typeof whoWeSeeSchema>;

// What We Do section
export const featureSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
});

export const whatWeDoSchema = z.object({
  headline: z.string(),
  features: z.array(featureSchema),
  promise: z.string(),
  buttonText: z.string(),
  buttonHref: z.string(),
  buttonComingSoon: z.boolean(),
});

export type Feature = z.infer<typeof featureSchema>;
export type WhatWeDo = z.infer<typeof whatWeDoSchema>;

// Impact section
export const statSchema = z.object({
  number: z.string(),
  label: z.string(),
  sublabel: z.string().optional(),
});

export const impactSchema = z.object({
  headline: z.string(),
  introText: z.string(),
  stats: z.array(statSchema),
  closing: z.string(),
});

export type Stat = z.infer<typeof statSchema>;
export type Impact = z.infer<typeof impactSchema>;

// Team section
export const teamMemberSchema = z.object({
  name: z.string(),
  title: z.string(),
  photo: z.string(),
  quote: z.string(),
});

export const teamSchema = z.object({
  headline: z.string(),
  introText: z.string(),
  members: z.array(teamMemberSchema),
  closing: z.string(),
});

export type TeamMember = z.infer<typeof teamMemberSchema>;
export type Team = z.infer<typeof teamSchema>;

// Join Us section
export const actionButtonSchema = z.object({
  icon: z.string(),
  text: z.string(),
  href: z.string(),
  comingSoon: z.boolean(),
});

export const joinUsSchema = z.object({
  headline: z.string(),
  needUs: z.object({
    headline: z.string(),
    text: z.string(),
    formPlaceholderName: z.string(),
    formPlaceholderEmail: z.string(),
    buttonText: z.string(),
    note: z.string(),
  }),
  believeInUs: z.object({
    headline: z.string(),
    text: z.string(),
    actions: z.array(actionButtonSchema),
    closing: z.string(),
  }),
});

export type ActionButton = z.infer<typeof actionButtonSchema>;
export type JoinUs = z.infer<typeof joinUsSchema>;

// Programs
export const programSchema = z.object({
  visible: z.boolean(),
  title: z.string(),
  icon: z.string(),
  image: z.string(),
  duration: z.string(),
  format: z.string(),
  salary: z.string(),
  certifications: z.string().optional(),
  curriculum: z.array(z.string()),
  requirements: z.array(z.string()),
  careerPaths: z.array(z.string()),
});

export type Program = z.infer<typeof programSchema>;

// Raffle
export const ticketPricingSchema = z.object({
  price: z.string(),
  entries: z.string(),
  description: z.string(),
  badge: z.boolean(),
});

export type TicketPricing = z.infer<typeof ticketPricingSchema>;

// Organization info
export const organizationSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  nonprofitStatus: z.string(),
});

export type Organization = z.infer<typeof organizationSchema>;

// Social media
export const socialSchema = z.object({
  facebook: z.string(),
  instagram: z.string(),
  linkedin: z.string(),
  twitter: z.string(),
});

export type Social = z.infer<typeof socialSchema>;

// Main site configuration
export const siteConfigSchema = z.object({
  features: featureTogglesSchema,
  organization: organizationSchema,
  social: socialSchema,
  navigation: z.object({
    menuItems: z.array(navItemSchema),
  }),
  hero: heroSchema,
  story: storySchema,
  whoWeSee: whoWeSeeSchema,
  whatWeDo: whatWeDoSchema,
  impact: impactSchema,
  team: teamSchema,
  joinUs: joinUsSchema,
  programs: z.object({
    cna: programSchema,
    it: programSchema,
  }),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;

// Database Tables
import { pgTable, text, timestamp, integer, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Newsletter Signups Table
export const newsletterSignups = pgTable("newsletter_signups", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  source: text("source").notNull(), // 'homepage', 'footer', 'programs', etc.
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
});

export const insertNewsletterSignupSchema = createInsertSchema(newsletterSignups).omit({
  id: true,
  subscribedAt: true,
});

export type InsertNewsletterSignup = z.infer<typeof insertNewsletterSignupSchema>;
export type NewsletterSignup = typeof newsletterSignups.$inferSelect;

// Program Applications Table
export const programApplications = pgTable("program_applications", {
  id: serial("id").primaryKey(),
  programType: text("program_type").notNull(), // 'cna' or 'it'
  
  // Personal Info
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  
  // Additional Info
  hasHighSchoolDiploma: text("has_high_school_diploma").notNull(), // 'yes' or 'no'
  hasTransportation: text("has_transportation").notNull(), // 'yes' or 'no'
  motivationStatement: text("motivation_statement").notNull(),
  
  // Metadata
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'reviewed', 'accepted', 'rejected'
});

export const insertProgramApplicationSchema = createInsertSchema(programApplications).omit({
  id: true,
  submittedAt: true,
  status: true,
});

export type InsertProgramApplication = z.infer<typeof insertProgramApplicationSchema>;
export type ProgramApplication = typeof programApplications.$inferSelect;

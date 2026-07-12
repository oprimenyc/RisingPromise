import { sql } from "drizzle-orm";
import {
  pgSchema,
  index,
  jsonb,
  timestamp,
  varchar,
  integer,
  text,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema-per-domain (D2): all LMS tables live in the "lms" Postgres schema on
// the shared cluster; core spine tables stay in public.
export const lms = pgSchema("lms");

// Session storage table - mandatory for Replit Auth
export const sessions = lms.table(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = lms.table("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  fundingType: varchar("funding_type", { enum: ["WIOA", "Private"] }).default("Private"),
  // RBAC: role is never settable via OIDC upsert or bulk import; admin grants only (see rbac.ts)
  role: varchar("role", { enum: ["student", "instructor", "staff", "admin"] }).notNull().default("student"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courses = lms.table("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  totalModules: integer("total_modules").notNull().default(0),
  totalDuration: integer("total_duration").notNull().default(0), // in minutes
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const modules = lms.table("modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  title: varchar("title").notNull(),
  description: text("description"),
  videoUrl: varchar("video_url"),
  duration: integer("duration").notNull().default(0), // in minutes
  orderIndex: integer("order_index").notNull(),
  isLocked: boolean("is_locked").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const enrollments = lms.table("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  enrollmentDate: timestamp("enrollment_date").defaultNow(),
  completionDate: timestamp("completion_date"),
  durationDays: integer("duration_days").notNull().default(180),
  wioaFunding: decimal("wioa_funding", { precision: 10, scale: 2 }).default('8500.00'),
  caseWorkerName: varchar("case_worker_name"),
  programCode: varchar("program_code").default('WIOA-CT-2024'),
  isActive: boolean("is_active").notNull().default(true),
});

export const userProgress = lms.table("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  moduleId: varchar("module_id").notNull().references(() => modules.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  watchTime: integer("watch_time").notNull().default(0), // in seconds
  totalTime: integer("total_time").notNull().default(0), // in seconds
  isCompleted: boolean("is_completed").notNull().default(false),
  lastWatchedAt: timestamp("last_watched_at").defaultNow(),
});

export const studySessions = lms.table("study_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  sessionDate: timestamp("session_date").defaultNow(),
  duration: integer("duration").notNull(), // in minutes
  moduleId: varchar("module_id").references(() => modules.id),
});

// Email automation tables
export const emailTemplates = lms.table("email_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  subject: varchar("subject").notNull(),
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content"),
  templateType: varchar("template_type").notNull(), // 'welcome', 'progress', 'inactivity', 'completion'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailLog = lms.table("email_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  recipientEmail: varchar("recipient_email").notNull(),
  templateId: varchar("template_id").references(() => emailTemplates.id),
  subject: varchar("subject").notNull(),
  status: varchar("status").notNull().default('pending'), // 'pending', 'sent', 'failed'
  sentAt: timestamp("sent_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wioaReports = lms.table("wioa_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportDate: timestamp("report_date").defaultNow(),
  reportPeriod: varchar("report_period").notNull(), // e.g., "Q1-2024"
  totalStudents: integer("total_students").notNull().default(0),
  activeStudents: integer("active_students").notNull().default(0),
  completedStudents: integer("completed_students").notNull().default(0),
  fundingTotal: decimal("funding_total", { precision: 12, scale: 2 }).default('0.00'),
  csvFilePath: varchar("csv_file_path"),
  submittedTo: varchar("submitted_to"), // email address
  submittedBy: varchar("submitted_by").references(() => users.id),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemSettings = lms.table("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  settingKey: varchar("setting_key").notNull().unique(),
  settingValue: text("setting_value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type EmailLog = typeof emailLog.$inferSelect;
export type WIOAReport = typeof wioaReports.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertModuleSchema = createInsertSchema(modules).omit({
  id: true,
  createdAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrollmentDate: true,
});

export const insertProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  lastWatchedAt: true,
});

export const insertStudySessionSchema = createInsertSchema(studySessions).omit({
  id: true,
  sessionDate: true,
});

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertWIOAReportSchema = createInsertSchema(wioaReports).omit({
  id: true,
  reportDate: true,
  createdAt: true,
});

export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type InsertWIOAReport = z.infer<typeof insertWIOAReportSchema>;

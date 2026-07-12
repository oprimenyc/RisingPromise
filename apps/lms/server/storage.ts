import {
  users,
  courses,
  modules,
  enrollments,
  userProgress,
  studySessions,
  emailTemplates,
  emailLog,
  wioaReports,
  systemSettings,
  type User,
  type UpsertUser,
  type Course,
  type Module,
  type Enrollment,
  type UserProgress,
  type StudySession,
  type EmailTemplate,
  type EmailLog,
  type WIOAReport,
  type SystemSetting,
  type InsertEnrollment,
  type InsertProgress,
  type InsertStudySession,
  type InsertEmailTemplate,
  type InsertWIOAReport,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sum, count, desc } from "drizzle-orm";
import { publishEvent } from "../../../server/core/events";
import { ai } from "../../../server/providers/ai";
import { ensurePerson, linkIdentity, ensureParticipation } from "../../../server/core/identity";

// LMS courses currently all belong to the CompTIA track under the Workforce
// umbrella (D-008). Override per-deployment via LMS_PROGRAM_SLUG until a
// course->program mapping column exists.
const LMS_PROGRAM_SLUG = process.env.LMS_PROGRAM_SLUG || "comptia";

/**
 * Map an LMS user to a core person and emit an evidence event (M1 §2 steps
 * 3-4). Never blocks the LMS write path, never fails silently.
 */
async function emitStudentEvent(
  type: "StudentEnrolled" | "CourseCompleted",
  user: User | undefined,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    if (!user?.email) throw new Error(`LMS user ${payload.userId} has no email; cannot map to core person`);
    const personId = await ensurePerson(user.email, { first: user.firstName ?? undefined, last: user.lastName ?? undefined });
    await linkIdentity(personId, "replit", user.id);
    await ensureParticipation(personId, LMS_PROGRAM_SLUG, "student", String(payload.enrollmentId ?? ""));
    await publishEvent(type, { ...payload, personId, email: user.email, programSlug: LMS_PROGRAM_SLUG }, "lms");
  } catch (error: any) {
    console.error(`[events] ${type} emission FAILED for user ${user?.id ?? payload.userId}: ${String(error?.message ?? error)}`);
  }
}

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  setUserRole(id: string, role: "student" | "instructor" | "staff" | "admin"): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Dashboard metrics
  getUserMetrics(userId: string): Promise<any>;
  
  // Course operations
  getUserCourses(userId: string): Promise<Course[]>;
  getCourseWithProgress(courseId: string, userId: string): Promise<any>;
  getCourseModules(courseId: string, userId: string): Promise<any[]>;
  
  // Enrollment operations
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getUserEnrollments(userId: string): Promise<Enrollment[]>;
  
  // Progress operations
  updateProgress(progress: InsertProgress): Promise<UserProgress>;
  getCourseProgress(userId: string, courseId: string): Promise<UserProgress[]>;
  
  // Study session operations
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  
  // Bulk operations
  bulkCreateUsers(users: UpsertUser[]): Promise<User[]>;
  bulkCreateEnrollments(enrollments: InsertEnrollment[]): Promise<Enrollment[]>;
  
  // WIOA compliance
  getWIOACompliance(userId: string): Promise<any>;
  
  // AI operations
  getChatbotResponse(message: string, userId: string): Promise<string>;
  generateResume(resumeData: any, userId: string): Promise<any>;
  generateResumePDF(resumeContent: string): Promise<string>;
  
  // Email and Automation Operations
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  getEmailTemplatesByType(type: string): Promise<EmailTemplate[]>;
  getEmailTemplateByName(name: string): Promise<EmailTemplate | undefined>;
  logEmail(emailData: Partial<EmailLog>): Promise<EmailLog>;
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  setSystemSetting(setting: { settingKey: string; settingValue: string; description?: string }): Promise<SystemSetting>;
  getInactiveUsers(thresholdDays: number): Promise<(User & { lastLoginAt?: Date })[]>;
  getUsersNearMilestones(): Promise<(User & { progressPercentage: number })[]>;
  hasRecentMilestoneEmail(userId: string, milestone: number): Promise<boolean>;
  hasCompletionEmail(userId: string): Promise<boolean>;
  hasWelcomeEmails(userId: string): Promise<boolean>;
  getNewUsersForWelcomeSequence(): Promise<User[]>;
  
  // WIOA Reporting
  createWIOAReport(reportData: InsertWIOAReport): Promise<WIOAReport>;
  getWIOAReports(): Promise<WIOAReport[]>;
  updateWIOAReportSubmission(reportId: string, submittedTo: string, submittedBy: string): Promise<WIOAReport>;
  generateWIOACSVData(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async setUserRole(id: string, role: "student" | "instructor" | "staff" | "admin"): Promise<User | undefined> {
    // The ONLY code path that changes a role. Always logged (audit trail).
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (user) {
      console.log(`[rbac] role change: user=${id} email=${user.email} role=${role}`);
    }
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      // Security invariant: role is NEVER settable through upsert (OIDC login,
      // bulk import). Role changes go through an explicit admin path only.
      const { role: _ignoredRole, ...safeData } = userData as UpsertUser & { role?: string };
      const [user] = await db
        .insert(users)
        .values(safeData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...safeData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error) {
      console.error('Error upserting user:', error);
      throw new Error('Failed to create or update user');
    }
  }

  async getUserMetrics(userId: string): Promise<any> {
    // Get total study hours
    const studyHoursResult = await db
      .select({
        totalMinutes: sum(studySessions.duration)
      })
      .from(studySessions)
      .where(eq(studySessions.userId, userId));

    const totalStudyHours = Number(studyHoursResult[0]?.totalMinutes || 0) / 60;

    // Get completed modules count
    const completedModulesResult = await db
      .select({
        count: count()
      })
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.isCompleted, true)
      ));

    const completedModules = Number(completedModulesResult[0]?.count || 0);

    // Get total modules count from enrolled courses
    const enrolledCoursesResult = await db
      .select({
        totalModules: sum(courses.totalModules)
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, userId));

    const totalModules = Number(enrolledCoursesResult[0]?.totalModules || 0);

    // Get days remaining (from most recent enrollment)
    const recentEnrollment = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.enrollmentDate))
      .limit(1);

    let daysRemaining = 0;
    if (recentEnrollment[0]) {
      const enrollmentDate = new Date(recentEnrollment[0].enrollmentDate!);
      const endDate = new Date(enrollmentDate);
      endDate.setDate(endDate.getDate() + recentEnrollment[0].durationDays);
      const today = new Date();
      daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    }

    return {
      studyHours: Math.round(totalStudyHours * 10) / 10,
      modulesCompleted: completedModules,
      totalModules,
      daysRemaining,
      weeklyStudyHours: Math.round((totalStudyHours * 0.3) * 10) / 10, // Approximate weekly hours
    };
  }

  async getUserCourses(userId: string): Promise<Course[]> {
    const result = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        totalModules: courses.totalModules,
        totalDuration: courses.totalDuration,
        isActive: courses.isActive,
        createdAt: courses.createdAt,
      })
      .from(courses)
      .innerJoin(enrollments, eq(courses.id, enrollments.courseId))
      .where(eq(enrollments.userId, userId));

    return result;
  }

  async getCourseWithProgress(courseId: string, userId: string): Promise<any> {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId));

    if (!course) {
      throw new Error('Course not found');
    }

    const modulesList = await this.getCourseModules(courseId, userId);
    
    return {
      ...course,
      modules: modulesList,
    };
  }

  async getCourseModules(courseId: string, userId: string): Promise<any[]> {
    const modulesList = await db
      .select()
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(modules.orderIndex);

    const progressList = await db
      .select()
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.courseId, courseId)
      ));

    const progressMap = new Map(progressList.map(p => [p.moduleId, p]));

    return modulesList.map(module => ({
      ...module,
      progress: progressMap.get(module.id) || null,
    }));
  }

  async createEnrollment(enrollmentData: InsertEnrollment): Promise<Enrollment> {
    const [enrollment] = await db
      .insert(enrollments)
      .values(enrollmentData)
      .returning();
    const user = await this.getUser(enrollment.userId);
    await emitStudentEvent("StudentEnrolled", user, {
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      enrollmentId: enrollment.id,
      programCode: enrollment.programCode,
    });
    return enrollment;
  }

  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    return await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.enrollmentDate));
  }

  async updateProgress(progressData: InsertProgress): Promise<UserProgress> {
    const [existing] = await db
      .select()
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, progressData.userId),
        eq(userProgress.moduleId, progressData.moduleId)
      ));

    let result: UserProgress;
    if (existing) {
      const [updated] = await db
        .update(userProgress)
        .set({
          watchTime: progressData.watchTime,
          totalTime: progressData.totalTime,
          isCompleted: progressData.isCompleted,
          lastWatchedAt: new Date(),
        })
        .where(eq(userProgress.id, existing.id))
        .returning();
      result = updated;
    } else {
      const [created] = await db
        .insert(userProgress)
        .values(progressData)
        .returning();
      result = created;
    }

    // Course completion is derived: when the last module completes, stamp the
    // enrollment and emit the CourseCompleted evidence event exactly once.
    if (result.isCompleted) {
      await this.checkCourseCompletion(result.userId, result.courseId);
    }
    return result;
  }

  private async checkCourseCompletion(userId: string, courseId: string): Promise<void> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId), eq(enrollments.isActive, true)));
    if (!enrollment || enrollment.completionDate) return;

    const courseModules = await db.select({ id: modules.id }).from(modules).where(eq(modules.courseId, courseId));
    if (courseModules.length === 0) return;
    const completed = await db
      .select({ moduleId: userProgress.moduleId })
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.courseId, courseId), eq(userProgress.isCompleted, true)));
    const completedIds = new Set(completed.map((c) => c.moduleId));
    if (!courseModules.every((m) => completedIds.has(m.id))) return;

    const completionDate = new Date();
    await db.update(enrollments).set({ completionDate }).where(eq(enrollments.id, enrollment.id));
    const user = await this.getUser(userId);
    await emitStudentEvent("CourseCompleted", user, {
      userId,
      courseId,
      enrollmentId: enrollment.id,
      completionDate: completionDate.toISOString(),
    });
  }

  async getCourseProgress(userId: string, courseId: string): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.courseId, courseId)
      ));
  }

  async createStudySession(sessionData: InsertStudySession): Promise<StudySession> {
    const [session] = await db
      .insert(studySessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async getWIOACompliance(userId: string): Promise<any> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.enrollmentDate))
      .limit(1);

    if (!enrollment) {
      return {
        isEnrolled: false,
        funding: 0,
        programCode: null,
        caseWorker: null,
        daysRemaining: 0,
      };
    }

    const enrollmentDate = new Date(enrollment.enrollmentDate!);
    const endDate = new Date(enrollmentDate);
    endDate.setDate(endDate.getDate() + enrollment.durationDays);
    const today = new Date();
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      isEnrolled: true,
      funding: enrollment.wioaFunding,
      programCode: enrollment.programCode,
      caseWorker: enrollment.caseWorkerName,
      daysRemaining,
      enrollmentDate: enrollment.enrollmentDate,
      completionDate: enrollment.completionDate,
    };
  }

  // AI Operations — via the ai.chat capability (D8: no vendor SDK here)
  async getChatbotResponse(message: string, userId: string): Promise<string> {
    try {
      if (!ai) {
        console.warn(`[ai] chat unavailable (ai capability unconfigured) user=${userId}`);
        return "AI assistance is not configured on this server. Please contact support.";
      }

      // System prompt for CompTIA Tech+ teaching assistant
      const systemPrompt = `You are an AI teaching assistant for CompTIA Tech+ (FC0-U71) certification training. Your role is to:

1. Answer questions about CompTIA Tech+ curriculum and exam objectives
2. Provide study tips and strategies for IT certification
3. Offer basic troubleshooting guidance for common tech issues
4. Maintain a professional, encouraging, and knowledgeable tone

Guidelines:
- Only discuss topics related to CompTIA Tech+ certification and IT fundamentals
- If asked about non-curriculum topics, politely redirect to course content
- For personal issues, payment problems, or enrollment questions, respond with: "I cannot assist with this specific request. I will escalate this to a human administrator who will contact you shortly."
- Keep responses clear, concise, and educational
- Focus on helping students succeed in their certification journey

CompTIA Tech+ (FC0-U71) covers: IT concepts, infrastructure, applications, software development, database fundamentals, and security.`;

      return await ai.chat({ system: systemPrompt, user: message, tier: "fast", maxTokens: 500, temperature: 0.7 });
    } catch (error) {
      console.error("Error getting chatbot response:", error);
      return "I'm currently experiencing technical difficulties. Please try again in a moment or contact support if the problem persists.";
    }
  }

  async generateResume(resumeData: any, userId: string): Promise<any> {
    try {
      if (!ai) {
        throw new Error("ai capability unconfigured (OPENAI_API_KEY missing) — resume generation unavailable");
      }

      const { personalInfo, workExperience, skills, certifications } = resumeData;

      const prompt = `Create a professional, ATS-optimized resume in HTML format for a CompTIA Tech+ student. Use the following information:

Personal Information:
- Name: ${personalInfo.fullName}
- Email: ${personalInfo.email}
- Phone: ${personalInfo.phone}
- Address: ${personalInfo.address}
- LinkedIn: ${personalInfo.linkedin}

Work Experience:
${workExperience.map((exp: any) => `
- Position: ${exp.position} at ${exp.company}
- Duration: ${exp.startDate} to ${exp.isCurrentJob ? 'Present' : exp.endDate}
- Description: ${exp.description}
`).join('')}

Skills: ${skills.join(', ')}
Certifications: ${certifications.join(', ')}

Requirements:
1. Format as clean HTML with inline CSS
2. Use professional formatting with clear sections
3. Include ATS-friendly keywords for IT/tech positions
4. Optimize for applicant tracking systems
5. Maintain professional appearance suitable for government/corporate environments
6. Include relevant technical keywords based on CompTIA certification

Return only the formatted HTML resume.`;

      const resumeHTML = await ai.chat({
        system: "You are a professional resume writer specializing in IT careers and ATS optimization. Create clean, professional HTML resumes.",
        user: prompt,
        tier: "quality",
        maxTokens: 2000,
        temperature: 0.3,
      });

      // Generate ATS keywords and improvement suggestions
      const keywordPrompt = `Based on this resume content, provide:
1. A list of 10-15 ATS keywords that are included
2. 5 improvement suggestions for better ATS optimization

Resume: ${resumeHTML}

Format response as JSON: {"keywords": ["keyword1", "keyword2", ...], "suggestions": ["suggestion1", "suggestion2", ...]}`;

      const keywordContent = await ai.chat({
        system: "You are an ATS optimization expert. Analyze resumes and provide keyword and improvement feedback in JSON format.",
        user: keywordPrompt,
        tier: "fast",
        maxTokens: 500,
        temperature: 0.1,
      });

      let analysis;
      try {
        analysis = JSON.parse(keywordContent);
      } catch {
        analysis = {
          keywords: ["IT Support", "Technical Support", "CompTIA", "Troubleshooting", "Network Administration"],
          suggestions: ["Add more quantified achievements", "Include technical certifications", "Use action verbs", "Optimize for ATS scanning", "Add relevant keywords"]
        };
      }

      return {
        formattedResume: resumeHTML,
        atsKeywords: analysis.keywords || [],
        improvementSuggestions: analysis.suggestions || []
      };
    } catch (error) {
      console.error("Error generating resume:", error);
      throw new Error("Failed to generate resume");
    }
  }

  async generateResumePDF(resumeContent: string): Promise<string> {
    try {
      // For Replit environment, use built-in PDF generation
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      // Convert HTML to plain text for basic PDF generation
      const textContent = resumeContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Split text into lines that fit the PDF width
      const lines = pdf.splitTextToSize(textContent, 170);
      let y = 20;
      
      for (let i = 0; i < lines.length; i++) {
        if (y > 280) { // Add new page if needed
          pdf.addPage();
          y = 20;
        }
        pdf.text(lines[i], 20, y);
        y += 7;
      }
      
      // Return base64 encoded PDF
      return pdf.output('datauristring').split(',')[1];
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback: return a simple base64 encoded message
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      pdf.text("Resume generation temporarily unavailable. Please try again later.", 20, 20);
      return pdf.output('datauristring').split(',')[1];
    }
  }

  // Email and Automation Operations
  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const [newTemplate] = await db.insert(emailTemplates).values(template).returning();
    return newTemplate;
  }

  async getEmailTemplatesByType(type: string): Promise<EmailTemplate[]> {
    return await db.select().from(emailTemplates)
      .where(and(eq(emailTemplates.templateType, type), eq(emailTemplates.isActive, true)));
  }

  async getEmailTemplateByName(name: string): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.name, name));
    return template;
  }

  async logEmail(emailData: Partial<EmailLog>): Promise<EmailLog> {
    const [logEntry] = await db.insert(emailLog).values({
      userId: emailData.userId,
      recipientEmail: emailData.recipientEmail!,
      templateId: emailData.templateId,
      subject: emailData.subject!,
      status: emailData.status || 'pending',
      sentAt: emailData.sentAt,
      errorMessage: emailData.errorMessage,
    }).returning();
    return logEntry;
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.settingKey, key));
    return setting;
  }

  async setSystemSetting(setting: { settingKey: string; settingValue: string; description?: string }): Promise<SystemSetting> {
    const [newSetting] = await db.insert(systemSettings)
      .values(setting)
      .onConflictDoUpdate({
        target: systemSettings.settingKey,
        set: {
          settingValue: setting.settingValue,
          description: setting.description,
          updatedAt: new Date(),
        },
      })
      .returning();
    return newSetting;
  }

  async getInactiveUsers(thresholdDays: number): Promise<(User & { lastLoginAt?: Date })[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);
    
    // For now, we'll use createdAt as lastLoginAt since we don't have login tracking
    // In a real implementation, you'd have a lastLoginAt field
    return await db.select().from(users)
      .where(and(
        eq(users.createdAt, thresholdDate), // This would be lastLoginAt in real implementation
      )) as (User & { lastLoginAt?: Date })[];
  }

  async getUsersNearMilestones(): Promise<(User & { progressPercentage: number })[]> {
    // Calculate progress for each user
    const usersWithProgress = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      progressPercentage: count(userProgress.isCompleted),
    })
    .from(users)
    .leftJoin(userProgress, eq(users.id, userProgress.userId))
    .groupBy(users.id);

    // Convert to expected format - this is simplified
    return usersWithProgress.map(user => ({
      ...user,
      progressPercentage: Math.min(100, user.progressPercentage * 10), // Simplified calculation
    })) as (User & { progressPercentage: number })[];
  }

  async hasRecentMilestoneEmail(userId: string, milestone: number): Promise<boolean> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const [recentEmail] = await db.select().from(emailLog)
      .where(and(
        eq(emailLog.userId, userId),
        eq(emailLog.subject, `Great Progress! ${milestone}% Complete 🎉`),
        eq(emailLog.status, 'sent'),
      ));
    
    return !!recentEmail;
  }

  async hasCompletionEmail(userId: string): Promise<boolean> {
    const [completionEmail] = await db.select().from(emailLog)
      .where(and(
        eq(emailLog.userId, userId),
        eq(emailLog.status, 'sent'),
      ));
    
    return !!completionEmail && completionEmail.subject.includes('Congratulations! CompTIA Tech+ Training Complete!');
  }

  async hasWelcomeEmails(userId: string): Promise<boolean> {
    const [welcomeEmail] = await db.select().from(emailLog)
      .where(and(
        eq(emailLog.userId, userId),
        eq(emailLog.status, 'sent'),
      ));
    
    return !!welcomeEmail && welcomeEmail.subject.includes('Welcome to CompTIA Tech+');
  }

  async getNewUsersForWelcomeSequence(): Promise<User[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return await db.select().from(users).where(eq(users.createdAt, sevenDaysAgo));
  }

  // WIOA Reporting Operations
  async createWIOAReport(reportData: InsertWIOAReport): Promise<WIOAReport> {
    const [report] = await db.insert(wioaReports).values(reportData).returning();
    return report;
  }

  async getWIOAReports(): Promise<WIOAReport[]> {
    return await db.select().from(wioaReports).orderBy(desc(wioaReports.createdAt));
  }

  async updateWIOAReportSubmission(reportId: string, submittedTo: string, submittedBy: string): Promise<WIOAReport> {
    const [updatedReport] = await db.update(wioaReports)
      .set({
        submittedTo,
        submittedBy,
        submittedAt: new Date(),
      })
      .where(eq(wioaReports.id, reportId))
      .returning();
    return updatedReport;
  }

  async generateWIOACSVData(): Promise<any[]> {
    // Get comprehensive student data for WIOA reporting
    const studentData = await db.select({
      userId: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      enrollmentDate: enrollments.enrollmentDate,
      completionDate: enrollments.completionDate,
      wioaFunding: enrollments.wioaFunding,
      programCode: enrollments.programCode,
      caseWorkerName: enrollments.caseWorkerName,
      isActive: enrollments.isActive,
      totalStudyHours: sum(studySessions.duration),
      modulesCompleted: count(userProgress.isCompleted),
    })
    .from(users)
    .leftJoin(enrollments, eq(users.id, enrollments.userId))
    .leftJoin(studySessions, eq(users.id, studySessions.userId))
    .leftJoin(userProgress, and(eq(users.id, userProgress.userId), eq(userProgress.isCompleted, true)))
    .groupBy(users.id, enrollments.id);

    return studentData.map(student => ({
      'Student ID': student.userId,
      'First Name': student.firstName || '',
      'Last Name': student.lastName || '',
      'Email': student.email || '',
      'Enrollment Date': student.enrollmentDate ? new Date(student.enrollmentDate).toISOString().split('T')[0] : '',
      'Completion Date': student.completionDate ? new Date(student.completionDate).toISOString().split('T')[0] : '',
      'WIOA Funding': student.wioaFunding?.toString() || '0',
      'Program Code': student.programCode || '',
      'Case Worker': student.caseWorkerName || '',
      'Status': student.isActive ? 'Active' : 'Inactive',
      'Total Study Hours': Math.round(Number(student.totalStudyHours || 0) / 60 * 100) / 100, // Convert minutes to hours
      'Modules Completed': student.modulesCompleted || 0,
      'Report Generated': new Date().toISOString().split('T')[0],
    }));
  }

  // Bulk operations
  async bulkCreateUsers(users: UpsertUser[]): Promise<User[]> {
    const results: User[] = [];
    for (const userData of users) {
      try {
        const user = await this.upsertUser(userData);
        results.push(user);
      } catch (error) {
        console.error('Error creating user in bulk operation:', error);
        // Continue with other users even if one fails
      }
    }
    return results;
  }

  async bulkCreateEnrollments(enrollments: InsertEnrollment[]): Promise<Enrollment[]> {
    const results: Enrollment[] = [];
    for (const enrollmentData of enrollments) {
      try {
        const enrollment = await this.createEnrollment(enrollmentData);
        results.push(enrollment);
      } catch (error) {
        console.error('Error creating enrollment in bulk operation:', error);
        // Continue with other enrollments even if one fails
      }
    }
    return results;
  }
}

export const storage = new DatabaseStorage();

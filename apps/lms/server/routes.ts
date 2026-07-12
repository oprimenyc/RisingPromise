import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { requireAdmin, requireStaff } from "./rbac";
import { aiChatGuard, aiResumeGuard, getAiSpendStatus } from "./aiGuard";
import { emailService } from "./emailService";
import { automationService } from "./automationService";
import { paymentService } from "./paymentService";
import { bulkOperationsService } from "./bulkOperationsService";
import { errorHandler, notFoundHandler, asyncHandler } from "./errorHandler";
import { createObjectCsvWriter } from 'csv-writer';
import { insertEnrollmentSchema, insertProgressSchema, insertStudySessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Initialize automation services
  await automationService.initialize();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const metrics = await storage.getUserMetrics(userId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Courses routes
  app.get('/api/courses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courses = await storage.getUserCourses(userId);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:courseId', isAuthenticated, async (req: any, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.claims.sub;
      const course = await storage.getCourseWithProgress(courseId, userId);
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.get('/api/courses/:courseId/modules', isAuthenticated, async (req: any, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.claims.sub;
      const modules = await storage.getCourseModules(courseId, userId);
      res.json(modules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  // Enrollment routes
  app.post('/api/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const enrollmentData = insertEnrollmentSchema.parse({
        ...req.body,
        userId
      });
      const enrollment = await storage.createEnrollment(enrollmentData);
      res.status(201).json(enrollment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid enrollment data", errors: error.errors });
        return;
      }
      console.error("Error creating enrollment:", error);
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  app.get('/api/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const enrollments = await storage.getUserEnrollments(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Progress routes
  app.post('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progressData = insertProgressSchema.parse({
        ...req.body,
        userId
      });
      const progress = await storage.updateProgress(progressData);
      res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid progress data", errors: error.errors });
        return;
      }
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  app.get('/api/progress/:courseId', isAuthenticated, async (req: any, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.claims.sub;
      const progress = await storage.getCourseProgress(userId, courseId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Study sessions routes
  app.post('/api/study-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertStudySessionSchema.parse({
        ...req.body,
        userId
      });
      const session = await storage.createStudySession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid session data", errors: error.errors });
        return;
      }
      console.error("Error creating study session:", error);
      res.status(500).json({ message: "Failed to create study session" });
    }
  });

  // WIOA compliance routes
  app.get('/api/wioa/compliance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const compliance = await storage.getWIOACompliance(userId);
      res.json(compliance);
    } catch (error) {
      console.error("Error fetching WIOA compliance:", error);
      res.status(500).json({ message: "Failed to fetch WIOA compliance data" });
    }
  });

  // AI Chatbot endpoint
  app.post("/api/ai/chat", isAuthenticated, aiChatGuard, async (req: any, res) => {
    try {
      const { message } = req.body;
      const userId = req.user?.claims?.sub;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      const response = await storage.getChatbotResponse(message, userId);
      res.json({ response });
    } catch (error) {
      console.error("Error getting chatbot response:", error);
      res.status(500).json({ message: "Failed to get AI response" });
    }
  });

  // AI Resume Generation endpoint
  app.post("/api/ai/generate-resume", isAuthenticated, aiResumeGuard, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const resumeData = req.body;
      
      const generatedResume = await storage.generateResume(resumeData, userId);
      res.json(generatedResume);
    } catch (error) {
      console.error("Error generating resume:", error);
      res.status(500).json({ message: "Failed to generate resume" });
    }
  });

  // Resume PDF Download endpoint
  app.post("/api/ai/download-resume", isAuthenticated, async (req, res) => {
    try {
      const { resumeContent } = req.body;
      
      if (!resumeContent) {
        return res.status(400).json({ message: "Resume content is required" });
      }

      const pdfData = await storage.generateResumePDF(resumeContent);
      res.json({ pdfData });
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Enhanced WIOA Reporting Routes
  app.get('/api/wioa/reports', isAuthenticated, requireStaff, async (req: any, res) => {
    try {
      const reports = await storage.getWIOAReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching WIOA reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post('/api/wioa/generate-report', isAuthenticated, requireStaff, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { reportPeriod } = req.body;
      
      // Generate CSV data
      const csvData = await storage.generateWIOACSVData();
      
      // Create CSV file
      const csvFilePath = `/tmp/wioa-report-${Date.now()}.csv`;
      const csvWriter = createObjectCsvWriter({
        path: csvFilePath,
        header: Object.keys(csvData[0] || {}).map(key => ({ id: key, title: key }))
      });

      await csvWriter.writeRecords(csvData);
      
      // Create report record
      const report = await storage.createWIOAReport({
        reportPeriod: reportPeriod || `Q${Math.ceil(new Date().getMonth() / 3)}-${new Date().getFullYear()}`,
        totalStudents: csvData.length,
        activeStudents: csvData.filter(student => student.Status === 'Active').length,
        completedStudents: csvData.filter(student => student['Completion Date']).length,
        fundingTotal: csvData.reduce((sum, student) => sum + parseFloat(student['WIOA Funding'] || '0'), 0).toString(),
        csvFilePath,
      });
      
      res.json({ report, csvData });
    } catch (error) {
      console.error("Error generating WIOA report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  app.post('/api/wioa/submit-report', isAuthenticated, requireStaff, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { reportId, emailAddress } = req.body;
      
      if (!reportId || !emailAddress) {
        return res.status(400).json({ message: "Report ID and email address are required" });
      }
      
      // Get the report
      const reports = await storage.getWIOAReports();
      const report = reports.find(r => r.id === reportId);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      // Update submission info
      const updatedReport = await storage.updateWIOAReportSubmission(reportId, emailAddress, userId);
      
      // Send email with CSV attachment (simplified for demo)
      const emailSent = await emailService.sendEmail({
        to: emailAddress,
        subject: `WIOA Compliance Report - ${report.reportPeriod}`,
        html: `
          <h2>WIOA Compliance Report</h2>
          <p>Please find attached the WIOA compliance report for period: ${report.reportPeriod}</p>
          <ul>
            <li>Total Students: ${report.totalStudents}</li>
            <li>Active Students: ${report.activeStudents}</li>
            <li>Completed Students: ${report.completedStudents}</li>
            <li>Total Funding: $${report.fundingTotal}</li>
          </ul>
          <p>Report generated on: ${new Date(report.reportDate || new Date()).toLocaleDateString()}</p>
        `,
      });
      
      res.json({ 
        success: emailSent, 
        report: updatedReport,
        message: emailSent ? 'Report submitted successfully' : 'Report logged, but email sending failed'
      });
    } catch (error) {
      console.error("Error submitting WIOA report:", error);
      res.status(500).json({ message: "Failed to submit report" });
    }
  });

  // Email Template Management Routes
  app.get('/api/email/templates', isAuthenticated, requireStaff, async (req: any, res) => {
    try {
      const { type } = req.query;
      const templates = type 
        ? await storage.getEmailTemplatesByType(type as string)
        : await storage.getEmailTemplatesByType('welcome'); // Default to welcome templates
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Manual Email Triggers (for testing)
  app.post('/api/email/send-welcome', isAuthenticated, requireStaff, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.email) {
        return res.status(400).json({ message: "User email not found" });
      }
      
      await emailService.sendWelcomeSequence(user);
      res.json({ message: "Welcome sequence sent successfully" });
    } catch (error) {
      console.error("Error sending welcome email:", error);
      res.status(500).json({ message: "Failed to send welcome email" });
    }
  });

  // System Settings Management
  app.get('/api/system/settings', isAuthenticated, async (req: any, res) => {
    try {
      const { key } = req.query;
      if (key) {
        const setting = await storage.getSystemSetting(key as string);
        res.json(setting);
      } else {
        // For security, only return non-sensitive settings
        const publicSettings = [
          'PLATFORM_NAME',
          'INACTIVITY_THRESHOLD_DAYS'
        ];
        const settings: { [key: string]: string } = {};
        for (const settingKey of publicSettings) {
          const setting = await storage.getSystemSetting(settingKey);
          if (setting) {
            settings[settingKey] = setting.settingValue;
          }
        }
        res.json(settings);
      }
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Payment Routes
  // Card payment processing is NOT implemented (no Stripe integration exists in
  // this app). The previous handler SIMULATED a successful payment and granted
  // enrollment — removed per RP_RUNTIME_COMPLIANCE (no simulated production
  // behavior). Real payments land with the provider layer in M2.
  app.post('/api/payments/process', isAuthenticated, (_req, res) => {
    console.warn("[payments] /api/payments/process called but payments are not implemented");
    res.status(501).json({
      success: false,
      message: "Online payment is not yet available. Please contact Rising Promise to complete enrollment.",
    });
  });

  // WIOA enrollment creates a funder-paid enrollment record — staff-only.
  // Previously any student could self-enroll with arbitrary funding data.
  app.post('/api/payments/wioa-enrollment', isAuthenticated, requireStaff, async (req: any, res) => {
    try {
      const { courseId, caseWorkerName, programCode, fundingAmount, studentId } = req.body;
      // Staff enroll a named student; falls back to self only if explicitly intended
      const userId = studentId || req.user.claims.sub;
      
      if (!courseId || !caseWorkerName || !programCode) {
        return res.status(400).json({ message: "Course ID, case worker name, and program code are required" });
      }
      
      const result = await paymentService.processWIOAEnrollment(userId, courseId, {
        caseWorkerName,
        programCode,
        fundingAmount: fundingAmount || 8500
      });
      
      if (result.success) {
        res.json({ 
          success: true, 
          enrollmentId: result.enrollmentId,
          message: "WIOA enrollment processed successfully" 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: result.error || "WIOA enrollment failed" 
        });
      }
    } catch (error) {
      console.error("WIOA enrollment error:", error);
      res.status(500).json({ message: "Internal server error during WIOA enrollment" });
    }
  });

  app.get('/api/payments/verify-access/:courseId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { courseId } = req.params;
      
      const hasAccess = await paymentService.verifyAccess(userId, courseId);
      res.json({ hasAccess });
    } catch (error) {
      console.error("Access verification error:", error);
      res.status(500).json({ message: "Failed to verify course access" });
    }
  });

  // Bulk Operations Routes
  app.post('/api/admin/bulk-import', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { userData, csvContent } = req.body;
      let bulkData;
      
      if (csvContent) {
        // Parse CSV content
        bulkData = bulkOperationsService.parseCSVData(csvContent);
      } else if (userData && Array.isArray(userData)) {
        bulkData = userData;
      } else {
        return res.status(400).json({ message: "Either userData array or csvContent is required" });
      }
      
      if (bulkData.length === 0) {
        return res.status(400).json({ message: "No valid user data provided" });
      }
      
      const result = await bulkOperationsService.bulkImportAndEnroll(bulkData);
      
      res.json({
        success: result.success,
        summary: {
          total: bulkData.length,
          processed: result.processed,
          failed: result.failed
        },
        results: result.results,
        errors: result.errors
      });
    } catch (error) {
      console.error("Bulk import error:", error);
      res.status(500).json({ 
        message: "Bulk import failed", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.post('/api/admin/bulk-enroll', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { userIds, courseId, wioaData } = req.body;
      
      if (!userIds || !Array.isArray(userIds) || !courseId) {
        return res.status(400).json({ message: "User IDs array and course ID are required" });
      }
      
      const result = await bulkOperationsService.bulkEnrollUsers(userIds, courseId, wioaData);
      
      res.json({
        success: result.success,
        summary: {
          total: userIds.length,
          processed: result.processed,
          failed: result.failed
        },
        results: result.results,
        errors: result.errors
      });
    } catch (error) {
      console.error("Bulk enrollment error:", error);
      res.status(500).json({ 
        message: "Bulk enrollment failed", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Compliance Dashboard Data
  app.get('/api/admin/compliance-status', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const csvData = await storage.generateWIOACSVData();
      
      // Calculate compliance metrics
      const totalStudents = csvData.length;
      const activeStudents = csvData.filter(student => student.Status === 'Active').length;
      const completedStudents = csvData.filter(student => student['Completion Date']).length;
      const studentsWithMissingData = csvData.filter(student => 
        !student['Case Worker'] || !student['Program Code']
      ).length;
      
      const complianceScore = totalStudents > 0 
        ? Math.round(((totalStudents - studentsWithMissingData) / totalStudents) * 100)
        : 100;
      
      res.json({
        totalStudents,
        activeStudents,
        completedStudents,
        studentsWithMissingData,
        complianceScore,
        lastReportDate: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching compliance status:", error);
      res.status(500).json({ message: "Failed to fetch compliance status" });
    }
  });

  // Role management — admin only; the sole API path for role changes
  app.post('/api/admin/users/:userId/role', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      if (!['student', 'instructor', 'staff', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      const actor = req.user.claims.sub;
      if (userId === actor && role !== 'admin') {
        return res.status(400).json({ message: "You cannot remove your own admin role" });
      }
      const user = await storage.setUserRole(userId, role);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log(`[rbac] ${actor} set role=${role} for user=${userId}`);
      res.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
      console.error("Error setting user role:", error);
      res.status(500).json({ message: "Failed to set role" });
    }
  });

  // Observability: AI spend status (estimated) for staff — see aiGuard.ts
  app.get('/api/admin/ai-spend', isAuthenticated, requireStaff, (_req, res) => {
    res.json(getAiSpendStatus());
  });

  // Note: Error handling middleware will be added after Vite middleware in server/index.ts
  // This ensures frontend routes are served properly before falling back to 404

  const httpServer = createServer(app);
  return httpServer;
}

import { storage } from './storage';
import { paymentService } from './paymentService';
// Bulk operations service for admin management

export interface BulkUserData {
  email: string;
  firstName: string;
  lastName: string;
  courseId: string;
  wioaFunding?: string;
  caseWorkerName?: string;
  programCode?: string;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
  results: Array<{
    email: string;
    success: boolean;
    userId?: string;
    enrollmentId?: string;
    error?: string;
  }>;
}

/**
 * Service for handling bulk user operations including import and enrollment
 */
export class BulkOperationsService {
  
  /**
   * Bulk import users and enroll them in courses
   */
  async bulkImportAndEnroll(userData: BulkUserData[]): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [],
      results: []
    };

    console.log(`Starting bulk import for ${userData.length} users`);

    for (const user of userData) {
      try {
        // Validate required fields
        if (!user.email || !user.firstName || !user.courseId) {
          const error = `Missing required fields for user: ${user.email || 'unknown'}`;
          result.errors.push(error);
          result.results.push({
            email: user.email || 'unknown',
            success: false,
            error
          });
          result.failed++;
          continue;
        }

        // Create or update user
        const upsertedUser = await storage.upsertUser({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        });

        // Create WIOA enrollment
        const enrollmentResult = await paymentService.processWIOAEnrollment(
          upsertedUser.id,
          user.courseId,
          {
            caseWorkerName: user.caseWorkerName || 'System Import',
            programCode: user.programCode || 'WIOA-CT-2024',
            fundingAmount: parseFloat(user.wioaFunding || '8500')
          }
        );

        if (enrollmentResult.success) {
          result.results.push({
            email: user.email,
            success: true,
            userId: upsertedUser.id,
            enrollmentId: enrollmentResult.enrollmentId
          });
          result.processed++;
        } else {
          result.results.push({
            email: user.email,
            success: false,
            userId: upsertedUser.id,
            error: enrollmentResult.error
          });
          result.errors.push(`Enrollment failed for ${user.email}: ${enrollmentResult.error}`);
          result.failed++;
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Failed to process ${user.email}: ${errorMessage}`);
        result.results.push({
          email: user.email,
          success: false,
          error: errorMessage
        });
        result.failed++;
        console.error(`Bulk import error for ${user.email}:`, error);
      }
    }

    result.success = result.failed === 0;
    console.log(`Bulk import completed: ${result.processed} successful, ${result.failed} failed`);
    
    return result;
  }

  /**
   * Bulk enroll existing users in a course
   */
  async bulkEnrollUsers(userIds: string[], courseId: string, wioaData?: {
    caseWorkerName: string;
    programCode: string;
    fundingAmount: number;
  }): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [],
      results: []
    };

    console.log(`Starting bulk enrollment for ${userIds.length} users in course ${courseId}`);

    for (const userId of userIds) {
      try {
        const user = await storage.getUser(userId);
        if (!user) {
          const error = `User not found: ${userId}`;
          result.errors.push(error);
          result.results.push({
            email: 'unknown',
            success: false,
            error
          });
          result.failed++;
          continue;
        }

        // Without WIOA data this is an admin-granted enrollment: no payment is
        // simulated and no funding amount is claimed (wioaFunding stays 0 so
        // WIOA funding reports are not inflated by the schema default).
        const enrollmentResult = wioaData
          ? await paymentService.processWIOAEnrollment(userId, courseId, wioaData)
          : await (async (): Promise<{ success: boolean; enrollmentId?: string; error?: string }> => {
              try {
                const enrollment = await storage.createEnrollment({
                  userId,
                  courseId,
                  wioaFunding: '0.00',
                  isActive: true,
                });
                return { success: true, enrollmentId: enrollment.id };
              } catch (err) {
                console.error(`[bulk] admin-granted enrollment failed for ${userId}:`, err);
                return { success: false, error: 'Enrollment creation failed' };
              }
            })();

        if (enrollmentResult.success) {
          result.results.push({
            email: user.email || 'unknown',
            success: true,
            userId,
            enrollmentId: 'enrollmentId' in enrollmentResult ? enrollmentResult.enrollmentId : undefined
          });
          result.processed++;
        } else {
          result.results.push({
            email: user.email || 'unknown',
            success: false,
            userId,
            error: enrollmentResult.error
          });
          result.errors.push(`Enrollment failed for ${user.email}: ${enrollmentResult.error}`);
          result.failed++;
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Failed to enroll user ${userId}: ${errorMessage}`);
        result.results.push({
          email: 'unknown',
          success: false,
          error: errorMessage
        });
        result.failed++;
        console.error(`Bulk enrollment error for ${userId}:`, error);
      }
    }

    result.success = result.failed === 0;
    console.log(`Bulk enrollment completed: ${result.processed} successful, ${result.failed} failed`);
    
    return result;
  }

  /**
   * Parse CSV data for bulk import
   */
  parseCSVData(csvContent: string): BulkUserData[] {
    try {
      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must contain header row and at least one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const userData: BulkUserData[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const user: Partial<BulkUserData> = {};

        headers.forEach((header, index) => {
          const value = values[index] || '';
          switch (header) {
            case 'email':
              user.email = value;
              break;
            case 'firstname':
            case 'first_name':
              user.firstName = value;
              break;
            case 'lastname':
            case 'last_name':
              user.lastName = value;
              break;
            case 'courseid':
            case 'course_id':
              user.courseId = value;
              break;
            case 'wioafunding':
            case 'wioa_funding':
              user.wioaFunding = value;
              break;
            case 'caseworkername':
            case 'case_worker_name':
              user.caseWorkerName = value;
              break;
            case 'programcode':
            case 'program_code':
              user.programCode = value;
              break;
          }
        });

        if (user.email && user.firstName && user.courseId) {
          userData.push(user as BulkUserData);
        }
      }

      return userData;
    } catch (error) {
      console.error('CSV parsing error:', error);
      throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const bulkOperationsService = new BulkOperationsService();
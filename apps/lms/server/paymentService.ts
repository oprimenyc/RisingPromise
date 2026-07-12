import { storage } from './storage';

// Payment service. Card payments are NOT implemented — there is no payment
// processor integration in this app. The former processPayment() simulated a
// successful transaction and granted enrollment; that violated
// RP_RUNTIME_COMPLIANCE (no simulated production behavior) and was removed.
// Real payments arrive via the provider layer in milestone M2.
export class PaymentService {

  /** Capability status: NOT IMPLEMENTED. Always fails loudly. */
  async processPayment(_userId: string, _courseId: string, _amount: number): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    console.warn('[payments] processPayment invoked — payments are not implemented');
    return {
      success: false,
      error: 'Online payment is not yet available. Please contact Rising Promise to complete enrollment.',
    };
  }

  /**
   * Verify payment status and course access
   */
  async verifyAccess(userId: string, courseId: string): Promise<boolean> {
    try {
      const enrollments = await storage.getUserEnrollments(userId);
      return enrollments.some(enrollment => 
        enrollment.courseId === courseId && enrollment.isActive
      );
    } catch (error) {
      console.error('Access verification error:', error);
      return false;
    }
  }

  /**
   * Process WIOA funding enrollment
   */
  async processWIOAEnrollment(userId: string, courseId: string, wioaData: {
    caseWorkerName: string;
    programCode: string;
    fundingAmount: number;
  }): Promise<{ success: boolean; enrollmentId?: string; error?: string }> {
    try {
      const enrollment = await storage.createEnrollment({
        userId,
        courseId,
        wioaFunding: wioaData.fundingAmount.toString(),
        caseWorkerName: wioaData.caseWorkerName,
        programCode: wioaData.programCode,
        isActive: true
      });

      console.log(`WIOA enrollment processed for user ${userId}, course ${courseId}`);
      
      return { 
        success: true, 
        enrollmentId: enrollment.id 
      };
    } catch (error) {
      console.error('WIOA enrollment error:', error);
      return { 
        success: false, 
        error: 'WIOA enrollment failed. Please verify funding eligibility.' 
      };
    }
  }
}

export const paymentService = new PaymentService();
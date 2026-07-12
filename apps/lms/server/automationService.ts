import cron from 'node-cron';
import { storage } from './storage';
import { emailService } from './emailService';

export class AutomationService {
  public isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('Initializing automation services...');

    // Setup email templates if they don't exist
    await this.setupDefaultEmailTemplates();

    // Setup default system settings
    await this.setupDefaultSettings();

    // Schedule automated tasks
    this.scheduleAutomatedTasks();

    this.isInitialized = true;
    console.log('Automation services initialized successfully');
  }

  private async setupDefaultEmailTemplates(): Promise<void> {
    const templates = [
      {
        name: 'welcome_day1',
        subject: 'Welcome to CompTIA Tech+ Training - Getting Started',
        templateType: 'welcome',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #dc2626 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Welcome to CompTIA Tech+ Training!</h1>
            </div>
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1e40af;">Hello {{firstName}}!</h2>
              <p>Welcome to the WIOA-compliant CompTIA Tech+ certification program. We're excited to have you join us on this journey to advance your IT career.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h3 style="margin-top: 0; color: #dc2626;">Your Next Steps:</h3>
                <ul>
                  <li>Log into your student dashboard</li>
                  <li>Complete your profile information</li>
                  <li>Review the course overview and study plan</li>
                  <li>Start with Module 1: IT Concepts and Terminology</li>
                </ul>
              </div>
              
              <p>Your training is funded through the WIOA program, ensuring you receive high-quality education at no cost to you. We're here to support your success every step of the way.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.PLATFORM_URL || 'https://your-domain.replit.app'}" 
                   style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Access Your Dashboard
                </a>
              </div>
              
              <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
              <p>Best regards,<br>The WIOA Tech+ Training Team</p>
            </div>
          </div>
        `,
        textContent: 'Welcome to CompTIA Tech+ Training! Log into your dashboard to get started with your certification journey.',
      },
      {
        name: 'welcome_day3',
        subject: 'CompTIA Tech+ Tips for Success - Day 3',
        templateType: 'welcome',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Tips for Success</h1>
            </div>
            <div style="padding: 30px; background: #f8fafc;">
              <h2>Hi {{firstName}},</h2>
              <p>How are you finding the CompTIA Tech+ training so far? Here are some proven tips to maximize your success:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e40af;">Study Strategies:</h3>
                <ul>
                  <li><strong>Set a Schedule:</strong> Dedicate 1-2 hours daily for consistent progress</li>
                  <li><strong>Take Notes:</strong> Write down key concepts and practice questions</li>
                  <li><strong>Use the AI Assistant:</strong> Ask questions about topics you find challenging</li>
                  <li><strong>Practice Labs:</strong> Hands-on experience reinforces theoretical knowledge</li>
                </ul>
              </div>
              
              <p>Remember, our AI-powered study assistant is available 24/7 to help answer your questions and provide additional explanations.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.PLATFORM_URL || 'https://your-domain.replit.app'}" 
                   style="background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
                  Continue Learning
                </a>
              </div>
            </div>
          </div>
        `,
      },
      {
        name: 'progress_25',
        subject: 'Great Progress! 25% Complete 🎉',
        templateType: 'progress',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #059669 0%, #1e40af 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0;">Congratulations {{firstName}}!</h1>
              <h2 style="margin: 10px 0 0 0;">You're 25% Complete!</h2>
            </div>
            <div style="padding: 30px; background: #f8fafc;">
              <p>Excellent work! You've completed a quarter of your CompTIA Tech+ training. Your dedication is paying off!</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <div style="background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden;">
                  <div style="background: linear-gradient(90deg, #059669, #1e40af); height: 100%; width: 25%; border-radius: 10px;"></div>
                </div>
                <p style="margin: 10px 0 0 0; font-weight: bold; color: #059669;">25% Progress</p>
              </div>
              
              <p>Keep up the momentum! The next modules will build on what you've learned and introduce more advanced concepts.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.PLATFORM_URL || 'https://your-domain.replit.app'}" 
                   style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
                  Continue Your Journey
                </a>
              </div>
            </div>
          </div>
        `,
      },
      {
        name: 'completion_celebration',
        subject: 'Congratulations! CompTIA Tech+ Training Complete! 🎓',
        templateType: 'completion',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #1e40af 100%); color: white; padding: 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px;">🎓 CONGRATULATIONS! 🎓</h1>
              <h2 style="margin: 10px 0;">{{firstName}}, You Did It!</h2>
            </div>
            <div style="padding: 30px; background: #f8fafc;">
              <p style="font-size: 18px; text-align: center; color: #dc2626; font-weight: bold;">
                You have successfully completed the CompTIA Tech+ Training Program!
              </p>
              
              <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #059669;">
                <h3 style="color: #059669; text-align: center; margin-top: 0;">Your Achievement Summary:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li style="padding: 5px 0;">✓ Completed all {{courseName}} modules</li>
                  <li style="padding: 5px 0;">✓ Mastered IT fundamentals and concepts</li>
                  <li style="padding: 5px 0;">✓ Gained hands-on technical experience</li>
                  <li style="padding: 5px 0;">✓ Ready for CompTIA Tech+ certification exam</li>
                </ul>
              </div>
              
              <p>Your dedication and hard work have prepared you for the next step in your IT career. You now have the foundational knowledge needed to pursue the official CompTIA Tech+ certification.</p>
              
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h4 style="margin-top: 0; color: #92400e;">Next Steps:</h4>
                <ul>
                  <li>Schedule your CompTIA Tech+ (FC0-U71) certification exam</li>
                  <li>Use our AI-powered resume builder to update your professional profile</li>
                  <li>Apply your new skills in real-world scenarios</li>
                  <li>Consider advancing to more specialized CompTIA certifications</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.PLATFORM_URL || 'https://your-domain.replit.app'}/resume-builder" 
                   style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 10px;">
                  Build Your Resume
                </a>
              </div>
              
              <p style="text-align: center; font-style: italic;">
                "Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill
              </p>
              
              <p>Congratulations once again, and best of luck in your IT career!</p>
              <p>The WIOA Tech+ Training Team</p>
            </div>
          </div>
        `,
      },
      {
        name: 'inactivity_alert',
        subject: 'Student Inactivity Alert - {{firstName}} {{lastName}}',
        templateType: 'inactivity',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #dc2626; color: white; padding: 20px;">
              <h1 style="margin: 0;">⚠️ Student Inactivity Alert</h1>
            </div>
            <div style="padding: 30px; background: #f8fafc;">
              <h2>Administrator Notification</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
                <h3 style="margin-top: 0; color: #dc2626;">Student Details:</h3>
                <ul>
                  <li><strong>Name:</strong> {{firstName}} {{lastName}}</li>
                  <li><strong>Email:</strong> {{email}}</li>
                  <li><strong>Days Since Last Login:</strong> {{daysSinceLastLogin}}</li>
                </ul>
              </div>
              
              <p>This student has not logged into the platform for {{daysSinceLastLogin}} days. Consider reaching out to check on their progress and offer support.</p>
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0;">Recommended Actions:</h4>
                <ul>
                  <li>Send a personal check-in email</li>
                  <li>Schedule a phone call or video conference</li>
                  <li>Review their progress and identify any barriers</li>
                  <li>Provide additional support resources if needed</li>
                </ul>
              </div>
            </div>
          </div>
        `,
      }
    ];

    for (const template of templates) {
      const existing = await storage.getEmailTemplateByName(template.name);
      if (!existing) {
        await storage.createEmailTemplate(template);
        console.log(`Created email template: ${template.name}`);
      }
    }
  }

  private async setupDefaultSettings(): Promise<void> {
    const defaultSettings = [
      {
        settingKey: 'WIOA_REPORT_EMAIL',
        settingValue: 'fl.wioa.reports@yourdomain.com',
        description: 'Email address for WIOA report submissions',
      },
      {
        settingKey: 'ADMIN_EMAIL',
        settingValue: 'admin@yourdomain.com',
        description: 'Admin email for inactivity alerts and system notifications',
      },
      {
        settingKey: 'INACTIVITY_THRESHOLD_DAYS',
        settingValue: '7',
        description: 'Number of days before sending inactivity alert',
      },
      {
        settingKey: 'PLATFORM_NAME',
        settingValue: 'WIOA CompTIA Tech+ Training Platform',
        description: 'Platform name for email templates',
      }
    ];

    for (const setting of defaultSettings) {
      const existing = await storage.getSystemSetting(setting.settingKey);
      if (!existing) {
        await storage.setSystemSetting(setting);
        console.log(`Created system setting: ${setting.settingKey}`);
      }
    }
  }

  private scheduleAutomatedTasks(): void {
    // Check for inactivity every day at 9 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('Running daily inactivity check...');
      await this.checkForInactiveStudents();
    });

    // Check for progress milestones every hour
    cron.schedule('0 * * * *', async () => {
      console.log('Checking for progress milestones...');
      await this.checkProgressMilestones();
    });

    // Send welcome sequence emails (check every 30 minutes)
    cron.schedule('*/30 * * * *', async () => {
      await this.processWelcomeSequence();
    });

    console.log('Scheduled automated tasks successfully');
  }

  private async checkForInactiveStudents(): Promise<void> {
    try {
      const thresholdSetting = await storage.getSystemSetting('INACTIVITY_THRESHOLD_DAYS');
      const adminEmailSetting = await storage.getSystemSetting('ADMIN_EMAIL');
      
      const thresholdDays = parseInt(thresholdSetting?.settingValue || '7');
      const adminEmail = adminEmailSetting?.settingValue || 'admin@yourdomain.com';

      const inactiveUsers = await storage.getInactiveUsers(thresholdDays);
      
      for (const user of inactiveUsers) {
        if (user.email) {
          const lastLoginDate = user.lastLoginAt ? new Date(user.lastLoginAt) : new Date(user.createdAt || Date.now());
          const daysSinceLastLogin = Math.floor(
            (Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          await emailService.sendInactivityAlert(adminEmail, user, daysSinceLastLogin);
          console.log(`Sent inactivity alert for user: ${user.email}`);
        }
      }
    } catch (error) {
      console.error('Error checking for inactive students:', error);
    }
  }

  private async checkProgressMilestones(): Promise<void> {
    try {
      const users = await storage.getUsersNearMilestones();
      
      for (const user of users) {
        const progressPercentage = user.progressPercentage;
        
        // Check if we should send milestone emails
        if ([25, 50, 75].includes(progressPercentage)) {
          const hasRecentMilestoneEmail = await storage.hasRecentMilestoneEmail(
            user.id, 
            progressPercentage
          );
          
          if (!hasRecentMilestoneEmail) {
            await emailService.sendProgressMilestone(user, progressPercentage);
            console.log(`Sent ${progressPercentage}% milestone email to: ${user.email}`);
          }
        }
        
        // Check for completion
        if (progressPercentage >= 100) {
          const hasCompletionEmail = await storage.hasCompletionEmail(user.id);
          if (!hasCompletionEmail) {
            const courseName = 'CompTIA Tech+ Foundation';
            await emailService.sendCompletionCelebration(user, courseName);
            console.log(`Sent completion email to: ${user.email}`);
          }
        }
      }
    } catch (error) {
      console.error('Error checking progress milestones:', error);
    }
  }

  private async processWelcomeSequence(): Promise<void> {
    try {
      // Find users who registered in the last 7 days but haven't received welcome emails
      const newUsers = await storage.getNewUsersForWelcomeSequence();
      
      for (const user of newUsers) {
        if (user.email) {
          const hasWelcomeEmails = await storage.hasWelcomeEmails(user.id);
          if (!hasWelcomeEmails) {
            await emailService.sendWelcomeSequence(user);
            console.log(`Sent welcome sequence to: ${user.email}`);
          }
        }
      }
    } catch (error) {
      console.error('Error processing welcome sequence:', error);
    }
  }
}

export const automationService = new AutomationService();
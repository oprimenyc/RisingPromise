import sgMail from '@sendgrid/mail';
import { storage } from './storage';
import type { EmailTemplate, User, EmailLog } from '@shared/schema';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailData {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private defaultFrom = process.env.DEFAULT_FROM_EMAIL || 'noreply@wioatech.training';

  async sendEmail(emailData: EmailData, userId?: string, templateId?: string): Promise<boolean> {
    try {
      const msg = {
        to: emailData.to,
        from: emailData.from || this.defaultFrom,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text || this.stripHtml(emailData.html),
      };

      if (process.env.SENDGRID_API_KEY) {
        await sgMail.send(msg);
        console.log(`Email sent successfully to ${emailData.to}`);
      } else {
        console.log(`Email would be sent to ${emailData.to}: ${emailData.subject}`);
        console.log('HTML:', emailData.html);
      }

      // Log email in database
      await storage.logEmail({
        userId,
        recipientEmail: emailData.to,
        templateId,
        subject: emailData.subject,
        status: 'sent',
        sentAt: new Date(),
      });

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Log failed email in database
      await storage.logEmail({
        userId,
        recipientEmail: emailData.to,
        templateId,
        subject: emailData.subject,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      return false;
    }
  }

  async sendWelcomeSequence(user: User): Promise<void> {
    const templates = await storage.getEmailTemplatesByType('welcome');
    
    for (const template of templates) {
      if (!template.isActive) continue;

      const personalizedContent = this.personalizeTemplate(template, user);
      
      await this.sendEmail({
        to: user.email!,
        subject: personalizedContent.subject,
        html: personalizedContent.html,
        text: personalizedContent.text,
      }, user.id, template.id);

      // Add delay between emails (for sequential sending)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async sendProgressMilestone(user: User, progressPercentage: number): Promise<void> {
    const template = await storage.getEmailTemplateByName(`progress_${progressPercentage}`);
    if (!template || !template.isActive) return;

    const personalizedContent = this.personalizeTemplate(template, user, {
      progressPercentage: progressPercentage.toString(),
    });

    await this.sendEmail({
      to: user.email!,
      subject: personalizedContent.subject,
      html: personalizedContent.html,
      text: personalizedContent.text,
    }, user.id, template.id);
  }

  async sendCompletionCelebration(user: User, courseName: string): Promise<void> {
    const template = await storage.getEmailTemplateByName('completion_celebration');
    if (!template || !template.isActive) return;

    const personalizedContent = this.personalizeTemplate(template, user, {
      courseName,
    });

    await this.sendEmail({
      to: user.email!,
      subject: personalizedContent.subject,
      html: personalizedContent.html,
      text: personalizedContent.text,
    }, user.id, template.id);
  }

  async sendInactivityAlert(adminEmail: string, user: User, daysSinceLastLogin: number): Promise<void> {
    const template = await storage.getEmailTemplateByName('inactivity_alert');
    if (!template || !template.isActive) return;

    const personalizedContent = this.personalizeTemplate(template, user, {
      daysSinceLastLogin: daysSinceLastLogin.toString(),
      adminEmail,
    });

    await this.sendEmail({
      to: adminEmail,
      subject: personalizedContent.subject,
      html: personalizedContent.html,
      text: personalizedContent.text,
    }, user.id, template.id);
  }

  private personalizeTemplate(
    template: EmailTemplate, 
    user: User, 
    additionalData: Record<string, string> = {}
  ): { subject: string; html: string; text: string | undefined } {
    const data = {
      firstName: user.firstName || 'Student',
      lastName: user.lastName || '',
      fullName: `${user.firstName || 'Student'} ${user.lastName || ''}`.trim(),
      email: user.email || '',
      ...additionalData,
    };

    let subject = template.subject;
    let html = template.htmlContent;
    let text = template.textContent;

    // Replace placeholders
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      html = html.replace(new RegExp(placeholder, 'g'), value);
      if (text) {
        text = text.replace(new RegExp(placeholder, 'g'), value);
      }
    });

    return { subject, html, text: text ?? undefined };
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

export const emailService = new EmailService();
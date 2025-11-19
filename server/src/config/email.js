import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create email transporter
const createTransporter = () => {
  // For development, use Gmail SMTP or a service like Mailtrap
  // For production, use SendGrid, AWS SES, or similar
  
  if (process.env.NODE_ENV === 'production') {
    // Production email service (SendGrid example)
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else {
    // Development email service (Gmail example)
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass) {
      console.error('⚠️  EMAIL_USER or EMAIL_PASS not configured in .env file');
      console.error('Email sending will fail until credentials are configured');
    }
    
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass // Use App Password for Gmail
      }
    });
  }
};

// Load and compile email templates
const loadTemplate = (templateName) => {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', 'emails', `${templateName}.hbs`);
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    return handlebars.compile(templateSource);
  } catch (error) {
    console.error(`Error loading email template ${templateName}:`, error);
    return null;
  }
};

// Email templates
const templates = {
  welcome: loadTemplate('welcome'),
  verification: loadTemplate('verification'),
  passwordReset: loadTemplate('password-reset'),
  courseEnrollment: loadTemplate('course-enrollment')
};

// Email service class
class EmailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    if (!this.transporter) {
      this.transporter = createTransporter();
    }
    return this.transporter;
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@uplift.com',
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };

      const transporter = this.getTransporter();
      const result = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(userEmail, userName) {
    if (!templates.welcome) {
      throw new Error('Welcome email template not found');
    }

    const html = templates.welcome({
      userName,
      loginUrl: `${process.env.FRONTEND_URL}/auth`,
      supportEmail: process.env.EMAIL_FROM || 'support@uplift.com'
    });

    return this.sendEmail(
      userEmail,
      'Welcome to Uplift - Your Community Platform',
      html
    );
  }

  async sendVerificationEmail(userEmail, userName, verificationToken) {
    if (!templates.verification) {
      throw new Error('Verification email template not found');
    }

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const html = templates.verification({
      userName,
      verificationUrl,
      supportEmail: process.env.EMAIL_FROM || 'support@uplift.com'
    });

    return this.sendEmail(
      userEmail,
      'Verify Your Email Address - Uplift',
      html
    );
  }

  async sendPasswordResetEmail(userEmail, userName, resetToken) {
    if (!templates.passwordReset) {
      throw new Error('Password reset email template not found');
    }

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = templates.passwordReset({
      userName,
      resetUrl,
      supportEmail: process.env.EMAIL_FROM || 'support@uplift.com'
    });

    return this.sendEmail(
      userEmail,
      'Reset Your Password - Uplift',
      html
    );
  }

  async sendCourseEnrollmentEmail(userEmail, userName, courseName, instructorName) {
    if (!templates.courseEnrollment) {
      throw new Error('Course enrollment email template not found');
    }

    const html = templates.courseEnrollment({
      userName,
      courseName,
      instructorName,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      supportEmail: process.env.EMAIL_FROM || 'support@uplift.com'
    });

    return this.sendEmail(
      userEmail,
      `Welcome to ${courseName} - Course Enrollment Confirmation`,
      html
    );
  }

  async sendNotificationEmail(userEmail, userName, subject, message, actionUrl = null) {
    // Generic notification email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Hello ${userName},</h2>
        <p style="color: #666; line-height: 1.6;">${message}</p>
        ${actionUrl ? `<p><a href="${actionUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Take Action</a></p>` : ''}
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
          This email was sent from Uplift Community Platform.<br>
          If you have any questions, contact us at ${process.env.EMAIL_FROM || 'support@uplift.com'}
        </p>
      </div>
    `;

    return this.sendEmail(userEmail, subject, html);
  }
}

// Create and export singleton instance
export default new EmailService();
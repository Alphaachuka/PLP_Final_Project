import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import emailService from '../config/email.js';
import User from '../models/User.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Send test email (admin only)
router.post('/test', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { to, type = 'welcome' } = req.body;
    
    if (!to) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    let result;
    switch (type) {
      case 'welcome':
        result = await emailService.sendWelcomeEmail(to, 'Test User');
        break;
      case 'verification':
        result = await emailService.sendVerificationEmail(to, 'Test User', 'test-token');
        break;
      case 'password-reset':
        result = await emailService.sendPasswordResetEmail(to, 'Test User', 'test-token');
        break;
      case 'course-enrollment':
        result = await emailService.sendCourseEnrollmentEmail(to, 'Test User', 'Test Course', 'Test Instructor');
        break;
      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }

    res.json({ 
      message: 'Test email sent successfully',
      messageId: result.messageId 
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Request password reset
router.post('/password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send password reset email
    await emailService.sendPasswordResetEmail(
      user.email, 
      user.email, // Using email as name since we don't have fullName in User model
      resetToken
    );

    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset password with token
router.post('/password-reset/confirm', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset confirm error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Send welcome email (internal use)
router.post('/welcome', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await emailService.sendWelcomeEmail(user.email, user.email);
    
    res.json({ message: 'Welcome email sent successfully' });
  } catch (error) {
    console.error('Welcome email error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send course enrollment confirmation
router.post('/course-enrollment', authenticate, async (req, res) => {
  try {
    const { courseId, courseName, instructorName } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await emailService.sendCourseEnrollmentEmail(
      user.email, 
      user.email, 
      courseName, 
      instructorName
    );
    
    res.json({ message: 'Course enrollment email sent successfully' });
  } catch (error) {
    console.error('Course enrollment email error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send custom notification email (admin only)
router.post('/notification', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { to, subject, message, actionUrl } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({ error: 'Recipient, subject, and message are required' });
    }

    await emailService.sendNotificationEmail(to, 'User', subject, message, actionUrl);
    
    res.json({ message: 'Notification email sent successfully' });
  } catch (error) {
    console.error('Notification email error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
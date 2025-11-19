import Notification from '../models/Notification.js';
import { emitToUser } from '../config/socket.js';

/**
 * Create a notification and emit it in real-time
 */
export const createNotification = async ({
  userId,
  title,
  message,
  type = 'info',
  referenceType = null,
  referenceId = null
}) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      referenceType,
      referenceId
    });
    
    await notification.save();
    
    // Emit real-time notification
    try {
      emitToUser(userId, 'notification:new', notification);
    } catch (socketError) {
      console.log('Socket.io not available or user not connected');
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Notification types for different events
 */
export const NotificationTypes = {
  JOB_APPLICATION: 'job_application',
  JOB_STATUS_UPDATE: 'job_status_update',
  COURSE_ENROLLMENT: 'course_enrollment',
  COURSE_UPDATE: 'course_update',
  NEW_RATING: 'new_rating',
  WALLET_TRANSACTION: 'wallet_transaction',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
  MESSAGE: 'message'
};

export default { createNotification, NotificationTypes };

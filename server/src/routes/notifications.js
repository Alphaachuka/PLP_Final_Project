import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Notification from '../models/Notification.js';
import { emitToUser } from '../config/socket.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/read-all', authenticate, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, read: false },
      { read: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create notification (for testing and system use)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, message, type, referenceType, referenceId, userId } = req.body;
    
    const notification = new Notification({
      userId: userId || req.userId,
      title,
      message,
      type,
      referenceType,
      referenceId
    });
    
    await notification.save();
    
    // Emit real-time notification to user
    try {
      emitToUser(notification.userId, 'notification:new', notification);
    } catch (socketError) {
      console.log('Socket.io not available or user not connected');
    }
    
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

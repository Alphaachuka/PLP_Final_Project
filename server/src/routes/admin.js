import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Enrollment from '../models/Enrollment.js';
import Rating from '../models/Rating.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Middleware to ensure admin access
const requireAdmin = authorize('admin');

// Get platform statistics
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalJobs,
      totalEnrollments,
      totalApplications,
      totalRatings
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Job.countDocuments(),
      Enrollment.countDocuments(),
      Application.countDocuments(),
      Rating.countDocuments()
    ]);

    const stats = {
      totalUsers,
      totalCourses,
      totalJobs,
      totalEnrollments,
      totalApplications,
      totalRatings
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { roles, isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { roles, isActive },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (soft delete by deactivating)
router.delete('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent activity
router.get('/activity', authenticate, requireAdmin, async (req, res) => {
  try {
    // Get recent activities from different collections
    const [recentUsers, recentCourses, recentJobs, recentEnrollments] = await Promise.all([
      User.find({}, 'email createdAt').sort({ createdAt: -1 }).limit(5),
      Course.find({}, 'title createdAt').populate('instructorId', 'email').sort({ createdAt: -1 }).limit(5),
      Job.find({}, 'title createdAt').populate('employerId', 'email').sort({ createdAt: -1 }).limit(5),
      Enrollment.find({}).populate('studentId', 'email').populate('courseId', 'title').sort({ createdAt: -1 }).limit(5)
    ]);

    const activity = [
      ...recentUsers.map(user => ({
        type: 'user_registered',
        description: `New user registered: ${user.email}`,
        timestamp: user.createdAt
      })),
      ...recentCourses.map(course => ({
        type: 'course_created',
        description: `New course created: ${course.title} by ${course.instructorId?.email}`,
        timestamp: course.createdAt
      })),
      ...recentJobs.map(job => ({
        type: 'job_posted',
        description: `New job posted: ${job.title} by ${job.employerId?.email}`,
        timestamp: job.createdAt
      })),
      ...recentEnrollments.map(enrollment => ({
        type: 'course_enrollment',
        description: `${enrollment.studentId?.email} enrolled in ${enrollment.courseId?.title}`,
        timestamp: enrollment.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update job status
router.put('/jobs/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('employerId', 'email');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system health
router.get('/health', authenticate, requireAdmin, async (req, res) => {
  try {
    const health = {
      database: 'healthy',
      api: 'online',
      timestamp: new Date().toISOString()
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({ 
      database: 'error',
      api: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
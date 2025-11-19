import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { createNotification } from '../utils/notificationHelper.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const applications = await Application.find({ workerId: req.userId })
      .populate('jobId')
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all applications for employer's jobs
router.get('/employer', authenticate, async (req, res) => {
  try {
    // First get all jobs for this employer
    const employerJobs = await Job.find({ employerId: req.userId });
    const jobIds = employerJobs.map(job => job._id);

    if (jobIds.length === 0) {
      return res.json([]);
    }

    // Get all applications for these jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title paymentAmount status')
      .populate('workerId', '_id email')
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/job/:jobId', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (job.employerId.toString() !== req.userId.toString() && !req.user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('jobId', 'title paymentAmount status')
      .populate('workerId', '_id email')
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { jobId, message } = req.body;

    const existing = await Application.findOne({
      jobId,
      workerId: req.userId
    });

    if (existing) {
      return res.status(400).json({ error: 'Already applied' });
    }

    // Get job details to notify employer
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const application = new Application({
      jobId,
      workerId: req.userId,
      message
    });
    await application.save();
    
    // Notify employer about new application
    await createNotification({
      userId: job.employerId,
      title: '📋 New Job Application',
      message: `Someone applied for your job: "${job.title}"`,
      type: 'info',
      referenceType: 'application',
      referenceId: application._id
    });
    
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('jobId');
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const isEmployer = application.jobId.employerId.toString() === req.userId.toString();
    const isWorker = application.workerId.toString() === req.userId.toString();
    
    if (!isEmployer && !isWorker && !req.user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const oldStatus = application.status;
    const newStatus = req.body.status;
    
    application.status = newStatus;
    await application.save();
    
    // Create notification for worker when status changes
    if (oldStatus !== newStatus && isEmployer) {
      let notificationTitle = '';
      let notificationMessage = '';
      let notificationType = 'info';
      
      if (newStatus === 'accepted') {
        notificationTitle = '🎉 Application Accepted!';
        notificationMessage = `Your application for "${application.jobId.title}" has been accepted!`;
        notificationType = 'success';
      } else if (newStatus === 'rejected') {
        notificationTitle = 'Application Update';
        notificationMessage = `Your application for "${application.jobId.title}" status has been updated.`;
        notificationType = 'info';
      } else if (newStatus === 'completed') {
        notificationTitle = '✅ Job Completed';
        notificationMessage = `The job "${application.jobId.title}" has been marked as completed!`;
        notificationType = 'success';
      }
      
      if (notificationTitle) {
        await createNotification({
          userId: application.workerId,
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
          referenceType: 'application',
          referenceId: application._id
        });
      }
    }
    
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

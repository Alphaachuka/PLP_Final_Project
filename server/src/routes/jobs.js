import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Job from '../models/Job.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    else filter.status = 'open';

    const jobs = await Job.find(filter)
      .populate('employerId', 'email')
      .sort({ createdAt: -1 });
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employerId', 'email');
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, authorize('employer', 'admin'), async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      employerId: req.userId
    });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (job.employerId.toString() !== req.userId.toString() && !req.user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(job, req.body);
    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (job.employerId.toString() !== req.userId.toString() && !req.user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

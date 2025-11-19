import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Rating from '../models/Rating.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

const router = express.Router();

// Get ratings for a worker
router.get('/worker/:workerId', async (req, res) => {
  try {
    const ratings = await Rating.find({ workerId: req.params.workerId })
      .populate('employerId', 'email')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });
    
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ratings by an employer
router.get('/employer', authenticate, async (req, res) => {
  try {
    const ratings = await Rating.find({ employerId: req.userId })
      .populate('workerId', 'email')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });
    
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new rating (employers only, for completed jobs)
router.post('/', authenticate, async (req, res) => {
  try {
    const { workerId, jobId, rating, review } = req.body;

    // Verify the job exists and belongs to the employer
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.employerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to rate this job' });
    }

    // Verify the job is completed
    if (job.status !== 'completed') {
      return res.status(400).json({ error: 'Can only rate completed jobs' });
    }

    // Verify there's an accepted application for this worker
    const application = await Application.findOne({
      jobId,
      workerId,
      status: 'accepted'
    });

    if (!application) {
      return res.status(400).json({ error: 'Worker must have an accepted application for this job' });
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      jobId,
      workerId,
      employerId: req.userId
    });

    if (existingRating) {
      return res.status(400).json({ error: 'Rating already exists for this job' });
    }

    // Create the rating
    const newRating = new Rating({
      workerId,
      employerId: req.userId,
      jobId,
      rating,
      review
    });

    await newRating.save();
    
    // Populate the response
    await newRating.populate('workerId', 'email');
    await newRating.populate('jobId', 'title');

    res.status(201).json(newRating);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a rating (employer who created it)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    
    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    if (rating.employerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this rating' });
    }

    const { rating: newRating, review } = req.body;
    
    rating.rating = newRating;
    rating.review = review;
    
    await rating.save();
    await rating.populate('workerId', 'email');
    await rating.populate('jobId', 'title');

    res.json(rating);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a rating (employer who created it)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    
    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    if (rating.employerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this rating' });
    }

    await Rating.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
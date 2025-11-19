import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Profile from '../models/Profile.js';
import WorkExperience from '../models/WorkExperience.js';
import WorkerSkill from '../models/WorkerSkill.js';
import Rating from '../models/Rating.js';

const router = express.Router();

router.get('/me', authenticate, async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.userId });
    
    // If no profile exists, create a basic one
    if (!profile) {
      profile = new Profile({
        userId: req.userId,
        fullName: req.user.email || 'User',
        profileComplete: false
      });
      await profile.save();
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.id });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const experience = await WorkExperience.find({ workerId: req.params.id });
    const skills = await WorkerSkill.find({ workerId: req.params.id });
    const ratings = await Rating.find({ workerId: req.params.id });
    
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    res.json({
      ...profile.toObject(),
      experience,
      skills,
      averageRating: avgRating,
      totalReviews: ratings.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/me', authenticate, async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { ...req.body, userId: req.userId },
      { new: true, runValidators: true, upsert: true }
    );
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/experience', authenticate, async (req, res) => {
  try {
    const experience = new WorkExperience({
      ...req.body,
      workerId: req.userId
    });
    await experience.save();
    res.status(201).json(experience);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/skills', authenticate, async (req, res) => {
  try {
    const skill = new WorkerSkill({
      ...req.body,
      workerId: req.userId
    });
    await skill.save();
    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

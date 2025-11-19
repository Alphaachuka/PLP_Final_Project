import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { createNotification } from '../utils/notificationHelper.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, level } = req.query;
    const filter = { isPublished: true };
    
    if (category) filter.category = category;
    if (level) filter.level = level;

    const courses = await Course.find(filter)
      .populate('instructorId', '_id email')
      .sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get mentor's own courses (including unpublished)
router.get('/my-courses', authenticate, async (req, res) => {
  try {
    const { category, level } = req.query;
    const filter = { instructorId: req.userId };
    
    if (category) filter.category = category;
    if (level) filter.level = level;

    const courses = await Course.find(filter)
      .populate('instructorId', '_id email')
      .sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructorId', '_id email');
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, authorize('mentor', 'admin'), async (req, res) => {
  try {
    const course = new Course({
      ...req.body,
      instructorId: req.userId
    });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    if (course.instructorId.toString() !== req.userId.toString() && !req.user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(course, req.body);
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/enroll', authenticate, async (req, res) => {
  try {
    const existing = await Enrollment.findOne({
      courseId: req.params.id,
      studentId: req.userId
    });

    if (existing) {
      return res.status(400).json({ error: 'Already enrolled' });
    }

    // Get course details for notification
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      courseId: req.params.id,
      studentId: req.userId
    });
    await enrollment.save();

    // Update course enrollment count
    await Course.findByIdAndUpdate(
      req.params.id,
      { $inc: { enrollmentCount: 1 } }
    );

    // Notify student about successful enrollment
    await createNotification({
      userId: req.userId,
      title: '🎓 Successfully Enrolled!',
      message: `You are now enrolled in "${course.title}". Start learning today!`,
      type: 'success',
      referenceType: 'course',
      referenceId: course._id
    });

    // Notify instructor about new student
    if (course.instructorId) {
      await createNotification({
        userId: course.instructorId,
        title: '👨‍🎓 New Student Enrolled',
        message: `A new student enrolled in your course: "${course.title}"`,
        type: 'info',
        referenceType: 'course',
        referenceId: course._id
      });
    }

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/progress', authenticate, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      courseId: req.params.id,
      studentId: req.userId
    });
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Not enrolled' });
    }
    
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student's enrollments
router.get('/enrollments/my', authenticate, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.userId })
      .populate({
        path: 'courseId',
        populate: {
          path: 'instructorId',
          select: '_id email'
        }
      })
      .sort({ createdAt: -1 });
    
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





export default router;

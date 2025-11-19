import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { avatarUpload, courseUpload, jobUpload, deleteFromCloudinary } from '../config/cloudinary.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Course from '../models/Course.js';
import Job from '../models/Job.js';

const router = express.Router();

// Upload avatar
router.post('/avatar', authenticate, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = req.file.path;
    const publicId = req.file.filename;

    // Update user profile with new avatar
    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { 
        avatarUrl,
        avatarPublicId: publicId
      },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Avatar uploaded successfully',
      avatarUrl,
      publicId,
      profile
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload course material
router.post('/course/:courseId', authenticate, courseUpload.single('material'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { courseId } = req.params;
    const { title, description } = req.body;

    // Verify course ownership
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.instructorId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to upload to this course' });
    }

    const material = {
      title: title || req.file.originalname,
      description: description || '',
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      publicId: req.file.filename,
      uploadedAt: new Date()
    };

    // Add material to course
    course.materials = course.materials || [];
    course.materials.push(material);
    await course.save();

    res.json({
      message: 'Course material uploaded successfully',
      material,
      course
    });
  } catch (error) {
    console.error('Course material upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload job attachment
router.post('/job/:jobId', authenticate, jobUpload.single('attachment'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { jobId } = req.params;
    const { title, description } = req.body;

    // Verify job ownership
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.employerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to upload to this job' });
    }

    const attachment = {
      title: title || req.file.originalname,
      description: description || '',
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      publicId: req.file.filename,
      uploadedAt: new Date()
    };

    // Add attachment to job
    job.attachments = job.attachments || [];
    job.attachments.push(attachment);
    await job.save();

    res.json({
      message: 'Job attachment uploaded successfully',
      attachment,
      job
    });
  } catch (error) {
    console.error('Job attachment upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete file
router.delete('/file/:publicId', authenticate, async (req, res) => {
  try {
    const { publicId } = req.params;
    const { type, resourceId } = req.query;

    // Delete from Cloudinary
    await deleteFromCloudinary(publicId);

    // Remove from database based on type
    switch (type) {
      case 'avatar':
        await Profile.findOneAndUpdate(
          { userId: req.userId },
          { 
            $unset: { avatarUrl: 1, avatarPublicId: 1 }
          }
        );
        break;

      case 'course':
        await Course.findByIdAndUpdate(
          resourceId,
          { 
            $pull: { materials: { publicId } }
          }
        );
        break;

      case 'job':
        await Job.findByIdAndUpdate(
          resourceId,
          { 
            $pull: { attachments: { publicId } }
          }
        );
        break;

      default:
        return res.status(400).json({ error: 'Invalid file type' });
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's uploaded files
router.get('/my-files', authenticate, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    const courses = await Course.find({ instructorId: req.userId });
    const jobs = await Job.find({ employerId: req.userId });

    const files = {
      avatar: profile?.avatarUrl ? {
        url: profile.avatarUrl,
        publicId: profile.avatarPublicId
      } : null,
      courseMaterials: courses.reduce((acc, course) => {
        if (course.materials) {
          acc.push(...course.materials.map(material => ({
            ...material,
            courseId: course._id,
            courseTitle: course.title
          })));
        }
        return acc;
      }, []),
      jobAttachments: jobs.reduce((acc, job) => {
        if (job.attachments) {
          acc.push(...job.attachments.map(attachment => ({
            ...attachment,
            jobId: job._id,
            jobTitle: job.title
          })));
        }
        return acc;
      }, [])
    };

    res.json(files);
  } catch (error) {
    console.error('Error fetching user files:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
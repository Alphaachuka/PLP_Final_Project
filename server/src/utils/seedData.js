import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Job from '../models/Job.js';
import Course from '../models/Course.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Job.deleteMany({});
    await Course.deleteMany({});

    // Create users
    const employer = new User({
      email: 'employer@test.com',
      password: 'password123',
      roles: ['employer']
    });
    await employer.save();

    const worker = new User({
      email: 'worker@test.com',
      password: 'password123',
      roles: ['worker']
    });
    await worker.save();

    const mentor = new User({
      email: 'mentor@test.com',
      password: 'password123',
      roles: ['mentor']
    });
    await mentor.save();

    // Create profiles
    await Profile.create({
      userId: employer._id,
      fullName: 'John Employer',
      bio: 'Looking for skilled workers',
      profileComplete: true
    });

    await Profile.create({
      userId: worker._id,
      fullName: 'Jane Worker',
      bio: 'Experienced construction worker',
      hourlyRate: 25,
      yearsExperience: 5,
      profileComplete: true
    });

    await Profile.create({
      userId: mentor._id,
      fullName: 'Bob Mentor',
      bio: 'Teaching construction skills',
      profileComplete: true
    });

    // Create jobs
    await Job.create({
      title: 'Construction Helper Needed',
      description: 'Need help with residential construction project',
      category: 'construction',
      employerId: employer._id,
      location: {
        address: 'Westlands, Nairobi',
        lat: -1.2641,
        lng: 36.8155
      },
      paymentAmount: 15000,
      estimatedDuration: '1 day',
      requiredSkills: ['construction', 'carpentry'],
      status: 'open'
    });

    await Job.create({
      title: 'Plumbing Work',
      description: 'Fix bathroom plumbing issues',
      category: 'plumbing',
      employerId: employer._id,
      location: {
        address: 'Karen, Nairobi',
        lat: -1.3197,
        lng: 36.7073
      },
      paymentAmount: 12000,
      estimatedDuration: '4 hours',
      requiredSkills: ['plumbing'],
      status: 'open'
    });

    // Create courses
    await Course.create({
      title: 'Introduction to Construction',
      description: 'Learn the basics of construction work',
      category: 'construction',
      level: 'beginner',
      instructorId: mentor._id,
      durationHours: 10,
      isPublished: true,
      modules: [
        {
          title: 'Safety First',
          description: 'Construction safety basics',
          orderIndex: 0,
          lessons: [
            {
              title: 'PPE Equipment',
              content: 'Learn about personal protective equipment',
              orderIndex: 0,
              durationMinutes: 30
            },
            {
              title: 'Site Safety',
              content: 'Understanding construction site safety',
              orderIndex: 1,
              durationMinutes: 45
            }
          ]
        },
        {
          title: 'Basic Tools',
          description: 'Introduction to construction tools',
          orderIndex: 1,
          lessons: [
            {
              title: 'Hand Tools',
              content: 'Common hand tools and their uses',
              orderIndex: 0,
              durationMinutes: 40
            }
          ]
        }
      ]
    });

    console.log('Seed data created successfully!');
    console.log('\nTest accounts:');
    console.log('Employer: employer@test.com / password123');
    console.log('Worker: worker@test.com / password123');
    console.log('Mentor: mentor@test.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

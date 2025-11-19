import mongoose from 'mongoose';

const lessonProgressSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date
});

const enrollmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  progressPercentage: {
    type: Number,
    default: 0
  },
  completedAt: Date,
  lessonProgress: [lessonProgressSchema]
}, {
  timestamps: true
});

export default mongoose.model('Enrollment', enrollmentSchema);

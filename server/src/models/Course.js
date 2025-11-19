import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: String,
  videoUrl: String,
  durationMinutes: Number,
  orderIndex: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  orderIndex: {
    type: Number,
    required: true
  },
  lessons: [lessonSchema]
}, {
  timestamps: true
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: true
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  thumbnailUrl: String,
  durationHours: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  },
  objectives: [String],
  prerequisites: [String],
  enrollmentCount: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  modules: [moduleSchema],
  materials: [{
    title: String,
    description: String,
    fileUrl: String,
    fileName: String,
    fileType: String,
    fileSize: Number,
    publicId: String, // Cloudinary public ID
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Course', courseSchema);

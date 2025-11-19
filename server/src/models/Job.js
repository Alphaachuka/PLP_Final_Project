import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
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
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    address: String,
    lat: Number,
    lng: Number
  },
  paymentAmount: {
    type: Number,
    required: true
  },
  estimatedDuration: String,
  requiredSkills: [String],
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed', 'cancelled'],
    default: 'open'
  },
  attachments: [{
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

export default mongoose.model('Job', jobSchema);

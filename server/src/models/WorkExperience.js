import mongoose from 'mongoose';

const workExperienceSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  company: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  isCurrent: {
    type: Boolean,
    default: false
  },
  description: String
}, {
  timestamps: true
});

export default mongoose.model('WorkExperience', workExperienceSchema);

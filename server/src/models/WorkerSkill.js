import mongoose from 'mongoose';

const workerSkillSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillName: {
    type: String,
    required: true
  },
  experienceLevel: {
    type: String,
    required: true
  },
  yearsExperience: Number
}, {
  timestamps: true
});

export default mongoose.model('WorkerSkill', workerSkillSchema);

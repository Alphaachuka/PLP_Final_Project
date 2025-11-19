import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  avatarUrl: String,
  avatarPublicId: String, // Cloudinary public ID for deletion
  bio: String,
  phone: String,
  location: {
    address: String,
    lat: Number,
    lng: Number
  },
  hourlyRate: Number,
  yearsExperience: Number,
  availability: String,
  profileComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Profile', profileSchema);

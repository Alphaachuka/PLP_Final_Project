import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Server will continue running without database connection...');
    console.log('Please fix MongoDB Atlas IP whitelist or use local MongoDB');
    // Don't exit - let server run for testing other features
    // process.exit(1);
  }
};

export default connectDB;

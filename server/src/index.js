import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { initializeSocket } from './config/socket.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profiles.js';
import jobRoutes from './routes/jobs.js';
import courseRoutes from './routes/courses.js';
import applicationRoutes from './routes/applications.js';
import notificationRoutes from './routes/notifications.js';
import walletRoutes from './routes/wallets.js';
import ratingRoutes from './routes/ratings.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/uploads.js';
import emailRoutes from './routes/email.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/email', emailRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Uplift API Server with Real-time Support' });
});

// Create HTTP server and initialize Socket.io
const server = createServer(app);
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io ready for real-time connections`);
});

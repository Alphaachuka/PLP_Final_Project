# Uplift Backend - MERN Stack

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string and JWT secret

4. Start the server:
```bash
npm run dev
```

## MongoDB Setup

### Local MongoDB
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string and update MONGODB_URI in .env

## API Endpoints

### Auth
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Profiles
- GET `/api/profiles/me` - Get current user profile
- GET `/api/profiles/:id` - Get user profile by ID
- PUT `/api/profiles/me` - Update profile
- POST `/api/profiles/experience` - Add work experience
- POST `/api/profiles/skills` - Add skill

### Jobs
- GET `/api/jobs` - Get all jobs
- GET `/api/jobs/:id` - Get job by ID
- POST `/api/jobs` - Create job (employer/admin only)
- PUT `/api/jobs/:id` - Update job
- DELETE `/api/jobs/:id` - Delete job

### Applications
- GET `/api/applications` - Get user's applications
- GET `/api/applications/job/:jobId` - Get job applications (employer only)
- POST `/api/applications` - Apply to job
- PUT `/api/applications/:id` - Update application status

### Courses
- GET `/api/courses` - Get all courses
- GET `/api/courses/:id` - Get course by ID
- POST `/api/courses` - Create course (mentor/admin only)
- PUT `/api/courses/:id` - Update course
- POST `/api/courses/:id/enroll` - Enroll in course
- GET `/api/courses/:id/progress` - Get course progress

### Wallet
- GET `/api/wallets/me` - Get user wallet
- POST `/api/wallets/transaction` - Create transaction

### Notifications
- GET `/api/notifications` - Get notifications
- PUT `/api/notifications/:id/read` - Mark as read
- PUT `/api/notifications/read-all` - Mark all as read

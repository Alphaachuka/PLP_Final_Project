# Uplift - Community Platform

A full-stack MERN application connecting workers with employers and providing skill development through courses. Features real-time notifications, file uploads, and multi-role authentication.

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS + shadcn/ui
- React Router
- React Query
- Leaflet (Maps)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Socket.io (Real-time)
- Nodemailer (Email)
- Cloudinary (File Upload)
- RESTful API

## Quick Start

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Setup environment
cp .env.example .env
cp server/.env.example server/.env
# Edit both .env files with your MongoDB URI

# Seed database (optional)
cd server && npm run seed && cd ..

# Run both servers
npm run dev:all
```

Visit http://localhost:8080

## Features

### Core Features
- 🔐 **Multi-role Authentication** - Worker, Employer, Student, Mentor, Admin
- 💼 **Job Marketplace** - Post jobs, apply, manage applications
- 📚 **Learning Platform** - Create courses, enroll, track progress
- 💰 **Wallet System** - Manage earnings and transactions
- ⭐ **Rating System** - Rate and review workers
- 📁 **File Upload** - Avatar, course materials (Cloudinary)
- 📧 **Email System** - Password reset, notifications
- 🔔 **Real-time Notifications** - Instant updates via Socket.io
- 👨‍💼 **Admin Panel** - User management, platform statistics

### For Workers
- Browse and apply for jobs
- Build professional profile with skills and experience
- Receive instant notifications on application status
- Enroll in courses to learn new skills
- Manage wallet and earnings

### For Employers
- Post job opportunities
- Review and manage applications
- Rate workers after job completion
- Real-time notifications for new applications

### For Mentors
- Create and publish courses
- Upload course materials
- Track student enrollments and progress
- Receive notifications for new students

### For Students
- Browse courses by category and level
- Enroll and track learning progress
- Access course materials
- Get notified on enrollment confirmation

## Project Structure

```
.
├── src/                      # React frontend
│   ├── components/          # Reusable components
│   ├── pages/              # Page components
│   ├── lib/
│   │   └── api.ts          # API client
│   └── hooks/              # Custom hooks
│
├── server/                  # Express backend
│   ├── src/
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth & validation
│   │   ├── config/         # Database config
│   │   └── index.js        # Server entry
│   └── package.json
│
└── package.json            # Frontend dependencies
```

## API Documentation

See [server/README.md](./server/README.md) for complete API documentation.

### Key Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job
- `GET /api/courses` - List courses
- `POST /api/applications` - Apply to job
- `GET /api/profiles/me` - Get profile
- `GET /api/wallets/me` - Get wallet

## Development

### Run Frontend Only
```bash
npm run dev
```

### Run Backend Only
```bash
cd server
npm run dev
```

### Run Both
```bash
npm run dev:all
```

### Seed Test Data
```bash
cd server
npm run seed
```

Test accounts:
- Employer: `employer@test.com` / `password123`
- Worker: `worker@test.com` / `password123`
- Mentor: `mentor@test.com` / `password123`

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (server/.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/uplift
JWT_SECRET=your_secret_key
NODE_ENV=development

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=noreply@yourdomain.com

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL
FRONTEND_URL=http://localhost:8080
```

## Database Schema

### Collections
- `users` - User accounts with roles
- `profiles` - User profile information
- `jobs` - Job postings
- `applications` - Job applications
- `courses` - Course content
- `enrollments` - Course enrollments
- `wallets` - User wallets & transactions
- `notifications` - User notifications
- `ratings` - Worker ratings
- `workexperiences` - Work history
- `workerskills` - User skills

## Deployment

### Recommended: Vercel (Frontend) + Render (Backend)

#### Frontend (Vercel)
1. Push code to GitHub
2. Import repository to Vercel
3. Set environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy

#### Backend (Render)
1. Create new Web Service
2. Connect GitHub repository
3. Build Command: `cd server && npm install`
4. Start Command: `cd server && npm start`
5. Add all environment variables
6. Deploy

### Alternative: VPS (DigitalOcean/AWS)
1. Set up Ubuntu server
2. Install Node.js, MongoDB, Nginx
3. Clone repository
4. Configure environment variables
5. Set up PM2 for process management
6. Configure Nginx as reverse proxy
7. Set up SSL with Let's Encrypt

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License - see LICENSE file for details

# Uplift - Job Marketplace & Learning Platform

A full-stack MERN application connecting workers with employers and providing skill development courses.

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
- RESTful API

## Quick Start

See [QUICKSTART.md](./QUICKSTART.md) for 5-minute setup guide.

### TL;DR

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

### For Workers
- Browse and apply for jobs
- Build professional profile
- Track work history and skills
- Enroll in courses
- Manage wallet and earnings

### For Employers
- Post job opportunities
- Review applications
- Rate workers
- Manage active jobs

### For Mentors
- Create and publish courses
- Organize content in modules
- Track student progress

### For Students
- Browse courses by category/level
- Enroll and track progress
- Complete lessons
- Earn certificates

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
├── QUICKSTART.md           # Quick setup guide
├── MIGRATION_GUIDE.md      # Detailed migration info
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

## Migration from Supabase

This project was migrated from Supabase to MERN stack. See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for:
- Detailed migration steps
- API comparison
- Data migration scripts
- Troubleshooting

## Deployment

### Backend
Deploy to Railway, Render, or AWS:
1. Set environment variables
2. Use MongoDB Atlas for database
3. Deploy from GitHub

### Frontend
Deploy to Vercel or Netlify:
1. Update VITE_API_URL to production backend
2. Run `npm run build`
3. Deploy `dist` folder

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License - see LICENSE file for details

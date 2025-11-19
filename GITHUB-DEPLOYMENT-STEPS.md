# GitHub Deployment Steps

## Pre-Deployment Checklist

### 1. Clean Up Project
```bash
FINAL-COMPLETE-CLEANUP.bat
```

### 2. Verify .gitignore
Make sure `.env` files are ignored:
- ✅ `.env` in root
- ✅ `server/.env`
- ✅ `node_modules/`
- ✅ `.claude/`

### 3. Update README.md
Make sure README has:
- Project description
- Setup instructions
- Environment variables needed
- Deployment instructions

## GitHub Deployment

### Option 1: Using Script (Easiest)
```bash
DEPLOY-TO-GITHUB.bat
```

### Option 2: Manual Steps

#### Step 1: Create GitHub Repository
1. Go to https://github.com
2. Click "New repository"
3. Name: `uplift-mern-app` (or your choice)
4. Description: "MERN stack community platform with real-time features"
5. Keep it Public or Private
6. **DO NOT** initialize with README (we have one)
7. Click "Create repository"

#### Step 2: Initialize Git (if not already)
```bash
git init
```

#### Step 3: Add Files
```bash
git add .
```

#### Step 4: Create Commit
```bash
git commit -m "Initial commit: MERN stack application"
```

#### Step 5: Add Remote
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

#### Step 6: Push to GitHub
```bash
git branch -M main
git push -u origin main
```

## Verify Deployment

Go to your GitHub repository and verify:
- [ ] All source code is there
- [ ] `.env` files are NOT there (should be ignored)
- [ ] `node_modules/` is NOT there
- [ ] README.md is visible
- [ ] All folders are present (src/, server/, etc.)

## What Should Be on GitHub

### ✅ Should Be Included
- All source code (`src/`, `server/src/`)
- Configuration files (`package.json`, `vite.config.ts`, etc.)
- `.env.example` files (templates)
- `.gitignore`
- `README.md`
- Email templates (`server/src/templates/`)

### ❌ Should NOT Be Included
- `.env` files (contain secrets)
- `node_modules/` (too large, installed via npm)
- `dist/` (build output)
- `.claude/` (AI tool cache)
- Personal test files

## After GitHub Deployment

### Next: Deploy to Hosting

#### Frontend (Vercel)
1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variable: `VITE_API_URL`

#### Backend (Render)
1. Go to https://render.com
2. New Web Service
3. Connect GitHub repository
4. Configure:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Add all environment variables

## Environment Variables to Set

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.onrender.com/api
```

### Backend (Render)
```
PORT=5000
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-secure-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=https://your-app.vercel.app
```

## Troubleshooting

### "Permission denied (publickey)"
**Solution:** Set up SSH key or use HTTPS with personal access token

### "Repository not found"
**Solution:** Check repository URL is correct

### ".env file is on GitHub"
**Solution:** 
1. Remove from GitHub: `git rm --cached .env`
2. Commit: `git commit -m "Remove .env"`
3. Push: `git push`

### "Too many files"
**Solution:** Make sure `.gitignore` includes `node_modules/`

## Git Commands Reference

```bash
# Check status
git status

# Add specific file
git add filename

# Add all files
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push

# Pull from GitHub
git pull

# Check remote
git remote -v

# Create new branch
git checkout -b branch-name

# Switch branch
git checkout main
```

## Security Checklist

Before pushing to GitHub:
- [ ] `.env` is in `.gitignore`
- [ ] No API keys in code
- [ ] No passwords in code
- [ ] No database credentials in code
- [ ] `.env.example` has placeholder values only

## Success!

Once pushed to GitHub, your code is:
- ✅ Backed up
- ✅ Version controlled
- ✅ Ready for deployment
- ✅ Shareable with team

---

**Run:** `DEPLOY-TO-GITHUB.bat` to automate this process!
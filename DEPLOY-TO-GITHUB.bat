@echo off
cls
echo ========================================
echo DEPLOY TO GITHUB
echo ========================================
echo.

echo This will:
echo 1. Initialize git repository (if needed)
echo 2. Add all files
echo 3. Create initial commit
echo 4. Push to GitHub
echo.

echo Make sure you have:
echo - Created a GitHub repository
echo - Have the repository URL ready
echo.

pause

echo.
echo ========================================
echo STEP 1: Initialize Git
echo ========================================

if not exist ".git" (
    git init
    echo ✅ Git initialized
) else (
    echo ✅ Git already initialized
)

echo.
echo ========================================
echo STEP 2: Add Files
echo ========================================

git add .
echo ✅ Files added

echo.
echo ========================================
echo STEP 3: Create Commit
echo ========================================

git commit -m "Initial commit: MERN stack application with real-time features"
echo ✅ Commit created

echo.
echo ========================================
echo STEP 4: Add Remote Repository
echo ========================================
echo.

echo Enter your GitHub repository URL:
echo Example: https://github.com/username/repository.git
echo.
set /p REPO_URL=Repository URL: 

git remote add origin %REPO_URL%
echo ✅ Remote added

echo.
echo ========================================
echo STEP 5: Push to GitHub
echo ========================================

git branch -M main
git push -u origin main

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.

echo Your code is now on GitHub!
echo.

echo Next steps:
echo 1. Go to your GitHub repository
echo 2. Deploy frontend to Vercel
echo 3. Deploy backend to Render
echo.

pause
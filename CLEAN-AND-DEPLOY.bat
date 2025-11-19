@echo off
cls
echo ========================================
echo CLEAN PROJECT AND DEPLOY TO GITHUB
echo ========================================
echo.

echo This will:
echo 1. Remove Supabase dependencies
echo 2. Remove all .bat and .md files (except README.md)
echo 3. Remove unnecessary folders
echo 4. Deploy to GitHub
echo.

set /p CONFIRM=Continue? (Y/N): 

if /i not "%CONFIRM%"=="Y" (
    echo Cancelled.
    pause
    exit /b
)

echo.
echo Step 1: Removing Supabase dependency...
call npm uninstall @supabase/supabase-js axios

echo.
echo Step 2: Removing folders...
if exist "src\integrations\supabase" rmdir /s /q "src\integrations\supabase"
if exist "supabase" rmdir /s /q "supabase"
if exist ".claude" rmdir /s /q ".claude"
if exist "docs" rmdir /s /q "docs"

echo.
echo Step 3: Cleaning .env...
if exist ".env" (
    echo VITE_API_URL=http://localhost:5000/api > .env
)

echo.
echo Step 4: Removing script files...
for %%f in (*.bat) do if not "%%f"=="CLEAN-AND-DEPLOY.bat" del "%%f"
for %%f in (*.md) do if not "%%f"=="README.md" del "%%f"
del *.ps1 2>nul
del *.sh 2>nul

echo.
echo Step 5: Git setup...
if not exist ".git" git init

git add .
git commit -m "Uplift Community Platform - MERN Stack"

echo.
echo Enter your GitHub repository URL:
set /p REPO_URL=URL: 

git remote add origin %REPO_URL% 2>nul
git branch -M main
git push -u origin main

echo.
echo ========================================
echo DEPLOYED TO GITHUB!
echo ========================================
echo.

timeout /t 3 /nobreak >nul
del "%~f0"
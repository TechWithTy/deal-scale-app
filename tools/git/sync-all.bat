@echo off
REM Batch script to sync main repo and all submodules (Windows)
REM Usage: tools\git\sync-all.bat

echo 🔄 Syncing main repository and all submodules...
echo.

REM Stage all submodules
echo 📦 Staging submodule references...
git add _docs/front_end_best_practices
git add scripts
git add .windsurf

REM Stage .gitignore if modified
git diff --name-only | findstr /C:".gitignore" >nul
if %errorlevel% equ 0 (
    echo 📝 Staging .gitignore changes...
    git add .gitignore
)

REM Show status
echo.
echo 📊 Current status:
git status --short

echo.
echo ✅ Ready to commit!
echo    Run: git commit -m "your message"






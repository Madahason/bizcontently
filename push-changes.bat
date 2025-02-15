@echo off
setlocal

REM Get the commit message from command line argument
set "message=%~1"

REM Check if commit message is provided
if "%message%"=="" (
    echo Error: Please provide a commit message
    echo Usage: push-changes.bat "Your commit message"
    exit /b 1
)

REM Add all changes
git add .

REM Commit changes with the provided message
git commit -m "%message%"

REM Push to GitHub
git push origin main

echo.
echo Changes have been pushed to GitHub successfully!
echo Repository: https://github.com/Madahason/bizcontently.git
echo. 
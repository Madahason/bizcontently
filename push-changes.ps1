# PowerShell script to automate git push
param(
    [Parameter(Mandatory=$true)]
    [string]$commitMessage
)

# Add all changes
git add .

# Commit changes with the provided message
git commit -m $commitMessage

# Push to GitHub
git push origin main

Write-Host "Changes have been pushed to GitHub successfully!" -ForegroundColor Green
Write-Host "Repository: https://github.com/Madahason/bizcontently.git" -ForegroundColor Cyan 
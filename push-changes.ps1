# PowerShell script to automate git push
param(
    [Parameter(Mandatory=$true)]
    [string]$commitMessage
)

try {
    # Check if there are any changes to commit
    $status = git status --porcelain
    if ($status) {
        # Add all changes
        git add .

        # Commit changes with the provided message
        git commit -m "$commitMessage"

        # Push to GitHub
        git push origin main

        Write-Host "`n✅ Changes have been pushed to GitHub successfully!" -ForegroundColor Green
        Write-Host "📂 Repository: https://github.com/Madahason/bizcontently.git`n" -ForegroundColor Cyan
    } else {
        Write-Host "`n📝 No changes to commit. Working directory is clean.`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "`n❌ Error occurred while pushing changes:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Please try again or push manually.`n" -ForegroundColor Red
    exit 1
} 
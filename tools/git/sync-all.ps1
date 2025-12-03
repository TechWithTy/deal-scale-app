# PowerShell script to sync main repo and all submodules
# Usage: .\tools\git\sync-all.ps1

Write-Host "🔄 Syncing main repository and all submodules..." -ForegroundColor Cyan

# Get all submodules
$submodules = git submodule status | ForEach-Object {
    if ($_ -match '^[\s\-\+U]+\w+\s+([^\s]+)') {
        $matches[1]
    }
}

if ($submodules.Count -eq 0) {
    Write-Host "No submodules found." -ForegroundColor Yellow
} else {
    Write-Host "Found submodules: $($submodules -join ', ')" -ForegroundColor Green
    Write-Host ""
    
    foreach ($sub in $submodules) {
        Write-Host "📦 Checking: $sub" -ForegroundColor Cyan
        Push-Location $sub
        
        $status = git status --short
        if ($status) {
            Write-Host "  ⚠️  Changes detected:" -ForegroundColor Yellow
            git status --short | ForEach-Object { Write-Host "     $_" }
            Write-Host "  💡 Commit changes in $sub first, then return here" -ForegroundColor Yellow
        } else {
            Write-Host "  ✓ No changes" -ForegroundColor Green
        }
        
        Pop-Location
    }
    Write-Host ""
}

# Stage submodule updates in main repo
Write-Host "📌 Staging submodule references in main repository..." -ForegroundColor Cyan
git add $submodules

# Stage .gitignore
if (git diff --name-only | Select-String -Pattern '\.gitignore') {
    Write-Host "📝 Staging .gitignore changes..." -ForegroundColor Cyan
    git add .gitignore
}

# Show final status
Write-Host ""
Write-Host "📊 Final status:" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "✅ Ready to commit!" -ForegroundColor Green
Write-Host "   Run: git commit -m 'your message'" -ForegroundColor Yellow






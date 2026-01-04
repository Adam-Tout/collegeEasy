# Backend Deployment Script
# This script copies backend files to your separate backend repo and deploys

Write-Host "🚀 Backend Deployment Script" -ForegroundColor Cyan
Write-Host ""

# Step 1: Navigate to parent directory
Write-Host "Step 1: Navigating to parent directory..." -ForegroundColor Yellow
cd ..

# Step 2: Check if backend repo exists
$backendRepo = "vercel_agents_canvas_bkend"
if (-not (Test-Path $backendRepo)) {
    Write-Host "Backend repo not found. Cloning..." -ForegroundColor Yellow
    git clone https://github.com/Adam-Tout/vercel_agents_canvas_bkend.git
}

# Step 3: Copy files
Write-Host "Step 2: Copying backend files..." -ForegroundColor Yellow
Copy-Item -Path "TraeHackathon\backend\*" -Destination "$backendRepo\" -Recurse -Force -Exclude "node_modules"
Write-Host "✅ Files copied!" -ForegroundColor Green

# Step 4: Navigate to backend repo
cd $backendRepo

# Step 5: Install dependencies
Write-Host "Step 3: Installing dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✅ Dependencies installed!" -ForegroundColor Green

# Step 6: Git operations
Write-Host "Step 4: Committing and pushing..." -ForegroundColor Yellow
git add .
git commit -m "Deploy Canvas AI agent with 23 API tools and function calling"
git push origin main
Write-Host "✅ Code pushed to GitHub!" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Deployment initiated!" -ForegroundColor Green
Write-Host "Vercel will auto-deploy from GitHub." -ForegroundColor Cyan
Write-Host "Check: https://vercel.com → Your project → Deployments" -ForegroundColor Cyan



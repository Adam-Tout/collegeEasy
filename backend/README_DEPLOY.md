# 🚀 Deploy Backend - Quick Guide

## ✅ All Backend Files Are Ready!

All files are in the `backend/` folder:
- ✅ `api/` - All 4 API endpoints
- ✅ `package.json` - Dependencies
- ✅ `tsconfig.json` - TypeScript config
- ✅ `vercel.json` - Vercel config
- ✅ `.gitignore` - Git ignore rules

## 📦 Deploy Now (3 Steps)

### Option 1: Use Deployment Script (Easiest)

```powershell
cd backend
.\DEPLOY_SCRIPT.ps1
```

### Option 2: Manual Deployment

**Step 1: Copy to Backend Repo**
```powershell
cd ..
git clone https://github.com/Adam-Tout/vercel_agents_canvas_bkend.git
cd vercel_agents_canvas_bkend
Copy-Item -Path ..\TraeHackathon\backend\* -Destination . -Recurse -Force -Exclude "node_modules"
```

**Step 2: Install & Push**
```powershell
npm install
git add .
git commit -m "Deploy Canvas AI agent with 23 API tools"
git push origin main
```

**Step 3: Vercel Auto-Deploys**
- Go to https://vercel.com
- Your project will auto-deploy from GitHub
- Check Deployments tab

## ✅ Verify Deployment

After deployment, test:
```powershell
$URL = "https://vercel_agents_canvas_bkend.vercel.app"
curl -X POST "$URL/api/chat" -H "Content-Type: application/json" -d '{\"messages\":[{\"role\":\"user\",\"content\":\"Hello\"}]}'
```

## 🎯 What Gets Deployed

- ✅ `/api/chat` - Basic chat endpoint
- ✅ `/api/chat-with-tools` - AI with Canvas function calling
- ✅ `/api/canvas-agent` - Direct Canvas API execution
- ✅ `/api/canvas-tools.ts` - 23 Canvas API tools registry

All ready to go! 🚀



# 🚀 Deploy Backend Now - Step by Step

## Quick Deploy Commands

### Step 1: Navigate to Backend Repo

```powershell
# Go to parent directory
cd ..

# Clone your backend repo (if not already cloned)
git clone https://github.com/Adam-Tout/vercel_agents_canvas_bkend.git
cd vercel_agents_canvas_bkend
```

### Step 2: Copy All Backend Files

```powershell
# Copy everything from TraeHackathon/backend to current directory
Copy-Item -Path ..\TraeHackathon\backend\* -Destination . -Recurse -Force

# Verify files are there
ls api
# Should show: chat.ts, chat-with-tools.ts, canvas-agent.ts, canvas-tools.ts
```

### Step 3: Install Dependencies

```powershell
npm install
```

### Step 4: Commit and Push

```powershell
git add .
git commit -m "Deploy Canvas AI agent with 23 API tools and function calling"
git push origin main
```

### Step 5: Vercel Auto-Deploys

- Vercel will automatically detect the push
- Deployment will start automatically
- Check: https://vercel.com → Your project → Deployments

### Step 6: Verify Environment Variable

In Vercel Dashboard:
- Go to: Settings → Environment Variables
- Verify: `OPENAI_API_KEY` is set ✅

### Step 7: Test Deployment

```powershell
# Replace with your actual Vercel URL
$VERCEL_URL = "https://vercel_agents_canvas_bkend.vercel.app"

# Test basic chat
curl -X POST "$VERCEL_URL/api/chat" `
  -H "Content-Type: application/json" `
  -d '{\"messages\":[{\"role\":\"user\",\"content\":\"Hello\"}]}'
```

## ✅ Deployment Checklist

- [ ] Backend files copied to repo
- [ ] `npm install` completed
- [ ] Code committed and pushed
- [ ] Vercel auto-deployed (or manual deploy)
- [ ] `OPENAI_API_KEY` environment variable set
- [ ] Test endpoint returns 200 (not 404)

## 🎯 After Deployment

Update your frontend `.env`:
```env
VITE_API_URL=https://vercel_agents_canvas_bkend.vercel.app/api
VITE_USE_BACKEND_API=true
```

Then test in your frontend app!



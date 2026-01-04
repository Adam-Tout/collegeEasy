# 🚀 Deploy Backend to Vercel - Step by Step

## Step 1: Copy Backend to Your Separate Repo

Your backend code is now organized in the `backend/` folder. Copy everything from `backend/` to your separate backend repository.

### Option A: Using Git (Recommended)

```bash
# From your TraeHackathon directory
cd ..

# Clone your backend repo (if you haven't already)
git clone https://github.com/Adam-Tout/vercel_agents_canvas_bkend.git
cd vercel_agents_canvas_bkend

# Copy all files from backend folder
# Windows PowerShell:
Copy-Item -Path ..\TraeHackathon\backend\* -Destination . -Recurse -Force

# Or manually copy:
# - backend/api/chat.ts → api/chat.ts
# - backend/package.json → package.json
# - backend/tsconfig.json → tsconfig.json
# - backend/vercel.json → vercel.json
# - backend/README.md → README.md
# - backend/.gitignore → .gitignore

# Install dependencies
npm install

# Commit and push
git add .
git commit -m "Add AI chat API endpoint with OpenAI SDK"
git push origin main
```

### Option B: Manual Copy

1. Open `backend/` folder in this project
2. Copy all files to your `vercel_agents_canvas_bkend` repo:
   - `api/chat.ts` → `api/chat.ts`
   - `package.json` → `package.json`
   - `tsconfig.json` → `tsconfig.json`
   - `vercel.json` → `vercel.json`
   - `README.md` → `README.md`
   - `.gitignore` → `.gitignore`

3. In your backend repo:
   ```bash
   npm install
   git add .
   git commit -m "Add AI chat API endpoint"
   git push origin main
   ```

## Step 2: Deploy to Vercel

### Method 1: Via Vercel Dashboard (Easiest)

1. **Go to [vercel.com](https://vercel.com)** and sign in

2. **Import Your Repository**:
   - Click **"Add New Project"** (or find existing project)
   - Click **"Import Git Repository"**
   - Select: `Adam-Tout/vercel_agents_canvas_bkend`
   - Click **"Import"**

3. **Configure Project**:
   - **Framework Preset**: Select **"Other"** (or leave as auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: Leave **empty** (no build needed for serverless functions)
   - **Output Directory**: Leave **empty**
   - **Install Command**: `npm install` (default)

4. **Add Environment Variable** ⚠️ **IMPORTANT**:
   - Click **"Environment Variables"** section
   - Click **"Add New"**
   - **Key**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (starts with `sk-`)
   - **Environments**: Check all three:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
   - Click **"Save"**

5. **Deploy**:
   - Click **"Deploy"** button
   - Wait 1-2 minutes for deployment
   - **Copy your deployment URL** (e.g., `https://vercel_agents_canvas_bkend.vercel.app`)

### Method 2: Via Vercel CLI

```bash
# In your backend repo directory
cd vercel_agents_canvas_bkend

# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Add environment variable
vercel env add OPENAI_API_KEY

# Deploy
vercel --prod
```

## Step 3: Verify Deployment

### Test the API:
```bash
curl -X POST https://vercel_agents_canvas_bkend.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"messages\":[{\"role\":\"user\",\"content\":\"Hello!\"}]}"
```

You should get a JSON response with an AI-generated message.

## Step 4: Connect Frontend

Update your frontend `.env` file:
```env
VITE_API_URL=https://vercel_agents_canvas_bkend.vercel.app/api/chat
VITE_USE_BACKEND_API=true
```

Replace `vercel_agents_canvas_bkend.vercel.app` with your actual deployment URL.

## ✅ Done!

Your backend is now:
- ✅ Deployed and live
- ✅ Secure (API key on server only)
- ✅ Ready to receive requests from frontend

---

## 🆘 Troubleshooting

### "OpenAI API key not configured"
→ Go to Vercel Dashboard → Your Project → Settings → Environment Variables → Add `OPENAI_API_KEY`

### 404 Error
→ Check that `api/chat.ts` exists in your repo
→ Verify the file is in `api/` directory (not `src/api/`)

### Deployment fails
→ Check Vercel deployment logs
→ Verify `package.json` has correct dependencies
→ Make sure `npm install` works locally



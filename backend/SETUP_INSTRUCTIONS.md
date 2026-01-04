# Complete Setup Instructions for Separate Backend

## 🎯 What You Need to Do

You have two options:
1. **Separate Backend Repo** (what you've set up) - Backend and frontend are separate
2. **Same Repo** (simpler) - Backend API routes live alongside frontend

Since you've already created the separate backend project, let's set it up!

---

## 📦 Step 1: Set Up Your Backend Repo

### Option A: Using GitHub (Recommended)

1. **Clone your backend repo**:
   ```bash
   git clone https://github.com/Adam-Tout/vercel_agents_canvas_bkend.git
   cd vercel_agents_canvas_bkend
   ```

2. **Copy these files to your backend repo**:
   - Copy `api/chat.ts` from this project → `api/chat.ts` in backend repo
   - Copy `backend-package.json` → `package.json` in backend repo
   - Copy `backend-tsconfig.json` → `tsconfig.json` in backend repo
   - Copy `backend-vercel.json` → `vercel.json` in backend repo

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "Initial backend API setup"
   git push origin main
   ```

### Option B: Using Vercel CLI

1. **In your backend repo directory**:
   ```bash
   # Initialize if needed
   npm init -y
   
   # Install dependencies
   npm install openai @vercel/node
   npm install -D typescript @types/node
   
   # Create api directory
   mkdir api
   ```

2. **Copy `api/chat.ts` from this project to `api/chat.ts` in backend repo**

3. **Create the config files** (copy from this project):
   - `package.json` (use backend-package.json)
   - `tsconfig.json` (use backend-tsconfig.json)
   - `vercel.json` (use backend-vercel.json)

---

## 🚀 Step 2: Deploy Backend to Vercel

### Link Your Backend Repo to Vercel Project

1. **Go to [vercel.com](https://vercel.com)** and sign in

2. **Import your backend repo**:
   - Click "Add New Project"
   - Select your GitHub repo: `vercel_agents_canvas_bkend`
   - Or if project already exists, go to Settings → Git

3. **Configure Project**:
   - Framework Preset: **Other** (or **Node.js**)
   - Root Directory: `./`
   - Build Command: Leave empty (no build needed for serverless functions)
   - Output Directory: Leave empty
   - Install Command: `npm install`

4. **Add Environment Variable**:
   - Go to **Settings** → **Environment Variables**
   - Add: `OPENAI_API_KEY` = `sk-your-actual-openai-key-here`
   - Select: **Production, Preview, Development**
   - Click **Save**

5. **Deploy**:
   - Click **Deploy**
   - Wait for deployment (1-2 minutes)
   - Copy your deployment URL (e.g., `https://vercel_agents_canvas_bkend.vercel.app`)

---

## 🔗 Step 3: Connect Frontend to Backend

### Update Your Frontend Project

1. **Update `.env` file** in your frontend project:
   ```env
   VITE_API_URL=https://vercel_agents_canvas_bkend.vercel.app/api/chat
   VITE_USE_BACKEND_API=true
   ```

2. **Or add in Vercel Dashboard** (if frontend is also on Vercel):
   - Go to your frontend project settings
   - Environment Variables
   - Add: `VITE_API_URL` = `https://vercel_agents_canvas_bkend.vercel.app/api/chat`

3. **Test locally**:
   ```bash
   # In your frontend project
   npm run dev
   ```
   - Open browser console
   - Try sending a message in the chat
   - Check console for API calls

---

## ✅ Step 4: Verify Everything Works

### Test Backend API:
```bash
curl -X POST https://vercel_agents_canvas_bkend.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello!"}]}'
```

You should get a JSON response with a message from the AI.

### Test Frontend:
1. Open your frontend app
2. Go to the chat interface
3. Send a message
4. Check browser console (F12) for logs
5. You should see: `[AIService] REAL API MODE - Making backend API call...`

---

## 🎉 You're Done!

Your AI agent is now:
- ✅ Secure (API key on server only)
- ✅ Deployed and accessible
- ✅ Connected to your frontend

---

## 🔧 Troubleshooting

### Backend returns 404
- Check that `api/chat.ts` exists in the backend repo
- Verify the file is in the `api/` directory (not `src/api/`)
- Check Vercel deployment logs

### CORS errors
- The API already includes CORS headers
- If still seeing errors, check browser console for details

### API key not found
- Verify `OPENAI_API_KEY` is set in Vercel dashboard
- Make sure it's set for the correct environment (Production/Preview/Development)
- Redeploy after adding environment variables

### Frontend can't connect
- Check `VITE_API_URL` is correct
- Verify backend is deployed and accessible
- Check browser console for network errors

---

## 📝 File Structure for Backend Repo

Your backend repo should look like this:

```
vercel_agents_canvas_bkend/
├── api/
│   └── chat.ts          # Your API endpoint
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── vercel.json         # Vercel config
└── README.md           # Optional
```

That's it! Simple and clean. 🚀


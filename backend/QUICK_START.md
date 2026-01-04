# 🚀 Quick Start - Get Your AI Agent Running in 5 Minutes

## What You Have:
- ✅ Frontend project (this repo)
- ✅ Backend Vercel project created: `vercel_agents_canvas_bkend`
- ✅ Backend GitHub repo: `https://github.com/Adam-Tout/vercel_agents_canvas_bkend`

## What You Need to Do:

### 1️⃣ Set Up Backend Repo (2 minutes)

**Option 1: Copy files manually**

1. Clone your backend repo:
   ```bash
   cd ..
   git clone https://github.com/Adam-Tout/vercel_agents_canvas_bkend.git
   cd vercel_agents_canvas_bkend
   ```

2. Copy files from this project:
   - Copy `api/chat.ts` → `api/chat.ts` in backend repo
   - Copy `backend-package.json` → rename to `package.json`
   - Copy `backend-tsconfig.json` → rename to `tsconfig.json`
   - Copy `backend-vercel.json` → rename to `vercel.json`

3. Install and commit:
   ```bash
   npm install
   git add .
   git commit -m "Add AI chat API endpoint"
   git push origin main
   ```

**Option 2: Use Vercel CLI (faster)**

```bash
cd ..
git clone https://github.com/Adam-Tout/vercel_agents_canvas_bkend.git
cd vercel_agents_canvas_bkend

# Create api directory
mkdir api

# Copy the chat.ts file (you'll need to do this manually or use a file manager)
# Copy api/chat.ts from TraeHackathon/api/chat.ts to vercel_agents_canvas_bkend/api/chat.ts

# Create package.json
cat > package.json << 'EOF'
{
  "name": "vercel_agents_canvas_bkend",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "openai": "^6.3.0"
  },
  "devDependencies": {
    "@vercel/node": "^3.0.0",
    "@types/node": "^22.15.30",
    "typescript": "~5.8.3"
  }
}
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "types": ["node"]
  },
  "include": ["api/**/*"],
  "exclude": ["node_modules"]
}
EOF

# Create vercel.json
cat > vercel.json << 'EOF'
{
  "functions": {
    "api/chat.ts": {
      "maxDuration": 30
    }
  }
}
EOF

npm install
git add .
git commit -m "Add AI chat API endpoint"
git push origin main
```

### 2️⃣ Deploy Backend to Vercel (1 minute)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project" (or find your existing project)
3. Import your GitHub repo: `vercel_agents_canvas_bkend`
4. Configure:
   - Framework: **Other**
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
5. **Add Environment Variable**:
   - Name: `OPENAI_API_KEY`
   - Value: `sk-your-actual-openai-key`
   - Environments: ✅ Production ✅ Preview ✅ Development
6. Click **Deploy**
7. **Copy the deployment URL** (e.g., `https://vercel_agents_canvas_bkend.vercel.app`)

### 3️⃣ Connect Frontend to Backend (1 minute)

**Update your `.env` file in this project:**

```env
VITE_API_URL=https://vercel_agents_canvas_bkend.vercel.app/api/chat
VITE_USE_BACKEND_API=true
```

**Or if deploying frontend to Vercel too:**
- Go to frontend project settings
- Environment Variables
- Add: `VITE_API_URL` = `https://vercel_agents_canvas_bkend.vercel.app/api/chat`

### 4️⃣ Test It! (1 minute)

1. **Test backend directly:**
   ```bash
   curl -X POST https://vercel_agents_canvas_bkend.vercel.app/api/chat \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"Hello!"}]}'
   ```

2. **Test in your app:**
   ```bash
   npm run dev
   ```
   - Open browser
   - Go to chat interface
   - Send a message
   - Check console (F12) for API logs

---

## ✅ Done!

Your AI agent is now:
- 🔒 Secure (API key never exposed)
- 🚀 Deployed and live
- 🔗 Connected to frontend

---

## 🆘 Need Help?

- **Backend 404?** → Check `api/chat.ts` exists in backend repo
- **API key error?** → Verify `OPENAI_API_KEY` in Vercel dashboard
- **CORS errors?** → Already handled in the API code
- **Frontend can't connect?** → Check `VITE_API_URL` is correct

See `SETUP_INSTRUCTIONS.md` for detailed troubleshooting.


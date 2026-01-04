# 🚀 Deployment Guide

Complete guide for deploying the Canvas AI Assistant frontend and backend.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Environment Variables](#environment-variables)
5. [Connecting Frontend to Backend](#connecting-frontend-to-backend)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## 📖 Overview

This project consists of two separate deployments:

1. **Frontend** - React + Vite application (deployed to Vercel/Netlify/etc.)
2. **Backend** - Vercel serverless functions (separate Vercel project: `vercel_agents_canvas_bkend`)

The backend securely handles OpenAI API calls, keeping your API key server-side.

---

## 🔧 Backend Deployment

### Prerequisites

- GitHub repository: `https://github.com/Adam-Tout/vercel_agents_canvas_bkend`
- OpenAI API key (starts with `sk-`)
- Vercel account

### Step 1: Copy Backend Files

Copy all files from the `backend/` folder to your separate backend repository:

```bash
# From your TraeHackathon directory
cd ..

# Clone your backend repo (if you haven't already)
git clone https://github.com/Adam-Tout/vercel_agents_canvas_bkend.git
cd vercel_agents_canvas_bkend

# Copy all files from backend folder
# Windows PowerShell:
Copy-Item -Path ..\TraeHackathon\backend\* -Destination . -Recurse -Force

# Or manually copy these files:
# - backend/api/* → api/*
# - backend/package.json → package.json
# - backend/tsconfig.json → tsconfig.json
# - backend/vercel.json → vercel.json
# - backend/.gitignore → .gitignore (if exists)
```

### Step 2: Install Dependencies

```bash
cd vercel_agents_canvas_bkend
npm install
```

### Step 3: Deploy to Vercel

#### Method A: Via Vercel Dashboard (Recommended)

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

4. **Add Environment Variable** ⚠️ **CRITICAL**:
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

#### Method B: Via Vercel CLI

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

### Step 4: Verify Backend Deployment

Test the API endpoint:

```bash
curl -X POST https://vercel_agents_canvas_bkend.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"messages\":[{\"role\":\"user\",\"content\":\"Hello!\"}]}"
```

You should get a JSON response with an AI-generated message.

**Available Endpoints:**
- `/api/chat` - Basic chat endpoint
- `/api/chat-with-tools` - Chat with Canvas API tools
- `/api/canvas-agent` - Direct Canvas API tool execution
- `/api/workspace-agent` - Workspace-specific agent

---

## 🎨 Frontend Deployment

### Prerequisites

- Node.js 18+ installed
- Backend deployed and URL available

### Step 1: Configure Environment Variables

Create a `.env` file in the root directory (copy from `env.example`):

```bash
cp env.example .env
```

Edit `.env` and set:

```env
# Backend API URL (your Vercel backend deployment)
VITE_API_URL=https://vercel_agents_canvas_bkend.vercel.app/api

# Enable backend API
VITE_USE_BACKEND_API=true

# App Configuration
VITE_APP_NAME=Canvas AI Assistant
VITE_APP_VERSION=1.0.0

# Optional: Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Optional: Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# Optional: Canvas API (for direct Canvas integration)
VITE_CANVAS_API_URL=https://your-canvas-instance.instructure.com/api/v1
```

**Important**: Replace `vercel_agents_canvas_bkend.vercel.app` with your actual backend deployment URL.

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

### Step 4: Deploy Frontend

#### Option A: Deploy to Vercel

1. **Via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click **"Add New Project"**
   - Import your frontend repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `./`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add environment variables (same as `.env` file)
   - Click **"Deploy"**

2. **Via Vercel CLI**:
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

#### Option B: Deploy to Netlify

1. **Via Netlify Dashboard**:
   - Go to [netlify.com](https://netlify.com)
   - Click **"Add new site"** → **"Import an existing project"**
   - Connect your repository
   - Configure:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - Add environment variables in **Site settings** → **Environment variables**
   - Click **"Deploy site"**

2. **Via Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

#### Option C: Deploy to Other Platforms

The `dist/` folder can be deployed to any static hosting service:
- GitHub Pages
- AWS S3 + CloudFront
- Azure Static Web Apps
- Firebase Hosting
- etc.

---

## 🔗 Connecting Frontend to Backend

### Update Frontend Environment Variables

After deploying the backend, update your frontend `.env` file:

```env
# Use your backend deployment URL
VITE_API_URL=https://vercel_agents_canvas_bkend.vercel.app/api

# Enable backend API
VITE_USE_BACKEND_API=true
```

**Note**: 
- If `VITE_API_URL` is empty or not set, the frontend will use `/api` (relative path)
- If `VITE_USE_BACKEND_API=false`, the app will use demo mode (no real AI)

### API Endpoint Structure

The frontend automatically constructs endpoints:
- Base URL: `VITE_API_URL` (or `/api` if not set)
- Chat endpoint: `${VITE_API_URL}/chat`
- Chat with tools: `${VITE_API_URL}/chat-with-tools`
- Workspace agent: `${VITE_API_URL}/workspace-agent`

---

## ✅ Verification

### Test Backend

```bash
# Test basic chat
curl -X POST https://vercel_agents_canvas_bkend.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello!"}]}'

# Test workspace agent
curl -X POST https://vercel_agents_canvas_bkend.vercel.app/api/workspace-agent \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What is the assignment?"}],"assignment":{"name":"Test Assignment","course":"CS101","description":"Test description"}}'
```

### Test Frontend

1. Open your deployed frontend URL
2. Try the chat interface
3. Check browser console for any errors
4. Verify API calls are going to your backend URL

---

## 🆘 Troubleshooting

### Backend Issues

#### "OpenAI API key not configured"
- **Solution**: Go to Vercel Dashboard → Your Project → Settings → Environment Variables → Add `OPENAI_API_KEY`
- Make sure it's set for all environments (Production, Preview, Development)

#### 404 Error on API endpoints
- **Solution**: 
  - Check that `api/chat.ts` exists in your backend repo
  - Verify files are in `api/` directory (not `src/api/`)
  - Check `vercel.json` configuration

#### CORS Errors
- **Solution**: The backend already includes CORS headers. If you see CORS errors:
  - Check that your frontend URL is allowed
  - Verify the backend is returning proper CORS headers

#### Deployment fails
- **Solution**:
  - Check Vercel deployment logs
  - Verify `package.json` has correct dependencies
  - Make sure `npm install` works locally
  - Check TypeScript compilation errors

### Frontend Issues

#### "API request failed"
- **Solution**:
  - Verify `VITE_API_URL` is set correctly in `.env`
  - Check that backend is deployed and accessible
  - Verify `VITE_USE_BACKEND_API=true`
  - Check browser console for detailed error messages

#### Environment variables not working
- **Solution**:
  - Environment variables must start with `VITE_` to be exposed to the frontend
  - Rebuild the app after changing `.env` file (`npm run build`)
  - For Vercel/Netlify, add variables in their dashboards, not just `.env`

#### Chat not responding
- **Solution**:
  - Check browser console for errors
  - Verify backend is accessible
  - Check network tab to see if API calls are being made
  - Verify `VITE_USE_BACKEND_API=true`

### Common Issues

#### Backend and Frontend on different domains
- **Solution**: This is fine! Just make sure:
  - `VITE_API_URL` points to your backend URL
  - Backend has CORS enabled (already configured)
  - Both are deployed and accessible

#### Local development
- **Solution**: For local development:
  - Backend: Use `vercel dev` in backend directory
  - Frontend: Use `npm run dev`
  - Set `VITE_API_URL=http://localhost:3000/api` (or your Vercel dev port)

---

## 📝 Quick Reference

### Backend URLs
- **Production**: `https://vercel_agents_canvas_bkend.vercel.app`
- **API Base**: `https://vercel_agents_canvas_bkend.vercel.app/api`

### Environment Variables

**Backend (Vercel)**:
- `OPENAI_API_KEY` - Your OpenAI API key

**Frontend**:
- `VITE_API_URL` - Backend API URL
- `VITE_USE_BACKEND_API` - Enable/disable backend (true/false)
- `VITE_APP_NAME` - App name
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth (optional)
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe key (optional)
- `VITE_CANVAS_API_URL` - Canvas API URL (optional)

### Deployment Commands

**Backend**:
```bash
cd vercel_agents_canvas_bkend
npm install
vercel --prod
```

**Frontend**:
```bash
npm install
npm run build
vercel --prod  # or deploy dist/ folder to your hosting service
```

---

## 🎉 Success Checklist

- [ ] Backend deployed to Vercel
- [ ] `OPENAI_API_KEY` set in Vercel environment variables
- [ ] Backend API endpoints responding correctly
- [ ] Frontend deployed
- [ ] `VITE_API_URL` configured in frontend
- [ ] `VITE_USE_BACKEND_API=true` set
- [ ] Chat interface working
- [ ] No console errors
- [ ] API calls going to backend

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

**Need Help?** Check the troubleshooting section or review the backend-specific guides in `backend/` folder.



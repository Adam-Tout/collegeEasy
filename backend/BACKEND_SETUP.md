# Backend Setup Guide for Separate Vercel Project

Since you've created a separate backend project (`vercel_agents_canvas_bkend`), here's how to set it up.

## Step 1: Clone and Set Up the Backend Repo

```bash
# Clone your backend repo
git clone https://github.com/Adam-Tout/vercel_agents_canvas_bkend.git
cd vercel_agents_canvas_bkend
```

## Step 2: Copy These Files to Your Backend Repo

You need to copy these files from your current project to the backend repo:

1. `api/chat.ts` - The API endpoint
2. `package.json` - With backend dependencies
3. `tsconfig.json` - TypeScript config
4. `vercel.json` - Vercel configuration

## Step 3: Update Frontend to Point to Backend

Once deployed, update your frontend `.env` file:
```
VITE_API_URL=https://vercel_agents_canvas_bkend.vercel.app/api/chat
```

## Quick Setup Script

Run this in your backend repo directory after cloning:

```bash
# Initialize npm
npm init -y

# Install dependencies
npm install openai @vercel/node

# Install dev dependencies
npm install -D typescript @types/node

# Create the api directory and copy chat.ts
mkdir api
# (Then copy api/chat.ts from current project)
```


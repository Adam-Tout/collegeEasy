# 🔑 Where to Add OpenAI API Key in Vercel Dashboard

## Step-by-Step Guide

### 1. Go to Vercel Dashboard
- Visit: [https://vercel.com](https://vercel.com)
- Sign in with your account

### 2. Select Your Project
- Click on your project: **`vercel_agents_canvas_bkend`**
- Or if it's not deployed yet, you'll add it during import

### 3. Navigate to Settings
- In your project dashboard, click **"Settings"** in the top navigation
- Or go directly: `https://vercel.com/[your-username]/vercel_agents_canvas_bkend/settings`

### 4. Go to Environment Variables
- In the left sidebar, click **"Environment Variables"**
- Or scroll down to the **"Environment Variables"** section

### 5. Add the API Key
- Click the **"Add New"** button (or **"Add"** button)
- Fill in the form:
  - **Key**: `OPENAI_API_KEY`
  - **Value**: Your OpenAI API key (starts with `sk-`)
  - **Environments**: Check **ALL THREE** boxes:
    - ✅ **Production**
    - ✅ **Preview**
    - ✅ **Development**

### 6. Save
- Click **"Save"** button
- The environment variable is now saved

### 7. Redeploy (if already deployed)
- If your project is already deployed, you need to redeploy for the env var to take effect
- Go to **"Deployments"** tab
- Click the **"..."** menu on the latest deployment
- Click **"Redeploy"**
- Or just push a new commit to trigger auto-deployment

## 📸 Visual Guide

```
Vercel Dashboard
├── Your Projects
│   └── vercel_agents_canvas_bkend
│       ├── Overview
│       ├── Deployments
│       ├── Settings  ← Click here
│       │   ├── General
│       │   ├── Environment Variables  ← Click here
│       │   ├── Git
│       │   └── ...
│       └── ...
```

## 🔍 Quick Access URL

If your project is already set up, go directly to:
```
https://vercel.com/[your-username]/vercel_agents_canvas_bkend/settings/environment-variables
```

Replace `[your-username]` with your Vercel username/team name.

## ⚠️ Important Notes

1. **Never commit API keys to Git** - Always use environment variables
2. **Select all environments** - Production, Preview, and Development
3. **Redeploy after adding** - Environment variables only apply to new deployments
4. **Keep it secret** - The API key should never be exposed in frontend code

## ✅ Verification

After adding the key and redeploying, test your API:
```bash
curl -X POST https://vercel_agents_canvas_bkend.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"messages\":[{\"role\":\"user\",\"content\":\"Test\"}]}"
```

If you get an AI response (not an error about missing API key), you're all set! 🎉


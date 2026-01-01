# Deployment Guide: Secure AI Backend with Vercel

This guide will walk you through deploying your AI assistant with a secure backend API using Vercel serverless functions.

## 🎯 Why This Approach?

**Before (Insecure):**
- OpenAI API key stored in frontend code
- Exposed to anyone who inspects your website
- Security risk and potential cost abuse

**After (Secure):**
- API key stored securely on Vercel server
- Never exposed to frontend
- Rate limiting and security controls possible
- Professional production-ready setup

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier is sufficient)
2. **OpenAI API Key**: Get one from [platform.openai.com](https://platform.openai.com/api-keys)
3. **Node.js 18+**: Already installed for development
4. **Git Repository**: Your code should be in a Git repo (GitHub, GitLab, or Bitbucket)

## 🚀 Step-by-Step Deployment

### Step 1: Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

This allows you to test the deployment locally before pushing to production.

### Step 2: Test Locally with Vercel Dev

First, install the Vercel Node.js dependency:

```bash
npm install
```

Then test your API locally:

```bash
vercel dev
```

This will:
- Start a local server that mimics Vercel's production environment
- Allow you to test the `/api/chat` endpoint
- Show any errors before deploying

**Note**: You'll need to set environment variables. Create a `.env.local` file:

```env
OPENAI_API_KEY=sk-your-actual-key-here
```

### Step 3: Deploy to Vercel

#### Option A: Using Vercel CLI

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? **No** (first time)
   - Project name? **Enter a name** (e.g., `canvas-ai-assistant`)
   - Directory? **Press Enter** (current directory)
   - Override settings? **No**

3. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

#### Option B: Using Vercel Dashboard (Recommended for First Time)

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "Add New Project"**
3. **Import your Git repository**:
   - Connect GitHub/GitLab/Bitbucket
   - Select your repository
   - Click "Import"

4. **Configure Project**:
   - Framework Preset: **Vite**
   - Root Directory: **./** (default)
   - Build Command: **npm run build**
   - Output Directory: **dist**
   - Install Command: **npm install**

5. **Add Environment Variables**:
   - Go to **Settings** → **Environment Variables**
   - Add: `OPENAI_API_KEY` = `sk-your-actual-key-here`
   - Select environments: **Production, Preview, Development**
   - Click **Save**

6. **Deploy**:
   - Click **Deploy**
   - Wait for build to complete (2-3 minutes)

### Step 4: Update Frontend Environment Variables

After deployment, Vercel will give you a URL like: `https://your-app.vercel.app`

1. **Update your `.env` file** (for local development):
   ```env
   VITE_API_URL=https://your-app.vercel.app/api/chat
   VITE_USE_BACKEND_API=true
   ```

2. **Or update in Vercel Dashboard**:
   - Go to **Settings** → **Environment Variables**
   - Add: `VITE_API_URL` = `https://your-app.vercel.app/api/chat`
   - This will be used in production builds

### Step 5: Verify Deployment

1. **Test the API endpoint directly**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/chat \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"Hello!"}]}'
   ```

2. **Test in your app**:
   - Open your deployed app
   - Try sending a message in the chat interface
   - Check browser console for API logs

## 🔧 Configuration Details

### Environment Variables

#### In Vercel Dashboard (Server-Side):
- `OPENAI_API_KEY`: Your OpenAI API key (never exposed to frontend)

#### In `.env` file (Client-Side):
- `VITE_API_URL`: Your Vercel API endpoint (defaults to `/api/chat` for relative paths)
- `VITE_USE_BACKEND_API`: Set to `false` to disable API and use demo mode

### API Endpoint Structure

- **Development**: `/api/chat` (relative, works with `vercel dev`)
- **Production**: `https://your-app.vercel.app/api/chat` (absolute URL)

### Model Configuration

The API uses `gpt-4o-mini` by default. To change it, edit `api/chat.ts`:

```typescript
const { messages, model = 'gpt-4o-mini', ... } = req.body;
```

Or pass it from the frontend in `aiService.ts`:

```typescript
body: JSON.stringify({
  messages: this.messages,
  model: 'gpt-4', // Change model here
  ...
})
```

## 🐛 Troubleshooting

### Issue: "OpenAI API key not configured"

**Solution**: Make sure you've added `OPENAI_API_KEY` in Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add `OPENAI_API_KEY` with your key
3. Redeploy the project

### Issue: CORS errors in browser

**Solution**: The API already includes CORS headers. If you still see errors:
1. Check that your frontend URL matches the allowed origin
2. Update CORS headers in `api/chat.ts` if needed

### Issue: API returns 404

**Solution**: 
1. Check that `vercel.json` is in the root directory
2. Verify the route is `/api/chat` (not `/api/chat.ts`)
3. Make sure the file is at `api/chat.ts` (not `src/api/chat.ts`)

### Issue: Slow responses

**Solution**: 
- This is normal for AI API calls (1-3 seconds)
- Consider using a faster model like `gpt-4o-mini` (already default)
- Check Vercel function logs for any errors

### Issue: Local development not working

**Solution**:
1. Make sure you're running `vercel dev` (not `npm run dev`)
2. Or set `VITE_API_URL` to your production URL in `.env`
3. Install dependencies: `npm install`

## 🔒 Security Best Practices

1. **Never commit API keys**: 
   - Use `.gitignore` to exclude `.env` files
   - Only store keys in Vercel dashboard

2. **Use environment-specific keys**:
   - Different keys for development/production
   - Rotate keys regularly

3. **Monitor usage**:
   - Check OpenAI dashboard for API usage
   - Set up billing alerts

4. **Rate limiting** (Future enhancement):
   - Add rate limiting in `api/chat.ts`
   - Use Vercel's built-in rate limiting

## 📊 Monitoring

### Vercel Dashboard
- View function logs: **Deployments** → Click deployment → **Functions** tab
- Monitor performance: **Analytics** tab
- Check errors: **Logs** tab

### OpenAI Dashboard
- Monitor API usage: [platform.openai.com/usage](https://platform.openai.com/usage)
- Set spending limits: **Settings** → **Billing** → **Limits**

## 🎉 Next Steps

1. **Custom Domain**: Add a custom domain in Vercel settings
2. **Rate Limiting**: Implement rate limiting for production
3. **Error Tracking**: Add Sentry or similar for error monitoring
4. **Analytics**: Add analytics to track API usage
5. **Caching**: Consider caching common responses

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)

---

**Need Help?** Check the troubleshooting section or open an issue on GitHub.


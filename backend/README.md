# Canvas AI Assistant - Backend API

Secure backend API for Canvas AI Assistant using Vercel serverless functions.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Add `OPENAI_API_KEY` in Vercel dashboard (Settings → Environment Variables)

### 3. Deploy
```bash
vercel --prod
```

Or push to GitHub and Vercel will auto-deploy.

## 📁 Structure

```
backend/
├── api/
│   └── chat.ts          # Main API endpoint
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── vercel.json         # Vercel configuration
└── README.md           # This file
```

## 🔧 API Endpoint

**POST** `/api/chat`

**Request Body:**
```json
{
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "model": "gpt-4o-mini",
  "max_tokens": 500,
  "temperature": 0.7
}
```

**Response:**
```json
{
  "message": "Hello! How can I help you?",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8,
    "total_tokens": 18
  },
  "model": "gpt-4o-mini",
  "finish_reason": "stop"
}
```

## 🔒 Security

- API key stored securely in Vercel environment variables
- Never exposed to frontend
- CORS enabled for browser requests

## 📝 Notes

- Uses OpenAI SDK for API calls
- Serverless function with 30s max duration
- Auto-deploys from GitHub



import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get API key from environment variable (set in Vercel dashboard)
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey.trim() === '') {
      console.error('[API] OpenAI API key not configured');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in Vercel environment variables.' 
      });
    }

    // Initialize OpenAI client using OpenAI SDK
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Get messages from request body
    const { messages, model = 'gpt-4o-mini', max_tokens = 500, temperature = 0.7 } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    console.log('[API] Processing chat request:', {
      messageCount: messages.length,
      model,
      userMessage: messages[messages.length - 1]?.content?.substring(0, 100) || 'N/A'
    });

    // Call OpenAI API using SDK
    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model,
      messages,
      max_tokens,
      temperature,
    });

    const duration = Date.now() - startTime;
    const assistantMessage = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    console.log('[API] OpenAI response received:', {
      duration: `${duration}ms`,
      responseLength: assistantMessage.length,
      usage: completion.usage,
      model: completion.model,
    });

    // Return response with CORS headers
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*').json({
      message: assistantMessage,
      usage: completion.usage,
      model: completion.model,
      finish_reason: completion.choices[0]?.finish_reason,
    });

  } catch (error: any) {
    console.error('[API] Error processing chat request:', {
      message: error?.message,
      status: error?.status,
      type: error?.type,
    });

    // Return error with CORS headers
    return res.status(500).setHeader('Access-Control-Allow-Origin', '*').json({
      error: error?.message || 'Internal server error',
      type: error?.type || 'unknown_error',
    });
  }
}



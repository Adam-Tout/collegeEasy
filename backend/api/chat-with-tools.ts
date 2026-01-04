import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { CANVAS_API_TOOLS, CanvasAPITool } from './canvas-tools';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey.trim() === '') {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured' 
      });
    }

    const openai = new OpenAI({ apiKey });

    const { 
      messages, 
      model = 'gpt-4o-mini', 
      max_tokens = 1000, 
      temperature = 0.7,
      canvasToken,
      canvasDomain,
      useCanvasTools = true
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Convert Canvas API tools to OpenAI function format
    const functions = useCanvasTools ? CANVAS_API_TOOLS.map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.id,
        description: `${tool.name}: ${tool.description}. Example use cases: ${tool.exampleUseCases.join(', ')}`,
        parameters: {
          type: 'object',
          properties: tool.parameters.reduce((acc, param) => {
            acc[param.name] = {
              type: param.type === 'number' ? 'number' : param.type === 'boolean' ? 'boolean' : 'string',
              description: param.description
            };
            if (param.type === 'array') {
              acc[param.name].type = 'array';
              acc[param.name].items = { type: 'string' };
            }
            return acc;
          }, {} as Record<string, any>),
          required: tool.parameters.filter(p => p.required).map(p => p.name)
        }
      }
    })) : [];

    // Add system message with Canvas context if available
    const systemMessages = [];
    if (canvasToken && canvasDomain) {
      systemMessages.push({
        role: 'system',
        content: `You are a Canvas LMS assistant. You have access to Canvas API tools to help students with their courses, assignments, grades, and more. 

Available Canvas API tools: ${CANVAS_API_TOOLS.length} tools covering courses, assignments, submissions, grades, files, announcements, modules, discussions, quizzes, and more.

When a user asks about Canvas data, use the appropriate function to fetch the information. Always explain what you're doing and present the results clearly.`
      });
    }

    const allMessages = [...systemMessages, ...messages];

    console.log('[ChatWithTools] Processing request:', {
      messageCount: allMessages.length,
      functionsCount: functions.length,
      hasCanvasAuth: !!(canvasToken && canvasDomain)
    });

    // Call OpenAI with function calling
    const completion = await openai.chat.completions.create({
      model,
      messages: allMessages as any,
      functions: functions.length > 0 ? functions : undefined,
      function_call: functions.length > 0 ? 'auto' : undefined,
      max_tokens,
      temperature,
    });

    const response = completion.choices[0];

    // If the model wants to call a function
    if (response.message?.function_call && canvasToken && canvasDomain) {
      const functionName = response.message.function_call.name;
      const functionArgs = JSON.parse(response.message.function_call.arguments || '{}');

      console.log('[ChatWithTools] Function call requested:', {
        function: functionName,
        arguments: functionArgs
      });

      // Find the tool
      const tool = CANVAS_API_TOOLS.find(t => t.id === functionName);
      if (!tool) {
        return res.status(400).json({ error: `Function ${functionName} not found` });
      }

      // Execute Canvas API call via canvas-agent endpoint
      // For now, we'll make the call directly here
      const axios = (await import('axios')).default;
      
      // Build endpoint
      let endpoint = tool.endpoint;
      const queryParams: string[] = [];
      
      // Replace path parameters
      for (const param of tool.parameters) {
        if (functionArgs[param.name]) {
          if (['course_id', 'assignment_id', 'user_id', 'file_id', 'module_id', 'topic_id', 'quiz_id'].includes(param.name)) {
            endpoint = endpoint.replace(`{${param.name}}`, functionArgs[param.name]);
          } else if (tool.method === 'GET') {
            if (Array.isArray(functionArgs[param.name])) {
              functionArgs[param.name].forEach((val: any) => {
                queryParams.push(`${param.name}[]=${encodeURIComponent(val)}`);
              });
            } else {
              queryParams.push(`${param.name}=${encodeURIComponent(functionArgs[param.name])}`);
            }
          }
        }
      }

      const baseURL = `https://${canvasDomain}/api/v1`;
      const url = `${baseURL}${endpoint}${queryParams.length > 0 ? '?' + queryParams.join('&') : ''}`;

      try {
        // Make Canvas API request
        const canvasResponse = await axios({
          method: tool.method,
          url,
          headers: {
            'Authorization': `Bearer ${canvasToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        // Add function result to messages and get final response
        const functionMessages = [
          ...allMessages,
          {
            role: 'assistant' as const,
            content: null,
            function_call: response.message.function_call
          },
          {
            role: 'function' as const,
            name: functionName,
            content: JSON.stringify(canvasResponse.data)
          }
        ];

        const finalCompletion = await openai.chat.completions.create({
          model,
          messages: functionMessages as any,
          functions,
          function_call: 'auto',
          max_tokens,
          temperature,
        });

        return res.status(200).setHeader('Access-Control-Allow-Origin', '*').json({
          message: finalCompletion.choices[0].message.content,
          functionUsed: {
            name: tool.name,
            endpoint: url
          },
          canvasData: canvasResponse.data,
          usage: finalCompletion.usage
        });

      } catch (canvasError: any) {
        console.error('[ChatWithTools] Canvas API error:', canvasError.response?.data || canvasError.message);
        
        // Return error to user via AI
        const errorMessages = [
          ...allMessages,
          {
            role: 'assistant' as const,
            content: null,
            function_call: response.message.function_call
          },
          {
            role: 'function' as const,
            name: functionName,
            content: JSON.stringify({ 
              error: canvasError.response?.data?.errors?.[0]?.message || canvasError.message || 'Failed to fetch Canvas data'
            })
          }
        ];

        const errorCompletion = await openai.chat.completions.create({
          model,
          messages: errorMessages as any,
          max_tokens,
          temperature,
        });

        return res.status(200).setHeader('Access-Control-Allow-Origin', '*').json({
          message: errorCompletion.choices[0].message.content,
          error: true
        });
      }
    }

    // No function call - return regular response
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*').json({
      message: response.message?.content || 'Sorry, I could not generate a response.',
      usage: completion.usage
    });

  } catch (error: any) {
    console.error('[ChatWithTools] Error:', error);
    return res.status(500).setHeader('Access-Control-Allow-Origin', '*').json({
      error: error?.message || 'Internal server error'
    });
  }
}



import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Workspace agent - specialized for assignment work
// Does NOT use Canvas API tools - focused on writing and coding assistance

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      .json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).setHeader('Access-Control-Allow-Origin', '*').json({ error: 'Method not allowed' });
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
      max_tokens = 2000, 
      temperature = 0.7,
      assignment,
      currentMode,
      currentLanguage
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Define workspace-specific functions for writing and mode switching
    const functions = [
      {
        type: 'function' as const,
        function: {
          name: 'write_document',
          description: 'Write actual text content directly into the document editor. Use this when the user asks you to write an essay, paper, paragraph, introduction, or any text content. You MUST write the actual content - not just describe what to write.',
          parameters: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
                description: 'The actual text content to write into the document editor. Write complete, well-formed content - not just descriptions.'
              }
            },
            required: ['content']
          }
        }
      },
      {
        type: 'function' as const,
        function: {
          name: 'write_code',
          description: 'CRITICAL FUNCTION: Write actual, complete code directly into the code editor. You MUST use this function when the user says: "write code", "code this", "implement", "create code", "do the assignment", "help me code", "get started", "code it out", or any request to write/produce code. Write COMPLETE, WORKING code - not descriptions, not pseudocode, not explanations of what to write. The actual code. Look at the assignment description to determine the correct language. Automatically switches to code mode if needed.',
          parameters: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
                description: 'The complete, actual code to write. Must be valid, runnable code - not descriptions or pseudocode. Include all necessary imports, functions, classes, etc.'
              },
              language: {
                type: 'string',
                description: 'Programming language: javascript (for TypeScript/React/JS), python, or cpp',
                enum: ['javascript', 'python', 'cpp']
              }
            },
            required: ['content', 'language']
          }
        }
      },
      {
        type: 'function' as const,
        function: {
          name: 'switch_to_document',
          description: 'Switch the editor to document mode for writing essays and papers.',
          parameters: {
            type: 'object',
            properties: {},
            required: []
          }
        }
      },
      {
        type: 'function' as const,
        function: {
          name: 'switch_to_code',
          description: 'Switch the editor to code mode for writing code. Optionally specify the programming language.',
          parameters: {
            type: 'object',
            properties: {
              language: {
                type: 'string',
                description: 'Programming language to use: javascript, python, or cpp',
                enum: ['javascript', 'python', 'cpp']
              }
            },
            required: []
          }
        }
      }
    ];

    // Use messages as-is - system message should already be included from frontend
    // If no system message exists, add one with assignment context
    const hasSystemMessage = messages.some(m => m.role === 'system');
    const allMessages = [...messages];
    
    if (!hasSystemMessage && assignment) {
      // Fallback: add system message if frontend didn't provide one
      allMessages.unshift({
        role: 'system',
        content: `You are helping a student with assignment: "${assignment.name}" in ${assignment.course}. ${assignment.description ? `Assignment description: ${assignment.description}` : ''} ${assignment.dueDate ? `Due: ${assignment.dueDate}` : ''} ${assignment.points ? `Worth ${assignment.points} points` : ''}. Current editor mode: ${currentMode || 'document'}. ${currentLanguage ? `Current language: ${currentLanguage}` : ''}\n\nIMPORTANT: When asked to write code, you MUST use the write_code function. When asked to write text, you MUST use the write_document function.`
      });
    }
    
    console.log('[WorkspaceAgent Backend] Received FULL conversation:', {
      totalMessages: allMessages.length,
      systemMessages: allMessages.filter(m => m.role === 'system').length,
      userMessages: allMessages.filter(m => m.role === 'user').length,
      assistantMessages: allMessages.filter(m => m.role === 'assistant').length,
      hasAssignment: !!assignment,
      fullConversation: allMessages.map((m, idx) => `${idx + 1}. [${m.role}]: ${m.content.substring(0, 100)}${m.content.length > 100 ? '...' : ''}`)
    });

    // CRITICAL: Verify we're sending the full conversation to OpenAI
    // allMessages should be: [system, user1, assistant1, user2, assistant2, ...]
    console.log('[WorkspaceAgent Backend] Sending to OpenAI - Full conversation context:', {
      messageCount: allMessages.length,
      conversationFlow: allMessages.map((m, idx) => `${idx + 1}.${m.role}`).join(' -> ')
    });

    // Call OpenAI with function calling - sending FULL conversation history
    console.log('[WorkspaceAgent Backend] ========================================');
    console.log('[WorkspaceAgent Backend] 📤 SENDING TO OPENAI:');
    console.log('[WorkspaceAgent Backend] Total messages:', allMessages.length);
    console.log('[WorkspaceAgent Backend] Message breakdown:');
    allMessages.forEach((m, idx) => {
      const preview = m.content.substring(0, 150);
      console.log(`  ${idx + 1}. [${m.role.toUpperCase()}]: ${preview}${m.content.length > 150 ? '...' : ''}`);
    });
    console.log('[WorkspaceAgent Backend] ========================================');
    
    const completion = await openai.chat.completions.create({
      model,
      messages: allMessages as any, // This includes system + full conversation history
      functions: functions.length > 0 ? (functions as any) : undefined,
      function_call: functions.length > 0 ? 'auto' : undefined,
      max_tokens,
      temperature,
    });

    const response = completion.choices[0];
    
    console.log('[WorkspaceAgent Backend] ========================================');
    console.log('[WorkspaceAgent Backend] 📥 RESPONSE FROM OPENAI:');
    console.log('[WorkspaceAgent Backend] Has function call:', !!response.message?.function_call);
    console.log('[WorkspaceAgent Backend] Response content:', response.message?.content?.substring(0, 200) || 'null');
    console.log('[WorkspaceAgent Backend] ========================================');

    // If the model wants to call a function
    if (response.message?.function_call) {
      const functionName = response.message.function_call.name;
      const functionArgs = JSON.parse(response.message.function_call.arguments || '{}');

      console.log('[WorkspaceAgent] Function call:', {
        function: functionName,
        arguments: functionArgs
      });

      // Map function calls to actions
      let action: any = null;

      if (functionName === 'write_document') {
        action = {
          type: 'write_document',
          content: functionArgs.content
        };
      } else if (functionName === 'write_code') {
        action = {
          type: 'write_code',
          content: functionArgs.content,
          language: functionArgs.language || currentLanguage || 'javascript'
        };
      } else if (functionName === 'switch_to_document') {
        action = {
          type: 'switch_to_document'
        };
      } else if (functionName === 'switch_to_code') {
        action = {
          type: 'switch_to_code',
          language: functionArgs.language || currentLanguage || 'javascript'
        };
      }

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
          content: JSON.stringify({ success: true, action })
        }
      ];

      const finalCompletion = await openai.chat.completions.create({
        model,
        messages: functionMessages as any,
        functions: functions.length > 0 ? (functions as any) : undefined,
        function_call: functions.length > 0 ? 'auto' : undefined,
        max_tokens,
        temperature,
      });

      const finalMessage = finalCompletion.choices[0].message?.content || 'Done!';

      return res.status(200)
        .setHeader('Access-Control-Allow-Origin', '*')
        .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        .json({
          message: finalMessage,
          action: action
        });
    }

    // No function call - return regular response
    const finalMessage = response.message?.content || 'Sorry, I could not generate a response.';
    
    console.log('[WorkspaceAgent Backend] ========================================');
    console.log('[WorkspaceAgent Backend] ✅ RETURNING RESPONSE (no function call):');
    console.log('[WorkspaceAgent Backend] Message:', finalMessage.substring(0, 300) + (finalMessage.length > 300 ? '...' : ''));
    console.log('[WorkspaceAgent Backend] ========================================');
    
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      .json({
        message: finalMessage,
        usage: completion.usage
      });

  } catch (error: any) {
    console.error('[WorkspaceAgent] Error:', error);
    return res.status(500)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      .json({
        error: error?.message || 'Internal server error'
      });
  }
}


import { demoCourses, getDemoAssignments } from '../data/demoData';

// Workspace-specific AI service - focused only on assignment work
// Does NOT use Canvas API tools - only assignment context

const BASE_API_URL = import.meta.env.VITE_API_URL || '/api';
const API_URL = BASE_API_URL.endsWith('/workspace-agent') ? BASE_API_URL : `${BASE_API_URL}/workspace-agent`;
const USE_BACKEND_API = import.meta.env.VITE_USE_BACKEND_API !== 'false';

// Log API configuration on load
console.log('[WorkspaceAgent] API Configuration:', {
  BASE_API_URL,
  API_URL,
  USE_BACKEND_API,
  envVITE_API_URL: import.meta.env.VITE_API_URL
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AssignmentInfo {
  name: string;
  course: string;
  description: string;
  dueDate?: string;
  points?: number;
  submissionStatus?: string;
}

type WorkspaceContext = {
  assignment?: AssignmentInfo;
  workInProgress?: string;
  currentMode?: 'document' | 'code';
  currentLanguage?: string;
};

export interface WorkspaceAgentResponse {
  message: string;
  action?: {
    type: 'write_document' | 'write_code' | 'switch_to_document' | 'switch_to_code';
    content?: string;
    language?: string;
  };
}

export class WorkspaceAgentService {
  private messages: ChatMessage[] = [];
  private context: WorkspaceContext = {};

  constructor() {
    // Start with empty messages - system message will be built dynamically with context
    this.messages = [];
  }

  setContext(ctx: WorkspaceContext) {
    this.context = ctx || {};
  }

  hydrateMessages(history: ChatMessage[]) {
    // Only keep user and assistant messages - system message will be built dynamically
    // IMPORTANT: Preserve the order of messages to maintain conversation context
    const filtered = Array.isArray(history)
      ? history.filter(m => m.role === 'user' || m.role === 'assistant')
      : [];
    this.messages = filtered;
    console.log('[WorkspaceAgent] Hydrated messages:', {
      count: this.messages.length,
      messages: this.messages.map(m => `${m.role}: ${m.content.substring(0, 50)}...`)
    });
  }

  private buildSystemMessage(): string {
    let systemContent = `You are a specialized writing and coding assistant helping a student complete their assignment. You are conversational, helpful, and proactive. You remember the entire conversation history and respond contextually.

CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. CONVERSATION MEMORY: You have access to the full conversation history. Use it! Reference previous messages, remember what the user asked, and have natural conversations. Don't repeat the same response.

2. WRITING CODE: When the user asks you to:
   - "write code", "code this", "implement", "create code", "do the assignment", "help me code", "get started"
   - You MUST call the 'write_code' function with ACTUAL, COMPLETE code. Do NOT just describe what to write - WRITE IT!
   - Look at the assignment description to determine the language (Python → 'python', React/TypeScript/JavaScript → 'javascript', C++ → 'cpp')

3. WRITING TEXT: When the user asks you to write essays, paragraphs, documents, or text content, you MUST call 'write_document' with the actual content.

4. CONVERSATION: Have natural, helpful conversations. Answer questions directly. Remember what was discussed. Don't give generic responses.

Your capabilities:
- Write and implement code directly into the code editor (use write_code function)
- Write essays, papers, and documents directly into the document editor (use write_document function)
- Switch between document and code editing modes
- Answer questions about the assignment requirements
- Provide feedback and suggestions on student work
- Debug code and help with programming problems

When to use functions:
- User asks to write code, implement something, create a component, etc. → Use 'write_code' function with the actual code
- User asks to write text, essay, document, paragraph, etc. → Use 'write_document' function with the actual content
- User asks to switch to code mode → Use 'switch_to_code' function
- User asks to switch to document mode → Use 'switch_to_document' function

Be conversational, helpful, and actually write the code/content when asked. Don't just describe what to do - do it!`;

    // Add assignment context
    if (this.context.assignment) {
      const assignment = this.context.assignment;
      systemContent += `\n\n=== ASSIGNMENT INFORMATION ===
Assignment Name: ${assignment.name}
Course: ${assignment.course}
${assignment.dueDate ? `Due Date: ${assignment.dueDate}` : ''}
${typeof assignment.points === 'number' ? `Points: ${assignment.points}` : ''}
${assignment.description ? `\nDescription:\n${assignment.description}\n\nIMPORTANT: When the user asks to "do the assignment" or "complete the assignment", you MUST write the actual code or content based on this description. For example, if the assignment is to build a React component library, write the actual React/TypeScript code using the write_code function.` : 'No description provided.'}`;
    }

    // Add current work-in-progress
    if (this.context.workInProgress && this.context.workInProgress.trim().length > 0) {
      const work = this.context.workInProgress.trim();
      const maxLen = 4000;
      const snippet = work.length > maxLen ? work.slice(0, maxLen) + '\n[...truncated...]' : work;
      systemContent += `\n\n=== STUDENT'S CURRENT WORK ===
${snippet}`;
    }

    systemContent += `\n\n=== CURRENT EDITOR STATE ===
Mode: ${this.context.currentMode || 'document'}
${this.context.currentLanguage ? `Language: ${this.context.currentLanguage}` : ''}

REMEMBER:
- For React, TypeScript, JavaScript, or web development assignments → use language: 'javascript'
- For Python assignments → use language: 'python'  
- For C++ assignments → use language: 'cpp'
- When user says "do the assignment" or asks you to write code → you MUST call write_code with actual code
- Don't just switch modes - actually write the code/content when asked!`;

    return systemContent;
  }

  async sendMessage(userMessage: string): Promise<WorkspaceAgentResponse> {
    // The user message should already be in this.messages from hydrateMessages
    // Verify it's there, and if not, add it (shouldn't happen but safety check)
    const lastMessage = this.messages[this.messages.length - 1];
    if (!lastMessage || lastMessage.content !== userMessage || lastMessage.role !== 'user') {
      console.warn('[WorkspaceAgent] User message not found in history, adding it');
      this.messages.push({ role: 'user', content: userMessage });
    }
    
    // CRITICAL: Verify we have the full conversation history
    console.log('[WorkspaceAgent] Current message history before sending:', {
      totalMessages: this.messages.length,
      messages: this.messages.map((m, idx) => `${idx + 1}. [${m.role}]: ${m.content.substring(0, 80)}${m.content.length > 80 ? '...' : ''}`)
    });

    console.log('[WorkspaceAgent] ========================================');
    console.log('[WorkspaceAgent] USE_BACKEND_API:', USE_BACKEND_API);
    console.log('[WorkspaceAgent] API_URL:', API_URL);
    
    if (!USE_BACKEND_API) {
      console.warn('[WorkspaceAgent] ⚠️ BACKEND API DISABLED - Using demo mode');
      return this.generateDemoResponse(userMessage);
    }

    try {
      // Build messages array with system message at the start
      const systemMessage = this.buildSystemMessage();
      // Use ALL messages (user and assistant) - they should already be in order from hydrateMessages
      // CRITICAL: Send the FULL conversation history in order
      const conversationHistory = this.messages.filter(m => m.role === 'user' || m.role === 'assistant');
      const messagesToSend = [
        { role: 'system' as const, content: systemMessage },
        ...conversationHistory
      ];
      
      console.log('[WorkspaceAgent] ========================================');
      console.log('[WorkspaceAgent] 📤 SENDING TO BACKEND:');
      console.log('[WorkspaceAgent] System message length:', systemMessage.length);
      console.log('[WorkspaceAgent] Conversation history count:', conversationHistory.length);
      console.log('[WorkspaceAgent] Total messages to send:', messagesToSend.length);
      console.log('[WorkspaceAgent] Full conversation history:');
      conversationHistory.forEach((m, idx) => {
        console.log(`  ${idx + 1}. [${m.role.toUpperCase()}]: ${m.content.substring(0, 150)}${m.content.length > 150 ? '...' : ''}`);
      });
      console.log('[WorkspaceAgent] ========================================');
      
      const requestBody = {
        messages: messagesToSend,
        model: 'gpt-4o-mini',
        max_tokens: 2000,
        temperature: 0.7,
        assignment: this.context.assignment,
        currentMode: this.context.currentMode,
        currentLanguage: this.context.currentLanguage,
      };
      
      console.log('[WorkspaceAgent] Request body (JSON):', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('[WorkspaceAgent] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error' };
        }
        console.error('[WorkspaceAgent] API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.message || 'Sorry, I could not generate a response.';
      
      console.log('[WorkspaceAgent] Response received:', {
        messageLength: assistantMessage.length,
        hasAction: !!data.action
      });
      
      // Add assistant response to conversation history
      this.messages.push({ role: 'assistant', content: assistantMessage });
      
      return {
        message: assistantMessage,
        action: data.action || undefined
      };
    } catch (error: any) {
      console.error('[WorkspaceAgent] Error:', error);
      console.error('[WorkspaceAgent] Falling back to demo response');
      // Don't add to messages if there was an error - let the UI handle it
      return this.generateDemoResponse(userMessage);
    }
  }

  private generateDemoResponse(userMessage: string): WorkspaceAgentResponse {
    console.warn('[WorkspaceAgent] ⚠️ Using DEMO response - Backend API is disabled!');
    const message = userMessage.toLowerCase();
    
    // Answer questions about the assignment
    if (message.includes('what is') || message.includes('assignment') || message.includes('describe') || message.includes('tell me about')) {
      if (this.context.assignment) {
        const assignment = this.context.assignment;
        let response = `The assignment is "${assignment.name}" from ${assignment.course}.`;
        if (assignment.description) {
          response += `\n\nDescription: ${assignment.description}`;
        }
        if (assignment.dueDate) {
          response += `\n\nDue Date: ${assignment.dueDate}`;
        }
        if (typeof assignment.points === 'number') {
          response += `\n\nPoints: ${assignment.points}`;
        }
        return { message: response };
      } else {
        return { message: 'I don\'t have information about the current assignment. Please make sure you\'re working on an assignment.' };
      }
    }
    
    if (message.includes('write') || message.includes('help me write') || message.includes('create')) {
      if (message.includes('code') || message.includes('function') || message.includes('program')) {
        return {
          message: 'I can help you write code! In demo mode, I would switch to code editor and write the code for you. Try asking: "Write a function to calculate the factorial"',
          action: {
            type: 'switch_to_code',
            language: 'javascript'
          }
        };
      } else {
        return {
          message: 'I can help you write! In demo mode, I would write content into the document editor. Try asking: "Write an introduction paragraph"',
          action: {
            type: 'write_document',
            content: 'This is a demo response. In production, I would write your requested content here.'
          }
        };
      }
    }

    // For any other message, provide a helpful response based on assignment
    if (this.context.assignment) {
      const assignment = this.context.assignment;
      if (assignment.description && assignment.description.toLowerCase().includes('component')) {
        return {
          message: `I can help you build the "${assignment.name}" assignment! Based on the description, this involves creating React components. Would you like me to start writing the code? I can create the component library with TypeScript and Storybook setup.`
        };
      }
      return {
        message: `I'm ready to help you with "${assignment.name}". Based on the assignment description, I can write the code or content you need. What would you like me to start with?`
      };
    }

    return {
      message: 'I\'m ready to help! What would you like me to write or work on?'
    };
  }

  clearChat() {
    // Clear conversation history - system message will be built dynamically
    this.messages = [];
  }
}


import { demoCourses, getDemoAssignments } from '../data/demoData';

// Get API endpoint from environment variable or use default
// In production, this should point to your cloud API endpoint (Lambda, etc.)
// In development, set VITE_USE_BACKEND_API=false for demo mode
const BASE_API_URL = import.meta.env.VITE_API_URL || '/api';
const API_URL = BASE_API_URL.endsWith('/chat') ? BASE_API_URL : `${BASE_API_URL}/chat`;
const API_URL_WITH_TOOLS = BASE_API_URL.endsWith('/chat-with-tools') ? BASE_API_URL : `${BASE_API_URL}/chat-with-tools`;
const USE_BACKEND_API = import.meta.env.VITE_USE_BACKEND_API !== 'false'; // Default to true

// Log API configuration on module load
if (USE_BACKEND_API) {
  console.log('[AIService] Using backend API endpoint:', API_URL);
  console.log('[AIService] API calls will be made to secure backend server');
} else {
  console.warn('[AIService] Backend API disabled - will use demo responses');
  console.warn('[AIService] To enable real AI, ensure backend API is deployed and VITE_USE_BACKEND_API is not set to false');
}

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

type AcademicContext = {
  courses?: { id: number; name: string; course_code: string }[];
  assignments?: AssignmentInfo[];
  currentAssignment?: AssignmentInfo;
  workInProgress?: string;
  // Added: reference document context
  referenceDocumentName?: string;
  referenceDocumentText?: string;
};

export class AIService {
  private messages: ChatMessage[] = [];
  private context: AcademicContext = {};

  constructor() {
    this.messages = [{
      role: 'system',
      content: `You are a helpful Canvas student assistant. You can help students with:
 - Finding information about their assignments, due dates, and courses
 - Explaining assignment instructions and requirements
 - Helping organize their study schedule
 - Providing guidance on how to approach assignments
 - Answering questions about their academic progress
 
Always be encouraging and helpful. If you don't have specific information about an assignment, ask the student to provide more details.`
    }];
  }

  setContext(ctx: AcademicContext) {
    this.context = ctx || {};
  }

  // Hydrate AI conversation with previously saved chat history
  hydrateMessages(history: ChatMessage[]) {
    const systemMsg: ChatMessage = {
      role: 'system',
      content: `You are a helpful Canvas student assistant. You can help students with:
 - Finding information about their assignments, due dates, and courses
 - Explaining assignment instructions and requirements
 - Helping organize their study schedule
 - Providing guidance on how to approach assignments
 - Answering questions about their academic progress
 
Always be encouraging and helpful. If you don't have specific information about an assignment, ask the student to provide more details.`
    };
    // Only keep user/assistant messages from history to avoid duplicate system prompts
    const filtered = Array.isArray(history)
      ? history.filter(m => m.role === 'user' || m.role === 'assistant')
      : [];
    this.messages = [systemMsg, ...filtered];
  }

  async sendMessage(userMessage: string): Promise<string> {
    this.messages.push({ role: 'user', content: userMessage });

    // Add context message summarizing courses and upcoming assignments
    const contextParts: string[] = [];
    const courseList = this.context.courses?.map(c => `${c.name} (${c.course_code})`).join(', ');
    if (courseList) {
      contextParts.push(`Courses: ${courseList}.`);
    }
    const upcoming = this.context.assignments?.filter(a => a.dueDate).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()).slice(0, 5) || [];
    if (upcoming.length > 0) {
      const upcomingStr = upcoming.map(a => `${a.name} in ${a.course} due ${a.dueDate}`).join('; ');
      contextParts.push(`Upcoming assignments: ${upcomingStr}.`);
    }
    if (this.context.currentAssignment) {
      const ca = this.context.currentAssignment;
      contextParts.push(`Current assignment: ${ca.name} (${ca.course})${ca.dueDate ? `, due ${ca.dueDate}` : ''}${typeof ca.points === 'number' ? `, ${ca.points} points` : ''}. Description: ${ca.description || 'No description provided.'}`);
    }
    if (contextParts.length > 0) {
      this.messages.push({ role: 'system', content: contextParts.join(' ') });
    }

    // Include student's current work-in-progress in context so assistant can reference it
    if (this.context.workInProgress && this.context.workInProgress.trim().length > 0) {
      const work = this.context.workInProgress.trim();
      // Limit to avoid extremely long prompts; include full if relatively short
      const maxLen = 4000;
      const snippet = work.length > maxLen ? work.slice(0, maxLen) + '\n[...truncated...]' : work;
      this.messages.push({
        role: 'system',
        content: `Student current work-in-progress content/code:\n${snippet}`
      });
    }

    // Added: include reference document text in context
    if (this.context.referenceDocumentText && this.context.referenceDocumentText.trim().length > 0) {
      const doc = this.context.referenceDocumentText.trim();
      const name = this.context.referenceDocumentName || 'reference document';
      const maxDocLen = 8000; // keep prompt size reasonable
      const docSnippet = doc.length > maxDocLen ? doc.slice(0, maxDocLen) + '\n[...truncated...]' : doc;
      this.messages.push({
        role: 'system',
        content: `Reference document (${name}) content:\n${docSnippet}`
      });
    }

    if (!USE_BACKEND_API) {
      console.log('[AIService] ========================================');
      console.log('[AIService] DEMO MODE - Backend API disabled');
      console.log('[AIService] User message:', userMessage);
      console.log('[AIService] Generating demo response (instant)...');
      const demoResponse = this.generateDemoResponse(userMessage);
      console.log('[AIService] Demo response:', demoResponse);
      console.log('[AIService] ========================================');
      return demoResponse;
    }

    try {
      console.log('[AIService] ========================================');
      console.log('[AIService] REAL API MODE - Making backend API call...');
      
      const startTime = Date.now();
      
      // Get Canvas auth if available
      const canvasAuth = this.getCanvasAuth();
      
      // Use chat-with-tools endpoint if Canvas auth is available, otherwise use regular chat
      const endpoint = canvasAuth ? API_URL_WITH_TOOLS : API_URL;
      
      console.log('[AIService] ========================================');
      console.log('[AIService] 📤 SENDING TO BACKEND:');
      console.log('[AIService] Endpoint:', endpoint);
      console.log('[AIService] Message count:', this.messages.length);
      console.log('[AIService] Full conversation history:');
      this.messages.forEach((m, idx) => {
        console.log(`  ${idx + 1}. [${m.role.toUpperCase()}]: ${m.content.substring(0, 150)}${m.content.length > 150 ? '...' : ''}`);
      });
      console.log('[AIService] ========================================');
      
      // Call backend API instead of OpenAI directly
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: this.messages,
          model: 'gpt-4o-mini', // Using a more standard model name
          max_tokens: 1000, // Increased for function calling responses
          temperature: 0.7,
          useCanvasTools: !!canvasAuth, // Enable Canvas tools if auth available
          canvasToken: canvasAuth?.accessToken,
          canvasDomain: canvasAuth?.domain,
        }),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.message || 'Sorry, I could not generate a response.';
      
      console.log('[AIService] ✅ Backend API response received:');
      console.log('[AIService] Duration:', `${duration}ms`);
      console.log('[AIService] Endpoint used:', endpoint);
      console.log('[AIService] Canvas auth:', canvasAuth ? '✅ Present' : '❌ Not available');
      console.log('[AIService] Function used:', data.functionUsed?.name || 'None');
      console.log('[AIService] Response length:', assistantMessage.length, 'characters');
      console.log('[AIService] Full response:', assistantMessage);
      console.log('[AIService] Usage:', data.usage || 'N/A');
      console.log('[AIService] Model:', data.model || 'N/A');
      console.log('[AIService] Finish reason:', data.finish_reason || 'N/A');
      console.log('[AIService] ========================================');
      
      this.messages.push({ role: 'assistant', content: assistantMessage });
      
      return assistantMessage;
    } catch (error: any) {
      console.error('[AIService] ========================================');
      console.error('[AIService] ❌ Backend API ERROR:');
      console.error('[AIService] Message:', error?.message || 'Unknown error');
      console.error('[AIService] Full error:', error);
      console.error('[AIService] Falling back to demo response due to API error');
      console.error('[AIService] ========================================');
      // Fallback to demo response if API fails
      return this.generateDemoResponse(userMessage);
    }
  }

  private generateDemoResponse(userMessage: string): string {
    console.log('[AIService] Generating demo response for:', userMessage.substring(0, 100));
    const message = userMessage.toLowerCase();

    // If asking about courses or tests/exams
    if (message.includes('course') || message.includes('class')) {
      const courses = this.context.courses || demoCourses.map(c => ({ id: c.id, name: c.name, course_code: c.course_code }));
      return `You're enrolled in these courses this semester:\n\n${courses.map(course => `• ${course.name} (${course.course_code})`).join('\n')}\n\nYou can ask me about upcoming assignments or tests for any course.`;
    }

    if (message.includes('test') || message.includes('exam') || message.includes('quiz')) {
      const assignments = this.context.assignments || getDemoAssignments().map(a => ({
        name: a.name,
        course: demoCourses.find(c => c.id === a.course_id)?.name || `Course ${a.course_id}`,
        dueDate: a.due_at,
        description: a.description,
      }));
      const upcomingTests = assignments.filter(a => /quiz|exam|test/i.test(a.name) || /quiz|exam|test/i.test(a.description || '')).slice(0, 5);
      if (upcomingTests.length === 0) {
        return 'I\'t see any upcoming tests right now. Try asking about assignments or due dates.';
      }
      return `Here are your upcoming tests/exams:\n\n${upcomingTests.map(t => `• ${t.name} (${t.course}) — due ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'TBA'}`).join('\n')}`;
    }
    
    // Provide helpful demo responses based on common questions
    if (message.includes('assignment') || message.includes('due')) {
      const assignments = this.context.assignments || getDemoAssignments().map(a => ({
        name: a.name,
        course: demoCourses.find(c => c.id === a.course_id)?.name || `Course ${a.course_id}`,
        dueDate: a.due_at,
        description: a.description,
      }));
      const upcoming = assignments.filter(a => a.dueDate && new Date(a.dueDate) >= new Date()).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
      
      return `Here are your upcoming assignments:\n\n${upcoming.slice(0, 3).map(a => 
        `• ${a.name} (${a.course}): Due ${a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'TBA'}`
      ).join('\n')}\n\nYou can click on any assignment in your calendar to view details and start working on it.`;
    }

    // If working on a specific assignment, provide tailored help
    if (this.context.currentAssignment) {
      const ca = this.context.currentAssignment;
      const work = (this.context.workInProgress || '').trim();
      const workHint = work ? `\n\nI also see your current work-in-progress. I can help review it or suggest improvements.` : '';
      const docHint = this.context.referenceDocumentText ? `\n\nI also see a reference document attached (${this.context.referenceDocumentName || 'document'}). I can use it to provide more specific help.` : '';
      return `You're working on: ${ca.name} (${ca.course}).${ca.dueDate ? ` Due ${new Date(ca.dueDate).toLocaleDateString()}.` : ''}${workHint}${docHint}`;
    }

    // If a reference document is present, mention it for general queries
    if (this.context.referenceDocumentText) {
      return 'You can ask me questions about your assignment and the attached document. I\'ll use both to assist you.';
    }

    return 'How can I help with your coursework today? You can ask about assignments, tests, study planning, or get help with the work you\'re currently writing/coding.';
  }

  clearChat() {
    this.messages = [{
      role: 'system',
      content: `You are a helpful Canvas student assistant. You can help students with:
- Finding information about their assignments, due dates, and courses
- Explaining assignment instructions and requirements
- Helping organize their study schedule
- Providing guidance on how to approach assignments
- Answering questions about their academic progress
 
Always be encouraging and helpful. If you don't have specific information about an assignment, ask the student to provide more details.`
    }];
  }

  // Get Canvas authentication from localStorage
  private getCanvasAuth(): { accessToken: string; domain: string } | null {
    try {
      const authStr = localStorage.getItem('canvas_auth');
      if (authStr) {
        const auth = JSON.parse(authStr);
        if (auth.accessToken && auth.domain) {
          return auth;
        }
      }
    } catch (e) {
      console.warn('[AIService] Failed to get Canvas auth:', e);
    }
    return null;
  }
}
import OpenAI from 'openai';
import { demoCourses, getDemoAssignments } from '../data/demoData';

// Use environment variable for API key. Never hard-code secrets in source code.
const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
const hasApiKey = apiKey && apiKey.trim() !== '' && apiKey !== 'your_openai_api_key_here';
const openai = hasApiKey ? new OpenAI({
  apiKey: apiKey!,
  dangerouslyAllowBrowser: true,
}) : null;

// Log API key status on module load
if (hasApiKey) {
  console.log('[AIService] OpenAI API key found - API calls will be made to OpenAI');
} else {
  console.warn('[AIService] No valid OpenAI API key found - will use demo responses');
  console.warn('[AIService] To enable real AI, set VITE_OPENAI_API_KEY in your .env file');
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

    if (!openai) {
      console.log('[AIService] ========================================');
      console.log('[AIService] DEMO MODE - No OpenAI API key configured');
      console.log('[AIService] User message:', userMessage);
      console.log('[AIService] Generating demo response (instant)...');
      const demoResponse = this.generateDemoResponse(userMessage);
      console.log('[AIService] Demo response:', demoResponse);
      console.log('[AIService] ========================================');
      return demoResponse;
    }

    try {
      console.log('[AIService] ========================================');
      console.log('[AIService] REAL API MODE - Making OpenAI API call...');
      console.log('[AIService] Request details:', {
        model: 'gpt-4.1-nano-2025-04-14',
        messageCount: this.messages.length,
        userMessage: userMessage.substring(0, 100) + (userMessage.length > 100 ? '...' : ''),
        hasContext: !!this.context.courses || !!this.context.assignments || !!this.context.currentAssignment
      });
      
      const startTime = Date.now();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-nano-2025-04-14',
        messages: this.messages,
        max_tokens: 500,
        temperature: 0.7,
      });
      const duration = Date.now() - startTime;

      const assistantMessage = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      
      console.log('[AIService] ✅ OpenAI API response received:');
      console.log('[AIService] Duration:', `${duration}ms`);
      console.log('[AIService] Response length:', assistantMessage.length, 'characters');
      console.log('[AIService] Full response:', assistantMessage);
      console.log('[AIService] Usage:', completion.usage ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens
      } : 'N/A');
      console.log('[AIService] Model:', completion.model);
      console.log('[AIService] Finish reason:', completion.choices[0]?.finish_reason);
      console.log('[AIService] ========================================');
      
      this.messages.push({ role: 'assistant', content: assistantMessage });
      
      return assistantMessage;
    } catch (error: any) {
      console.error('[AIService] ========================================');
      console.error('[AIService] ❌ OpenAI API ERROR:');
      console.error('[AIService] Message:', error?.message || 'Unknown error');
      console.error('[AIService] Status:', error?.status || error?.response?.status || 'N/A');
      console.error('[AIService] Status Text:', error?.statusText || error?.response?.statusText || 'N/A');
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
}
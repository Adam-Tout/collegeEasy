import OpenAI from 'openai';
import { demoCourses, getDemoAssignments } from '../data/demoData';

// Use environment variable for API key. Never hard-code secrets in source code.
const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
const openai = apiKey ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
}) : null;

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
      return this.generateDemoResponse(userMessage);
    }

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: this.messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const assistantMessage = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      this.messages.push({ role: 'assistant', content: assistantMessage });
      
      return assistantMessage;
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to demo response if API fails
      return this.generateDemoResponse(userMessage);
    }
  }

  private generateDemoResponse(userMessage: string): string {
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
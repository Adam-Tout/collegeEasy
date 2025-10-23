import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, RefreshCw, Paperclip, X } from 'lucide-react';
import { AIService, ChatMessage, AssignmentInfo } from '../services/aiService';
// PDF.js imports for text extraction
import * as pdfjsLib from 'pdfjs-dist';
// Vite: import worker as URL and set GlobalWorkerOptions
// @ts-ignore - vite url import typing
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { useAuthStore } from '../stores/authStore';
import { CanvasService } from '../services/canvasService';

interface ChatInterfaceProps {
  assignments?: AssignmentInfo[];
  courses?: { id: number; name: string; course_code: string }[];
  currentAssignment?: AssignmentInfo;
  workInProgress?: string;
  storageKey?: string;
}

export default function ChatInterface({ assignments = [], courses = [], currentAssignment, workInProgress, storageKey = 'chatMessages' }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiService] = useState(() => new AIService());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { auth } = useAuthStore();

  // New: reference document state
  const [attachedDocName, setAttachedDocName] = useState<string | undefined>(undefined);
  const [attachedDocText, setAttachedDocText] = useState<string | undefined>(undefined);
  const [isParsingDoc, setIsParsingDoc] = useState(false);

  useEffect(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: ChatMessage[] = JSON.parse(saved);
        setMessages(parsed);
        aiService.hydrateMessages(parsed);
      } catch {
        const welcome = { role: 'assistant', content: "Hi! I'm your Canvas assistant. I can help you with your assignments, due dates, and study planning. What would you like to know about your coursework?" } as ChatMessage;
        setMessages([welcome]);
        aiService.hydrateMessages([welcome]);
      }
    } else {
      const welcome = { role: 'assistant', content: "Hi! I'm your Canvas assistant. I can help you with your assignments, due dates, and study planning. What would you like to know about your coursework?" } as ChatMessage;
      setMessages([welcome]);
      aiService.hydrateMessages([welcome]);
    }
    // Restore attached document if present
    const savedDoc = localStorage.getItem(storageKey + ':doc');
    if (savedDoc) {
      try {
        const { name, text } = JSON.parse(savedDoc);
        if (typeof name === 'string' && typeof text === 'string') {
          setAttachedDocName(name);
          setAttachedDocText(text);
        }
      } catch {}
    }
    // Provide academic context to AI, including current assignment, work-in-progress, and attached document
    aiService.setContext({ courses, assignments, currentAssignment, workInProgress, referenceDocumentName: attachedDocName, referenceDocumentText: attachedDocText });
  }, [storageKey]);

  useEffect(() => {
    // Keep AI context updated when courses/assignments/current work or doc change
    aiService.setContext({ courses, assignments, currentAssignment, workInProgress, referenceDocumentName: attachedDocName, referenceDocumentText: attachedDocText });
  }, [courses, assignments, currentAssignment, workInProgress, attachedDocName, attachedDocText, aiService]);

  useEffect(() => {
    // Scroll only within the messages container to avoid affecting surrounding layout
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
    // Persist messages
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  const handleSendMessage = async () => {
    const trimmed = inputMessage.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Intercept queries about exam dates and try fetching syllabus
      const examAnswer = await tryAnswerExamDate(trimmed);
      if (examAnswer) {
        const aiMsg: ChatMessage = { role: 'assistant', content: examAnswer };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const response = await aiService.sendMessage(trimmed);
        const aiMsg: ChatMessage = { role: 'assistant', content: response };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      const aiMsg: ChatMessage = { role: 'assistant', content: 'Sorry, I encountered an error while processing your request. Please try again.' };
      setMessages(prev => [...prev, aiMsg]);
      console.error('AI error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    aiService.clearChat();
    // Re-inject context after clearing
    aiService.setContext({ courses, assignments, currentAssignment, workInProgress, referenceDocumentName: attachedDocName, referenceDocumentText: attachedDocText });
    const welcome = { role: 'assistant', content: "Hi! I'm your Canvas assistant. I can help you with your assignments, due dates, and study planning. What would you like to know about your coursework?" } as ChatMessage;
    setMessages([welcome]);
    localStorage.removeItem(storageKey);
  };

  // Parse text files
  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  // Parse PDF using pdfjs-dist
  const readPdfFile = async (file: File): Promise<string> => {
    // Configure worker URL for pdf.js
    // @ts-ignore
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const maxPages = pdf.numPages;
    let textContent = '';
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = (content.items as any[]).map((item: any) => item.str).filter(Boolean);
      textContent += strings.join(' ') + '\n';
    }
    return textContent;
  };

  const handleAttachDocument = async (file: File) => {
    try {
      setIsParsingDoc(true);
      let text = '';
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        text = await readPdfFile(file);
      } else if (file.type.startsWith('text/') || file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.md')) {
        text = await readTextFile(file);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or plain text/Markdown file.');
      }
      const name = file.name;
      setAttachedDocName(name);
      setAttachedDocText(text);
      // Update AI context
      aiService.setContext({ courses, assignments, currentAssignment, workInProgress, referenceDocumentName: name, referenceDocumentText: text });
      // Persist
      localStorage.setItem(storageKey + ':doc', JSON.stringify({ name, text }));
    } catch (err) {
      console.error('Document parse error:', err);
      const aiMsg: ChatMessage = { role: 'assistant', content: 'I could not read that file. Please upload a PDF or text document.' };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsParsingDoc(false);
    }
  };

  const removeAttachedDocument = () => {
    setAttachedDocName(undefined);
    setAttachedDocText(undefined);
    aiService.setContext({ courses, assignments, currentAssignment, workInProgress, referenceDocumentName: undefined, referenceDocumentText: undefined });
    localStorage.removeItem(storageKey + ':doc');
  };

  // Attempt to detect and answer exam date queries by fetching syllabus
  const tryAnswerExamDate = async (query: string): Promise<string | null> => {
    const q = query.toLowerCase();
    const mentionsExam = /(final|midterm)/.test(q);
    const mentionsClass = /(class|course)/.test(q) || !!courses?.length;
    if (!mentionsExam || !mentionsClass) return null;

    // Extract course hint after 'for' if present
    let courseHint = '';
    const forIdx = q.indexOf(' for ');
    if (forIdx !== -1) {
      courseHint = query.slice(forIdx + 5).trim();
    }
    // Try to match course by name or code
    const findCourse = () => {
      if (!courses || courses.length === 0) return null;
      if (courseHint) {
        const normalized = courseHint.toLowerCase();
        const byName = courses.find(c => c.name.toLowerCase().includes(normalized));
        if (byName) return byName;
        const byCode = courses.find(c => c.course_code.toLowerCase().includes(normalized));
        if (byCode) return byCode;
      }
      // Fallback: if only one course, use it
      if (courses.length === 1) return courses[0];
      return null;
    };

    const course = findCourse();
    if (!course) {
      return null; // Let AI handle follow-up to clarify course
    }

    // Require auth to fetch from Canvas; in demo mode, CanvasService will return sample
    if (!auth) {
      return `I couldn't access Canvas to check the syllabus because you're not connected. Please log in, or upload the syllabus PDF/text here and ask again.`;
    }

    try {
      const service = new CanvasService(auth.accessToken, auth.domain);
      const syllabusText = await service.getCourseSyllabus(course.id);
      if (syllabusText && syllabusText.trim().length > 0) {
        // Update attached document/context for future questions
        setAttachedDocName(`${course.name} Syllabus`);
        setAttachedDocText(syllabusText);
        aiService.setContext({ courses, assignments, currentAssignment, workInProgress, referenceDocumentName: `${course.name} Syllabus`, referenceDocumentText: syllabusText });
        localStorage.setItem(storageKey + ':doc', JSON.stringify({ name: `${course.name} Syllabus`, text: syllabusText }));

        const { midterm, final } = service.findExamDatesFromText(syllabusText);
        const wantsFinal = /final/.test(q);
        const wantsMidterm = /midterm/.test(q);
        if (wantsFinal && final) {
          return `The final for ${course.name} is on ${final} (from the syllabus).`;
        }
        if (wantsMidterm && midterm) {
          return `The midterm for ${course.name} is on ${midterm} (from the syllabus).`;
        }
        if (!wantsFinal && !wantsMidterm) {
          const parts = [] as string[];
          if (midterm) parts.push(`Midterm: ${midterm}`);
          if (final) parts.push(`Final: ${final}`);
          if (parts.length > 0) {
            return `Exam dates for ${course.name} (from the syllabus): ${parts.join('; ')}.`;
          }
        }
        // Syllabus text present but dates not found
        return `I fetched the syllabus for ${course.name}, but I couldn't find exact exam dates in the text. You can upload a PDF version here for deeper parsing or ask the instructor.`;
      }
      // Could not get text (likely PDF/DOC with CORS restrictions)
      return `I couldn't retrieve readable syllabus content for ${course.name}. If you have the syllabus PDF or text, please attach it using "Attach PDF/Text", and I will extract the exam dates.`;
    } catch (err) {
      console.error('Syllabus fetch error:', err);
      return `I tried to check the syllabus for ${course.name}, but ran into an issue. Please attach the syllabus file here, or try again later.`;
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm max-h-[80vh] min-h-[300px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-900">AI Assistant</h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center cursor-pointer">
            <Paperclip className="h-4 w-4 mr-1" /> Attach PDF/Text
            <input
              type="file"
              accept=".pdf,.txt,.md,text/plain,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAttachDocument(file);
                e.currentTarget.value = '';
              }}
            />
          </label>
          <button
            onClick={clearChat}
            className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Reset
          </button>
        </div>
      </div>

      {/* Attached document banner */}
      {attachedDocName && (
        <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-b border-blue-100 text-blue-900 text-xs">
          <div className="flex items-center gap-2">
            <Paperclip className="h-3 w-3" />
            <span>Attached: <strong>{attachedDocName}</strong> {isParsingDoc && '(parsing...)'}</span>
          </div>
          <button onClick={removeAttachedDocument} className="text-blue-700 hover:text-blue-900 flex items-center">
            <X className="h-3 w-3 mr-1" /> Remove
          </button>
        </div>
      )}

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
              <div className="flex items-center space-x-2 mb-1">
                {msg.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
                <span className="text-xs font-medium">{msg.role === 'user' ? 'You' : 'Assistant'}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-3">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Start typing here..."
            className="flex-1 resize-none border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${isLoading ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState, useRef, useEffect } from 'react';
import { Bot, RefreshCw } from 'lucide-react';
import { AIService, ChatMessage, AssignmentInfo } from '../services/aiService';
import { useAuthStore } from '../stores/authStore';
import { CanvasService } from '../services/canvasService';
import ChatMessageComponent from './ChatMessage';
import ChatInput from './ChatInput';
import DocumentAttachment from './DocumentAttachment';

interface ChatInterfaceProps {
  assignments?: AssignmentInfo[];
  courses?: { id: number; name: string; course_code: string }[];
  currentAssignment?: AssignmentInfo;
  workInProgress?: string;
  storageKey?: string;
}

export default function ChatInterface({ 
  assignments = [], 
  courses = [], 
  currentAssignment, 
  workInProgress, 
  storageKey = 'chatMessages' 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiService] = useState(() => new AIService());
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { auth } = useAuthStore();

  // Document attachment state
  const [attachedDocName, setAttachedDocName] = useState<string | undefined>(undefined);
  const [attachedDocText, setAttachedDocText] = useState<string | undefined>(undefined);
  const [isParsingDoc, setIsParsingDoc] = useState(false);

  useEffect(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: ChatMessage[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          aiService.hydrateMessages(parsed);
        } else {
          initializeWelcomeMessage();
        }
      } catch {
        initializeWelcomeMessage();
      }
    } else {
      initializeWelcomeMessage();
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
      } catch {
        // Ignore parsing errors
      }
    }
    
    // Set AI context
    aiService.setContext({ 
      courses, 
      assignments, 
      currentAssignment, 
      workInProgress, 
      referenceDocumentName: attachedDocName, 
      referenceDocumentText: attachedDocText 
    });
  }, [storageKey]);

  useEffect(() => {
    // Keep AI context updated
    aiService.setContext({ 
      courses, 
      assignments, 
      currentAssignment, 
      workInProgress, 
      referenceDocumentName: attachedDocName, 
      referenceDocumentText: attachedDocText 
    });
  }, [courses, assignments, currentAssignment, workInProgress, attachedDocName, attachedDocText, aiService]);

  useEffect(() => {
    // Auto-scroll to bottom
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
    // Persist messages
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  const initializeWelcomeMessage = () => {
    const welcome: ChatMessage = { 
      role: 'assistant', 
      content: "Hi! I'm your Canvas assistant. I can help you with your assignments, due dates, and study planning. What would you like to know about your coursework?" 
    };
    setMessages([welcome]);
    aiService.hydrateMessages([welcome]);
  };

  const handleSendMessage = async (message: string) => {
    const userMsg: ChatMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Try to answer exam date queries by fetching syllabus
      const examAnswer = await tryAnswerExamDate(message);
      if (examAnswer) {
        const aiMsg: ChatMessage = { role: 'assistant', content: examAnswer };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const response = await aiService.sendMessage(message);
        const aiMsg: ChatMessage = { role: 'assistant', content: response };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      const aiMsg: ChatMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while processing your request. Please try again.' 
      };
      setMessages(prev => [...prev, aiMsg]);
      console.error('AI error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    aiService.clearChat();
    aiService.setContext({ 
      courses, 
      assignments, 
      currentAssignment, 
      workInProgress, 
      referenceDocumentName: attachedDocName, 
      referenceDocumentText: attachedDocText 
    });
    initializeWelcomeMessage();
    localStorage.removeItem(storageKey);
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
      aiService.setContext({ 
        courses, 
        assignments, 
        currentAssignment, 
        workInProgress, 
        referenceDocumentName: name, 
        referenceDocumentText: text 
      });
      localStorage.setItem(storageKey + ':doc', JSON.stringify({ name, text }));
    } catch (err) {
      console.error('Document parse error:', err);
      const aiMsg: ChatMessage = { 
        role: 'assistant', 
        content: 'I could not read that file. Please upload a PDF or text document.' 
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsParsingDoc(false);
    }
  };

  const removeAttachedDocument = () => {
    setAttachedDocName(undefined);
    setAttachedDocText(undefined);
    aiService.setContext({ 
      courses, 
      assignments, 
      currentAssignment, 
      workInProgress, 
      referenceDocumentName: undefined, 
      referenceDocumentText: undefined 
    });
    localStorage.removeItem(storageKey + ':doc');
  };

  // Helper functions for document parsing
  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  const readPdfFile = async (file: File): Promise<string> => {
    // Import PDF.js dynamically
    const pdfjsLib = await import('pdfjs-dist');
    const workerUrl = await import('pdfjs-dist/build/pdf.worker.min.js?url');
    
    // @ts-expect-error - PDF.js worker URL configuration
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.default;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const maxPages = pdf.numPages;
    let textContent = '';
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = (content.items as Array<{ str: string }>).map((item) => item.str).filter(Boolean);
      textContent += strings.join(' ') + '\n';
    }
    return textContent;
  };

  // Attempt to detect and answer exam date queries
  const tryAnswerExamDate = async (query: string): Promise<string | null> => {
    const q = query.toLowerCase();
    const mentionsExam = /(final|midterm)/.test(q);
    const mentionsClass = /(class|course)/.test(q) || !!courses?.length;
    if (!mentionsExam || !mentionsClass) return null;

    // Extract course hint
    let courseHint = '';
    const forIdx = q.indexOf(' for ');
    if (forIdx !== -1) {
      courseHint = query.slice(forIdx + 5).trim();
    }
    
    const findCourse = () => {
      if (!courses || courses.length === 0) return null;
      if (courseHint) {
        const normalized = courseHint.toLowerCase();
        const byName = courses.find(c => c.name.toLowerCase().includes(normalized));
        if (byName) return byName;
        const byCode = courses.find(c => c.course_code.toLowerCase().includes(normalized));
        if (byCode) return byCode;
      }
      if (courses.length === 1) return courses[0];
      return null;
    };

    const course = findCourse();
    if (!course) return null;

    if (!auth) {
      return `I couldn't access Canvas to check the syllabus because you're not connected. Please log in, or upload the syllabus PDF/text here and ask again.`;
    }

    try {
      const service = new CanvasService(auth.accessToken, auth.domain);
      const syllabusText = await service.getCourseSyllabus(course.id);
      if (syllabusText && syllabusText.trim().length > 0) {
        setAttachedDocName(`${course.name} Syllabus`);
        setAttachedDocText(syllabusText);
        aiService.setContext({ 
          courses, 
          assignments, 
          currentAssignment, 
          workInProgress, 
          referenceDocumentName: `${course.name} Syllabus`, 
          referenceDocumentText: syllabusText 
        });
        localStorage.setItem(storageKey + ':doc', JSON.stringify({ 
          name: `${course.name} Syllabus`, 
          text: syllabusText 
        }));

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
        return `I fetched the syllabus for ${course.name}, but I couldn't find exact exam dates in the text. You can upload a PDF version here for deeper parsing or ask the instructor.`;
      }
      return `I couldn't retrieve readable syllabus content for ${course.name}. If you have the syllabus PDF or text, please attach it using "Attach PDF/Text", and I will extract the exam dates.`;
    } catch (err) {
      console.error('Syllabus fetch error:', err);
      return `I tried to check the syllabus for ${course.name}, but ran into an issue. Please attach the syllabus file here, or try again later.`;
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm max-h-[80vh] min-h-[300px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary-600" />
          <h2 className="text-sm font-semibold text-neutral-900">AI Assistant</h2>
        </div>
        <div className="flex items-center gap-2">
          <DocumentAttachment
            attachedDocName={attachedDocName}
            attachedDocText={attachedDocText}
            isParsingDoc={isParsingDoc}
            onAttachDocument={handleAttachDocument}
            onRemoveDocument={removeAttachedDocument}
          />
          <button
            onClick={clearChat}
            className="px-3 py-1.5 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md flex items-center transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
        {messages.map((msg, idx) => (
          <ChatMessageComponent key={idx} message={msg} />
        ))}
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        placeholder="Ask me about your assignments, due dates, or study planning..."
      />
    </div>
  );
}
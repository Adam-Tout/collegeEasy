import { useState, useRef, useEffect } from 'react';
import { Bot, RefreshCw } from 'lucide-react';
import { WorkspaceAgentService, ChatMessage, AssignmentInfo, WorkspaceAgentResponse } from '../services/workspaceAgentService';
import ChatMessageComponent from './ChatMessage';
import ChatInput from './ChatInput';

interface WorkspaceChatInterfaceProps {
  assignment?: AssignmentInfo;
  workInProgress?: string;
  currentMode?: 'document' | 'code';
  currentLanguage?: string;
  storageKey?: string;
  onWriteDocument?: (content: string) => void;
  onWriteCode?: (content: string, language: string) => void;
  onSwitchToDocument?: () => void;
  onSwitchToCode?: (language?: string) => void;
}

export default function WorkspaceChatInterface({ 
  assignment,
  workInProgress,
  currentMode = 'document',
  currentLanguage = 'javascript',
  storageKey = 'workspace-chatMessages',
  onWriteDocument,
  onWriteCode,
  onSwitchToDocument,
  onSwitchToCode
}: WorkspaceChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workspaceAgent] = useState(() => new WorkspaceAgentService());
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: ChatMessage[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          workspaceAgent.hydrateMessages(parsed);
        } else {
          initializeWelcomeMessage();
        }
      } catch {
        initializeWelcomeMessage();
      }
    } else {
      initializeWelcomeMessage();
    }
    
    // Set workspace context
    workspaceAgent.setContext({ 
      assignment,
      workInProgress,
      currentMode,
      currentLanguage
    });
  }, [storageKey]);

  useEffect(() => {
    // Keep context updated
    workspaceAgent.setContext({ 
      assignment,
      workInProgress,
      currentMode,
      currentLanguage
    });
  }, [assignment, workInProgress, currentMode, currentLanguage, workspaceAgent]);

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
      content: assignment 
        ? `Hi! I'm your writing and coding assistant for "${assignment.name}". I can help you write your assignment, write code, or answer questions. What would you like help with?`
        : "Hi! I'm your writing and coding assistant. I can help you write content or code. What would you like help with?"
    };
    setMessages([welcome]);
    workspaceAgent.hydrateMessages([welcome]);
  };

  const handleSendMessage = async (message: string) => {
    const userMsg: ChatMessage = { role: 'user', content: message };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    
    // CRITICAL: Hydrate agent with ALL conversation history including the new message
    // This ensures the agent remembers the full conversation context
    workspaceAgent.hydrateMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response: WorkspaceAgentResponse = await workspaceAgent.sendMessage(message);
      
      // Handle actions
      if (response.action) {
        console.log('[WorkspaceChat] Action received:', response.action);
        
        switch (response.action.type) {
          case 'write_document':
            if (onWriteDocument && response.action.content) {
              onWriteDocument(response.action.content);
              // Add action message to chat
              const docMsg: ChatMessage = {
                role: 'assistant',
                content: response.message + '\n\n✅ I\'ve written the content into your document editor!'
              };
              const updatedMessages = [...messages, userMsg, docMsg];
              setMessages(updatedMessages);
              // CRITICAL: Update agent history with full conversation
              workspaceAgent.hydrateMessages(updatedMessages);
            } else {
              const aiMsg: ChatMessage = { role: 'assistant', content: response.message };
              const updatedMessages = [...messages, userMsg, aiMsg];
              setMessages(updatedMessages);
              workspaceAgent.hydrateMessages(updatedMessages);
            }
            break;
            
          case 'write_code':
            if (onWriteCode && response.action.content) {
              const lang = response.action.language || currentLanguage || 'javascript';
              // Call onWriteCode which handles switching and writing
              await onWriteCode(response.action.content, lang);
              const codeMsg: ChatMessage = {
                role: 'assistant',
                content: response.message + `\n\n✅ I've written the code into your ${lang} editor!`
              };
              setMessages(prev => [...prev, codeMsg]);
              // Update agent history
              workspaceAgent.hydrateMessages([...messages, userMsg, codeMsg]);
            } else {
              const aiMsg: ChatMessage = { role: 'assistant', content: response.message };
              setMessages(prev => [...prev, aiMsg]);
              workspaceAgent.hydrateMessages([...messages, userMsg, aiMsg]);
            }
            break;
            
          case 'switch_to_document':
            if (onSwitchToDocument) {
              onSwitchToDocument();
              const switchMsg: ChatMessage = {
                role: 'assistant',
                content: response.message + '\n\n✅ Switched to document editor!'
              };
              const updatedMessages = [...messages, userMsg, switchMsg];
              setMessages(updatedMessages);
              workspaceAgent.hydrateMessages(updatedMessages);
            } else {
              const aiMsg: ChatMessage = { role: 'assistant', content: response.message };
              const updatedMessages = [...messages, userMsg, aiMsg];
              setMessages(updatedMessages);
              workspaceAgent.hydrateMessages(updatedMessages);
            }
            break;
            
          case 'switch_to_code':
            if (onSwitchToCode) {
              const lang = response.action.language || currentLanguage || 'javascript';
              onSwitchToCode(lang);
              const switchMsg: ChatMessage = {
                role: 'assistant',
                content: response.message + `\n\n✅ Switched to ${lang} code editor!`
              };
              const updatedMessages = [...messages, userMsg, switchMsg];
              setMessages(updatedMessages);
              workspaceAgent.hydrateMessages(updatedMessages);
            } else {
              const aiMsg: ChatMessage = { role: 'assistant', content: response.message };
              const updatedMessages = [...messages, userMsg, aiMsg];
              setMessages(updatedMessages);
              workspaceAgent.hydrateMessages(updatedMessages);
            }
            break;
            
          default:
            const aiMsg: ChatMessage = { role: 'assistant', content: response.message };
            const updatedMessages = [...messages, userMsg, aiMsg];
            setMessages(updatedMessages);
            workspaceAgent.hydrateMessages(updatedMessages);
        }
      } else {
        // No action, just show message
        const aiMsg: ChatMessage = { role: 'assistant', content: response.message };
        const updatedMessages = [...messages, userMsg, aiMsg];
        setMessages(updatedMessages);
        // CRITICAL: Update agent history with the full conversation
        workspaceAgent.hydrateMessages(updatedMessages);
      }
    } catch (err) {
      const aiMsg: ChatMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while processing your request. Please try again.' 
      };
      const updatedMessages = [...messages, userMsg, aiMsg];
      setMessages(updatedMessages);
      workspaceAgent.hydrateMessages(updatedMessages);
      console.error('Workspace agent error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    workspaceAgent.clearChat();
    workspaceAgent.setContext({ 
      assignment,
      workInProgress,
      currentMode,
      currentLanguage
    });
    initializeWelcomeMessage();
    localStorage.removeItem(storageKey);
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm max-h-[80vh] min-h-[300px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary-600" />
          <h2 className="text-sm font-semibold text-neutral-900">Writing & Coding Assistant</h2>
        </div>
        <button
          onClick={clearChat}
          className="px-3 py-1.5 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md flex items-center transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Reset
        </button>
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
        placeholder="Ask me to write content, write code, or help with your assignment..."
      />
    </div>
  );
}


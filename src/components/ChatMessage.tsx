import { Bot, User } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../services/aiService';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-lg p-3 ${
        message.role === 'user' 
          ? 'bg-primary-600 text-white' 
          : 'bg-neutral-100 text-neutral-900'
      }`}>
        <div className="flex items-center space-x-2 mb-1">
          {message.role === 'user' ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
          <span className="text-xs font-medium">
            {message.role === 'user' ? 'You' : 'Assistant'}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}

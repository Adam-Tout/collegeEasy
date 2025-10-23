import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSendMessage, isLoading, placeholder = "Start typing here..." }: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed || isLoading) return;
    
    onSendMessage(trimmed);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-neutral-200 p-4">
      <div className="flex items-end space-x-3">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 resize-none border border-neutral-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={2}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
            isLoading || !inputMessage.trim()
              ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  );
}

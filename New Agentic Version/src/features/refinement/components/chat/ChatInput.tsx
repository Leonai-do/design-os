
import React from 'react';
import AutoTextarea from '../../../dynamic-intake/components/AutoTextarea';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  onStop: () => void;
  isProcessing: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, onStop, isProcessing }) => {
  return (
    <div className="mt-auto relative shrink-0">
        <AutoTextarea 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={isProcessing ? "Processing..." : "Ask a question or request a change..."}
            className="w-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 text-sm"
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isProcessing) onSend();
                }
            }}
        />
        {isProcessing ? (
            <button 
                onClick={onStop}
                className="absolute right-2 bottom-2 w-8 h-8 rounded flex items-center justify-center transition-all bg-red-500 hover:bg-red-600 text-white shadow-lg animate-pulse"
                title="Stop Generating"
            >
                <Square className="w-3 h-3 fill-current" />
            </button>
        ) : (
            <button 
                onClick={onSend}
                disabled={!value.trim()}
                className={`absolute right-2 bottom-2 w-8 h-8 rounded flex items-center justify-center transition-all
                    ${!value.trim() ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600' : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90'}`}
            >
                <Send className="w-3 h-3" />
            </button>
        )}
    </div>
  );
};

export default ChatInput;

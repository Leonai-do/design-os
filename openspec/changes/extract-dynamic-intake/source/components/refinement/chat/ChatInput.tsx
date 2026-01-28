
import React from 'react';
import AutoTextarea from '../../AutoTextarea';

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
            className="w-full bg-brand-800 dark:bg-slate-900 text-white placeholder-brand-400 dark:placeholder-slate-500 border border-brand-600 dark:border-slate-600 rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:focus:ring-brand-500 text-sm"
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
                <i className="fa-solid fa-stop"></i>
            </button>
        ) : (
            <button 
                onClick={onSend}
                disabled={!value.trim()}
                className={`absolute right-2 bottom-2 w-8 h-8 rounded flex items-center justify-center transition-all
                    ${!value.trim() ? 'bg-brand-700 dark:bg-slate-700 text-brand-500 dark:text-slate-500' : 'bg-brand-500 dark:bg-brand-600 text-white hover:bg-brand-400 dark:hover:bg-brand-500'}`}
            >
                <i className="fa-solid fa-paper-plane"></i>
            </button>
        )}
    </div>
  );
};

export default ChatInput;

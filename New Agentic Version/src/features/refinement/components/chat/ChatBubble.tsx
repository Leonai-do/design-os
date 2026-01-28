
import React from 'react';
import { ChatMessage } from '../../../dynamic-intake/types';
import ChatMarkdown from '../ChatMarkdown';
import { Bot, User, CheckCircle, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

interface ChatBubbleProps {
  message: ChatMessage;
  isLastAi: boolean;
  isProcessing: boolean;
  onVersionChange?: (messageId: string, direction: 'prev' | 'next') => void;
  onRegenerate?: (messageId: string) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  message, 
  isLastAi, 
  isProcessing, 
  onVersionChange, 
  onRegenerate 
}) => {
  const versions = message.versions || [];
  const currentIdx = message.currentVersionIndex || 0;
  const hasVersions = versions.length > 1;

  return (
    <div className={`flex gap-3 animate-fade-in ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
        <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center text-xs shadow-sm
            ${message.role === 'ai' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-200'}`}>
        {message.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>
        
        <div className={`max-w-[85%] flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-3 rounded-lg text-sm shadow-sm overflow-hidden w-full
                ${message.role === 'ai' 
                ? 'bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200 dark:border-zinc-700' 
                : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-none'}`}>
                {message.isUpdate && (
                    <div className="mb-2 text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Document Updated
                    </div>
                )}
                
                <ChatMarkdown content={message.text} role={message.role} />
            </div>

            {/* Version Navigation & Controls (AI Only) */}
            {message.role === 'ai' && (hasVersions || isLastAi) && (
                <div className="flex items-center gap-2 mt-1 px-1">
                    {hasVersions && onVersionChange && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-md p-0.5 border border-zinc-200 dark:border-zinc-700">
                            <button 
                                onClick={() => onVersionChange(message.id, 'prev')}
                                disabled={currentIdx === 0}
                                className="w-5 h-4 flex items-center justify-center hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-3 h-3" />
                            </button>
                            <span className="font-mono px-1 min-w-[20px] text-center select-none">
                                {currentIdx + 1}/{versions.length}
                            </span>
                            <button 
                                onClick={() => onVersionChange(message.id, 'next')}
                                disabled={currentIdx === versions.length - 1}
                                className="w-5 h-4 flex items-center justify-center hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                    
                    {/* Regenerate Button */}
                    {onRegenerate && (
                        <button
                            onClick={() => onRegenerate(message.id)}
                            disabled={isProcessing}
                            className="text-[10px] flex items-center gap-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-1.5 py-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            title="Regenerate Response"
                        >
                            <RotateCw className="w-3 h-3" />
                            {isLastAi ? 'Regenerate' : 'Retry'}
                        </button>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default ChatBubble;

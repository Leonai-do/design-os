
import React from 'react';
import { ChatMessage } from '../../../types';
import ChatMarkdown from '../ChatMarkdown';

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
            ${message.role === 'ai' ? 'bg-brand-600 dark:bg-brand-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200'}`}>
        {message.role === 'ai' ? <i className="fa-solid fa-robot"></i> : <i className="fa-solid fa-user"></i>}
        </div>
        
        <div className={`max-w-[85%] flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-3 rounded-lg text-sm shadow-sm overflow-hidden w-full
                ${message.role === 'ai' 
                ? 'bg-white/10 text-brand-50 dark:text-slate-200 rounded-tl-none border border-brand-700/50 dark:border-slate-700' 
                : 'bg-white text-slate-800 dark:bg-slate-800 dark:text-white rounded-tr-none'}`}>
                {message.isUpdate && (
                    <div className="mb-2 text-xs font-bold uppercase tracking-wider text-green-300 flex items-center gap-1">
                        <i className="fa-solid fa-check-circle"></i> Document Updated
                    </div>
                )}
                
                <ChatMarkdown content={message.text} role={message.role} />
            </div>

            {/* Version Navigation & Controls (AI Only) */}
            {message.role === 'ai' && (hasVersions || isLastAi) && (
                <div className="flex items-center gap-2 mt-1 px-1">
                    {hasVersions && onVersionChange && (
                        <div className="flex items-center gap-1 text-[10px] text-brand-300 bg-brand-800/50 dark:bg-slate-800 rounded-md p-0.5 border border-brand-700/50 dark:border-slate-700">
                            <button 
                                onClick={() => onVersionChange(message.id, 'prev')}
                                disabled={currentIdx === 0}
                                className="w-5 h-4 flex items-center justify-center hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            <span className="font-mono px-1 min-w-[20px] text-center select-none">
                                {currentIdx + 1}/{versions.length}
                            </span>
                            <button 
                                onClick={() => onVersionChange(message.id, 'next')}
                                disabled={currentIdx === versions.length - 1}
                                className="w-5 h-4 flex items-center justify-center hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                    
                    {/* Regenerate Button */}
                    {onRegenerate && (
                        <button
                            onClick={() => onRegenerate(message.id)}
                            disabled={isProcessing}
                            className="text-[10px] flex items-center gap-1 text-brand-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-1.5 py-0.5 rounded hover:bg-brand-800/50"
                            title="Regenerate Response"
                        >
                            <i className="fa-solid fa-rotate"></i> 
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

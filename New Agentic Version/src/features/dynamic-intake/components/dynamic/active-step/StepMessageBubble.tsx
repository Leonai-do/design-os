
import React from 'react';
import { Bot, Loader2 } from 'lucide-react';

interface StepMessageBubbleProps {
  isAiLoading: boolean;
  message: string;
  loadingStatus?: string;
}

const StepMessageBubble: React.FC<StepMessageBubbleProps> = ({ isAiLoading, message, loadingStatus }) => {
  return (
    <div className="flex gap-4 mb-6">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white shadow-lg transition-all duration-500
            ${isAiLoading ? 'bg-zinc-300 dark:bg-zinc-700 animate-pulse' : 'bg-zinc-900 dark:bg-zinc-100'}`}>
            {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5 text-zinc-100 dark:text-zinc-900" />}
        </div>
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl rounded-tl-none border-2 border-zinc-100 dark:border-zinc-800 shadow-md text-zinc-800 dark:text-zinc-100 text-lg w-full">
            {isAiLoading && !message ? (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2.5 text-zinc-500 dark:text-zinc-300">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-zinc-500"></span>
                        </span>
                        <span className="font-medium animate-pulse">{loadingStatus || "Thinking..."}</span>
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                   {message}
                </div>
            )}
        </div>
    </div>
  );
};

export default StepMessageBubble;


import React from 'react';

interface StepMessageBubbleProps {
  isAiLoading: boolean;
  message: string;
  loadingStatus?: string;
}

const StepMessageBubble: React.FC<StepMessageBubbleProps> = ({ isAiLoading, message, loadingStatus }) => {
  return (
    <div className="flex gap-4 mb-6">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white shadow-lg transition-all duration-500
            ${isAiLoading ? 'bg-slate-300 dark:bg-slate-700 animate-pulse' : 'bg-brand-600'}`}>
            <i className={`fa-solid ${isAiLoading ? 'fa-circle-notch animate-spin' : 'fa-robot'}`}></i>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl rounded-tl-none border-2 border-brand-100 dark:border-brand-900 shadow-md text-slate-800 dark:text-slate-100 text-lg w-full">
            {isAiLoading && !message ? (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-300">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
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

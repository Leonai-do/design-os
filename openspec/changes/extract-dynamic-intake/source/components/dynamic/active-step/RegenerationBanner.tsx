
import React from 'react';

interface RegenerationBannerProps {
  onCancel: () => void;
  onConfirm: () => void;
}

const RegenerationBanner: React.FC<RegenerationBannerProps> = ({ onCancel, onConfirm }) => {
  return (
    <div className="ml-14 mb-4 p-4 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 rounded-r-lg shadow-sm animate-fade-in">
        <div className="flex justify-between items-center">
            <div>
                <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide">
                    <i className="fa-solid fa-lock mr-2"></i> Regeneration Mode
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                    Lock the fields you want to keep. The AI will regenerate the rest based on your project context.
                </p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={onCancel}
                    className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={onConfirm}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded shadow-sm transition-colors flex items-center gap-1"
                >
                    <i className="fa-solid fa-rotate-right"></i> Regenerate
                </button>
            </div>
        </div>
    </div>
  );
};

export default RegenerationBanner;

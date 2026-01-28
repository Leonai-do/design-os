
import React from 'react';
import DynamicField from '../../DynamicField';
import { DynamicField as DynamicFieldType } from '../../../types';

interface StepFooterProps {
  notesField: DynamicFieldType;
  notesValue: any;
  onFieldChange: (id: string, value: any) => void;
  apiError: string | null;
  onRegenerateTrigger?: () => void;
  canRegenerate: boolean;
  isComplete: boolean;
  onSkipToPrd: () => void;
  onNext: () => void;
}

const StepFooter: React.FC<StepFooterProps> = ({
  notesField,
  notesValue,
  onFieldChange,
  apiError,
  onRegenerateTrigger,
  canRegenerate,
  isComplete,
  onSkipToPrd,
  onNext
}) => {
  return (
    <>
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <DynamicField 
                field={notesField}
                value={notesValue}
                onChange={onFieldChange}
            />
        </div>

        {apiError && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-300 text-sm flex items-center gap-2 animate-fade-in">
            <i className="fa-solid fa-circle-exclamation"></i>
            {apiError}
        </div>
        )}

        <div className="pt-6 flex justify-between items-center mt-4">
            {/* Left Side: Regenerate with Lock Mode Trigger */}
            {canRegenerate && onRegenerateTrigger ? (
                <button
                    onClick={onRegenerateTrigger}
                    className="px-0 py-2 text-slate-400 hover:text-amber-600 dark:text-slate-500 dark:hover:text-amber-400 font-medium text-xs flex items-center gap-1.5 transition-colors group"
                    title="Regenerate this step's questions based on updated context"
                >
                    <i className="fa-solid fa-rotate-right group-hover:rotate-180 transition-transform duration-500"></i> 
                    Regenerate Step
                </button>
            ) : <div></div>}

            {/* Right Side: Navigation & Skip */}
            <div className="flex items-center gap-4">
                {!isComplete && (
                    <button
                        onClick={onSkipToPrd}
                        className="text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 font-medium text-xs transition-colors"
                    >
                        Skip to PRD
                    </button>
                )}
                
                {isComplete ? (
                    <button
                        onClick={onSkipToPrd}
                        className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 text-white rounded-xl font-bold shadow-lg shadow-brand-500/30 transform hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <i className="fa-solid fa-wand-magic-sparkles"></i> Generate Final PRD
                    </button>
                ) : (
                    <button
                        onClick={onNext}
                        className={`px-6 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2 bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-500 shadow-md`}
                    >
                        Next Step <i className="fa-solid fa-arrow-right"></i>
                    </button>
                )}
            </div>
        </div>
    </>
  );
};

export default StepFooter;

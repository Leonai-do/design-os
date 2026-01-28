
import React from 'react';
import DynamicField from '../../DynamicField';
import { DynamicField as DynamicFieldType } from '../../../types';
import { AlertCircle, RefreshCw, Wand2, ArrowRight } from 'lucide-react';

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
        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <DynamicField 
                field={notesField}
                value={notesValue}
                onChange={onFieldChange}
            />
        </div>

        {apiError && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-300 text-sm flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4" />
            {apiError}
        </div>
        )}

        <div className="pt-6 flex justify-between items-center mt-4">
            {/* Left Side: Regenerate with Lock Mode Trigger */}
            {canRegenerate && onRegenerateTrigger ? (
                <button
                    onClick={onRegenerateTrigger}
                    className="px-0 py-2 text-zinc-400 hover:text-amber-600 dark:text-zinc-500 dark:hover:text-amber-400 font-medium text-xs flex items-center gap-1.5 transition-colors group"
                    title="Regenerate this step's questions based on updated context"
                >
                    <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" /> 
                    Regenerate Step
                </button>
            ) : <div></div>}

            {/* Right Side: Navigation & Skip */}
            <div className="flex items-center gap-4">
                {!isComplete && (
                    <button
                        onClick={onSkipToPrd}
                        className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium text-xs transition-colors"
                    >
                        Skip to Results
                    </button>
                )}
                
                {isComplete ? (
                    <button
                        onClick={onSkipToPrd}
                        className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Wand2 className="w-4 h-4" /> Generate Final PRD
                    </button>
                ) : (
                    <button
                        onClick={onNext}
                        className="px-6 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:opacity-90 shadow-md"
                    >
                        Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    </>
  );
};

export default StepFooter;

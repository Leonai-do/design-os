
import React from 'react';
import { DiscoveryStep, PrdContext } from '../../../types';
import { Pencil, RefreshCw, User } from 'lucide-react';

interface HistoryItemViewProps {
  step: DiscoveryStep;
  context: PrdContext;
  isEdited: boolean;
  editedTime: string;
  onEdit: () => void;
  onRegenerateRequest?: () => void;
}

const HistoryItemView: React.FC<HistoryItemViewProps> = ({ step, context, isEdited, editedTime, onEdit, onRegenerateRequest }) => {
  return (
    <div className="flex gap-4 w-full justify-end">
        {/* Control Buttons */}
        <div className="flex flex-col items-end gap-2 mt-2">
            <div className="flex flex-col items-end">
                <button 
                    onClick={onEdit}
                    className={`h-9 w-9 flex items-center justify-center rounded-full transition-all shadow-sm border
                        ${isEdited 
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-800/50' 
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                    title="Edit Values"
                >
                    <Pencil className="w-4 h-4" />
                </button>
                {isEdited && (
                    <div className="flex flex-col items-end mt-1 mr-1">
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Edited</span>
                        <span className="text-[9px] text-amber-500/70 dark:text-amber-400/60 font-mono">{editedTime}</span>
                    </div>
                )}
            </div>
            
            {onRegenerateRequest && (
                <button 
                    onClick={onRegenerateRequest}
                    className="h-9 w-9 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-zinc-700 transition-all shadow-sm border border-zinc-200 dark:border-zinc-700"
                    title="Regenerate this Step (with Context)"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            )}
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800/50 p-5 rounded-2xl rounded-tr-none border border-zinc-200 dark:border-zinc-700 w-full max-w-[85%] hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-3">
                {step.fields.map(f => (
                    <li key={f.id} className="flex flex-col gap-1">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs uppercase tracking-wide opacity-70">{f.label}</span>
                        <span className="text-zinc-900 dark:text-white font-medium break-words leading-relaxed">
                            {Array.isArray(context[f.id]) ? context[f.id].join(', ') : context[f.id]}
                        </span>
                    </li>
                ))}
                {context[`custom_notes_${step.stepId}`] && (
                    <li className="pt-2 border-t border-zinc-200 dark:border-zinc-700 mt-2">
                        <span className="font-bold text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wide block mb-1">Additional Notes</span>
                        <span className="text-zinc-600 dark:text-zinc-300 italic">
                            "{context[`custom_notes_${step.stepId}`]}"
                        </span>
                    </li>
                )}
            </ul>
        </div>
        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 text-zinc-500 shadow-sm">
            <User className="w-5 h-5" />
        </div>
    </div>
  );
};

export default HistoryItemView;

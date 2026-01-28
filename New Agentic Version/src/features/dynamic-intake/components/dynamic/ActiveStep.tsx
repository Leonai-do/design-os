
import React, { useState } from 'react';
import { DiscoveryStep, PrdContext, DynamicField as DynamicFieldType } from '../../types';
import DynamicField from '../DynamicField';
import StepMessageBubble from './active-step/StepMessageBubble';
import RegenerationBanner from './active-step/RegenerationBanner';
import StepFooter from './active-step/StepFooter';
import { Lock, Unlock, Square } from 'lucide-react';

interface ActiveStepProps {
  isAiLoading: boolean;
  partialStep?: Partial<DiscoveryStep>;
  loadingStatus?: string;
  currentStep: DiscoveryStep;
  context: PrdContext;
  handleFieldChange: (id: string, value: any) => void;
  getNotesField: (stepId: number) => DynamicFieldType;
  showErrors: boolean;
  isFieldValid: (id: string) => boolean;
  apiError: string | null;
  onComplete: (context: PrdContext, files: File[]) => void;
  files: File[];
  handleNextClick: () => void;
  onStop?: () => void;
  onRegenerate?: (lockedFields: string[]) => void;
}

const ActiveStep: React.FC<ActiveStepProps> = ({
  isAiLoading, partialStep, loadingStatus, currentStep, context,
  handleFieldChange, getNotesField, showErrors, isFieldValid, apiError,
  onComplete, files, handleNextClick, onStop, onRegenerate
}) => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [lockedFieldIds, setLockedFieldIds] = useState<Set<string>>(new Set());

  const activeFields = isAiLoading ? (partialStep?.fields || []) : currentStep.fields;
  const activeMessage = isAiLoading ? (partialStep?.aiMessage || '') : currentStep.aiMessage;

  const toggleLock = (fieldId: string) => {
    const newSet = new Set(lockedFieldIds);
    if (newSet.has(fieldId)) newSet.delete(fieldId);
    else newSet.add(fieldId);
    setLockedFieldIds(newSet);
  };

  const handleConfirmRegenerate = () => {
      if (onRegenerate) {
          onRegenerate(Array.from(lockedFieldIds));
          setIsSelectionMode(false);
          setLockedFieldIds(new Set());
      }
  };

  return (
    <div className="animate-fade-in pb-8">
        <StepMessageBubble isAiLoading={isAiLoading} message={activeMessage} loadingStatus={loadingStatus} />

        {isSelectionMode && !isAiLoading && (
            <RegenerationBanner onCancel={() => setIsSelectionMode(false)} onConfirm={handleConfirmRegenerate} />
        )}

        {(!isAiLoading || activeFields.length > 0) && (
            <div className={`ml-14 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl shadow-xl border space-y-6 relative animate-fade-in transition-all duration-300
                ${isSelectionMode 
                    ? 'border-amber-400 dark:border-amber-600 ring-4 ring-amber-50 dark:ring-amber-900/20' 
                    : 'border-zinc-200 dark:border-zinc-800'}`}>
                
                {activeFields.map(field => {
                    if (field.dependsOn && context[field.dependsOn.fieldId] !== field.dependsOn.value) return null;
                    const isLocked = lockedFieldIds.has(field.id);

                    return (
                        <div key={field.id} className="animate-slide-up relative group">
                            {isSelectionMode && (
                                <div 
                                    onClick={() => toggleLock(field.id)}
                                    className={`absolute -left-4 -right-4 -top-2 -bottom-2 z-10 cursor-pointer rounded-lg border-2 transition-all duration-200 flex items-center justify-end pr-4
                                        ${isLocked ? 'bg-amber-100/10 border-amber-500' : 'border-transparent hover:bg-zinc-50/50 hover:border-zinc-300 dark:hover:border-zinc-600'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all
                                        ${isLocked ? 'bg-amber-500 text-white scale-110' : 'bg-white dark:bg-zinc-800 text-zinc-300 border border-zinc-200 dark:border-zinc-600'}`}>
                                        {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                    </div>
                                </div>
                            )}
                            <div className={`${isSelectionMode && !isLocked ? 'opacity-50 blur-[1px]' : 'opacity-100'} transition-all duration-300`}>
                                <DynamicField 
                                    field={field}
                                    value={context[field.id]}
                                    notesValue={context[`${field.id}_notes`] || {}}
                                    onChange={handleFieldChange}
                                    onNotesChange={(notes) => handleFieldChange(`${field.id}_notes`, notes)}
                                    error={showErrors && !isFieldValid(field.id)}
                                />
                            </div>
                        </div>
                    );
                })}

                {isAiLoading && (
                    <div className="py-4 flex items-center gap-3 text-zinc-400 dark:text-zinc-600 animate-pulse">
                        <div className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
                        <div className="h-2 w-32 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
                        <span className="text-xs font-mono ml-auto opacity-70">{loadingStatus}</span>
                    </div>
                )}

                {!isAiLoading && !isSelectionMode && (
                    <StepFooter 
                        notesField={getNotesField(currentStep.stepId)}
                        notesValue={context[`custom_notes_${currentStep.stepId}`]}
                        onFieldChange={handleFieldChange}
                        apiError={apiError}
                        onRegenerateTrigger={onRegenerate ? () => setIsSelectionMode(true) : undefined}
                        canRegenerate={currentStep.stepId > 1}
                        isComplete={currentStep.isComplete}
                        onSkipToPrd={() => onComplete(context, files)}
                        onNext={handleNextClick}
                    />
                )}

                {isAiLoading && onStop && (
                    <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <button onClick={onStop} className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-xs font-bold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-2">
                            <Square className="w-3 h-3 fill-current" /> Stop Generation
                        </button>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default ActiveStep;

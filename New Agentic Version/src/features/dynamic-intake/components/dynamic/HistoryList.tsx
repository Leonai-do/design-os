
import React, { useState } from 'react';
import { DiscoveryStep, PrdContext, DynamicField as DynamicFieldType } from '../../types';
import HistoryItemView from './history/HistoryItemView';
import HistoryItemEdit from './history/HistoryItemEdit';
import HistoryItemLock from './history/HistoryItemLock';
import { Bot, Loader2, Wand2 } from 'lucide-react';

interface HistoryListProps {
  history: DiscoveryStep[];
  editingStepId: number | null;
  setEditingStepId: (id: number | null) => void;
  regeneratingStepId: number | null;
  onRegenerate: (stepId: number, lockedFields: string[]) => void;
  onSaveStep: (stepId: number) => void;
  context: PrdContext;
  handleFieldChange: (id: string, value: any) => void;
  getNotesField: (stepId: number) => DynamicFieldType;
}

const HistoryList: React.FC<HistoryListProps> = ({ 
  history, editingStepId, setEditingStepId, regeneratingStepId,
  onRegenerate, onSaveStep, context, handleFieldChange, getNotesField 
}) => {
  const [selectionModeStepId, setSelectionModeStepId] = useState<number | null>(null);

  const handleStartRegeneration = (stepId: number) => {
      setSelectionModeStepId(stepId);
  };

  const confirmRegeneration = (stepId: number, lockedFieldIds: string[]) => {
      onRegenerate(stepId, lockedFieldIds);
      setSelectionModeStepId(null);
  };

  return (
    <>
      {history.map((step) => {
        const isRegenerating = regeneratingStepId === step.stepId;
        const isEdited = !!step.lastEdited;
        const editedTime = step.lastEdited ? new Date(step.lastEdited).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
        
        return (
        <div key={step.stepId} className="group transition-all duration-300">
            <div className="flex gap-4 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white shadow-lg transition-colors
                    ${isRegenerating ? 'bg-amber-500 animate-pulse' : 'bg-zinc-900 dark:bg-zinc-100'}`}>
                    {isRegenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5 text-zinc-100 dark:text-zinc-900" />}
                </div>
                <div className={`bg-white dark:bg-zinc-900 p-4 rounded-2xl rounded-tl-none border shadow-sm text-zinc-700 dark:text-zinc-300 transition-colors
                    ${isRegenerating ? 'border-amber-300 dark:border-amber-700' : 'border-zinc-200 dark:border-zinc-700'}`}>
                    {isRegenerating ? (
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                            <Wand2 className="w-4 h-4" /> Re-architecting step based on new context...
                        </div>
                    ) : (
                        step.aiMessage
                    )}
                </div>
            </div>

            <div className="flex justify-end mb-4 relative">
                {editingStepId === step.stepId ? (
                    <HistoryItemEdit 
                        step={step}
                        context={context}
                        onSave={() => { onSaveStep(step.stepId); setEditingStepId(null); }}
                        handleFieldChange={handleFieldChange}
                        getNotesField={getNotesField}
                    />
                ) : selectionModeStepId === step.stepId ? (
                    <HistoryItemLock 
                        step={step}
                        context={context}
                        onCancel={() => setSelectionModeStepId(null)}
                        onConfirm={(lockedIds) => confirmRegeneration(step.stepId, lockedIds)}
                    />
                ) : (
                    <HistoryItemView 
                        step={step}
                        context={context}
                        isEdited={isEdited}
                        editedTime={editedTime}
                        onEdit={() => setEditingStepId(step.stepId)}
                        onRegenerateRequest={step.stepId > 1 ? () => handleStartRegeneration(step.stepId) : undefined}
                    />
                )}
            </div>
        </div>
      );
      })}
    </>
  );
};

export default HistoryList;

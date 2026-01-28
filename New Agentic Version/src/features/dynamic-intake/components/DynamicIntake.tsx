
import React from 'react';
import { DiscoveryStep, PrdContext, ModelConfig } from '../types';
import FileUpload from './FileUpload';
import { useDynamicIntakeLogic } from '../hooks/useDynamicIntakeLogic';
import ContextSidebar from './dynamic/ContextSidebar';
import HistoryList from './dynamic/HistoryList';
import ActiveStep from './dynamic/ActiveStep';
import { ArrowLeft } from 'lucide-react';

export interface DynamicIntakeProps {
  onComplete: (context: PrdContext, files: File[]) => void;
  onCancel: () => void;
  modelConfig: ModelConfig;
  systemPrompt: string;
  
  // Lifted State
  context: PrdContext;
  setContext: (ctx: PrdContext) => void;
  history: DiscoveryStep[];
  setHistory: (history: DiscoveryStep[]) => void;
  currentStep: DiscoveryStep;
  setCurrentStep: (step: DiscoveryStep) => void;
  files: File[];
  setFiles: (files: File[]) => void;
}

// Re-export for compatibility if needed
export { DEFAULT_INITIAL_STEP } from '../constants';

const DynamicIntake: React.FC<DynamicIntakeProps> = (props) => {
  const {
    isAiLoading,
    partialStep,
    loadingStatus,
    showErrors,
    apiError,
    editingStepId,
    setEditingStepId,
    regeneratingStepId,
    bottomRef,
    handleFieldChange,
    handleNextClick,
    handleRegenerateStep,
    handleRegenerateHistoryStep,
    handleSaveHistoryStep,
    handleStop,
    getLabelForKey,
    getNotesField,
    isFieldValid
  } = useDynamicIntakeLogic({
    context: props.context,
    setContext: props.setContext,
    history: props.history,
    setHistory: props.setHistory,
    currentStep: props.currentStep,
    setCurrentStep: props.setCurrentStep,
    files: props.files,
    modelConfig: props.modelConfig,
    systemPrompt: props.systemPrompt
  });

  return (
    <div className="max-w-[90%] mx-auto flex flex-col gap-6 min-h-[600px] pb-20">
      
      {/* Header Area */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button onClick={props.onCancel} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Exit Interview
        </button>
        <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          AI Interview Mode
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chat Flow Column */}
        <div className="lg:col-span-2 flex flex-col gap-8">
            
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <FileUpload files={props.files} onFilesChange={props.setFiles} label="Upload Context Documents" modelConfig={props.modelConfig} />
            </div>

            {/* History */}
            <HistoryList 
              history={props.history}
              editingStepId={editingStepId}
              setEditingStepId={setEditingStepId}
              regeneratingStepId={regeneratingStepId}
              onRegenerate={handleRegenerateHistoryStep}
              onSaveStep={handleSaveHistoryStep}
              context={props.context}
              handleFieldChange={handleFieldChange}
              getNotesField={getNotesField}
            />

            {/* Current Active Step */}
            <ActiveStep 
              isAiLoading={isAiLoading}
              partialStep={partialStep}
              loadingStatus={loadingStatus}
              currentStep={props.currentStep}
              context={props.context}
              handleFieldChange={handleFieldChange}
              getNotesField={getNotesField}
              showErrors={showErrors}
              isFieldValid={isFieldValid}
              apiError={apiError}
              onComplete={props.onComplete}
              files={props.files}
              handleNextClick={handleNextClick}
              onRegenerate={handleRegenerateStep}
              onStop={handleStop}
            />
            
            <div ref={bottomRef}></div>
        </div>

        {/* Right Sidebar: Context Summary */}
        <ContextSidebar 
          context={props.context}
          files={props.files}
          modelConfig={props.modelConfig}
          getLabelForKey={getLabelForKey}
        />

      </div>
    </div>
  );
};

export default DynamicIntake;

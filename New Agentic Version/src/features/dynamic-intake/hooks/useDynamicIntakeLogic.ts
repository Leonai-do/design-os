
import { useState, useRef, useEffect } from 'react';
import { PrdContext, DiscoveryStep, ModelConfig } from '../types';
import { useDynamicValidation } from './useDynamicValidation';
import { useDynamicGeneration } from './useDynamicGeneration';

interface UseDynamicIntakeLogicProps {
  context: PrdContext;
  setContext: (ctx: PrdContext) => void;
  history: DiscoveryStep[];
  setHistory: (history: DiscoveryStep[]) => void;
  currentStep: DiscoveryStep;
  setCurrentStep: (step: DiscoveryStep) => void;
  files: File[];
  modelConfig: ModelConfig;
  systemPrompt: string;
}

export const useDynamicIntakeLogic = ({
  context, setContext, history, setHistory, currentStep, setCurrentStep, files, modelConfig, systemPrompt
}: UseDynamicIntakeLogicProps) => {
  const [editingStepId, setEditingStepId] = useState<number | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { isFieldValid, isCurrentStepValid, getLabelForKey, getNotesField } = useDynamicValidation(context, currentStep, history);
  
  const generation = useDynamicGeneration({
    context, history, setHistory, currentStep, setCurrentStep, files, modelConfig, systemPrompt, setEditingStepId
  });

  useEffect(() => {
    if (editingStepId === null && generation.regeneratingStepId === null) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, currentStep, editingStepId, generation.regeneratingStepId, generation.partialStep?.fields?.length, generation.apiError]);

  const handleFieldChange = (id: string, value: any) => {
    setContext({ ...context, [id]: value });
  };

  const handleNextClick = () => {
    if (generation.isAiLoading) return;
    if (!isCurrentStepValid()) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    generation.handleNext();
  };

  const handleSaveHistoryStep = (stepId: number) => {
    const updatedHistory = history.map(s => 
        s.stepId === stepId ? { ...s, lastEdited: Date.now() } : s
    );
    setHistory(updatedHistory);
  };

  return {
    ...generation,
    editingStepId,
    setEditingStepId,
    showErrors,
    bottomRef,
    handleFieldChange,
    handleNextClick,
    handleSaveHistoryStep,
    getLabelForKey,
    getNotesField,
    isFieldValid
  };
};

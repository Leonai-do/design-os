
import { useState, useRef } from 'react';
import { PrdContext, DiscoveryStep, ModelConfig } from '../types';
import { getNextDiscoveryStep } from '../services/workflows/discovery';
import { parsePartialStream } from '../utils/aiStreamParsers';

interface UseDynamicGenerationProps {
  context: PrdContext;
  history: DiscoveryStep[];
  setHistory: (h: DiscoveryStep[]) => void;
  currentStep: DiscoveryStep;
  setCurrentStep: (s: DiscoveryStep) => void;
  files: File[];
  modelConfig: ModelConfig;
  systemPrompt: string;
  setEditingStepId: (id: number | null) => void;
}

export const useDynamicGeneration = ({
  context, history, setHistory, currentStep, setCurrentStep, files, modelConfig, systemPrompt, setEditingStepId
}: UseDynamicGenerationProps) => {
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [partialStep, setPartialStep] = useState<Partial<DiscoveryStep>>({});
  const [loadingStatus, setLoadingStatus] = useState('Thinking...');
  const [apiError, setApiError] = useState<string | null>(null);
  const [regeneratingStepId, setRegeneratingStepId] = useState<number | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamBufferRef = useRef<string>('');

  const executeGeneration = async (
    targetHistory: DiscoveryStep[], 
    lockedFields: any[] = [], 
    onSuccess: (data: DiscoveryStep) => void,
    onStream: (status: string) => void
  ) => {
    setIsAiLoading(true);
    setApiError(null);
    setPartialStep({});
    streamBufferRef.current = '';
    abortControllerRef.current = new AbortController();

    try {
      const data = await getNextDiscoveryStep(
        context,
        targetHistory,
        files,
        modelConfig.id,
        (chunk) => {
            streamBufferRef.current += chunk;
            const parsed = parsePartialStream(streamBufferRef.current);
            setPartialStep({ aiMessage: parsed.aiMessage, fields: parsed.fields });
            setLoadingStatus(parsed.status);
            onStream(parsed.status);
        },
        null,
        systemPrompt,
        abortControllerRef.current.signal,
        lockedFields
      );
      onSuccess(data);
    } catch (error: any) {
      if (error.message.includes('aborted')) return;
      console.error("Generation failed", error);
      setApiError(error.message || "An unexpected error occurred.");
    } finally {
      setIsAiLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleNext = () => {
    if (isAiLoading) return;
    setLoadingStatus('Connecting...');
    const newHistory = [...history, currentStep];
    setHistory(newHistory);
    
    executeGeneration(
      newHistory,
      [],
      (data) => {
        setCurrentStep(data);
        setPartialStep({});
      },
      () => {}
    ).catch(() => setHistory(history)); // Rollback on error handled in execute
  };

  const handleRegenerateStep = (lockedFieldIds: string[] = []) => {
    if (isAiLoading) return;
    setLoadingStatus('Regenerating step...');
    const lockedFields = currentStep.fields.filter(f => lockedFieldIds.includes(f.id));
    
    executeGeneration(
      history,
      lockedFields,
      (data) => {
        // Merge locked fields if missing
        const newFields = [...data.fields];
        lockedFields.forEach(lf => {
            if (!newFields.find(nf => nf.id === lf.id)) newFields.unshift(lf);
        });
        data.fields = newFields;
        data.stepId = currentStep.stepId;
        setCurrentStep(data);
        setPartialStep({});
      },
      () => {}
    );
  };

  const handleRegenerateHistoryStep = (stepId: number, lockedFieldIds: string[]) => {
    if (isAiLoading) return;
    const targetIndex = history.findIndex(s => s.stepId === stepId);
    if (targetIndex === -1) return;

    const previousHistory = history.slice(0, targetIndex);
    const targetStep = history[targetIndex];
    const lockedFields = targetStep.fields.filter(f => lockedFieldIds.includes(f.id));

    setRegeneratingStepId(stepId);
    setLoadingStatus('Re-architecting step...');

    executeGeneration(
      previousHistory,
      lockedFields,
      (data) => {
        const newFields = [...data.fields];
        lockedFields.forEach(lf => {
            if (!newFields.find(nf => nf.id === lf.id)) newFields.unshift(lf);
        });
        data.fields = newFields;
        data.stepId = stepId;
        
        const newHistory = [...history];
        newHistory[targetIndex] = data;
        setHistory(newHistory);
        setRegeneratingStepId(null);
      },
      () => setLoadingStatus('Regenerating options...')
    ).then(() => setRegeneratingStepId(null));
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setIsAiLoading(false);
        setApiError("Generation stopped by user.");
    }
  };

  return {
    isAiLoading,
    partialStep,
    loadingStatus,
    apiError,
    setApiError,
    regeneratingStepId,
    handleNext,
    handleRegenerateStep,
    handleRegenerateHistoryStep,
    handleStop
  };
};

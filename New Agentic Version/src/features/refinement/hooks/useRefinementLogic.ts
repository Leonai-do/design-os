
import { useState } from 'react';
import { ModelConfig } from '../../dynamic-intake/types';
import { useTOC } from './useTOC';
import { useChatSession } from './useChatSession';

interface UseRefinementLogicProps {
  initialContent: string;
  files: File[];
  modelConfig: ModelConfig;
  systemPrompt: string;
}

export const useRefinementLogic = ({ initialContent, files, modelConfig, systemPrompt }: UseRefinementLogicProps) => {
  const [content, setContent] = useState(initialContent);
  const [showPreview, setShowPreview] = useState(true);

  // Table of Contents
  const { toc, activeId, scrollToSection } = useTOC(content);

  // Chat Session
  const {
    messages,
    inputMessage,
    setInputMessage,
    isProcessing,
    chatBottomRef,
    handleSendMessage,
    handleRegenerate,
    handleVersionChange,
    handleStop
  } = useChatSession({
    content,
    setContent,
    files,
    modelConfig,
    systemPrompt
  });

  // Helper to download files without external dependency
  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMd = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    downloadFile(blob, filename);
  };

  const handleDownloadPdf = (elementId: string, filename: string) => {
    // For client-side, we might just print or use window.print() as simple PDF export
    // Integrating complex PDF generation requires heavy libs like jsPDF + html2canvas
    // For now, we trigger print dialog as a robust fallback
    window.print();
  };

  return {
    content,
    setContent,
    inputMessage,
    setInputMessage,
    isProcessing,
    showPreview,
    setShowPreview,
    toc,
    activeId,
    messages,
    chatBottomRef,
    handleSendMessage,
    handleRegenerate,
    handleVersionChange,
    handleStop,
    handleDownloadMd,
    handleDownloadPdf,
    scrollToSection
  };
};
export { slugify } from './useTOC';

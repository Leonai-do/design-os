
import React from 'react';
import { ModelConfig } from '../../dynamic-intake/types';
import { useRefinementLogic } from '../hooks/useRefinementLogic';
import RefinementToolbar from './RefinementToolbar';
import TOCSidebar from './TOCSidebar';
import DocPreview from './DocPreview';
import ChatInterface from './ChatInterface';

interface RefinementViewProps {
  initialContent: string;
  onBack: () => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  modelConfig: ModelConfig;
  systemPrompt: string;
}

const RefinementView: React.FC<RefinementViewProps> = ({ initialContent, onBack, files, onFilesChange, modelConfig, systemPrompt }) => {
  const {
    content,
    setInputMessage, // Was setContent in hook, used for chat input msg? No, chat session handles input. This is for Doc content update?
    inputMessage,
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
    handleDownloadPdf,
    handleDownloadMd,
    scrollToSection
  } = useRefinementLogic({ initialContent, files, modelConfig, systemPrompt });

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] w-full max-w-[98%] mx-auto gap-4 px-2">
      
      <RefinementToolbar 
        onBack={onBack}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        onDownloadMd={() => handleDownloadMd(content, 'PRD_Generated.md')}
        onDownloadPdf={() => handleDownloadPdf('prd-document', 'PRD_Generated.pdf')}
      />

      <div className="flex-1 flex gap-4 overflow-hidden">
        
        <TOCSidebar 
          toc={toc} 
          activeId={activeId} 
          onScrollToSection={scrollToSection} 
        />

        <DocPreview 
          content={content}
          showPreview={showPreview}
          onScrollToSection={scrollToSection}
        />

        <ChatInterface 
          showPreview={showPreview}
          messages={messages}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          isProcessing={isProcessing}
          onSendMessage={handleSendMessage}
          onStop={handleStop}
          chatBottomRef={chatBottomRef}
          files={files}
          onRemoveFile={handleRemoveFile}
          onRegenerate={handleRegenerate}
          onVersionChange={handleVersionChange}
        />
        
      </div>
    </div>
  );
};

export default RefinementView;

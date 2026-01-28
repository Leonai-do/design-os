
import React, { useState } from 'react';
import { ChatMessage } from '../../dynamic-intake/types';
import FilePreviewModal from './FilePreviewModal';
import ChatBubble from './chat/ChatBubble';
import ChatInput from './chat/ChatInput';
import { Paperclip, X } from 'lucide-react';

interface ChatInterfaceProps {
  showPreview: boolean;
  messages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  isProcessing: boolean;
  onSendMessage: () => void;
  onStop?: () => void;
  chatBottomRef: React.RefObject<HTMLDivElement>;
  files: File[];
  onRemoveFile: (index: number) => void;
  onRegenerate?: (messageId: string) => void;
  onVersionChange?: (messageId: string, direction: 'prev' | 'next') => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  showPreview,
  messages,
  inputMessage,
  setInputMessage,
  isProcessing,
  onSendMessage,
  onStop,
  chatBottomRef,
  files,
  onRemoveFile,
  onRegenerate,
  onVersionChange
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <>
      <div className={`w-full md:w-[500px] flex flex-col gap-4 shrink-0 ${!showPreview ? 'block' : 'hidden md:flex'}`}>
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-xl shadow-lg flex-1 flex flex-col border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          
          {/* Header */}
          <div className="shrink-0 mb-4">
              <h3 className="text-lg font-bold mb-1 text-zinc-900 dark:text-white">AI Architect</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">
              Ask questions or request changes.
              </p>
          </div>

          {/* Persistent File List */}
          {files.length > 0 && (
              <div className="shrink-0 mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 flex items-center gap-2">
                      <Paperclip className="w-3 h-3" /> Active Context ({files.length})
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-[80px] overflow-y-auto custom-scrollbar pr-1">
                      {files.map((file, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setSelectedFile(file)}
                            className="group flex items-center gap-2 bg-white dark:bg-zinc-700/50 rounded-lg pl-2 pr-1 py-1.5 text-xs border border-zinc-200 dark:border-zinc-600 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                            title="Click to preview"
                          >
                              <span className={`w-1.5 h-1.5 rounded-full ${file.type.startsWith('image') ? 'bg-purple-400' : 'bg-blue-400'}`}></span>
                              <span className="truncate max-w-[120px] text-zinc-700 dark:text-zinc-200" title={file.name}>{file.name}</span>
                              <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveFile(idx);
                                  }}
                                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-500 transition-colors"
                                  title="Remove file from context"
                              >
                                  <X className="w-3 h-3" />
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* Chat History Container */}
          <div className="flex-1 bg-white dark:bg-zinc-900/50 rounded-lg p-4 mb-4 overflow-y-auto border border-zinc-200 dark:border-zinc-700 custom-scrollbar flex flex-col gap-3">
            {messages.map((msg, idx) => (
                <ChatBubble 
                    key={idx}
                    message={msg}
                    isLastAi={msg.role === 'ai' && idx === messages.length - 1}
                    isProcessing={isProcessing}
                    onVersionChange={onVersionChange}
                    onRegenerate={onRegenerate}
                />
            ))}
            <div ref={chatBottomRef}></div>
          </div>

          <ChatInput 
            value={inputMessage}
            onChange={setInputMessage}
            onSend={onSendMessage}
            onStop={() => onStop && onStop()}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      {selectedFile && (
        <FilePreviewModal 
          file={selectedFile} 
          onClose={() => setSelectedFile(null)} 
        />
      )}
    </>
  );
};

export default ChatInterface;

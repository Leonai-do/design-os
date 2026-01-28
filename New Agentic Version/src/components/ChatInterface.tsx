import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { MessageList } from './chat/MessageList';
import { ChatHeader } from './chat/ChatHeader';
import { ChatInput } from './chat/ChatInput';
import { ModelHeader } from './chat/ModelHeader';
import { useChatController } from '../hooks/useChatController';
import { useAppStore } from '../store/useAppStore';

export function ChatInterface() {
  const {
    isOpen, setIsOpen,
    isMinimized, setIsMinimized,
    messages, isTyping,
    input, setInput,
    showCommands, setShowCommands,
    activeContext,
    inputRef,
    handleSend, handleInputChange, handleCommandSelect,
    handleDiscoverySubmit,
    selectedCommand, setSelectedCommand
  } = useChatController();

  const { dynamicContext } = useAppStore();

  // Resize State
  const [size, setSize] = React.useState({ width: 600, height: 800 });
  const isResizingRef = React.useRef(false);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      
      // Calculate new size based on mouse position relative to right-bottom anchor
      const newWidth = window.innerWidth - e.clientX - 16; // 16px right margin
      const newHeight = window.innerHeight - e.clientY - 16; // 16px bottom margin
      
      setSize({
        width: Math.max(350, Math.min(newWidth, window.innerWidth - 40)),
        height: Math.max(400, Math.min(newHeight, window.innerHeight - 40))
      });
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto'; 
    };

    if (isOpen) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen]);

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:scale-105 transition-transform z-50"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  const startResizing = (e: React.MouseEvent) => {
      e.preventDefault();
      isResizingRef.current = true;
      document.body.style.cursor = 'nw-resize';
      document.body.style.userSelect = 'none';
  };

  return (
    <Card 
      style={!isMinimized ? { width: size.width, height: size.height } : undefined}
      className={`fixed right-4 z-50 transition-all duration-300 flex flex-col shadow-2xl border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm
      ${isMinimized 
        ? 'bottom-4 w-72 h-14' 
        : 'bottom-4 max-h-[90vh] max-w-[90vw]'
      }`}
    >
      
      {/* Resize Handle */}
      {!isMinimized && (
          <div 
            onMouseDown={startResizing}
            className="absolute top-0 left-0 w-6 h-6 cursor-nw-resize z-[60] flex items-start justify-start p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-tl-lg transition-colors group"
          >
              <div className="w-2 h-2 border-t-2 border-l-2 border-zinc-300 dark:border-zinc-600 group-hover:border-zinc-400" />
          </div>
      )}

      <ChatHeader 
        isMinimized={isMinimized} 
        setIsMinimized={setIsMinimized} 
        onClose={() => setIsOpen(false)}
        activeContext={activeContext}
      />
      
      {!isMinimized && <ModelHeader />}

      {!isMinimized && (
        <>
          <MessageList 
            messages={messages} 
            isTyping={isTyping} 
            onDiscoverySubmit={handleDiscoverySubmit}
            currentContext={dynamicContext}
          />

          <ChatInput 
            input={input}
            setInput={setInput}
            onSend={handleSend}
            showCommands={showCommands}
            setShowCommands={setShowCommands}
            activeContext={activeContext}
            inputRef={inputRef}
            onCommandSelect={handleCommandSelect}
            onInputChange={handleInputChange}
            selectedCommand={selectedCommand}
            setSelectedCommand={setSelectedCommand}
          />
        </>
      )}
    </Card>
  );
}
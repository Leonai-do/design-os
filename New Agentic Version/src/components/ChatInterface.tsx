import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { MessageList } from './chat/MessageList';
import { ChatHeader } from './chat/ChatHeader';
import { ChatInput } from './chat/ChatInput';
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
    handleDiscoverySubmit
  } = useChatController();

  const { dynamicContext } = useAppStore();

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

  return (
    <Card className={`fixed right-4 z-50 transition-all duration-300 flex flex-col shadow-2xl border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm
      ${isMinimized 
        ? 'bottom-4 w-72 h-14' 
        : 'bottom-4 w-[90vw] sm:w-[450px] h-[600px] max-h-[80vh]'
      }`}>
      
      <ChatHeader 
        isMinimized={isMinimized} 
        setIsMinimized={setIsMinimized} 
        onClose={() => setIsOpen(false)}
        activeContext={activeContext}
      />

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
          />
        </>
      )}
    </Card>
  );
}
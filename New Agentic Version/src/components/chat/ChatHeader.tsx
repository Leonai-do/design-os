
import React from 'react';
import { Minimize2, Maximize2, X } from 'lucide-react';
import { Button } from '../ui/button';

interface ChatHeaderProps {
  isMinimized: boolean;
  setIsMinimized: (value: boolean) => void;
  onClose: () => void;
  activeContext: string | null;
}

export function ChatHeader({ isMinimized, setIsMinimized, onClose, activeContext }: ChatHeaderProps) {
  return (
    <div 
      className="p-3 border-b flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 rounded-t-xl cursor-pointer select-none" 
      onClick={() => !isMinimized && setIsMinimized(!isMinimized)}
    >
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="font-semibold text-sm">Design OS Assistant</span>
        {activeContext && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500 font-mono">
              {activeContext}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
        >
          {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}


import React, { useRef, useState } from 'react';
import { Send, Slash, Paperclip, X } from 'lucide-react';
import { Button } from '../ui/button';
import { CommandMenu } from '../CommandMenu';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (attachments?: string[]) => void;
  showCommands: boolean;
  setShowCommands: (value: boolean) => void;
  activeContext: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onCommandSelect: (command: string) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedCommand?: string | null;
  setSelectedCommand?: (cmd: string | null) => void;
}

export function ChatInput({
  input,
  setInput,
  onSend,
  showCommands,
  setShowCommands,
  activeContext,
  inputRef,
  onCommandSelect,
  onInputChange,
  selectedCommand,
  setSelectedCommand
}: ChatInputProps) {
  const [attachments, setAttachments] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSlashClick = () => {
    setInput('/');
    setShowCommands(true);
    inputRef.current?.focus();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result as string;
          setAttachments(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || selectedCommand) || attachments.length > 0) {
        onSend(attachments);
        setAttachments([]);
    }
  };

  return (
    <div className="p-3 border-t bg-white dark:bg-zinc-950 rounded-b-xl relative z-20">
      <CommandMenu 
        isOpen={showCommands}
        filterText={input}
        onSelect={onCommandSelect}
        onClose={() => setShowCommands(false)}
      />
      
      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {attachments.map((src, i) => (
                <div key={i} className="relative group shrink-0">
                    <img src={src} className="h-16 w-16 object-cover rounded-md border border-zinc-200 dark:border-zinc-800" alt="preview" />
                    <button 
                        onClick={() => removeAttachment(i)}
                        className="absolute -top-1.5 -right-1.5 bg-zinc-900 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ))}
        </div>
      )}

      <form 
        onSubmit={handleSubmit}
        className="flex gap-2 items-end"
      >
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            multiple 
            onChange={handleFileChange}
        />
        
        <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 shrink-0 mb-1"
            onClick={handleFileClick}
            title="Attach image"
        >
            <Paperclip className="h-5 w-5" />
        </Button>

        <div className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-transparent focus-within:border-zinc-200 dark:focus-within:border-zinc-800 rounded-md transition-all flex items-center gap-1 p-1">
            <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 shrink-0 transition-colors ${activeContext ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'}`}
                onClick={handleSlashClick}
                title={activeContext ? `Active Context: ${activeContext}` : 'Commands'}
            >
                <Slash className="h-4 w-4" />
            </Button>
            
            {selectedCommand && (
                <div className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs px-2 py-1 rounded-[4px] flex items-center gap-1 font-mono font-medium shrink-0 select-none animate-in fade-in zoom-in-95 duration-200">
                    {selectedCommand}
                </div>
            )}
            
            <input
                ref={inputRef}
                className="flex-1 bg-transparent border-none px-2 py-2 text-sm focus:outline-none min-h-[40px]"
                placeholder={activeContext ? `Discussing ${activeContext}...` : (selectedCommand ? "Type arguments..." : "Type a message or / for commands...")}
                value={input}
                onChange={onInputChange}
                onKeyDown={(e) => {
                    if (selectedCommand && !input && e.key === 'Backspace') {
                        e.preventDefault();
                        setSelectedCommand?.(null);
                    }
                    if (showCommands && (e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                        if (e.key === 'Enter') e.preventDefault();
                    }
                }}
                autoFocus
            />
        </div>

        <Button type="submit" size="icon" disabled={(!input.trim() && !selectedCommand) && attachments.length === 0}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

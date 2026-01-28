import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Brain } from 'lucide-react';
import { cn } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';

interface ThinkingDisclosureProps {
  content: string;
  isComplete: boolean;
  defaultOpen?: boolean;
}

export function ThinkingDisclosure({ content, isComplete }: ThinkingDisclosureProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom while streaming (rolling effect)
  useEffect(() => {
    if (!isComplete && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content, isComplete]);

  return (
    <div className="rounded-md overflow-hidden my-2 bg-zinc-100 dark:bg-white/5 relative group">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors z-10 relative select-none"
      >
        <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
        <span className="font-medium transition-all duration-300">
          {isComplete ? 'Thought Process' : 'Thinking...'}
        </span>
      </button>

      <div 
        ref={contentRef}
        className={`px-8 transition-all duration-300 ease-in-out ${
            isExpanded 
            ? 'max-h-[500vh] opacity-100 pb-3' 
            : 'max-h-[4.5rem] opacity-90 overflow-hidden'
        }`}
        style={!isExpanded ? { 
            maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
        } : undefined}
      >
          <div className="text-sm font-mono text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap prose dark:prose-invert prose-xs max-w-none opacity-90">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          {!isComplete && (
            <span className="inline-block w-1.5 h-3 ml-1 bg-zinc-400 align-middle animate-pulse" />
          )}
      </div>
    </div>
  );
}


import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import { Button } from './ui/button';
import { Copy, Check, Save, RotateCcw, RotateCw } from 'lucide-react';

interface CodeEditorProps {
  filename: string;
  initialValue: string;
  language: string;
  onClose?: () => void;
  onSave?: (code: string) => void;
}

export function CodeEditor({ filename, initialValue, language, onClose, onSave }: CodeEditorProps) {
  // History State
  const [history, setHistory] = useState<string[]>([initialValue]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const [code, setCode] = useState(initialValue);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Debounce ref
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize history when file changes
  useEffect(() => {
    setCode(initialValue);
    setHistory([initialValue]);
    setHistoryIndex(0);
    setSaved(false);
  }, [filename, initialValue]);

  // Highlight logic
  const highlight = (code: string) => {
    return Prism.highlight(
      code,
      Prism.languages[language] || Prism.languages.clike,
      language
    );
  };

  // Undo / Redo Actions
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCode(history[newIndex]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCode(history[newIndex]);
    }
  }, [history, historyIndex]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                handleRedo();
            } else {
                handleUndo();
            }
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            handleRedo();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handleSave();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleChange = (newCode: string) => {
    setCode(newCode);
    
    // Debounce history update to avoid saving every character
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newCode);
        
        // Optional: limit history size
        if (newHistory.length > 100) newHistory.shift();

        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, 500); // 500ms debounce
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSave?.(code);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm overflow-hidden animate-fade-in">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3e3e42]">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 opacity-80">{language.toUpperCase()}</span>
          <span className="text-zinc-400">/</span>
          <span className="font-medium text-white">{filename}</span>
          {saved && <span className="text-xs text-green-500 ml-2 animate-pulse">Saved</span>}
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="h-7 w-7 text-[#d4d4d4] hover:bg-[#3e3e42] hover:text-white disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="h-7 w-7 text-[#d4d4d4] hover:bg-[#3e3e42] hover:text-white disabled:opacity-30 mr-2"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </Button>

           <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSave}
            className="h-7 text-[#d4d4d4] hover:bg-[#3e3e42] hover:text-white"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Save
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopy}
            className="h-7 text-[#d4d4d4] hover:bg-[#3e3e42] hover:text-white"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          {onClose && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={onClose}
              className="h-7 bg-[#007acc] text-white hover:bg-[#0062a3] border-none ml-2"
            >
              Close Editor
            </Button>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto relative">
        <Editor
          value={code}
          onValueChange={handleChange}
          highlight={highlight}
          padding={20}
          className="font-mono min-h-full"
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 14,
            backgroundColor: '#1e1e1e',
            minHeight: '100%',
          }}
          textareaClassName="focus:outline-none"
        />
      </div>
      
      {/* Status Bar */}
      <div className="bg-[#007acc] text-white px-3 py-1 text-xs flex justify-between items-center">
        <div>
           <span className="mr-4">Ln {code.split('\n').length}</span>
           <span>UTF-8</span>
           <span className="ml-4 opacity-70">History: {historyIndex + 1}/{history.length}</span>
        </div>
        <div>
          {language === 'markdown' ? 'Markdown' : language === 'typescript' ? 'TypeScript' : 'Plain Text'}
        </div>
      </div>
    </div>
  );
}

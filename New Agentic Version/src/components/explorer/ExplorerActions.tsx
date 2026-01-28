
import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, FilePlus, FolderPlus, Upload } from 'lucide-react';

interface ExplorerActionsProps {
  onCreateFile: () => void;
  onCreateFolder: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ExplorerActions({ onCreateFile, onCreateFolder, onFileUpload }: ExplorerActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  return (
    <div className="flex items-center justify-between px-4 py-3 text-xs font-bold tracking-widest text-zinc-500 relative">
      <span>EXPLORER</span>
      <div className="relative" ref={menuRef}>
        <MoreHorizontal 
          className="w-4 h-4 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200" 
          onClick={() => setMenuOpen(!menuOpen)}
        />
        {menuOpen && (
          <div className="absolute right-0 top-6 w-40 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl rounded-lg z-50 py-1 flex flex-col animate-fade-in">
            <button 
              onClick={() => { onCreateFile(); setMenuOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>New File...</span>
            </button>
            <button 
              onClick={() => { onCreateFolder(); setMenuOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>New Folder...</span>
            </button>
            <label 
              className="flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Files...</span>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                onChange={(e) => { onFileUpload(e); setMenuOpen(false); }}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

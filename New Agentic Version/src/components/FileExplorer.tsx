
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Trash, X, AlertTriangle } from 'lucide-react';
import { useDesignStore } from '../lib/store';
import { generateFileContent, getLanguage } from '../lib/generators';
import { FileItem } from './explorer/FileItem';
import { ExplorerActions } from './explorer/ExplorerActions';
import { useFileTree } from '../hooks/useFileTree';
import { FileNode } from './explorer/types';

interface FileExplorerProps {
  onSelectFile?: (file: { name: string, content: string, language: string, path: string }) => void;
  selectedFileName?: string | null;
}

// --- MODALS ---

function CreationModal({ type, onClose, onSubmit }: { type: 'file' | 'folder', onClose: () => void, onSubmit: (name: string) => void }) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  };

  return (
    <div className="absolute inset-0 z-50 flex items-start justify-center pt-20 bg-black/20 backdrop-blur-[1px]">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl w-72 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
           <h3 className="font-semibold text-xs uppercase tracking-wider text-zinc-500">New {type}</h3>
           <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
             <X className="w-3.5 h-3.5" />
           </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
             <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
               {type === 'file' ? 'File Path' : 'Folder Path'}
             </label>
             <input
                ref={inputRef}
                className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent placeholder:text-zinc-400"
                placeholder={type === 'file' ? "src/components/New.tsx" : "src/utils"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">Cancel</button>
            <button type="submit" className="px-3 py-1.5 text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded shadow-sm hover:opacity-90">Create</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmOverwriteModal({ fileName, onClose, onConfirm }: { fileName: string, onClose: () => void, onConfirm: () => void }) {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl w-80 p-6 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-500">
                    <AlertTriangle className="w-6 h-6" />
                    <h3 className="font-bold text-lg">File Conflict</h3>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                    A file named <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 rounded text-zinc-900 dark:text-zinc-100">{fileName}</span> already exists in the destination.
                    <br/><br/>
                    Restoring this file will <strong>overwrite</strong> the current version.
                </p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded hover:bg-red-700">Overwrite</button>
                </div>
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---

export function FileExplorer({ onSelectFile, selectedFileName }: FileExplorerProps) {
  const { data, addCustomFile, deleteFile, restoreFile, permanentlyDeleteFile } = useDesignStore();
  const { activeTree, trashTree, highlightedFiles, deletedFilesCount } = useFileTree();
  
  const [creationType, setCreationType] = useState<'file' | 'folder' | null>(null);
  const [overwriteConfirmItem, setOverwriteConfirmItem] = useState<{ id: string, name: string } | null>(null);

  // Actions
  const handleCreateFile = () => setCreationType('file');
  const handleCreateFolder = () => setCreationType('folder');

  const handleCreationSubmit = (name: string) => {
      const cleanName = name.trim();
      if (!cleanName) return;

      if (creationType === 'file') {
         addCustomFile(cleanName, "// New file");
      } else if (creationType === 'folder') {
         const path = cleanName.endsWith('/') ? cleanName : `${cleanName}/`;
         addCustomFile(`${path}.keep`, "");
      }
      setCreationType(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const content = ev.target?.result as string;
          addCustomFile(`uploads/${file.name}`, content);
        };
        reader.readAsText(file);
      });
    }
  };

  const handleNodeSelect = (node: FileNode) => {
    if (node.type === 'file' && onSelectFile) {
        // If it's a trash item, we display the content from the trash snapshot
        if (node.trashId) {
            const trashItem = data.trash?.find(t => t.id === node.trashId);
            if (trashItem) {
                const language = getLanguage(node.originalName || node.name);
                onSelectFile({ name: node.name, content: trashItem.content, language, path: node.path });
            }
        } else {
            const content = generateFileContent(node.path, data);
            const language = getLanguage(node.name);
            onSelectFile({ name: node.name, content, language, path: node.path });
        }
    }
  }
  
  // WRAPPER for FileItem callbacks to translate to store actions
  const onFileAction = (node: FileNode, action: 'delete' | 'restore') => {
      if (action === 'delete') {
          if (node.trashId) {
              permanentlyDeleteFile(node.trashId);
          } else {
              deleteFile(node.path);
          }
      } else if (action === 'restore') {
          if (!node.trashId) return;
          
          // Check for conflict
          const isConflict = !data.hiddenFiles?.includes(node.path) && (
              data.customFiles?.some(f => f.path === node.path) || 
              // Check if it matches a generated file that ISN'T hidden (meaning it exists in active)
              !data.hiddenFiles?.includes(node.path)
          );

          if (isConflict) {
              setOverwriteConfirmItem({ id: node.trashId, name: node.originalName || node.name });
          } else {
              restoreFile(node.trashId);
          }
      }
  };

  const renderTree = (nodes: FileNode[], isTrash = false) => {
     return nodes.map((node) => (
        <FileItem 
            key={isTrash ? (node.trashId || node.path) : node.path} 
            node={node} 
            onSelect={handleNodeSelect}
            selectedFileName={selectedFileName}
            // Pass custom handlers that call onFileAction with the node
            onDelete={() => onFileAction(node, 'delete')}
            onRestore={() => onFileAction(node, 'restore')}
            isTrashItem={isTrash}
            isHighlighted={highlightedFiles.includes(node.name)}
        />
     ));
  }

  return (
    <div className="flex flex-col h-full bg-zinc-100 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 font-sans text-sm select-none relative">
      
      {creationType && (
        <CreationModal 
            type={creationType} 
            onClose={() => setCreationType(null)} 
            onSubmit={handleCreationSubmit} 
        />
      )}

      {overwriteConfirmItem && (
        <ConfirmOverwriteModal
            fileName={overwriteConfirmItem.name}
            onClose={() => setOverwriteConfirmItem(null)}
            onConfirm={() => {
                restoreFile(overwriteConfirmItem.id);
                setOverwriteConfirmItem(null);
            }}
        />
      )}

      <ExplorerActions 
        onCreateFile={handleCreateFile}
        onCreateFolder={handleCreateFolder}
        onFileUpload={handleFileUpload}
      />

      {/* Main Workspace */}
      <div className="px-2 py-1 flex items-center font-bold text-xs bg-zinc-200/50 dark:bg-zinc-800/50 cursor-pointer">
        <ChevronDown className="w-3 h-3 mr-1" />
        <span>DESIGN-OS-WORKSPACE</span>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {renderTree(activeTree)}

        {/* Empty State */}
        {activeTree.length === 1 && activeTree[0].children?.length === 0 && (
            <div className="px-6 py-4 text-xs text-zinc-400 italic">
                No active files.
            </div>
        )}

        {/* Trash Section */}
        {deletedFilesCount > 0 && (
            <div className="mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-2">
                 <div className="px-2 py-1 flex items-center font-bold text-xs text-zinc-500">
                    <Trash className="w-3 h-3 mr-1" />
                    <span>TRASH ({deletedFilesCount})</span>
                </div>
                {renderTree(trashTree, true)}
            </div>
        )}
      </div>
    </div>
  )
}

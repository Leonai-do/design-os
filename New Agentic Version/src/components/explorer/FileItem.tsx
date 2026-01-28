
import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  FileJson, 
  FileType, 
  FileCode, 
  File as FileIcon, 
  Folder, 
  FolderOpen,
  Hash,
  Trash2,
  RotateCcw,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { FileNode } from './types';

interface FileItemProps {
  node: FileNode;
  depth?: number;
  onSelect: (node: FileNode) => void;
  selectedFileName?: string | null;
  onDelete?: () => void;
  onRestore?: () => void;
  isTrashItem?: boolean;
  isHighlighted?: boolean;
}

export function FileItem({ 
  node, 
  depth = 0, 
  onSelect,
  selectedFileName,
  onDelete,
  onRestore,
  isTrashItem = false,
  isHighlighted = false
}: FileItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = node.type === 'file' && node.name === selectedFileName;
  
  const getIcon = () => {
    if (node.type === 'folder') {
      return isOpen ? 
        <FolderOpen className="w-4 h-4 text-zinc-500" /> : 
        <Folder className="w-4 h-4 text-zinc-500" />
    }
    
    if (node.name.endsWith('.json')) return <FileJson className="w-4 h-4 text-yellow-500" />
    if (node.name.endsWith('.md')) return <FileIcon className="w-4 h-4 text-blue-400" />
    if (node.name.endsWith('.ts') || node.name.endsWith('.tsx')) return <FileCode className="w-4 h-4 text-blue-500" />
    if (node.name.endsWith('.prisma')) return <FileCode className="w-4 h-4 text-teal-500" />
    if (node.name.endsWith('.css')) return <Hash className="w-4 h-4 text-sky-400" />
    
    return <FileType className="w-4 h-4 text-zinc-400" />
  }

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'U': return 'text-green-500' 
      case 'M': return 'text-yellow-500' 
      case 'A': return 'text-green-500'
      case 'D': return 'text-red-500' 
      default: return ''
    }
  }

  return (
    <div className="group/item relative">
      <div 
        className={cn(
          "flex items-center gap-1.5 py-1 px-2 cursor-pointer select-none text-sm border-l-2 pr-8 transition-colors duration-300",
          isSelected 
            ? "bg-zinc-200 dark:bg-zinc-800 border-zinc-600 dark:border-zinc-400" 
            : "border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-800",
          isHighlighted && "bg-green-100 dark:bg-green-900/30 animate-pulse",
          depth > 0 && "ml-0" 
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => {
          if (node.type === 'folder') setIsOpen(!isOpen)
          else onSelect(node)
        }}
      >
        <span className="opacity-70 group-hover/item:opacity-100 transition-opacity">
          {node.type === 'folder' && (
            isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
          )}
          {node.type === 'file' && <span className="w-3 inline-block" />}
        </span>
        
        {getIcon()}
        
        <span className={cn(
          "ml-1 truncate flex-1", 
          node.status === 'M' ? "text-yellow-600 dark:text-yellow-400" : 
          node.status === 'U' ? "text-green-600 dark:text-green-400" : 
          "text-zinc-700 dark:text-zinc-300",
          isTrashItem && "line-through opacity-50"
        )}>
          {node.name}
        </span>

        {node.status && !isTrashItem && (
          <span className={cn("text-[10px] font-bold px-1.5 mr-1", getStatusColor(node.status))}>
            {node.status}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      {node.type === 'file' && (
        <div className="absolute right-2 top-1 hidden group-hover/item:flex items-center gap-1">
            {isTrashItem ? (
                <>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRestore?.(); }}
                        className="text-zinc-400 hover:text-green-600 p-1 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded transition-colors"
                        title="Restore file"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                        className="text-zinc-400 hover:text-red-600 p-1 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded transition-colors"
                        title="Permanently Delete"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </>
            ) : (
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                    className="text-zinc-400 hover:text-red-600 p-1 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded transition-colors"
                    title="Delete file"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
      )}
      
      {node.type === 'folder' && isOpen && node.children && (
        <div>
          {node.children.map((child, i) => (
            <FileItem 
              key={i} 
              node={child} 
              depth={depth + 1} 
              onSelect={onSelect}
              selectedFileName={selectedFileName}
              onDelete={onDelete}
              onRestore={onRestore}
              isTrashItem={isTrashItem}
              isHighlighted={isHighlighted}
            />
          ))}
        </div>
      )}
    </div>
  )
}

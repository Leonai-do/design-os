
import React, { useEffect, useState } from 'react';
import { FileText, Map, Database, Palette, ChevronRight, Slash, Package, ClipboardList, Layout, Code, Camera, PanelLeft } from 'lucide-react';
import { Card } from './ui/card';
import { cn } from '../lib/utils';

export interface Command {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

export const COMMANDS: Command[] = [
  { id: 'vision', label: '/product-vision', description: 'Define vision, problems, and features', icon: FileText },
  { id: 'roadmap', label: '/product-roadmap', description: 'Generate development phases', icon: Map },
  { id: 'data', label: '/data-model', description: 'Define entities and relationships', icon: Database },
  { id: 'design', label: '/design-tokens', description: 'Generate color palette and typography', icon: Palette },
  { id: 'shell', label: '/design-shell', description: 'Design application layout and navigation', icon: PanelLeft },
  { id: 'section-spec', label: '/section-spec', description: 'Generate specs for a section', icon: ClipboardList },
  { id: 'section-data', label: '/section-data', description: 'Generate sample data for a section', icon: Code },
  { id: 'section-ui', label: '/section-ui', description: 'Generate UI components for a section', icon: Layout },
  { id: 'screenshot', label: '/screenshot-design', description: 'Capture screenshot of current design', icon: Camera },
  { id: 'export', label: '/export-product', description: 'Generate final handoff package', icon: Package },
];

interface CommandMenuProps {
  isOpen: boolean;
  filterText: string;
  onSelect: (command: string) => void;
  onClose: () => void;
}

export function CommandMenu({ isOpen, filterText, onSelect, onClose }: CommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter logic: match if command starts with filter text (case insensitive)
  const filteredCommands = COMMANDS.filter(cmd => 
    cmd.label.toLowerCase().startsWith(filterText.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filterText]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        // Only prevent default if we have a valid selection and commands are visible
        if (filteredCommands[selectedIndex]) {
           e.preventDefault(); 
           onSelect(filteredCommands[selectedIndex].label);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onSelect, onClose]);

  if (!isOpen || filteredCommands.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 w-full mb-3 px-3 z-50">
        <Card className="overflow-hidden shadow-2xl border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200 ring-1 ring-black/5">
        <div className="p-1.5 flex flex-col gap-0.5">
            <div className="px-2 py-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Slash className="w-3 h-3" />
                Commands
            </div>
            {filteredCommands.map((cmd, index) => {
            const Icon = cmd.icon;
            const isSelected = index === selectedIndex;
            
            return (
                <button
                key={cmd.id}
                className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all duration-150 outline-none",
                    isSelected 
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 scale-[1.01] shadow-sm' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                )}
                onClick={() => onSelect(cmd.label)}
                onMouseEnter={() => setSelectedIndex(index)}
                >
                <div className={cn(
                    "p-2 rounded-md flex items-center justify-center transition-colors",
                    isSelected ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800/50'
                )}>
                    <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-mono font-medium text-sm tracking-tight">{cmd.label}</div>
                    <div className="text-xs opacity-70 truncate">{cmd.description}</div>
                </div>
                {isSelected && <ChevronRight className="w-4 h-4 opacity-50 animate-pulse" />}
                </button>
            );
            })}
        </div>
        </Card>
    </div>
  );
}

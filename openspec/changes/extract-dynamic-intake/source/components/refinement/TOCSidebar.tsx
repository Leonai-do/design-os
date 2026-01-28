import React from 'react';
import { TocItem } from '../../hooks/useRefinementLogic';

interface TOCSidebarProps {
  toc: TocItem[];
  activeId: string;
  onScrollToSection: (id: string) => void;
}

const TOCSidebar: React.FC<TOCSidebarProps> = ({ toc, activeId, onScrollToSection }) => {
  return (
    <div className="hidden xl:flex w-64 flex-col bg-transparent rounded-lg shrink-0 overflow-hidden">
      <div className="p-3">
         <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Contents</h3>
         <nav className="space-y-1 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-200px)] pr-2 custom-scrollbar">
            {toc.map((item, index) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={`${item.id}-${index}`}
                  onClick={() => onScrollToSection(item.id)}
                  className={`block w-full text-left text-sm py-1.5 px-3 rounded-md transition-all truncate border-l-2
                    ${isActive 
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium' 
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}
                    ${item.level === 2 ? 'ml-3' : ''} 
                    ${item.level === 3 ? 'ml-6' : ''}
                  `}
                  title={item.text}
                >
                  {item.text}
                </button>
              );
            })}
            {toc.length === 0 && <div className="text-sm text-slate-400 italic">No headers found.</div>}
         </nav>
      </div>
    </div>
  );
};

export default TOCSidebar;

import React from 'react';
import { PrdContext, ModelConfig } from '../../types';

interface ContextSidebarProps {
  context: PrdContext;
  files: File[];
  modelConfig: ModelConfig;
  getLabelForKey: (key: string) => string;
}

const ContextSidebar: React.FC<ContextSidebarProps> = ({ context, files, modelConfig, getLabelForKey }) => {
  return (
    <div className="hidden lg:block col-span-1 h-full">
        <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border-2 border-brand-500/20 dark:border-brand-500/10 p-6 max-h-[calc(100vh-7rem)] flex flex-col">
            <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <i className="fa-solid fa-list-check text-brand-500"></i>
                    Live Context Draft
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Summary of defined inputs and decisions.
                </p>
            </div>

            {files.length > 0 && (
              <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Attached Files</span>
                 <div className="space-y-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded opacity-100">
                         <i className="fa-solid fa-paperclip text-brand-500"></i> <span className="truncate">{f.name}</span>
                         {(f.type.startsWith('image/') && !modelConfig.capabilities.image) && (
                            <span className="text-[10px] text-amber-500 ml-auto" title="Model cannot see this image">
                               <i className="fa-solid fa-eye-slash"></i>
                            </span>
                         )}
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {Object.keys(context).length === 0 && files.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                     <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                        <i className="fa-regular fa-clipboard text-2xl"></i>
                     </div>
                     <p className="text-sm text-slate-500">Your inputs will be drafted here automatically.</p>
                </div>
            ) : (
                <div className="space-y-5 overflow-y-auto custom-scrollbar pr-2 flex-1">
                    {Object.entries(context).map(([key, value]) => {
                         if (key.startsWith('custom_notes_') && !value) return null;
                         if (key.endsWith('_notes')) return null; // Skip internal notes objects
                         
                         return (
                            <div key={key} className="animate-fade-in group">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5 group-hover:text-brand-500 transition-colors">
                                    {getLabelForKey(key)}
                                </span>
                                <div className="text-sm text-slate-800 dark:text-slate-200 font-medium bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                    {Array.isArray(value) ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {value.map((v, i) => (
                                                <span key={i} className="inline-block px-2 py-0.5 bg-white dark:bg-slate-700 rounded text-xs border border-slate-200 dark:border-slate-600 shadow-sm text-slate-600 dark:text-slate-300">
                                                    {v}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="break-words">{value && typeof value === 'object' ? JSON.stringify(value) : value}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
  );
};

export default ContextSidebar;

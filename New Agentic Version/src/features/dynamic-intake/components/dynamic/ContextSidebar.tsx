
import React from 'react';
import { PrdContext, ModelConfig } from '../../types';
import { ListChecks, Paperclip, EyeOff, Clipboard } from 'lucide-react';

interface ContextSidebarProps {
  context: PrdContext;
  files: File[];
  modelConfig: ModelConfig;
  getLabelForKey: (key: string) => string;
}

const ContextSidebar: React.FC<ContextSidebarProps> = ({ context, files, modelConfig, getLabelForKey }) => {
  return (
    <div className="hidden lg:block col-span-1 h-full">
        <div className="sticky top-24 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border-2 border-zinc-100 dark:border-zinc-800 p-6 max-h-[calc(100vh-7rem)] flex flex-col">
            <div className="mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                <h3 className="text-lg font-bold text-zinc-800 dark:text-white flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                    Live Context Draft
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Summary of defined inputs and decisions.
                </p>
            </div>

            {files.length > 0 && (
              <div className="mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                 <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">Attached Files</span>
                 <div className="space-y-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded opacity-100">
                         <Paperclip className="w-3 h-3 text-zinc-500" /> <span className="truncate">{f.name}</span>
                         {(f.type.startsWith('image/') && !modelConfig.capabilities.image) && (
                            <span className="text-[10px] text-amber-500 ml-auto" title="Model cannot see this image">
                               <EyeOff className="w-3 h-3" />
                            </span>
                         )}
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {Object.keys(context).length === 0 && files.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 p-4 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl">
                     <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                        <Clipboard className="w-6 h-6" />
                     </div>
                     <p className="text-sm text-zinc-500">Your inputs will be drafted here automatically.</p>
                </div>
            ) : (
                <div className="space-y-5 overflow-y-auto pr-2 flex-1">
                    {Object.entries(context).map(([key, value]) => {
                         if (key.startsWith('custom_notes_') && !value) return null;
                         if (key.endsWith('_notes')) return null; // Skip internal notes objects
                         
                         return (
                            <div key={key} className="animate-fade-in group">
                                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5 group-hover:text-zinc-800 dark:group-hover:text-zinc-300 transition-colors">
                                    {getLabelForKey(key)}
                                </span>
                                <div className="text-sm text-zinc-800 dark:text-zinc-200 font-medium bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                    {Array.isArray(value) ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {value.map((v, i) => (
                                                <span key={i} className="inline-block px-2 py-0.5 bg-white dark:bg-zinc-700 rounded text-xs border border-zinc-200 dark:border-zinc-600 shadow-sm text-zinc-600 dark:text-zinc-300">
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

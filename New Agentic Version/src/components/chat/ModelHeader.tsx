import React from 'react';
import { useSettingsStore, getEffectiveCapabilities } from '../../store/settingsStore';
import { Brain, Eye, Wrench } from 'lucide-react';

export function ModelHeader() {
  const { provider, modelCapabilitiesOverrides } = useSettingsStore();
  const { selectedModel, currentModelConfig } = provider;
  const providerType = provider.type || 'ollama';
  const providerLabel = providerType === 'lmstudio' ? 'LM Studio' : 
                        providerType === 'google' ? 'Gemini' : 
                        providerType.charAt(0).toUpperCase() + providerType.slice(1);
  
  const capabilities = getEffectiveCapabilities(
    currentModelConfig?.capabilities,
    selectedModel ? modelCapabilitiesOverrides[selectedModel] : undefined
  );

  if (!selectedModel) return null;

  return (
    <div className="flex items-center justify-center gap-3 py-2 border-b border-border/40 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                {providerLabel}
            </span>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {selectedModel}
            </span>
        </div>
        
        <div className="flex gap-1.5">
            {capabilities.thinking && (
                <div className="flex items-center gap-1 text-[10px] font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 px-1.5 py-0.5 rounded-full border border-sky-100 dark:border-sky-800/50">
                    <Brain className="w-3 h-3" />
                    <span>Thinking</span>
                </div>
            )}
            {capabilities.vision && (
                <div className="flex items-center gap-1 text-[10px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-1.5 py-0.5 rounded-full border border-purple-100 dark:border-purple-800/50">
                    <Eye className="w-3 h-3" />
                    <span>Vision</span>
                </div>
            )}
            {capabilities.tools && (
                <div className="flex items-center gap-1 text-[10px] font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-full border border-orange-100 dark:border-orange-800/50">
                    <Wrench className="w-3 h-3" />
                    <span>Tools</span>
                </div>
            )}
        </div>
    </div>
  );
}

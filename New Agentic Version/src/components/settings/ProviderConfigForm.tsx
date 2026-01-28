
import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { checkConnection, fetchModels, fetchModelDetails, detectCapabilities, extractContextLength } from '../../services/ollama';
import { CapabilityBadges } from './CapabilityBadges';
import { ModelParameters } from './ModelParameters';

export const ProviderConfigForm: React.FC = () => {
    const { 
        provider, 
        setProviderUrl, 
        setApiKey,
        setModels, 
        setSelectedModel, 
        setModelCapabilities,
        updateModelConfig
    } = useSettingsStore();

    const [status, setStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
    const [loadingModels, setLoadingModels] = useState(false);

    const handleCheckConnection = async () => {
        setStatus('checking');
        const isConnected = await checkConnection(provider.url, provider.apiKey);
        setStatus(isConnected ? 'connected' : 'error');
        
        if (isConnected) {
            setLoadingModels(true);
            const models = await fetchModels(provider.url, provider.apiKey);
            setModels(models);
            
            // If current selected model is not in list (and list not empty), select first or default
            if (models.length > 0 && (!provider.selectedModel || !models.includes(provider.selectedModel))) {
                // If default preference exists and in list, keep it, else first
                const defaultModel = 'kimi-k2.5:cloud';
                if (models.includes(defaultModel)) {
                    setSelectedModel(defaultModel);
                } else {
                    setSelectedModel(models[0]);
                }
            }
            setLoadingModels(false);
        }
    };

    // Auto-check on mount if URL exists
    useEffect(() => {
        if (provider.url) {
            handleCheckConnection();
        }
    }, []);

    // Fetch details when model changes to update capabilities and context length
    useEffect(() => {
        const updateModelInfo = async () => {
            if (provider.selectedModel && status === 'connected') {
                const details = await fetchModelDetails(provider.url, provider.selectedModel, provider.apiKey);
                const caps = detectCapabilities(provider.selectedModel, details);
                setModelCapabilities(caps);
                
                // Extract max context length from model_info (now includes cloud data if fetched)
                const maxCtx = extractContextLength(details);
                updateModelConfig({ maxContextLength: maxCtx });
                
                // Also update config with thinking defaults if applicable
                if (caps.thinking) {
                    updateModelConfig({ think: true });
                }
            }
        };
        updateModelInfo();
    }, [provider.selectedModel, status]);

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">API Endpoint</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={provider.url}
                        onChange={(e) => setProviderUrl(e.target.value)}
                        placeholder="http://localhost:11434"
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                    <button
                        onClick={handleCheckConnection}
                        disabled={status === 'checking'}
                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-300 transition-colors disabled:opacity-50"
                        title="Check Connection"
                    >
                        <RefreshCw size={18} className={status === 'checking' ? 'animate-spin' : ''} />
                    </button>
                </div>
                
                {/* API Key Input - Added */}
                <div className="mt-2">
                     <label className="text-xs font-medium text-zinc-400 mb-1 block">API Key (Optional)</label>
                     <input
                        type="password"
                        value={provider.apiKey || ''}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                </div>

                {status === 'error' && (
                    <div className="flex items-start gap-2 text-xs text-red-400 mt-1.5 p-2 bg-red-500/10 rounded border border-red-500/20">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium">Connection Failed</p>
                            <p className="opacity-80 mt-0.5">Make sure Ollama is running and CORS is enabled:</p>
                            <code className="block mt-1 bg-black/30 p-1 rounded font-mono text-[10px]">OLLAMA_ORIGINS="*" ollama serve</code>
                        </div>
                    </div>
                )}
                {status === 'connected' && (
                    <div className="text-xs text-green-400 flex items-center gap-1.5 px-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        Connected to Ollama
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Model</label>
                <div className="relative">
                     <select
                        value={provider.selectedModel || ''}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        disabled={loadingModels || provider.models.length === 0}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 appearance-none disabled:opacity-50"
                    >
                        {loadingModels ? (
                            <option>Loading models...</option>
                        ) : provider.models.length === 0 ? (
                            <option value="">No models found</option>
                        ) : (
                            provider.models.map(model => (
                                <option key={model} value={model}>{model}</option>
                            ))
                        )}
                    </select>
                     {/* Custom dropdown arrow if needed, but standard select is fine for MVP */}
                </div>
            </div>

            <CapabilityBadges capabilities={provider.currentModelConfig?.capabilities} />
            
            <ModelParameters />
        </div>
    );
};

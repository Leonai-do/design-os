
import React, { useEffect, useState, useMemo } from 'react';
import { RefreshCw, AlertCircle, Server, Eye, Wrench, Brain, Check, X } from 'lucide-react';
import { useSettingsStore, ProviderType, getEffectiveCapabilities } from '../../store/settingsStore';
import * as ollamaService from '../../services/ollama';
import * as lmstudioService from '../../services/lmstudio';
import { ModelParameters } from './ModelParameters';

export const ProviderConfigForm: React.FC = () => {
    const { 
        provider,
        setProviderType, 
        setProviderUrl, 
        setApiKey,
        setModels, 
        setSelectedModel, 
        setModelCapabilities,
        updateModelConfig,
        modelCapabilitiesOverrides,
        setModelCapabilityOverride
    } = useSettingsStore();

    const [status, setStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
    const [loadingModels, setLoadingModels] = useState(false);

    // Calculate effective capabilities
    const effectiveCaps = useMemo(() => {
        return getEffectiveCapabilities(
            provider.currentModelConfig?.capabilities,
            provider.selectedModel ? modelCapabilitiesOverrides[provider.selectedModel] : undefined
        );
    }, [provider.currentModelConfig?.capabilities, modelCapabilitiesOverrides, provider.selectedModel]);

    // Helper to get active service functions
    const getService = () => {
        if (provider.type === 'lmstudio') return lmstudioService;
        return ollamaService; // Default to Ollama
    };

    const handleCheckConnection = async () => {
        // Skip for Google
        if (provider.type === 'google') return;

        setStatus('checking');
        const service = getService();
        const isConnected = await service.checkConnection(provider.url); // Connection check often doesn't need API key for local, but can pass if updated signature
        
        setStatus(isConnected ? 'connected' : 'error');
        
        if (isConnected) {
            setLoadingModels(true);
            let modelList: string[] = [];
            if (provider.type === 'ollama') {
                modelList = await ollamaService.fetchModels(provider.url, provider.apiKey);
            } else {
                modelList = await lmstudioService.fetchModels(provider.url);
            }

            setModels(modelList);
            
            // If current selected model is not in list (and list not empty), select first or default
            if (modelList.length > 0 && (!provider.selectedModel || !modelList.includes(provider.selectedModel))) {
                const defaultModel = 'kimi-k2.5:cloud';
                if (modelList.includes(defaultModel)) {
                    setSelectedModel(defaultModel);
                } else {
                    setSelectedModel(modelList[0]);
                }
            }
            setLoadingModels(false);
        }
    };

    // Auto-check on mount if URL exists and not google
    useEffect(() => {
        if (provider.type !== 'google' && provider.url) {
            handleCheckConnection();
        }
    }, [provider.type]); // Re-check when provider type changes

    // Update details when model changes
    useEffect(() => {
        const updateModelInfo = async () => {
            if (provider.selectedModel && status === 'connected' && provider.type !== 'google') {
                const service = getService();
                let details;
                if (provider.type === 'ollama') {
                    details = await ollamaService.fetchModelDetails(provider.url, provider.selectedModel, provider.apiKey);
                } else {
                    details = await lmstudioService.fetchModelDetails(provider.url, provider.selectedModel);
                }

                // Detect capabilities
                const caps = service.detectCapabilities(provider.selectedModel, details);
                setModelCapabilities(caps);
                
                // Extract max context length
                const maxCtx = service.extractContextLength(details);
                updateModelConfig({ maxContextLength: maxCtx });
                
                // Thinking defaults
                if (caps.thinking) {
                    updateModelConfig({ think: true });
                }
            } else if (provider.type === 'google') {
                // Determine google caps if needed, usually fixed or detected differently
            }
        };
        updateModelInfo();
    }, [provider.selectedModel, status, provider.type]);

    const getProviderLabel = (type: ProviderType) => {
        switch (type) {
            case 'ollama': return 'Ollama';
            case 'lmstudio': return 'LM Studio';
            case 'google': return 'Google';
            default: return type;
        }
    };

    const CapabilityToggle = ({ 
        label, 
        icon: Icon, 
        active, 
        onChange 
    }: { 
        label: string; 
        icon: any; 
        active: boolean; 
        onChange: (val: boolean) => void 
    }) => (
        <button
            onClick={() => onChange(!active)}
            className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                active 
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-100' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
        >
            <div className="flex items-center gap-2">
                <Icon size={14} className={active ? 'text-blue-400' : 'text-zinc-500'} />
                <span className="text-xs font-medium">{label}</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${active ? 'bg-blue-500' : 'bg-zinc-700'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${active ? 'left-4.5' : 'left-0.5'}`} style={{ left: active ? '18px' : '2px' }} />
            </div>
        </button>
    );

    return (
        <div className="space-y-4">
            {/* Provider Type Selector */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Provider</label>
                <div className="relative">
                    <select
                        value={provider.type || 'ollama'}
                        onChange={(e) => setProviderType(e.target.value as ProviderType)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 appearance-none pl-9"
                    >
                        <option value="ollama">Ollama</option>
                        <option value="lmstudio">LM Studio</option>
                        <option value="google">Google Gemini</option>
                    </select>
                    <Server size={14} className="absolute left-3 top-2.5 text-zinc-500 pointer-events-none" />
                </div>
            </div>

            {/* URL Input (Hidden for Google) */}
            {provider.type !== 'google' && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">API Endpoint</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={provider.url}
                            onChange={(e) => setProviderUrl(e.target.value)}
                            placeholder={provider.type === 'ollama' ? "http://localhost:11434" : "http://localhost:1234 (Auto-proxied)"}
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
                </div>
            )}
            
            {/* API Key Input */}
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

            {/* Connection Status Messages */}
            {status === 'error' && provider.type !== 'google' && (
                <div className="flex items-start gap-2 text-xs text-red-400 mt-1.5 p-2 bg-red-500/10 rounded border border-red-500/20">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <div>
                        <p className="font-medium">Connection Failed</p>
                        {provider.type === 'ollama' ? (
                            <>
                                <p className="opacity-80 mt-0.5">Make sure Ollama is running and CORS is enabled:</p>
                                <code className="block mt-1 bg-black/30 p-1 rounded font-mono text-[10px]">OLLAMA_ORIGINS="*" ollama serve</code>
                            </>
                        ) : (
                            <>
                                <p className="opacity-80 mt-0.5">Make sure LM Studio server is started.</p>
                                <p className="opacity-80 mt-0.5">Go to Developer tab → Start Server (OpenAI Compatible Server)</p>
                            </>
                        )}
                    </div>
                </div>
            )}
            {status === 'connected' && provider.type !== 'google' && (
                <div className="text-xs text-green-400 flex items-center gap-1.5 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    Connected to {getProviderLabel(provider.type)}
                </div>
            )}

            {/* Model Selection */}
            {provider.type !== 'google' && (
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
                    </div>
                </div>
            )}

            {/* Capability Overrides - Replaces implicit CapabilityBadges */}
            {provider.selectedModel && (
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                    <label className="text-sm font-medium text-zinc-300 flex items-center justify-between">
                        Capabilities 
                        <span className="text-[10px] text-zinc-500 font-normal ml-2">(Auto-detected + Manual Override)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <CapabilityToggle 
                            label="Thinking" 
                            icon={Brain} 
                            active={effectiveCaps.thinking} 
                            onChange={(val) => provider.selectedModel && setModelCapabilityOverride(provider.selectedModel, 'thinking', val)} 
                        />
                        <CapabilityToggle 
                            label="Vision" 
                            icon={Eye} 
                            active={effectiveCaps.vision} 
                            onChange={(val) => provider.selectedModel && setModelCapabilityOverride(provider.selectedModel, 'vision', val)} 
                        />
                        <CapabilityToggle 
                            label="Tools" 
                            icon={Wrench} 
                            active={effectiveCaps.tools} 
                            onChange={(val) => provider.selectedModel && setModelCapabilityOverride(provider.selectedModel, 'tools', val)} 
                        />
                    </div>
                </div>
            )}
            
            <ModelParameters />
        </div>
    );
};

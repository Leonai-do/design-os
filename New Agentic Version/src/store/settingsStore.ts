
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ProviderType = 'ollama' | 'lmstudio' | 'google';

export interface ModelCapabilities {
  vision: boolean;
  tools: boolean;
  thinking: boolean;
  embedding?: boolean;
}

export interface ModelConfig {
  name: string;
  parameters: {
    temperature: number;
    topP?: number;
    topK?: number;
    numCtx?: number;
    maxContextLength?: number; // Max context length of the model (from model_info)
    maxTokens?: number; // Max output tokens
    think?: boolean;
  };
  capabilities?: ModelCapabilities;
}

export interface ProviderConfig {
  type: ProviderType;
  url: string;
  apiKey?: string;
  selectedModel?: string;
  models: string[]; // List of available model names
  currentModelConfig?: ModelConfig; // Configuration for the currently selected model
}

interface SettingsState {
  provider: ProviderConfig;
  isOpen: boolean; // Settings modal open state
  modelCapabilitiesOverrides: Record<string, Partial<ModelCapabilities>>; // Persisted overrides per model
  
  // Actions
  setProviderType: (type: ProviderType) => void;
  setProviderUrl: (url: string) => void;
  setApiKey: (key: string) => void;
  setModels: (models: string[]) => void;
  setSelectedModel: (model: string) => void;
  updateModelConfig: (config: Partial<ModelConfig['parameters']>) => void;
  setModelCapabilities: (capabilities: ModelCapabilities) => void;
  setModelCapabilityOverride: (modelId: string, capability: keyof ModelCapabilities, value: boolean | undefined) => void;
  toggleSettings: (isOpen?: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      provider: {
        type: 'ollama',
        url: 'http://localhost:11434',
        models: [],
        selectedModel: 'kimi-k2.5:cloud', // Default model
        currentModelConfig: {
            name: 'kimi-k2.5:cloud',
            parameters: {
                temperature: 0.7,
                numCtx: 4096
            }
        }
      },
      isOpen: false,
      modelCapabilitiesOverrides: {},

      setProviderType: (type) => set((state) => {
        // ALWAYS reset URL to default for the provider type (don't keep old URL)
        let defaultUrl = 'http://localhost:11434';
        if (type === 'ollama') defaultUrl = 'http://localhost:11434';
        else if (type === 'lmstudio') defaultUrl = '/lmstudio-proxy'; // Use Vite proxy to avoid CORS
        else if (type === 'google') defaultUrl = ''; // Google uses API key, not URL
        
        return {
            provider: {
                ...state.provider,
                type,
                url: defaultUrl,
                models: [], // Clear models list when switching
                selectedModel: undefined, // Clear selected model
                // Reset capabilities when switching provider as detection logic differs
                currentModelConfig: state.provider.currentModelConfig ? {
                    ...state.provider.currentModelConfig,
                    capabilities: undefined
                } : undefined
            }
        };
      }),

      setProviderUrl: (url) => set((state) => ({ 
        provider: { ...state.provider, url } 
      })),

      setApiKey: (apiKey) => set((state) => ({ 
        provider: { ...state.provider, apiKey } 
      })),

      setModels: (models) => set((state) => ({ 
        provider: { ...state.provider, models } 
      })),

      setSelectedModel: (selectedModel) => set((state) => ({ 
        provider: { 
            ...state.provider, 
            selectedModel,
            // Reset config when model changes? Or keep? keeping checks simple for now
            currentModelConfig: {
                ...state.provider.currentModelConfig!,
                name: selectedModel
            }
        } 
      })),

      updateModelConfig: (params) => set((state) => {
          if (!state.provider.currentModelConfig) return state;
          
          const newParameters = {
              ...state.provider.currentModelConfig.parameters,
              ...params
          };

          // If maxTokens is undefined or empty string (coerced), remove it
          if (params.maxTokens === undefined && 'maxTokens' in params) {
              delete newParameters.maxTokens;
          }

          return {
            provider: {
                ...state.provider,
                currentModelConfig: {
                    ...state.provider.currentModelConfig,
                    parameters: newParameters
                }
            }
          };
      }),

      setModelCapabilities: (capabilities) => set((state) => {
        if (!state.provider.currentModelConfig) return state;
        return {
            provider: {
                ...state.provider,
                currentModelConfig: {
                    ...state.provider.currentModelConfig,
                    capabilities
                }
            }
        };
      }),

      setModelCapabilityOverride: (modelId, capability, value) => set((state) => {
        const currentOverrides = state.modelCapabilitiesOverrides[modelId] || {};
        const newOverrides = { ...currentOverrides };

        if (value === undefined) {
            delete newOverrides[capability];
        } else {
            // @ts-ignore
            newOverrides[capability] = value;
        }

        // Clean up empty objects if needed, but not strictly necessary
        
        return {
            modelCapabilitiesOverrides: {
                ...state.modelCapabilitiesOverrides,
                [modelId]: newOverrides
            }
        };
      }),

      toggleSettings: (isOpen) => set((state) => ({ 
        isOpen: isOpen ?? !state.isOpen 
      })),
    }),
    {
      name: 'design-os-settings',
      storage: createJSONStorage(() => localStorage),
      // Migration to ensure type exists
      onRehydrateStorage: () => (state) => {
          if (state && !state.provider.type) {
              state.provider.type = 'ollama';
          }
      }
    }
  )
);

export const getEffectiveCapabilities = (
  defaults: ModelCapabilities | undefined,
  overrides: Partial<ModelCapabilities> | undefined
): ModelCapabilities => {
  // Fallback defaults if nothing provides info
  const base: ModelCapabilities = defaults || {
      vision: false,
      tools: false,
      thinking: false,
      embedding: false
  };

  if (!overrides) return base;

  return {
      vision: overrides.vision ?? base.vision,
      tools: overrides.tools ?? base.tools,
      thinking: overrides.thinking ?? base.thinking,
      embedding: overrides.embedding ?? base.embedding
  };
};

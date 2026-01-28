
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ModelConfig {
  name: string;
  parameters: {
    temperature: number;
    topP?: number;
    topK?: number;
    numCtx?: number;
    maxContextLength?: number; // Max context length of the model (from model_info)
    think?: boolean;
  };
  capabilities?: {
    vision: boolean;
    tools: boolean;
    thinking: boolean;
    embedding: boolean;
  };
}

export interface ProviderConfig {
  url: string;
  apiKey?: string;
  selectedModel?: string;
  models: string[]; // List of available model names
  currentModelConfig?: ModelConfig; // Configuration for the currently selected model
}

interface SettingsState {
  provider: ProviderConfig;
  isOpen: boolean; // Settings modal open state
  
  // Actions
  setProviderUrl: (url: string) => void;
  setApiKey: (key: string) => void;
  setModels: (models: string[]) => void;
  setSelectedModel: (model: string) => void;
  updateModelConfig: (config: Partial<ModelConfig['parameters']>) => void;
  setModelCapabilities: (capabilities: ModelConfig['capabilities']) => void;
  toggleSettings: (isOpen?: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      provider: {
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
          return {
            provider: {
                ...state.provider,
                currentModelConfig: {
                    ...state.provider.currentModelConfig,
                    parameters: {
                        ...state.provider.currentModelConfig.parameters,
                        ...params
                    }
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

      toggleSettings: (isOpen) => set((state) => ({ 
        isOpen: isOpen ?? !state.isOpen 
      })),
    }),
    {
      name: 'design-os-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

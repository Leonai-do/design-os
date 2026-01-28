
import { AIProvider } from "./types";
import { GoogleProvider, MODEL_NAME as GOOGLE_MODEL } from "./providers/google";
import { OllamaProvider } from "./providers/ollama";
import { LMStudioProvider } from "./providers/lmstudio";
import { useSettingsStore } from "../../store/settingsStore";

// Re-export constants if needed
export const MODEL_NAME = GOOGLE_MODEL; // Keep for compatibility if used elsewhere

// Factory to get the active provider
const getProvider = (): AIProvider => {
  // Access store directly (works outside components)
  const state = useSettingsStore.getState();
  const { provider } = state;

  // Use provider.type if available, otherwise fallback to legacy logic or default
  const type = provider.type || 'ollama';

  if (type === 'lmstudio' && provider.url && provider.selectedModel) {
      return new LMStudioProvider(
          provider.url,
          provider.selectedModel,
          provider.currentModelConfig?.parameters,
          provider.apiKey
      );
  }

  if (type === 'ollama' && provider.url && provider.selectedModel) {
      return new OllamaProvider(
          provider.url, 
          provider.selectedModel, 
          provider.currentModelConfig?.parameters,
          provider.apiKey
      );
  }

  if (type === 'google') {
      return new GoogleProvider();
  }

  // Fallback to Google if configuration is incomplete for local providers
  // or if explicitly selected (though 'google' case above covers it)
  return new GoogleProvider();
};

export const ai = {
  // Proxy object to maintain similar API shape or just functional exports
};

export async function generateContent(
    prompt: string, 
    systemInstruction: string,
    history: { role: 'user' | 'assistant', content: string }[] = [],
    images: string[] = [],
    onStream?: (chunk: string) => void
): Promise<string> {
    const provider = getProvider();
    return provider.generateContent(prompt, systemInstruction, history, images, onStream);
}

export async function generateStructured<T>(
  prompt: string, 
  schema: any, 
  systemInstruction: string,
  history: { role: 'user' | 'assistant', content: string }[] = [],
  images: string[] = [],
  onStream?: (chunk: string) => void
): Promise<{ data?: T, message: string; raw?: string }> {
    const provider = getProvider();
    return provider.generateStructured<T>(prompt, schema, systemInstruction, history, images, onStream);
}

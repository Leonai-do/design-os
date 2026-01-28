
import { AIProvider } from "./types";
import { GoogleProvider, MODEL_NAME as GOOGLE_MODEL } from "./providers/google";
import { OllamaProvider } from "./providers/ollama";
import { useSettingsStore } from "../../store/settingsStore";

// Re-export constants if needed
export const MODEL_NAME = GOOGLE_MODEL; // Keep for compatibility if used elsewhere

// Factory to get the active provider
const getProvider = (): AIProvider => {
  // Access store directly (works outside components)
  const state = useSettingsStore.getState();
  const { provider } = state;

  // Logic: proper check if we should use Ollama
  // 1. Must have a URL
  // 2. Must have a selected Model
  // 3. (Optional) Could add a 'providerType' flag to store later, but this implies intent
  if (provider.url && provider.selectedModel) {
      return new OllamaProvider(
          provider.url, 
          provider.selectedModel, 
          provider.currentModelConfig?.parameters,
          provider.apiKey // Pass API Key
      );
  }

  // Fallback to Google
  return new GoogleProvider();
};

export const ai = {
  // Proxy object to maintain similar API shape or just functional exports
};

export async function generateContent(
    prompt: string, 
    systemInstruction: string,
    history: { role: 'user' | 'assistant', content: string }[] = [],
    images: string[] = []
): Promise<string> {
    const provider = getProvider();
    return provider.generateContent(prompt, systemInstruction, history, images);
}

export async function generateStructured<T>(
  prompt: string, 
  schema: any, 
  systemInstruction: string,
  history: { role: 'user' | 'assistant', content: string }[] = [],
  images: string[] = []
): Promise<{ data?: T, message: string }> {
    const provider = getProvider();
    return provider.generateStructured<T>(prompt, schema, systemInstruction, history, images);
}

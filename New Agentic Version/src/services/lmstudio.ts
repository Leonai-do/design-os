
import { ModelConfig } from '../store/settingsStore';

interface LMStudioModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

interface LMStudioModelsResponse {
  data: LMStudioModel[];
  object: string;
}

// V0 API provides richer model info
interface LMStudioV0Model {
  id: string;
  object: string;
  type: 'llm' | 'vlm' | 'embeddings';
  publisher: string;
  arch: string;
  compatibility_type: string;
  quantization: string;
  state: string;
  max_context_length: number;
  capabilities?: string[];
}

interface LMStudioV0ModelsResponse {
  data: LMStudioV0Model[];
}

const normalizeUrl = (url: string): string => {
  let clean = url.trim().replace(/\/+$/, ''); // Remove trailing slashes
  // Remove common suffixes to get to the base URL
  clean = clean.replace(/\/v1\/models$/, '');
  clean = clean.replace(/\/v1\/chat\/completions$/, '');
  clean = clean.replace(/\/v1$/, ''); 
  clean = clean.replace(/\/api\/v0\/models$/, '');
  clean = clean.replace(/\/api\/v0$/, '');
  return clean;
};

export const checkConnection = async (url: string): Promise<boolean> => {
  try {
    const baseUrl = normalizeUrl(url);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Using /v1/models as a health check since it's an OpenAI-compatible endpoint
    const response = await fetch(`${baseUrl}/v1/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('LMStudio connection check failed:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('LMStudio connection error:', error);
    return false;
  }
};

export const fetchModels = async (url: string): Promise<string[]> => {
  try {
    const baseUrl = normalizeUrl(url);
    const response = await fetch(`${baseUrl}/v1/models`);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data: LMStudioModelsResponse = await response.json();
    return data.data.map((model) => model.id);
  } catch (error) {
    console.error('Error fetching LMStudio models:', error);
    return [];
  }
};

// Use v0 API for detailed model info
export const fetchModelDetails = async (url: string, modelName: string): Promise<LMStudioV0Model | null> => {
  try {
    const baseUrl = normalizeUrl(url);
    const response = await fetch(`${baseUrl}/api/v0/models`);
    if (!response.ok) {
      console.warn('LMStudio v0 API not available, falling back to defaults');
      return null;
    }

    const data: LMStudioV0ModelsResponse = await response.json();
    const model = data.data.find(m => m.id === modelName);
    return model || null;
  } catch (error) {
    console.error('Error fetching LMStudio model details:', error);
    return null;
  }
};

export const extractContextLength = (modelInfo: LMStudioV0Model | null): number => {
  // Use v0 API data if available
  if (modelInfo?.max_context_length) {
    return modelInfo.max_context_length;
  }
  // Default fallback
  return 131072;
};

export const detectCapabilities = (modelName: string, modelInfo?: LMStudioV0Model | null): ModelConfig['capabilities'] => {
  const name = modelName.toLowerCase();
  
  // Use v0 API capabilities if available
  if (modelInfo) {
    const caps = modelInfo.capabilities || [];
    const modelType = modelInfo.type;
    const arch = modelInfo.arch?.toLowerCase() || '';
    
    // Detect thinking from name patterns or architecture
    const hasThinking = name.includes('think') || 
                        name.includes('deepseek-r1') || 
                        name.includes('cot') ||
                        name.includes('reason') ||
                        arch.includes('deepseek');
    
    return {
      vision: modelType === 'vlm', // Vision-Language Model
      tools: caps.includes('tool_use'),
      thinking: hasThinking,
      embedding: modelType === 'embeddings',
    };
  }
  
  // Fallback to name-based detection
  return {
    vision: name.includes('vision') || name.includes('lava') || name.includes('bakllava') || name.includes('moondream') || name.includes('-vl'),
    tools: name.includes('tool') || name.includes('function') || name.includes('fc'),
    thinking: name.includes('deepseek-r1') || name.includes('think') || name.includes('cot') || name.includes('reason'),
    embedding: name.includes('embed'),
  };
};

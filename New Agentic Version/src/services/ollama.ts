
export const checkConnection = async (url: string, apiKey?: string): Promise<boolean> => {
    try {
        const headers: Record<string, string> = {};
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }
        
        const response = await fetch(`${url.replace(/\/$/, '')}/`, { 
            method: 'GET',
            headers: Object.keys(headers).length > 0 ? headers : undefined
        });
        // Ollama root returns 200 OK "Ollama is running"
        return response.ok;
    } catch (error) {
        console.warn('Ollama connection failed:', error);
        return false;
    }
};

export const fetchModels = async (url: string, apiKey?: string): Promise<string[]> => {
    try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const response = await fetch(`${url.replace(/\/$/, '')}/api/tags`, {
             headers
        });
        if (!response.ok) throw new Error('Failed to fetch models');
        
        const data = await response.json();
        return data.models.map((m: any) => m.name);
    } catch (error) {
        console.error('Failed to list models:', error);
        return [];
    }
};

interface ModelDetails {
    modelfile?: string;
    parameters?: string;
    system?: string;
    details?: {
        family?: string;
        families?: string[];
    };
    capabilities?: string[];
    model_info?: Record<string, any>; // Contains {family}.context_length etc.
    remote_model?: string; // Indicates cloud model
    remote_host?: string;  // Cloud host URL
}

/**
 * Extract the context length from model details.
 * The context_length is nested under model_info with key pattern: {architecture}.context_length
 * e.g., "deepseek2.context_length": 262144 or "kimi-k2.context_length": 262144
 */
export const extractContextLength = (details: ModelDetails | null): number => {
    if (details?.model_info) {
        const contextKey = Object.keys(details.model_info).find(k => k.endsWith('.context_length'));
        if (contextKey) {
            return details.model_info[contextKey] as number;
        }
    }
    
    // Default fallback for unknown models
    return 131072; // 128k - safe default for most modern LLMs
};

/**
 * Fetch model details from local Ollama instance.
 * If the model is a cloud model (has remote_host) and model_info is empty,
 * it will also fetch from the cloud API to get complete metadata.
 */
export const fetchModelDetails = async (url: string, modelName: string, apiKey?: string): Promise<ModelDetails | null> => {
    try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        // First, fetch from local Ollama
        const response = await fetch(`${url.replace(/\/$/, '')}/api/show`, {
            method: 'POST',
            body: JSON.stringify({ model: modelName }),
            headers
        });
        
        if (!response.ok) return null;
        const localDetails: ModelDetails = await response.json();
        
        // If it's a cloud model and model_info is empty, fetch from cloud API
        if (localDetails.remote_host && (!localDetails.model_info || Object.keys(localDetails.model_info).length === 0)) {
            const cloudDetails = await fetchCloudModelDetails(localDetails.remote_model || modelName.replace(/:cloud$/, ''), apiKey);
            if (cloudDetails) {
                // Merge cloud model_info into local details
                return {
                    ...localDetails,
                    model_info: cloudDetails.model_info,
                    details: cloudDetails.details || localDetails.details
                };
            }
        }
        
        return localDetails;
    } catch (error) {
        console.error('Failed to fetch model details:', error);
        return null;
    }
};

/**
 * Fetch model details from Ollama Cloud API (ollama.com).
 * Uses the Vite proxy at /ollama-cloud to bypass CORS.
 */
const fetchCloudModelDetails = async (modelName: string, apiKey?: string): Promise<ModelDetails | null> => {
    try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        // Use the Vite proxy to access ollama.com
        const response = await fetch('/ollama-cloud/api/show', {
            method: 'POST',
            body: JSON.stringify({ model: modelName }),
            headers
        });
        
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch cloud model details:', error);
        return null;
    }
};

export interface Capabilities {
    vision: boolean;
    tools: boolean;
    thinking: boolean;
    embedding: boolean;
}

/**
 * Known model families/names that support thinking (chain-of-thought) mode.
 * These are used as fallbacks when the API doesn't report 'thinking' in capabilities.
 */
const THINKING_PATTERNS = [
    'thinking',    // explicit thinking in name
    '-think',      // suffix pattern
    'r1',          // DeepSeek R1 models
    'qwen3',       // Qwen3 models support /think mode
    'qwq',         // QwQ models
    'deepseek-r',  // DeepSeek reasoning
    'o1',          // OpenAI-style reasoning
    'o3',          // Future OpenAI reasoning
];

/**
 * Known model families that support thinking mode.
 */
const THINKING_FAMILIES = [
    'qwen3',
    'qwen3vl',
    'qwen3vlmoe',
    'deepseek2',
    'deepseek3',
];

/**
 * Detect model capabilities from the Ollama API response.
 * Uses the 'capabilities' array returned by /api/show as primary source,
 * with name/family-based heuristics as fallbacks for incomplete API data.
 */
export const detectCapabilities = (modelName: string, details?: ModelDetails | null): Capabilities => {
    const caps: Capabilities = {
        vision: false,
        tools: false,
        thinking: false,
        embedding: false
    };

    const lowerName = modelName.toLowerCase();

    if (!details) {
        // Fallback for when details aren't fetched yet/failed - use name heuristics only
        caps.thinking = THINKING_PATTERNS.some(p => lowerName.includes(p));
        return caps;
    }

    // Use the capabilities array from API (primary source of truth)
    if (details.capabilities && Array.isArray(details.capabilities)) {
        caps.vision = details.capabilities.includes('vision');
        caps.tools = details.capabilities.includes('tools');
        caps.thinking = details.capabilities.includes('thinking');
        caps.embedding = details.capabilities.includes('embedding');
    }

    // Enhance thinking detection with heuristics if API doesn't report it
    // Many models support thinking mode but don't advertise it in capabilities
    if (!caps.thinking) {
        // Check model name patterns
        if (THINKING_PATTERNS.some(p => lowerName.includes(p))) {
            caps.thinking = true;
        }
        // Check model family
        else if (details.details?.family && THINKING_FAMILIES.includes(details.details.family.toLowerCase())) {
            caps.thinking = true;
        }
        // Check family list
        else if (details.details?.families?.some(f => THINKING_FAMILIES.includes(f.toLowerCase()))) {
            caps.thinking = true;
        }
    }

    return caps;
};

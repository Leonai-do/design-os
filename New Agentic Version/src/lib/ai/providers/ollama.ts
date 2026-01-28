
import { AIProvider } from "../types";
import { extractJsonFromResponse, normalizeStructuredResponse, createStreamingFilter } from "./utils";


export class OllamaProvider implements AIProvider {
    constructor(
        private url: string,
        private model: string,
        private config?: { 
            temperature?: number; 
            numCtx?: number; 
            maxTokens?: number; // Added maxTokens support
            think?: boolean 
        },
        private apiKey?: string
    ) {}

    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }
        return headers;
    }

    async generateContent(
        prompt: string,
        systemInstruction: string,
        history: { role: 'user' | 'assistant', content: string }[],
        images: string[]
    ): Promise<string> {
        try {
            const messages = [
                { role: 'system', content: systemInstruction },
                ...history.map(h => ({ role: h.role, content: h.content })),
                { 
                    role: 'user', 
                    content: prompt, 
                    images: images.map(img => img.split(',')[1] || img)
                }
            ];

            const response = await fetch(`${this.url.replace(/\/$/, '')}/api/chat`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    stream: false,
                    options: {
                        temperature: this.config?.temperature,
                        num_ctx: this.config?.numCtx,
                        num_predict: this.config?.maxTokens
                    }
                })
            });

            if (!response.ok) throw new Error(`Ollama Error: ${response.statusText}`);
            
            const data = await response.json();
            return data.message.content;
        } catch (e: any) {
            console.error("Ollama Generation Failed:", e);
            throw new Error(e.message || "Ollama Generation Failed");
        }
    }

    async generateStructured<T>(
        prompt: string,
        schema: any,
        systemInstruction: string,
        history: { role: 'user' | 'assistant', content: string }[],
        images: string[],
        onStream?: (chunk: string) => void
    ): Promise<{ data?: T; message: string; raw?: string }> {
        const schemaString = JSON.stringify(schema, null, 2);
        
        // Revised prompt to discourage double encoding and encourage clean separation
        const augmentedSystemPrompt = `${systemInstruction}\n\nINSTRUCTIONS:\n1. You MUST respond with valid JSON matching the schema below.\n2. Wrap your response in a ROOT JSON object with 'data' and 'message' fields.\n3. 'data' must match the schema. 'message' must be a plain string (not JSON).\n\nSCHEMA:\n${schemaString}`;

        const isStreaming = !!onStream;

        try {
             const messages = [
                { role: 'system', content: augmentedSystemPrompt },
                ...history.map(h => ({ role: h.role, content: h.content })),
                { 
                    role: 'user', 
                    content: prompt,
                    images: images.map(img => img.split(',')[1] || img)
                }
            ];

            const response = await fetch(`${this.url.replace(/\/$/, '')}/api/chat`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    format: 'json', // Enforce JSON mode if supported
                    stream: isStreaming,
                    options: {
                        temperature: this.config?.temperature,
                        num_ctx: this.config?.numCtx,
                        num_predict: this.config?.maxTokens
                    }
                })
            });

            if (!response.ok) throw new Error(`Ollama Error: ${response.statusText}`);

            let rawContent = '';

            if (isStreaming) {
                const reader = response.body?.getReader();
                if (!reader) throw new Error('Response body is null');
                
                const decoder = new TextDecoder();
                const filter = createStreamingFilter(onStream);
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;
                    
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep incomplete line

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed) continue;
                        try {
                            const json = JSON.parse(trimmed);
                            const content = json.message?.content;
                            if (content) {
                                filter.push(content);
                            }
                            if (json.done) break;
                        } catch (e) {
                           // ignore parse error
                        }
                    }
                }
                rawContent = filter.complete();
            } else {
                 const data = await response.json();
                 rawContent = data.message.content;
            }
            
            try {
                const cleanedContent = extractJsonFromResponse(rawContent);
                const parsed = JSON.parse(cleanedContent);
                return normalizeStructuredResponse<T>(rawContent, parsed);
            } catch (parseError) {
                console.warn("Failed to parse Ollama JSON:", rawContent);
                return normalizeStructuredResponse<T>(rawContent, null);
            }
        } catch (e: any) {
             console.error("Ollama Structured Generation Failed:", e);
             return {
                message: "I'm having trouble connecting to the local AI model."
            };
        }
    }
}

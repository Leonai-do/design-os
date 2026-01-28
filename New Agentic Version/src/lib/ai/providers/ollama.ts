
import { AIProvider } from "../types";

/**
 * Clean JSON response from LLM that may be wrapped in markdown code blocks.
 * Handles: ```json {...} ```, ``` {...} ```, or plain JSON.
 */
function cleanJsonResponse(content: string): string {
    let cleaned = content.trim();
    
    // Remove markdown code block wrappers
    // Match: ```json ... ``` or ``` ... ```
    const codeBlockMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (codeBlockMatch) {
        cleaned = codeBlockMatch[1].trim();
    }
    
    return cleaned;
}

export class OllamaProvider implements AIProvider {
    constructor(
        private url: string,
        private model: string,
        private config?: { temperature?: number; numCtx?: number; think?: boolean },
        private apiKey?: string // Added apiKey support
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
                        num_ctx: this.config?.numCtx
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
        images: string[]
    ): Promise<{ data?: T; message: string }> {
        const schemaString = JSON.stringify(schema, null, 2);
        const augmentedSystemPrompt = `${systemInstruction}\n\nYou MUST respond with valid JSON matching this schema:\n${schemaString}\n\nIMPORTANT: Wrap your response in a JSON object with 'data' and 'message' fields.`;

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
                    format: 'json',
                    stream: false,
                    options: {
                        temperature: this.config?.temperature,
                        num_ctx: this.config?.numCtx
                    }
                })
            });

            if (!response.ok) throw new Error(`Ollama Error: ${response.statusText}`);

            const data = await response.json();
            const content = data.message.content;
            
            try {
                // Strip markdown code blocks if present (```json ... ``` or ``` ... ```)
                const cleanedContent = cleanJsonResponse(content);
                return JSON.parse(cleanedContent);
            } catch (parseError) {
                console.warn("Failed to parse Ollama JSON:", content);
                return {
                    message: "I processed your request but had trouble formatting the response.",
                };
            }
        } catch (e: any) {
             console.error("Ollama Structured Generation Failed:", e);
             return {
                message: "I'm having trouble connecting to the local AI model."
            };
        }
    }
}


import { GoogleGenAI, Type } from "@google/genai";
import { AIProvider } from "../types";
import { normalizeStructuredResponse } from "./utils";

export const MODEL_NAME = 'gemini-3-flash-preview';

export class GoogleProvider implements AIProvider {
    private client: GoogleGenAI;

    constructor() {
        this.client = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    }

    async generateContent(
        prompt: string,
        systemInstruction: string,
        history: { role: 'user' | 'assistant', content: string }[],
        images: string[]
    ): Promise<string> {
        try {
            const userParts: any[] = [{ text: prompt }];
            this.appendImages(userParts, images);

            const response = await this.client.models.generateContent({
                model: MODEL_NAME,
                contents: [
                    ...history.map(h => ({
                        role: h.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: h.content }]
                    })),
                    { role: 'user', parts: userParts }
                ],
                config: {
                    systemInstruction: systemInstruction,
                }
            });

            return response.text || '';
        } catch (e: any) {
            console.error("Google AI Generation Failed:", e);
            throw new Error(e.message || "Google AI Generation Failed");
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
        const wrappedSchema = {
            type: Type.OBJECT,
            properties: {
                data: schema,
                message: {
                    type: Type.STRING,
                    description: "A conversational response explaining the action taken or asking questions."
                }
            },
            required: ["message"]
        };

        const config = {
            responseMimeType: "application/json",
            responseSchema: wrappedSchema,
            systemInstruction: systemInstruction,
        };

        const contents = [
            ...history.map(h => ({
                role: h.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: h.content }]
            })),
            { role: 'user', parts: [{ text: prompt }] }
        ];
        
        // Handle images
        if (images.length > 0) {
            const userParts = contents[contents.length - 1].parts as any[];
            this.appendImages(userParts, images);
        }

        try {
            let text = '';
            
            if (onStream) {
                const result = await this.client.models.generateContentStream({
                    model: MODEL_NAME,
                    contents,
                    config,
                });

                const filter = createStreamingFilter(onStream);
                
                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    if (chunkText) {
                        filter.push(chunkText);
                    }
                }
                text = filter.complete();
            } else {
                const response = await this.client.models.generateContent({
                    model: MODEL_NAME,
                    contents,
                    config,
                });
                text = response.text || '';
            }

            if (!text) throw new Error("No response from AI");

            // Use shared utility for consistent normalization
            const parsed = JSON.parse(text);
            return normalizeStructuredResponse<T>(text, parsed);
        } catch (e: any) {
             console.error("Google AI Structured Generation Failed:", e);
             return normalizeStructuredResponse<T>("", null);
        }
    }

    private appendImages(parts: any[], images: string[]) {
        if (images.length > 0) {
            images.forEach(base64 => {
                const cleanBase64 = base64.split(',')[1] || base64;
                parts.push({
                    inlineData: {
                        mimeType: 'image/png',
                        data: cleanBase64
                    }
                });
            });
        }
    }
}

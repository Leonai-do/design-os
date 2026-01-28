
import { GoogleGenAI, Type } from "@google/genai";
import { AIProvider } from "../types";

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
        images: string[]
    ): Promise<{ data?: T; message: string }> {
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
                    responseMimeType: "application/json",
                    responseSchema: wrappedSchema,
                    systemInstruction: systemInstruction,
                },
            });

            const text = response.text;
            if (!text) throw new Error("No response from AI");

            return JSON.parse(text);
        } catch (e: any) {
             console.error("Google AI Structured Generation Failed:", e);
             return {
                message: "I'm having trouble seeing clearly right now. Please check your connection or try again."
            };
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

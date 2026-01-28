
export interface AIProvider {
    generateContent(
        prompt: string,
        systemInstruction: string,
        history: { role: 'user' | 'assistant', content: string }[],
        images: string[]
    ): Promise<string>;

    generateStructured<T>(
        prompt: string,
        schema: any,
        systemInstruction: string,
        history: { role: 'user' | 'assistant', content: string }[],
        images: string[]
    ): Promise<{ data?: T; message: string }>;
}

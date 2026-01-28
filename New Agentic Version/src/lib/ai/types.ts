
export interface AIProvider {
    generateContent(
        prompt: string,
        systemInstruction: string,
        history: { role: 'user' | 'assistant', content: string }[],
        images: string[],
        onStream?: (chunk: string) => void
    ): Promise<string>;

    generateStructured<T>(
        prompt: string,
        schema: any,
        systemInstruction: string,
        history: { role: 'user' | 'assistant', content: string }[],
        images: string[],
        onStream?: (chunk: string) => void
    ): Promise<{ data?: T; message: string; raw?: string }>;
}

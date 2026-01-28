import { GoogleGenAI } from "@google/genai";
import { CustomConnection } from "../../types";

interface GenerateStreamProps {
  modelId: string;
  prompt: string;
  files: File[];
  temperature: number;
  customConnection?: CustomConnection | null;
  signal?: AbortSignal;
}

export async function generateStreamUnified(
  props: GenerateStreamProps,
  onChunk: (chunk: string) => void
): Promise<void> {
  const { modelId, prompt, files, temperature } = props;

  // Client-side Gemini logic
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Convert Files to Base64 parts
  const fileParts: any[] = [];
  
  for (const file of files) {
    if (file.type.startsWith('image/')) {
        const base64 = await fileToBase64(file);
        const cleanBase64 = base64.split(',')[1];
        fileParts.push({
            inlineData: {
                mimeType: file.type,
                data: cleanBase64
            }
        });
    }
    // Note: Document processing logic would go here if supported by the model directly via file API,
    // otherwise text content should be extracted and appended to prompt.
    // For now, assuming image support is the primary file type handled here.
  }

  const parts = [
    ...fileParts,
    { text: prompt }
  ];

  try {
      // Use the new client format for streaming
      const response = await ai.models.generateContentStream({
        model: modelId,
        contents: [{ role: 'user', parts: parts }],
        config: {
            temperature: temperature
        }
      });

      for await (const chunk of response) {
        if (props.signal?.aborted) {
             throw new Error("Aborted by user");
        }
        const text = chunk.text;
        if (text) {
             onChunk(text);
        }
      }

  } catch (error) {
      console.error("AI Stream Error:", error);
      throw error;
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
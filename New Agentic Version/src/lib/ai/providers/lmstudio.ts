
import { AIProvider } from '../types';
import { extractJsonFromResponse, normalizeStructuredResponse, createStreamingFilter } from './utils';

export class LMStudioProvider implements AIProvider {
  private url: string;
  private model: string;
  private config?: {
    temperature: number;
    numCtx?: number;
    maxTokens?: number;
    think?: boolean;
  };
  private apiKey?: string;

  constructor(
    url: string, 
    model: string, 
    config?: { 
      temperature: number; 
      numCtx?: number; 
      maxTokens?: number;
      think?: boolean 
    },
    apiKey?: string
  ) {
    this.url = this.normalizeUrl(url);
    this.model = model;
    this.config = config;
    this.apiKey = apiKey;
  }

  private normalizeUrl(url: string): string {
    let clean = url.trim().replace(/\/+$/, '');
    clean = clean.replace(/\/v1\/models$/, '');
    clean = clean.replace(/\/v1\/chat\/completions$/, '');
    clean = clean.replace(/\/v1$/, '');
    return clean;
  }


  private formatMessages(
    prompt: string,
    systemInstruction: string,
    history: { role: 'user' | 'assistant'; content: string }[],
    images: string[]
  ) {
    const messages: any[] = [];

    // System message
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }

    // History
    history.forEach(msg => {
      messages.push({ role: msg.role, content: msg.content });
    });

    // Current user message
    if (images.length > 0) {
      const content: any[] = [{ type: 'text', text: prompt }];
      
      images.forEach(image => {
        // Ensure image has data prefix if missing (Ollama usually sends base64, need to check format)
        // Assuming base64 string from application usage. 
        // OpenAI expects "data:image/jpeg;base64,{base64_image}"
        const imageUrl = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;
        content.push({
          type: 'image_url',
          image_url: { url: imageUrl }
        });
      });

      messages.push({ role: 'user', content });
    } else {
      messages.push({ role: 'user', content: prompt });
    }

    return messages;
  }

  async generateContent(
    prompt: string,
    systemInstruction: string,
    history: { role: 'user' | 'assistant'; content: string }[],
    images: string[],
    onStream?: (chunk: string) => void
  ): Promise<string> {
    const messages = this.formatMessages(prompt, systemInstruction, history, images);
    return this.executeRequest(messages, onStream);
  }

  async generateStructured<T>(
    prompt: string,
    schema: any,
    systemInstruction: string,
    history: { role: 'user' | 'assistant'; content: string }[],
    images: string[],
    onStream?: (chunk: string) => void
  ): Promise<{ data?: T; message: string; raw?: string }> {
    const messages = this.formatMessages(prompt, systemInstruction, history, images);
    const jsonInstruction = " Respond in valid JSON format matching the requirements.";
    
    // Append JSON instruction
    if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (Array.isArray(lastMsg.content)) {
            const textPart = lastMsg.content.find((c: any) => c.type === 'text');
            if (textPart) textPart.text += jsonInstruction;
        } else {
            lastMsg.content += jsonInstruction;
        }
    }

    const fullText = await this.executeRequest(messages, onStream);
    
    try {
        const cleanJson = extractJsonFromResponse(fullText);
        const parsed = JSON.parse(cleanJson);
        return normalizeStructuredResponse<T>(fullText, parsed);
    } catch (e) {
        console.error('Failed to parse JSON from LMStudio:', e);
        return normalizeStructuredResponse<T>(fullText, null);
    }
  }

  private async executeRequest(messages: any[], onStream?: (chunk: string) => void): Promise<string> {
    const isStreaming = !!onStream;
    try {
      const response = await fetch(`${this.url}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: this.config?.temperature ?? 0.7,
          max_tokens: this.config?.maxTokens,
          stream: isStreaming
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LMStudio API Error: ${response.status} - ${errorText}`);
      }

      if (!isStreaming) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
      }

      // Handle Streaming
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is null');

      const decoder = new TextDecoder();
      const filter = createStreamingFilter(onStream);
      let buffer = '';
      let inThinkBlock = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
           const trimmed = line.trim();
           if (!trimmed.startsWith('data: ')) continue;
           
           const jsonStr = trimmed.slice(6);
           if (jsonStr === '[DONE]') continue;

             try {
               const json = JSON.parse(jsonStr);
               const delta = json.choices?.[0]?.delta;
               
               if (delta) {
                 // Handle reasoning/thoughts (DeepSeek/LM Studio style)
                 // Check for various possible field names
                 const reasoning = delta.reasoning_content || delta.reasoning || delta.thought;
                 const content = delta.content;

                 if (reasoning) {
                   if (!inThinkBlock) {
                     filter.push('<think>');
                     inThinkBlock = true;
                   }
                   filter.push(reasoning);
                 } else if (content) {
                   // If we were thinking and now have content, close the tag
                   if (inThinkBlock) {
                     filter.push('</think>');
                     inThinkBlock = false;
                   }
                   filter.push(content);
                 }
               }
             } catch (e) {
               // Ignore parse errors for partial chunks or connection keep-alives
             }
        }
       }
       if (inThinkBlock) {
         filter.push('</think>');
       }
       return filter.complete();

    } catch (error) {
      console.error('LMStudio generation error:', error);
      throw error;
    }
  }
}

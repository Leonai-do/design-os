/**
 * Shared utilities for AI providers.
 * 
 * ALL PROVIDERS MUST USE THESE UTILITIES to ensure consistent behavior.
 * When adding a new provider, use `normalizeStructuredResponse` to process
 * the raw model output before returning from `generateStructured`.
 */

export interface StructuredResponse<T> {
    data?: T;
    message: string;
    raw?: string;
}

/**
 * StreamingFilter: Intelligently filters streaming output for display.
 * 
 * Streams <think> content immediately, buffers JSON until message field found,
 * then streams the message content in real-time.
 * 
 * Usage:
 * ```
 * const filter = createStreamingFilter(onStream);
 * // In your streaming loop:
 * filter.push(chunk);
 * // When done:
 * const fullText = filter.complete();
 * ```
 */
export interface StreamingFilter {
    push: (chunk: string) => void;
    complete: () => string;
}

export function createStreamingFilter(onStream?: (chunk: string) => void): StreamingFilter {
    let fullText = '';
    let inThinkBlock = false;
    let thinkBlockComplete = false;
    let inJsonBlock = false;
    let inMessageField = false;
    let messageFieldStarted = false;
    let braceDepth = 0;
    let lastStreamedPos = 0;
    
    return {
        push(chunk: string) {
            fullText += chunk;
            
            if (!onStream) return;
            
            // Process character by character from where we left off
            for (let i = lastStreamedPos; i < fullText.length; i++) {
                const char = fullText[i];
                
                // Check for <think> start
                if (!inThinkBlock && !thinkBlockComplete && fullText.substring(i, i + 7) === '<think>') {
                    inThinkBlock = true;
                    onStream('<think>');
                    i += 6; // skip rest of tag
                    lastStreamedPos = i + 1;
                    continue;
                }
                
                // Check for </think> end
                if (inThinkBlock && fullText.substring(i, i + 8) === '</think>') {
                    inThinkBlock = false;
                    thinkBlockComplete = true;
                    onStream('</think>\n');
                    i += 7; // skip rest of tag
                    lastStreamedPos = i + 1;
                    continue;
                }
                
                // Stream think block content
                if (inThinkBlock) {
                    onStream(char);
                    lastStreamedPos = i + 1;
                    continue;
                }
                
                // After think block, look for JSON
                if (thinkBlockComplete || !inThinkBlock) {
                    // Start of JSON
                    if (!inJsonBlock && char === '{') {
                        inJsonBlock = true;
                        braceDepth = 1;
                        lastStreamedPos = i + 1;
                        continue;
                    }
                    
                    if (inJsonBlock) {
                        // Track brace depth
                        if (char === '{') braceDepth++;
                        if (char === '}') braceDepth--;
                        
                        // Look for "message": or "message" :
                        if (!inMessageField) {
                            const lookback = fullText.substring(Math.max(0, i - 12), i + 1);
                            if (lookback.match(/"message"\s*:\s*"$/)) {
                                inMessageField = true;
                                messageFieldStarted = true;
                                lastStreamedPos = i + 1;
                                continue;
                            }
                        }
                        
                        // Stream message content
                        if (inMessageField && messageFieldStarted) {
                            // Check for end of message string (unescaped quote)
                            if (char === '"' && fullText[i - 1] !== '\\') {
                                inMessageField = false;
                                lastStreamedPos = i + 1;
                                continue;
                            }
                            // Handle escape sequences
                            if (char === '\\' && i + 1 < fullText.length) {
                                const nextChar = fullText[i + 1];
                                if (nextChar === 'n') {
                                    onStream('\n');
                                } else if (nextChar === 't') {
                                    onStream('\t');
                                } else if (nextChar === '"') {
                                    onStream('"');
                                } else if (nextChar === '\\') {
                                    onStream('\\');
                                }
                                i++; // skip next char
                                lastStreamedPos = i + 1;
                                continue;
                            }
                            onStream(char);
                            lastStreamedPos = i + 1;
                        }
                    }
                }
            }
        },
        
        complete(): string {
            return fullText;
        }
    };
}

/**
 * Extract JSON from a string that may contain markdown code blocks, think tags, or other noise.
 */
export function extractJsonFromResponse(content: string): string {
    let clean = content;
    
    // 1. Remove <think> blocks (greedy match)
    clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, '');
    
    // 2. Remove markdown code blocks
    const codeBlockMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
        clean = codeBlockMatch[1];
    }
    
    // 3. Find the first '{' and last '}' to isolate JSON
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    
    if (start !== -1 && end !== -1 && end > start) {
        return clean.substring(start, end + 1);
    }
    
    return clean.trim();
}

/**
 * Normalize structured response from any AI provider.
 * 
 * This function ensures:
 * 1. `message` is always a plain string (never JSON)
 * 2. Nested/double-encoded JSON in message field is unwrapped
 * 3. If model returns data without message, a fallback message is used
 * 4. `raw` contains the original unmodified output for debugging/thoughts extraction
 * 
 * ALL PROVIDERS MUST CALL THIS before returning from generateStructured.
 * 
 * @param rawOutput - The raw string output from the model
 * @param parsedJson - The parsed JSON object (or null if parsing failed)
 * @returns Normalized StructuredResponse
 */
export function normalizeStructuredResponse<T>(
    rawOutput: string,
    parsedJson: Record<string, any> | null
): StructuredResponse<T> {
    // If parsing failed, return error message
    if (!parsedJson) {
        return {
            message: "I processed your request but had trouble formatting the response.",
            raw: rawOutput
        };
    }

    let finalMessage = parsedJson.message;
    let finalData = parsedJson.data !== undefined ? parsedJson.data : undefined;

    // If there's no message field but there IS data, use fallback text
    if (finalMessage === undefined && finalData !== undefined) {
        finalMessage = "I've processed that for you.";
    }

    // Recursive unwrapping: handle double-encoded JSON in message field
    if (typeof finalMessage === 'string') {
        let attempts = 0;
        while (attempts < 3) {
            const trimmed = finalMessage.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                try {
                    const inner = JSON.parse(trimmed);
                    if (inner && typeof inner === 'object') {
                        if (inner.message !== undefined) {
                            // Found nested wrapper - unwrap it
                            finalMessage = inner.message;
                            if (inner.data !== undefined) {
                                finalData = inner.data;
                            }
                            attempts++;
                            continue;
                        }
                        // Inner object has no message field - model dumped raw data
                        finalMessage = "I've processed that for you.";
                        break;
                    }
                } catch {
                    // Not valid JSON - stop unwrapping
                    break;
                }
            }
            break;
        }
    }

    // Final safety: ensure message is always a string
    if (typeof finalMessage !== 'string') {
        if (finalMessage === null || finalMessage === undefined) {
            finalMessage = "Done.";
        } else {
            // Shouldn't happen, but convert to string as last resort
            finalMessage = String(finalMessage);
        }
    }

    return {
        data: finalData as T,
        message: finalMessage,
        raw: rawOutput
    };
}

/**
 * Extract thought content from raw response.
 * 
 * @param rawOutput - The raw string that may contain <think> tags
 * @returns The thought content (including tags) or empty string
 */
export function extractThoughts(rawOutput: string): string {
    const match = rawOutput.match(/<think>[\s\S]*?<\/think>/i);
    return match ? match[0] : '';
}

/**
 * Format a structured response for display in the chat UI.
 * 
 * This combines thoughts (from raw) with the clean message for final display.
 * Use this in the UI layer when rendering AI responses.
 * 
 * @param response - The structured response from a provider
 * @returns Formatted string ready for display (thoughts + message)
 */
export function formatResponseForDisplay(response: { raw?: string; message: string }): string {
    const thoughts = extractThoughts(response.raw || '');
    const cleanMessage = response.message || '';
    
    if (thoughts) {
        return `${thoughts}\n${cleanMessage}`.trim();
    }
    return cleanMessage;
}

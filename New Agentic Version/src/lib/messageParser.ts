export type ThinkingSegment = {
  type: 'think';
  content: string;
  isComplete: boolean;
};

export type TextSegment = {
  type: 'text';
  content: string;
};

export type MessageSegment = ThinkingSegment | TextSegment;

/**
 * Parses a message string into segments of thinking blocks and regular text.
 * Handles both complete `<think>...</think>` tags and streaming unclosed tags.
 */
export function parseMessage(content: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  
  // Regex to find think blocks. 
  // Captures: 
  // 1: Content inside fully closed think block
  // 2: Content inside unclosed think block (at the end of string)
  // Flags: 'g' for global, 's' (dotAll) to match newlines
  const thinkRegex = /<think>(.*?)<\/think>|<think>(.*)$/gs;
  
  let lastIndex = 0;
  let match;

  while ((match = thinkRegex.exec(content)) !== null) {
    // Add text before the match if it exists
    if (match.index > lastIndex) {
      const textContent = content.slice(lastIndex, match.index);
      if (textContent) {
        segments.push({ type: 'text', content: textContent });
      }
    }

    // Determine if it's a closed or unclosed block
    // match[1] is the content of a closed block (<think>...</think>)
    // match[2] is the content of an unclosed block (<think>...)
    
    if (match[1] !== undefined) {
      // Closed block
      segments.push({ 
        type: 'think', 
        content: match[1], 
        isComplete: true 
      });
    } else if (match[2] !== undefined) {
      // Unclosed block (streaming)
      segments.push({ 
        type: 'think', 
        content: match[2], 
        isComplete: false 
      });
    }

    lastIndex = thinkRegex.lastIndex;
  }

  // Add remaining text after the last match
  if (lastIndex < content.length) {
    const remainingText = content.slice(lastIndex);
    if (remainingText) {
      segments.push({ type: 'text', content: remainingText });
    }
  }

  // If no think tags found, treat whole content as text
  if (segments.length === 0 && content.length > 0) {
    segments.push({ type: 'text', content });
  }

  return segments;
}

import { generateStreamUnified } from "../ai/orchestrator";
import { ChatMessage } from "../../types";

export const chatWithPrd = async (
  currentPrdContent: string,
  history: ChatMessage[],
  userRequest: string,
  files: File[],
  modelId: string,
  onStream: (chunk: string) => void,
  customConnection: any,
  systemPrompt: string,
  signal?: AbortSignal
): Promise<{ text: string; newPrd?: string }> => {
  
  // Construct the prompt context
  const context = `
Current Document Content:
\`\`\`markdown
${currentPrdContent}
\`\`\`

User Request: ${userRequest}

Chat History:
${history.map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n')}

Instructions:
1. Answer the user's question or perform the requested update.
2. If the user asks to update the document, provide the FULLY UPDATED document content wrapped in a special block:
   \`\`\`markdown:updated-document
   ... full updated content ...
   \`\`\`
   And provide a summary of changes in the response text.
3. If no update is needed, just provide a helpful response.
`;

  let fullResponse = '';
  
  await generateStreamUnified({
      modelId,
      prompt: context,
      files, // Pass files (images) if any
      temperature: 0.7,
      customConnection,
      signal
  }, (chunk) => {
      fullResponse += chunk;
      onStream(chunk);
  });

  // Extract updated PRD if present
  let newPrd: string | undefined;
  const match = fullResponse.match(/```markdown:updated-document\s*([\s\S]*?)\s*```/);
  
  if (match) {
      newPrd = match[1];
      // Clean up the response to show only the conversational part if preferred, 
      // or keep it as is. For now, we return the full text as the AI message 
      // might explain the changes alongside the block.
  }

  return { text: fullResponse, newPrd };
};

import { PrdContext, DiscoveryStep, DynamicField, AVAILABLE_MODELS, CustomConnection } from "../../types";
import { DEFAULT_PROMPTS } from "../../constants";
import { generateStreamUnified } from "../ai/orchestrator";

export const getNextDiscoveryStep = async (
  currentContext: PrdContext, 
  history: DiscoveryStep[],
  files: File[] = [],
  modelId: string = AVAILABLE_MODELS[0].id,
  onStream?: (chunk: string) => void,
  customConnection?: CustomConnection | null,
  systemPromptTemplate: string = DEFAULT_PROMPTS.discovery,
  signal?: AbortSignal,
  lockedFields: DynamicField[] = []
): Promise<DiscoveryStep> => {
  const stepCount = history.length + 1;
  const contextSummary = JSON.stringify(currentContext, null, 2);

  let prompt = systemPromptTemplate
    .replace('{{step}}', stepCount.toString())
    .replace('{{context}}', contextSummary);

  if (lockedFields.length > 0) {
      prompt += `\n\n**CRITICAL: LOCKED FIELDS DETECTED**\nThe user is regenerating this step but explicitly wants to KEEP specific fields. You MUST include the following fields in your 'fields' array output, preserving their exact IDs, types, and labels. Do not remove or alter them. You may add new fields around them if the context requires it.\n\nLocked Fields Schema:\n${JSON.stringify(lockedFields, null, 2)}`;
  }

  try {
      let fullText = '';
      await generateStreamUnified({
          modelId,
          prompt,
          files,
          temperature: 0.4,
          customConnection,
          signal
      }, (chunk) => {
          fullText += chunk;
          if (onStream) onStream(chunk);
      });

      const jsonMatch = fullText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      let data: Partial<DiscoveryStep> = {};
      let aiMessage = fullText;

      if (jsonMatch) {
          try {
              data = JSON.parse(jsonMatch[1]);
              if (jsonMatch.index !== undefined && jsonMatch.index > 0) {
                  aiMessage = fullText.substring(0, jsonMatch.index).trim();
              } else {
                   aiMessage = data.aiMessage || "Here is the next step.";
              }
          } catch (e) { console.error("JSON parse error in block", e); }
      } else {
        const start = fullText.indexOf('{');
        const end = fullText.lastIndexOf('}');
        if (start > -1 && end > start) {
            try { 
                data = JSON.parse(fullText.substring(start, end + 1)); 
                if (start > 0) {
                    aiMessage = fullText.substring(0, start).trim();
                } else {
                    aiMessage = data.aiMessage || aiMessage;
                }
            } catch(e) { console.error("JSON parse error fallback", e); }
        }
      }
      
      return {
          stepId: stepCount,
          aiMessage: aiMessage,
          fields: data.fields || [],
          isComplete: !!data.isComplete
      };

  } catch (error: any) {
      if (error.message.includes('aborted')) throw error;
      return {
        stepId: stepCount,
        aiMessage: "I'm having trouble connecting. Let's just use a general notes field.",
        isComplete: false,
        fields: [{ id: "notes", type: "textarea", label: "Notes", placeholder: "Enter details..." }]
      };
  }
};

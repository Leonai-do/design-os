
import { Type } from "@google/genai";
import { generateStructured } from "./client";
import { ORCHESTRATOR_PROMPT } from "../prompts";

// Orchestrator: Detects intent from natural language
export async function detectIntent(
    input: string, 
    history: any[],
    currentContext: { hasVision: boolean, hasRoadmap: boolean },
    images: string[] = []
) {
    // Schema definition compatible with Google's Type, pass raw object to client abstraction
    const schema = {
        type: Type.OBJECT,
        properties: {
            intent: { 
                type: Type.STRING, 
                enum: [
                  'vision', 'roadmap', 'data-model', 'design-system', 
                  'shell-design', 'section-spec', 'section-data', 
                  'screen-design', 'chat'
                ],
                description: "The detected user intent."
            },
            message: { type: Type.STRING, description: "A message to transition the user." },
            sectionId: { type: Type.STRING, description: "If intent is section-related, the inferred section ID (slug)." }
        },
        required: ["intent", "message"]
    };

    const contextStr = `
      Project State:
      - Vision Exists: ${currentContext.hasVision}
      - Roadmap Exists: ${currentContext.hasRoadmap}
      
      User Input: ${input} 
      ${images.length > 0 ? '[User has attached images for context]' : ''}
    `;

    try {
        // Use the new client abstraction
        // Note: generateStructured validates and parses JSON for us
        const result = await generateStructured<{ intent: string, message: string, sectionId?: string }>(
            contextStr,
            schema,
            ORCHESTRATOR_PROMPT,
            history,
            images
        );

        if (!result.data) {
             return { intent: 'chat', message: result.message };
        }

        // Flatten the structure locally if needed, but generateStructured wrapper returns a structure.
        // Wait, generateStructured in client.ts WRAPS the schema in a {data, message} object.
        // So the 'result' here IS that object.
        
        // However, detectIntent expects a slightly different signature return or raw object.
        // It seems the original code returned: { intent, message, sectionId? }
        // Our new generateStructured wrapper returns: { data: { intent, ... }, message: "conversational..." }
        
        // This is a schema mismatch we introduced in the 'GoogleProvider' implementation wrapper.
        // The orchestrator prompt expects direct mapping.
        
        // Let's adapt:
        // If the provider returned structured data in 'data' field, we use that.
        // If 'intent' is inside 'data', extract it.
        
        const data: any = result.data || {};
        return {
            intent: data.intent || 'chat',
            message: data.message || result.message,
            sectionId: data.sectionId
        };

    } catch (e) {
        console.error("Orchestrator Failed", e);
        return { intent: 'chat', message: "I'm having a bit of trouble understanding. Could you try again?" }; 
    }
}

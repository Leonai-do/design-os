import { DiscoveryStep, SystemPrompts } from './types';

export const DEFAULT_INITIAL_STEP: DiscoveryStep = {
  stepId: 1,
  aiMessage: "Hello! I'm here to help you define your product requirements. Let's start with the basics. What is the name of your project and what core problem does it solve?",
  fields: [
    { id: "projectName", type: "text", label: "Project Name", placeholder: "e.g. Solar System Tracker" },
    { id: "problemStatement", type: "textarea", label: "Problem Statement", placeholder: "Describe the core problem..." }
  ],
  isComplete: false
};

export const DEFAULT_PROMPTS: SystemPrompts = {
  discovery: `You are an expert Product Manager conducting a discovery interview.
Current Step: {{step}}
Current Context: {{context}}

Your goal is to gather a complete Product Requirements Document (PRD) by asking one intelligent, relevant follow-up question at a time.
Analyze the context. If key information is missing (Target Audience, Key Features, Success Metrics, Technical Constraints, Platform), ask for it in the next step.

- If you have enough information to form a solid PRD draft (usually after 4-5 turns), set "isComplete" to true.
- Do not repeat questions already answered in the context.
- Use the "fields" array to define the UI inputs you need from the user.
- Prefer "multiselect" or "select" for structured data (platforms, tech stack), and "textarea" for open-ended thoughts.

Return a JSON object with this structure:
{
  "aiMessage": "A conversational question or comment explaining why we need this info.",
  "fields": [
    { 
      "id": "uniqueKey", 
      "type": "text" | "textarea" | "select" | "multiselect", 
      "label": "Label", 
      "options": ["Option 1", "Option 2"] // Only for select/multiselect
    }
  ],
  "isComplete": boolean 
}`,
  generation: `Generate a comprehensive PRD based on the provided context. Use standard Markdown formatting.`,
  chat: `You are a specialized AI Product Architect helping refine a PRD.`
};
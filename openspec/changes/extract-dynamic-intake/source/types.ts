
export enum AppState {
  MODE_SELECTION = 'MODE_SELECTION', // Can be used as Welcome/Start screen
  DYNAMIC_INTAKE = 'DYNAMIC_INTAKE', // New interactive mode
  INPUT_BASIC = 'INPUT_BASIC',
  INPUT_ADVANCED = 'INPUT_ADVANCED',
  INPUT_REVERSE_BASIC = 'INPUT_REVERSE_BASIC', // New: Quick Audit
  INPUT_REVERSE_ADVANCED = 'INPUT_REVERSE_ADVANCED', // New: Deep Analysis Intake
  LOADING = 'LOADING',
  REFINEMENT = 'REFINEMENT',
  ERROR = 'ERROR'
}

export type InputMode = 'BASIC' | 'ADVANCED' | 'DYNAMIC' | 'MASTRA' | 'REVERSE_BASIC' | 'REVERSE_ADVANCED';

export type Theme = 'light' | 'dark' | 'system';

// Flexible data structure for the dynamic flow
export type PrdContext = Record<string, any>;

export type SelectOption = string | { label: string; options: string[] };

// Definition for an AI-generated form field
export interface DynamicField {
  id: string; // The key to store in PrdContext
  type: 'text' | 'textarea' | 'select' | 'multiselect';
  label: string;
  placeholder?: string;
  options?: SelectOption[]; // For select/multiselect
  description?: string; // Helper text
  dependsOn?: { fieldId: string; value: any }; // Conditional visibility
}

// The structure returned by the AI for each step
export interface DiscoveryStep {
  stepId: number;
  aiMessage: string; // Conversational text from the agent
  fields: DynamicField[];
  isComplete: boolean; // If true, AI thinks we have enough info
  lastEdited?: number; // Timestamp of last edit
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  // Versioning support
  versions?: string[]; // Array of all generated contents for this turn
  currentVersionIndex?: number; // Index of the currently active version
  isUpdate?: boolean; // True if this message resulted in a document update
  timestamp: number;
}

// --- SYSTEM PROMPTS ---
export interface SystemPrompts {
  discovery: string;
  generation: string;
  chat: string;
}

// --- MODEL ARCHITECTURE ---
export interface ModelCapabilities {
  image: boolean;    // Can see images (png, jpg, webp)
  document: boolean; // Can read text files (pdf, md, txt, code)
}

export type ModelProvider = 'GEMINI' | 'CUSTOM';

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  capabilities: ModelCapabilities;
  maxOutputTokens: number;
  maxInputTokens: number; // For context window calc
  provider: ModelProvider;
}

export interface CustomConnection {
  endpoint: string;
  apiKey: string;
  selectedModelId: string;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: "gemini-3-flash-preview",
    name: "Gemini 3 Flash",
    description: "Next-gen fast model. Best for quick drafts and iteration.",
    capabilities: { image: true, document: true },
    maxOutputTokens: 8192,
    maxInputTokens: 1048576, // 1M context
    provider: 'GEMINI'
  },
  {
    id: "gemini-3-pro-preview",
    name: "Gemini 3 Pro",
    description: "Reasoning expert. Best for detailed, complex PRDs.",
    capabilities: { image: true, document: true },
    maxOutputTokens: 8192,
    maxInputTokens: 1048576, // 1M context
    provider: 'GEMINI'
  },
  {
    id: "custom-mastra",
    name: "Custom / Mastra",
    description: "Connect to your own Mastra server or OpenAI-compatible provider.",
    capabilities: { image: false, document: true }, // Assume text-only unless verified
    maxOutputTokens: 4096,
    maxInputTokens: 128000, // Conservative default for local/custom models
    provider: 'CUSTOM'
  }
];

// Keep legacy types for backward compatibility if needed, 
// or map dynamic data to these before generation.
export interface PrdFormData {
  projectName: string;
  problemStatement: string;
  targetAudience: string;
  keyFeatures: string;
  successMetrics: string;
  technicalConstraints: string;
}

export interface AdvancedPrdFormData {
  projectName: string;
  problemStatement: string;
  businessGoals: string;
  targetAudience: string;
  personas: string;
  userFlows: string;
  problemType: string;
  platformRequirements: string;
  keyFeatures: string;
  edgeCases: string;
  scalabilityRequirements: string;
  securityRequirements: string;
  testingStrategy: string;
}

// Initial state with MOCK DATA for testing
export const INITIAL_CONTEXT: PrdContext = {
  projectName: "Mock Dynamic: Smart Home Hub",
  productType: "Hardware Products",
  problemStatement: "Smart home devices from different brands don't talk to each other reliably.",
  "productType_notes": { "Hardware Products": "Focus on Matter protocol support." },
  custom_notes_1: "We need to ensure backward compatibility with Zigbee."
};

export const INITIAL_REVERSE_CONTEXT: PrdContext = {
  analysisGoals: "Analyze this legacy PHP codebase. We need to document the hidden business rules in the checkout process so we can rewrite it in Node.js."
};

export const INITIAL_FORM_DATA: PrdFormData = {
  projectName: 'Mock Project: Solar System Tracker',
  problemStatement: 'Amateur astronomers struggle to visualize planetary alignment in real-time on mobile devices.',
  targetAudience: 'Hobbyist astronomers and students.',
  keyFeatures: '- Real-time 3D orbit visualization\n- AR overlay for night sky\n- Notification for celestial events',
  successMetrics: '10,000 downloads in first month. 4.5 star rating.',
  technicalConstraints: 'Must run at 60fps on mid-range Android phones. Offline first.'
};

export const INITIAL_ADVANCED_DATA: AdvancedPrdFormData = {
  projectName: 'Mock Enterprise: Supply Chain AI',
  problemStatement: 'Current logistics tracking is manual and reactive, leading to 15% spoilage of perishable goods.',
  businessGoals: 'Reduce spoilage by 50%. Real-time visibility for stakeholders.',
  targetAudience: 'Logistics Managers, Warehouse Operators, Drivers.',
  personas: 'Sarah (Manager): Needs high-level dashboard.\nMike (Driver): Needs simple mobile input.',
  userFlows: '1. Driver scans package -> 2. AI predicts delay -> 3. Manager gets alert -> 4. Route rerouted.',
  problemType: 'Agentic AI Tool',
  platformRequirements: 'Web Dashboard (React), Mobile App (Flutter), Cloud Backend (AWS).',
  keyFeatures: '- Computer Vision scanning\n- Predictive route optimization\n- IoT sensor integration',
  edgeCases: 'No internet connectivity in remote areas. Sensor failure.',
  scalabilityRequirements: 'Support 50,000 concurrent shipments.',
  securityRequirements: 'End-to-end encryption. SOC2 compliance.',
  testingStrategy: 'Integration-Heavy'
};

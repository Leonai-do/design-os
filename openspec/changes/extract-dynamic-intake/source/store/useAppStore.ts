
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { 
  AppState, InputMode, Theme, ModelConfig, CustomConnection, SystemPrompts,
  PrdFormData, AdvancedPrdFormData, PrdContext, DiscoveryStep, 
  AVAILABLE_MODELS, INITIAL_FORM_DATA, INITIAL_ADVANCED_DATA, INITIAL_CONTEXT, INITIAL_REVERSE_CONTEXT 
} from '../types';
import { DEFAULT_PROMPTS, DEFAULT_INITIAL_STEP } from '../constants';

interface AppStoreState {
  // Global
  theme: Theme;
  appState: AppState;
  activeInputMode: InputMode;
  sessionId: number;
  
  // Model Config
  selectedModelId: string;
  customConnection: CustomConnection;
  showConnectionModal: boolean;
  showSettingsModal: boolean;
  systemPrompts: SystemPrompts;

  // Data State
  basicFormData: PrdFormData;
  advancedFormData: AdvancedPrdFormData;
  dynamicContext: PrdContext;
  dynamicHistory: DiscoveryStep[];
  dynamicCurrentStep: DiscoveryStep;
  
  mastraContext: PrdContext;
  mastraHistory: DiscoveryStep[];
  mastraCurrentStep: DiscoveryStep;
  
  reverseContext: PrdContext;
  
  // Output State
  generatedContent: string;
  errorMsg: string | null;
  
  // Files (Not persisted in local storage due to size/security)
  files: File[]; 

  // Actions
  setTheme: (theme: Theme) => void;
  setAppState: (state: AppState) => void;
  setActiveInputMode: (mode: InputMode) => void;
  setSelectedModelId: (id: string) => void;
  setCustomConnection: (conn: CustomConnection) => void;
  setSystemPrompts: (prompts: SystemPrompts) => void;
  
  toggleConnectionModal: (show: boolean) => void;
  toggleSettingsModal: (show: boolean) => void;
  
  updateBasicFormData: (data: Partial<PrdFormData> | ((prev: PrdFormData) => PrdFormData)) => void;
  updateAdvancedFormData: (data: Partial<AdvancedPrdFormData> | ((prev: AdvancedPrdFormData) => AdvancedPrdFormData)) => void;
  
  updateDynamicContext: (ctx: PrdContext) => void;
  setDynamicHistory: (history: DiscoveryStep[]) => void;
  setDynamicCurrentStep: (step: DiscoveryStep) => void;
  
  updateMastraContext: (ctx: PrdContext) => void;
  setMastraHistory: (history: DiscoveryStep[]) => void;
  setMastraCurrentStep: (step: DiscoveryStep) => void;
  
  updateReverseContext: (ctx: PrdContext) => void;
  
  setGeneratedContent: (content: string | ((prev: string) => string)) => void;
  setErrorMsg: (msg: string | null) => void;
  setFiles: (files: File[]) => void;
  
  resetSession: () => void;
}

export const useAppStore = create<AppStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        theme: 'system',
        appState: AppState.MODE_SELECTION,
        activeInputMode: 'DYNAMIC',
        sessionId: Date.now(),
        
        selectedModelId: AVAILABLE_MODELS[0].id,
        customConnection: { endpoint: 'http://localhost:4111/v1', apiKey: '', selectedModelId: '' },
        showConnectionModal: false,
        showSettingsModal: false,
        systemPrompts: DEFAULT_PROMPTS,

        basicFormData: INITIAL_FORM_DATA,
        advancedFormData: INITIAL_ADVANCED_DATA,
        dynamicContext: INITIAL_CONTEXT,
        dynamicHistory: [],
        dynamicCurrentStep: DEFAULT_INITIAL_STEP,
        
        mastraContext: INITIAL_CONTEXT,
        mastraHistory: [],
        mastraCurrentStep: DEFAULT_INITIAL_STEP,
        
        reverseContext: INITIAL_REVERSE_CONTEXT,
        
        generatedContent: '',
        errorMsg: null,
        files: [],

        setTheme: (theme) => set({ theme }),
        setAppState: (state) => set({ appState: state }),
        setActiveInputMode: (mode) => set({ activeInputMode: mode }),
        setSelectedModelId: (id) => set({ selectedModelId: id }),
        setCustomConnection: (conn) => set({ customConnection: conn }),
        setSystemPrompts: (prompts) => set({ systemPrompts: prompts }),
        
        toggleConnectionModal: (show) => set({ showConnectionModal: show }),
        toggleSettingsModal: (show) => set({ showSettingsModal: show }),
        
        updateBasicFormData: (updater) => set((state) => ({
            basicFormData: typeof updater === 'function' ? updater(state.basicFormData) : { ...state.basicFormData, ...updater }
        })),
        updateAdvancedFormData: (updater) => set((state) => ({
            advancedFormData: typeof updater === 'function' ? updater(state.advancedFormData) : { ...state.advancedFormData, ...updater }
        })),
        
        updateDynamicContext: (ctx) => set({ dynamicContext: ctx }),
        setDynamicHistory: (history) => set({ dynamicHistory: history }),
        setDynamicCurrentStep: (step) => set({ dynamicCurrentStep: step }),
        
        updateMastraContext: (ctx) => set({ mastraContext: ctx }),
        setMastraHistory: (history) => set({ mastraHistory: history }),
        setMastraCurrentStep: (step) => set({ mastraCurrentStep: step }),
        
        updateReverseContext: (ctx) => set({ reverseContext: ctx }),
        
        setGeneratedContent: (updater) => set((state) => ({
            generatedContent: typeof updater === 'function' ? updater(state.generatedContent) : updater
        })),
        setErrorMsg: (msg) => set({ errorMsg: msg }),
        setFiles: (files) => set({ files }),
        
        resetSession: () => set({
            basicFormData: INITIAL_FORM_DATA,
            advancedFormData: INITIAL_ADVANCED_DATA,
            dynamicContext: INITIAL_CONTEXT,
            dynamicHistory: [],
            dynamicCurrentStep: DEFAULT_INITIAL_STEP,
            mastraContext: INITIAL_CONTEXT,
            mastraHistory: [],
            mastraCurrentStep: DEFAULT_INITIAL_STEP,
            reverseContext: INITIAL_REVERSE_CONTEXT,
            generatedContent: '',
            files: [],
            sessionId: Date.now(),
            appState: AppState.MODE_SELECTION
        })
      }),
      {
        name: 'prd-genius-store',
        partialize: (state) => ({
            // Don't persist large files or temporary UI states if preferred
            theme: state.theme,
            customConnection: state.customConnection,
            systemPrompts: state.systemPrompts,
            selectedModelId: state.selectedModelId
        })
      }
    )
  )
);

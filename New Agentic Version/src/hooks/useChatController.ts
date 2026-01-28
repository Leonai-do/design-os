import { useState, useRef, useEffect } from 'react';
import { useDesignStore } from '../lib/store';
import { useAppStore } from '../store/useAppStore';
import { toast } from '../components/ui/toaster';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  detectIntent,
  generateProductVision, 
  generateRoadmap, 
  generateDataModel, 
  generateDesignSystem,
  generateShellSpec,
  generateSectionSpec,
  generateSectionData,
  generateScreenDesign
} from '../lib/ai/index';
import { getNextDiscoveryStep } from '../features/dynamic-intake/services/workflows/discovery';
import { PrdContext, DiscoveryStep } from '../features/dynamic-intake/types';

// Extended message type
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: string[];
  discoveryStep?: DiscoveryStep;
  isSubmitted?: boolean;
}

type ActiveContext = 'vision' | 'roadmap' | 'data-model' | 'design-system' | 'shell-design' | 'discovery' | null;

export function useChatController() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Local UI state
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm Design OS. I can turn your ideas into a complete product spec.\n\nTell me what you want to build (e.g. \"I want a real estate website\"), or click 'Start Discovery' if you want me to interview you.",
      timestamp: Date.now()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [activeContext, setActiveContext] = useState<ActiveContext>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // App Store (Global UI & Wizard state)
  const { 
    isChatOpen, setChatOpen, 
    dynamicContext, updateDynamicContext, 
    dynamicHistory, setDynamicHistory,
    selectedModelId 
  } = useAppStore();

  // Design Store (Project Data)
  const { 
    data, 
    updateOverview, 
    updateDataModel, 
    updateDesignSystem, 
    updateRoadmap,
    updateShell,
    updateSectionSpec,
    updateSectionData,
    addScreenDesign
  } = useDesignStore();

  // Auto-open chat if Discovery is empty and requested via URL or flow
  useEffect(() => {
      // Could check URL params here if needed
  }, []);

  const resolveSectionId = (inputArgs: string): string | null => {
    const explicitId = inputArgs.split(' ')[0]?.trim();
    if (explicitId && data.roadmap?.sections.some(s => s.id === explicitId)) {
        return explicitId;
    }
    const match = location.pathname.match(/^\/sections\/([^\/]+)/);
    if (match && match[1]) {
        return match[1];
    }
    return null;
  };

  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: text,
      timestamp: Date.now()
    }]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    if (value.startsWith('/') && !value.includes(' ')) {
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }
  };

  const handleCommandSelect = (command: string) => {
    setInput(command + ' ');
    setShowCommands(false);
    inputRef.current?.focus();
  };

  // --- DISCOVERY LOGIC ---

  const startDiscovery = async () => {
      setActiveContext('discovery');
      setIsTyping(true);
      
      // Reset context if starting fresh? 
      // For now, let's keep existing context so it can resume.
      // If we wanted fresh, we'd call updateDynamicContext({}) here.

      try {
          const step = await getNextDiscoveryStep(dynamicContext, dynamicHistory, [], selectedModelId);
          
          setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'assistant',
              content: step.aiMessage,
              timestamp: Date.now(),
              discoveryStep: step,
              isSubmitted: false
          }]);
      } catch (e) {
          console.error(e);
          addBotMessage("I had trouble starting the interview. Please try again.");
          setActiveContext(null);
      } finally {
          setIsTyping(false);
      }
  };

  const handleDiscoverySubmit = async (msgId: string, updatedContext: PrdContext) => {
      // 1. Mark message as submitted
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isSubmitted: true } : m));
      
      // 2. Update Global Context
      updateDynamicContext(updatedContext);
      
      // 3. Find which step this was
      const msg = messages.find(m => m.id === msgId);
      if (!msg?.discoveryStep) return;

      const currentStep = msg.discoveryStep;
      
      // 4. Update History
      const newHistory = [...dynamicHistory, { ...currentStep, isComplete: true }];
      setDynamicHistory(newHistory);

      setIsTyping(true);

      // 5. Check completion or get next step
      // For simplicity, we just ask for the next step. The AI decides if it's done.
      try {
          const nextStep = await getNextDiscoveryStep(updatedContext, newHistory, [], selectedModelId);
          
          if (nextStep.isComplete) {
              // FINISHED
              addBotMessage("Thanks! I have everything I need. I've drafted your Product Vision based on our conversation.");
              
              // Generate/Save Vision
              updateOverview({
                  name: updatedContext.projectName || 'New Project',
                  description: updatedContext.problemStatement || 'Generated from discovery.',
                  problems: [],
                  features: []
              });
              
              setActiveContext(null);
              toast({ title: "Discovery Complete", description: "Product Vision updated.", type: 'success' });
          } else {
              // NEXT QUESTION
              setMessages(prev => [...prev, {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: nextStep.aiMessage,
                  timestamp: Date.now(),
                  discoveryStep: nextStep,
                  isSubmitted: false
              }]);
          }
      } catch (e) {
          console.error(e);
          addBotMessage("Something went wrong continuing the interview. You can try asking me manually.");
      } finally {
          setIsTyping(false);
      }
  };

  // --- STANDARD AI HANDLERS ---

  const handleVision = async (input: string, history: any[], images: string[] = []) => {
    setActiveContext('vision'); 
    const response = await generateProductVision(input, data.overview, history);
    if (response.data) {
        updateOverview(response.data);
        toast({ title: "Product Vision Updated", description: "docs/product-vision.md updated", type: 'success' });
    }
    addBotMessage(response.message);
  };

  const handleRoadmap = async (input: string, history: any[], images: string[] = []) => {
    if (!data.overview) {
        addBotMessage("To plan the roadmap, I first need to know what we're building. Let's start with the Product Vision. What is your product idea?");
        setActiveContext('vision');
        return;
    }
    setActiveContext('roadmap');
    const response = await generateRoadmap(input, data.overview, data.roadmap, history);
    if (response.data) {
        updateRoadmap(response.data);
        toast({ title: "Roadmap Updated", description: "docs/roadmap.md updated", type: 'success' });
    }
    addBotMessage(response.message);
  };

  const handleDataModel = async (input: string, history: any[], images: string[] = []) => {
    if (!data.overview) {
         addBotMessage("I need a Product Vision before designing the data model.");
         setActiveContext('vision');
         return;
    }
    setActiveContext('data-model');
    const response = await generateDataModel(input, data.overview, data.roadmap || { sections: [] }, data.dataModel, history);
    if (response.data) {
        updateDataModel(response.data);
        toast({ title: "Data Model Updated", description: "src/db/schema.prisma updated", type: 'success' });
    }
    addBotMessage(response.message);
  };

  const handleDesignSystem = async (input: string, history: any[], images: string[] = []) => {
    if (!data.overview) {
        addBotMessage("I need to know the product (Vision) before choosing colors.");
        setActiveContext('vision');
        return;
    }
    setActiveContext('design-system');
    const response = await generateDesignSystem(input, data.overview, data.designSystem, history, images);
    if (response.data) {
        updateDesignSystem(response.data);
        toast({ title: "Design Tokens Updated", description: "src/theme/* files updated", type: 'success' });
    }
    addBotMessage(response.message);
  };

  const handleShellDesign = async (input: string, history: any[], images: string[] = []) => {
    if (!data.overview || !data.roadmap) {
        addBotMessage("I need a Product Vision and Roadmap before designing the Shell.");
        return;
    }
    setActiveContext('shell-design');
    const response = await generateShellSpec(input, data.overview, data.roadmap, history, images);
    if (response.data) {
        updateShell({ spec: response.data, hasComponents: false });
        toast({ title: "Shell Designed", description: "App shell specification updated", type: 'success' });
        navigate('/shell/design');
    }
    addBotMessage(response.message);
  };

  const handleSectionSpec = async (input: string, history: any[], images: string[] = []) => {
    const sectionId = resolveSectionId(input);
    if (!sectionId) {
        addBotMessage("Which section are we working on? Please specify the ID.");
        return;
    }
    if (!data.roadmap) {
         addBotMessage("We need a Roadmap first.");
         return;
    }
    const response = await generateSectionSpec(input, data.roadmap, history, images);
    if (response.data) {
        updateSectionSpec(sectionId, response.data);
        toast({ title: "Spec Updated", description: `Updated spec for ${sectionId}`, type: 'success' });
        navigate(`/sections/${sectionId}`);
    }
    addBotMessage(response.message);
  };

  const handleSectionData = async (input: string, history: any[], images: string[] = []) => {
    const sectionId = resolveSectionId(input);
    if (!sectionId) {
        addBotMessage("Which section? Specify ID.");
        return;
    }
    const section = data.sections[sectionId];
    if (!section?.spec || !data.dataModel) {
        addBotMessage("I need a Section Spec and a Data Model first.");
        return;
    }
    const response = await generateSectionData(section.spec, data.dataModel, history);
    if (response.data) {
        updateSectionData(sectionId, response.data);
        toast({ title: "Sample Data Generated", description: `Updated data for ${sectionId}`, type: 'success' });
    }
    addBotMessage(response.message);
  };

  const handleSectionUI = async (input: string, history: any[], images: string[] = []) => {
    const sectionId = resolveSectionId(input);
    if (!sectionId) {
        addBotMessage("Which section? Specify ID.");
        return;
    }
    const section = data.sections[sectionId];
    if (!section?.spec || !section?.sampleData) {
        addBotMessage("I need a Spec and Sample Data for this section first.");
        return;
    }
    const response = await generateScreenDesign(section.spec, section.sampleData, data.designSystem, history, images);
    if (response.data) {
        addScreenDesign(sectionId, response.data);
        toast({ title: "Screen Design Created", description: `Created ${response.data.name}`, type: 'success' });
        navigate(`/sections/${sectionId}/screen-designs/${response.data.id}`);
    }
    addBotMessage(response.message);
  };

  const handleExport = async () => {
    navigate('/export');
    addBotMessage("I've navigated you to the export page.");
  };

  const handleSend = async (attachments: string[] = []) => {
    if (!input.trim() && attachments.length === 0) return;

    // Special trigger for discovery
    if (input.trim() === '/discovery') {
        setInput('');
        setShowCommands(false);
        startDiscovery();
        return;
    }

    const userText = input;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: Date.now(),
      attachments: attachments
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowCommands(false);
    setIsTyping(true);

    try {
      const historyMsg = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      
      // If we are in discovery mode, we treat text input as a general chat or override
      // But typically user should use the form. 
      // If they type text, we'll just process it as a vision update or generic chat.
      if (activeContext === 'discovery') {
          // If user types while in discovery, maybe they want to exit or clarify?
          // For now, let's just treat it as generic chat unless they explicitly exit.
          // Or we could try to incorporate their text into the context?
          // Let's fallback to standard intent detection if they type text.
      }

      if (userText.startsWith('/product-vision')) {
        await handleVision(userText, historyMsg, attachments);
      } else if (userText.startsWith('/product-roadmap')) {
        await handleRoadmap(userText, historyMsg, attachments);
      } else if (userText.startsWith('/data-model')) {
        await handleDataModel(userText, historyMsg, attachments);
      } else if (userText.startsWith('/design-tokens')) {
        await handleDesignSystem(userText, historyMsg, attachments);
      } else if (userText.startsWith('/design-shell')) {
        await handleShellDesign(userText, historyMsg, attachments);
      } else if (userText.startsWith('/section-spec')) {
        await handleSectionSpec(userText.replace('/section-spec', '').trim(), historyMsg, attachments);
      } else if (userText.startsWith('/section-data')) {
        await handleSectionData(userText.replace('/section-data', '').trim(), historyMsg, attachments);
      } else if (userText.startsWith('/section-ui')) {
        await handleSectionUI(userText.replace('/section-ui', '').trim(), historyMsg, attachments);
      } else if (userText.startsWith('/export-product')) {
        await handleExport();
      } else if (activeContext && activeContext !== 'discovery') {
        switch (activeContext) {
            case 'vision': await handleVision(userText, historyMsg, attachments); break;
            case 'roadmap': await handleRoadmap(userText, historyMsg, attachments); break;
            case 'data-model': await handleDataModel(userText, historyMsg, attachments); break;
            case 'design-system': await handleDesignSystem(userText, historyMsg, attachments); break;
            case 'shell-design': await handleShellDesign(userText, historyMsg, attachments); break;
        }
      } else {
        const result = await detectIntent(userText, historyMsg, { 
            hasVision: !!data.overview, 
            hasRoadmap: !!data.roadmap 
        }, attachments);

        if (result.intent && result.intent !== 'chat') {
            const args = userText;
            switch (result.intent) {
                case 'vision': await handleVision(args, historyMsg, attachments); break;
                case 'roadmap': await handleRoadmap(args, historyMsg, attachments); break;
                case 'data-model': await handleDataModel(args, historyMsg, attachments); break;
                case 'design-system': await handleDesignSystem(args, historyMsg, attachments); break;
                case 'shell-design': await handleShellDesign(args, historyMsg, attachments); break;
                
                case 'section-spec':
                    if (result.sectionId) await handleSectionSpec(result.sectionId + " " + args, historyMsg, attachments);
                    else await handleSectionSpec(args, historyMsg, attachments); 
                    break;
                case 'section-data':
                    if (result.sectionId) await handleSectionData(result.sectionId + " " + args, historyMsg, attachments);
                    else await handleSectionData(args, historyMsg, attachments);
                    break;
                case 'screen-design':
                    if (result.sectionId) await handleSectionUI(result.sectionId + " " + args, historyMsg, attachments);
                    else await handleSectionUI(args, historyMsg, attachments);
                    break;
                    
                default: addBotMessage(result.message);
            }
        } else {
            addBotMessage(result.message || "I didn't quite catch that. Could you clarify?");
        }
      }
    } catch (error) {
      console.error("AI Error:", error);
      addBotMessage("Sorry, I encountered an error processing your request. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  return {
    isOpen: isChatOpen, 
    setIsOpen: setChatOpen,
    isMinimized, setIsMinimized,
    input, setInput,
    messages,
    isTyping,
    showCommands, setShowCommands,
    activeContext,
    inputRef,
    handleSend,
    handleInputChange,
    handleCommandSelect,
    startDiscovery, // Exported for external triggers (EmptyState)
    handleDiscoverySubmit
  };
}
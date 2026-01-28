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
import { formatResponseForDisplay } from '../lib/ai/providers/utils';
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
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);
  
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
    
    if (!selectedCommand && value.startsWith('/') && !value.includes(' ')) {
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }
  };

  const handleCommandSelect = (command: string) => {
    setSelectedCommand(command);
    setInput('');
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

  // Parsing helper for streaming
  const createStreamingMessage = (role: 'assistant' = 'assistant') => {
      const id = `ai-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const msg: Message = {
          id,
          role,
          content: '',
          timestamp: Date.now()
      };
      setMessages(prev => [...prev, msg]);
      
      let accumulated = '';
      return {
          id,
          update: (chunk: string) => {
              accumulated += chunk;
              setMessages(prev => prev.map(m => m.id === id ? { ...m, content: accumulated } : m));
          },
          complete: (full: string) => {
              setMessages(prev => prev.map(m => m.id === id ? { ...m, content: full || accumulated } : m));
          }
      };
  };

  const handleVision = async (input: string, history: any[], images: string[] = []) => {
    setActiveContext('vision'); 
    const stream = createStreamingMessage();
    try {
        const response = await generateProductVision(input, data.overview, history, stream.update);
        stream.complete(formatResponseForDisplay(response));
        
        if (response.data) {
            updateOverview(response.data);
            toast({ title: "Product Vision Updated", description: "docs/product-vision.md updated", type: 'success' });
        }
    } catch (e) {
        console.error(e);
        stream.complete("Sorry, I encountered an error generating the vision.");
    }
  };

  const handleRoadmap = async (input: string, history: any[], images: string[] = []) => {
    if (!data.overview) {
        addBotMessage("To plan the roadmap, I first need to know what we're building. Let's start with the Product Vision. What is your product idea?");
        setActiveContext('vision');
        return;
    }
    setActiveContext('roadmap');
    const stream = createStreamingMessage();
    try {
        const response = await generateRoadmap(input, data.overview, data.roadmap, history, stream.update);
        stream.complete(formatResponseForDisplay(response));
        
        if (response.data) {
            updateRoadmap(response.data);
            toast({ title: "Roadmap Updated", description: "docs/roadmap.md updated", type: 'success' });
        }
    } catch (e) {
        console.error(e);
        stream.complete("Sorry, I encountered an error generating the roadmap.");
    }
  };

  const handleDataModel = async (input: string, history: any[], images: string[] = []) => {
    if (!data.overview) {
         addBotMessage("I need a Product Vision before designing the data model.");
         setActiveContext('vision');
         return;
    }
    setActiveContext('data-model');
    const stream = createStreamingMessage();
    try {
        const response = await generateDataModel(input, data.overview, data.roadmap || { sections: [] }, data.dataModel, history, images, stream.update);
        stream.complete(formatResponseForDisplay(response));

        if (response.data) {
            updateDataModel(response.data);
            toast({ title: "Data Model Updated", description: "src/db/schema.prisma updated", type: 'success' });
        }
    } catch (e) {
        console.error(e);
        stream.complete("Sorry, I encountered an error generating the data model.");
    }
  };

  const handleDesignSystem = async (input: string, history: any[], images: string[] = []) => {
    if (!data.overview) {
        addBotMessage("I need to know the product (Vision) before choosing colors.");
        setActiveContext('vision');
        return;
    }
    setActiveContext('design-system');
    const stream = createStreamingMessage();
    try {
        const response = await generateDesignSystem(input, data.overview, data.designSystem, history, images, stream.update);
        stream.complete(formatResponseForDisplay(response));
        
        if (response.data) {
            updateDesignSystem(response.data);
            toast({ title: "Design Tokens Updated", description: "src/theme/* files updated", type: 'success' });
        }
    } catch (e) {
        console.error(e);
        stream.complete("Sorry, I encountered an error generating the design system.");
    }
  };

  const handleShellDesign = async (input: string, history: any[], images: string[] = []) => {
    if (!data.overview || !data.roadmap) {
        addBotMessage("I need a Product Vision and Roadmap before designing the Shell.");
        return;
    }
    setActiveContext('shell-design');
    const stream = createStreamingMessage();
    try {
        const response = await generateShellSpec(input, data.overview, data.roadmap, history, images, stream.update);
        stream.complete(formatResponseForDisplay(response));
        
        if (response.data) {
            updateShell({ spec: response.data, hasComponents: false });
            toast({ title: "Shell Designed", description: "App shell specification updated", type: 'success' });
            navigate('/shell/design');
        }
    } catch (e) {
        console.error(e);
        stream.complete("Sorry, I encountered an error generating the shell design.");
    }
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
    const stream = createStreamingMessage();
    try {
        const response = await generateSectionSpec(input, data.roadmap, history, images, stream.update);
        stream.complete(formatResponseForDisplay(response));
        
        if (response.data) {
            updateSectionSpec(sectionId, response.data);
            toast({ title: "Spec Updated", description: `Updated spec for ${sectionId}`, type: 'success' });
            navigate(`/sections/${sectionId}`);
        }
    } catch (e) {
        console.error(e);
        stream.complete(`Sorry, I encountered an error generating the spec for ${sectionId}.`);
    }
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
    const stream = createStreamingMessage();
    try {
        const response = await generateSectionData(section.spec, data.dataModel, history, images, stream.update);
        stream.complete(formatResponseForDisplay(response));

        if (response.data) {
            updateSectionData(sectionId, response.data);
            toast({ title: "Sample Data Generated", description: `Updated data for ${sectionId}`, type: 'success' });
        }
    } catch (e) {
         console.error(e);
         stream.complete(`Sorry, I encountered an error generating data for ${sectionId}.`);
    }
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
    const stream = createStreamingMessage();
    try {
        const response = await generateScreenDesign(section.spec, section.sampleData, data.designSystem, history, images, stream.update);
        stream.complete(formatResponseForDisplay(response));
        
        if (response.data) {
            addScreenDesign(sectionId, response.data);
            toast({ title: "Screen Design Created", description: `Created ${response.data.name}`, type: 'success' });
            navigate(`/sections/${sectionId}/screen-designs/${response.data.id}`);
        }
    } catch (e) {
        console.error(e);
        stream.complete(`Sorry, I encountered an error generating the screen design for ${sectionId}.`);
    }
  };

  const handleExport = async () => {
    navigate('/export');
    addBotMessage("I've navigated you to the export page.");
  };

  const handleSend = async (attachments: string[] = []) => {
    const fullInput = selectedCommand ? `${selectedCommand} ${input}`.trim() : input.trim();
    
    if (!fullInput && attachments.length === 0) return;

    // Special trigger for discovery
    if (fullInput === '/discovery') {
        setInput('');
        setSelectedCommand(null);
        setShowCommands(false);
        startDiscovery();
        return;
    }

    const userText = fullInput;
    const userMsg: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
      attachments: attachments
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedCommand(null);
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
        const stream = createStreamingMessage();
        
        // Filter streaming to show only thoughts, hiding potential JSON schema
        let accumulatedRaw = '';
        const thoughtStreamer = (chunk: string) => {
            const previousLength = accumulatedRaw.length;
            accumulatedRaw += chunk;
            const endTag = '</think>';
            const endIndex = accumulatedRaw.indexOf(endTag);
            
            if (endIndex === -1) {
                stream.update(chunk);
            } else {
                const cutoff = endIndex + endTag.length;
                if (previousLength < cutoff) {
                     const validChunkPart = accumulatedRaw.substring(previousLength, cutoff);
                     stream.update(validChunkPart);
                }
            }
        };
        
        const result = await detectIntent(userText, historyMsg, { 
            hasVision: !!data.overview, 
            hasRoadmap: !!data.roadmap 
        }, attachments, thoughtStreamer);

        // Extract thoughts based on tags
        const thoughts = (result.raw || '').match(/<think>[\s\S]*?<\/think>/i)?.[0] || '';
        
        // Ensure message is clean of thoughts to avoid duplication
        let cleanMessage = result.message || '';
        // Remove any residual think tags from message (including content)
        cleanMessage = cleanMessage.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

        if (result.intent && result.intent !== 'chat') {
            // Routing
            stream.complete(`${thoughts}\nRouting request to ${result.intent}...`.trim());
            
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
                    
                default: 
                     addBotMessage(result.message);
            }
        } else {
            // Chat
            if (thoughts) {
                stream.complete(`${thoughts}\n${cleanMessage}`.trim());
            } else {
                stream.complete(cleanMessage || "I didn't quite catch that.");
            }
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
    handleDiscoverySubmit,
    selectedCommand,
    setSelectedCommand
  };
}
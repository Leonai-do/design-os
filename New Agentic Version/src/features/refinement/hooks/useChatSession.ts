
import { useState, useRef, useEffect } from 'react';
import { ChatMessage, ModelConfig } from '../../dynamic-intake/types';
import { chatWithPrd } from '../../dynamic-intake/services/geminiService';

interface UseChatSessionProps {
  content: string;
  setContent: (c: string) => void;
  files: File[];
  modelConfig: ModelConfig;
  systemPrompt: string;
}

export const useChatSession = ({ content, setContent, files, modelConfig, systemPrompt }: UseChatSessionProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'ai',
      text: "I've drafted your PRD based on the blueprint. Check the Architecture and Requirements sections. \n\nTip: You can ask me questions about the document, or ask me to make specific changes.",
      versions: ["I've drafted your PRD based on the blueprint. Check the Architecture and Requirements sections. \n\nTip: You can ask me questions about the document, or ask me to make specific changes."],
      currentVersionIndex: 0,
      timestamp: Date.now()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (chatBottomRef.current) {
        chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleStop = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setIsProcessing(false);
    }
  };

  const generateResponse = async (targetMsgId: string, contextHistory: ChatMessage[], userRequest: string) => {
    abortControllerRef.current = new AbortController();

    try {
      let accumulatedText = '';
      
      const result = await chatWithPrd(
        content, 
        contextHistory, 
        userRequest, 
        files, 
        modelConfig.id, 
        (chunk) => {
          accumulatedText += chunk;
          setMessages(prev => prev.map(m => {
              if (m.id !== targetMsgId) return m;
              const newVersions = [...(m.versions || [])];
              const idx = m.currentVersionIndex || 0;
              newVersions[idx] = accumulatedText;
              return { ...m, text: accumulatedText, versions: newVersions };
          }));
        },
        null, 
        systemPrompt,
        abortControllerRef.current.signal
      );
      
      setMessages(prev => prev.map(m => {
          if (m.id !== targetMsgId) return m;
          const newVersions = [...(m.versions || [])];
          const idx = m.currentVersionIndex || 0;
          newVersions[idx] = result.text;
          return { ...m, text: result.text, versions: newVersions, isUpdate: !!result.newPrd };
      }));

      if (result.newPrd) {
        setContent(result.newPrd);
      }

    } catch (e: any) {
      if (e.message.includes('aborted')) {
          setMessages(prev => prev.map(m => {
              if (m.id !== targetMsgId) return m;
              return { ...m, text: m.text + " [Stopped by user]" };
          }));
          return;
      }
      setMessages(prev => prev.map(m => {
          if (m.id !== targetMsgId) return m;
          const errorText = "Sorry, I encountered an error. Please try again.";
          const newVersions = [...(m.versions || [])];
          const idx = m.currentVersionIndex || 0;
          newVersions[idx] = errorText;
          return { ...m, text: errorText, versions: newVersions };
      }));
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputMessage,
      versions: [inputMessage],
      currentVersionIndex: 0,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsProcessing(true);

    const aiMsgId = (Date.now() + 1).toString();
    const newAiMsg: ChatMessage = {
        id: aiMsgId,
        role: 'ai',
        text: '',
        versions: [''],
        currentVersionIndex: 0,
        timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newAiMsg]);
    await generateResponse(aiMsgId, [...messages, userMsg], userMsg.text);
  };

  const handleRegenerate = async (messageId: string) => {
    if (isProcessing) return;
    const index = messages.findIndex(m => m.id === messageId);
    if (index === -1) return;

    const contextMessages = messages.slice(0, index);
    let lastUserText = "Continue";
    if (index > 0 && messages[index - 1].role === 'user') {
        lastUserText = messages[index - 1].text;
    }

    setMessages(prev => prev.slice(0, index + 1));
    setIsProcessing(true);

    setMessages(prev => {
        const newMsgs = [...prev];
        const targetMsg = { ...newMsgs[index] };
        if (!targetMsg.versions) {
            targetMsg.versions = [targetMsg.text];
            targetMsg.currentVersionIndex = 0;
        }
        targetMsg.versions = [...targetMsg.versions, ''];
        targetMsg.currentVersionIndex = targetMsg.versions.length - 1;
        targetMsg.text = ''; 
        newMsgs[index] = targetMsg;
        return newMsgs;
    });

    await generateResponse(messageId, contextMessages, lastUserText);
  };

  const handleVersionChange = (messageId: string, direction: 'prev' | 'next') => {
    setMessages(prev => prev.map(msg => {
        if (msg.id !== messageId || !msg.versions) return msg;
        const currentIndex = msg.currentVersionIndex || 0;
        let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0) newIndex = 0;
        if (newIndex >= msg.versions.length) newIndex = msg.versions.length - 1;
        return { ...msg, currentVersionIndex: newIndex, text: msg.versions[newIndex] };
    }));
  };

  return {
    messages,
    inputMessage,
    setInputMessage,
    isProcessing,
    chatBottomRef,
    handleSendMessage,
    handleRegenerate,
    handleVersionChange,
    handleStop
  };
};

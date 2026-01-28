import React, { useEffect, useRef } from 'react';
import { Bot, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DiscoveryBubble } from './DiscoveryBubble';
import { ChatMessage, PrdContext } from '../../features/dynamic-intake/types';
import { parseMessage } from '../../lib/messageParser';
import { ThinkingDisclosure } from './ThinkingDisclosure';

// Adapting to the type definition used in ChatController
interface MessageListProps {
  messages: any[]; // Using any to bridge between simple Message and ChatMessage temporarily if needed, but ideal to unify
  isTyping: boolean;
  onDiscoverySubmit?: (msgId: string, context: PrdContext) => void;
  currentContext?: PrdContext;
}

export function MessageList({ messages, isTyping, onDiscoverySubmit, currentContext = {} }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
            msg.role === 'ai' || msg.role === 'assistant'
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' 
              : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
          }`}>
            {(msg.role === 'ai' || msg.role === 'assistant') ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </div>
          
          <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            
            {/* Attachments Grid */}
            {msg.attachments && msg.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-1 justify-end">
                {msg.attachments.map((src: string, idx: number) => (
                  <img 
                    key={idx} 
                    src={src} 
                    alt="attachment" 
                    className="h-24 w-auto rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm object-cover"
                  />
                ))}
              </div>
            )}

            <div className={`flex flex-col gap-2 w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
               <div className={`rounded-xl p-4 text-sm shadow-sm w-full overflow-hidden ${
                 msg.role === 'ai' || msg.role === 'assistant'
                   ? 'bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
                   : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
               }`}>
                 {(() => {
                   const content = msg.content || msg.text || '';
                   // Parsed segments for AI
                   if (msg.role === 'ai' || msg.role === 'assistant') {
                      const segments = parseMessage(content);
                      return (
                        <div className="flex flex-col gap-3">
                          {segments.map((segment, idx) => {
                            if (segment.type === 'think') {
                              return (
                                <ThinkingDisclosure 
                                  key={idx} 
                                  content={segment.content} 
                                  isComplete={segment.isComplete}
                                />
                              );
                            }
                            return (
                              <ReactMarkdown
                                key={idx}
                                components={{
                                  h1: ({node, ...props}) => <h1 className="text-base font-bold mb-2 mt-2" {...props} />,
                                  h2: ({node, ...props}) => <h2 className="text-sm font-bold mb-1 mt-2" {...props} />,
                                  h3: ({node, ...props}) => <h3 className="text-sm font-semibold mb-1 mt-1" {...props} />,
                                  ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                  ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                  li: ({node, ...props}) => <li className="mb-0.5" {...props} />,
                                  p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                                  strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                                  code: ({node, className, children, ...props}) => {
                                    const match = /language-(\w+)/.exec(className || '')
                                    const isInline = !match && !String(children).includes('\n')
                                    if (isInline) {
                                        return <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-xs" {...props}>{children}</code>
                                    }
                                    return (
                                      <div className="my-2 rounded-md overflow-hidden bg-black/90 text-zinc-50 border border-white/10">
                                        <div className="px-3 py-1 bg-white/10 border-b border-white/10 text-[10px] text-zinc-400 font-mono">
                                          CODE
                                        </div>
                                        <code className="block p-3 text-xs font-mono overflow-x-auto" {...props}>{children}</code>
                                      </div>
                                    )
                                  }
                                }}
                              >
                                {segment.content}
                              </ReactMarkdown>
                            );
                          })}
                        </div>
                      );
                   }
                   
                   // User messages or fallback
                   return (
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-base font-bold mb-2 mt-2" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-sm font-bold mb-1 mt-2" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-sm font-semibold mb-1 mt-1" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="mb-0.5" {...props} />,
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                          code: ({node, className, children, ...props}) => {
                            const match = /language-(\w+)/.exec(className || '')
                            const isInline = !match && !String(children).includes('\n')
                            if (isInline) {
                                return <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-xs" {...props}>{children}</code>
                            }
                            return (
                              <div className="my-2 rounded-md overflow-hidden bg-black/90 text-zinc-50 border border-white/10">
                                <div className="px-3 py-1 bg-white/10 border-b border-white/10 text-[10px] text-zinc-400 font-mono">
                                  CODE
                                </div>
                                <code className="block p-3 text-xs font-mono overflow-x-auto" {...props}>{children}</code>
                              </div>
                            )
                          }
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                   );
                 })()}

                 {/* Discovery Form Bubble */}
                 {msg.discoveryStep && onDiscoverySubmit && (
                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <DiscoveryBubble 
                        step={msg.discoveryStep}
                        context={currentContext}
                        isSubmitted={msg.isSubmitted}
                        onSubmit={(ctx) => onDiscoverySubmit(msg.id, ctx)}
                      />
                    </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
}
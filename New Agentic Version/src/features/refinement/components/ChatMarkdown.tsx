
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMarkdownProps {
  content: string;
  role: 'user' | 'ai';
}

const ChatMarkdown: React.FC<ChatMarkdownProps> = ({ content, role }) => {
  const isAi = role === 'ai';
  
  return (
    <div className={`chat-markdown-content ${isAi ? 'ai-content' : 'user-content'}`}>
       {/* Override styles for code inside pre blocks to prevent double-styling */}
       <style>{`
         .chat-markdown-content pre code {
            background-color: transparent !important;
            padding: 0 !important;
            color: inherit !important;
            font-size: inherit !important;
         }
       `}</style>
       <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
             p: ({children}) => <p className="mb-2 last:mb-0 leading-relaxed whitespace-pre-wrap break-words">{children}</p>,
             ul: ({children}) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
             ol: ({children}) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
             li: ({children}) => <li className="pl-1">{children}</li>,
             a: ({href, children}) => <a href={href} target="_blank" rel="noreferrer" className="underline font-medium opacity-90 hover:opacity-100">{children}</a>,
             blockquote: ({children}) => <blockquote className="border-l-2 border-current pl-3 italic opacity-80 my-2">{children}</blockquote>,
             h1: ({children}) => <h3 className="text-base font-bold mt-3 mb-2">{children}</h3>,
             h2: ({children}) => <h4 className="text-sm font-bold mt-3 mb-2">{children}</h4>,
             h3: ({children}) => <h5 className="text-sm font-bold mt-2 mb-1">{children}</h5>,
             table: ({children}) => <div className="overflow-x-auto my-2"><table className="min-w-full text-xs text-left border-collapse border border-current opacity-80">{children}</table></div>,
             th: ({children}) => <th className="p-1 border border-current font-bold">{children}</th>,
             td: ({children}) => <td className="p-1 border border-current">{children}</td>,
             pre: ({children}) => (
                <pre className={`p-3 rounded-lg overflow-x-auto my-2 text-xs font-mono border ${
                   isAi 
                   ? 'bg-black/30 border-white/10 text-white' 
                   : 'bg-zinc-800 text-zinc-200 border-transparent dark:bg-black/30'
                }`}>
                   {children}
                </pre>
             ),
             code: ({children}) => (
                <code className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                   isAi
                   ? 'bg-white/20 text-white'
                   : 'bg-zinc-200 text-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-200'
                }`}>
                   {children}
                </code>
             )
          }}
       >
         {content}
       </ReactMarkdown>
    </div>
  );
};

export default ChatMarkdown;


import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { slugify } from '../hooks/useTOC';

interface DocPreviewProps {
  content: string;
  showPreview: boolean;
  onScrollToSection: (id: string) => void;
}

const DocPreview: React.FC<DocPreviewProps> = ({ content, showPreview, onScrollToSection }) => {
  // Custom components for ReactMarkdown to inject IDs
  const MarkdownComponents = {
    h1: ({ children, ...props }: any) => {
      const text = String(children);
      const id = slugify(text);
      return <h1 id={id} {...props}>{children}</h1>;
    },
    h2: ({ children, ...props }: any) => {
      const text = String(children);
      const id = slugify(text);
      return <h2 id={id} {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }: any) => {
      const text = String(children);
      const id = slugify(text);
      return <h3 id={id} {...props}>{children}</h3>;
    },
    // Intercept links to make them smooth scroll if they are internal anchor links
    a: ({ href, children, ...props }: any) => {
      if (href?.startsWith('#')) {
        return (
          <a 
            href={href} 
            onClick={(e) => {
              e.preventDefault();
              onScrollToSection(href.substring(1));
            }}
            {...props}
          >
            {children}
          </a>
        );
      }
      return <a href={href} {...props}>{children}</a>;
    }
  };

  return (
    <div className={`flex-1 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col transition-colors duration-300 ${showPreview ? 'block' : 'hidden md:flex'}`}>
      <div className="bg-zinc-50 dark:bg-zinc-800 px-6 py-3 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center shrink-0">
        <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-bold">Document Preview</span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">Read-only</span>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 md:p-12 bg-white dark:bg-zinc-900 scroll-smooth custom-scrollbar" id="prd-document">
         <div className="prose dark:prose-invert max-w-none break-words">
           <ReactMarkdown 
             remarkPlugins={[remarkGfm]}
             components={MarkdownComponents}
           >
             {content}
           </ReactMarkdown>
         </div>
      </div>
    </div>
  );
};

export default DocPreview;

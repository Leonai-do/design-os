
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { SectionSpec } from '../types';
import { FileText } from 'lucide-react';

interface SpecCardProps {
  spec: SectionSpec | null;
  title?: string;
}

export function SpecCard({ spec, title = "Specification" }: SpecCardProps) {
  if (!spec) return null;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="w-4 h-4 text-zinc-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 overflow-y-auto max-h-[500px]">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h3 className="text-lg font-bold mb-2 mt-4" {...props} />,
              h2: ({node, ...props}) => <h4 className="text-base font-semibold mb-2 mt-3" {...props} />,
              p: ({node, ...props}) => <p className="mb-2 text-zinc-600 dark:text-zinc-300" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
              li: ({node, ...props}) => <li className="mb-1" {...props} />,
            }}
          >
            {spec.raw || spec.description}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}

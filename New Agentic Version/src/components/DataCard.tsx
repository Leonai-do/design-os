
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Database } from 'lucide-react';

interface DataCardProps {
  data: string | null;
  title?: string;
}

export function DataCard({ data, title = "Sample Data" }: DataCardProps) {
  if (!data) return null;

  let parsedData = null;
  try {
    parsedData = JSON.parse(data);
  } catch (e) {
    parsedData = { error: "Invalid JSON", raw: data };
  }

  // Extract meta info if available
  const meta = parsedData?._meta;
  const displayData = { ...parsedData };
  delete displayData._meta;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <CardTitle className="text-base flex items-center gap-2">
          <Database className="w-4 h-4 text-zinc-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex-1 overflow-hidden flex flex-col">
        {meta && (
          <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md text-sm">
            <h4 className="font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Data Model</h4>
            <div className="text-zinc-600 dark:text-zinc-400 space-y-2">
                {meta.models && Object.entries(meta.models).map(([key, desc]: any) => (
                    <div key={key}><span className="font-mono text-xs bg-zinc-200 dark:bg-zinc-800 px-1 rounded">{key}</span>: {desc}</div>
                ))}
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 rounded-md border border-zinc-200 dark:border-zinc-800 p-3">
            <pre className="text-xs font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
            {JSON.stringify(displayData, null, 2)}
            </pre>
        </div>
      </CardContent>
    </Card>
  );
}

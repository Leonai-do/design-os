
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useDesignStore } from '../lib/store';
import { Button } from '../components/ui/button';
import { Smartphone, Tablet, Monitor, RefreshCw, Code, ArrowLeft } from 'lucide-react';
import { CodeEditor } from '../components/CodeEditor';
import { EmptyState } from '../components/EmptyState';

export function ShellDesignPage() {
  const navigate = useNavigate();
  const { data } = useDesignStore();
  const [viewportWidth, setViewportWidth] = useState<string>('100%');
  const [showCode, setShowCode] = useState(false);
  
  if (!data.shell?.spec) {
    return (
      <AppLayout title="App Shell">
        <EmptyState type="shell" />
      </AppLayout>
    );
  }

  const handleResize = (width: string) => setViewportWidth(width);

  const previewHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>body { margin: 0; font-family: sans-serif; }</style>
      </head>
      <body>
        <div class="flex h-screen bg-gray-50">
          <!-- Simulated Sidebar -->
          <div class="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div class="h-16 flex items-center px-6 font-bold text-xl border-b border-gray-100">Logo</div>
            <div class="flex-1 p-4 space-y-1">
              ${data.shell.spec.navigationItems.map(item => `
                <div class="px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 cursor-pointer flex items-center gap-3">
                  <div class="w-4 h-4 bg-gray-300 rounded"></div>
                  ${item}
                </div>
              `).join('')}
            </div>
            <div class="p-4 border-t border-gray-100">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-gray-300"></div>
                <div class="text-sm font-medium">User</div>
              </div>
            </div>
          </div>
          <!-- Main Content -->
          <div class="flex-1 p-8">
            <div class="h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
              Content Area
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return (
    <AppLayout mode="preview">
      <div className="flex flex-col h-full bg-zinc-100 dark:bg-zinc-900">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/design')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Design System</span>
              <span className="font-semibold text-sm">Application Shell</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
            <Button 
              variant={viewportWidth === '375px' ? 'default' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => handleResize('375px')}
              title="Mobile (375px)"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewportWidth === '768px' ? 'default' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => handleResize('768px')}
              title="Tablet (768px)"
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewportWidth === '100%' ? 'default' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => handleResize('100%')}
              title="Desktop (100%)"
            >
              <Monitor className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant={showCode ? 'secondary' : 'ghost'} size="sm" onClick={() => setShowCode(!showCode)}>
              <Code className="w-4 h-4 mr-2" />
              {showCode ? 'Hide Specs' : 'View Specs'}
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative flex">
          {/* Canvas */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-zinc-100 dark:bg-zinc-900 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]">
            <div 
              className="bg-white dark:bg-black shadow-2xl transition-all duration-300 ease-in-out border border-zinc-200 dark:border-zinc-800 overflow-hidden"
              style={{ 
                width: viewportWidth, 
                height: viewportWidth === '100%' ? '100%' : '800px',
                maxHeight: '100%',
                maxWidth: '100%'
              }}
            >
              <iframe 
                srcDoc={previewHtml}
                className="w-full h-full border-none"
                title="Shell Preview"
              />
            </div>
          </div>

          {/* Specs Panel Overlay */}
          {showCode && (
            <div className="w-1/3 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-white shadow-xl animate-in slide-in-from-right duration-300 p-6 overflow-auto">
               <h3 className="text-lg font-semibold mb-4">Shell Specification</h3>
               <div className="prose prose-invert prose-sm">
                 <p>{data.shell.spec.overview}</p>
                 <h4>Layout Pattern</h4>
                 <p>{data.shell.spec.layoutPattern}</p>
                 <h4>Navigation</h4>
                 <ul>
                    {data.shell.spec.navigationItems.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                 </ul>
               </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

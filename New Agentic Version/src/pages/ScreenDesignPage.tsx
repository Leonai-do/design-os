
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useDesignStore } from '../lib/store';
import { Button } from '../components/ui/button';
import { Smartphone, Tablet, Monitor, RefreshCw, Code, ArrowLeft, Camera, Loader2 } from 'lucide-react';
import { CodeEditor } from '../components/CodeEditor';
import { captureNode } from '../lib/screenshot';
import { useToast } from '../components/ui/toaster';

export function ScreenDesignPage() {
  const { sectionId, designId } = useParams<{ sectionId: string, designId: string }>();
  const navigate = useNavigate();
  const { data, addScreenDesign } = useDesignStore();
  const { toast } = useToast();
  
  const [viewportWidth, setViewportWidth] = useState<string>('100%');
  const [showCode, setShowCode] = useState(false);
  const [previewKey, setPreviewKey] = useState(0); 
  const [isCapturing, setIsCapturing] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const section = data.roadmap?.sections.find(s => s.id === sectionId);
  const sectionDetail = data.sections?.[sectionId || ''];
  const screen = sectionDetail?.screens.find(s => s.id === designId);

  useEffect(() => {
    const handleCaptureEvent = () => handleCapture();
    window.addEventListener('design-os-capture-screenshot', handleCaptureEvent);
    return () => window.removeEventListener('design-os-capture-screenshot', handleCaptureEvent);
  }, [screen, sectionId]);

  if (!screen) {
    return (
      <AppLayout mode="preview">
        <div className="flex items-center justify-center h-full text-zinc-500">
          Screen design not found.
        </div>
      </AppLayout>
    );
  }

  const handleResize = (width: string) => setViewportWidth(width);

  const handleCapture = async () => {
    if (!iframeRef.current?.contentDocument?.body || !screen || !sectionId) return;
    
    setIsCapturing(true);
    try {
        const body = iframeRef.current.contentDocument.body;
        // Ensure background is set for capture (transparent by default in some cases)
        const originalBg = body.style.backgroundColor;
        body.style.backgroundColor = 'white'; 
        
        const dataUrl = await captureNode(body);
        
        body.style.backgroundColor = originalBg;

        // Update store
        addScreenDesign(sectionId, {
            ...screen,
            screenshot: dataUrl
        });

        toast({ title: "Screenshot Captured", description: "Design image saved to gallery.", type: 'success' });
    } catch (e) {
        console.error(e);
        toast({ title: "Capture Failed", description: "Could not take screenshot.", type: 'error' });
    } finally {
        setIsCapturing(false);
    }
  };

  const generatePreview = () => {
    // 1. Define Import Map for resolution
    const importMap = {
        "imports": {
            "react": "https://esm.sh/react@18.2.0",
            "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
            "lucide-react": "https://esm.sh/lucide-react@0.292.0",
            "clsx": "https://esm.sh/clsx@2.1.0",
            "tailwind-merge": "https://esm.sh/tailwind-merge@2.2.1",
            "date-fns": "https://esm.sh/date-fns@3.3.1"
        }
    };

    // 2. Escape code for embedding in HTML script tag
    // We put the raw code in a script tag to avoid complex string escaping issues
    const safeCode = screen.code.replace(/<\/script>/g, '<\\/script>');

    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        <!-- Tailwind CSS -->
        <script src="https://cdn.tailwindcss.com"></script>
        
        <!-- Babel for in-browser transpilation (JSX -> JS) -->
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        
        <!-- Import Map -->
        <script type="importmap">
          ${JSON.stringify(importMap)}
        </script>
        
        <style>
          body { margin: 0; min-height: 100vh; background-color: white; font-family: system-ui, -apple-system, sans-serif; }
          #root { height: 100%; display: flex; flex-direction: column; }
          .error-container { color: #ef4444; padding: 20px; font-family: monospace; font-size: 12px; }
          .error-box { background: #fef2f2; padding: 12px; border-radius: 6px; border: 1px solid #fee2e2; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        
        <!-- Embed Source Code safely -->
        <script type="text/plain" id="source-code">
${safeCode}
        </script>

        <!-- Loader Script -->
        <script type="module">
             import React from 'react';
             import { createRoot } from 'react-dom/client';

             const rootElement = document.getElementById('root');
             
             async function run() {
                 try {
                    const sourceCode = document.getElementById('source-code').textContent;
                    
                    // 1. Transpile Code
                    // We use 'react' preset for JSX and 'typescript' for types.
                    // We specify runtime: 'classic' to use React.createElement, matching our import map.
                    const output = Babel.transform(sourceCode, {
                        presets: [
                            ['react', { runtime: 'classic' }],
                            'typescript'
                        ],
                        filename: 'component.tsx'
                    });

                    // 2. Create Executable Module
                    const blob = new Blob([output.code], { type: 'text/javascript' });
                    const url = URL.createObjectURL(blob);
                    
                    // 3. Dynamic Import
                    const module = await import(url);
                    const Component = module.default;

                    if (!Component) throw new Error("Component must have a default export");

                    // 4. Mount
                    const root = createRoot(rootElement);
                    root.render(React.createElement(Component));
                    
                 } catch (e) {
                    console.error("Preview Error:", e);
                    document.body.innerHTML = \`
                        <div class="error-container">
                            <h3>Preview Error</h3>
                            <div class="error-box">\${e.message}</div>
                        </div>
                    \`;
                 }
             }

             run();
        </script>
      </body>
    </html>
    `;
  };

  return (
    <AppLayout mode="preview">
      <div className="flex flex-col h-full bg-zinc-100 dark:bg-zinc-900">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/sections/${sectionId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{section?.title}</span>
              <span className="font-semibold text-sm">{screen.name}</span>
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
            <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCapture}
                disabled={isCapturing}
            >
              {isCapturing ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Camera className="w-3.5 h-3.5 mr-2" />}
              Capture
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPreviewKey(k => k + 1)}>
              <RefreshCw className="w-3.5 h-3.5 mr-2" />
              Reload
            </Button>
            <Button variant={showCode ? 'secondary' : 'ghost'} size="sm" onClick={() => setShowCode(!showCode)}>
              <Code className="w-4 h-4 mr-2" />
              {showCode ? 'Hide Code' : 'View Code'}
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative flex">
          {/* Canvas */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-zinc-100 dark:bg-zinc-900 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]">
            <div 
              className="bg-white dark:bg-black shadow-2xl transition-all duration-300 ease-in-out border border-zinc-200 dark:border-zinc-800"
              style={{ 
                width: viewportWidth, 
                height: viewportWidth === '100%' ? '100%' : '800px',
                maxHeight: '100%',
                maxWidth: '100%'
              }}
            >
              <iframe 
                ref={iframeRef}
                key={previewKey}
                srcDoc={generatePreview()}
                className="w-full h-full border-none bg-white"
                title="Preview"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </div>
          </div>

          {/* Code Panel Overlay */}
          {showCode && (
            <div className="w-1/3 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-white shadow-xl animate-in slide-in-from-right duration-300">
               <div className="h-full flex flex-col">
                  <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400">
                    {screen.componentName}.tsx
                  </div>
                  <div className="flex-1 overflow-auto">
                    <CodeEditor 
                        filename={`${screen.componentName}.tsx`}
                        initialValue={screen.code}
                        language="typescript"
                    />
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

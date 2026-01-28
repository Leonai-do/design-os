
import React, { useState } from 'react'
import { AppLayout } from '../components/AppLayout'
import { useDesignStore } from '../lib/store'
import { EmptyState } from '../components/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { CodeEditor } from '../components/CodeEditor'
import { Palette, Code } from 'lucide-react'
import { generateFileContent } from '../lib/generators'

function ColorSwatch({ label, color }: { label: string, color: string }) {
  // Map simple color names to CSS colors for demo purposes
  const getColor = (name: string) => {
    const map: any = {
      indigo: '#6366f1', teal: '#14b8a6', zinc: '#71717a', 
      blue: '#3b82f6', red: '#ef4444', green: '#22c55e', 
      slate: '#64748b', orange: '#f97316', purple: '#a855f7',
      yellow: '#eab308', pink: '#ec4899', cyan: '#06b6d4'
    }
    return map[name.toLowerCase()] || name || '#ccc'
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="h-20 w-full rounded-lg shadow-sm border border-black/5 dark:border-white/5" style={{ backgroundColor: getColor(color) }}></div>
      <div>
        <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{label}</div>
        <div className="text-xs text-zinc-500 font-mono opacity-70">{color}</div>
      </div>
    </div>
  )
} 

export function DesignPage() {
  const { data } = useDesignStore()
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual')

  if (!data.designSystem) {
    return (
      <AppLayout title="Design System">
        <EmptyState type="design-system" />
      </AppLayout>
    )
  }

  const colorsCode = generateFileContent('colors.ts', data);

  return (
    <AppLayout title="Design System">
      <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
         {/* Toolbar */}
         <div className="flex justify-end">
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                <Button 
                    variant={viewMode === 'visual' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setViewMode('visual')}
                >
                    <Palette className="w-4 h-4 mr-2" />
                    Visual
                </Button>
                <Button 
                    variant={viewMode === 'code' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setViewMode('code')}
                >
                    <Code className="w-4 h-4 mr-2" />
                    Tokens
                </Button>
            </div>
        </div>

        {viewMode === 'visual' ? (
            <div className="space-y-8 overflow-y-auto pb-8">
                <Card>
                    <CardHeader>
                    <CardTitle>Color Palette</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {data.designSystem.colors && (
                        <>
                            <ColorSwatch label="Primary" color={data.designSystem.colors.primary} />
                            <ColorSwatch label="Secondary" color={data.designSystem.colors.secondary} />
                            <ColorSwatch label="Neutral" color={data.designSystem.colors.neutral} />
                        </>
                        )}
                    </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                    <CardTitle>Typography</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-mono">Heading</div>
                        <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">{data.designSystem.typography?.heading}</div>
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">The quick brown fox jumps over the lazy dog.</p>
                        </div>
                        <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-mono">Body</div>
                        <div className="text-xl text-zinc-900 dark:text-zinc-50">{data.designSystem.typography?.body}</div>
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">The quick brown fox jumps over the lazy dog.</p>
                        </div>
                        <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-mono">Mono</div>
                        <div className="text-lg font-mono text-zinc-900 dark:text-zinc-50">{data.designSystem.typography?.mono}</div>
                        <p className="mt-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">console.log("Hello World");</p>
                        </div>
                    </div>
                    </CardContent>
                </Card>
            </div>
        ) : (
             <div className="flex-1 border rounded-lg overflow-hidden shadow-sm">
                <CodeEditor 
                    filename="colors.ts"
                    language="typescript"
                    initialValue={colorsCode}
                />
            </div>
        )}
      </div>
    </AppLayout>
  )
}

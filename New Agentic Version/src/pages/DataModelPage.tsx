
import React, { useState } from 'react'
import { AppLayout } from '../components/AppLayout'
import { useDesignStore } from '../lib/store'
import { EmptyState } from '../components/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { CodeEditor } from '../components/CodeEditor'
import { FileCode, Network } from 'lucide-react'
import { generateFileContent } from '../lib/generators'

export function DataModelPage() {
  const { data } = useDesignStore()
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual')

  if (!data.dataModel) {
    return (
      <AppLayout title="Data Model">
         <EmptyState type="data-model" />
      </AppLayout>
    )
  }

  const prismaCode = generateFileContent('schema.prisma', data)

  return (
    <AppLayout title="Data Model">
      <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
        {/* Toolbar */}
        <div className="flex justify-end">
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                <Button 
                    variant={viewMode === 'visual' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setViewMode('visual')}
                >
                    <Network className="w-4 h-4 mr-2" />
                    Visual
                </Button>
                <Button 
                    variant={viewMode === 'code' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setViewMode('code')}
                >
                    <FileCode className="w-4 h-4 mr-2" />
                    Schema
                </Button>
            </div>
        </div>

        {viewMode === 'visual' ? (
             <div className="grid md:grid-cols-2 gap-6 overflow-y-auto pb-8">
                <Card>
                    <CardHeader>
                    <CardTitle>Entities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    {data.dataModel.entities.map((entity, i) => (
                        <div key={i} className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">
                        <div className="font-mono font-semibold text-primary">{entity.name}</div>
                        <div className="text-sm text-zinc-500 mt-1">{entity.description}</div>
                        </div>
                    ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                    <CardTitle>Relationships</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <ul className="space-y-3">
                        {data.dataModel.relationships.map((rel, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-2 shrink-0" />
                            {rel}
                        </li>
                        ))}
                    </ul>
                    </CardContent>
                </Card>
            </div>
        ) : (
            <div className="flex-1 border rounded-lg overflow-hidden shadow-sm">
                <CodeEditor 
                    filename="schema.prisma"
                    language="clike"
                    initialValue={prismaCode}
                />
            </div>
        )}
      </div>
    </AppLayout>
  )
}

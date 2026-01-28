import React from 'react'
import { FileText, Map, ClipboardList, Database, Layout, Package, Boxes, Palette, PanelLeft, Sparkles } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { useChatController } from '../hooks/useChatController'

type EmptyStateType = 'overview' | 'roadmap' | 'spec' | 'data' | 'screen-designs' | 'data-model' | 'design-system' | 'shell' | 'export'

const config: Record<EmptyStateType, { icon: any, title: string, command: string, description: string, actionLabel?: string }> = {
  overview: {
    icon: FileText,
    title: 'No product defined yet',
    command: '/product-vision',
    description: 'Start an interactive AI interview to define your product vision, key problems, and requirements.',
    actionLabel: 'Start Discovery Interview'
  },
  roadmap: {
    icon: Map,
    title: 'No roadmap defined yet',
    command: '/product-roadmap',
    description: 'Break down your product into development sections',
  },
  spec: {
    icon: ClipboardList,
    title: 'No specification defined yet',
    command: '/section-spec',
    description: 'Define the user flows and UI requirements',
  },
  data: {
    icon: Database,
    title: 'No sample data generated yet',
    command: '/section-data',
    description: 'Create realistic sample data for screen designs',
  },
  'screen-designs': {
    icon: Layout,
    title: 'No screen designs created yet',
    command: '/section-ui',
    description: 'Create screen designs for this section',
  },
  'data-model': {
    icon: Boxes,
    title: 'No data model defined yet',
    command: '/data-model',
    description: 'Define the core entities and relationships',
  },
  'design-system': {
    icon: Palette,
    title: 'No design tokens defined yet',
    command: '/design-tokens',
    description: 'Choose colors and typography for your product',
  },
  shell: {
    icon: PanelLeft,
    title: 'No application shell designed yet',
    command: '/design-shell', 
    description: 'Design the navigation and layout',
  },
  export: {
    icon: Package,
    title: 'Ready to export',
    command: '/export-product',
    description: 'Generate the complete handoff package',
  },
}

export function EmptyState({ type }: { type: EmptyStateType }) {
  const { icon: Icon, title, command, description, actionLabel } = config[type]
  const { startDiscovery, setIsOpen } = useChatController();

  const handleAction = () => {
      if (type === 'overview') {
          setIsOpen(true);
          startDiscovery();
      }
  }; 

  return (
    <Card className="border-dashed border-2 shadow-none bg-zinc-50 dark:bg-zinc-900/50">
      <CardContent className="py-12 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-zinc-500" />
        </div>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">{title}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm">{description}</p>
        
        {actionLabel ? (
            <Button onClick={handleAction} className="gap-2">
                <Sparkles className="w-4 h-4" />
                {actionLabel}
            </Button>
        ) : (
            <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-md px-4 py-2 font-mono text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Type <strong>{command}</strong> in the AI Assistant
            </div>
        )}
      </CardContent>
    </Card>
  )
}
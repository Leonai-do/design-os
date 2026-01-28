
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Boxes, Layout, LayoutList, Package, ArrowRight } from 'lucide-react'

type Phase = 'product' | 'data-model' | 'design' | 'sections' | 'export'

interface NextPhaseButtonProps {
  nextPhase: Exclude<Phase, 'product'>
}

const phaseConfig: Record<Exclude<Phase, 'product'>, { label: string; icon: any; path: string }> = {
  'data-model': { label: 'Data Model', icon: Boxes, path: '/data-model' },
  'design': { label: 'Design', icon: Layout, path: '/design' },
  'sections': { label: 'Sections', icon: LayoutList, path: '/sections' },
  'export': { label: 'Export', icon: Package, path: '/export' },
}

export function NextPhaseButton({ nextPhase }: NextPhaseButtonProps) {
  const navigate = useNavigate()
  const config = phaseConfig[nextPhase]
  const Icon = config.icon

  return (
    <button
      onClick={() => navigate(config.path)}
      className="w-full flex items-center justify-between gap-4 px-6 py-4 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" strokeWidth={1.5} />
        <span className="font-medium">Continue to {config.label}</span>
      </div>
      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
    </button>
  )
}

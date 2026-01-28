
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FileText, Boxes, Layout, LayoutList, Package, Check } from 'lucide-react'
import { useDesignStore } from '../lib/store'

const phases = [
  { id: 'product', label: 'Product', icon: FileText, path: '/' },
  { id: 'data-model', label: 'Data Model', icon: Boxes, path: '/data-model' },
  { id: 'design', label: 'Design', icon: Layout, path: '/design' },
  { id: 'sections', label: 'Sections', icon: LayoutList, path: '/sections' },
  { id: 'export', label: 'Export', icon: Package, path: '/export' },
]

interface PhaseNavProps {
  onNavigate?: () => void;
}

export function PhaseNav({ onNavigate }: PhaseNavProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { data } = useDesignStore()

  // Calculate status
  const isProductComplete = !!data.overview && !!data.roadmap
  const isDataModelComplete = !!data.dataModel
  const isDesignComplete = !!data.designSystem || !!data.shell
  
  // Sections are complete if we have a roadmap and at least one section has a screen design
  const hasScreenDesigns = Object.values(data.sections || {}).some(s => s.screens.length > 0)
  const isSectionsComplete = !!data.roadmap && hasScreenDesigns
  
  const isExportComplete = false // Usually just a trigger

  const completionMap: Record<string, boolean> = {
    'product': isProductComplete,
    'data-model': isDataModelComplete,
    'design': isDesignComplete,
    'sections': isSectionsComplete,
    'export': isExportComplete
  }

  // Determine active phase
  const currentPath = location.pathname
  let activePhaseId = 'product'
  
  if (currentPath === '/' || currentPath.startsWith('/product')) {
    activePhaseId = 'product'
  } else if (currentPath.startsWith('/data-model')) {
    activePhaseId = 'data-model'
  } else if (currentPath.startsWith('/design') || currentPath.startsWith('/shell')) {
    activePhaseId = 'design'
  } else if (currentPath.startsWith('/sections')) {
    activePhaseId = 'sections'
  } else if (currentPath.startsWith('/export')) {
    activePhaseId = 'export'
  }

  return (
    <nav className="flex items-center justify-center space-x-2 sm:space-x-4">
      {phases.map((phase, index) => {
        const isActive = phase.id === activePhaseId
        const isComplete = completionMap[phase.id]
        const Icon = phase.icon

        return (
          <div key={phase.id} className="flex items-center">
            {index > 0 && (
              <div className={`h-px w-4 sm:w-8 mr-2 sm:mr-4 transition-colors duration-300 ${isComplete || isActive ? 'bg-zinc-400 dark:bg-zinc-600' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
            )}
            <button
              onClick={() => {
                navigate(phase.path);
                onNavigate?.();
              }}
              className={`
                relative flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md scale-105' 
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'}
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{phase.label}</span>
              {isComplete && !isActive && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-lime-500 ring-2 ring-white dark:ring-zinc-950 animate-in zoom-in duration-300">
                  <Check className="h-2.5 w-2.5 text-white" />
                </span>
              )}
            </button>
          </div>
        )
      })}
    </nav>
  )
}

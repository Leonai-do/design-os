
import React from 'react'
import { Check, ArrowRight, AlertTriangle } from 'lucide-react'

export type StepStatus = 'completed' | 'current' | 'upcoming' | 'skipped'

interface StepIndicatorProps {
  step: number
  status: StepStatus
  children: React.ReactNode
  isLast?: boolean
}

export function StepIndicator({ step, status, children, isLast = false }: StepIndicatorProps) {
  return (
    <div className="relative">
      {/* Vertical connecting line - extends from this step to the next */}
      {!isLast && (
        <div
          className="absolute left-[10px] top-[28px] w-[2px] h-[calc(100%+16px)] bg-zinc-200 dark:bg-zinc-700"
          aria-hidden="true"
        />
      )}

      {/* Step badge positioned at top-left */}
      <div className="absolute -left-[2px] top-0 z-10">
        <StepBadge step={step} status={status} />
      </div>

      {/* Card content with left padding to accommodate the step indicator */}
      <div className="pl-10">
        {children}
      </div>
    </div>
  )
}

interface StepBadgeProps {
  step: number
  status: StepStatus
}

function StepBadge({ step, status }: StepBadgeProps) {
  const baseClasses = "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200"

  if (status === 'completed') {
    return (
      <div className={`${baseClasses} bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400`}>
        <Check className="w-3 h-3" strokeWidth={2.5} />
      </div>
    )
  }

  if (status === 'current') {
    return (
      <div className={`${baseClasses} bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 shadow-sm`}>
        <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
      </div>
    )
  }

  if (status === 'skipped') {
    return (
      <div className={`${baseClasses} bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400`}>
        <AlertTriangle className="w-3 h-3" strokeWidth={2.5} />
      </div>
    )
  }

  // upcoming
  return (
    <div className={`${baseClasses} bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400`}>
      {step}
    </div>
  )
}

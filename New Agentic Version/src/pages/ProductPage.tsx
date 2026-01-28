
import React from 'react'
import { AppLayout } from '../components/AppLayout'
import { useDesignStore } from '../lib/store'
import { EmptyState } from '../components/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ArrowRight, ChevronRight, Check } from 'lucide-react'

export function ProductPage() {
  const { data } = useDesignStore()
  const hasOverview = !!data.overview
  const hasRoadmap = !!data.roadmap

  return (
    <AppLayout title="Product Definition">
      <div className="space-y-8">
        
        {/* Step 1: Overview */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${hasOverview ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'bg-zinc-200 text-zinc-500'}`}>
              {hasOverview ? <Check className="w-3 h-3" /> : '1'}
            </div>
            <h2 className="text-xl font-semibold">Product Vision</h2>
          </div>

          {!data.overview ? (
            <div className="pl-8">
              <EmptyState type="overview" />
            </div>
          ) : (
            <div className="pl-8">
              <Card>
                <CardHeader>
                  <CardTitle>{data.overview.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-zinc-600 dark:text-zinc-400">{data.overview.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 text-sm uppercase text-zinc-500">Key Problems</h4>
                      <ul className="space-y-2 text-sm">
                        {data.overview.problems.map((p, i) => (
                          <li key={i} className="flex gap-2">
                            <ArrowRight className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                            <span>{p.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 text-sm uppercase text-zinc-500">Features</h4>
                      <ul className="space-y-2 text-sm">
                        {data.overview.features.map((f, i) => (
                          <li key={i} className="flex gap-2">
                            <Check className="w-4 h-4 mt-0.5 shrink-0 text-green-500" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </section>

        {/* Step 2: Roadmap */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
             <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${hasRoadmap ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'bg-zinc-200 text-zinc-500'}`}>
              {hasRoadmap ? <Check className="w-3 h-3" /> : '2'}
            </div>
            <h2 className="text-xl font-semibold">Roadmap</h2>
          </div>

          {!data.roadmap ? (
            <div className="pl-8">
               <EmptyState type="roadmap" />
            </div>
          ) : (
            <div className="pl-8">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {data.roadmap.sections.map((section) => (
                      <div key={section.id} className="p-4 flex items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-default">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-mono text-zinc-500">
                          {section.order}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{section.title}</h4>
                          <p className="text-sm text-zinc-500">{section.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-300" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </section>

      </div>
    </AppLayout>
  )
}

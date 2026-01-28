
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useDesignStore } from '../lib/store';
import { EmptyState } from '../components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ChevronRight, FileText, Database, Layout, CheckCircle2, Circle } from 'lucide-react';
import { PhaseWarningBanner } from '../components/PhaseWarningBanner';

export function SectionsPage() {
  const navigate = useNavigate();
  const { data } = useDesignStore();
  const sections = data.roadmap?.sections || [];

  return (
    <AppLayout title="Sections">
      <div className="space-y-6">
        <PhaseWarningBanner />
        
        {sections.length === 0 ? (
          <EmptyState type="roadmap" />
        ) : (
          <div className="grid gap-4">
            {sections.map((section) => {
              const sectionData = data.sections?.[section.id];
              const hasSpec = !!sectionData?.spec;
              const hasData = !!sectionData?.sampleData;
              const hasScreens = (sectionData?.screens?.length || 0) > 0;
              
              const isComplete = hasSpec && hasData && hasScreens;

              return (
                <Card 
                  key={section.id} 
                  className={`transition-all hover:shadow-md cursor-pointer border-l-4 ${isComplete ? 'border-l-green-500' : 'border-l-zinc-200 dark:border-l-zinc-700'}`}
                  onClick={() => navigate(`/sections/${section.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400">
                                {section.order}
                            </span>
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">{section.title}</h3>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm pl-9">{section.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-zinc-300" />
                    </div>

                    <div className="mt-6 flex items-center gap-6 pl-9">
                        <StatusBadge icon={FileText} label="Spec" active={hasSpec} />
                        <div className="h-px w-8 bg-zinc-200 dark:bg-zinc-800" />
                        <StatusBadge icon={Database} label="Data" active={hasData} />
                        <div className="h-px w-8 bg-zinc-200 dark:bg-zinc-800" />
                        <StatusBadge icon={Layout} label="Designs" active={hasScreens} count={sectionData?.screens?.length} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function StatusBadge({ icon: Icon, label, active, count }: { icon: any, label: string, active: boolean, count?: number }) {
    return (
        <div className={`flex items-center gap-2 text-sm ${active ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-600'}`}>
            <div className={`p-1.5 rounded-full ${active ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                <Icon className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium">{label}</span>
            {count !== undefined && count > 0 && (
                <span className="ml-1 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full text-xs font-mono">
                    {count}
                </span>
            )}
        </div>
    );
}

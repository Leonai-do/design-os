
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useDesignStore } from '../lib/store';
import { SpecCard } from '../components/SpecCard';
import { DataCard } from '../components/DataCard';
import { StepIndicator } from '../components/StepIndicator';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Layout, ArrowRight, Code } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

export function SectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const { data } = useDesignStore();
  
  const sectionInfo = data.roadmap?.sections.find(s => s.id === sectionId);
  const sectionDetail = data.sections?.[sectionId || ''];

  if (!sectionInfo) {
    return (
      <AppLayout title="Section Not Found" backTo="/sections" backLabel="Sections">
        <div className="p-8 text-center text-zinc-500">
          Section not found. Please return to the roadmap.
        </div>
      </AppLayout>
    );
  }

  const hasSpec = !!sectionDetail?.spec;
  const hasData = !!sectionDetail?.sampleData;
  const hasScreens = (sectionDetail?.screens?.length || 0) > 0;

  return (
    <AppLayout title={sectionInfo.title} backTo="/sections" backLabel="Sections">
      <div className="space-y-8 pb-12">
        <div className="prose dark:prose-invert">
            <p className="text-lg text-zinc-600 dark:text-zinc-400">{sectionInfo.description}</p>
        </div>

        {/* Step 1: Specification */}
        <StepIndicator step={1} status={hasSpec ? 'completed' : 'current'}>
            <div className="space-y-2">
                <div className="font-semibold text-lg">Specification</div>
                {!hasSpec ? (
                    <EmptyState type="spec" />
                ) : (
                    <SpecCard spec={sectionDetail.spec} />
                )}
            </div>
        </StepIndicator>

        {/* Step 2: Sample Data */}
        <StepIndicator step={2} status={hasData ? 'completed' : (hasSpec ? 'current' : 'upcoming')}>
            <div className="space-y-2">
                <div className="font-semibold text-lg">Sample Data</div>
                {!hasData ? (
                    <EmptyState type="data" />
                ) : (
                    <div className="h-[400px]">
                        <DataCard data={sectionDetail.sampleData} />
                    </div>
                )}
            </div>
        </StepIndicator>

        {/* Step 3: Screen Designs */}
        <StepIndicator step={3} status={hasScreens ? 'completed' : (hasData ? 'current' : 'upcoming')} isLast>
            <div className="space-y-2">
                <div className="font-semibold text-lg">Screen Designs</div>
                {!hasScreens ? (
                    <EmptyState type="screen-designs" />
                ) : (
                    <div className="grid gap-4">
                        {sectionDetail.screens.map(screen => (
                            <Card key={screen.id} className="overflow-hidden hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
                                <CardContent className="p-0 flex">
                                    <div className="p-6 flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-lg mb-1">{screen.name}</h3>
                                                <p className="text-sm text-zinc-500 mb-4">{screen.description}</p>
                                                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded w-fit">
                                                    <Code className="w-3 h-3" />
                                                    {screen.componentName}.tsx
                                                </div>
                                            </div>
                                            <Button 
                                                onClick={() => navigate(`/sections/${sectionId}/screen-designs/${screen.id}`)}
                                                className="gap-2"
                                            >
                                                <Layout className="w-4 h-4" />
                                                Open Preview
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Thumbnail Placeholder */}
                                    <div className="w-48 bg-zinc-100 dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                                        <Layout className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </StepIndicator>
      </div>
    </AppLayout>
  );
}

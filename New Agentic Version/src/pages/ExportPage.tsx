
import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useDesignStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Check, X, Download, Package, Loader2 } from 'lucide-react';
import { generateExportPackage, downloadBlob } from '../lib/export';
import { useToast } from '../components/ui/toaster';

export function ExportPage() {
  const { data } = useDesignStore();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // Readiness Checks
  const checks = [
    { label: 'Product Vision', valid: !!data.overview, required: true },
    { label: 'Roadmap', valid: !!data.roadmap, required: true },
    { label: 'Data Model', valid: !!data.dataModel, required: true },
    { label: 'Design System', valid: !!data.designSystem, required: true },
    { label: 'App Shell', valid: !!data.shell?.spec, required: false },
    // Derived artifacts checks
    { label: 'Implementation Prompts', valid: !!data.overview && !!data.roadmap && !!data.dataModel, required: true },
    { label: 'Step-by-Step Instructions', valid: !!data.overview && !!data.roadmap, required: true },
  ];

  // Section Checks
  const sections = data.roadmap?.sections || [];
  const sectionsReady = sections.map(s => {
    const detail = data.sections[s.id];
    const hasSpec = !!detail?.spec;
    const hasData = !!detail?.sampleData;
    const hasScreens = (detail?.screens?.length || 0) > 0;
    return { ...s, isReady: hasSpec && hasData && hasScreens };
  });

  // Overall Readiness (require core + at least one section fully ready? Or just core?)
  // Let's require core items.
  const coreReady = checks.filter(c => c.required).every(c => c.valid);
  const canExport = coreReady; 

  const handleExport = async () => {
    setIsExporting(true);
    try {
        const { content, filename } = await generateExportPackage(data);
        downloadBlob(content, filename);
        toast({ title: "Export Started", description: `Downloading ${filename}`, type: 'success' });
    } catch (e) {
        console.error(e);
        toast({ title: "Export Failed", description: "Could not generate zip package.", type: 'error' });
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <AppLayout title="Export Package">
      <div className="space-y-6 max-w-3xl mx-auto">
        
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                <Package className="w-8 h-8 text-zinc-600 dark:text-zinc-300" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Ready to Ship?</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                Generate a production-ready codebase package containing all specs, designs, and assets.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Readiness Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* Core Items */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Core Foundations</h3>
                    {checks.map((check, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                            <span className="font-medium">{check.label}</span>
                            {check.valid ? (
                                <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                                    <Check className="w-4 h-4 mr-1.5" />
                                    Ready
                                </div>
                            ) : (
                                <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm font-medium">
                                    {check.required ? <X className="w-4 h-4 mr-1.5" /> : <div className="w-4 mr-1.5" />}
                                    {check.required ? 'Missing' : 'Optional'}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Sections */}
                {sections.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Sections</h3>
                        {sectionsReady.map(section => (
                            <div key={section.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                <div>
                                    <span className="font-medium block">{section.title}</span>
                                    <span className="text-xs text-zinc-500">Phase {section.order}</span>
                                </div>
                                {section.isReady ? (
                                    <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                                        <Check className="w-4 h-4 mr-1.5" />
                                        Complete
                                    </div>
                                ) : (
                                    <div className="flex items-center text-zinc-400 text-sm font-medium">
                                        <div className="w-2 h-2 rounded-full bg-zinc-300 mr-2" />
                                        In Progress
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

            </CardContent>
        </Card>

        <div className="flex justify-center pt-4">
            <Button 
                size="lg" 
                onClick={handleExport} 
                disabled={!canExport || isExporting}
                className="w-full sm:w-auto min-w-[200px]"
            >
                {isExporting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Download className="w-4 h-4 mr-2" />
                        Download Product Package
                    </>
                )}
            </Button>
        </div>

      </div>
    </AppLayout>
  );
}

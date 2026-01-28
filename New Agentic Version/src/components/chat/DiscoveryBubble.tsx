import React, { useState } from 'react';
import { DiscoveryStep, PrdContext } from '../../features/dynamic-intake/types';
import DynamicField from '../../features/dynamic-intake/components/DynamicField';
import { Button } from '../ui/button';
import { ArrowRight, Lock } from 'lucide-react';

interface DiscoveryBubbleProps {
  step: DiscoveryStep;
  context: PrdContext;
  onSubmit: (updatedContext: PrdContext) => void;
  isSubmitted?: boolean;
}

export function DiscoveryBubble({ step, context, onSubmit, isSubmitted = false }: DiscoveryBubbleProps) {
  const [localContext, setLocalContext] = useState<PrdContext>(context);

  const handleFieldChange = (id: string, value: any) => {
    if (isSubmitted) return;
    setLocalContext(prev => ({ ...prev, [id]: value }));
  };

  const handleNotesChange = (id: string, notes: any) => {
    if (isSubmitted) return;
    setLocalContext(prev => ({ ...prev, [id]: notes }));
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    onSubmit(localContext);
  };

  return (
    <div className={`mt-3 space-y-4 rounded-xl border p-4 transition-all duration-300 ${
        isSubmitted 
        ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-80' 
        : 'bg-white dark:bg-zinc-950 border-indigo-200 dark:border-indigo-900 shadow-md ring-1 ring-indigo-100 dark:ring-indigo-900/20'
    }`}>
      <div className="space-y-4">
        {step.fields.map(field => {
            // Check conditional visibility
            if (field.dependsOn && localContext[field.dependsOn.fieldId] !== field.dependsOn.value) {
                return null;
            }

            return (
                <div key={field.id} className={isSubmitted ? 'pointer-events-none' : ''}>
                    <DynamicField 
                        field={field}
                        value={localContext[field.id]}
                        notesValue={localContext[`${field.id}_notes`] || {}}
                        onChange={handleFieldChange}
                        onNotesChange={(notes) => handleNotesChange(`${field.id}_notes`, notes)}
                    />
                </div>
            );
        })}
      </div>

      {!isSubmitted && (
          <div className="flex justify-end pt-2">
              <Button 
                onClick={handleSubmit} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                  Next Step <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
          </div>
      )}
      
      {isSubmitted && (
          <div className="flex justify-end pt-1">
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Submitted
              </span>
          </div>
      )}
    </div>
  );
}
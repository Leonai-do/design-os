
import React from 'react';
import { DiscoveryStep, PrdContext, DynamicField as DynamicFieldType } from '../../../types';
import DynamicField from '../../DynamicField';

interface HistoryItemEditProps {
  step: DiscoveryStep;
  context: PrdContext;
  onSave: () => void;
  handleFieldChange: (id: string, value: any) => void;
  getNotesField: (id: number) => DynamicFieldType;
}

const HistoryItemEdit: React.FC<HistoryItemEditProps> = ({ step, context, onSave, handleFieldChange, getNotesField }) => {
  return (
    <div className="w-full ml-14 bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-brand-500 shadow-xl animate-fade-in relative z-10">
        <div className="space-y-6">
            {step.fields.map(field => (
                <DynamicField 
                    key={field.id}
                    field={field}
                    value={context[field.id]}
                    onChange={handleFieldChange}
                />
            ))}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <DynamicField 
                  field={getNotesField(step.stepId)}
                  value={context[`custom_notes_${step.stepId}`]}
                  onChange={handleFieldChange}
                />
            </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
            <button 
                onClick={onSave}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg font-bold text-sm shadow hover:bg-brand-700 transition-colors"
            >
                Save Changes
            </button>
        </div>
    </div>
  );
};

export default HistoryItemEdit;

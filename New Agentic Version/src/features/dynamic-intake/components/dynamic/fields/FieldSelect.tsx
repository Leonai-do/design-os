
import React from 'react';
import { DynamicField as DynamicFieldType } from '../../../types';
import { Check, ChevronDown } from 'lucide-react';

interface FieldSelectProps {
  field: DynamicFieldType;
  value: any;
  notesValue: Record<string, string>;
  onChange: (id: string, value: any) => void;
  onNotesChange: (notes: Record<string, string>) => void;
  baseClassName: string;
}

const FieldSelect: React.FC<FieldSelectProps> = ({ 
  field, value, notesValue, onChange, onNotesChange, baseClassName 
}) => {

  const handleNoteChange = (option: string, text: string) => {
    onNotesChange({ ...notesValue, [option]: text });
  };

  // --- MULTI-SELECT RENDERER ---
  if (field.type === 'multiselect') {
    const renderCheckboxItem = (option: string, isGrouped = false) => {
        const selectedList = Array.isArray(value) ? value : [];
        const isSelected = selectedList.includes(option);
    
        const toggleHandler = () => {
            if (isSelected) {
                onChange(field.id, selectedList.filter((s: string) => s !== option));
            } else {
                onChange(field.id, [...selectedList, option]);
            }
        };
    
        return (
            <div key={option} className={`mb-3 ${isGrouped ? 'ml-4' : ''}`}>
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 group
                    ${isSelected 
                        ? 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-700' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}
                >
                    <div className="mt-0.5 relative">
                        <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={toggleHandler}
                            className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 cursor-pointer accent-zinc-900"
                        />
                    </div>
                    <div className="flex-1">
                        <span className={`text-sm font-medium ${isSelected ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'}`}>
                            {option}
                        </span>
                    </div>
                </label>
    
                {isSelected && (
                    <div className="mt-2 ml-7 animate-fade-in">
                        <input 
                            type="text"
                            value={notesValue[option] || ''}
                            onChange={(e) => handleNoteChange(option, e.target.value)}
                            placeholder={option === 'Other' ? "Please specify..." : `Specific notes for "${option}"...`}
                            className="w-full text-sm px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-700 dark:text-zinc-300 focus:border-zinc-400 outline-none transition-all placeholder:text-zinc-400"
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-1 animate-slide-up">
            {field.options?.map((opt, idx) => {
                if (typeof opt === 'string') {
                    return renderCheckboxItem(opt);
                } else {
                    return (
                        <div key={idx} className="mb-4">
                            <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 ml-1">
                                {opt.label}
                            </div>
                            {opt.options.map(subOpt => renderCheckboxItem(subOpt, true))}
                        </div>
                    );
                }
            })}
        </div>
    );
  }

  // --- SINGLE SELECT RENDERER ---
  return (
    <div className="animate-slide-up space-y-3">
        <div className="relative">
            <select
                value={value || ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                className={`${baseClassName} appearance-none cursor-pointer pr-10`}
            >
            <option value="" disabled>Select an option...</option>
            {field.options?.map((opt, idx) => {
                if (typeof opt === 'string') {
                    return <option key={opt} value={opt}>{opt}</option>;
                } else {
                    return (
                        <optgroup key={idx} label={opt.label}>
                        {opt.options.map(subOpt => (
                            <option key={subOpt} value={subOpt}>{subOpt}</option>
                        ))}
                        </optgroup>
                    );
                }
            })}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                <ChevronDown className="w-4 h-4" />
            </div>
        </div>

        {value === 'Other' && (
            <div className="animate-fade-in pl-1">
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
                    Please specify
                </label>
                <input
                    type="text"
                    value={notesValue['Other'] || ''}
                    onChange={(e) => handleNoteChange('Other', e.target.value)}
                    placeholder="Enter details..."
                    className={baseClassName}
                />
            </div>
        )}
    </div>
  );
};

export default FieldSelect;

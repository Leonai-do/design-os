
import React from 'react';
import { DynamicField as DynamicFieldType } from '../../../types';

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
                        ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-slate-500'
                    }`}
                >
                    <div className="mt-0.5">
                        <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={toggleHandler}
                            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 cursor-pointer"
                        />
                    </div>
                    <div className="flex-1">
                        <span className={`text-sm font-medium ${isSelected ? 'text-brand-900 dark:text-brand-100' : 'text-slate-700 dark:text-slate-300'}`}>
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
                            className="w-full text-sm px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-slate-400"
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
                            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">
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
                className={`${baseClassName} appearance-none cursor-pointer`}
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
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <i className="fa-solid fa-chevron-down text-xs"></i>
            </div>
        </div>

        {value === 'Other' && (
            <div className="animate-fade-in pl-1">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
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

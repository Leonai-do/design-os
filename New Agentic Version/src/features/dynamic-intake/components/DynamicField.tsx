
import React from 'react';
import { DynamicField as DynamicFieldType } from '../types';
import FieldInput from './dynamic/fields/FieldInput';
import FieldTextarea from './dynamic/fields/FieldTextarea';
import FieldSelect from './dynamic/fields/FieldSelect';

interface DynamicFieldProps {
  field: DynamicFieldType;
  value: any;
  notesValue?: Record<string, string>;
  onChange: (id: string, value: any) => void;
  onNotesChange?: (notes: Record<string, string>) => void;
  error?: boolean;
}

const DynamicField: React.FC<DynamicFieldProps> = ({ field, value, notesValue = {}, onChange, onNotesChange = () => {}, error }) => {
  const baseClassName = `w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 focus:border-zinc-400 dark:focus:border-zinc-500 outline-none transition-all duration-200 
    ${error ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10' : 'border-zinc-200 dark:border-zinc-800'}`;

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return <FieldInput value={value} onChange={(v) => onChange(field.id, v)} placeholder={field.placeholder} className={baseClassName} />;
      case 'textarea':
        return <FieldTextarea value={value} onChange={(v) => onChange(field.id, v)} placeholder={field.placeholder} className={`${baseClassName} min-h-[100px]`} />;
      case 'select':
      case 'multiselect':
        return (
          <FieldSelect 
            field={field} 
            value={value} 
            notesValue={notesValue}
            onChange={onChange} 
            onNotesChange={onNotesChange}
            baseClassName={baseClassName} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">
        {field.label}
      </label>
      {field.description && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 ml-1 leading-relaxed">
          {field.description}
        </p>
      )}
      {renderField()}
      {error && (
        <p className="text-xs text-red-500 mt-2 ml-1 animate-fade-in font-medium">
          This field is required
        </p>
      )}
    </div>
  );
};

export default DynamicField;

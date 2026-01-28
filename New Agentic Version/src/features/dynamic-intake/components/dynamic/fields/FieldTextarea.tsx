
import React from 'react';
import AutoTextarea from '../../AutoTextarea';

interface FieldTextareaProps {
  value: any;
  onChange: (val: any) => void;
  placeholder?: string;
  className: string;
}

const FieldTextarea: React.FC<FieldTextareaProps> = ({ value, onChange, placeholder, className }) => {
  return (
    <AutoTextarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default FieldTextarea;

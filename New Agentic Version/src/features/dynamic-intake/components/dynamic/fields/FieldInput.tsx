
import React from 'react';

interface FieldInputProps {
  value: any;
  onChange: (val: any) => void;
  placeholder?: string;
  className: string;
}

const FieldInput: React.FC<FieldInputProps> = ({ value, onChange, placeholder, className }) => {
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default FieldInput;

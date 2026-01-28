
import React, { useRef, useEffect } from 'react';
import { cn } from '../../../lib/utils';

interface AutoTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const AutoTextarea: React.FC<AutoTextareaProps> = ({ className, onChange, value, ...props }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) onChange(e);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      className={cn(
        "w-full resize-none overflow-hidden transition-all duration-200 ease-in-out focus:outline-none",
        className
      )}
      rows={1}
      {...props}
    />
  );
};

export default AutoTextarea;


import React from 'react';
import { Rect } from '../../../types';

interface InfoLabelProps {
  rect: Rect;
  tagName: string;
  isLocked: boolean;
  windowWidth: number;
}

const InfoLabel: React.FC<InfoLabelProps> = ({ rect, tagName, isLocked, windowWidth }) => {
  // Determine smart label position
  let labelPosition = { top: true, left: true };
  
  // If element is too close to top (less than 30px), put label below
  if (rect.top < 30) labelPosition.top = false;
  
  // If element is too close to right edge, align label to right
  if (windowWidth - rect.left < 150) labelPosition.left = false;

  return (
    <span 
      className={`absolute px-2 py-0.5 text-xs text-white font-mono rounded shadow-sm flex items-center gap-2 whitespace-nowrap z-[9002] ${isLocked ? 'bg-red-500' : 'bg-blue-500'}`}
      style={{
        top: labelPosition.top ? '-28px' : 'calc(100% + 4px)',
        left: labelPosition.left ? '-3px' : 'auto',
        right: labelPosition.left ? 'auto' : '-3px',
      }}
    >
      <span className="font-bold">{tagName}</span>
      <span className="opacity-75 text-[10px]">|</span>
      <span className="opacity-90">{Math.round(rect.width)} × {Math.round(rect.height)}</span>
    </span>
  );
};

export default InfoLabel;


import React from 'react';
import { Rect } from '../../../types';
import InfoLabel from './InfoLabel';

interface HighlighterProps {
  rect: Rect;
  isLocked: boolean;
  tagName: string;
  windowWidth: number;
}

const Highlighter: React.FC<HighlighterProps> = ({ rect, isLocked, tagName, windowWidth }) => {
  return (
    <div
      className={`absolute transition-all duration-75 border-[3px] ${isLocked ? 'border-red-500' : 'border-blue-500'}`}
      style={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        backgroundColor: 'transparent',
      }}
    >
      <InfoLabel 
        rect={rect} 
        tagName={tagName} 
        isLocked={isLocked} 
        windowWidth={windowWidth} 
      />
    </div>
  );
};

export default Highlighter;

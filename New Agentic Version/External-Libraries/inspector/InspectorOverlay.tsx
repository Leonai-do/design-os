
import React from 'react';
import { useDomInspector } from '../../../hooks/useDomInspector';
import Highlighter from './Highlighter';
import DebugPanel from './DebugPanel';

const InspectorOverlay: React.FC = () => {
  const { 
    isEnabled, 
    hoveredElement, 
    selectedElement, 
    setSelectedElement,
    rect, 
    elementInfo,
    windowSize 
  } = useDomInspector();

  if (!isEnabled) return null;

  const targetEl = selectedElement || hoveredElement;
  const isLocked = !!selectedElement;

  return (
    <div id="inspector-ui" className="fixed inset-0 pointer-events-none z-[9000] overflow-hidden font-sans">
        {/* Highlight Box */}
        {rect && targetEl && (
            <Highlighter 
                rect={rect}
                isLocked={isLocked}
                tagName={targetEl.tagName.toLowerCase()}
                windowWidth={windowSize.width}
            />
        )}

        {/* Info Panel - Only when locked */}
        {isLocked && elementInfo && selectedElement && (
            <DebugPanel 
                elementInfo={elementInfo}
                selectedElement={selectedElement}
                onClose={() => setSelectedElement(null)}
            />
        )}
    </div>
  );
};

export default InspectorOverlay;

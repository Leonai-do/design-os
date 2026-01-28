
import React, { useState, useEffect } from 'react';
import { X, Maximize2, Copy, Check, Terminal, FileJson } from 'lucide-react';
import { ElementInfo } from '../../../types';
import { useDraggable } from '../../../hooks/useDraggable';

interface DebugPanelProps {
  elementInfo: ElementInfo;
  selectedElement: HTMLElement;
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ elementInfo, selectedElement, onClose }) => {
  const [copyFeedback, setCopyFeedback] = useState<'simple' | 'advanced' | null>(null);
  
  // Initialize with a safe default position
  const { position, handleMouseDown } = useDraggable({ 
    x: typeof window !== 'undefined' ? window.innerWidth - 420 : 20, 
    y: 100 
  });

  const handleCopyData = (mode: 'simple' | 'advanced') => {
    const r = selectedElement.getBoundingClientRect();
    let payload;

    if (mode === 'simple') {
        // Lightweight Identity Card for AI/Chat referencing
        payload = {
            target: elementInfo.tagName,
            text: selectedElement.innerText?.substring(0, 50).replace(/\s+/g, ' ').trim(),
            className: elementInfo.className,
            id: selectedElement.id || undefined,
            path: elementInfo.path
        };
    } else {
        // Full Debug Snapshot
        payload = {
            meta: {
                element: elementInfo.tagName,
                path: elementInfo.path,
                timestamp: new Date().toISOString(),
            },
            attributes: {
                id: selectedElement.id,
                className: elementInfo.className,
                attributes: Array.from(selectedElement.attributes).reduce((acc: any, attr: Attr) => {
                    if(attr.name !== 'class' && attr.name !== 'id') acc[attr.name] = attr.value;
                    return acc;
                }, {})
            },
            dimensions: {
                width: Math.round(r.width),
                height: Math.round(r.height),
                top: Math.round(r.top),
                left: Math.round(r.left),
            },
            computedStyles: elementInfo.styles,
            content: {
                text: selectedElement.innerText?.substring(0, 100).replace(/\s+/g, ' ').trim(),
                html: selectedElement.outerHTML.substring(0, 500) + (selectedElement.outerHTML.length > 500 ? '...' : '')
            }
        };
    }

    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopyFeedback(mode);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  return (
    <div 
        className="pointer-events-auto fixed bg-gray-900/95 text-white p-5 rounded-xl shadow-2xl backdrop-blur-md border border-white/10 w-96 font-mono text-sm z-[9001] max-h-[85vh] flex flex-col"
        style={{
            top: position.y,
            left: position.x,
        }}
    >
        {/* Header - Draggable Area */}
        <div 
            className="flex justify-between items-start mb-4 border-b border-gray-700 pb-3 flex-shrink-0 cursor-move"
            onMouseDown={handleMouseDown}
        >
            <div>
                <h3 className="font-bold text-accent flex items-center gap-2 text-base select-none">
                    <Maximize2 size={16} /> Inspector
                </h3>
                <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider select-none">Locked Selection</div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-1 rounded-md hover:bg-white/10">
                <X size={18} />
            </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-grow">
            
            {/* Element Identity */}
            <div>
                <span className="text-gray-500 uppercase text-[10px] tracking-wider font-bold block mb-1">Target</span>
                <div className="break-words text-green-400 font-bold text-lg leading-tight">
                    &lt;{elementInfo.tagName}&gt;
                </div>
                {elementInfo.className && (
                   <div className="mt-2 text-blue-300 break-words text-xs leading-relaxed bg-blue-900/20 p-2 rounded border border-blue-900/30 font-sans">
                      {elementInfo.className.split(' ').map((c, i) => (
                        c ? <span key={i} className="inline-block mr-1">.{c}</span> : null
                      ))}
                   </div>
                )}
            </div>

            {/* Location Path */}
            <div className="bg-black/30 p-2 rounded border border-white/5">
                <span className="text-gray-500 uppercase text-[10px] tracking-wider font-bold mb-1 flex items-center gap-1">
                    <Terminal size={10} /> DOM Location
                </span>
                <div className="text-[10px] text-gray-300 break-all leading-relaxed font-mono">
                    {elementInfo.path}
                </div>
            </div>

            {/* Dimensions & Layout */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="text-gray-500 uppercase text-[10px] tracking-wider font-bold block mb-1">Display</span>
                    <div className="text-xs bg-white/5 px-2 py-1 rounded">{elementInfo.styles.display}</div>
                </div>
                 <div>
                    <span className="text-gray-500 uppercase text-[10px] tracking-wider font-bold block mb-1">Position</span>
                    <div className="text-xs bg-white/5 px-2 py-1 rounded">{elementInfo.styles.position}</div>
                </div>
            </div>

            {/* Typography */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="text-gray-500 uppercase text-[10px] tracking-wider font-bold block mb-1">Size / Weight</span>
                    <div className="text-xs text-gray-300">{elementInfo.styles.fontSize} / {elementInfo.styles.fontWeight}</div>
                </div>
                 <div>
                    <span className="text-gray-500 uppercase text-[10px] tracking-wider font-bold block mb-1">Line Height</span>
                    <div className="text-xs text-gray-300">{elementInfo.styles.lineHeight}</div>
                </div>
            </div>

            <div>
                <span className="text-gray-500 uppercase text-[10px] tracking-wider font-bold block mb-1">Font Family</span>
                <div className="truncate text-[10px] text-gray-300" title={elementInfo.styles.fontFamily}>{elementInfo.styles.fontFamily}</div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="text-gray-500 uppercase text-[10px] tracking-wider font-bold block mb-1">Text Color</span>
                    <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded border border-white/5">
                        <div className="w-3 h-3 rounded-full border border-gray-600 shadow-sm flex-shrink-0" style={{ backgroundColor: elementInfo.styles.color }}></div>
                        <span className="text-[10px] truncate">{elementInfo.styles.color}</span>
                    </div>
                </div>
                <div>
                    <span className="text-gray-500 uppercase text-[10px] tracking-wider font-bold block mb-1">Background</span>
                    <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded border border-white/5">
                        <div className="w-3 h-3 rounded-full border border-gray-600 shadow-sm flex-shrink-0" style={{ backgroundColor: elementInfo.styles.backgroundColor }}></div>
                        <span className="text-[10px] truncate">{elementInfo.styles.backgroundColor}</span>
                    </div>
                </div>
            </div>

            {/* Spacing */}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-3">
                <div>
                    <span className="text-gray-500 uppercase text-[10px] tracking-wider font-bold block mb-1">Margin</span>
                    <div className="text-[10px] text-gray-300 font-mono">{elementInfo.styles.margin}</div>
                </div>
                <div>
                    <span className="text-gray-500 uppercase text-[10px] tracking-wider font-bold block mb-1">Padding</span>
                    <div className="text-[10px] text-gray-300 font-mono">{elementInfo.styles.padding}</div>
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-gray-700 flex-shrink-0 grid grid-cols-2 gap-2">
            <button 
                onClick={() => handleCopyData('simple')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                    copyFeedback === 'simple'
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-900 hover:bg-gray-200'
                }`}
            >
                {copyFeedback === 'simple' ? <Check size={14} /> : <Copy size={14} />}
                <span>Copy ID</span>
            </button>

            <button 
                onClick={() => handleCopyData('advanced')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                    copyFeedback === 'advanced'
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
            >
                {copyFeedback === 'advanced' ? <Check size={14} /> : <FileJson size={14} />}
                <span>Full Debug</span>
            </button>
        </div>
        <div className="text-center mt-2">
            <span className="text-[10px] text-gray-500">
                    Use "ID" for prompt context
            </span>
        </div>
    </div>
  );
};

export default DebugPanel;

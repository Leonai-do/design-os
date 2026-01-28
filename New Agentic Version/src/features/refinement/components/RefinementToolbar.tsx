
import React from 'react';
import { ArrowLeft, FileDown, FileText } from 'lucide-react';

interface RefinementToolbarProps {
  onBack: () => void;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  onDownloadMd: () => void;
  onDownloadPdf: () => void;
}

const RefinementToolbar: React.FC<RefinementToolbarProps> = ({ 
  onBack, 
  showPreview, 
  setShowPreview, 
  onDownloadMd, 
  onDownloadPdf 
}) => {
  return (
    <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 shrink-0 transition-colors duration-300">
      <button onClick={onBack} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Edit Inputs
      </button>
      <div className="flex gap-2">
         <button onClick={() => setShowPreview(!showPreview)} className="md:hidden px-3 py-2 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-200 rounded text-sm font-medium">
           {showPreview ? 'Show Chat' : 'Show Doc'}
         </button>
         <button onClick={onDownloadMd} className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 font-medium text-zinc-700 dark:text-zinc-200 flex items-center gap-2">
           <FileText className="w-4 h-4" /> .MD
         </button>
         <button onClick={onDownloadPdf} className="px-4 py-2 bg-zinc-900 dark:bg-zinc-700 text-white rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-600 font-medium flex items-center gap-2">
           <FileDown className="w-4 h-4" /> PDF
         </button>
      </div>
    </div>
  );
};

export default RefinementToolbar;

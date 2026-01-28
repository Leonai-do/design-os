import React from 'react';

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
    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 shrink-0 transition-colors duration-300">
      <button onClick={onBack} className="text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium flex items-center gap-2 transition-colors">
        <i className="fa-solid fa-arrow-left"></i> Edit Inputs
      </button>
      <div className="flex gap-2">
         <button onClick={() => setShowPreview(!showPreview)} className="md:hidden px-3 py-2 bg-slate-100 dark:bg-slate-800 dark:text-slate-200 rounded text-sm font-medium">
           {showPreview ? 'Show Chat' : 'Show Doc'}
         </button>
         <button onClick={onDownloadMd} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
           <i className="fa-brands fa-markdown"></i> .MD
         </button>
         <button onClick={onDownloadPdf} className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 font-medium flex items-center gap-2">
           <i className="fa-solid fa-file-pdf"></i> PDF
         </button>
      </div>
    </div>
  );
};

export default RefinementToolbar;
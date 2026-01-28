
import React, { useState, useEffect } from 'react';

interface FilePreviewModalProps {
  file: File | null;
  onClose: () => void;
}

const TEXT_EXTENSIONS = [
  'txt', 'md', 'json', 'js', 'ts', 'tsx', 'jsx', 'html', 'css', 'csv', 
  'xml', 'yml', 'yaml', 'py', 'rb', 'java', 'c', 'cpp', 'sh', 'bat', 'env'
];

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
  const [content, setContent] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setContent(null);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(null);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    const isText = file.type.startsWith('text/') || TEXT_EXTENSIONS.includes(ext);

    if (isImage || isPdf) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      setLoading(false);
    } else if (isText) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setContent(e.target?.result as string);
        setLoading(false);
      };
      reader.onerror = () => {
        setError("Failed to read file content.");
        setLoading(false);
      };
      reader.readAsText(file);
    } else {
      setError("Preview not available for this file type.");
      setLoading(false);
    }

    // Cleanup
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col border border-slate-200 dark:border-slate-700 overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0
                  ${file.type.startsWith('image/') ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
               {file.type.startsWith('image/') ? <i className="fa-regular fa-image"></i> : <i className="fa-regular fa-file-lines"></i>}
            </div>
            <div className="min-w-0">
                <h3 className="font-bold text-slate-800 dark:text-white truncate">{file.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB &bull; {file.type || 'Unknown Type'}
                </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {objectUrl && (
                <a 
                    href={objectUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                    title="Open in new tab"
                >
                    <i className="fa-solid fa-arrow-up-right-from-square text-sm"></i>
                </a>
            )}
            <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
                <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950/50 p-4 flex items-center justify-center relative">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 z-10">
                    <i className="fa-solid fa-circle-notch animate-spin text-3xl text-brand-500"></i>
                </div>
            )}

            {error ? (
                <div className="text-center text-slate-500 dark:text-slate-400">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        <i className="fa-regular fa-eye-slash"></i>
                    </div>
                    <p>{error}</p>
                </div>
            ) : (
                <>
                    {/* Image Preview */}
                    {file.type.startsWith('image/') && objectUrl && (
                        <img src={objectUrl} alt={file.name} className="max-w-full max-h-full object-contain shadow-lg rounded-lg" />
                    )}

                    {/* PDF Preview - Using Object tag with fallback */}
                    {file.type === 'application/pdf' && objectUrl && (
                        <object 
                            data={objectUrl} 
                            type="application/pdf"
                            className="w-full h-full rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 bg-white"
                        >
                            {/* Fallback content if object fails to load (e.g. blocked by iframe policies) */}
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 p-8 text-center bg-slate-50 dark:bg-slate-900">
                                <i className="fa-regular fa-file-pdf text-5xl mb-6 text-red-500 opacity-80"></i>
                                <h4 className="text-lg font-bold mb-2 text-slate-700 dark:text-slate-200">Preview Not Available</h4>
                                <p className="mb-6 max-w-sm">
                                    Your browser or environment is blocking the PDF preview. You can view the file by opening it in a new tab.
                                </p>
                                <a 
                                    href={objectUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                                >
                                    Open PDF <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                                </a>
                            </div>
                        </object>
                    )}

                    {/* Text/Code Preview */}
                    {content !== null && (
                        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 overflow-auto">
                            <pre className="font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
                                {content}
                            </pre>
                        </div>
                    )}
                </>
            )}
        </div>

      </div>
    </div>
  );
};

export default FilePreviewModal;

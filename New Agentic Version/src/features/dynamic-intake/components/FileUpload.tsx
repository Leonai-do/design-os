
import React, { useRef } from 'react';
import { ModelConfig } from '../types';
import { Upload, X, FileText, Image, AlertTriangle } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  label?: string;
  modelConfig?: ModelConfig;
}

const FileUpload: React.FC<FileUploadProps> = ({ files, onFilesChange, label = "Upload Files", modelConfig }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesChange([...files, ...Array.from(e.target.files)]);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{label}</label>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <Upload className="w-3 h-3" /> Add File
        </button>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />

      {files.length === 0 ? (
        <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer"
        >
            <Upload className="w-6 h-6 mb-2 opacity-50" />
            <span className="text-xs">Click or drag files here</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {files.map((file, idx) => {
                const isImage = file.type.startsWith('image/');
                const isSupported = !isImage || (modelConfig?.capabilities.image ?? true);

                return (
                    <div key={idx} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-sm">
                        <div className="flex items-center gap-2 overflow-hidden">
                            {isImage ? <Image className="w-4 h-4 text-purple-500 shrink-0" /> : <FileText className="w-4 h-4 text-blue-500 shrink-0" />}
                            <span className="truncate text-zinc-700 dark:text-zinc-300">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {!isSupported && (
                                <span title="Model cannot process images" className="text-amber-500">
                                    <AlertTriangle className="w-3 h-3" />
                                </span>
                            )}
                            <button 
                                onClick={() => removeFile(idx)}
                                className="text-zinc-400 hover:text-red-500 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
      )}
    </div>
  );
};

export default FileUpload;

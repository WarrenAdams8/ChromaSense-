import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface DropzoneProps {
  onImageSelected: (file: File) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    validateAndPassFile(file);
  }, [onImageSelected]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  const validateAndPassFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file.");
      return;
    }
    onImageSelected(file);
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ease-in-out ${
        isDragging 
          ? 'border-indigo-500 bg-indigo-500/10' 
          : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        accept="image/*" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={handleFileInput}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-500/20' : 'bg-slate-700/50'}`}>
          {isDragging ? (
            <ImageIcon className="w-8 h-8 text-indigo-400" />
          ) : (
            <Upload className="w-8 h-8 text-slate-400" />
          )}
        </div>
        <div>
          <p className="text-lg font-medium text-slate-200">
            {isDragging ? 'Drop image here' : 'Drag & drop your image here'}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            or click to browse from your computer
          </p>
        </div>
      </div>

      {error && (
        <div className="absolute -bottom-12 left-0 right-0 flex items-center justify-center text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}
    </div>
  );
};

export default Dropzone;

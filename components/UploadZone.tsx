import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, X, Crop } from 'lucide-react';
import { AdCreative } from '../types';

interface UploadZoneProps {
  currentCreative: AdCreative | null;
  onUpload: (creative: AdCreative) => void;
  onClear: () => void;
  onCrop: () => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ currentCreative, onUpload, onClear, onCrop }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload({
          file,
          previewUrl: URL.createObjectURL(file),
          base64: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  if (currentCreative) {
    return (
      <div className="relative group w-full h-64 bg-slate-100 rounded-xl border-2 border-slate-200 overflow-hidden flex items-center justify-center">
        <img 
          src={currentCreative.previewUrl} 
          alt="Ad Creative" 
          className="max-h-full max-w-full object-contain" 
        />
        
        {/* Overlay Controls */}
        <div className="absolute top-2 right-2 flex gap-2">
            <button 
                onClick={(e) => { e.stopPropagation(); onCrop(); }}
                className="p-2 bg-white/90 hover:bg-white text-slate-700 rounded-lg shadow-sm transition-all opacity-0 group-hover:opacity-100 hover:text-indigo-600"
                title="Crop Image"
            >
                <Crop size={18} />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="p-2 bg-white/90 hover:bg-white text-slate-700 rounded-lg shadow-sm transition-all opacity-0 group-hover:opacity-100 hover:text-red-500"
                title="Remove Image"
            >
                <X size={18} />
            </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={triggerUpload}
      className="w-full h-64 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group"
    >
      <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
        <Upload className="text-blue-500" size={32} />
      </div>
      <div className="text-center px-4">
        <p className="text-sm font-semibold text-slate-700">Click to upload ad creative</p>
        <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};

export default UploadZone;

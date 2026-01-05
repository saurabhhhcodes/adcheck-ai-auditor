import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { ZoomIn, ZoomOut, Check, X } from 'lucide-react';
import getCroppedImg from '../utils/canvasUtils';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBase64: string) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Crop Image</h3>
            <p className="text-sm text-slate-500">Select the region you want to audit</p>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative flex-1 bg-slate-100">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={undefined} // Allow freeform cropping
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={onZoomChange}
            objectFit="contain"
            style={{
                containerStyle: { background: '#f1f5f9' },
                mediaStyle: {},
                cropAreaStyle: { border: '2px solid #4f46e5' }
            }}
          />
        </div>

        {/* Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            
            <div className="flex items-center gap-3 w-full sm:w-1/2">
              <ZoomOut size={18} className="text-slate-400" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <ZoomIn size={18} className="text-slate-400" />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-1/2 sm:justify-end">
              <button
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl text-slate-700 font-medium hover:bg-slate-100 transition-colors border border-transparent"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Check size={18} />
                )}
                Apply Crop
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ImageCropper;

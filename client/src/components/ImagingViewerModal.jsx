import React, { useState } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  SunMedium, 
  RefreshCw, 
  Download, 
  Maximize2,
  FileText
} from 'lucide-react';

export default function ImagingViewerModal({ imageItem, onClose }) {
  if (!imageItem) return null;

  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isInverted, setIsInverted] = useState(false);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
    setIsInverted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 text-white">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
              Chẩn đoán hình ảnh kỹ thuật số (PACS/DICOM Viewer)
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {imageItem.title}
            </h3>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono text-slate-400 w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Phóng to"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={handleRotate}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Xoay 90 độ"
            >
              <RotateCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsInverted(!isInverted)}
              className={`p-2 rounded-xl transition-colors ${
                isInverted ? 'bg-teal-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Đảo màu tương phản (Invert DICOM contrast)"
            >
              <SunMedium className="w-5 h-5" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Đặt lại mặc định"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            
            <div className="h-6 w-px bg-slate-700 mx-1"></div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition-colors"
              title="Đóng modal"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center p-4 min-h-[350px] sm:min-h-[420px]">
          <div 
            className="transition-transform duration-200 select-none cursor-grab active:cursor-grabbing flex items-center justify-center"
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
              filter: isInverted ? 'invert(100%) contrast(150%)' : 'none'
            }}
          >
            <img 
              src={imageItem.imageUrl} 
              alt={imageItem.title} 
              className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Watermark / Patient label overlay */}
          <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[11px] text-slate-300 font-mono">
            <div>Chụp lúc: {imageItem.performedTime}</div>
            <div>Bác sĩ CĐHA: {imageItem.radiologist}</div>
          </div>
        </div>

        {/* Clinical Interpretation Footer */}
        <div className="p-5 bg-slate-900 border-t border-slate-800 text-slate-200 text-xs sm:text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-bold text-teal-400 block mb-1">Mô tả hình ảnh:</span>
              <p className="text-slate-300 leading-relaxed font-light">
                {imageItem.description}
              </p>
            </div>
            <div>
              <span className="font-bold text-emerald-400 block mb-1">Kết luận của Bác sĩ Chẩn đoán hình ảnh:</span>
              <p className="text-white font-medium bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                {imageItem.conclusion}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

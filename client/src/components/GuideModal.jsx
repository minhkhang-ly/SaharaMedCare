import React from 'react';
import { LuX, LuHelpCircle, LuAlertTriangle, LuCheckCircle2, LuClock } from 'lucide-react';
import { sampleGuidelines } from '../data/mockLabData';

export default function GuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-700 to-brand-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <LuHelpCircle className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Hướng Dẫn Chuẩn Bị Lấy Mẫu Xét Nghiệm</h3>
              <p className="text-xs text-teal-100">Đảm bảo kết quả cận lâm sàng đạt độ chuẩn xác lâm sàng cao nhất</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <LuX className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {sampleGuidelines.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <h4 className="font-bold text-sm sm:text-base text-slate-900">
                  {item.title}
                </h4>
              </div>

              <div className="ml-8 space-y-1.5 text-xs sm:text-sm">
                <div className="flex items-start gap-2 text-slate-700">
                  <LuCheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Yêu cầu bắt buộc:</strong> {item.requirement}</span>
                </div>
                <div className="flex items-start gap-2 text-amber-800 bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                  <LuAlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Lưu ý quan trọng:</strong> {item.note}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-colors shadow-sm"
          >
            Tôi đã nắm rõ hướng dẫn
          </button>
        </div>

      </div>
    </div>
  );
}

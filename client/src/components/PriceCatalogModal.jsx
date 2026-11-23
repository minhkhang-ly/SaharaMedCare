import React, { useState, useEffect } from 'react';
import { X, Search, BadgePercent, Clock, ShieldCheck, FlaskConical, Loader2 } from 'lucide-react';
import { getCatalogTestsApi } from '../services/api';
import { testPriceCatalog } from '../data/mockLabData';

export default function PriceCatalogModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [items, setItems] = useState(testPriceCatalog);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getCatalogTestsApi()
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setItems(data);
          }
        })
        .catch(err => console.warn('[PriceCatalog] Dùng dữ liệu fallback:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const filteredItems = items.filter(item => {
    if (selectedDept !== 'ALL' && item.department !== selectedDept) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-brand-700 via-teal-700 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <BadgePercent className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Bảng Giá & Danh Mục Xét Nghiệm</h3>
              <p className="text-xs text-teal-100">Áp dụng công khai, minh bạch theo biểu giá Bộ Y Tế & BHYT (Cập nhật trực tiếp từ Server)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên xét nghiệm hoặc mã (VD: Glucose, Men gan)..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setSelectedDept('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                selectedDept === 'ALL' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedDept('Sinh hóa')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                selectedDept === 'Sinh hóa' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Sinh hóa
            </button>
            <button
              onClick={() => setSelectedDept('Huyết học')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                selectedDept === 'Huyết học' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Huyết học
            </button>
            <button
              onClick={() => setSelectedDept('CĐHA')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                selectedDept === 'CĐHA' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Chẩn đoán hình ảnh
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-sm">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-2" />
              <span>Đang tải bảng giá dịch vụ từ hệ thống LIS...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] bg-slate-50">
                  <th className="py-3 px-4">Mã dịch vụ</th>
                  <th className="py-3 px-4">Tên chỉ số / Xét nghiệm</th>
                  <th className="py-3 px-4">Khoa phòng</th>
                  <th className="py-3 px-4">Thời gian trả</th>
                  <th className="py-3 px-4 text-right">Đơn giá viện phí</th>
                  <th className="py-3 px-4 text-center">BHYT chi trả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{item.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3 px-4 text-slate-500">{item.department}</td>
                    <td className="py-3 px-4 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        {item.timeMinutes}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-brand-700">{item.price}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        {item.bhyt}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>* Bảng giá đồng bộ từ API Server Bệnh viện Đa khoa Quốc tế Sahara.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
          >
            Đóng bảng giá
          </button>
        </div>

      </div>
    </div>
  );
}

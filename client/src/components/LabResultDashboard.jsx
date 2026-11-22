import React, { useMemo, useState } from 'react';
import { 
  Activity, 
  ArrowDown, 
  ArrowUp, 
  CalendarDays, 
  CheckCircle2, 
  FlaskConical, 
  HeartPulse, 
  Search, 
  ShieldCheck, 
  UserRound,
  AlertTriangle,
  FileText,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import RiskAnalysisCard from './RiskAnalysisCard';
import ImagingViewerModal from './ImagingViewerModal';

/**
 * Phân tích khoảng tham chiếu (Reference Range)
 * Hỗ trợ các dạng: "4.2 - 6.4", "< 5.2", "> 60", "0 - 150"
 */
function parseReferenceRange(refStr) {
  if (!refStr) return null;
  const str = String(refStr).trim();
  
  // Dạng khoảng "min - max"
  const rangeMatch = str.match(/([0-9]+(?:\.[0-9]+)?)\s*[-–]\s*([0-9]+(?:\.[0-9]+)?)/);
  if (rangeMatch) {
    return {
      type: 'INTERVAL',
      min: parseFloat(rangeMatch[1]),
      max: parseFloat(rangeMatch[2])
    };
  }

  // Dạng cận trên: "< 5.2" hoặc "<= 5.2"
  const maxMatch = str.match(/[<≤]\s*([0-9]+(?:\.[0-9]+)?)/);
  if (maxMatch) {
    const maxVal = parseFloat(maxMatch[1]);
    return {
      type: 'UPPER_BOUND',
      min: 0,
      max: maxVal
    };
  }

  // Dạng cận dưới: "> 60" hoặc ">= 60"
  const minMatch = str.match(/[>≥]\s*([0-9]+(?:\.[0-9]+)?)/);
  if (minMatch) {
    const minVal = parseFloat(minMatch[1]);
    return {
      type: 'LOWER_BOUND',
      min: minVal,
      max: minVal * 2
    };
  }

  return null;
}

/**
 * Thanh thước đo 3 phân vùng y tế (Clinical Range Bar)
 * Low (Vàng) | Normal (Xanh lá - An toàn) | High (Đỏ - Cảnh báo)
 */
function ClinicalRangeBar({ value, refStr, status }) {
  const parsed = parseReferenceRange(refStr);
  const numVal = parseFloat(value);
  const isAbnormal = status !== 'NORMAL';

  // Tính toán vị trí con trỏ (0% -> 100%)
  let pinPercent = 50;

  if (parsed && !isNaN(numVal)) {
    const { min, max } = parsed;
    const span = max - min || 1;

    if (numVal < min) {
      // Vùng thấp (0% -> 25%)
      const ratio = Math.max(0, (numVal - (min - span * 0.5)) / (span * 0.5));
      pinPercent = Math.max(5, Math.min(24, ratio * 25));
    } else if (numVal > max) {
      // Vùng cao (75% -> 100%)
      const ratio = Math.min(1, (numVal - max) / (span * 0.5));
      pinPercent = Math.max(76, Math.min(95, 75 + ratio * 20));
    } else {
      // Vùng bình thường (25% -> 75%)
      const ratio = (numVal - min) / span;
      pinPercent = 25 + ratio * 50;
    }
  } else {
    if (status === 'HIGH') pinPercent = 88;
    if (status === 'LOW') pinPercent = 12;
    if (status === 'NORMAL') pinPercent = 50;
  }

  return (
    <div className="mt-3.5 space-y-2">
      {/* Visual Tri-Zone Range Bar */}
      <div className="relative">
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-800 p-0.5 border border-white/5">
          {/* Zone 1: Low (25%) */}
          <div 
            className="w-1/4 h-full rounded-l-full bg-amber-400/40 border-r border-slate-900/40" 
            title="Ngưỡng thấp" 
          />
          {/* Zone 2: Normal (50%) */}
          <div 
            className="w-1/2 h-full bg-emerald-400/60 border-r border-slate-900/40" 
            title="Ngưỡng an toàn sinh lý" 
          />
          {/* Zone 3: High (25%) */}
          <div 
            className="w-1/4 h-full rounded-r-full bg-rose-400/50" 
            title="Ngưỡng vượt chuẩn" 
          />
        </div>

        {/* Needle Pin Marker */}
        <div 
          className="absolute -top-1 transition-all duration-300"
          style={{ left: `calc(${pinPercent}% - 6px)` }}
        >
          <div 
            className={`h-4 w-3 rounded-full border-2 border-slate-950 shadow-md ${
              status === 'HIGH' 
                ? 'bg-rose-400 shadow-[0_0_10px_#fb7185]' 
                : status === 'LOW' 
                  ? 'bg-amber-300 shadow-[0_0_10px_#fcd34d]' 
                  : 'bg-emerald-300 shadow-[0_0_10px_#34d399]'
            }`}
          />
        </div>
      </div>

      {/* Axis Labels & Values */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span className="text-amber-300/80 flex items-center gap-0.5">
          {parsed ? `< ${parsed.min}` : 'Thấp'}
        </span>
        <span className="text-emerald-300/90 font-medium">
          Chuẩn: {refStr}
        </span>
        <span className="text-rose-300/80 flex items-center gap-0.5">
          {parsed ? `> ${parsed.max}` : 'Cao'}
        </span>
      </div>
    </div>
  );
}

/**
 * Card hiển thị chi tiết một chỉ số cận lâm sàng
 */
function MetricCard({ test }) {
  const isHigh = test.status === 'HIGH';
  const isLow = test.status === 'LOW';
  const isAbnormal = isHigh || isLow;

  return (
    <div 
      className={`rounded-2xl border p-4 transition-all duration-200 ${
        isHigh 
          ? 'border-rose-400/30 bg-rose-500/[.06] hover:bg-rose-500/[.09]' 
          : isLow
            ? 'border-amber-400/30 bg-amber-500/[.06] hover:bg-amber-500/[.09]'
            : 'border-white/10 bg-white/[.025] hover:bg-white/[.05]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-semibold text-white">
              {test.name}
            </span>
            {isAbnormal && (
              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                isHigh ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {isHigh ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                {isHigh ? 'Tăng cao' : 'Giảm thấp'}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-slate-500">
            <span className="bg-white/5 px-1.5 py-0.5 rounded text-slate-400">{test.code}</span>
            <span>Đơn vị: <strong>{test.unit || '-'}</strong></span>
          </div>
        </div>

        <div className="text-right">
          <div className={`font-display text-2xl font-bold ${
            isHigh ? 'text-rose-300' : isLow ? 'text-amber-300' : 'text-cyan-200'
          }`}>
            {test.value}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            {test.unit}
          </div>
        </div>
      </div>

      {/* Tri-Zone Range Bar Component */}
      <ClinicalRangeBar value={test.value} refStr={test.ref} status={test.status} />
    </div>
  );
}

export default function LabResultDashboard({ patient, onAskAIWithContext, onPrintReport }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  const tests = useMemo(() => {
    return patient?.categories?.flatMap(c => 
      c.id === 'imaging' ? [] : c.results.map(r => ({ ...r, category: c.name, categoryId: c.id }))
    ) || [];
  }, [patient]);

  if (!patient) return null;

  const abnormalCount = tests.filter(t => t.status !== 'NORMAL').length;
  const normalCount = tests.filter(t => t.status === 'NORMAL').length;

  const shown = tests.filter(t => {
    if (filter === 'abnormal') return t.status !== 'NORMAL';
    if (filter === 'hematology') return t.categoryId === 'hematology';
    if (filter === 'biochemistry') return t.categoryId === 'biochemistry';
    if (query.trim()) {
      const q = query.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q);
    }
    return true;
  });

  const imaging = patient.categories?.find(c => c.id === 'imaging');

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
      
      {/* Patient Profile Header Card */}
      <section className="glass-card rounded-3xl p-5 sm:p-7 border border-white/10 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-400 to-emerald-400 font-display text-2xl font-bold text-slate-950 shadow-neon">
              {patient.fullName?.[0] || 'BN'}
            </div>
            <div>
              <div className="eyebrow flex items-center gap-2">
                Hồ sơ bệnh nhân · Mã BN: <span className="text-cyan-300 font-mono font-bold">{patient.patientId}</span>
              </div>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-white">
                {patient.fullName}
              </h2>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><UserRound size={14} className="text-cyan-300" /> {patient.gender} · {patient.age} tuổi</span>
                <span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-teal-300" /> Năm sinh: {patient.birthYear}</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium"><ShieldCheck size={14} /> Bảo hiểm: {patient.insuranceNumber || 'Đã liên kết BHYT'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-right">
              <div className="text-[10px] font-bold uppercase tracking-[.18em] text-emerald-300">Kết quả ký số</div>
              <div className="mt-0.5 text-xs font-bold text-emerald-100">{patient.completedTime || 'Đã hoàn tất'}</div>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Phòng khám: {patient.clinicRoom || 'Phòng Nội tổng quát'}
            </div>
          </div>
        </div>

        {/* Metadata row */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3 pt-5 border-t border-white/5">
          <div className="rounded-xl border border-white/10 bg-black/20 p-3.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Mã chỉ định LIS</div>
            <div className="mt-1 font-mono text-xs font-bold text-cyan-200">{patient.orderId}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Bác sĩ chỉ định & duyệt</div>
            <div className="mt-1 text-xs font-semibold text-white">{patient.doctorName}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Chẩn đoán sơ bộ</div>
            <div className="mt-1 line-clamp-1 text-xs text-slate-300" title={patient.clinicalDiagnosis}>
              {patient.clinicalDiagnosis}
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Left = Lab Metrics | Right = AI Risk Card */}
      <div className="grid gap-6 xl:grid-cols-[1.38fr_.62fr]">
        
        {/* Lab Metrics Column */}
        <section className="glass-card rounded-3xl p-5 sm:p-7 border border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="eyebrow">Thước đo Range Bar 3 vùng y tế · {tests.length} chỉ số</div>
              <h3 className="mt-1 font-display text-xl sm:text-2xl font-semibold text-white">
                Bảng chỉ số cận lâm sàng chi tiết
              </h3>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <Search size={15} className="text-slate-400" />
              <input 
                value={query} 
                onChange={e => setQuery(e.target.value)} 
                placeholder="Tìm tên chỉ số hoặc mã..." 
                className="w-36 sm:w-48 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
            <button 
              onClick={() => setFilter('all')} 
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                filter === 'all' ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/30' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Tất cả ({tests.length})
            </button>
            <button 
              onClick={() => setFilter('abnormal')} 
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-colors flex items-center gap-1.5 ${
                filter === 'abnormal' ? 'bg-rose-500/25 text-rose-200 border border-rose-500/40' : 'bg-white/5 text-slate-400 hover:text-rose-300'
              }`}
            >
              <AlertTriangle size={13} className="text-rose-400" /> Cần theo dõi ({abnormalCount})
            </button>
            <button 
              onClick={() => setFilter('hematology')} 
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                filter === 'hematology' ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/30' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Huyết học (18 thông số)
            </button>
            <button 
              onClick={() => setFilter('biochemistry')} 
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                filter === 'biochemistry' ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/30' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Sinh hóa máu & Chuyển hóa
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="mt-5 grid gap-3.5 md:grid-cols-2">
            {shown.map((test, i) => (
              <MetricCard key={`${test.code}-${i}`} test={test} />
            ))}
          </div>

          {shown.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-500">
              Không tìm thấy chỉ số cận lâm sàng nào phù hợp với điều kiện tìm kiếm.
            </div>
          )}
        </section>

        {/* Sidebar: AI Risk Card & Summary */}
        <div className="space-y-6">
          <RiskAnalysisCard 
            patient={patient} 
            onAskAIWithContext={onAskAIWithContext} 
            onPrintReport={onPrintReport} 
          />

          {/* Overview Session Card */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/10">
            <div className="flex items-center gap-2">
              <HeartPulse size={18} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Thống kê phiên xét nghiệm</h3>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-300 divide-y divide-white/5">
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Chỉ số trong ngưỡng an toàn</span>
                <span className="font-bold text-emerald-400">{normalCount} chỉ số</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Chỉ số bất thường / Cần lưu ý</span>
                <span className="font-bold text-rose-400">{abnormalCount} chỉ số</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Đơn vị phân tích</span>
                <span className="font-medium text-slate-200">Khoa Xét nghiệm Trung tâm</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Trạng thái xác thực</span>
                <span className="flex items-center gap-1 font-bold text-cyan-300">
                  <CheckCircle2 size={13} /> Chữ ký số ISO 15189
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Imaging Section (X-Ray / Ultrasound) */}
      {imaging?.results?.length > 0 && (
        <section className="glass-card rounded-3xl p-5 sm:p-7 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <FlaskConical size={20} className="text-cyan-300" />
              <div>
                <div className="eyebrow">Chẩn đoán hình ảnh kỹ thuật số (PACS)</div>
                <h3 className="font-display text-xl font-semibold text-white">
                  Phim X-Quang & Kết quả Siêu âm
                </h3>
              </div>
            </div>
            <span className="text-xs text-slate-400">Bấm vào ảnh để phóng to & đo đạc</span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {imaging.results.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setSelectedImage(img)} 
                className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 text-left transition hover:border-cyan-400/40 hover:shadow-neon"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-950">
                  <img 
                    src={img.imageUrl} 
                    alt={img.title} 
                    className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <span className="absolute bottom-3 left-4 text-sm font-bold text-white drop-shadow">
                    {img.title}
                  </span>
                </div>
                <div className="p-4 text-xs text-slate-300 leading-relaxed">
                  <span className="text-teal-400 font-bold">Kết luận: </span>
                  {img.conclusion}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {selectedImage && (
        <ImagingViewerModal 
          imageItem={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  );
}

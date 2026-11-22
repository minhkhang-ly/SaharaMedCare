import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Clock3, FlaskConical, FileCheck2, LockKeyhole, Search, Sparkles, UserRound, AlertCircle, Database } from 'lucide-react';

export default function LookupHero({
  patientCode,
  setPatientCode,
  phoneNumber,
  setPhoneNumber,
  onLookup,
  currentPatient,
  isLoading,
  lookupError,
  dataSource
}) {
  const [localError, setLocalError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!patientCode.trim()) {
      return setLocalError('Vui lòng nhập mã hồ sơ (Ví dụ: BN2026-089) để bắt đầu tra cứu.');
    }
    setLocalError('');
    onLookup(patientCode.trim(), phoneNumber.trim());
  };

  const handleSelectPreset = (code, phone) => {
    setPatientCode(code);
    setPhoneNumber(phone);
    setLocalError('');
    onLookup(code, phone);
  };

  const step = currentPatient?.currentStep || 3;
  const activeError = localError || lookupError;

  return (
    <section id="lookup" className="relative overflow-hidden px-4 pb-12 pt-20 sm:px-6 lg:px-8 lg:pb-20 lg:pt-28">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/10 glow-orb" />
      <div className="pointer-events-none absolute inset-0 -z-10 grid-noise opacity-60" />
      
      <div className="mx-auto max-w-[1440px]">
        {/* Hero Title */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-cyan-200">
            <Sparkles size={13} /> Sahara AI / Clinical Intelligence
          </div>
          <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl">
            Hiểu kết quả. <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">Chăm sóc chủ động.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Không gian tra cứu cận lâm sàng thế hệ mới — trực quan hóa chỉ số, kết nối API LIS trực tiếp theo thời gian thực và đồng hành cùng trợ lý AI.
          </p>
        </div>

        {/* Lookup Box */}
        <div className="relative mx-auto mt-10 max-w-3xl">
          <div className="absolute -inset-px rounded-[26px] bg-gradient-to-r from-cyan-400/50 via-transparent to-emerald-400/50 opacity-80" />
          <div className="relative glass-panel rounded-[25px] p-5 sm:p-7">
            
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="eyebrow">LIS Cloud Lookup</div>
                <h2 className="mt-1 font-display text-xl font-semibold text-white">Tra cứu hồ sơ cận lâm sàng</h2>
              </div>
              <div className="flex items-center gap-2">
                {dataSource && (
                  <span className="flex items-center gap-1 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-mono text-cyan-300">
                    <Database size={11} /> {dataSource}
                  </span>
                )}
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] text-emerald-300">
                  <LockKeyhole size={12} /> Mã hóa bảo mật
                </div>
              </div>
            </div>

            <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <label className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300" size={17} />
                <input 
                  value={patientCode} 
                  onChange={e => { setPatientCode(e.target.value); setLocalError(''); }} 
                  placeholder="Mã hồ sơ, VD: BN2026-089" 
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10 font-mono" 
                />
              </label>

              <label className="relative">
                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input 
                  value={phoneNumber} 
                  onChange={e => { setPhoneNumber(e.target.value); setLocalError(''); }} 
                  placeholder="Số điện thoại xác thực" 
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10 font-mono" 
                />
              </label>

              <button 
                type="submit"
                disabled={isLoading} 
                className="neon-button inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold disabled:cursor-wait disabled:opacity-60"
              >
                {isLoading ? <Clock3 className="animate-spin" size={17} /> : <ArrowRight size={17} />} 
                {isLoading ? 'Đang gọi API...' : 'Tra cứu'}
              </button>
            </form>

            {activeError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{activeError}</span>
              </div>
            )}

            {/* Quick Presets */}
            <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Sparkles size={12} className="text-cyan-300" /> Dữ liệu mẫu thực tế:
              </span>
              <button
                type="button"
                onClick={() => handleSelectPreset('BN2026-089', '0912345678')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-400/15 border border-white/10 text-[11px] font-mono text-cyan-200 transition-colors"
              >
                BN2026-089 (Đủ kết quả)
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('BN2026-105', '0934567890')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-400/15 border border-white/10 text-[11px] font-mono text-amber-200 transition-colors"
              >
                BN2026-105 (Đang phân tích Lab)
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('BN2026-042', '0923456789')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-400/15 border border-white/10 text-[11px] font-mono text-purple-200 transition-colors"
              >
                BN2026-042 (Thiếu máu nhẹ)
              </button>
            </div>

          </div>
        </div>

        {/* Realtime Stepper */}
        <div className="mx-auto mt-12 max-w-4xl glass-card rounded-2xl p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="eyebrow">Realtime Pipeline</div>
              <div className="mt-1 text-sm font-semibold text-white">Tiến trình mẫu xét nghiệm</div>
            </div>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold text-cyan-200">
              {currentPatient?.statusText || 'Sẵn sàng tra cứu'}
            </span>
          </div>

          <div className="relative grid grid-cols-3 gap-2">
            {[
              { n: 1, label: 'Đã lấy mẫu (Received)', icon: CheckCircle2 },
              { n: 2, label: 'Đang phân tích (Processing)', icon: FlaskConical },
              { n: 3, label: 'Bác sĩ đã duyệt (Completed)', icon: FileCheck2 }
            ].map(({ n, label, icon: Icon }) => (
              <div key={n} className="relative z-10 text-center">
                <div 
                  className={`mx-auto grid h-9 w-9 place-items-center rounded-xl border transition-all duration-300 ${
                    step >= n 
                      ? 'border-cyan-300/50 bg-cyan-400/15 text-cyan-200 shadow-neon' 
                      : 'border-white/10 bg-white/5 text-slate-600'
                  } ${step === n && n !== 3 ? 'animate-pulse' : ''}`}
                >
                  <Icon size={17} />
                </div>
                <div className={`mt-2 text-[10px] font-semibold sm:text-xs ${step >= n ? 'text-slate-200' : 'text-slate-600'}`}>
                  {label}
                </div>
              </div>
            ))}
            <div className="absolute left-[16%] right-[16%] top-[18px] h-px bg-gradient-to-r from-cyan-400 via-emerald-400 to-white/10" />
          </div>
        </div>

      </div>
    </section>
  );
}

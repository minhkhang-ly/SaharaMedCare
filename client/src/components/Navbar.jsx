import React, { useState } from 'react';
import {
  Activity,
  Search,
  LayoutDashboard,
  History,
  Bot,
  Menu,
  X,
  CircleHelp,
  BadgePercent,
  Phone,
  LogIn,
  LogOut,
  User,
  Stethoscope
} from 'lucide-react';

export default function Navbar({
  onOpenCatalog,
  onOpenGuide,
  onScrollToLookup,
  authUser,
  onOpenAuth,
  onLogout
}) {
  const [open, setOpen] = useState(false);

  const handleHistoryClick = () => {
    if (!authUser) {
      onOpenAuth?.('login');
      return;
    }
    document.querySelector('[data-workspace]')?.scrollIntoView({ behavior: 'smooth' });
  };

  const nav = [
    { label: 'Tra cứu nhanh', icon: Search, action: onScrollToLookup },
    {
      label: 'Workspace',
      icon: LayoutDashboard,
      action: () => document.querySelector('[data-workspace]')?.scrollIntoView({ behavior: 'smooth' })
    },
    { label: 'Lịch sử xét nghiệm', icon: History, action: handleHistoryClick },
    {
      label: 'Trợ lý AI',
      icon: Bot,
      action: () => document.getElementById('ai-copilot')?.scrollIntoView({ behavior: 'smooth' })
    }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6 lg:px-8 no-print">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 py-3">
        {/* Brand */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 text-left"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-medical-primary">
            <Activity size={23} strokeWidth={2.5} />
          </span>
          <span>
            <span className="block font-display text-lg font-bold tracking-tight text-slate-900">
              Sahara<span className="text-medical-primary">MedCare</span>
            </span>
            <span className="hidden text-[9px] uppercase tracking-[.14em] text-slate-500 sm:block">
              Cổng thông tin y tế
            </span>
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 xl:flex">
          {nav.map(({ label, icon: Icon, action }, i) => (
            <button
              key={label}
              onClick={action}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                i === 0
                  ? 'bg-blue-50 text-medical-primary'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-medical-primary'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
          <button
            onClick={onOpenCatalog}
            className="ml-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            <BadgePercent size={15} />
            Bảng giá
          </button>
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            <CircleHelp size={15} />
            Hướng dẫn
          </button>
        </nav>

        {/* Right Actions: Hotline + Auth */}
        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-1.5 text-[11px] font-medium text-slate-500 2xl:flex">
            <Phone size={13} className="text-medical-primary" />
            1900-8888-MED
          </div>

          {authUser ? (
            <div className="hidden items-center gap-2 sm:flex">
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                  authUser.role === 'DOCTOR'
                    ? 'border-teal-200 bg-teal-50 text-teal-800'
                    : 'border-blue-200 bg-blue-50 text-medical-primary'
                }`}
              >
                {authUser.role === 'DOCTOR' ? <Stethoscope size={14} /> : <User size={14} />}
                <span className="max-w-[140px] truncate">{authUser.fullName}</span>
                <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] font-bold">
                  {authUser.role === 'DOCTOR' ? 'Bác sĩ' : authUser.patientId || 'Bệnh nhân'}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Đăng xuất"
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={14} />
                <span className="hidden md:inline">Thoát</span>
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                onClick={() => onOpenAuth?.('login')}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-medical-primary hover:text-medical-primary"
              >
                <LogIn size={14} />
                Đăng nhập
              </button>
              <button
                onClick={() => onOpenAuth?.('register')}
                className="rounded-xl bg-medical-primary px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700"
              >
                Đăng ký
              </button>
            </div>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 xl:hidden"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <nav className="mx-auto grid max-w-[1440px] gap-1 border-t border-slate-200 py-3 xl:hidden">
          {nav.map(({ label, icon: Icon, action }) => (
            <button
              key={label}
              onClick={() => {
                action();
                setOpen(false);
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-blue-50"
            >
              <Icon size={16} className="text-medical-primary" />
              {label}
            </button>
          ))}
          <button
            onClick={() => {
              onOpenCatalog();
              setOpen(false);
            }}
            className="px-3 py-2 text-left text-sm text-slate-700"
          >
            Bảng giá & danh mục
          </button>
          <button
            onClick={() => {
              onOpenGuide();
              setOpen(false);
            }}
            className="px-3 py-2 text-left text-sm text-slate-700"
          >
            Hướng dẫn lấy mẫu
          </button>

          <div className="mt-2 border-t border-slate-200 pt-2">
            {authUser ? (
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-bold text-slate-800">
                  {authUser.fullName}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    ({authUser.role === 'DOCTOR' ? 'Bác sĩ' : 'Bệnh nhân'})
                  </span>
                </span>
                <button
                  onClick={() => {
                    onLogout?.();
                    setOpen(false);
                  }}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-3">
                <button
                  onClick={() => {
                    onOpenAuth?.('login');
                    setOpen(false);
                  }}
                  className="rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => {
                    onOpenAuth?.('register');
                    setOpen(false);
                  }}
                  className="rounded-xl bg-medical-primary py-2 text-xs font-bold text-white"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

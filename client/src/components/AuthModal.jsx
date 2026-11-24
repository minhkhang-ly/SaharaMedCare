import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Stethoscope,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  CreditCard,
  ShieldCheck,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle2,
  LogIn,
  UserPlus,
  Sparkles,
  Info
} from 'lucide-react';
import { loginApi, registerPatientApi } from '../services/api';

const INITIAL_REGISTER = {
  fullName: '',
  phoneNumber: '',
  dateOfBirth: '',
  gender: 'Nam',
  password: '',
  confirmPassword: '',
  nationalId: '',
  healthInsuranceNumber: '',
  address: ''
};

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) {
  const [role, setRole] = useState('PATIENT'); // 'PATIENT' | 'DOCTOR'
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [regForm, setRegForm] = useState(INITIAL_REGISTER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode === 'register' ? 'register' : 'login');
      if (initialMode === 'register') setRole('PATIENT');
      setError('');
      setNotice('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    setError('');
    setNotice('');
    // Bác sĩ/KTV Lab không đăng ký công khai
    if (nextRole === 'DOCTOR') {
      setMode('login');
    }
  };

  const fillDemoAccount = (type) => {
    setError('');
    if (type === 'PATIENT') {
      setRole('PATIENT');
      setMode('login');
      setIdentifier('0912345678');
      setPassword('123456');
    } else {
      setRole('DOCTOR');
      setMode('login');
      setIdentifier('BS-001');
      setPassword('123456');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!identifier.trim() || !password) {
      setError(
        role === 'PATIENT'
          ? 'Vui lòng nhập đầy đủ số điện thoại và mật khẩu.'
          : 'Vui lòng nhập Mã bác sĩ/Email và mật khẩu.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await loginApi({ role, identifier, password });
      if (res?.success && res.user) {
        onAuthSuccess?.(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    const phoneClean = regForm.phoneNumber.trim();
    if (!regForm.fullName.trim()) {
      setError('Vui lòng nhập họ và tên đầy đủ.');
      return;
    }
    if (!/^(0|\+84)[0-9]{9,10}$/.test(phoneClean)) {
      setError('Số điện thoại không hợp lệ (ví dụ: 0912345678).');
      return;
    }
    if (!regForm.dateOfBirth) {
      setError('Vui lòng chọn ngày sinh để đối chiếu hồ sơ y tế.');
      return;
    }
    if (regForm.password.length < 6) {
      setError('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerPatientApi(regForm);
      if (res?.success && res.user) {
        setRegForm(INITIAL_REGISTER);
        onAuthSuccess?.(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-brand-700 to-teal-700 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              {role === 'DOCTOR' ? (
                <Stethoscope className="h-5 w-5 text-teal-200" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-teal-200" />
              )}
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">
                {role === 'DOCTOR'
                  ? 'Cổng Bác Sĩ & Nhân Viên Lab'
                  : mode === 'register'
                  ? 'Đăng Ký Hồ Sơ Bệnh Nhân'
                  : 'Đăng Nhập Tài Khoản Y Tế'}
              </h3>
              <p className="text-xs text-blue-100">
                SaharaMedCare · Bảo mật hồ sơ cận lâm sàng chuẩn y tế
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Role Switcher */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
            <button
              type="button"
              onClick={() => handleRoleChange('PATIENT')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
                role === 'PATIENT'
                  ? 'bg-white text-medical-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User size={15} />
              Bệnh nhân
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('DOCTOR')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
                role === 'DOCTOR'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope size={15} />
              Bác sĩ / KTV Lab
            </button>
          </div>

          {/* Patient Sub-tabs: Login / Register */}
          {role === 'PATIENT' ? (
            <div className="mt-4 flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`flex flex-1 items-center justify-center gap-2 border-b-2 pb-2.5 text-xs font-bold transition ${
                  mode === 'login'
                    ? 'border-medical-primary text-medical-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <LogIn size={14} /> Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className={`flex flex-1 items-center justify-center gap-2 border-b-2 pb-2.5 text-xs font-bold transition ${
                  mode === 'register'
                    ? 'border-medical-primary text-medical-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <UserPlus size={14} /> Đăng ký tài khoản
              </button>
            </div>
          ) : (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-teal-200 bg-teal-50/70 p-3 text-xs text-teal-900">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-600" />
              <span>
                Tài khoản <strong>Bác sĩ / KTV Xét nghiệm</strong> do Quản trị viên bệnh viện cấp nội bộ, không mở đăng ký công khai nhằm bảo mật kết quả cận lâm sàng.
              </span>
            </div>
          )}

          {/* Error / Notice */}
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {notice && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  {role === 'PATIENT' ? 'Số điện thoại' : 'Mã bác sĩ hoặc Email nội bộ'}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                    {role === 'PATIENT' ? <Phone size={15} /> : <Stethoscope size={15} />}
                  </span>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      role === 'PATIENT'
                        ? 'Nhập SĐT (VD: 0912345678)'
                        : 'Nhập Mã BS hoặc Email (VD: BS-001)'
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-medical-primary focus:bg-white focus:ring-2 focus:ring-blue-100"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Mật khẩu</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-medical-primary focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-sm transition disabled:opacity-60 ${
                  role === 'DOCTOR'
                    ? 'bg-teal-600 hover:bg-teal-700'
                    : 'bg-medical-primary hover:bg-brand-700'
                }`}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn size={16} />}
                {loading
                  ? 'Đang xác thực...'
                  : role === 'DOCTOR'
                  ? 'Đăng nhập Cổng Bác sĩ'
                  : 'Đăng nhập Bệnh nhân'}
              </button>

              {/* Quick Demo Fill */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <Sparkles size={12} className="text-medical-secondary" />
                  Tài khoản thử nghiệm nhanh (khớp seed.sql)
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('PATIENT')}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-medical-primary transition hover:bg-blue-100"
                  >
                    BN: 0912345678 / 123456
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('DOCTOR')}
                    className="rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-[11px] font-semibold text-teal-700 transition hover:bg-teal-100"
                  >
                    BS: BS-001 / 123456
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* PATIENT REGISTER FORM (khớp bảng `patients` trong schema.sql) */}
          {role === 'PATIENT' && mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                    <User size={15} />
                  </span>
                  <input
                    type="text"
                    value={regForm.fullName}
                    onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-medical-primary focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <Phone size={15} />
                    </span>
                    <input
                      type="tel"
                      value={regForm.phoneNumber}
                      onChange={(e) => setRegForm({ ...regForm, phoneNumber: e.target.value })}
                      placeholder="09xxxxxxxx"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-medical-primary focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <Calendar size={15} />
                    </span>
                    <input
                      type="date"
                      value={regForm.dateOfBirth}
                      onChange={(e) => setRegForm({ ...regForm, dateOfBirth: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-medical-primary focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Nam', 'Nữ', 'Khác'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setRegForm({ ...regForm, gender: g })}
                      className={`rounded-xl border py-2 text-xs font-bold transition ${
                        regForm.gender === g
                          ? 'border-medical-primary bg-blue-50 text-medical-primary'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-medical-primary focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={regForm.confirmPassword}
                    onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-medical-primary focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Optional Medical Info (CCCD, BHYT, Address) */}
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="text-xs font-semibold text-medical-primary hover:underline"
              >
                {showOptional
                  ? '− Ẩn thông tin y tế bổ sung (CCCD / BHYT / Địa chỉ)'
                  : '+ Bổ sung CCCD, thẻ BHYT, địa chỉ (không bắt buộc)'}
              </button>

              {showOptional && (
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-slate-600">
                        Số CCCD / CMND
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                          <CreditCard size={14} />
                        </span>
                        <input
                          type="text"
                          value={regForm.nationalId}
                          onChange={(e) => setRegForm({ ...regForm, nationalId: e.target.value })}
                          placeholder="079xxxxxxxxx"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-medical-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-slate-600">
                        Mã thẻ BHYT
                      </label>
                      <input
                        type="text"
                        value={regForm.healthInsuranceNumber}
                        onChange={(e) =>
                          setRegForm({ ...regForm, healthInsuranceNumber: e.target.value })
                        }
                        placeholder="DN479..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-medical-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-slate-600">
                      Địa chỉ liên hệ
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                        <MapPin size={14} />
                      </span>
                      <input
                        type="text"
                        value={regForm.address}
                        onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                        placeholder="Số nhà, Phường/Xã, Quận/Huyện, Tỉnh/TP"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-medical-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-medical-primary py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus size={16} />}
                {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản Bệnh nhân'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-center text-[11px] text-slate-500">
          Bệnh nhân vẫn có thể{' '}
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-medical-primary hover:underline"
          >
            tra cứu nhanh bằng Mã hồ sơ + SĐT
          </button>{' '}
          mà không cần đăng nhập.
        </div>
      </div>
    </div>
  );
}

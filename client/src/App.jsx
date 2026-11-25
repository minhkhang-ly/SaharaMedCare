import React, { useRef, useState, useEffect } from 'react';
import { 
  Activity, 
  ArrowUpRight, 
  Bot, 
  CheckCircle2, 
  Clock3, 
  FileText, 
  FlaskConical, 
  Mail, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';
import Navbar from './components/Navbar';
import LookupHero from './components/LookupHero';
import LabResultDashboard from './components/LabResultDashboard';
import AIChatbotWidget from './components/AIChatbotWidget';
import PriceCatalogModal from './components/PriceCatalogModal';
import GuideModal from './components/GuideModal';
import PrintReportView from './components/PrintReportView';
import AuthModal from './components/AuthModal';
import { lookupPatientApi, checkBackendStatus, getStoredAuth, logoutAuth } from './services/api';
import { mockPatients } from './data/mockLabData';

export default function App() {
  const initialUser = getStoredAuth()?.user || null;
  const isInitialPatient = initialUser?.role === 'PATIENT' && Boolean(initialUser?.patientId);

  const [authUser, setAuthUser] = useState(initialUser);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [patientCode, setPatientCode] = useState(isInitialPatient ? initialUser.patientId : 'BN2026-089');
  const [phoneNumber, setPhoneNumber] = useState(isInitialPatient ? (initialUser.phoneNumber || '') : '0912345678');
  const [currentPatient, setCurrentPatient] = useState(
    isInitialPatient ? (mockPatients[initialUser.patientId] || null) : mockPatients['BN2026-089']
  );
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [dataSource, setDataSource] = useState('Khởi tạo');
  const [backendOnline, setBackendOnline] = useState(false);
  const [catalog, setCatalog] = useState(false);
  const [guide, setGuide] = useState(false);
  const [prompt, setPrompt] = useState('');
  
  const resultRef = useRef(null);

  // 1. Kiểm tra kết nối Backend API khi ứng dụng khởi động
  useEffect(() => {
    const targetCode = isInitialPatient ? initialUser.patientId : 'BN2026-089';
    const targetPhone = isInitialPatient ? (initialUser.phoneNumber || '') : '0912345678';

    checkBackendStatus().then(status => {
      setBackendOnline(status.online);
      if (status.online) {
        lookupPatientApi(targetCode, targetPhone)
          .then(res => {
            if (res && res.data) {
              setCurrentPatient(res.data);
              setDataSource(res.source || 'REST API');
            }
          })
          .catch(err => {
            console.warn('[App] Lỗi tải hồ sơ ban đầu:', err);
            if (isInitialPatient) {
              setCurrentPatient(null);
              setDataSource('MySQL / Chưa có phiếu XN');
            }
          });
      } else {
        setDataSource('Chế độ Offline');
      }
    });
  }, []);

  // 2. Hàm tra cứu gọi API thật từ Backend (có chặn bảo mật theo vai trò Bệnh nhân)
  const lookup = async (code, phone, overrideUser = undefined) => {
    const activeUser = overrideUser !== undefined ? overrideUser : authUser;
    const cleanCode = (code || '').trim();

    // Chặn tuyệt đối tài khoản Bệnh nhân tra cứu hồ sơ của bệnh nhân khác
    if (
      activeUser?.role === 'PATIENT' &&
      activeUser?.patientId &&
      cleanCode.toUpperCase() !== activeUser.patientId.toUpperCase()
    ) {
      setLookupError(
        `Vì bảo mật thông tin y tế, tài khoản Bệnh nhân chỉ được xem hồ sơ của chính mình (${activeUser.patientId}). Vui lòng đăng xuất nếu muốn tra cứu hồ sơ khác.`
      );
      return;
    }

    setLoading(true);
    setLookupError('');
    try {
      const res = await lookupPatientApi(cleanCode, phone);
      if (res && res.data) {
        setCurrentPatient(res.data);
        setDataSource(res.source || 'REST API');
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      } else {
        if (activeUser?.role === 'PATIENT') {
          setCurrentPatient(null);
        }
        setLookupError(`Không tìm thấy hồ sơ với mã "${cleanCode}". Vui lòng thử lại.`);
      }
    } catch (err) {
      if (activeUser?.role === 'PATIENT') {
        // Không giữ lại kết quả của bệnh nhân cũ nếu tài khoản mới chưa có phiếu xét nghiệm
        setCurrentPatient(null);
        setLookupError('');
      } else {
        setLookupError(err.message || `Không tìm thấy hồ sơ "${cleanCode}". Thử: BN2026-089, BN2026-042 hoặc BN2026-105.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user) => {
    setAuthUser(user);
    setLookupError('');
    // Nếu là bệnh nhân -> xóa ngay dữ liệu cũ đang hiển thị và chỉ nạp đúng hồ sơ của bệnh nhân đó
    if (user?.role === 'PATIENT' && user.patientId) {
      setCurrentPatient(null);
      setPatientCode(user.patientId);
      setPhoneNumber(user.phoneNumber || '');
      lookup(user.patientId, user.phoneNumber || '', user);
    }
  };

  const handleLogout = () => {
    logoutAuth();
    setAuthUser(null);
    setLookupError('');
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-clinical text-slate-900">
      
      {/* Backend Status Bar */}
      <aside className="no-print bg-slate-950 border-b border-white/5 py-1.5 px-4 text-center text-[11px] text-slate-400 flex flex-wrap items-center justify-center gap-3">
        <span className="flex items-center gap-1.5">
          {backendOnline ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              LIS RESTful API: Online (http://localhost:5000)
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400">
              <WifiOff size={12} /> Backend Offline - Chế độ dữ liệu đệm
            </span>
          )}
        </span>

        <span className="hidden sm:inline text-slate-600">|</span>
        <span className="hidden sm:inline text-slate-400">
          Nguồn dữ liệu: <strong className="text-cyan-300 font-mono">{dataSource}</strong>
        </span>

        {authUser && (
          <>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="text-teal-300 font-medium">
              Phiên đăng nhập: <strong>{authUser.fullName}</strong> ({authUser.role === 'DOCTOR' ? 'Bác sĩ/Lab' : 'Bệnh nhân'})
              {authUser.isDemoAuth && <span className="ml-1 text-amber-300">[Demo Auth]</span>}
            </span>
          </>
        )}
      </aside>

      <Navbar 
        onOpenCatalog={() => setCatalog(true)} 
        onOpenGuide={() => setGuide(true)} 
        onScrollToLookup={() => document.getElementById('lookup')?.scrollIntoView({ behavior: 'smooth' })}
        authUser={authUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      <main className="no-print">
        <LookupHero 
          patientCode={patientCode} 
          setPatientCode={setPatientCode} 
          phoneNumber={phoneNumber} 
          setPhoneNumber={setPhoneNumber} 
          onLookup={lookup} 
          currentPatient={currentPatient} 
          isLoading={loading}
          lookupError={lookupError}
          dataSource={dataSource}
          authUser={authUser}
          onLogout={handleLogout}
        />

        <div ref={resultRef} data-workspace>
          {!currentPatient ? (
            <section className="mx-4 mb-20 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:mx-6 lg:mx-auto lg:max-w-3xl">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-medical-primary">
                <FileText size={30} />
              </div>
              <div className="mt-4 text-[11px] font-bold uppercase tracking-[.18em] text-medical-primary">
                Hồ sơ điện tử cá nhân
              </div>
              <h2 className="mt-2 font-display text-2xl font-semibold text-slate-900">
                {authUser?.role === 'PATIENT'
                  ? `Xin chào ${authUser.fullName}, bạn chưa có phiếu kết quả cận lâm sàng`
                  : 'Chưa có dữ liệu hồ sơ để hiển thị'}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
                {authUser?.role === 'PATIENT'
                  ? `Mã bệnh nhân của bạn là ${authUser.patientId}. Khi bạn thực hiện xét nghiệm hoặc chẩn đoán hình ảnh tại bệnh viện, kết quả sẽ tự động hiển thị bảo mật ngay tại đây.`
                  : 'Vui lòng nhập Mã hồ sơ và Số điện thoại ở khung tra cứu phía trên để xem kết quả.'}
              </p>
            </section>
          ) : currentPatient?.currentStatus === 'PROCESSING' ? (
            <section className="mx-4 mb-20 rounded-3xl border border-cyan-300/20 bg-cyan-300/5 p-10 text-center sm:mx-6 lg:mx-auto lg:max-w-3xl">
              <div className="mx-auto grid h-16 w-16 animate-pulse place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <FlaskConical size={30} />
              </div>
              <div className="eyebrow mt-5">Lab Processing / Live Status</div>
              <h2 className="mt-2 font-display text-2xl font-semibold text-white">
                Mẫu của {currentPatient.fullName} đang được phân tích tại phòng xét nghiệm
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Hệ thống máy phân tích tự động (Sysmex / Cobas) đang xử lý mẫu bệnh phẩm. Kết quả sẽ được cập nhật ngay khi Bác sĩ Trưởng khoa hoàn tất ký số.
              </p>
              <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-slate-300">
                <Clock3 size={15} className="text-cyan-300" /> Dự kiến hoàn tất: <strong className="text-white">{currentPatient.completedTime || 'Trong vòng 30 phút'}</strong>
              </div>
            </section>
          ) : (
            <LabResultDashboard 
              patient={currentPatient} 
              onAskAIWithContext={setPrompt} 
              onPrintReport={() => window.print()}
            />
          )}
        </div>

        {/* Feature Highlights */}
        <section className="mx-auto grid max-w-[1440px] gap-4 px-4 pb-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div className="glass-card rounded-2xl p-5">
            <ShieldCheck className="text-cyan-300" size={20} />
            <h3 className="mt-4 text-sm font-bold text-white">Bảo mật y tế chuẩn ISO</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">Dữ liệu hồ sơ cận lâm sàng được mã hóa đầu cuối và tuân thủ quy chuẩn y tế.</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <Activity className="text-emerald-300" size={20} />
            <h3 className="mt-4 text-sm font-bold text-white">Theo dõi tiến trình Lab</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">Theo dõi trạng thái từng bước từ tiếp nhận mẫu, phân tích tới ký số.</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <Bot className="text-sky-300" size={20} />
            <h3 className="mt-4 text-sm font-bold text-white">Sahara AI Copilot</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">Giao diện trợ lý AI giải thích chỉ số chuyên sâu theo ngôn ngữ dễ hiểu.</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <CheckCircle2 className="text-teal-300" size={20} />
            <h3 className="mt-4 text-sm font-bold text-white">Bác sĩ chuyên khoa duyệt</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">Toàn bộ phiếu kết quả đều có chữ ký số của Bác sĩ Trưởng khoa Xét nghiệm.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/60 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950">
                <Activity size={17} />
              </span>
              SaharaMedCare
            </div>
            <p className="mt-3 max-w-xs text-xs leading-6 text-slate-500">
              Hệ thống cổng thông tin và tra cứu kết quả cận lâm sàng cho bệnh viện tích hợp Trợ lý AI.
            </p>
          </div>
          
          <div className="text-xs text-slate-500">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-300">Hỗ trợ bệnh nhân</div>
            <div className="flex items-center gap-2"><Phone size={13} className="text-cyan-300" /> 1900-8888-MED (24/7)</div>
            <div className="mt-2 flex items-center gap-2"><Mail size={13} className="text-cyan-300" /> cskh@saharamedcare.vn</div>
          </div>

          <div className="text-xs text-slate-500">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-300">Trung tâm xét nghiệm</div>
            <div className="flex items-start gap-2">
              <MapPin size={13} className="mt-0.5 text-emerald-300" /> Khu Y tế Kỹ thuật cao, TP. Hồ Chí Minh
            </div>
            <div className="mt-3 flex items-center gap-2 text-cyan-300">
              Xem chính sách bảo mật <ArrowUpRight size={13} />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-[1440px] border-t border-white/10 pt-5 text-[10px] text-slate-600 flex flex-wrap justify-between items-center gap-2">
          <span>© 2026 - 2027 Nhóm 3 (Sahara) · Đồ án QL05-W · Bệnh viện Đa khoa Quốc tế Sahara</span>
          <span className="font-mono text-cyan-400/80">FE: Đỗ Huy An · BE: Nguyễn Thế Ngọc · Lead: Lý Minh Khang</span>
        </div>
      </footer>

      {/* Overlays & Modals */}
      <div className="no-print">
        <AIChatbotWidget 
          currentPatient={currentPatient} 
          initialPrompt={prompt} 
          onClearInitialPrompt={() => setPrompt('')} 
        />
      </div>

      <PrintReportView patient={currentPatient} />
      <PriceCatalogModal isOpen={catalog} onClose={() => setCatalog(false)} />
      <GuideModal isOpen={guide} onClose={() => setGuide(false)} />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

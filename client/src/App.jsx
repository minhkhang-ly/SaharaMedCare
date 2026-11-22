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
  WifiOff,
  Radio
} from 'lucide-react';
import Navbar from './components/Navbar';
import LookupHero from './components/LookupHero';
import LabResultDashboard from './components/LabResultDashboard';
import AIChatbotWidget from './components/AIChatbotWidget';
import PriceCatalogModal from './components/PriceCatalogModal';
import GuideModal from './components/GuideModal';
import PrintReportView from './components/PrintReportView';
import { lookupPatientApi, checkBackendStatus } from './services/api';
import { subscribeOrderStatus } from './services/socket';
import { mockPatients } from './data/mockLabData';

export default function App() {
  const [patientCode, setPatientCode] = useState('BN2026-089');
  const [phoneNumber, setPhoneNumber] = useState('0912345678');
  const [currentPatient, setCurrentPatient] = useState(mockPatients['BN2026-089']);
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [dataSource, setDataSource] = useState('Khởi tạo');
  const [backendOnline, setBackendOnline] = useState(false);
  const [realtimeActive, setRealtimeActive] = useState(false);
  const [catalog, setCatalog] = useState(false);
  const [guide, setGuide] = useState(false);
  const [prompt, setPrompt] = useState('');
  
  const resultRef = useRef(null);

  // 1. Kiểm tra kết nối Backend API khi ứng dụng khởi động
  useEffect(() => {
    checkBackendStatus().then(status => {
      setBackendOnline(status.online);
      if (status.online) {
        // Tải hồ sơ mặc định trực tiếp từ Backend API
        lookupPatientApi('BN2026-089', '0912345678')
          .then(res => {
            if (res && res.data) {
              setCurrentPatient(res.data);
              setDataSource(res.source || 'REST API');
            }
          })
          .catch(err => console.warn('[App] Lỗi tải hồ sơ ban đầu:', err));
      } else {
        setDataSource('Chế độ Offline');
      }
    });
  }, []);

  // 2. Lắng nghe cập nhật trạng thái xét nghiệm Realtime qua Socket.IO
  useEffect(() => {
    if (!currentPatient?.orderId) return;

    setRealtimeActive(true);
    const unsubscribe = subscribeOrderStatus(currentPatient.orderId, (updatedData) => {
      console.log('[App] Nhận tín hiệu Realtime cập nhật tiến trình:', updatedData);
      
      setCurrentPatient(prev => {
        const nextStatus = updatedData.status || updatedData.currentStatus || 'COMPLETED';
        const nextStep = updatedData.step || updatedData.currentStep || (nextStatus === 'COMPLETED' ? 3 : nextStatus === 'PROCESSING' ? 2 : 1);
        const nextStatusText = updatedData.statusText || (nextStatus === 'COMPLETED' ? 'Đã có kết quả & Bác sĩ trưởng khoa duyệt' : 'Đang phân tích');

        return {
          ...prev,
          currentStatus: nextStatus,
          currentStep: nextStep,
          statusText: nextStatusText,
          completedTime: updatedData.completedTime || prev.completedTime || 'Vừa hoàn tất',
          categories: updatedData.categories || prev.categories
        };
      });
    });

    return () => {
      unsubscribe();
    };
  }, [currentPatient?.orderId]);

  // 3. Hàm tra cứu gọi API thật từ Backend
  const lookup = async (code, phone) => {
    setLoading(true);
    setLookupError('');
    try {
      const res = await lookupPatientApi(code, phone);
      if (res && res.data) {
        setCurrentPatient(res.data);
        setDataSource(res.source || 'REST API');
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      } else {
        setLookupError(`Không tìm thấy hồ sơ với mã "${code}". Vui lòng thử lại.`);
      }
    } catch (err) {
      setLookupError(err.message || `Không tìm thấy hồ sơ "${code}". Thử: BN2026-089, BN2026-042 hoặc BN2026-105.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-clinical text-slate-900">
      
      {/* Backend Status Bar */}
      <aside className="no-print bg-slate-950 border-b border-white/5 py-1.5 px-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-3">
        <span className="flex items-center gap-1.5">
          {backendOnline ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              LIS API: Online (http://localhost:5000)
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400">
              <WifiOff size={12} /> Backend Offline - Chế độ dữ liệu đệm
            </span>
          )}
        </span>

        <span className="text-slate-600">|</span>

        <span className="flex items-center gap-1 text-cyan-300 font-mono">
          <Radio size={12} className={realtimeActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'} />
          Socket.IO Realtime: {realtimeActive ? `Listening (${currentPatient?.orderId || 'Active'})` : 'Standby'}
        </span>

        <span className="hidden sm:inline text-slate-600">|</span>
        <span className="hidden sm:inline text-slate-400">
          Nguồn dữ liệu: <strong className="text-cyan-300 font-mono">{dataSource}</strong>
        </span>
      </aside>

      <Navbar 
        onOpenCatalog={() => setCatalog(true)} 
        onOpenGuide={() => setGuide(true)} 
        onScrollToLookup={() => document.getElementById('lookup')?.scrollIntoView({ behavior: 'smooth' })}
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
        />

        <div ref={resultRef} data-workspace>
          {currentPatient?.currentStatus === 'PROCESSING' ? (
            <section className="mx-4 mb-20 rounded-3xl border border-cyan-300/20 bg-cyan-300/5 p-10 text-center sm:mx-6 lg:mx-auto lg:max-w-3xl">
              <div className="mx-auto grid h-16 w-16 animate-pulse place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <FlaskConical size={30} />
              </div>
              <div className="eyebrow mt-5">Lab Processing / Live Status</div>
              <h2 className="mt-2 font-display text-2xl font-semibold text-white">
                Mẫu của {currentPatient.fullName} đang được phân tích tại phòng xét nghiệm
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Hệ thống máy phân tích tự động (Sysmex / Cobas) đang xử lý mẫu bệnh phẩm. Kết quả sẽ được cập nhật trực tiếp qua WebSocket ngay khi Bác sĩ Trưởng khoa hoàn tất ký số.
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
            <h3 className="mt-4 text-sm font-bold text-white">Realtime Lab Tracking</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">Theo dõi trạng thái từng bước từ tiếp nhận mẫu, phân tích tới ký số.</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <Bot className="text-sky-300" size={20} />
            <h3 className="mt-4 text-sm font-bold text-white">Sahara AI Copilot</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">Giải thích chỉ số chuyên sâu, đối chiếu ngưỡng tham chiếu theo ngôn ngữ dễ hiểu.</p>
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
    </div>
  );
}

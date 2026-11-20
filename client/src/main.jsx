import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('SaharaMedCare render error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ minHeight: '100vh', padding: '48px 24px', background: '#F4F7FA', color: '#0F172A', fontFamily: 'system-ui, sans-serif' }}>
          <section style={{ maxWidth: 720, margin: '0 auto', padding: 28, border: '1px solid #FECACA', borderRadius: 20, background: '#FFFFFF', boxShadow: '0 1px 4px rgba(15,23,42,.08)' }}>
            <p style={{ color: '#B91C1C', fontSize: 12, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase' }}>Application error</p>
            <h1 style={{ margin: '12px 0', fontSize: 24 }}>Không thể tải giao diện SaharaMedCare</h1>
            <p style={{ color: '#475569', fontSize: 14 }}>Mở Developer Tools (F12) → Console để xem lỗi chi tiết. Sau khi sửa mã nguồn, hãy tải lại trang.</p>
            <pre style={{ overflowX: 'auto', marginTop: 20, padding: 16, borderRadius: 12, background: '#F8FAFC', color: '#B91C1C', whiteSpace: 'pre-wrap', border: '1px solid #E2E8F0' }}>{this.state.error.message}</pre>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);


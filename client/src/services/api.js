/**
 * SaharaMedCare - Frontend API Service (Giai đoạn 1: RESTful API Lõi)
 * Connects Frontend Client to Express Backend (http://localhost:5000/api)
 */

import { mockPatients, testPriceCatalog, sampleGuidelines } from '../data/mockLabData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Kiểm tra trạng thái máy chủ Backend
 */
export async function checkBackendStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: true, data };
  } catch (error) {
    return { online: false, error: error.message };
  }
}

/**
 * Tra cứu hồ sơ bệnh nhân theo Mã hồ sơ & Số điện thoại
 * Endpoint: POST /api/patients/lookup
 */
export async function lookupPatientApi(patientCode, phone = '') {
  try {
    const res = await fetch(`${API_BASE_URL}/patients/lookup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        patientCode: patientCode.trim(),
        phone: phone.trim()
      })
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.message || `Không tìm thấy hồ sơ với mã "${patientCode}".`);
    }

    return {
      success: true,
      data: result.data,
      source: result.source || 'Backend-API'
    };
  } catch (error) {
    console.warn(`[API] Lỗi khi gọi API (${error.message}). Kiểm tra chế độ offline fallback...`);
    const fallback = mockPatients[patientCode.trim()];
    if (fallback) {
      return {
        success: true,
        data: fallback,
        source: 'Local-Fallback',
        isOfflineFallback: true
      };
    }
    throw error;
  }
}

/**
 * Lấy chi tiết toàn bộ kết quả cận lâm sàng của bệnh nhân
 * Endpoint: GET /api/lab-results/:patientId
 */
export async function getLabResultsApi(patientId) {
  try {
    const res = await fetch(`${API_BASE_URL}/lab-results/${patientId}`);
    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.message || 'Không thể tải kết quả cận lâm sàng.');
    }

    return result.data;
  } catch (error) {
    console.warn(`[API] Không thể tải kết quả qua API: ${error.message}`);
    return mockPatients[patientId] || null;
  }
}

/**
 * Lấy danh mục xét nghiệm & bảng giá BHYT
 * Endpoint: GET /api/catalog/tests
 */
export async function getCatalogTestsApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/catalog/tests`);
    const result = await res.json();
    if (res.ok && result.success && Array.isArray(result.data)) {
      return result.data;
    }
    return testPriceCatalog;
  } catch (error) {
    console.warn('[API] Dùng bảng giá fallback cục bộ:', error.message);
    return testPriceCatalog;
  }
}

/**
 * Lấy danh sách hướng dẫn chuẩn bị lấy mẫu
 * Endpoint: GET /api/catalog/guidelines
 */
export async function getGuidelinesApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/catalog/guidelines`);
    const result = await res.json();
    if (res.ok && result.success && Array.isArray(result.data)) {
      return result.data;
    }
    return sampleGuidelines;
  } catch (error) {
    console.warn('[API] Dùng hướng dẫn fallback cục bộ:', error.message);
    return sampleGuidelines;
  }
}

/**
 * Gửi câu hỏi đến Chatbot API của Backend (Giai đoạn 1: Interface & Kết nối Endpoint)
 * Endpoint: POST /api/chatbot/chat
 */
export async function askAIChatbotApi(prompt, patientContext) {
  try {
    const res = await fetch(`${API_BASE_URL}/chatbot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt, patientContext })
    });

    const result = await res.json();
    if (res.ok && result.success && result.reply) {
      return result.reply;
    }
    return result.reply || 'Hệ thống chatbot đang được chuẩn bị cho Giai đoạn 2.';
  } catch (error) {
    console.warn('[Chatbot API] Lỗi kết nối:', error.message);
    return 'Xin chào! Trợ lý AI đang trong quá trình chuẩn bị kết nối (Giai đoạn 2). Bạn vui lòng quay lại sau.';
  }
}

// =====================================================================
// AUTHENTICATION API (Chuẩn hóa payload khớp với MySQL schema.sql)
// Endpoints dự kiến bên Backend:
//   - POST /api/auth/login    ({ role, identifier, password })
//   - POST /api/auth/register ({ role, fullName, phoneNumber, dateOfBirth, gender, nationalId, healthInsuranceNumber, address, password })
// =====================================================================

const AUTH_TOKEN_KEY = 'sahara_auth_token';
const AUTH_USER_KEY = 'sahara_auth_user';
const DEMO_USERS_KEY = 'sahara_demo_registered_users';

const DEFAULT_DEMO_ACCOUNTS = [
  {
    userId: 1,
    role: 'PATIENT',
    patientId: 'BN2026-089',
    fullName: 'Nguyễn Văn An',
    phoneNumber: '0912345678',
    dateOfBirth: '1974-05-15',
    gender: 'Nam',
    password: '123456'
  },
  {
    userId: 2,
    role: 'PATIENT',
    patientId: 'BN2026-042',
    fullName: 'Trần Thị Mai',
    phoneNumber: '0987654321',
    dateOfBirth: '1992-08-20',
    gender: 'Nữ',
    password: '123456'
  },
  {
    userId: 101,
    role: 'DOCTOR',
    doctorId: 'BS-001',
    fullName: 'TS. BS. Trần Minh Quân',
    title: 'TS. BS',
    department: 'Khoa Xét nghiệm',
    email: 'minhquan@saharamedcare.vn',
    phoneNumber: '0901234567',
    password: '123456'
  }
];

function getDemoAccounts() {
  try {
    const saved = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
    return [...DEFAULT_DEMO_ACCOUNTS, ...(Array.isArray(saved) ? saved : [])];
  } catch {
    return DEFAULT_DEMO_ACCOUNTS;
  }
}

function saveAuthSession(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getStoredAuth() {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const rawUser = localStorage.getItem(AUTH_USER_KEY);
    if (!token || !rawUser) return null;
    return { token, user: JSON.parse(rawUser) };
  } catch {
    return null;
  }
}

export function getAuthHeader() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function logoutAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

/**
 * Đăng nhập cho Bệnh nhân (SĐT) hoặc Bác sĩ / KTV Lab (Mã BS hoặc Email)
 * Endpoint: POST /api/auth/login
 */
export async function loginApi({ role, identifier, password }) {
  const payload = {
    role: role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT',
    identifier: identifier.trim(),
    password
  };

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Nếu Backend chưa triển khai route /api/auth/login (404), chuyển sang chế độ Demo Auth
    if (res.status === 404) {
      throw new Error('AUTH_ENDPOINT_NOT_READY');
    }

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.message || 'Thông tin đăng nhập không chính xác.');
    }

    saveAuthSession(result.token, result.user);
    return { success: true, user: result.user, token: result.token, isDemo: false };
  } catch (error) {
    const shouldFallback =
      error.message === 'AUTH_ENDPOINT_NOT_READY' ||
      error.name === 'TypeError' ||
      error.message.includes('Failed to fetch');

    if (!shouldFallback) {
      throw error;
    }

    // Chế độ Demo Fallback cục bộ (tự tắt khi Backend mở /api/auth/login)
    const idLower = payload.identifier.toLowerCase();
    const matched = getDemoAccounts().find((acc) => {
      if (acc.role !== payload.role) return false;
      const idMatch =
        acc.phoneNumber?.toLowerCase() === idLower ||
        acc.email?.toLowerCase() === idLower ||
        acc.doctorId?.toLowerCase() === idLower ||
        acc.patientId?.toLowerCase() === idLower;
      return idMatch && acc.password === payload.password;
    });

    if (!matched) {
      throw new Error('Sai tài khoản hoặc mật khẩu (Chế độ Demo: dùng nút điền nhanh bên dưới).');
    }

    const { password: _hidden, ...safeUser } = matched;
    const demoUser = { ...safeUser, isDemoAuth: true };
    const demoToken = `demo-jwt-${safeUser.role.toLowerCase()}-${Date.now()}`;
    saveAuthSession(demoToken, demoUser);
    return { success: true, user: demoUser, token: demoToken, isDemo: true };
  }
}

/**
 * Đăng ký tài khoản Bệnh nhân (khớp các cột bảng `patients` trong schema.sql)
 * Endpoint: POST /api/auth/register
 */
export async function registerPatientApi(formData) {
  const payload = {
    role: 'PATIENT',
    fullName: formData.fullName.trim(),
    phoneNumber: formData.phoneNumber.trim(),
    dateOfBirth: formData.dateOfBirth,
    gender: formData.gender, // ENUM('Nam', 'Nữ', 'Khác')
    nationalId: formData.nationalId?.trim() || null,
    healthInsuranceNumber: formData.healthInsuranceNumber?.trim() || null,
    address: formData.address?.trim() || null,
    password: formData.password
  };

  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.status === 404) {
      throw new Error('AUTH_ENDPOINT_NOT_READY');
    }

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.message || 'Không thể đăng ký tài khoản. Vui lòng thử lại.');
    }

    saveAuthSession(result.token, result.user);
    return { success: true, user: result.user, token: result.token, isDemo: false };
  } catch (error) {
    const shouldFallback =
      error.message === 'AUTH_ENDPOINT_NOT_READY' ||
      error.name === 'TypeError' ||
      error.message.includes('Failed to fetch');

    if (!shouldFallback) {
      throw error;
    }

    // Kiểm tra trùng SĐT trong chế độ Demo
    const accounts = getDemoAccounts();
    if (accounts.some((acc) => acc.role === 'PATIENT' && acc.phoneNumber === payload.phoneNumber)) {
      throw new Error('Số điện thoại này đã được đăng ký tài khoản.');
    }

    const randomCode = Math.floor(200 + Math.random() * 799);
    const newAccount = {
      userId: Date.now(),
      role: 'PATIENT',
      patientId: `BN2026-${randomCode}`,
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber,
      dateOfBirth: payload.dateOfBirth,
      gender: payload.gender,
      nationalId: payload.nationalId,
      healthInsuranceNumber: payload.healthInsuranceNumber,
      address: payload.address,
      password: payload.password
    };

    try {
      const existing = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
      localStorage.setItem(DEMO_USERS_KEY, JSON.stringify([...existing, newAccount]));
    } catch {
      // ignore storage errors
    }

    const { password: _hidden, ...safeUser } = newAccount;
    const demoUser = { ...safeUser, isDemoAuth: true };
    const demoToken = `demo-jwt-patient-${Date.now()}`;
    saveAuthSession(demoToken, demoUser);
    return { success: true, user: demoUser, token: demoToken, isDemo: true };
  }
}

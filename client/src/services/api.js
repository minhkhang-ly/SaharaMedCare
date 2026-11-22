/**
 * SaharaMedCare - Frontend API Service
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
    // Nếu lỗi mạng hoặc server chưa bật, hỗ trợ fallback sang dữ liệu mẫu có sẵn để không làm gián đoạn trải nghiệm
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

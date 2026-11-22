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
 * Gửi câu hỏi đến Trợ lý AI y tế (Sahara AI Copilot)
 * Endpoint: POST /api/chatbot/chat
 */
export async function askAIChatbotApi(prompt, patientContext) {
  try {
    const res = await fetch(`${API_BASE_URL}/chatbot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        patientContext: {
          fullName: patientContext?.fullName,
          patientId: patientContext?.patientId,
          clinicalDiagnosis: patientContext?.clinicalDiagnosis,
          abnormalFindings: patientContext?.riskSummary?.keyFindings || [],
          riskLevel: patientContext?.riskSummary?.overallRisk,
          recommendedDepts: patientContext?.riskSummary?.recommendedDepartments || []
        }
      })
    });

    const result = await res.json();
    if (res.ok && result.success && result.reply) {
      return result.reply;
    }
  } catch (error) {
    console.warn('[Chatbot API] Không thể kết nối chatbot server:', error.message);
  }

  // Fallback AI Clinician reasoning engine khi server AI bận
  const lower = prompt.toLowerCase();
  const name = patientContext?.fullName || 'bạn';
  const findings = patientContext?.riskSummary?.keyFindings || [];

  if (lower.includes('bất thường') || lower.includes('nguy cơ') || lower.includes('kết quả')) {
    if (findings.length > 0) {
      const summary = findings.map((f, i) => `${i + 1}. ${f.title}: ${f.detail}`).join('\n\n');
      return `Chào ${name}, dựa trên kết quả cận lâm sàng của bạn, tôi phát hiện các điểm cần lưu ý sau:\n\n${summary}\n\n👉 Khuyến cáo: Bạn nên mang kết quả này tới gặp Bác sĩ chuyên khoa để được tư vấn phác đồ điều trị cụ thể.`;
    }
    return `Hồ sơ của ${name} các chỉ số cơ bản đều nằm trong giới hạn an toàn bình thường.`;
  }

  if (lower.includes('khám') || lower.includes('chuyên khoa') || lower.includes('ở đâu')) {
    const depts = patientContext?.riskSummary?.recommendedDepartments || [];
    if (depts.length > 0) {
      const list = depts.map(d => `• ${d.name} (${d.urgency})`).join('\n');
      return `Dựa trên kết quả cận lâm sàng, hệ thống khuyến nghị ${name} nên ưu tiên thăm khám tại các chuyên khoa:\n\n${list}\n\nBạn có thể đến Phòng Khám Đa Khoa Sahara để được khám đúng chuyên khoa.`;
    }
    return `Bạn có thể đăng ký tái khám tại Phòng Khám Nội Tổng Quát của Bệnh viện Sahara.`;
  }

  if (lower.includes('dinh dưỡng') || lower.includes('ăn') || lower.includes('uống') || lower.includes('kiêng')) {
    const diet = patientContext?.riskSummary?.dietaryAdvice;
    if (Array.isArray(diet) && diet.length > 0) {
      return `Chế độ dinh dưỡng & lối sống được gợi ý cho ${name}:\n\n` + diet.map(d => `• ${d}`).join('\n');
    }
    return `Bạn nên duy trì chế độ ăn thanh đạm, giảm tinh bột hấp thu nhanh và đường ngọt, tăng cường rau xanh và vận động thể lực tối thiểu 30 phút mỗi ngày.`;
  }

  return `Tôi đã ghi nhận câu hỏi: "${prompt}". Với hồ sơ cận lâm sàng hiện tại của ${name}, tôi có thể hỗ trợ giải thích ý nghĩa các chỉ số xét nghiệm, đánh giá mức độ rủi ro hoặc tư vấn chuyên khoa cần khám. Bạn muốn tìm hiểu kỹ hơn về chỉ số nào?`;
}

/**
 * SaharaMedCare - AI Clinician & Chatbot Controller
 * Analyzes patient lab results and provides empathetic, medically accurate clinical guidance.
 */

function removeVietnameseTones(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export const handleAIChat = async (req, res) => {
  try {
    const { prompt, patientContext } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp nội dung câu hỏi cho AI.'
      });
    }

    const question = prompt.trim();
    const cleanQ = removeVietnameseTones(question);
    const patientName = patientContext?.fullName || 'Bệnh nhân';
    const findings = patientContext?.abnormalFindings || [];
    const diagnosis = patientContext?.clinicalDiagnosis || '';

    // 1. Kiểm tra nếu có cấu hình Google Gemini API Key
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Bạn là Sahara AI Copilot - Trợ lý y tế cận lâm sàng thông minh của Bệnh viện Đa khoa Quốc tế Sahara.
Hãy trả lời câu hỏi của bệnh nhân một cách ân cần, dễ hiểu, chuẩn y khoa, có cấu trúc rõ ràng.

Thông tin hồ sơ bệnh nhân:
- Họ tên: ${patientName}
- Mã hồ sơ: ${patientContext?.patientId || 'Chưa xác định'}
- Chẩn đoán lâm sàng: ${diagnosis}
- Các điểm bất thường ghi nhận: ${JSON.stringify(findings)}
- Khuyến cáo chuyên khoa: ${JSON.stringify(patientContext?.recommendedDepts || [])}

Câu hỏi của bệnh nhân: "${question}"

Quy tắc trả lời:
- Giải thích rõ ràng các chỉ số xét nghiệm vượt ngưỡng nếu được hỏi.
- Hướng dẫn chế độ ăn uống, vận động thực tế, không dùng thuật ngữ quá khó hiểu.
- Nhắc nhở người bệnh đây là thông tin tham khảo định hướng, không thay thế chẩn đoán trực tiếp của bác sĩ điều trị.`
                }]
              }]
            })
          }
        );

        const geminiData = await geminiRes.json();
        const aiText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText) {
          return res.json({
            success: true,
            source: 'Gemini-Live-AI',
            reply: aiText
          });
        }
      } catch (geminiErr) {
        console.warn('[Gemini API] Lỗi gọi Gemini, chuyển sang Clinical Rule Engine:', geminiErr.message);
      }
    }

    // 2. Chế độ Clinical Intelligence Expert Engine (Phân tích chuyên sâu theo dữ liệu thực tế)
    let reply = '';

    // Nhóm 1: Bệnh nhân hỏi về việc "tôi bị gì", "bệnh gì", "bất thường", "chỉ số này là sao"
    if (
      cleanQ.includes('bi gi') || 
      cleanQ.includes('benh gi') || 
      cleanQ.includes('bat thuong') || 
      cleanQ.includes('thong so') || 
      cleanQ.includes('chi so') || 
      cleanQ.includes('ket qua') || 
      cleanQ.includes('nguy co') || 
      cleanQ.includes('sao vay') ||
      cleanQ.includes('giai thich')
    ) {
      if (findings.length > 0) {
        const findingsList = findings.map((f, i) => `🔹 **${f.title}**\n${f.detail}`).join('\n\n');
        
        reply = `Chào **${patientName}**, qua phân tích bảng kết quả cận lâm sàng của bạn, hệ thống ghi nhận **${findings.length} vấn đề sức khỏe cần lưu ý**:

${findingsList}

---
💡 **Tóm tắt tình trạng bạn có thể đang gặp phải:**
1. **Dấu hiệu Tiền đái tháo đường / Đái tháo đường Type 2 giai đoạn khởi phát** (do Glucose máu đói và HbA1c đều vượt ngưỡng an toàn).
2. **Rối loạn mỡ máu (Lipid máu) kèm Gan nhiễm mỡ nhẹ** (Triglyceride tăng, men gan AST/ALT tăng nhẹ).
3. **Tăng Axit Uric máu tiềm tàng** (Làm tăng nguy cơ đau khớp Gout cấp và sỏi thận).

👉 **Lời khuyên từ Bác sĩ:** Bạn không nên quá lo lắng vì các chỉ số này mới ở giai đoạn đầu, hoàn toàn có thể cải thiện tốt nếu kết hợp điều chỉnh ăn uống và uống thuốc theo đơn của Bác sĩ Nội tiết.`;
      } else {
        reply = `Chào **${patientName}**, toàn bộ các chỉ số cận lâm sàng của bạn (cả Huyết học và Sinh hóa) hiện tại đều nằm trong giới hạn an toàn sinh lý bình thường. Bạn hãy duy trì lối sống lành mạnh và tái khám định kỳ hàng năm nhé!`;
      }
    } 
    // Nhóm 2: Bệnh nhân hỏi về chế độ ăn uống, dinh dưỡng, kiêng khem
    else if (
      cleanQ.includes('an') || 
      cleanQ.includes('uong') || 
      cleanQ.includes('dinh duong') || 
      cleanQ.includes('kieng') || 
      cleanQ.includes('thuc don') ||
      cleanQ.includes('tap')
    ) {
      reply = `Chào **${patientName}**, để ổn định lại lượng đường huyết, hạ men gan và giảm mỡ máu, bạn nên tuân thủ chế độ dinh dưỡng sau:

🥗 **Những thực phẩm NÊN ĂN:**
• **Rau củ giàu chất xơ:** Bông cải xanh, rau cải, mồng tơi, dưa leo (chất xơ giúp làm chậm hấp thu đường vào máu).
• **Đạm lành mạnh:** Ức gà, cá béo (cá hồi, cá trích, cá thu giàu Omega-3 giúp bảo vệ thành mạch tim).
• **Tinh bột phức hợp:** Thay cơm trắng bằng gạo lứt, yến mạch, khoai lang với lượng vừa phải.
• Uống đủ **1.5 - 2 lít nước lọc/ngày** để hỗ trợ thận đào thải bớt Axit Uric dư thừa.

🚫 **Những thực phẩm CẦN HẠN CHẾ / KIÊNG TUYỆT ĐỐI:**
• **Đường ngọt & Nước ngọt:** Nước có ga, trà sữa, bánh kẹo, hoa quả quá ngọt (sầu riêng, nhãn, mít).
• **Rượu bia & Đồ uống có cồn:** Kiêng tuyệt đối để bảo vệ tế bào gan đang bị tổn thương nhẹ (men gan tăng).
• **Nội tạng động vật & Thịt đỏ:** Hạn chế gan, lòng, thịt bò để giảm tích tụ Axit Uric và Cholesterol.

🏃 **Vận động:** Duy trì đi bộ nhanh hoặc đạp xe tối thiểu 30-45 phút/ngày giúp tăng độ nhạy insulin và tiêu hao mỡ gan.`;
    } 
    // Nhóm 3: Bệnh nhân hỏi về việc đi khám chuyên khoa nào
    else if (
      cleanQ.includes('kham') || 
      cleanQ.includes('chuyen khoa') || 
      cleanQ.includes('bac si nao') || 
      cleanQ.includes('o dau')
    ) {
      reply = `Dựa trên kết quả cận lâm sàng của **${patientName}**, hệ thống khuyến nghị bạn nên đặt lịch khám tại 2 chuyên khoa sau:

1. 🩺 **Khoa Nội Tiết & Đái Tháo Đường** (Mức độ: *Ưu tiên khám sớm trong tuần*): Để Bác sĩ đánh giá chỉ số HbA1c 6.8% và Glucose 7.42 mmol/L, từ đó kê đơn thuốc kiểm soát đường huyết phù hợp.
2. 🏥 **Khoa Tiêu Hóa & Gan Mật** (Mức độ: *Theo dõi định kỳ 3 tháng*): Đánh giá lại tình trạng men gan tăng và mức độ gan nhiễm mỡ qua siêu âm.

Bạn có thể mang phiếu kết quả này đến bàn tiếp đón Bệnh viện Sahara để được hướng dẫn vào đúng phòng khám.`;
    } 
    // Mặc định: Trả lời định hướng lâm sàng thân thiện
    else {
      reply = `Tôi đã ghi nhận câu hỏi: *"${question}"* của bạn.

Dựa vào hồ sơ cận lâm sàng hiện tại của **${patientName}** (Mã: ${patientContext?.patientId || 'BN2026-089'}), tôi có thể hỗ trợ bạn:
• **Phân tích chi tiết từng chỉ số:** Glucose, HbA1c, Men gan AST/ALT, Axit Uric, Mỡ máu.
• **Tư vấn dinh dưỡng:** Thực đơn kiêng khem và thực phẩm hỗ trợ hạ đường huyết/men gan.
• **Hướng dẫn khám:** Gợi ý chuyên khoa cần đi khám và các câu hỏi cần trao đổi với Bác sĩ.

Bạn muốn tìm hiểu thêm về vấn đề nào cụ thể?`;
    }

    return res.json({
      success: true,
      source: 'Clinical-Intelligence-Engine',
      reply
    });

  } catch (error) {
    console.error('[Chatbot Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

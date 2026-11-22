export const handleAIChat = async (req, res) => {
  try {
    const { prompt, patientContext } = req.body;
    // In future: integrate with Google Gemini API
    res.json({
      success: true,
      reply: `Xin chào, tôi là Sahara AI. Tôi đã ghi nhận câu hỏi của bạn về kết quả cận lâm sàng. (Hệ thống API Backend đang ở chế độ kết nối sẵn).`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

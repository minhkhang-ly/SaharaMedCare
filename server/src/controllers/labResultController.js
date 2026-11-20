export const getLabResultByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    // In future: query database pool.query(...)
    res.json({
      success: true,
      message: `Tra cứu thành công cho mã bệnh nhân ${patientId}`,
      data: null
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateLabStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    res.json({
      success: true,
      message: `Cập nhật trạng thái phiếu ${orderId} thành ${status}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

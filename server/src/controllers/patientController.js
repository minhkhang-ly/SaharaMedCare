export const lookupPatient = async (req, res) => {
  try {
    const { patientCode, phone } = req.body;
    res.json({
      success: true,
      message: `Đã xác thực bệnh nhân ${patientCode}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

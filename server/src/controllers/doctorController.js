import pool, { isDbConnected } from '../config/db.js';
import { doctorsData } from '../models/mockData.js';

export const getAllDoctors = async (req, res) => {
  try {
    const { department } = req.query;

    if (isDbConnected && pool) {
      try {
        let sql = `SELECT * FROM doctors`;
        const params = [];
        if (department) {
          sql += ` WHERE department LIKE ?`;
          params.push(`%${department}%`);
        }
        sql += ` ORDER BY full_name ASC`;
        const [rows] = await pool.query(sql, params);
        return res.json({
          success: true,
          total: rows.length,
          source: 'MySQL',
          data: rows
        });
      } catch (err) {
        console.warn(`[getAllDoctors DB Error] ${err.message}. Using fallback.`);
      }
    }

    let list = doctorsData;
    if (department) {
      list = list.filter(d => d.department.toLowerCase().includes(department.toLowerCase()));
    }

    res.json({
      success: true,
      total: list.length,
      source: 'MockDataStore',
      data: list
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (isDbConnected && pool) {
      try {
        const [rows] = await pool.query(`SELECT * FROM doctors WHERE doctor_id = ?`, [doctorId]);
        if (rows.length > 0) {
          return res.json({ success: true, source: 'MySQL', data: rows[0] });
        }
      } catch (err) {
        console.warn(`[getDoctorById DB Error] ${err.message}. Using fallback.`);
      }
    }

    const doctor = doctorsData.find(d => d.doctorId === doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: `Không tìm thấy bác sĩ ${doctorId}` });
    }

    res.json({ success: true, source: 'MockDataStore', data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createDoctor = async (req, res) => {
  try {
    const { doctorId, fullName, title, department, clinicRoom, phone, email } = req.body;

    if (!doctorId || !fullName || !title || !department) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: doctorId, fullName, title, department.'
      });
    }

    if (isDbConnected && pool) {
      try {
        await pool.query(
          `INSERT INTO doctors (doctor_id, full_name, title, department, clinic_room, phone, email)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [doctorId, fullName, title, department, clinicRoom || null, phone || null, email || null]
        );

        return res.status(201).json({
          success: true,
          message: `Thêm mới bác sĩ ${fullName} thành công!`,
          data: { doctorId, fullName, title, department }
        });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    doctorsData.push({ doctorId, fullName, title, department, clinicRoom, phone, email });
    res.status(201).json({
      success: true,
      message: `Thêm mới bác sĩ ${fullName} thành công (MockStore)!`,
      data: { doctorId, fullName, title, department }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { fullName, title, department, clinicRoom, phone, email } = req.body;

    if (isDbConnected && pool) {
      try {
        const [result] = await pool.query(
          `UPDATE doctors 
           SET full_name = COALESCE(?, full_name),
               title = COALESCE(?, title),
               department = COALESCE(?, department),
               clinic_room = COALESCE(?, clinic_room),
               phone = COALESCE(?, phone),
               email = COALESCE(?, email)
           WHERE doctor_id = ?`,
          [fullName, title, department, clinicRoom, phone, email, doctorId]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: `Không tìm thấy bác sĩ ${doctorId}` });
        }

        return res.json({ success: true, message: `Cập nhật thông tin bác sĩ ${doctorId} thành công.` });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    const doc = doctorsData.find(d => d.doctorId === doctorId);
    if (!doc) {
      return res.status(404).json({ success: false, message: `Không tìm thấy bác sĩ ${doctorId}` });
    }

    if (fullName) doc.fullName = fullName;
    if (title) doc.title = title;
    if (department) doc.department = department;
    if (clinicRoom) doc.clinicRoom = clinicRoom;
    if (phone) doc.phone = phone;
    if (email) doc.email = email;

    res.json({
      success: true,
      message: `Cập nhật thông tin bác sĩ ${doctorId} thành công (MockStore).`,
      data: doc
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

import pool, { isDbConnected } from '../config/db.js';
import { mockPatients } from '../models/mockData.js';

/**
 * Tra cứu hồ sơ bệnh nhân theo mã bệnh nhân (patientCode) và số điện thoại (phone)
 * Phục vụ trực tiếp cho Hero Lookup của Frontend
 */
export const lookupPatient = async (req, res) => {
  try {
    const patientCode = (req.body.patientCode || req.body.patientId || '').trim();
    const phone = (req.body.phone || req.body.phoneNumber || '').trim();

    if (!patientCode) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã hồ sơ bệnh nhân (Ví dụ: BN2026-089).'
      });
    }

    if (isDbConnected && pool) {
      try {
        const [patients] = await pool.query(
          `SELECT * FROM patients WHERE patient_id = ?`,
          [patientCode]
        );

        if (!patients || patients.length === 0) {
          return res.status(404).json({
            success: false,
            message: `Không tìm thấy hồ sơ bệnh nhân với mã "${patientCode}".`
          });
        }

        const patientRow = patients[0];

        // Lấy phiếu chỉ định mới nhất của bệnh nhân
        const [orders] = await pool.query(
          `SELECT * FROM lab_orders WHERE patient_id = ? ORDER BY sampling_time DESC LIMIT 1`,
          [patientCode]
        );

        let orderRow = orders[0] || null;
        let categories = [];

        if (orderRow) {
          // Lấy kết quả chỉ số xét nghiệm
          const [results] = await pool.query(
            `SELECT r.*, c.category_code, c.category_name, c.code_prefix, c.method_note
             FROM lab_test_results r
             JOIN lab_categories c ON r.category_id = c.category_id
             WHERE r.order_id = ?
             ORDER BY c.display_order ASC, r.display_order ASC, r.result_id ASC`,
            [orderRow.order_id]
          );

          // Nhóm kết quả theo category
          const categoryMap = {};
          for (const r of results) {
            if (!categoryMap[r.category_code]) {
              categoryMap[r.category_code] = {
                id: r.category_code,
                name: r.category_name,
                code: r.code_prefix,
                note: r.method_note || '',
                results: []
              };
            }
            categoryMap[r.category_code].results.push({
              code: r.indicator_code,
              name: r.indicator_name,
              value: r.value_numeric !== null ? Number(r.value_numeric) : r.value_text,
              unit: r.unit,
              ref: r.ref_text || `${r.ref_min} - ${r.ref_max}`,
              status: r.status_flag,
              delta: r.delta_text || undefined
            });
          }

          // Lấy chẩn đoán hình ảnh
          const [images] = await pool.query(
            `SELECT * FROM lab_images WHERE order_id = ? ORDER BY created_at ASC`,
            [orderRow.order_id]
          );

          if (images.length > 0) {
            categoryMap['imaging'] = {
              id: 'imaging',
              name: 'Chẩn đoán hình ảnh (X-Quang Kỹ thuật số & Siêu âm)',
              code: 'CDHA',
              note: 'Máy X-quang Shimadzu DR và Máy siêu âm Doppler màu GE Voluson E10.',
              results: images.map(img => ({
                type: img.modality,
                title: img.title,
                performedTime: img.performed_time ? new Date(img.performed_time).toLocaleString('vi-VN') : '',
                radiologist: img.radiologist,
                imageUrl: img.image_url,
                description: img.description,
                conclusion: img.conclusion
              }))
            };
          }

          categories = Object.values(categoryMap);
        }

        const birthDate = new Date(patientRow.date_of_birth);
        const birthYear = birthDate.getFullYear();
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;

        const responseData = {
          patientId: patientRow.patient_id,
          fullName: patientRow.full_name,
          gender: patientRow.gender,
          birthYear: birthYear,
          age: age,
          phone: patientRow.phone_number,
          nationalId: patientRow.national_id,
          insuranceNumber: patientRow.health_insurance_number,
          address: patientRow.address,
          orderId: orderRow?.order_id || null,
          sampleCode: orderRow?.sample_code || null,
          barcode: orderRow?.barcode || null,
          clinicRoom: orderRow?.clinic_room || null,
          doctorName: orderRow?.doctor_name || null,
          reviewerDoctor: orderRow?.reviewer_doctor || null,
          clinicalDiagnosis: orderRow?.clinical_diagnosis || null,
          samplingTime: orderRow?.sampling_time ? new Date(orderRow.sampling_time).toLocaleString('vi-VN') : null,
          receivedLabTime: orderRow?.received_lab_time ? new Date(orderRow.received_lab_time).toLocaleString('vi-VN') : null,
          completedTime: orderRow?.completed_time ? new Date(orderRow.completed_time).toLocaleString('vi-VN') : null,
          currentStatus: orderRow?.status || 'RECEIVED',
          currentStep: orderRow?.current_step || 1,
          statusText: orderRow?.status_text || 'Đã tiếp nhận hồ sơ',
          riskSummary: typeof orderRow?.risk_summary === 'string' ? JSON.parse(orderRow.risk_summary) : (orderRow?.risk_summary || {
            overallRisk: 'normal',
            riskLabel: 'Chỉ số bình thường',
            badgeColor: 'emerald',
            abnormalCount: 0,
            totalCount: 0,
            keyFindings: [],
            recommendedDepartments: [],
            dietaryAdvice: []
          }),
          categories: categories
        };

        return res.json({
          success: true,
          message: `Tra cứu thành công cho hồ sơ ${patientCode}`,
          source: 'MySQL',
          data: responseData
        });
      } catch (dbError) {
        console.warn(`[lookupPatient DB Error] ${dbError.message}. Falling back to mock dataset.`);
      }
    }

    // Fallback: Sử dụng tập dữ liệu lâm sàng chuẩn hoá cao
    const patientData = mockPatients[patientCode];
    if (!patientData) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy hồ sơ "${patientCode}". Vui lòng thử các mã mẫu: BN2026-089, BN2026-042, BN2026-105 hoặc BN2026-118.`
      });
    }

    res.json({
      success: true,
      message: `Tra cứu thành công cho bệnh nhân ${patientData.fullName} (${patientCode})`,
      source: 'MockDataStore',
      data: patientData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Lấy danh sách tất cả bệnh nhân (hỗ trợ tìm kiếm theo tên, phone, CCCD)
 */
export const getAllPatients = async (req, res) => {
  try {
    const { q, limit = 50, page = 1 } = req.query;

    if (isDbConnected && pool) {
      try {
        let sql = `SELECT * FROM patients`;
        const params = [];

        if (q) {
          sql += ` WHERE full_name LIKE ? OR phone_number LIKE ? OR national_id LIKE ? OR patient_id LIKE ?`;
          const searchTerm = `%${q}%`;
          params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), (Number(page) - 1) * Number(limit));

        const [rows] = await pool.query(sql, params);
        return res.json({
          success: true,
          total: rows.length,
          page: Number(page),
          source: 'MySQL',
          data: rows
        });
      } catch (err) {
        console.warn(`[getAllPatients DB Error] ${err.message}. Using fallback.`);
      }
    }

    // Fallback
    let list = Object.values(mockPatients);
    if (q) {
      const qLower = q.toLowerCase();
      list = list.filter(p =>
        p.fullName.toLowerCase().includes(qLower) ||
        p.phone.includes(q) ||
        p.patientId.toLowerCase().includes(qLower) ||
        (p.nationalId && p.nationalId.includes(q))
      );
    }

    res.json({
      success: true,
      total: list.length,
      source: 'MockDataStore',
      data: list.map(p => ({
        patient_id: p.patientId,
        full_name: p.fullName,
        date_of_birth: p.dateOfBirth,
        gender: p.gender,
        phone_number: p.phone,
        national_id: p.nationalId,
        health_insurance_number: p.insuranceNumber,
        address: p.address
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Lấy chi tiết thông tin một bệnh nhân
 */
export const getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (isDbConnected && pool) {
      try {
        const [rows] = await pool.query(`SELECT * FROM patients WHERE patient_id = ?`, [patientId]);
        if (rows.length > 0) {
          return res.json({ success: true, source: 'MySQL', data: rows[0] });
        }
      } catch (err) {
        console.warn(`[getPatientById DB Error] ${err.message}. Using fallback.`);
      }
    }

    const patient = mockPatients[patientId];
    if (!patient) {
      return res.status(404).json({ success: false, message: `Không tìm thấy bệnh nhân ${patientId}` });
    }

    res.json({
      success: true,
      source: 'MockDataStore',
      data: {
        patient_id: patient.patientId,
        full_name: patient.fullName,
        date_of_birth: patient.dateOfBirth,
        gender: patient.gender,
        phone_number: patient.phone,
        national_id: patient.nationalId,
        health_insurance_number: patient.insuranceNumber,
        address: patient.address
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Tạo mới hồ sơ bệnh nhân
 */
export const createPatient = async (req, res) => {
  try {
    const {
      patientId,
      fullName,
      dateOfBirth,
      gender,
      phoneNumber,
      nationalId,
      healthInsuranceNumber,
      address
    } = req.body;

    if (!patientId || !fullName || !dateOfBirth || !gender || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ các thông tin bắt buộc: patientId, fullName, dateOfBirth, gender, phoneNumber.'
      });
    }

    if (isDbConnected && pool) {
      try {
        await pool.query(
          `INSERT INTO patients (patient_id, full_name, date_of_birth, gender, phone_number, national_id, health_insurance_number, address)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [patientId, fullName, dateOfBirth, gender, phoneNumber, nationalId || null, healthInsuranceNumber || null, address || null]
        );

        return res.status(201).json({
          success: true,
          message: `Tạo mới hồ sơ bệnh nhân ${fullName} (${patientId}) thành công!`,
          data: { patientId, fullName, dateOfBirth, gender, phoneNumber, nationalId, healthInsuranceNumber, address }
        });
      } catch (dbErr) {
        return res.status(400).json({ success: false, error: dbErr.message });
      }
    }

    // In-memory fallback
    const birthYear = new Date(dateOfBirth).getFullYear();
    const age = new Date().getFullYear() - birthYear;

    mockPatients[patientId] = {
      patientId,
      fullName,
      gender,
      birthYear,
      dateOfBirth,
      age,
      phone: phoneNumber,
      nationalId: nationalId || '',
      insuranceNumber: healthInsuranceNumber || '',
      address: address || '',
      orderId: null,
      currentStatus: 'RECEIVED',
      currentStep: 1,
      statusText: 'Hồ sơ mới tiếp nhận',
      riskSummary: {
        overallRisk: 'normal',
        riskLabel: 'Chưa có kết quả cận lâm sàng',
        badgeColor: 'blue',
        abnormalCount: 0,
        totalCount: 0,
        keyFindings: [],
        recommendedDepartments: [],
        dietaryAdvice: []
      },
      categories: []
    };

    res.status(201).json({
      success: true,
      message: `Tạo mới hồ sơ bệnh nhân ${fullName} (${patientId}) thành công (MockStore)!`,
      data: mockPatients[patientId]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Cập nhật thông tin bệnh nhân
 */
export const updatePatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { fullName, dateOfBirth, gender, phoneNumber, nationalId, healthInsuranceNumber, address } = req.body;

    if (isDbConnected && pool) {
      try {
        const [result] = await pool.query(
          `UPDATE patients 
           SET full_name = COALESCE(?, full_name),
               date_of_birth = COALESCE(?, date_of_birth),
               gender = COALESCE(?, gender),
               phone_number = COALESCE(?, phone_number),
               national_id = COALESCE(?, national_id),
               health_insurance_number = COALESCE(?, health_insurance_number),
               address = COALESCE(?, address)
           WHERE patient_id = ?`,
          [fullName, dateOfBirth, gender, phoneNumber, nationalId, healthInsuranceNumber, address, patientId]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: `Không tìm thấy bệnh nhân ${patientId}` });
        }

        return res.json({
          success: true,
          message: `Cập nhật hồ sơ bệnh nhân ${patientId} thành công.`
        });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    if (!mockPatients[patientId]) {
      return res.status(404).json({ success: false, message: `Không tìm thấy bệnh nhân ${patientId}` });
    }

    if (fullName) mockPatients[patientId].fullName = fullName;
    if (phoneNumber) mockPatients[patientId].phone = phoneNumber;
    if (address) mockPatients[patientId].address = address;
    if (gender) mockPatients[patientId].gender = gender;
    if (dateOfBirth) {
      mockPatients[patientId].dateOfBirth = dateOfBirth;
      mockPatients[patientId].birthYear = new Date(dateOfBirth).getFullYear();
    }

    res.json({
      success: true,
      message: `Cập nhật hồ sơ bệnh nhân ${patientId} thành công (MockStore).`,
      data: mockPatients[patientId]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Xóa hồ sơ bệnh nhân
 */
export const deletePatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (isDbConnected && pool) {
      try {
        const [result] = await pool.query(`DELETE FROM patients WHERE patient_id = ?`, [patientId]);
        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: `Không tìm thấy bệnh nhân ${patientId}` });
        }
        return res.json({ success: true, message: `Đã xóa bệnh nhân ${patientId} thành công.` });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    if (!mockPatients[patientId]) {
      return res.status(404).json({ success: false, message: `Không tìm thấy bệnh nhân ${patientId}` });
    }

    delete mockPatients[patientId];
    res.json({ success: true, message: `Đã xóa bệnh nhân ${patientId} thành công (MockStore).` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

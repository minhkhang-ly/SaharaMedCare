import pool, { isDbConnected } from '../config/db.js';
import { mockPatients } from '../models/mockData.js';
import { io } from '../server.js';
import { broadcastOrderStatus } from '../sockets/labStatusSocket.js';

/**
 * Tra cứu toàn bộ kết quả cận lâm sàng của bệnh nhân theo patientId
 * Trả về định dạng chuẩn để Frontend render Range Bar, Stepper, DICOM viewer, Risk Summary
 */
export const getLabResultByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Thiếu mã bệnh nhân (patientId)' });
    }

    if (isDbConnected && pool) {
      try {
        const [patients] = await pool.query(
          `SELECT * FROM patients WHERE patient_id = ?`,
          [patientId]
        );

        if (!patients || patients.length === 0) {
          return res.status(404).json({
            success: false,
            message: `Không tìm thấy hồ sơ bệnh nhân "${patientId}".`
          });
        }

        const patientRow = patients[0];

        // Lấy phiếu chỉ định mới nhất
        const [orders] = await pool.query(
          `SELECT * FROM lab_orders WHERE patient_id = ? ORDER BY sampling_time DESC LIMIT 1`,
          [patientId]
        );

        let orderRow = orders[0] || null;
        let categories = [];

        if (orderRow) {
          // Lấy kết quả chỉ số
          const [results] = await pool.query(
            `SELECT r.*, c.category_code, c.category_name, c.code_prefix, c.method_note
             FROM lab_test_results r
             JOIN lab_categories c ON r.category_id = c.category_id
             WHERE r.order_id = ?
             ORDER BY c.display_order ASC, r.display_order ASC, r.result_id ASC`,
            [orderRow.order_id]
          );

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

          // Lấy hình ảnh CĐHA
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
          message: `Tra cứu kết quả cận lâm sàng thành công cho ${patientId}`,
          source: 'MySQL',
          data: responseData
        });
      } catch (err) {
        console.warn(`[getLabResultByPatient DB Error] ${err.message}. Using fallback.`);
      }
    }

    const patient = mockPatients[patientId];
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy kết quả cận lâm sàng cho mã "${patientId}". Vui lòng thử BN2026-089, BN2026-042 hoặc BN2026-105.`
      });
    }

    res.json({
      success: true,
      message: `Tra cứu kết quả cận lâm sàng thành công cho ${patientId}`,
      source: 'MockDataStore',
      data: patient
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Lấy danh sách tất cả phiếu chỉ định cận lâm sàng
 */
export const getAllOrders = async (req, res) => {
  try {
    const { status, patientId, limit = 50, page = 1 } = req.query;

    if (isDbConnected && pool) {
      try {
        let sql = `SELECT o.*, p.full_name as patient_name, p.gender, p.phone_number
                   FROM lab_orders o
                   JOIN patients p ON o.patient_id = p.patient_id`;
        const conditions = [];
        const params = [];

        if (status) {
          conditions.push(`o.status = ?`);
          params.push(status);
        }
        if (patientId) {
          conditions.push(`o.patient_id = ?`);
          params.push(patientId);
        }

        if (conditions.length > 0) {
          sql += ` WHERE ` + conditions.join(' AND ');
        }

        sql += ` ORDER BY o.sampling_time DESC LIMIT ? OFFSET ?`;
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
        console.warn(`[getAllOrders DB Error] ${err.message}. Using fallback.`);
      }
    }

    // Fallback
    const orders = Object.values(mockPatients)
      .filter(p => p.orderId)
      .map(p => ({
        order_id: p.orderId,
        patient_id: p.patientId,
        patient_name: p.fullName,
        gender: p.gender,
        phone_number: p.phone,
        sample_code: p.sampleCode,
        barcode: p.barcode,
        doctor_name: p.doctorName,
        clinic_room: p.clinicRoom,
        clinical_diagnosis: p.clinicalDiagnosis,
        status: p.currentStatus,
        current_step: p.currentStep,
        status_text: p.statusText,
        sampling_time: p.samplingTime,
        completed_time: p.completedTime
      }));

    let filtered = orders;
    if (status) filtered = filtered.filter(o => o.status === status);
    if (patientId) filtered = filtered.filter(o => o.patient_id === patientId);

    res.json({
      success: true,
      total: filtered.length,
      source: 'MockDataStore',
      data: filtered
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Lấy chi tiết một phiếu chỉ định theo orderId
 */
export const getLabResultByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (isDbConnected && pool) {
      try {
        const [orders] = await pool.query(
          `SELECT o.*, p.full_name as patient_name, p.gender, p.date_of_birth, p.phone_number, p.health_insurance_number
           FROM lab_orders o
           JOIN patients p ON o.patient_id = p.patient_id
           WHERE o.order_id = ?`,
          [orderId]
        );

        if (orders.length === 0) {
          return res.status(404).json({ success: false, message: `Không tìm thấy phiếu chỉ định ${orderId}` });
        }

        const [results] = await pool.query(
          `SELECT r.*, c.category_name, c.category_code
           FROM lab_test_results r
           JOIN lab_categories c ON r.category_id = c.category_id
           WHERE r.order_id = ?
           ORDER BY c.display_order ASC, r.display_order ASC`,
          [orderId]
        );

        const [images] = await pool.query(
          `SELECT * FROM lab_images WHERE order_id = ?`,
          [orderId]
        );

        return res.json({
          success: true,
          source: 'MySQL',
          data: {
            order: orders[0],
            results,
            images
          }
        });
      } catch (err) {
        console.warn(`[getLabResultByOrder DB Error] ${err.message}. Using fallback.`);
      }
    }

    const patient = Object.values(mockPatients).find(p => p.orderId === orderId);
    if (!patient) {
      return res.status(404).json({ success: false, message: `Không tìm thấy phiếu chỉ định ${orderId}` });
    }

    res.json({
      success: true,
      source: 'MockDataStore',
      data: {
        order: {
          order_id: patient.orderId,
          patient_id: patient.patientId,
          patient_name: patient.fullName,
          doctor_name: patient.doctorName,
          status: patient.currentStatus,
          current_step: patient.currentStep,
          status_text: patient.statusText,
          sampling_time: patient.samplingTime,
          completed_time: patient.completedTime
        },
        categories: patient.categories,
        riskSummary: patient.riskSummary
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Tạo mới phiếu chỉ định cận lâm sàng (Lab Order)
 */
export const createLabOrder = async (req, res) => {
  try {
    const {
      orderId,
      patientId,
      sampleCode,
      barcode,
      doctorName,
      orderingDoctorId,
      clinicRoom,
      department,
      clinicalDiagnosis,
      samplingTime
    } = req.body;

    if (!orderId || !patientId || !doctorName || !department || !clinicalDiagnosis) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: orderId, patientId, doctorName, department, clinicalDiagnosis.'
      });
    }

    const sTime = samplingTime || new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (isDbConnected && pool) {
      try {
        await pool.query(
          `INSERT INTO lab_orders (order_id, patient_id, sample_code, barcode, doctor_name, ordering_doctor_id, clinic_room, department, clinical_diagnosis, status, current_step, status_text, sampling_time)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'RECEIVED', 1, 'Đã tiếp nhận mẫu tại phòng Lab', ?)`,
          [orderId, patientId, sampleCode || `MAU-${Date.now().toString().slice(-6)}`, barcode || `${patientId}CLS`, doctorName, orderingDoctorId || null, clinicRoom || null, department, clinicalDiagnosis, sTime]
        );

        return res.status(201).json({
          success: true,
          message: `Tạo mới phiếu chỉ định ${orderId} thành công!`,
          data: { orderId, patientId, doctorName, status: 'RECEIVED', currentStep: 1 }
        });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    // Fallback store
    if (mockPatients[patientId]) {
      mockPatients[patientId].orderId = orderId;
      mockPatients[patientId].currentStatus = 'RECEIVED';
      mockPatients[patientId].currentStep = 1;
      mockPatients[patientId].statusText = 'Đã tiếp nhận mẫu tại phòng Lab';
      mockPatients[patientId].doctorName = doctorName;
      mockPatients[patientId].clinicalDiagnosis = clinicalDiagnosis;
    }

    res.status(201).json({
      success: true,
      message: `Tạo mới phiếu chỉ định ${orderId} thành công (MockStore)!`,
      data: { orderId, patientId, doctorName, status: 'RECEIVED', currentStep: 1 }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Cập nhật trạng thái xử lý của mẫu cận lâm sàng
 * Tích hợp sẵn sàng cho Realtime Socket.IO
 */
export const updateLabStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, step, statusText, completedTime, approvedBy } = req.body;

    const validStatuses = ['RECEIVED', 'PROCESSING', 'COMPLETED', 'DOCTOR_SIGNED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái không hợp lệ. Cho phép: ${validStatuses.join(', ')}`
      });
    }

    const calculatedStep = step || (status === 'RECEIVED' ? 1 : status === 'PROCESSING' ? 2 : 3);
    const calculatedText = statusText || (
      status === 'RECEIVED' ? 'Đã lấy mẫu và chuyển về Lab' :
      status === 'PROCESSING' ? 'Đang phân tích mẫu tại phòng Lab trung tâm' :
      'Đã có kết quả & Bác sĩ hoàn tất duyệt ký số'
    );

    if (isDbConnected && pool) {
      try {
        const [result] = await pool.query(
          `UPDATE lab_orders 
           SET status = COALESCE(?, status),
               current_step = COALESCE(?, current_step),
               status_text = COALESCE(?, status_text),
               completed_time = COALESCE(?, completed_time),
               reviewer_doctor = COALESCE(?, reviewer_doctor)
           WHERE order_id = ?`,
          [status, calculatedStep, calculatedText, completedTime || null, approvedBy || null, orderId]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: `Không tìm thấy phiếu chỉ định ${orderId}` });
        }
      } catch (err) {
        console.warn(`[updateLabStatus DB Error] ${err.message}. Using fallback.`);
      }
    }

    // Update fallback memory store if present
    for (const key of Object.keys(mockPatients)) {
      if (mockPatients[key].orderId === orderId) {
        if (status) mockPatients[key].currentStatus = status;
        mockPatients[key].currentStep = calculatedStep;
        mockPatients[key].statusText = calculatedText;
        if (completedTime) mockPatients[key].completedTime = completedTime;
        if (approvedBy) mockPatients[key].reviewerDoctor = approvedBy;
        break;
      }
    }

    // Phát sóng sự kiện Realtime Socket.IO nếu có io instance
    try {
      if (io) {
        broadcastOrderStatus(io, orderId, {
          orderId,
          status: status || 'PROCESSING',
          step: calculatedStep,
          statusText: calculatedText,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (socketErr) {
      console.warn(`[Socket.IO Broadcast Warning] ${socketErr.message}`);
    }

    res.json({
      success: true,
      message: `Cập nhật trạng thái phiếu ${orderId} thành "${status}" thành công!`,
      data: {
        orderId,
        status,
        step: calculatedStep,
        statusText: calculatedText
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Thêm hoặc cập nhật hàng loạt kết quả chỉ số xét nghiệm (Batch Insert Lab Test Results)
 */
export const addTestResults = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { results } = req.body; // Array of { categoryId, indicatorCode, indicatorName, valueNumeric, valueText, unit, refMin, refMax, refText, statusFlag, deltaText, note }

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách chỉ số xét nghiệm dạng mảng (results).'
      });
    }

    if (isDbConnected && pool) {
      try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        for (const item of results) {
          await connection.query(
            `INSERT INTO lab_test_results 
             (order_id, category_id, indicator_code, indicator_name, value_numeric, value_text, unit, ref_min, ref_max, ref_text, status_flag, delta_text, note)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              orderId,
              item.categoryId || 1,
              item.indicatorCode,
              item.indicatorName,
              item.valueNumeric || null,
              item.valueText || null,
              item.unit || '',
              item.refMin || null,
              item.refMax || null,
              item.refText || '',
              item.statusFlag || 'NORMAL',
              item.deltaText || null,
              item.note || null
            ]
          );
        }

        await connection.commit();
        connection.release();

        return res.status(201).json({
          success: true,
          message: `Đã lưu thành công ${results.length} chỉ số xét nghiệm cho phiếu ${orderId}!`
        });
      } catch (dbErr) {
        return res.status(500).json({ success: false, error: dbErr.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Đã tiếp nhận ${results.length} chỉ số xét nghiệm cho phiếu ${orderId} (MockStore)!`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Thêm kết quả chẩn đoán hình ảnh (X-quang, Siêu âm)
 */
export const addImagingResult = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { modality, title, performedTime, radiologist, imageUrl, description, conclusion } = req.body;

    if (!orderId || !modality || !title || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: modality, title, imageUrl.'
      });
    }

    if (isDbConnected && pool) {
      try {
        await pool.query(
          `INSERT INTO lab_images (order_id, modality, title, performed_time, radiologist, image_url, description, conclusion)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderId, modality, title, performedTime || new Date(), radiologist || 'Bác sĩ CĐHA', imageUrl, description || '', conclusion || '']
        );

        return res.status(201).json({
          success: true,
          message: `Thêm kết quả hình ảnh ${title} cho phiếu ${orderId} thành công!`
        });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Thêm kết quả hình ảnh ${title} cho phiếu ${orderId} thành công (MockStore)!`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

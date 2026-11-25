import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool, { isDbConnected } from '../config/db.js';
import { mockPatients, doctorsData, usersData } from '../models/mockData.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sahara_medcare_secret_token_2026';

/**
 * Đăng ký tài khoản Bệnh nhân
 * Endpoint: POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const {
      role = 'PATIENT',
      fullName,
      phoneNumber,
      dateOfBirth,
      gender,
      nationalId,
      healthInsuranceNumber,
      address,
      password
    } = req.body;

    if (role !== 'PATIENT') {
      return res.status(400).json({
        success: false,
        message: 'Hệ thống chỉ hỗ trợ đăng ký trực tuyến cho tài khoản Bệnh nhân.'
      });
    }

    if (!fullName || !phoneNumber || !password || !dateOfBirth || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: họ và tên, số điện thoại, mật khẩu, ngày sinh, giới tính.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải chứa ít nhất 6 ký tự.'
      });
    }

    const cleanPhone = phoneNumber.trim();

    if (isDbConnected && pool) {
      try {
        // Kiểm tra xem số điện thoại đã đăng ký tài khoản chưa
        const [existingUsers] = await pool.query(
          `SELECT * FROM users WHERE identifier = ? AND role = 'PATIENT'`,
          [cleanPhone]
        );

        if (existingUsers.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Số điện thoại này đã được đăng ký tài khoản.'
          });
        }

        // Kiểm tra xem bệnh nhân đã từng có hồ sơ chưa, nếu chưa thì tạo mới
        let patientId = null;
        const [existingPatients] = await pool.query(
          `SELECT * FROM patients WHERE phone_number = ? LIMIT 1`,
          [cleanPhone]
        );

        if (existingPatients.length > 0) {
          patientId = existingPatients[0].patient_id;
        } else {
          // Tạo mã bệnh nhân mới dạng BN2026-xxx
          const randomSuffix = Math.floor(200 + Math.random() * 800);
          patientId = `BN2026-${randomSuffix}`;

          await pool.query(
            `INSERT INTO patients (patient_id, full_name, date_of_birth, gender, phone_number, national_id, health_insurance_number, address)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              patientId,
              fullName.trim(),
              dateOfBirth,
              gender,
              cleanPhone,
              nationalId?.trim() || null,
              healthInsuranceNumber?.trim() || null,
              address?.trim() || null
            ]
          );
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [insertUser] = await pool.query(
          `INSERT INTO users (role, identifier, password_hash, patient_id)
           VALUES ('PATIENT', ?, ?, ?)`,
          [cleanPhone, passwordHash, patientId]
        );

        const userId = insertUser.insertId;

        const token = jwt.sign(
          {
            userId,
            role: 'PATIENT',
            patientId,
            identifier: cleanPhone
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return res.status(201).json({
          success: true,
          message: 'Đăng ký tài khoản Bệnh nhân thành công!',
          token,
          user: {
            userId,
            role: 'PATIENT',
            patientId,
            fullName: fullName.trim(),
            phoneNumber: cleanPhone,
            dateOfBirth,
            gender,
            address: address?.trim() || null
          }
        });
      } catch (dbErr) {
        console.warn(`[register DB Error] ${dbErr.message}. Falling back.`);
      }
    }

    // Fallback MockStore Mode
    const existing = usersData.find(u => u.identifier === cleanPhone && u.role === 'PATIENT');
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Số điện thoại này đã được đăng ký tài khoản.'
      });
    }

    const randomSuffix = Math.floor(200 + Math.random() * 800);
    const patientId = `BN2026-${randomSuffix}`;
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = Date.now();

    usersData.push({
      userId,
      role: 'PATIENT',
      identifier: cleanPhone,
      passwordHash,
      patientId,
      doctorId: null
    });

    mockPatients[patientId] = {
      patientId,
      fullName: fullName.trim(),
      gender,
      birthYear: new Date(dateOfBirth).getFullYear(),
      dateOfBirth,
      age: new Date().getFullYear() - new Date(dateOfBirth).getFullYear(),
      phone: cleanPhone,
      nationalId: nationalId?.trim() || '',
      insuranceNumber: healthInsuranceNumber?.trim() || '',
      address: address?.trim() || '',
      orderId: null,
      currentStatus: 'RECEIVED',
      currentStep: 1,
      statusText: 'Hồ sơ mới đăng ký',
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

    const token = jwt.sign(
      {
        userId,
        role: 'PATIENT',
        patientId,
        identifier: cleanPhone
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản Bệnh nhân thành công (MockStore)!',
      token,
      user: {
        userId,
        role: 'PATIENT',
        patientId,
        fullName: fullName.trim(),
        phoneNumber: cleanPhone,
        dateOfBirth,
        gender,
        address: address?.trim() || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Đăng nhập cho cả Bệnh nhân (SĐT) và Bác sĩ (Mã BS hoặc Email)
 * Endpoint: POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { role = 'PATIENT', identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.'
      });
    }

    const cleanIdentifier = identifier.trim();
    const cleanRole = role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT';

    if (isDbConnected && pool) {
      try {
        let sql = '';
        let params = [];

        if (cleanRole === 'PATIENT') {
          sql = `
            SELECT u.*, p.full_name, p.phone_number, p.date_of_birth, p.gender, p.address
            FROM users u
            LEFT JOIN patients p ON u.patient_id = p.patient_id
            WHERE u.role = 'PATIENT' AND (u.identifier = ? OR p.phone_number = ? OR u.patient_id = ?)
            LIMIT 1
          `;
          params = [cleanIdentifier, cleanIdentifier, cleanIdentifier];
        } else {
          sql = `
            SELECT u.*, d.full_name, d.phone as phone_number, d.email, d.department, d.title, d.clinic_room
            FROM users u
            LEFT JOIN doctors d ON u.doctor_id = d.doctor_id
            WHERE u.role = 'DOCTOR' AND (u.identifier = ? OR d.doctor_id = ? OR d.email = ? OR d.phone = ?)
            LIMIT 1
          `;
          params = [cleanIdentifier, cleanIdentifier, cleanIdentifier, cleanIdentifier];
        }

        const [rows] = await pool.query(sql, params);

        if (rows.length === 0) {
          return res.status(401).json({
            success: false,
            message: 'Thông tin đăng nhập không chính xác.'
          });
        }

        const userRow = rows[0];

        // So khớp mật khẩu đã hash
        let isMatch = await bcrypt.compare(password, userRow.password_hash);
        if (!isMatch && password === '123456') {
          isMatch = true; // Hỗ trợ mật khẩu demo 123456
        }

        if (!isMatch) {
          return res.status(401).json({
            success: false,
            message: 'Thông tin đăng nhập không chính xác.'
          });
        }

        const token = jwt.sign(
          {
            userId: userRow.user_id,
            role: userRow.role,
            patientId: userRow.patient_id || undefined,
            doctorId: userRow.doctor_id || undefined,
            identifier: userRow.identifier
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return res.json({
          success: true,
          message: 'Đăng nhập thành công!',
          token,
          user: {
            userId: userRow.user_id,
            role: userRow.role,
            patientId: userRow.patient_id || undefined,
            doctorId: userRow.doctor_id || undefined,
            fullName: userRow.full_name || (cleanRole === 'DOCTOR' ? 'Bác sĩ Sahara' : 'Bệnh nhân Sahara'),
            phoneNumber: userRow.phone_number || userRow.identifier,
            email: userRow.email || undefined,
            department: userRow.department || undefined,
            title: userRow.title || undefined
          }
        });
      } catch (dbErr) {
        console.warn(`[login DB Error] ${dbErr.message}. Falling back.`);
      }
    }

    // Fallback MockStore Mode
    const idLower = cleanIdentifier.toLowerCase();
    let matchedUser = usersData.find(u => {
      if (u.role !== cleanRole) return false;
      return (
        u.identifier.toLowerCase() === idLower ||
        (u.patientId && u.patientId.toLowerCase() === idLower) ||
        (u.doctorId && u.doctorId.toLowerCase() === idLower)
      );
    });

    if (!matchedUser) {
      if (cleanRole === 'DOCTOR') {
        const doc = doctorsData.find(d =>
          d.doctorId.toLowerCase() === idLower ||
          d.email?.toLowerCase() === idLower ||
          d.phone === cleanIdentifier
        );
        if (doc) {
          matchedUser = {
            userId: 101,
            role: 'DOCTOR',
            identifier: cleanIdentifier,
            passwordHash: '$2b$10$jZXr.9Uz1n8V2hZniVkueuXcSOB0fEwiI538gK9.zVCXaWaVFUqVm',
            doctorId: doc.doctorId
          };
        }
      } else {
        const p = mockPatients[cleanIdentifier] || Object.values(mockPatients).find(pat => pat.phone === cleanIdentifier);
        if (p) {
          matchedUser = {
            userId: 1,
            role: 'PATIENT',
            identifier: p.phone,
            passwordHash: '$2b$10$jZXr.9Uz1n8V2hZniVkueuXcSOB0fEwiI538gK9.zVCXaWaVFUqVm',
            patientId: p.patientId
          };
        }
      }
    }

    if (!matchedUser) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không chính xác.'
      });
    }

    let isMatch = await bcrypt.compare(password, matchedUser.passwordHash);
    if (!isMatch && password === '123456') {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không chính xác.'
      });
    }

    let fullInfo = {};
    if (cleanRole === 'PATIENT') {
      const p = mockPatients[matchedUser.patientId] || {};
      fullInfo = {
        fullName: p.fullName || 'Bệnh nhân Sahara',
        phoneNumber: p.phone || matchedUser.identifier,
        patientId: matchedUser.patientId
      };
    } else {
      const d = doctorsData.find(doc => doc.doctorId === matchedUser.doctorId) || {};
      fullInfo = {
        fullName: d.fullName || 'TS. BS. Trần Minh Quân',
        phoneNumber: d.phone || '0901234567',
        email: d.email || 'minhquan@saharamedcare.vn',
        department: d.department || 'Khoa Xét nghiệm',
        title: d.title || 'TS. BS',
        doctorId: matchedUser.doctorId || 'BS-001'
      };
    }

    const token = jwt.sign(
      {
        userId: matchedUser.userId,
        role: cleanRole,
        patientId: matchedUser.patientId || undefined,
        doctorId: matchedUser.doctorId || undefined,
        identifier: matchedUser.identifier
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công (MockStore)!',
      token,
      user: {
        userId: matchedUser.userId,
        role: cleanRole,
        ...fullInfo
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Lấy thông tin phiên đăng nhập hiện tại
 * Endpoint: GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const { userId, role, patientId, doctorId, identifier } = req.user;

    if (isDbConnected && pool) {
      try {
        if (role === 'DOCTOR') {
          const [docs] = await pool.query(
            `SELECT d.* FROM doctors d WHERE d.doctor_id = ?`,
            [doctorId]
          );
          if (docs.length > 0) {
            const d = docs[0];
            return res.json({
              success: true,
              user: {
                userId,
                role,
                doctorId: d.doctor_id,
                fullName: d.full_name,
                title: d.title,
                department: d.department,
                phone: d.phone,
                email: d.email
              }
            });
          }
        } else {
          const [pats] = await pool.query(
            `SELECT p.* FROM patients p WHERE p.patient_id = ?`,
            [patientId]
          );
          if (pats.length > 0) {
            const p = pats[0];
            return res.json({
              success: true,
              user: {
                userId,
                role,
                patientId: p.patient_id,
                fullName: p.full_name,
                dateOfBirth: p.date_of_birth,
                gender: p.gender,
                phoneNumber: p.phone_number,
                insuranceNumber: p.health_insurance_number,
                address: p.address
              }
            });
          }
        }
      } catch (err) {
        console.warn(`[getMe DB Error] ${err.message}. Falling back.`);
      }
    }

    let userDetail = { userId, role, identifier };
    if (role === 'DOCTOR') {
      const d = doctorsData.find(doc => doc.doctorId === doctorId) || {};
      userDetail = {
        ...userDetail,
        doctorId: doctorId || 'BS-001',
        fullName: d.fullName || 'TS. BS. Trần Minh Quân',
        title: d.title || 'TS. BS',
        department: d.department || 'Khoa Xét nghiệm',
        email: d.email || 'minhquan@saharamedcare.vn'
      };
    } else {
      const p = mockPatients[patientId] || {};
      userDetail = {
        ...userDetail,
        patientId,
        fullName: p.fullName || 'Bệnh nhân Sahara',
        phoneNumber: p.phone || identifier,
        gender: p.gender,
        birthYear: p.birthYear
      };
    }

    res.json({ success: true, user: userDetail });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

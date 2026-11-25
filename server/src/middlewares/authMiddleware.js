import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'sahara_medcare_secret_token_2026';

/**
 * Middleware xác thực JWT Token từ Header Authorization: Bearer <token>
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập để tiếp tục thực hiện chức năng này.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
      error: error.message
    });
  }
}

/**
 * Chặn quyền đối với các API chỉ cho phép Bác sĩ hoặc Quản trị viên
 */
export function requireDoctor(req, res, next) {
  if (!req.user || (req.user.role !== 'DOCTOR' && req.user.role !== 'ADMIN')) {
    return res.status(403).json({
      success: false,
      message: 'Chức năng này chỉ dành cho Bác sĩ / Kỹ thuật viên xét nghiệm.'
    });
  }
  next();
}

/**
 * Chặn quyền đối với các API chỉ cho phép Bệnh nhân
 */
export function requirePatient(req, res, next) {
  if (!req.user || (req.user.role !== 'PATIENT' && req.user.role !== 'ADMIN')) {
    return res.status(403).json({
      success: false,
      message: 'Chức năng này chỉ dành cho Bệnh nhân.'
    });
  }
  next();
}

/**
 * Middleware đọc token nếu có (không bắt buộc)
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      // bỏ qua lỗi nếu token không hợp lệ ở optional
    }
  }
  next();
}

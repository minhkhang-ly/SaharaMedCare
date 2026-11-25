import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Đăng ký Bệnh nhân
router.post('/register', register);

// Đăng nhập Bệnh nhân & Bác sĩ
router.post('/login', login);

// Kiểm tra token & Lấy thông tin user hiện tại
router.get('/me', verifyToken, getMe);

export default router;

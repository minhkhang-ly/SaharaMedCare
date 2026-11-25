import { Router } from 'express';
import {
  getLabResultByPatient,
  getLabResultByOrder,
  getAllOrders,
  createLabOrder,
  updateLabStatus,
  addTestResults,
  addImagingResult
} from '../controllers/labResultController.js';
import { verifyToken, requireDoctor } from '../middlewares/authMiddleware.js';

const router = Router();

// Tra cứu phiếu và kết quả
router.get('/orders', getAllOrders);
router.get('/orders/:orderId', getLabResultByOrder);
router.post('/orders', verifyToken, requireDoctor, createLabOrder);
router.patch('/orders/:orderId/status', verifyToken, requireDoctor, updateLabStatus);
router.post('/orders/:orderId/results', verifyToken, requireDoctor, addTestResults);
router.post('/orders/:orderId/images', verifyToken, requireDoctor, addImagingResult);

// Tra cứu kết quả theo bệnh nhân (cả 2 đường dẫn chuẩn - Công khai)
router.get('/patient/:patientId', getLabResultByPatient);
router.get('/:patientId', getLabResultByPatient);

export default router;

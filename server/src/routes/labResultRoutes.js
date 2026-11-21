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

const router = Router();

// Tra cứu phiếu và kết quả
router.get('/orders', getAllOrders);
router.get('/orders/:orderId', getLabResultByOrder);
router.post('/orders', createLabOrder);
router.patch('/orders/:orderId/status', updateLabStatus);
router.post('/orders/:orderId/results', addTestResults);
router.post('/orders/:orderId/images', addImagingResult);

// Tra cứu kết quả theo bệnh nhân (cả 2 đường dẫn chuẩn)
router.get('/patient/:patientId', getLabResultByPatient);
router.get('/:patientId', getLabResultByPatient);

export default router;

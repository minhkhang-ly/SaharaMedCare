import { Router } from 'express';
import {
  lookupPatient,
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} from '../controllers/patientController.js';
import { verifyToken, requireDoctor } from '../middlewares/authMiddleware.js';

const router = Router();

// Tra cứu hồ sơ (Lookup - Công khai)
router.post('/lookup', lookupPatient);

// Quản lý bệnh nhân
router.get('/', getAllPatients);
router.get('/:patientId', getPatientById);
router.post('/', verifyToken, requireDoctor, createPatient);
router.put('/:patientId', verifyToken, requireDoctor, updatePatient);
router.delete('/:patientId', verifyToken, requireDoctor, deletePatient);

export default router;

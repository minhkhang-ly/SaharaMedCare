import { Router } from 'express';
import {
  lookupPatient,
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} from '../controllers/patientController.js';

const router = Router();

// Tra cứu hồ sơ (Lookup)
router.post('/lookup', lookupPatient);

// Quản lý bệnh nhân CRUD
router.get('/', getAllPatients);
router.get('/:patientId', getPatientById);
router.post('/', createPatient);
router.put('/:patientId', updatePatient);
router.delete('/:patientId', deletePatient);

export default router;

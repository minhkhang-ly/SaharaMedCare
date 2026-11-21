import { Router } from 'express';
import {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor
} from '../controllers/doctorController.js';

const router = Router();

router.get('/', getAllDoctors);
router.get('/:doctorId', getDoctorById);
router.post('/', createDoctor);
router.put('/:doctorId', updateDoctor);

export default router;

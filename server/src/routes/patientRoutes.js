import { Router } from 'express';
import { lookupPatient } from '../controllers/patientController.js';

const router = Router();

router.post('/lookup', lookupPatient);

export default router;

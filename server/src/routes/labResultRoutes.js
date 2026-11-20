import { Router } from 'express';
import { getLabResultByPatient, updateLabStatus } from '../controllers/labResultController.js';

const router = Router();

router.get('/:patientId', getLabResultByPatient);
router.patch('/:orderId/status', updateLabStatus);

export default router;

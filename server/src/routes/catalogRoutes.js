import { Router } from 'express';
import {
  getTestCatalog,
  getCategories,
  getSampleGuidelines
} from '../controllers/catalogController.js';

const router = Router();

router.get('/tests', getTestCatalog);
router.get('/categories', getCategories);
router.get('/guidelines', getSampleGuidelines);

export default router;

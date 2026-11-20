import { Router } from 'express';
import { handleAIChat } from '../controllers/chatbotController.js';

const router = Router();

router.post('/chat', handleAIChat);

export default router;

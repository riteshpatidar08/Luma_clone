import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import { chat, chatStream, getChatHistory, clearChatHistory } from '../controller/chat.controller.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', chat);
router.post('/stream', chatStream);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

export default router;

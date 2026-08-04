import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import { listNotifications, markAsRead, markAllAsRead } from '../controller/notification.controller.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', listNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

export default router;

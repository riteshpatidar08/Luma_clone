import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import { getMe, updateMe, toggleSaveEvent, getSavedEvents } from '../controller/user.controller.js';

const router = express.Router();

router.use(verifyToken);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.get('/me/saved', getSavedEvents);
router.post('/me/saved/:eventId', toggleSaveEvent);

export default router;

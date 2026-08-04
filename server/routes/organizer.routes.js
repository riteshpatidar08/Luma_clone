import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import checkRole from '../middleware/checkRole.js';
import { getOverview, listMyEvents } from '../controller/organizer.controller.js';

const router = express.Router();

router.use(verifyToken, checkRole(['organizer', 'admin']));

router.get('/overview', getOverview);
router.get('/events', listMyEvents);

export default router;

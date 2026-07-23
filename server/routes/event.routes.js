import express from 'express';
import {
  createEvent,
  getEvents,
  getEventsById,
} from '../controller/event.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import checkRole from '../middleware/checkRole.js';
import upload from '../middleware/uploads.js';
const router = express.Router();

router.post(
  '/events',
  // verifyToken,
  // checkRole(['organizer']),
  upload.single('bannerUrl'),
  createEvent
);
router.get('/events', getEvents);
router.get('/events/:id', getEventsById);
export default router;

import express from 'express';
import {
  bookEvent,
  chat,
  createEvent,
  getEvents,
  getEventsById,
  updateEventStatus,
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

router.post('/bookevent/:id', bookEvent);
router.get('/events', getEvents);
router.patch('/events/:id/status' , updateEventStatus)
router.get('/events/:id', getEventsById);
router.post('/chat' , chat)

export default router;

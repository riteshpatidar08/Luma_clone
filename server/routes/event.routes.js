import express from 'express';
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  discoverEvents,
  getEventsById,
  updateEventStatus,
} from '../controller/event.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import checkRole from '../middleware/checkRole.js';
import upload from '../middleware/uploads.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/discover', discoverEvents);
router.get('/:id', getEventsById);

router.post('/', verifyToken, upload.single('bannerUrl'), createEvent);
router.patch('/:id', verifyToken, upload.single('bannerUrl'), updateEvent);
router.delete('/:id', verifyToken, deleteEvent);

router.patch('/:id/status', verifyToken, checkRole(['admin']), updateEventStatus);

export default router;

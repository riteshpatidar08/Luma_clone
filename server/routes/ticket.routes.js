import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import {
  checkout,
  pay,
  myTickets,
  eventAttendees,
  approveTicket,
  rejectTicket,
  cancelTicket,
  checkInTicket,
  getTicketQr,
} from '../controller/ticket.controller.js';

const router = express.Router();

router.use(verifyToken);

router.post('/checkout/:eventId', checkout);
router.post('/:id/pay', pay);
router.get('/mine', myTickets);
router.get('/:id/qr-code', getTicketQr);
router.delete('/:id', cancelTicket);

// Organizer/admin actions (ownership checked inside the controllers)
router.get('/event/:eventId', eventAttendees);
router.patch('/:id/approve', approveTicket);
router.patch('/:id/reject', rejectTicket);
router.post('/checkin', checkInTicket);

export default router;

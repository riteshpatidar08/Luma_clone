import Event from '../models/event.model.js';
import Ticket from '../models/ticket.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import stripe from '../config/stripe.js';
import transporter from '../nodemailer/transporter.js';
import { generateTicketToken, generateQrDataUrl, generateQrPngBuffer } from '../utils/qrcode.js';

const ACTIVE_STATUSES = ['pending_approval', 'reserved', 'valid'];

// Atomically reserves a seat (no Redis in this stack -- Mongo's atomic
// findOneAndUpdate with a conditional filter plays the same role the
// architecture doc's Redis DECR lock would, without adding new infra).
const reserveSeat = async (eventId) => {
  const updated = await Event.findOneAndUpdate(
    {
      _id: eventId,
      $or: [{ 'options.capacity': { $exists: false } }, { $expr: { $lt: ['$ticketsSold', '$options.capacity'] } }],
    },
    { $inc: { ticketsSold: 1 } },
    { returnDocument: 'after' }
  );
  return updated;
};

const releaseSeat = async (eventId) => {
  await Event.updateOne({ _id: eventId }, { $inc: { ticketsSold: -1 } });
};

const sendConfirmationEmail = async (event, ticket, user) => {
  try {
    const qr = await generateQrDataUrl(ticket.qrCodeData);
    await transporter.sendMail({
      from: `"Nexus Tickets" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `You're confirmed: ${event.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto; padding: 24px;">
          <h2>You're in! 🎉</h2>
          <p>Your ticket for <strong>${event.title}</strong> is confirmed.</p>
          <img src="${qr}" alt="Ticket QR" style="width:180px;height:180px;margin:16px 0;" />
          <p style="font-size:12px;color:#858585;">Show this QR code at check-in.</p>
        </div>
      `,
    });
  } catch (error) {
    console.log('sendConfirmationEmail failed:', error.message);
  }
};

// Creates or continues a registration for an event, branching on whether the
// event is paid and/or requires organizer approval.
export const checkout = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, email, phone } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.status !== 'approved') {
      return res.status(400).json({ message: 'This event is not open for registration' });
    }

    const existing = await Ticket.findOne({ event: eventId, user: req.user.id, status: { $in: ACTIVE_STATUSES } });
    if (existing) {
      return res.status(400).json({ message: 'You already have a ticket for this event', data: existing });
    }

    const user = await User.findById(req.user.id);
    const attendeeInfo = {
      name: name || user.name,
      email: email || user.email,
      phone: phone || user.phone,
    };

    const isPaid = event.options.ticketPrice > 0;
    const needsApproval = event.options.requireApproval;

    if (needsApproval) {
      const ticket = await Ticket.create({
        event: eventId,
        user: req.user.id,
        attendeeInfo,
        qrCodeData: generateTicketToken(),
        status: 'pending_approval',
      });
      await Notification.create({
        user: event.organizer,
        type: 'new_rsvp',
        title: 'New RSVP request',
        message: `${attendeeInfo.name} requested to join "${event.title}".`,
        link: `/organizer/events/${event._id}/attendees`,
      });
      return res.status(201).json({ message: 'Request submitted, awaiting host approval', data: ticket });
    }

    if (isPaid) {
      if (!stripe) {
        return res.status(500).json({ message: 'Payments are not configured on the server yet' });
      }
      const ticket = await Ticket.create({
        event: eventId,
        user: req.user.id,
        attendeeInfo,
        qrCodeData: generateTicketToken(),
        status: 'reserved',
      });

      const session = await createStripeSession(event, ticket, attendeeInfo);
      ticket.payment.stripeSessionId = session.id;
      await ticket.save();

      return res.status(201).json({ message: 'Redirect to checkout', checkoutUrl: session.url, data: ticket });
    }

    // Free, instant registration.
    const reserved = await reserveSeat(eventId);
    if (!reserved) {
      return res.status(400).json({ message: 'This event is sold out' });
    }

    const ticket = await Ticket.create({
      event: eventId,
      user: req.user.id,
      attendeeInfo,
      qrCodeData: generateTicketToken(),
      status: 'valid',
    });

    await Notification.create({
      user: event.organizer,
      type: 'new_rsvp',
      title: 'New RSVP',
      message: `${attendeeInfo.name} registered for "${event.title}".`,
      link: `/organizer/events/${event._id}/attendees`,
    });
    sendConfirmationEmail(event, ticket, user);

    res.status(201).json({ message: 'Registered successfully', data: ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createStripeSession = async (event, ticket, attendeeInfo) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  return stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: attendeeInfo.email,
    line_items: [
      {
        price_data: {
          currency: event.options.currency || 'usd',
          unit_amount: Math.round(event.options.ticketPrice * 100),
          product_data: {
            name: event.title,
            description: `Ticket for ${event.title}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { ticketId: ticket._id.toString(), eventId: event._id.toString() },
    success_url: `${clientUrl}/tickets/confirm?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl}/eventdetails/${event._id}?checkout=cancelled`,
  });
};

// For events that require approval AND are paid: organizer approves first,
// then the attendee is asked to pay via this endpoint.
export const pay = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('event');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (ticket.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your ticket' });
    }
    if (ticket.status !== 'reserved' || ticket.payment.stripeSessionId) {
      return res.status(400).json({ message: 'This ticket is not awaiting payment' });
    }
    if (!stripe) return res.status(500).json({ message: 'Payments are not configured on the server yet' });

    const session = await createStripeSession(ticket.event, ticket, ticket.attendeeInfo);
    ticket.payment.stripeSessionId = session.id;
    await ticket.save();

    res.json({ checkoutUrl: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const myTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate({ path: 'event', populate: { path: 'organizer', select: 'name avatarUrl' } });
    res.json({ data: tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assertEventManager = async (eventId, user) => {
  const event = await Event.findById(eventId);
  if (!event) return { error: 404 };
  if (event.organizer.toString() !== user.id && user.role !== 'admin') {
    return { error: 403 };
  }
  return { event };
};

export const eventAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { error, event } = await assertEventManager(eventId, req.user);
    if (error === 404) return res.status(404).json({ message: 'Event not found' });
    if (error === 403) return res.status(403).json({ message: 'Not your event' });

    const { status } = req.query;
    const filter = { event: eventId };
    if (status) filter.status = status;

    const tickets = await Ticket.find(filter).sort({ createdAt: -1 }).populate('user', 'name email avatarUrl');
    res.json({ data: tickets, event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('event');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const event = ticket.event;
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your event' });
    }
    if (ticket.status !== 'pending_approval') {
      return res.status(400).json({ message: 'Ticket is not pending approval' });
    }

    if (event.options.ticketPrice > 0) {
      ticket.status = 'reserved';
      await ticket.save();
      await Notification.create({
        user: ticket.user,
        type: 'rsvp_approved',
        title: 'Request approved -- complete payment',
        message: `Your request for "${event.title}" was approved. Complete payment to confirm your seat.`,
        link: `/dashboard/tickets`,
      });
    } else {
      const reserved = await reserveSeat(event._id);
      if (!reserved) {
        return res.status(400).json({ message: 'Event is sold out, cannot approve more attendees' });
      }
      ticket.status = 'valid';
      await ticket.save();
      const attendeeUser = await User.findById(ticket.user);
      await Notification.create({
        user: ticket.user,
        type: 'rsvp_approved',
        title: 'You\'re confirmed!',
        message: `Your request for "${event.title}" was approved.`,
        link: `/dashboard/tickets`,
      });
      sendConfirmationEmail(event, ticket, attendeeUser);
    }

    res.json({ message: 'Ticket approved', data: ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('event');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const event = ticket.event;
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your event' });
    }

    ticket.status = 'rejected';
    await ticket.save();

    await Notification.create({
      user: ticket.user,
      type: 'rsvp_approved',
      title: 'RSVP declined',
      message: `Your request for "${event.title}" was declined by the host.`,
      link: `/eventdetails/${event._id}`,
    });

    res.json({ message: 'Ticket rejected', data: ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('event');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const isOwner = ticket.user.toString() === req.user.id;
    const isManager = ticket.event.organizer.toString() === req.user.id || req.user.role === 'admin';
    if (!isOwner && !isManager) {
      return res.status(403).json({ message: 'Not authorized to cancel this ticket' });
    }

    if (ticket.status === 'valid' || ticket.status === 'reserved') {
      await releaseSeat(ticket.event._id);
    }

    if (ticket.payment.isPaid && ticket.payment.stripePaymentIntentId && stripe) {
      try {
        await stripe.refunds.create({ payment_intent: ticket.payment.stripePaymentIntentId });
        ticket.payment.refundedAt = new Date();
        ticket.status = 'refunded';
      } catch (refundError) {
        console.log('Refund failed:', refundError.message);
        ticket.status = 'cancelled';
      }
    } else {
      ticket.status = 'cancelled';
    }

    await ticket.save();
    res.json({ message: 'Ticket cancelled', data: ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkInTicket = async (req, res) => {
  try {
    const { qrCodeData, eventId } = req.body;
    const { error } = await assertEventManager(eventId, req.user);
    if (error === 404) return res.status(404).json({ message: 'Event not found' });
    if (error === 403) return res.status(403).json({ message: 'Not your event' });

    const ticket = await Ticket.findOne({ qrCodeData, event: eventId }).populate('user', 'name email');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found for this event' });
    if (ticket.status === 'scanned') {
      return res.status(400).json({ message: 'Ticket already checked in', data: ticket });
    }
    if (ticket.status !== 'valid') {
      return res.status(400).json({ message: `Ticket is not valid (status: ${ticket.status})` });
    }

    ticket.status = 'scanned';
    ticket.checkedInAt = new Date();
    await ticket.save();

    res.json({ message: 'Checked in', data: ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTicketQr = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('event');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const isOwner = ticket.user.toString() === req.user.id;
    const isManager = ticket.event.organizer.toString() === req.user.id || req.user.role === 'admin';
    if (!isOwner && !isManager) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const buffer = await generateQrPngBuffer(ticket.qrCodeData);
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

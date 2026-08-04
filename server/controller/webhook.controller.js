import stripe from '../config/stripe.js';
import Ticket from '../models/ticket.model.js';
import Event from '../models/event.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import transporter from '../nodemailer/transporter.js';
import { generateQrDataUrl } from '../utils/qrcode.js';

// Mirrors the atomic-increment "reserveSeat" used for free events; kept
// local since the webhook has no access to the request-scoped helper.
const reserveSeat = async (eventId) => {
  return Event.findOneAndUpdate(
    {
      _id: eventId,
      $or: [{ 'options.capacity': { $exists: false } }, { $expr: { $lt: ['$ticketsSold', '$options.capacity'] } }],
    },
    { $inc: { ticketsSold: 1 } },
    { returnDocument: 'after' }
  );
};

export const handleStripeWebhook = async (req, res) => {
  if (!stripe) return res.status(500).send('Stripe not configured');

  let event;
  try {
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.log('Webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const ticket = await Ticket.findOne({ 'payment.stripeSessionId': session.id }).populate('event');
      if (!ticket) {
        console.log('Webhook: no ticket found for session', session.id);
        return res.json({ received: true });
      }

      // Idempotency guard: webhooks can be delivered more than once.
      if (ticket.status === 'valid') {
        return res.json({ received: true });
      }

      const reserved = await reserveSeat(ticket.event._id);
      if (!reserved) {
        // Sold out between checkout start and payment completion -- refund.
        if (session.payment_intent) {
          await stripe.refunds.create({ payment_intent: session.payment_intent });
        }
        ticket.status = 'refunded';
        await ticket.save();
        return res.json({ received: true });
      }

      ticket.status = 'valid';
      ticket.payment.isPaid = true;
      ticket.payment.stripePaymentIntentId = session.payment_intent;
      ticket.payment.amountPaid = (session.amount_total || 0) / 100;
      ticket.payment.currency = session.currency;
      ticket.payment.paidAt = new Date();
      await ticket.save();

      const user = await User.findById(ticket.user);
      await Notification.create({
        user: ticket.event.organizer,
        type: 'new_rsvp',
        title: 'New paid ticket sold',
        message: `${ticket.attendeeInfo.name} bought a ticket for "${ticket.event.title}".`,
        link: `/organizer/events/${ticket.event._id}/attendees`,
      });
      await Notification.create({
        user: ticket.user,
        type: 'ticket_confirmed',
        title: 'Payment confirmed',
        message: `Your ticket for "${ticket.event.title}" is confirmed.`,
        link: '/dashboard/tickets',
      });

      try {
        const qr = await generateQrDataUrl(ticket.qrCodeData);
        await transporter.sendMail({
          from: `"Nexus Tickets" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `Payment confirmed: ${ticket.event.title}`,
          html: `<div style="font-family: sans-serif; max-width: 420px; margin: 0 auto; padding: 24px;">
            <h2>Payment received 🎉</h2>
            <p>Your ticket for <strong>${ticket.event.title}</strong> is confirmed.</p>
            <img src="${qr}" alt="Ticket QR" style="width:180px;height:180px;margin:16px 0;" />
          </div>`,
        });
      } catch (mailError) {
        console.log('Confirmation email failed:', mailError.message);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.log('Webhook handling error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

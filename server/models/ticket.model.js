import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    attendeeInfo: {
      name: String,
      email: String,
      phone: String,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    qrCodeData: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending_approval', 'reserved', 'valid', 'scanned', 'cancelled', 'refunded', 'rejected'],
      default: 'reserved',
      index: true,
    },
    checkedInAt: Date,
    payment: {
      isPaid: { type: Boolean, default: false },
      stripeSessionId: { type: String, index: true },
      stripePaymentIntentId: String,
      amountPaid: Number,
      currency: String,
      paidAt: Date,
      refundedAt: Date,
    },
  },
  { timestamps: true }
);

TicketSchema.index({ event: 1, user: 1 });

const Ticket = mongoose.model('Ticket', TicketSchema);

export default Ticket;

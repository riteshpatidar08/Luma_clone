import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'event_approved',
        'event_rejected',
        'new_rsvp',
        'rsvp_approved',
        'ticket_confirmed',
        'event_pending_review',
        'ticket_refunded',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String },
    link: { type: String }, // client-side route to deep-link to
    read: { type: Boolean, default: false, index: true },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;

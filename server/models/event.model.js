import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    visibility: {
      type: String,
      enum: ['Private', 'Public'],
      required: true,
      default: 'Public',
    },
    bannerUrl: {
      type: String,
    },
    category: {
      type: String,
      default: 'personal',
      index: true,
    },
 
    calender: {
      type: String,
      default: 'personal',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    schedule: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
      },
      timeZone: {
        type: String,
        default: 'UTC',
      },
    },
    location: {
      type: {
        type: String,
        enum: ['physical', 'online'],
        required: true,
      },
      address: {
        type: String, 
      },
      placeId: {
        type: String,
      },
      city: String,
      country: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: {
          type: [Number], // [lng, lat]
        },
      },
      meetingLink: {
        type: String, // online events
      },
    },
    options: {
      ticketPrice: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'usd',
      },
      requireApproval: {
        type: Boolean,
        default: false,
      },
      capacity: {
        type: Number, // undefined == unlimited
      },
    },
    ticketsSold: {
      type: Number,
      default: 0,
    },
    stripeProductId: String,
    stripePriceId: String,
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    embedding: {
      type: [Number],
      default: undefined,
      select: false,
    },
  },
  { timestamps: true }
);

// Discovery feed: filter by status, sort by date

EventSchema.index({ status: 1, 'schedule.startDate': 1 });

EventSchema.index({ 'location.coordinates': '2dsphere' });

EventSchema.index({ title: 'text', description: 'text' });

const Event = mongoose.model('Event', EventSchema);

export default Event;

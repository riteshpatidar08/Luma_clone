import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  visibility: {
    type: String,
    enum: ['Private', 'Public'],
    required: true,
  },

  calender: {
    type: String,
    default: 'personal',
  },
  schedule: {
    startDate: {
      type: Date,
      required: true,
    },
    endData: {
      type: Date,
    },
    timeZone: {
      type: String,
      default: 'UTC',
    },
  },
  location: {
    type: String,
    enum: ['physical', 'online'],
  },
  address: {
    type: String,
  },
  meetingLink: {
    type: String,
  },

  options: {
    ticketPrice: {
      type: Number,
    },
    requireApproval: {
      type: Boolean,
      default: false,
    },
    capacity: {
      type: Number,
    },
  },
  organizer : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User"

  }
});

const Event = mongoose.model('Event', EventSchema);

export default Event;

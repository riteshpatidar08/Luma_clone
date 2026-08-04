import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    avatarUrl: {
      type: String,
      default: 'https://cdn.lu.ma/avatars-default/avatar_9.png',
    },
    bio: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['attendee', 'organizer', 'admin'],
      default: 'attendee',
      index: true,
    },
    // Organizer-facing public profile shown on their hosted events
    organizerProfile: {
      displayName: String,
      website: String,
      about: String,
    },
    savedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    isActive: {
      type: Boolean,
      default: true,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    stripeCustomerId: {
      type: String,
    },
    // Home coordinates used to personalize the location-based Discover feed.
    homeLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [lng, lat]
      },
      label: String,
    },
  },
  { timestamps: true }
);

UserSchema.index({ homeLocation: '2dsphere' });

const User = mongoose.model('User', UserSchema);

export default User;

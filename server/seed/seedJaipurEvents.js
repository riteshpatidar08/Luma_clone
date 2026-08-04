// One-off demo-data seed -- NOT auto-run on server start. Usage: npm run seed:jaipur
//
// Creates a handful of real, geo-tagged physical events around Jaipur so the
// location-based Discover feed has something genuine to show immediately.
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Event from '../models/event.model.js';
import User from '../models/user.model.js';

dotenv.config();

const JAIPUR_EVENTS = [
  {
    title: 'Sunrise Photowalk at Hawa Mahal',
    description: 'Golden-hour photography meetup through the Pink City lanes, ending at the iconic Hawa Mahal facade.',
    category: 'social',
    address: 'Hawa Mahal Rd, Badi Choupad, Jaipur, Rajasthan',
    city: 'Jaipur',
    country: 'India',
    lat: 26.9239,
    lng: 75.8267,
    bannerUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800',
    ticketPrice: 0,
    capacity: 40,
  },
  {
    title: 'Jaipur Startup Founders Meetup',
    description: 'Monthly gathering for Jaipur founders, builders, and investors to trade notes over chai.',
    category: 'business',
    address: 'World Trade Park, Malviya Nagar, Jaipur, Rajasthan',
    city: 'Jaipur',
    country: 'India',
    lat: 26.8505,
    lng: 75.8104,
    bannerUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
    ticketPrice: 5,
    capacity: 120,
  },
  {
    title: 'Amber Fort Heritage Walk',
    description: 'Guided evening heritage walk through Amber Fort with a local historian.',
    category: 'personal',
    address: 'Amber Fort, Devisinghpura, Amer, Jaipur, Rajasthan',
    city: 'Jaipur',
    country: 'India',
    lat: 26.9855,
    lng: 75.8513,
    bannerUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
    ticketPrice: 8,
    capacity: 25,
  },
  {
    title: 'Jawahar Circle Yoga & Wellness Morning',
    description: 'Community yoga session in one of Asia\'s largest circular parks, followed by a wellness workshop.',
    category: 'health',
    address: 'Jawahar Circle Garden, Malviya Nagar, Jaipur, Rajasthan',
    city: 'Jaipur',
    country: 'India',
    lat: 26.8544,
    lng: 75.8047,
    bannerUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    ticketPrice: 0,
    capacity: 60,
  },
  {
    title: 'Jaipur Developer Circle: React & AI',
    description: 'Talks on React performance and applied AI from Jaipur\'s developer community.',
    category: 'developer',
    address: 'Central Park, C Scheme, Jaipur, Rajasthan',
    city: 'Jaipur',
    country: 'India',
    lat: 26.8932,
    lng: 75.8067,
    bannerUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
    ticketPrice: 0,
    capacity: 100,
  },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Attach to the first organizer/admin account found, or create a demo host.
  let host = await User.findOne({ role: { $in: ['organizer', 'admin'] } });
  if (!host) {
    host = await User.create({ email: 'jaipur-host@nexus.demo', name: 'Nexus Jaipur', role: 'organizer' });
  }

  let created = 0;
  for (const e of JAIPUR_EVENTS) {
    const exists = await Event.findOne({ title: e.title });
    if (exists) continue;

    await Event.create({
      title: e.title,
      description: e.description,
      visibility: 'Public',
      category: e.category,
      calender: e.category,
      status: 'approved',
      bannerUrl: e.bannerUrl,
      schedule: {
        startDate: new Date(Date.now() + (created + 3) * 24 * 60 * 60 * 1000),
        timeZone: 'Asia/Kolkata',
      },
      location: {
        type: 'physical',
        address: e.address,
        city: e.city,
        country: e.country,
        coordinates: { type: 'Point', coordinates: [e.lng, e.lat] },
      },
      options: { ticketPrice: e.ticketPrice, currency: 'inr', requireApproval: false, capacity: e.capacity },
      organizer: host._id,
    });
    created += 1;
  }

  console.log(`Seeded ${created} Jaipur event(s) (host: ${host.email}).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.log(err);
  process.exit(1);
});

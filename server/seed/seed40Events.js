import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Event from '../models/event.model.js';
import User from '../models/user.model.js';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const CATEGORIES = ['personal', 'developer', 'web3', 'social', 'business', 'health'];

const EVENT_TEMPLATES = [
  { title: 'Global Tech Summit 2026', category: 'developer', banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', type: 'online' },
  { title: 'AI & Machine Learning Bootcamp', category: 'developer', banner: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', type: 'online' },
  { title: 'Web3 & Decentralized Finance Expo', category: 'web3', banner: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800', type: 'online' },
  { title: 'React & Next.js Advanced Workshop', category: 'developer', banner: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', type: 'online' },
  { title: 'Cybersecurity Masterclass', category: 'developer', banner: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800', type: 'online' },
  { title: 'Solana & Ethereum Builder Hackathon', category: 'web3', banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800', type: 'online' },
  { title: 'Venture Capital & Seed Funding Forum', category: 'business', banner: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800', type: 'physical' },
  { title: 'Morning Mindfulness & Yoga Retreat', category: 'health', banner: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', type: 'physical' },
  { title: 'City Coffee & Networking Mixer', category: 'social', banner: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800', type: 'physical' },
  { title: 'Indie Hackers & Founders Circle', category: 'business', banner: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', type: 'physical' },
  { title: 'Sunset Acoustics & Live Jam', category: 'personal', banner: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', type: 'physical' },
  { title: 'Product Design & UI/UX Salon', category: 'developer', banner: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800', type: 'online' },
  { title: 'CrossFit & High Intensity Fitness Session', category: 'health', banner: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800', type: 'physical' },
  { title: 'Crypto Traders & Analytics Meetup', category: 'web3', banner: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800', type: 'online' },
  { title: 'Board Games & Trivia Night', category: 'social', banner: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800', type: 'physical' },
];

const CITIES = [
  { city: 'San Francisco', country: 'United States', address: 'Market St, San Francisco, CA', lat: 37.7749, lng: -122.4194 },
  { city: 'New York', country: 'United States', address: 'Broadway, New York, NY', lat: 40.7128, lng: -74.006 },
  { city: 'London', country: 'United Kingdom', address: 'Oxford St, London', lat: 51.5074, lng: -0.1278 },
  { city: 'Bengaluru', country: 'India', address: 'MG Road, Bengaluru, Karnataka', lat: 12.9716, lng: 77.5946 },
  { city: 'Tokyo', country: 'Japan', address: 'Shibuya, Tokyo', lat: 35.6762, lng: 139.6503 },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set in environment.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB.');

  let host = await User.findOne({ role: { $in: ['organizer', 'admin'] } });
  if (!host) {
    host = await User.create({ email: 'seed-organizer@nexus.demo', name: 'Nexus Host', role: 'organizer' });
  }

  const existingCount = await Event.countDocuments({ status: 'approved' });
  console.log(`Current approved events count: ${existingCount}`);

  const targetCount = 45;
  const needed = Math.max(0, targetCount - existingCount);

  if (needed === 0) {
    console.log(`Already have ${existingCount} events (at least 40). Skipping seed.`);
    await mongoose.disconnect();
    return;
  }

  console.log(`Seeding ${needed} new events...`);

  const eventsToCreate = [];
  const baseTime = Date.now();

  for (let i = 0; i < needed; i++) {
    const tpl = EVENT_TEMPLATES[i % EVENT_TEMPLATES.length];
    const locInfo = CITIES[i % CITIES.length];
    const daysAhead = (i + 1) * 2;
    const startDate = new Date(baseTime + daysAhead * 24 * 60 * 60 * 1000);

    const titleSuffix = i >= EVENT_TEMPLATES.length ? ` #${Math.floor(i / EVENT_TEMPLATES.length) + 1}` : '';

    eventsToCreate.push({
      title: `${tpl.title}${titleSuffix}`,
      description: `Join us for an exciting ${tpl.category} session focused on learning, networking, and growth. Suitable for all experience levels!`,
      visibility: 'Public',
      category: tpl.category,
      calender: tpl.category,
      status: 'approved',
      bannerUrl: tpl.banner,
      schedule: {
        startDate,
        endDate: new Date(startDate.getTime() + 2 * 60 * 60 * 1000),
        timeZone: 'UTC',
      },
      location: {
        type: tpl.type,
        meetingLink: tpl.type === 'online' ? 'https://meet.nexus.demo/event-room' : undefined,
        address: tpl.type === 'physical' ? locInfo.address : undefined,
        city: tpl.type === 'physical' ? locInfo.city : undefined,
        country: tpl.type === 'physical' ? locInfo.country : undefined,
        coordinates: tpl.type === 'physical' ? { type: 'Point', coordinates: [locInfo.lng, locInfo.lat] } : undefined,
      },
      options: {
        ticketPrice: (i % 5) * 10,
        currency: 'usd',
        requireApproval: false,
        capacity: 50 + (i % 10) * 15,
      },
      organizer: host._id,
    });
  }

  await Event.insertMany(eventsToCreate);
  const totalNow = await Event.countDocuments({ status: 'approved' });
  console.log(`Successfully seeded! Total approved events in database now: ${totalNow}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed script error:', err);
  process.exit(1);
});

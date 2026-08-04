// One-off bootstrap script -- NOT auto-run on server start.
// Usage: npm run seed:admin -- someone@example.com
//
// Grants the admin role to an existing user (they must sign in at least
// once first so the account exists). This is the only way to create the
// first admin -- the app never lets a user self-promote to admin.
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/user.model.js';

dotenv.config();

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.log('Usage: npm run seed:admin -- someone@example.com');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { returnDocument: 'after' });
    if (!user) {
      console.log(`No user found with email ${email}. They need to sign in at least once first.`);
    } else {
      console.log(`${user.email} is now an admin.`);
    }
  } catch (error) {
    console.log(error);
  } finally {
    await mongoose.disconnect();
  }
}

run();

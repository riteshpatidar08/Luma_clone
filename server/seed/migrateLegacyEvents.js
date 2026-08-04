// One-off migration -- NOT auto-run on server start. Usage: npm run migrate:legacy
//
// Reshapes events that were written under the pre-rewrite schema (flat
// `location: "physical"` string + top-level `address`/`meetingLink`, the
// `schedule.endData` typo, and the old `attendee` array) into the current
// nested-location / Ticket-based schema. Safe to re-run (idempotent).
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection('events');

  const legacy = await col.find({ location: { $type: 'string' } }).toArray();
  console.log(`Found ${legacy.length} legacy-shaped event(s) to migrate.`);

  for (const doc of legacy) {
    const update = {
      $set: {
        location: {
          type: doc.location,
          address: doc.address || undefined,
          meetingLink: doc.meetingLink || undefined,
        },
      },
      $unset: { address: '', meetingLink: '', attendee: '' },
    };
    if (doc.schedule?.endData && !doc.schedule?.endDate) {
      update.$set['schedule.endDate'] = doc.schedule.endData;
      update.$unset['schedule.endData'] = '';
    }
    if (!doc.category && doc.calender) {
      update.$set.category = doc.calender;
    }
    if (doc.options && doc.options.currency === undefined) {
      update.$set['options.currency'] = 'usd';
    }
    await col.updateOne({ _id: doc._id }, update);
  }

  console.log('Migration complete.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.log(err);
  process.exit(1);
});

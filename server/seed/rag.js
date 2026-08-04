// One-off maintenance script -- NOT auto-run on server start.
// Usage: npm run seed:rag
//
// 1. Backfills `embedding` on any Event missing one (e.g. after a schema
//    change, or for events created before the RAG pipeline existed).
// 2. Ensures the Atlas Vector Search index exists (no-op / safe to re-run --
//    requires a MongoDB Atlas cluster; on plain community MongoDB this step
//    will fail and the chatbot will just use its text-search fallback).
import Event from '../models/event.model.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { textToEmbeddings } from '../config/gemini.js';

dotenv.config();

const buildEmbeddingText = (e) =>
  `${e.title}\n${e.category}\n${e.description}\nPrice: ${e.options?.ticketPrice ?? 0}\nStatus: ${e.status}\nStart: ${e.schedule?.startDate}\nLocation: ${e.location?.type === 'physical' ? e.location?.address : 'Online'}`;

async function backfillEmbeddings() {
  const events = await Event.find().select('+embedding');
  let updated = 0;
  for (const event of events) {
    if (event.embedding?.length) continue;
    const vectors = await textToEmbeddings(buildEmbeddingText(event));
    if (vectors) {
      event.embedding = vectors;
      await event.save();
      updated += 1;
    }
  }
  console.log(`Backfilled embeddings for ${updated}/${events.length} events.`);
}

async function ensureVectorSearchIndex() {
  try {
    await mongoose.connection.db.collection('events').createSearchIndex({
      name: 'event_vector_index',
      type: 'vectorSearch',
      definition: {
        fields: [
          {
            type: 'vector',
            path: 'embedding',
            numDimensions: 768,
            similarity: 'cosine',
          },
        ],
      },
    });
    console.log('Vector search index created.');
  } catch (error) {
    console.log('Skipping vector search index (likely already exists, or not on Atlas):', error.message);
  }
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await backfillEmbeddings();
    await ensureVectorSearchIndex();
  } catch (error) {
    console.log(error);
  } finally {
    await mongoose.disconnect();
  }
}

run();

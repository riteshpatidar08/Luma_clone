import Event from '../models/event.model.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { textToEmbeddings } from '../config/gemini.js';
//NOTE require a function which fetches the exisiting event and create the embeddings

dotenv.config();

async function createEmbeddingForExistingEvents() {
  try {
    const events = await Event.find();
    // console.log(events);
    for(let event of events){
      const text = `${event.title}]\n${event.location}\n${event.description}\n${event.options.ticketPrice}\n${event.status}\n${event.schedule} `
    const vectors = await textToEmbeddings(text)
    console.log(vectors)
    event.embedding = vectors ;
    await event.save()
    }

  } catch (error) {
    console.log(error.message)
  }
}

async function createVectorSearchIndex(){
    try {
        mongoose.connection.db.collection('events').createSearchIndex({
            name: "event_vector_index", // Index name
            type: "vectorSearch",
            definition : {
            fields: [
              {
                type: "vector",
                path: "embedding", // Field containing your vector
                numDimensions: 768, // Must match your embedding size
                similarity: "cosine" // cosine | euclidean | dotProduct
              }
            ]
        
      }  })
    } catch (error) {
        console.log(error)
    }
 
}


async function run() {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    createEmbeddingForExistingEvents();
    createVectorSearchIndex();
  } catch (error) {
    console.log(error);
  }
}

run();

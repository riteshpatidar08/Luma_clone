import { mongoose } from 'mongoose';

export const dbConnect = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 60000, // 60 seconds
    }); // 10 seconds default)
    mongoose.set('bufferCommands', false);
    // mongoose.set('bufferMaxEntries', 0);
    console.log('connection successfull');
  } catch (error) {
    console.log(error.message);
  }
};

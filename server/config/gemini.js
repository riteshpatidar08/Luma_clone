import axios from 'axios';
import dotenv from 'dotenv';
const EMEBEDDING_MODEL = 'gemini-embedding-001' ;
const BASE_URL =  'https://generativelanguage.googleapis.com/v1beta/models'
dotenv.config()
console.log(process.env.GEMINI_API_KEY);

export const textToEmbeddings = async (text) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/${EMEBEDDING_MODEL}:embedContent?key=AQ.Ab8RN6LKo-wJQu6TiNOMb76zF0WeAIcuQq8uVJbUVUxNv-L1sw`,
      {
        content: {
          parts: [
            {
              text : 'agdfdsfs' }
          ],
        },
        outputDimensionality: 768,
      }
    );
return res.data.embedding.values ;
  } catch (error) {
    console.log(error.message);
  }
}

textToEmbeddings();

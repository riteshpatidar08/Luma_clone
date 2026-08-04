import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const EMBEDDING_MODEL = 'gemini-embedding-001';
const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Converts raw text into a 768-dim embedding vector. Returns null instead of
// throwing so callers (event create/update) can treat embeddings as optional
// and never block the primary write on an AI provider hiccup.
export const textToEmbeddings = async (text) => {
  if (!text || !process.env.GEMINI_API_KEY) return null;
  try {
    const res = await axios.post(
      `${BASE_URL}/${EMBEDDING_MODEL}:embedContent?key=${process.env.GEMINI_API_KEY}`,
      {
        content: {
          parts: [{ text }],
        },
        outputDimensionality: 768,
      }
    );
    return res.data.embedding.values;
  } catch (error) {
    console.log('textToEmbeddings error:', error.response?.data || error.message);
    return null;
  }
};

// Non-streaming single-shot answer. Used as a fallback if streaming fails.
export const generateAnswer = async ({ systemPrompt, history = [], question }) => {
  if (!process.env.GEMINI_API_KEY) {
    return 'AI concierge is not configured (missing GEMINI_API_KEY).';
  }
  try {
    const contents = [
      ...history.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: question }] },
    ];

    const res = await axios.post(
      `${BASE_URL}/${CHAT_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
      }
    );

    return (
      res.data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ||
      "I couldn't come up with an answer for that."
    );
  } catch (error) {
    console.log('generateAnswer error:', error.response?.data || error.message);
    return 'Sorry, the AI concierge ran into an error answering that.';
  }
};

// Streams the answer token-by-token via Gemini's SSE endpoint. `onChunk` is
// called with each text fragment as it arrives; resolves with the full text.
export const streamAnswer = async ({ systemPrompt, history = [], question }, onChunk) => {
  if (!process.env.GEMINI_API_KEY) {
    const msg = 'AI concierge is not configured (missing GEMINI_API_KEY).';
    onChunk(msg);
    return msg;
  }

  const contents = [
    ...history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: question }] },
  ];

  let fullText = '';

  try {
    const response = await axios.post(
      `${BASE_URL}/${CHAT_MODEL}:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`,
      {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
      },
      { responseType: 'stream' }
    );

    let buffer = '';
    await new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep last partial line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          try {
            const parsed = JSON.parse(payload);
            const textPiece = parsed?.candidates?.[0]?.content?.parts
              ?.map((p) => p.text)
              .join('');
            if (textPiece) {
              fullText += textPiece;
              onChunk(textPiece);
            }
          } catch (e) {
            // ignore partial/non-JSON keepalive lines
          }
        }
      });
      response.data.on('end', resolve);
      response.data.on('error', reject);
    });

    return fullText;
  } catch (error) {
    console.log('streamAnswer error:', error.response?.data || error.message);
    if (!fullText) {
      const fallback = await generateAnswer({ systemPrompt, history, question });
      onChunk(fallback);
      return fallback;
    }
    return fullText;
  }
};

import axios from 'axios';
async function textToEmbeddings() {
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=AIzaSyBcqEC4jf3UWcL2hVuRFEuOnQIUByYOzh4`,
      {
        content: {
          parts: [
            {
              text: 'Advanced React Performance workshop. Learn React optimization online.',
            },
          ],
        },
        outputDimensionality: 768,
      }
    );
    console.log(res.data);
  } catch (error) {
    console.log(error);
  }
}

textToEmbeddings();

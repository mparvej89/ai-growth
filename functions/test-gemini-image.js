const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' });
    const result = await model.generateContent('A poster for a coffee shop');
    console.log(result.response.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();

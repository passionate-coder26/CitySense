require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 1. Authenticate
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function runTest() {
  try {
    // 2. Select the Model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});

    // 3. Send a Prompt
    console.log("🤖 Asking Gemini: 'Explain CitySense in one sentence'...");
    const prompt = "Explain a project called CitySense AI that detects potholes and trash using a dashcam in one sentence.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 4. Print Success
    console.log("\n✅ SUCCESS! Gemini Replied:");
    console.log(text);
    
  } catch (error) {
    console.error("\n❌ ERROR: Something went wrong.");
    console.error(error.message);
  }
}

runTest();
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log("🔍 Checking available models...");
    
    // This asks Google for the list
    const modelResponse = await genAI.getGenerativeModel({ model: "gemini-pro" }).apiKey; // Hack to get client
    // Actually, let's use the proper client method if available, 
    // but the simplest way in the SDK is usually to just try the basic ones.
    
    // Let's try the direct list request via fetch (fallback) or SDK if documentation fits.
    // Since SDK might hide this, let's try the most standard STABLE model name first.
    
    // We will try a different specific model that usually works for everyone.
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" }); 
    
    const prompt = "Hello";
    const result = await model.generateContent(prompt);
    console.log("✅ Success! 'gemini-1.0-pro' works.");
    console.log("Response:", result.response.text());

  } catch (error) {
    console.error("❌ Still failing on 1.0-pro.");
    console.error("Error details:", error.message);
    
    // If this fails, we will try the 'latest' alias
    try {
        console.log("\n🔄 Trying 'gemini-1.5-flash-latest'...");
        const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result2 = await model2.generateContent("Hello");
        console.log("✅ Success! 'gemini-1.5-flash-latest' is the one.");
    } catch (err2) {
        console.log("❌ That failed too.");
    }
  }
}

listModels();
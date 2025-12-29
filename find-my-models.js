require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function getModels() {
  console.log("🔍 Pinging Google Servers for available models...");

  try {
    const response = await fetch(URL);
    const data = await response.json();

    if (data.error) {
      console.error("❌ API Error:", data.error.message);
      return;
    }

    console.log("\n✅ SUCCESS! Here are the models you can use:");
    console.log("------------------------------------------------");
    
    // Filter for models that support 'generateContent'
    const available = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    
    available.forEach(model => {
      console.log(`Name: ${model.name}`); // This is exactly what you copy-paste
      console.log(`Display: ${model.displayName}`);
      console.log("------------------------------------------------");
    });

  } catch (error) {
    console.error("❌ Network Error:", error.message);
  }
}

getModels();
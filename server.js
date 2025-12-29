require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 5000;

// Initialize Gemini with the model that worked for you
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.use(cors());
app.use(express.json()); 

// Serve static files (like videos or images) from a 'public' folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// 1. API: Get Mock Detections (For the Map)
app.get('/api/detections', (req, res) => {
    try {
        const data = require('./public/data/mock_detections.json');
        res.json(data);
    } catch (e) {
        console.error("Error reading data file:", e.message);
        res.json([]); // Return empty list if file is missing
    }
});

// 2. API: Generate Smart Report (The Google Tech Feature)
app.post('/api/generate-report', async (req, res) => {
    const { detections } = req.body;
    console.log("🤖 Generating report for", detections ? detections.length : 0, "issues...");

    try {
        const prompt = `
            Act as a Senior City Engineer. 
            Analyze this raw detection data: ${JSON.stringify(detections)}.
            1. Identify the most critical risk area.
            2. Write a 3-bullet action plan for the maintenance team.
            3. Keep it professional and urgent.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({ report: text });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "AI Service Unavailable" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 CitySense Backend running at http://localhost:${PORT}`);
});
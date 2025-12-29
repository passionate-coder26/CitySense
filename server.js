require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // <--- ADDED THIS
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 5000;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.use(cors());
app.use(express.json()); 

const DATA_FILE = path.join(__dirname, 'public/data/mock_detections.json');

// 1. API: Get Mock Detections (Updated to read live file)
app.get('/api/detections', (req, res) => {
    try {
        // Use fs.readFileSync so we always get the latest data (no caching)
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (e) {
        console.error("Error reading data file:", e.message);
        res.json([]); 
    }
});

// 2. API: Generate Smart Report
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

// 3. API: Receive Live Data from Python (NEW!)
app.post('/api/update-live-data', (req, res) => {
    const newData = req.body; // Expecting a single detection object
    console.log("📸 Received live data from Python:", newData);

    try {
        // Read current data
        let currentData = [];
        if (fs.existsSync(DATA_FILE)) {
            const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
            currentData = JSON.parse(fileContent);
        }

        // Add new detection to the top
        currentData.unshift(newData);

        // Keep only last 50 entries (to prevent file getting huge)
        if (currentData.length > 50) currentData = currentData.slice(0, 50);

        // Save back to file
        fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2));

        res.json({ success: true, message: "Data updated" });
    } catch (error) {
        console.error("Error updating data:", error);
        res.status(500).json({ error: "Failed to update data" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 CitySense Backend running at http://localhost:${PORT}`);
});
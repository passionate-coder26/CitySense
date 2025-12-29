# 🚔 CitySense Backend (Node.js + Google Gemini)

## Status: 🟢 ONLINE
The backend is ready. It serves detection data and generates AI reports.

### 🔑 Setup for Teammates
1. `npm install`
2. Create `.env` file and add: `GEMINI_API_KEY=...` (Ask Abhiram for the key)
3. Run: `node server.js`

### 📡 API Endpoints

**1. Get Map Data (For Frontend)**
- **URL:** `GET http://localhost:5000/api/detections`
- **Response:** JSON list of potholes/garbage.

**2. Generate Smart Report (For Frontend)**
- **URL:** `POST http://localhost:5000/api/generate-report`
- **Body:** `{ "detections": [...] }`
- **Response:** AI-generated summary text.

**3. Upload Live Data (For ML/Python)**
- **URL:** `POST http://localhost:5000/api/update-live-data`
- **Body:** JSON object of new detections.
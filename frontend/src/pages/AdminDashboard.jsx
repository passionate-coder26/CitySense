import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export default function AdminDashboard() {

  // ================= CLOCK =================
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ================= LIVE LOGS (Connected to Real Data) =================
  const [logs, setLogs] = useState([
    "[System] Initializing CitySense AI...",
    "[System] Connected to Backend API...",
  ]);
  const logRef = useRef(null);

  // ================= REAL BACKEND DATA STATE =================
  const [detections, setDetections] = useState([]); // <--- NEW: Stores potholes
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null); // <--- NEW: Reference for the Google Map
  const googleMapInstance = useRef(null);

  // 1. FETCH DATA FROM YOUR BACKEND
  const fetchDetections = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/detections'); // <--- YOUR ENDPOINT
      const data = await res.json();
      setDetections(data);
      
      // Update logs if we found something new
      if (data.length > 0) {
        const latest = data[0];
        const logMsg = `[${new Date().toLocaleTimeString()}] DETECTED: ${latest.type.toUpperCase()} (${latest.severity}) at ${latest.lat}, ${latest.lng}`;
        setLogs(prev => [...prev.slice(-4), logMsg]); // Keep last 5 logs
      }
      setLoading(false);
    } catch (err) {
      console.error("Backend offline?", err);
      setLogs(prev => [...prev, "[Error] Backend not responding..."]);
    }
  };

  // Poll for new data every 2 seconds
  useEffect(() => {
    fetchDetections();
    const interval = setInterval(fetchDetections, 2000);
    return () => clearInterval(interval);
  }, []);


  // 2. INITIALIZE GOOGLE MAP (Once data is loaded)
  useEffect(() => {
    // Check if Google Maps script is loaded (from index.html)
    if (!window.google || !mapRef.current) return;

    // Only create the map once
    if (!googleMapInstance.current) {
      googleMapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 19.0760, lng: 72.8777 }, // Mumbai Center
        zoom: 12,
        styles: [ // Dark mode style for "Tech" feel
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        ]
      });
    }

    // Clear old markers (simple implementation)
    // In a real app, you'd track marker instances to remove them efficiently
    // For hackathon: We just re-render markers for top 20 items
    detections.slice(0, 20).forEach(det => {
      new window.google.maps.Marker({
        position: { lat: parseFloat(det.lat), lng: parseFloat(det.lng) },
        map: googleMapInstance.current,
        title: `${det.type} (${det.severity})`,
        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" // Red dot for danger
      });
    });

  }, [detections]); // Re-run when new detections arrive


  // ================= SCROLL LOGS =================
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);


  const [filter, setFilter] = useState("all");

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ================= HEADER ================= */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-3 px-6">
          <Link to="/" className="font-bold text-xl cursor-pointer">CitySense AI</Link>
          <nav className="flex-1 flex justify-center gap-10 text-base">
            <span className="text-blue-600 font-semibold cursor-pointer">Dashboard</span>
            <Link to="/admin/issues" className="hover:text-blue-600">Issues</Link>
            <Link to="/admin/reports" className="hover:text-blue-600">Reports</Link>
          </nav>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              SYSTEM ONLINE
            </span>
            <span className="text-sm">{time}</span>
            <div className="px-3 py-1 bg-blue-50 text-blue-700 border rounded-lg text-sm">
               👤 City Administrator
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="max-w-7xl mx-auto px-6 mt-6">
        <h1 className="text-2xl font-bold">Admin Command Center</h1>
        <p className="text-gray-600 text-sm">Real-time urban intelligence and issue management</p>

        {/* ================= LIVE PATROL MODE ================= */}
        <div className="grid grid-cols-2 gap-6 mt-6">

          {/* VIDEO PANEL (Placeholder for now) */}
          <div className="bg-black rounded-xl h-[420px] relative overflow-hidden flex items-center justify-center">
             {/* If you have a video file, put it in public folder and link it here */}
            <p className="text-gray-500">Live Camera Feed (Simulation)</p>
            <div className="absolute top-3 left-3 text-white font-semibold bg-black/50 px-3 py-1 rounded">
              LIVE PATROL — Vehicle #21
            </div>
            {/* Show alert if last detection was recent */}
            {detections.length > 0 && (
              <div className="absolute border-4 border-red-500 w-40 h-32 left-24 top-24 animate-pulse rounded">
                <div className="bg-red-600 text-white text-xs px-2 py-1 absolute -top-6">
                  {detections[0].type.toUpperCase()} DETECTED
                </div>
              </div>
            )}
          </div>

          {/* MAP PANEL (REAL GOOGLE MAP) */}
          <div className="bg-white border rounded-xl p-4 relative">
            <h3 className="font-semibold text-sm mb-2">Live Incident Map</h3>
            <div className="bg-blue-50 border rounded-lg h-[380px] relative overflow-hidden">
                {/* THIS DIV IS THE MAP */}
                <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>

        {/* ================= LIVE LOG TERMINAL ================= */}
        <div
          className="bg-black text-green-400 rounded-xl p-4 font-mono h-52 mt-6 overflow-y-auto text-sm"
          ref={logRef}
        >
          {logs.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>

        {/* ================= TOP STATS (REAL NUMBERS) ================= */}
        <div className="grid md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <p className="font-semibold text-sm">Total Detected Issues</p>
            {/* Show real count from array */}
            <h2 className="text-4xl font-bold mt-2">{detections.length}</h2> 
            <p className="text-green-600 text-xs mt-1">Live Count</p>
          </div>
          {/* ... keeping other static stats for layout ... */}
           <div className="bg-white border rounded-xl p-5 shadow-sm">
            <p className="font-semibold text-sm text-red-500">Critical Alerts</p>
            <h2 className="text-4xl font-bold mt-2 text-red-500">
                {detections.filter(d => d.severity === 'High').length}
            </h2>
            <p className="text-gray-500 text-xs mt-1">Require immediate action</p>
          </div>
        </div>

        {/* ================= LIST OF RECENT ISSUES ================= */}
        <div className="bg-white border rounded-xl shadow-sm mt-6 p-5">
            <h3 className="font-bold mb-4">Recent Detections</h3>
            <ul>
                {detections.slice(0, 5).map((d, i) => (
                    <li key={i} className="border-b py-2 flex justify-between">
                        <span>{d.type} ({d.severity})</span>
                        <span className="text-gray-500">{d.timestamp}</span>
                    </li>
                ))}
            </ul>
        </div>

      </main>
      <p className="text-center text-gray-500 text-xs mt-10 mb-6">© 2025 CitySense AI</p>
    </div>
  );
}
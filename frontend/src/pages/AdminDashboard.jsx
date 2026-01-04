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

  // ================= LIVE LOGS =================
  const [logs, setLogs] = useState([
    "[System] Initializing CitySense AI...",
    "[System] Connected to Backend API...",
  ]);
  const logRef = useRef(null);
  const lastSpoken = useRef(0);

  // ================= REAL BACKEND DATA STATE =================
  const [detections, setDetections] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // MAP REFS
  const mapRef = useRef(null); 
  const googleMapInstance = useRef(null);
  const markersRef = useRef([]); // Track markers to clear them later

  // 1. FETCH DATA FROM YOUR BACKEND
  const fetchDetections = async () => {
    try {
      const res = await fetch('https://citysenseai.onrender.com/api/detections'); 
      const data = await res.json();
      setDetections(data);
      
      if (data.length > 0) {
        const latest = data[0];
        const logMsg = `[${new Date().toLocaleTimeString()}] DETECTED: ${latest.type.toUpperCase()} (${latest.severity})`;

        setLogs(prev => {
            // Prevent Spam
            if (prev.length > 0 && prev[prev.length - 1].includes(logMsg)) {
                return prev;
            }

            // JARVIS LOGIC (Only speak if Open/High Priority)
            const now = Date.now();
            if ((latest.severity === 'High' || latest.severity === 'Critical') && latest.status !== 'Resolved' && (now - lastSpoken.current > 5000)) {
                 // Simple Cooldown (5 seconds)
                 if (now - lastSpoken.current > 5000) {
                    lastSpoken.current = now;
                    window.speechSynthesis.cancel();
                    const speech = new SpeechSynthesisUtterance(
                        `Alert. ${latest.severity} severity ${latest.type} detected.`
                    );
                    speech.rate = 1.1; 
                    window.speechSynthesis.speak(speech);
                 }
            }

            return [...prev.slice(-4), logMsg]; 
        });
      }
      setLoading(false);
    } catch (err) {
      console.error("Backend offline?", err);
    }
  };

  // Poll for new data every 2 seconds
  useEffect(() => {
    fetchDetections();
    const interval = setInterval(fetchDetections, 2000);
    return () => clearInterval(interval);
  }, []);


  // ================= NEW: RESOLVE FUNCTION =================
  const handleResolve = async (id) => {
    try {
        // Optimistic UI Update (Instant Green)
        setDetections(prev => prev.map(d => 
            d.id === id ? { ...d, status: 'Resolved', severity: 'Low' } : d
        ));

        // Call Backend
        await fetch(`https://citysenseai.onrender.com/api/detections/${id}/resolve`, {
            method: 'PATCH'
        });
        
        // Log it
        setLogs(prev => [...prev, `[System] Issue #${id} marked as RESOLVED.`]);

    } catch (err) {
        console.error("Error resolving issue:", err);
    }
  };


  // ================= 2. GOOGLE MAP LOGIC =================
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    // Initialize Map Only Once
    if (!googleMapInstance.current) {
      googleMapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 19.0760, lng: 72.8777 }, // Mumbai
        zoom: 12,
        styles: [ 
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        ]
      });
    }

    // CLEAR OLD MARKERS (Prevent duplicates)
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // DEFINE ICONS
    const icons = {
        Critical: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        High: "http://maps.google.com/mapfiles/ms/icons/orange-dot.png",
        Medium: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
        Low: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        Resolved: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
    };

    // ADD NEW MARKERS
    detections.slice(0, 30).forEach(det => {
      
      // Determine Color: If resolved, use Green. Else use Severity.
      const iconUrl = det.status === 'Resolved' ? icons.Resolved : (icons[det.severity] || icons.Low);

      const marker = new window.google.maps.Marker({
        position: { lat: parseFloat(det.lat), lng: parseFloat(det.lng) },
        map: googleMapInstance.current,
        title: `${det.type} (${det.status})`,
        icon: iconUrl,
        animation: det.status !== 'Resolved' && det.severity === 'Critical' ? window.google.maps.Animation.BOUNCE : null
      });

      // Simple Info Window
      const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="color:black"><b>${det.type}</b><br/>Severity: ${det.severity}<br/>Status: ${det.status}</div>`
      });

      marker.addListener("click", () => {
          infoWindow.open(googleMapInstance.current, marker);
      });

      markersRef.current.push(marker);
    });

  }, [detections]); 


  // ================= SCROLL LOGS =================
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);


  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ================= HEADER ================= */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-3 px-6">
          <Link to="/" className="font-bold text-xl cursor-pointer">CitySense AI</Link>
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
        <div className="flex justify-between items-end mb-4">
            <div>
                <h1 className="text-2xl font-bold">Admin Command Center</h1>
                <p className="text-gray-600 text-sm">Real-time urban intelligence and issue management</p>
            </div>
            {/* Legend for Markers */}
            <div className="flex gap-3 text-xs bg-white p-2 rounded border">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-600"></span> Critical</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500"></span> High</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> Medium</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Resolved</span>
            </div>
        </div>

        {/* ================= LIVE PATROL MODE ================= */}
        <div className="grid grid-cols-2 gap-6 mt-6">

          {/* VIDEO PANEL */}
          <div className="bg-black rounded-xl h-[420px] relative overflow-hidden flex items-center justify-center">
            <p className="text-gray-500">Live Camera Feed (Simulation)</p>
            <div className="absolute top-3 left-3 text-white font-semibold bg-black/50 px-3 py-1 rounded">
              LIVE PATROL — Vehicle #21
            </div>
            {/* Show alert if High Priority detected */}
            {detections.length > 0 && detections[0].status !== 'Resolved' && (
              <div className="absolute border-4 border-red-500 w-40 h-32 left-24 top-24 animate-pulse rounded">
                <div className="bg-red-600 text-white text-xs px-2 py-1 absolute -top-6">
                  {detections[0].type.toUpperCase()}
                </div>
              </div>
            )}
          </div>

          {/* MAP PANEL */}
          <div className="bg-white border rounded-xl p-4 relative">
            <h3 className="font-semibold text-sm mb-2">Live Incident Map</h3>
            <div className="bg-blue-50 border rounded-lg h-[380px] relative overflow-hidden">
                <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>

        {/* ================= LIVE LOG TERMINAL ================= */}
        <div
          className="bg-black text-green-400 rounded-xl p-4 font-mono h-40 mt-6 overflow-y-auto text-sm shadow-inner"
          ref={logRef}
        >
          {logs.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>

        {/* ================= STATS & LIST ================= */}
        <div className="grid md:grid-cols-3 gap-6 mt-6 pb-10">
          
          {/* STATS CARD */}
          <div className="bg-white border rounded-xl p-5 shadow-sm h-fit">
            <p className="font-semibold text-sm">Critical Issues</p>
            <h2 className="text-5xl font-bold mt-2 text-red-600">
                {detections.filter(d => d.severity === 'Critical' && d.status !== 'Resolved').length}
            </h2>
            <p className="text-gray-500 text-xs mt-2">Requiring immediate attention</p>
            
            <div className="mt-6 pt-6 border-t">
                <p className="font-semibold text-sm">Total Resolved</p>
                <h2 className="text-3xl font-bold mt-1 text-green-600">
                    {detections.filter(d => d.status === 'Resolved').length}
                </h2>
            </div>
          </div>

          {/* LIST OF ISSUES (Spans 2 columns) */}
           <div className="md:col-span-2 bg-white border rounded-xl shadow-sm p-5">
            <h3 className="font-bold mb-4">Recent Detections Management</h3>
            <div className="overflow-y-auto h-64 pr-2">
                <ul>
                    {detections.map((d) => (
                        <li key={d.id} className={`border-b py-3 flex justify-between items-center ${d.status === 'Resolved' ? 'opacity-50' : ''}`}>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${
                                        d.status === 'Resolved' ? 'bg-green-500' :
                                        d.severity === 'Critical' ? 'bg-red-600' : 
                                        d.severity === 'High' ? 'bg-orange-500' : 'bg-yellow-400'
                                    }`}></span>
                                    <span className="font-semibold">{d.type}</span>
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{d.severity}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{new Date(d.timestamp).toLocaleTimeString()} • {d.lat}, {d.lng}</p>
                            </div>
                            
                            {/* THE RESOLVE BUTTON */}
                            {d.status !== 'Resolved' ? (
                                <button 
                                    onClick={() => handleResolve(d.id)}
                                    className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded text-sm font-medium transition"
                                >
                                    ✅ Mark Fixed
                                </button>
                            ) : (
                                <span className="text-green-600 text-sm font-bold border border-green-200 px-2 py-1 rounded">Resolved</span>
                            )}
                        </li>
                    ))}
                    {detections.length === 0 && <p className="text-gray-400 text-center py-4">System Initializing...</p>}
                </ul>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

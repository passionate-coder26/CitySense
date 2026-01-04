import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function CitizenPortal() {

  // ================= STATE & REFS =================
  const [showForm, setShowForm] = useState(false);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const googleMapInstance = useRef(null);

  // Form States
  const [formData, setFormData] = useState({ type: "Pothole", desc: "" });
  const [submitting, setSubmitting] = useState(false);

  // 1. FETCH LIVE DATA
  const fetchDetections = async () => {
    try {
      const res = await fetch('https://citysenseai.onrender.com/api/detections');
      const data = await res.json();
      setDetections(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchDetections();
    const interval = setInterval(fetchDetections, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  // 2. INITIALIZE MAP (Citizen View - Standard Light Mode)
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    if (!googleMapInstance.current) {
      googleMapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 19.0760, lng: 72.8777 }, // Mumbai
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
      });
    }

    // Add Markers
    detections.slice(0, 20).forEach(det => {
      new window.google.maps.Marker({
        position: { lat: parseFloat(det.lat), lng: parseFloat(det.lng) },
        map: googleMapInstance.current,
        title: det.type,
        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" // Standard Red Pin
      });
    });

  }, [detections]);


  // 3. HANDLE REPORT SUBMISSION
  const handleSubmit = async () => {
    setSubmitting(true);
    
    // Create a new issue object
    const newIssue = {
        type: formData.type,
        severity: "Medium", // Default for citizens
        lat: 19.0760 + (Math.random() * 0.02 - 0.01), // Random location near center (Simulated)
        lng: 72.8777 + (Math.random() * 0.02 - 0.01),
        timestamp: new Date().toISOString(),
        image_url: "https://via.placeholder.com/150"
    };

    try {
        await fetch('https://citysenseai.onrender.com/api/update-live-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newIssue)
        });
        alert("Report Submitted Successfully! check the map.");
        setShowForm(false);
        fetchDetections(); // Refresh data immediately
    } catch (error) {
        alert("Failed to submit report");
    }
    setSubmitting(false);
  };


  // STATS CALCULATION
  const criticalCount = detections.filter(d => d.severity === 'High' || d.severity === 'Critical').length;
  const userReports = detections.length; // Just using total for demo purposes

  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
          <div className="flex items-center gap-2 text-black-600 font-bold text-lg">
            <h1 className="text-xl font-bold text-black-700">CitySense AI</h1>
          </div>
          <nav className="flex gap-6 text-sm">
            <p className="text-blue-600 underline underline-offset-8">Dashboard</p>
            <Link to="/my-issues" className="hover:text-blue-600">My Issues</Link>
          </nav>
          <Link to="/" className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-100 transition">
            Home
          </Link>
        </div>
      </header>

      {/* WELCOME BANNER */}
      <div className="max-w-7xl mx-auto mt-6 bg-blue-600 text-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold">Welcome, Citizen</h2>
        <p className="text-blue-100">Help us make your city safer by reporting issues you see in your neighborhood</p>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2">

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border shadow">
              <p className="text-red-600 font-semibold flex items-center gap-2">⚠ Critical Issues Nearby</p>
              <h1 className="text-4xl font-bold mt-2">{criticalCount}</h1>
              <p className="text-sm text-gray-500">Require immediate attention</p>
            </div>

            <div className="bg-white p-4 rounded-xl border shadow">
              <p className="text-blue-600 font-semibold flex items-center gap-2">📍 Total Reports</p>
              <h1 className="text-4xl font-bold mt-2">{userReports}</h1>
              <p className="text-sm text-gray-500">Community contributions</p>
            </div>

            <div className="bg-white p-4 rounded-xl border shadow">
              <p className="text-purple-600 font-semibold flex items-center gap-2">📝 Your Reports</p>
              <h1 className="text-4xl font-bold mt-2">3</h1>
              <p className="text-sm text-blue-600 cursor-pointer">View all →</p>
            </div>
          </div>

          {/* MAP SECTION */}
          <div className="bg-white p-4 rounded-xl border shadow">
            <div className="flex justify-between">
              <h2 className="font-bold text-lg">🗺️ City Risk Map</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded">Live View</button>
              </div>
            </div>

            {/* REAL MAP CONTAINER */}
            <div className="h-80 bg-blue-50 rounded mt-3 relative overflow-hidden">
                <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            </div>

            <div className="flex justify-center gap-6 text-sm mt-3">
              <span className="flex items-center gap-1 text-red-600">⬤ Critical</span>
              <span className="flex items-center gap-1 text-green-500">⬤ Safe</span>
            </div>
          </div>

          {/* SAFETY TIPS */}
          <div className="bg-white p-5 rounded-xl shadow border mt-6">
            <h2 className="text-blue-700 font-bold text-lg">🛡️ Safety Tips in High-Risk Zones</h2>
            <ul className="mt-3 text-gray-700 space-y-2">
              <li>✔ Avoid potholes & uneven surfaces — take alternate routes</li>
              <li>✔ Report issues immediately using the form on the right</li>
            </ul>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4">
          {/* Report Issue Card */}
          <div className="bg-white rounded-xl shadow border p-4">
            <h2 className="font-bold text-lg">📝 Report an Issue</h2>
            <p className="text-gray-600 text-sm mt-1">Saw a pothole, broken sidewalk, or other civic issue? Let us know!</p>

            <button
              onClick={() => setShowForm(!showForm)}
              className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              {showForm ? "Close Form" : "Submit Report"}
            </button>

            {/* SLIDING FORM */}
            <div className={`mt-4 overflow-hidden transition-all duration-500 ${showForm ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
              
              <label className="text-sm font-semibold">Issue Type</label>
              <select 
                className="w-full border rounded p-2 mt-1"
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="Pothole">Pothole / Damaged Road</option>
                <option value="Streetlight">Streetlight Issue</option>
                <option value="Garbage">Garbage / Cleanliness</option>
                <option value="Water">Water Logging</option>
              </select>

              <label className="text-sm font-semibold mt-3 block">Description</label>
              <textarea
                className="w-full border rounded p-2 mt-1"
                rows="3"
                placeholder="Describe the issue..."
                onChange={(e) => setFormData({...formData, desc: e.target.value})}
              ></textarea>

              <div className="flex gap-3 mt-4">
                <button 
                    onClick={handleSubmit} 
                    disabled={submitting}
                    className="bg-blue-600 text-white px-5 py-2 rounded"
                >
                  {submitting ? "Sending..." : "Submit"}
                </button>
              </div>
            </div>
          </div>

          {/* Issue Details (Static for now) */}
          <div className="bg-white rounded-xl shadow border p-4">
            <h2 className="font-bold text-lg">📄 Issue Details</h2>
            <p className="text-gray-500 text-sm mt-2">Click on a map marker to view details</p>
          </div>
        </div>

      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function MyIssues() {
  const [issuesData, setIssuesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // 1. FETCH REAL DATA FROM BACKEND
  useEffect(() => {
    fetch('https://citysenseai.onrender.com/api/detections')
      .then(res => res.json())
      .then(data => {
        // We need to map your Backend data to match the UI format she expects
        const formattedData = data.map(d => ({
            title: d.type || "Reported Issue",
            desc: `Detected at Lat: ${d.lat}, Lng: ${d.lng}`,
            date: new Date(d.timestamp).toLocaleDateString(),
            // Logic to assign status based on severity (Simulation)
            status: d.severity === 'High' ? 'Pending' : 'In progress', 
            risk: d.severity === 'High' ? 'Critical' : 'Moderate',
            color: d.severity === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
        }));
        setIssuesData(formattedData);
        setLoading(false);
      })
      .catch(err => console.error("Error:", err));
  }, []);

  // 2. FILTER LOGIC
  const filteredIssues = issuesData.filter(issue => {
    const matchesSearch =
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.desc.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ? true : issue.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* HEADER */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
          <div className="flex items-center gap-2 text-black-600 font-bold text-lg">
             <h1 className="text-xl font-bold text-black-700">
              CitySense AI
            </h1>
          </div>

          <nav className="flex gap-6 text-sm">
            <Link to="/citizen" className="hover:text-blue-600">
              Dashboard
            </Link>
            <span className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">
              My Issues
            </span>
          </nav>

          <Link 
            to="/" 
            className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-100 transition"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-6">

        {/* TITLE */}
        <h1 className="text-2xl font-bold">My Submitted Issues</h1>
        <p className="text-gray-600 text-sm">
          Track the status of issues you've reported to help improve your community
        </p>

        {/* STATUS CARDS (Dynamic Counts) */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white border rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="text-orange-500 text-xl">🕒</div>
            <div>
              <h3 className="font-semibold">Pending Review</h3>
              <p className="text-2xl font-bold">
                {issuesData.filter(i => i.status === "Pending").length}
              </p>
              <span className="text-gray-500 text-xs">Awaiting admin action</span>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="text-blue-500 text-xl">🔄</div>
            <div>
              <h3 className="font-semibold">In Progress</h3>
              <p className="text-2xl font-bold">
                {issuesData.filter(i => i.status === "In progress").length}
              </p>
              <span className="text-gray-500 text-xs">Being addressed</span>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="text-green-500 text-xl">✔️</div>
            <div>
              <h3 className="font-semibold">Resolved</h3>
              <p className="text-2xl font-bold">
                {issuesData.filter(i => i.status === "Resolved").length}
              </p>
              <span className="text-gray-500 text-xs">Completed</span>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">

          {/* LEFT SIDE */}
          <div className="md:col-span-2">

            {/* FILTER BOX */}
            <div className="bg-white border rounded-xl shadow-sm p-5 mb-4">
              <h4 className="font-semibold text-sm mb-2">Filter Issues</h4>

              <input
                type="text"
                placeholder="Search your submissions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-blue-500"
              />

              <div className="mt-3 text-sm">
                <p className="font-semibold mb-1">Status</p>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setStatusFilter("All")}
                    className={`px-3 py-1 rounded-lg text-xs ${
                      statusFilter === "All"
                        ? "bg-blue-600 text-white"
                        : "border"
                    }`}
                  >
                    All Issues
                  </button>

                  <button
                    onClick={() => setStatusFilter("Pending")}
                    className={`px-3 py-1 rounded-lg text-xs ${
                      statusFilter === "Pending"
                        ? "bg-blue-600 text-white"
                        : "border"
                    }`}
                  >
                    Pending
                  </button>

                  <button
                    onClick={() => setStatusFilter("In progress")}
                    className={`px-3 py-1 rounded-lg text-xs ${
                      statusFilter === "In progress"
                        ? "bg-blue-600 text-white"
                        : "border"
                    }`}
                  >
                    In progress
                  </button>

                  <button
                    onClick={() => setStatusFilter("Resolved")}
                    className={`px-3 py-1 rounded-lg text-xs ${
                      statusFilter === "Resolved"
                        ? "bg-blue-600 text-white"
                        : "border"
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>
            </div>

            {/* ISSUE LIST */}
            <div className="space-y-4">
              {loading && <p className="text-center text-gray-500">Loading your issues...</p>}
              
              {!loading && filteredIssues.length > 0 ? (
                filteredIssues.map((issue, index) => (
                  <div
                    key={index}
                    className="bg-white border rounded-xl shadow-sm p-4 flex justify-between items-start"
                  >
                    <div>
                      <h3 className="font-semibold capitalize">{issue.title}</h3>
                      <p className="text-sm text-gray-600">{issue.desc}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Submitted: {issue.date}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`${issue.color} px-3 py-1 rounded-full text-xs`}
                      >
                        {issue.status}
                      </span>
                      <p className="text-xs text-gray-600 mt-2">
                        Risk: {issue.risk}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                !loading && <p className="text-gray-500 text-sm">No matching issues found.</p>
              )}
            </div>
          </div>

          {/* RIGHT DETAILS CARD */}
          <div className="bg-white border rounded-xl shadow-sm p-5 h-fit">
            <h3 className="font-semibold mb-3">Issue Details</h3>
            <p className="text-gray-500 text-sm">
              Select an issue to view details
            </p>
          </div>

        </div>
      </main>

      <p className="text-center text-gray-500 text-sm mt-10 mb-8">
        © 2025 CitySense AI
      </p>
    </div>
  );
}

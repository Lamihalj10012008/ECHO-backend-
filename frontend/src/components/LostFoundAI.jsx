import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../context/StudentContext";
import "./LostFoundAI.css";

const RECENT_LOST = [
  { id: 1, name: "Black MacBook Pro 14\"", category: "Electronics", location: "Library Block B", time: "2h ago", status: "open" },
  { id: 2, name: "Blue Insulated Water Bottle", category: "Accessories", location: "Sports Complex", time: "4h ago", status: "matched" },
  { id: 3, name: "Student ID Card (CS2024)", category: "Documents", location: "Cafeteria", time: "1d ago", status: "open" },
];

const RECENT_FOUND = [
  { id: 1, name: "Black Leather Wallet", category: "Accessories", location: "Admin Block", time: "1h ago", status: "unclaimed" },
  { id: 2, name: "iPhone 14 (Space Gray)", category: "Electronics", location: "Main Auditorium", time: "3h ago", status: "unclaimed" },
  { id: 3, name: "Set of 3 Keys (Honda keychain)", category: "Keys", location: "Parking Lot C", time: "5h ago", status: "claimed" },
];

export default function LostFoundAI() {
  const navigate = useNavigate();
  const { student } = useStudent();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);

  const stats = [
    { label: "Lost Items", value: "47", sub: "+3 today", color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: "📤" },
    { label: "Found Items", value: "38", sub: "+2 today", color: "#4f8ef7", bg: "rgba(79,142,247,0.1)", icon: "📥" },
    { label: "AI Matches", value: "23", sub: "this week", color: "#a855f7", bg: "rgba(168,85,247,0.1)", icon: "🤖" },
    { label: "Recovery Rate", value: "61%", sub: "+4% vs last month", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: "✅" },
  ];

  const pickFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("http://127.0.0.1:8000/lost-found-ai", { method: "POST", body: fd });
      const data = await res.json();
      setResult(data.result);
    } catch {
      alert("Backend not reachable. Ensure the FastAPI server is running on port 8000.");
    }
    setLoading(false);
  };

  const firstName = student?.name?.split(" ")[0] || "Student";

  return (
    <div className="hub-wrap">

      {/* ── WELCOME BANNER ── */}
      <div className="hub-banner">
        <div className="hub-banner-left">
          <h1>Welcome back, <span className="hub-name">{firstName}</span> 👋</h1>
          <p>Smart campus lost &amp; found — powered by AI. Let's help you recover what matters.</p>
        </div>
        <div className="hub-banner-right">
          <span className="hub-live-badge">● LIVE</span>
          <span className="hub-dept-tag">{student?.department}</span>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div className="hub-stats">
        {stats.map((s, i) => (
          <div key={i} className="hub-stat-card">
            <div className="hub-stat-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div className="hub-stat-body">
              <span className="hub-stat-label">{s.label}</span>
              <strong className="hub-stat-val" style={{ color: s.color }}>{s.value}</strong>
              <span className="hub-stat-sub">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── AI ANALYSER ── */}
      <div className="hub-ai-section">
        <div className="hub-section-header">
          <div>
            <h2>🤖 AI Item Analyser</h2>
            <p>Upload an image of your lost item — AI will identify it and suggest likely locations</p>
          </div>
        </div>

        <div className="hub-ai-grid">
          {/* Upload panel */}
          <div className="hub-panel">
            <p className="hub-panel-label">Upload Image</p>

            <label
              className={`hub-upload-zone ${drag ? "hub-drag-over" : ""} ${preview ? "hub-has-img" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
            >
              {preview ? (
                <img src={preview} alt="preview" className="hub-preview" />
              ) : (
                <div className="hub-upload-hint">
                  <div className="hub-upload-icon-wrap">📸</div>
                  <strong>Drop image here</strong>
                  <span>or click to browse</span>
                  <p>JPG · PNG · WEBP · up to 10 MB</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => pickFile(e.target.files?.[0])} hidden />
            </label>

            {preview && (
              <button
                className="hub-clear-btn"
                onClick={() => { setFile(null); setPreview(null); setResult(null); }}
              >
                ✕ Remove image
              </button>
            )}

            <button
              className={`hub-analyze-btn ${loading ? "hub-btn-busy" : ""}`}
              onClick={analyze}
              disabled={!file || loading}
            >
              {loading ? (
                <><span className="hub-spin" /> Analysing…</>
              ) : (
                "🔍 Analyse with AI"
              )}
            </button>
          </div>

          {/* Result panel */}
          <div className="hub-panel hub-result-panel">
            <p className="hub-panel-label">AI Result</p>

            {!result && !loading && (
              <div className="hub-result-empty">
                <div className="hub-result-empty-icon">🔍</div>
                <strong>No image analysed yet</strong>
                <p>Upload a photo of your lost item to receive AI-powered detection and campus location matching.</p>
              </div>
            )}

            {loading && (
              <div className="hub-result-scanning">
                <div className="hub-pulse" />
                <strong>Scanning with AI…</strong>
                <p>Cross-referencing campus database</p>
              </div>
            )}

            {result && !loading && (
              <div className="hub-result-data">
                <div className="hub-result-row">
                  <span>Detected Item</span>
                  <strong>{result.item}</strong>
                </div>
                {result.category && (
                  <div className="hub-result-row">
                    <span>Category</span>
                    <strong>{result.category}</strong>
                  </div>
                )}
                <div className="hub-result-row">
                  <span>Likely Location</span>
                  <strong>📍 {result.location}</strong>
                </div>
                <div className="hub-result-row">
                  <span>AI Confidence</span>
                  <div className="hub-conf-wrap">
                    <div className="hub-conf-track">
                      <div className="hub-conf-fill" style={{ width: result.confidence }} />
                    </div>
                    <span className="hub-conf-pct">{result.confidence}</span>
                  </div>
                </div>
                {result.description && (
                  <div className="hub-result-desc">
                    <span>🔍</span>
                    <p>{result.description}</p>
                  </div>
                )}
                <div className="hub-result-action-box">
                  <span>✅</span>
                  <div>
                    <strong>Next Step</strong>
                    <p>Visit the Lost &amp; Found desk with your Student ID to report or claim this item.</p>
                  </div>
                </div>
                <button className="hub-report-btn" onClick={() => navigate("report-lost")}>
                  Log as Lost Item →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="hub-quick-row">
        <button className="hub-qbtn hub-qbtn-red" onClick={() => navigate("report-lost")}>
          <span className="hub-qbtn-icon">📤</span>
          <div>
            <strong>Report Lost Item</strong>
            <small>Log a missing item with details</small>
          </div>
          <span className="hub-qbtn-arrow">→</span>
        </button>
        <button className="hub-qbtn hub-qbtn-blue" onClick={() => navigate("report-found")}>
          <span className="hub-qbtn-icon">📥</span>
          <div>
            <strong>Report Found Item</strong>
            <small>Help return an item you found</small>
          </div>
          <span className="hub-qbtn-arrow">→</span>
        </button>
        <button className="hub-qbtn hub-qbtn-purple" onClick={() => navigate("match-results")}>
          <span className="hub-qbtn-icon">🤖</span>
          <div>
            <strong>View AI Matches</strong>
            <small>See potential item matches</small>
          </div>
          <span className="hub-qbtn-arrow">→</span>
        </button>
      </div>

      {/* ── RECENT ACTIVITY ── */}
      <div className="hub-recent-grid">
        <div className="hub-recent-col">
          <div className="hub-recent-header">
            <h3>Recent Lost Reports</h3>
            <button className="hub-view-all" onClick={() => navigate("report-lost")}>View all →</button>
          </div>
          <div className="hub-item-list">
            {RECENT_LOST.map((item) => (
              <div key={item.id} className="hub-item-row">
                <div className={`hub-item-dot ${item.status === "matched" ? "dot-green" : "dot-red"}`} />
                <div className="hub-item-info">
                  <strong>{item.name}</strong>
                  <span>📍 {item.location} · {item.category}</span>
                </div>
                <div className="hub-item-meta">
                  <span className={`hub-pill hub-pill-${item.status}`}>
                    {item.status === "matched" ? "✓ Matched" : "Open"}
                  </span>
                  <small>{item.time}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hub-recent-col">
          <div className="hub-recent-header">
            <h3>Recent Found Reports</h3>
            <button className="hub-view-all" onClick={() => navigate("report-found")}>View all →</button>
          </div>
          <div className="hub-item-list">
            {RECENT_FOUND.map((item) => (
              <div key={item.id} className="hub-item-row">
                <div className={`hub-item-dot ${item.status === "claimed" ? "dot-green" : "dot-blue"}`} />
                <div className="hub-item-info">
                  <strong>{item.name}</strong>
                  <span>📍 {item.location} · {item.category}</span>
                </div>
                <div className="hub-item-meta">
                  <span className={`hub-pill hub-pill-${item.status}`}>
                    {item.status === "claimed" ? "✓ Claimed" : "Unclaimed"}
                  </span>
                  <small>{item.time}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

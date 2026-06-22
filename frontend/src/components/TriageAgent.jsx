import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../context/StudentContext";
import "./TriageAgent.css";

/* ── Metadata maps ─────────────────────────────────────────────────────────── */
const CATEGORY_META = {
  "Facilities":   { icon: "🏗", color: "#f97316", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.25)" },
  "Stress":       { icon: "🧠", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.25)" },
  "Lost & Found": { icon: "🔍", color: "#4f8ef7", bg: "rgba(79,142,247,0.1)",  border: "rgba(79,142,247,0.25)" },
  "Events":       { icon: "📅", color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)" },
  "General":      { icon: "💬", color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.2)" },
};

const SENTIMENT_META = {
  "Positive": { icon: "😊", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  "Negative": { icon: "😟", color: "#ef4444", bg: "rgba(239,68,68,0.1)"  },
  "Neutral":  { icon: "😐", color: "#64748b", bg: "rgba(100,116,139,0.1)" },
};

const URGENCY_META = {
  "High":   { icon: "🔴", label: "High Priority",   color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  "Medium": { icon: "🟡", label: "Medium Priority",  color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  "Low":    { icon: "🟢", label: "Low Priority",     color: "#10b981", bg: "rgba(16,185,129,0.1)" },
};

const NEXT_STEPS = {
  "Facilities Agent": "Your issue has been routed to the Facilities team. Expect a response within 24 hours. You can track progress in the Help desk portal.",
  "Stress Agent":     "A wellness counselor has been notified. Visit the Counseling Centre (Block C, Room 104) or call the 24/7 helpline. The Stress Management module has guided exercises.",
  "Lost Agent":       "Your case has been logged in the Lost & Found system. AI matching is scanning all found-item reports for your item right now.",
  "Event Agent":      "The Events & Activities team has received your query and will respond with the relevant information within a few hours.",
  "Support Agent":    "Our general support team will review your request and respond within 2 business hours via your registered email.",
};

const QUICK_PROMPTS = [
  { label: "Hostel issue",    text: "My hostel room has a maintenance issue — the plumbing is broken and water is leaking" },
  { label: "Exam stress",     text: "I'm feeling overwhelmed and anxious about my upcoming exams and I can't sleep properly" },
  { label: "Lost ID",         text: "I lost my student ID card somewhere near the cafeteria or library earlier today" },
  { label: "Lab problem",     text: "There is an urgent maintenance issue in the computer lab — several machines are not working" },
  { label: "Event info",      text: "I need information about the upcoming college cultural fest and how to register" },
];

const AGENTS = [
  { cat: "Facilities",   icon: "🏗", color: "#f97316", bg: "rgba(249,115,22,0.1)", agent: "Facilities Agent" },
  { cat: "Stress",       icon: "🧠", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", agent: "Stress Agent" },
  { cat: "Lost & Found", icon: "🔍", color: "#4f8ef7", bg: "rgba(79,142,247,0.1)", agent: "Lost Agent" },
  { cat: "Events",       icon: "📅", color: "#10b981", bg: "rgba(16,185,129,0.1)", agent: "Event Agent" },
  { cat: "General",      icon: "💬", color: "#64748b", bg: "rgba(100,116,139,0.1)", agent: "Support Agent" },
];

const MIN_LENGTH = 20;

export default function TriageAgent() {
  const navigate   = useNavigate();
  const { student } = useStudent();
  const firstName  = student?.name?.split(" ")[0] || "Student";

  const [message,  setMessage]  = useState("");
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [history,  setHistory]  = useState([]);

  const charCount = message.trim().length;
  const canSubmit = charCount >= MIN_LENGTH && !loading;

  const usePrompt = (text) => { setMessage(text); setResult(null); setError(""); };

  const analyzeComplaint = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint: message }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setResult(data);
      setHistory((p) => [
        {
          complaint: message.length > 72 ? message.slice(0, 72) + "…" : message,
          result: data,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        ...p.slice(0, 4),
      ]);
    } catch (err) {
      setError(err.message || "Could not reach the server. Make sure the backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const catMeta  = result ? (CATEGORY_META[result.category]   || CATEGORY_META["General"])  : null;
  const sentMeta = result ? (SENTIMENT_META[result.sentiment]  || SENTIMENT_META["Neutral"]) : null;
  const urgMeta  = result ? (URGENCY_META[result.urgency]      || URGENCY_META["Medium"])    : null;
  const nextStep = result ? (NEXT_STEPS[result.assignedAgent]  || NEXT_STEPS["Support Agent"]) : null;

  return (
    <div className="ta-page">

      {/* ── HERO ── */}
      <div className="ta-hero">
        <div className="ta-hero-left">
          <span className="ta-pill">🧠 AI Triage System</span>
          <h1>How can we help you, {firstName}?</h1>
          <p>
            Describe your issue and AI will classify it, assess urgency,
            and route it to the right campus team instantly.
          </p>
        </div>
        <div className="ta-hero-actions">
          <button className="ta-hero-btn ta-hero-ghost" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
          <button className="ta-hero-btn ta-hero-outline" onClick={() => navigate("/stress-management")}>
            🧘 Wellness
          </button>
        </div>
      </div>

      <div className="ta-layout">

        {/* ══ LEFT COLUMN ══ */}
        <div className="ta-main-col">

          {/* Input card */}
          <div className="ta-card">
            <div className="ta-card-head">
              <h2>📝 Submit Your Issue</h2>
              <span className="ta-card-sub">Be descriptive — more detail means smarter routing</span>
            </div>

            {/* Quick prompts */}
            <div>
              <p className="ta-prompts-label">Quick prompts — click to use:</p>
              <div className="ta-prompts-row">
                {QUICK_PROMPTS.map((p, i) => (
                  <button key={i} className="ta-prompt-chip" onClick={() => usePrompt(p.text)}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="ta-textarea-wrap">
              <textarea
                className={`ta-textarea ${charCount > 0 && charCount < MIN_LENGTH ? "ta-textarea-warn" : ""}`}
                placeholder="Describe your issue in detail… e.g. My hostel room has a water leakage and it's been two days without a fix."
                value={message}
                onChange={(e) => { setMessage(e.target.value); setResult(null); setError(""); }}
                rows={5}
              />
              <div className="ta-char-row">
                <span className={charCount > 0 && charCount < MIN_LENGTH ? "ta-char-warn" : "ta-char-ok"}>
                  {charCount > 0 && charCount < MIN_LENGTH
                    ? `${MIN_LENGTH - charCount} more character${MIN_LENGTH - charCount !== 1 ? "s" : ""} needed`
                    : charCount > 0 ? `${charCount} characters` : `Min ${MIN_LENGTH} characters`}
                </span>
                <span className="ta-char-count">{charCount}</span>
              </div>
            </div>

            {error && (
              <div className="ta-error-box">
                <span>⚠️</span>
                <div>
                  <strong>Something went wrong</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <button
              className={`ta-submit-btn ${loading ? "ta-btn-busy" : ""} ${!canSubmit ? "ta-btn-disabled" : ""}`}
              onClick={analyzeComplaint}
              disabled={!canSubmit}
            >
              {loading
                ? <><span className="ta-spin" /> Analysing with AI…</>
                : "🧠 Analyse & Route Issue"}
            </button>
          </div>

          {/* Result card */}
          {result && !loading && (
            <div className="ta-result-card">
              {/* Header */}
              <div className="ta-result-header">
                <div
                  className="ta-result-cat-badge"
                  style={{ color: catMeta.color, background: catMeta.bg, border: `1px solid ${catMeta.border}` }}
                >
                  <span className="ta-result-cat-icon">{catMeta.icon}</span>
                  <div>
                    <span className="ta-result-cat-label">Category</span>
                    <strong className="ta-result-cat-name">{result.category}</strong>
                  </div>
                </div>
                <div className="ta-result-heading">
                  <h2>✅ Analysis Complete</h2>
                  <span>Routed to <strong>{result.assignedAgent}</strong></span>
                </div>
              </div>

              {/* 4-cell grid */}
              <div className="ta-result-grid">

                <div className="ta-result-box" style={{ borderColor: sentMeta.color + "33" }}>
                  <span className="ta-rbox-label">Sentiment</span>
                  <div className="ta-rbox-badge" style={{ color: sentMeta.color, background: sentMeta.bg }}>
                    {sentMeta.icon} {result.sentiment}
                  </div>
                </div>

                <div className="ta-result-box" style={{ borderColor: urgMeta.color + "33" }}>
                  <span className="ta-rbox-label">Priority</span>
                  <div className="ta-rbox-badge" style={{ color: urgMeta.color, background: urgMeta.bg }}>
                    {urgMeta.icon} {urgMeta.label}
                  </div>
                </div>

                <div className="ta-result-box" style={{ borderColor: catMeta.color + "33" }}>
                  <span className="ta-rbox-label">Department</span>
                  <div className="ta-rbox-badge" style={{ color: catMeta.color, background: catMeta.bg }}>
                    {catMeta.icon} {result.category}
                  </div>
                </div>

                <div className="ta-result-box">
                  <span className="ta-rbox-label">Assigned To</span>
                  <div className="ta-rbox-badge ta-badge-blue">
                    🤖 {result.assignedAgent}
                  </div>
                </div>

              </div>

              {/* Next step */}
              <div className="ta-next-step">
                <div className="ta-next-icon">📋</div>
                <div>
                  <strong>What happens next?</strong>
                  <p>{nextStep}</p>
                </div>
              </div>

              {/* Stress-specific CTA */}
              {result.category === "Stress" && (
                <button className="ta-wellness-cta" onClick={() => navigate("/stress-management")}>
                  🧘 Open Stress Management Centre — try a breathing exercise →
                </button>
              )}

              {/* Submit another */}
              <button
                className="ta-new-btn"
                onClick={() => { setMessage(""); setResult(null); setError(""); }}
              >
                + Submit Another Issue
              </button>
            </div>
          )}

        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="ta-side-col">

          {/* How it works */}
          <div className="ta-card ta-how-card">
            <h3>⚙️ How It Works</h3>
            <ol className="ta-steps-list">
              <li><strong>Describe</strong> your issue in detail</li>
              <li><strong>AI analyses</strong> sentiment &amp; urgency</li>
              <li>Issue is <strong>categorised</strong> automatically</li>
              <li>Routed to the correct <strong>campus team</strong></li>
              <li>You receive <strong>next steps</strong> immediately</li>
            </ol>
          </div>

          {/* Session history */}
          {history.length > 0 && (
            <div className="ta-card">
              <h3>🕐 Recent Submissions</h3>
              <div className="ta-history-list">
                {history.map((h, i) => {
                  const hc = CATEGORY_META[h.result.category] || CATEGORY_META["General"];
                  const hu = URGENCY_META[h.result.urgency]   || URGENCY_META["Medium"];
                  return (
                    <div key={i} className="ta-history-row">
                      <div className="ta-hist-icon" style={{ color: hc.color, background: hc.bg }}>
                        {hc.icon}
                      </div>
                      <div className="ta-hist-body">
                        <strong style={{ color: hc.color }}>{h.result.category}</strong>
                        <span className="ta-hist-text">{h.complaint}</span>
                        <span style={{ fontSize: 10, color: hu.color, fontWeight: 700 }}>
                          {hu.icon} {h.result.urgency} priority
                        </span>
                      </div>
                      <span className="ta-hist-time">{h.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Campus agent directory */}
          <div className="ta-card">
            <h3>👥 Campus Agent Directory</h3>
            <div className="ta-agents-list">
              {AGENTS.map((a) => (
                <div key={a.cat} className="ta-agent-row">
                  <div className="ta-agent-icon" style={{ color: a.color, background: a.bg }}>
                    {a.icon}
                  </div>
                  <div className="ta-agent-info">
                    <strong>{a.cat}</strong>
                    <span>→ {a.agent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../context/StudentContext";
import "./StressManagement.css";

const QUESTIONS = [
  {
    id: "mood",
    label: "How are you feeling right now?",
    icon: "💛",
    options: [
      { emoji: "😔", label: "Very Stressed", score: 1, color: "#ef4444" },
      { emoji: "😟", label: "Stressed",      score: 2, color: "#f97316" },
      { emoji: "😐", label: "Neutral",       score: 3, color: "#eab308" },
      { emoji: "😊", label: "Good",          score: 4, color: "#22c55e" },
      { emoji: "😄", label: "Great",         score: 5, color: "#10b981" },
    ],
  },
  {
    id: "stress",
    label: "How stressed do you feel today?",
    icon: "🧠",
    options: [
      { emoji: "😌", label: "Very Low",  score: 5, color: "#10b981" },
      { emoji: "🙂", label: "Low",       score: 4, color: "#22c55e" },
      { emoji: "😤", label: "Moderate",  score: 3, color: "#eab308" },
      { emoji: "😰", label: "High",      score: 2, color: "#f97316" },
      { emoji: "🤯", label: "Very High", score: 1, color: "#ef4444" },
    ],
  },
  {
    id: "sleep",
    label: "How well did you sleep last night?",
    icon: "🌙",
    options: [
      { emoji: "😫", label: "Terrible", score: 1, color: "#ef4444" },
      { emoji: "😪", label: "Poor",     score: 2, color: "#f97316" },
      { emoji: "😑", label: "Fair",     score: 3, color: "#eab308" },
      { emoji: "😴", label: "Good",     score: 4, color: "#22c55e" },
      { emoji: "🌟", label: "Great",    score: 5, color: "#10b981" },
    ],
  },
  {
    id: "energy",
    label: "What's your energy level right now?",
    icon: "⚡",
    options: [
      { emoji: "🪫", label: "Drained",   score: 1, color: "#ef4444" },
      { emoji: "😩", label: "Low",       score: 2, color: "#f97316" },
      { emoji: "😐", label: "Moderate",  score: 3, color: "#eab308" },
      { emoji: "😊", label: "High",      score: 4, color: "#22c55e" },
      { emoji: "🚀", label: "Energised", score: 5, color: "#10b981" },
    ],
  },
  {
    id: "wellbeing",
    label: "Overall, how is your wellbeing today?",
    icon: "🌿",
    options: [
      { emoji: "💔", label: "Struggling", score: 1, color: "#ef4444" },
      { emoji: "😔", label: "Not Great",  score: 2, color: "#f97316" },
      { emoji: "🙂", label: "Okay",       score: 3, color: "#eab308" },
      { emoji: "😊", label: "Good",       score: 4, color: "#22c55e" },
      { emoji: "✨", label: "Thriving",   score: 5, color: "#10b981" },
    ],
  },
];

/* Box breathing: 4 s inhale · 4 s hold · 4 s exhale · 4 s hold */
const BREATH_PHASES = [
  { name: "Inhale",  duration: 4, instruction: "Breathe in slowly…",      scale: 1.42 },
  { name: "Hold",    duration: 4, instruction: "Hold your breath…",        scale: 1.42 },
  { name: "Exhale",  duration: 4, instruction: "Breathe out gently…",      scale: 1.0  },
  { name: "Hold",    duration: 4, instruction: "Pause before next cycle…", scale: 1.0  },
];

const MOCK_MENTOR = {
  id: 1,
  name: "Dr. Aisha Patel",
  designation: "Associate Professor",
  department: "Computer Science & Engineering",
  email: "aisha.patel@campus.edu",
  phone: "+1-555-0192",
  office: "Block A, Room 204",
  availability: "available",
  availability_hours: "Mon–Fri, 9 AM – 5 PM",
  specialization: "Academic Stress, Career Guidance, Research",
};

const CONNECT_REASONS = [
  { id: "academic", icon: "📚", label: "Academic Guidance" },
  { id: "stress",   icon: "🧘", label: "Stress Management" },
  { id: "career",   icon: "💼", label: "Career Advice" },
  { id: "personal", icon: "💬", label: "Personal Concern" },
  { id: "meeting",  icon: "📅", label: "Schedule Meeting" },
];

const URGENCY_OPTS = ["low", "medium", "high"];
const TIME_SLOTS   = ["9:00 AM", "10:30 AM", "12:00 PM", "2:00 PM", "3:30 PM", "5:00 PM"];

const TIPS = [
  "Take a 5-minute walk between classes to reset your mind",
  "Stay hydrated — dehydration increases anxiety",
  "Sleep 7–8 hours to improve focus and mood",
  "Break big assignments into small, timed steps",
  "Talk to a friend or counselor when feeling overwhelmed",
];

export default function StressManagement() {
  const navigate   = useNavigate();
  const { student } = useStudent();
  const firstName  = student?.name?.split(" ")[0] || "Student";
  const studentId  = student?.studentId || "Student";
  const today      = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  /* ── Mood check-in ─────────────────────────────────────────────────────── */
  const [qStep,       setQStep]       = useState(0);
  const [answers,     setAnswers]     = useState(Array(QUESTIONS.length).fill(null));
  const [moodHistory, setMoodHistory] = useState([]);
  const [submitted,   setSubmitted]   = useState(false);

  const handleAnswer = (stepIdx, opt) => {
    const next = [...answers];
    next[stepIdx] = opt;
    setAnswers(next);
    setTimeout(() => setQStep(stepIdx + 1), 350);
  };

  const submitMood = () => {
    const total    = answers.reduce((sum, a) => sum + (a?.score || 0), 0);
    const avgScore = (total / QUESTIONS.length).toFixed(1);
    setMoodHistory((p) => [
      { answers, avgScore, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ...p,
    ]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setQStep(0);
      setAnswers(Array(QUESTIONS.length).fill(null));
    }, 2400);
  };

  /* ── Breathing exercise ────────────────────────────────────────────────── */
  const [breathing,  setBreathing]  = useState(false);
  const [phaseIdx,   setPhaseIdx]   = useState(0);
  const [phaseCount, setPhaseCount] = useState(BREATH_PHASES[0].duration);
  const [cycles,     setCycles]     = useState(0);
  const breathRef = useRef({ phaseIdx: 0, count: BREATH_PHASES[0].duration });
  const timerRef  = useRef(null);

  useEffect(() => {
    if (!breathing) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      const cur = breathRef.current;
      if (cur.count <= 1) {
        const next = (cur.phaseIdx + 1) % BREATH_PHASES.length;
        breathRef.current = { phaseIdx: next, count: BREATH_PHASES[next].duration };
        setPhaseIdx(next);
        setPhaseCount(BREATH_PHASES[next].duration);
        if (next === 0) setCycles((c) => c + 1);
      } else {
        breathRef.current = { ...cur, count: cur.count - 1 };
        setPhaseCount(cur.count - 1);
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [breathing]);

  const startBreathing = () => {
    breathRef.current = { phaseIdx: 0, count: BREATH_PHASES[0].duration };
    setPhaseIdx(0);
    setPhaseCount(BREATH_PHASES[0].duration);
    setCycles(0);
    setBreathing(true);
  };
  const stopBreathing = () => { setBreathing(false); };

  const currentPhase = BREATH_PHASES[phaseIdx];
  const avgMood = moodHistory.length
    ? (moodHistory.reduce((sum, e) => sum + parseFloat(e.avgScore), 0) / moodHistory.length).toFixed(1)
    : null;

  /* ── Mentor Support ────────────────────────────────────────────────────── */
  const [mentor,        setMentor]        = useState(null);
  const [mentorLoading, setMentorLoading] = useState(true);
  const [editingMentor, setEditingMentor] = useState(false);
  const [mentorDraft,   setMentorDraft]   = useState({});
  const [connectOpen,   setConnectOpen]   = useState(false);
  const [connectReason, setConnectReason] = useState(null);

  const saveMentorDraft = () => {
    setMentor(mentorDraft);
    try { localStorage.setItem(`echo_mentor_${studentId}`, JSON.stringify(mentorDraft)); } catch {}
    setEditingMentor(false);
  };

  // Support request form
  const [srUrgency, setSrUrgency] = useState("medium");
  const [srMessage, setSrMessage] = useState("");
  const [srStatus,  setSrStatus]  = useState(null); // null | "sending" | "sent" | "error"

  // Meeting form
  const [mtgDate,   setMtgDate]   = useState("");
  const [mtgTime,   setMtgTime]   = useState("");
  const [mtgTopic,  setMtgTopic]  = useState("");
  const [mtgStatus, setMtgStatus] = useState(null); // null | "sending" | "sent" | "error"

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`echo_mentor_${studentId}`);
      if (saved) { setMentor(JSON.parse(saved)); setMentorLoading(false); return; }
    } catch {}
    fetch(`http://127.0.0.1:8000/mentor/${studentId}`)
      .then((r) => r.json())
      .then((d) => setMentor(d))
      .catch(() => setMentor(MOCK_MENTOR))
      .finally(() => setMentorLoading(false));
  }, [studentId]);

  const sendSupportRequest = async () => {
    if (!srMessage.trim()) return;
    setSrStatus("sending");
    const categoryLabel = CONNECT_REASONS.find((r) => r.id === connectReason)?.label || "General";
    const fullMessage   = `[${categoryLabel}] ${srMessage.trim()}`;
    try {
      const res = await fetch("http://127.0.0.1:8000/support-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, message: fullMessage, urgency: srUrgency }),
      });
      if (!res.ok) throw new Error();
      setSrStatus("sent");
      setSrMessage("");
      setSrUrgency("medium");
      setTimeout(() => { setSrStatus(null); setConnectOpen(false); setConnectReason(null); }, 3000);
    } catch {
      setSrStatus("error");
    }
  };

  const scheduleMeeting = async () => {
    if (!mtgDate || !mtgTime || !mtgTopic.trim()) return;
    setMtgStatus("sending");
    try {
      const res = await fetch("http://127.0.0.1:8000/schedule-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, preferred_date: mtgDate, preferred_time: mtgTime, topic: mtgTopic.trim() }),
      });
      if (!res.ok) throw new Error();
      setMtgStatus("sent");
      setMtgDate(""); setMtgTime(""); setMtgTopic("");
      setTimeout(() => { setMtgStatus(null); setConnectOpen(false); setConnectReason(null); }, 3000);
    } catch {
      setMtgStatus("error");
    }
  };

  const avail = mentor?.availability || "offline";
  const availLabel = { available: "Available Now", busy: "In a Meeting", offline: "Offline" }[avail] || "Unknown";
  const availColor = { available: "#10b981", busy: "#f97316", offline: "#94a3b8" }[avail] || "#94a3b8";
  const initials   = mentor ? mentor.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "??";

  return (
    <div className="sm-page">

      {/* ── HERO ── */}
      <div className="sm-hero">
        <div className="sm-hero-left">
          <span className="sm-pill">🧘 Student Wellness</span>
          <h1>How are you today, {firstName}?</h1>
          <p>{today} · A calm space for check-ins, breathing exercises, and wellbeing support.</p>
        </div>
        <div className="sm-hero-actions">
          <button className="sm-hero-btn sm-hero-ghost" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
          <button className="sm-hero-btn sm-hero-outline" onClick={() => navigate("/triage")}>
            🧠 Triage Agent
          </button>
        </div>
      </div>

      <div className="sm-content">

        {/* ══ LEFT COLUMN ══ */}
        <div className="sm-main-col">

          {/* Mood Check-In */}
          <div className="sm-card">
            <div className="sm-card-head">
              <h2>💛 Mood Check-In</h2>
              <span className="sm-card-sub">
                {submitted
                  ? "All done!"
                  : qStep < QUESTIONS.length
                    ? `Question ${qStep + 1} of ${QUESTIONS.length}`
                    : "Review your answers before submitting"}
              </span>
            </div>

            {/* Step progress */}
            {!submitted && (
              <div className="sm-q-progress">
                {QUESTIONS.map((_, i) => (
                  <div key={i} className="sm-q-progress-item">
                    <div className={`sm-q-dot ${
                      i < qStep ? "sm-q-dot-done"
                      : i === qStep && qStep < QUESTIONS.length ? "sm-q-dot-active"
                      : ""
                    }`} />
                    {i < QUESTIONS.length - 1 && (
                      <div className={`sm-q-line ${i < qStep ? "sm-q-line-done" : ""}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Current question */}
            {!submitted && qStep < QUESTIONS.length && (
              <div className="sm-q-block">
                <p className="sm-q-label">
                  <span className="sm-q-icon">{QUESTIONS[qStep].icon}</span>
                  {QUESTIONS[qStep].label}
                </p>
                <div className="sm-mood-row">
                  {QUESTIONS[qStep].options.map((opt) => (
                    <button
                      key={opt.label}
                      className={`sm-mood-btn ${answers[qStep]?.label === opt.label ? "sm-mood-selected" : ""}`}
                      style={answers[qStep]?.label === opt.label
                        ? { borderColor: opt.color, background: `${opt.color}18` }
                        : {}}
                      onClick={() => handleAnswer(qStep, opt)}
                    >
                      <span className="sm-mood-emoji">{opt.emoji}</span>
                      <span className="sm-mood-label" style={answers[qStep]?.label === opt.label ? { color: opt.color } : {}}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Summary + submit */}
            {!submitted && qStep >= QUESTIONS.length && (
              <div className="sm-q-summary">
                {QUESTIONS.map((q, i) => (
                  <div key={i} className="sm-q-summary-row">
                    <span className="sm-q-summary-icon">{q.icon}</span>
                    <span className="sm-q-summary-qtext">{q.label}</span>
                    <span className="sm-q-summary-ans" style={{ color: answers[i]?.color }}>
                      {answers[i]?.emoji} {answers[i]?.label}
                    </span>
                    <button className="sm-q-edit-btn" onClick={() => setQStep(i)}>Edit</button>
                  </div>
                ))}
                <button className="sm-checkin-btn" onClick={submitMood}>
                  ✓ Log Check-In
                </button>
              </div>
            )}

            {submitted && (
              <div className="sm-submitted-msg">
                ✅ Check-in logged! Take a breath — you've got this.
              </div>
            )}
          </div>

          {/* Mood History */}
          {moodHistory.length > 0 && (
            <div className="sm-card">
              <div className="sm-card-head">
                <h2>📊 Today's Mood Log</h2>
                <span className="sm-card-sub">
                  {moodHistory.length} check-in{moodHistory.length !== 1 ? "s" : ""} · Avg: {avgMood}/5
                </span>
              </div>

              {/* Bar mini-chart */}
              <div className="sm-bar-chart">
                {[...moodHistory].reverse().map((e, i) => {
                  const moodOpt = e.answers[0];
                  return (
                    <div key={i} className="sm-bar-wrap" title={`${moodOpt?.label} · Avg ${e.avgScore}/5 · ${e.time}`}>
                      <div className="sm-bar" style={{ height: `${parseFloat(e.avgScore) * 10}px`, background: moodOpt?.color || "#8b5cf6" }} />
                      <span className="sm-bar-emoji">{moodOpt?.emoji}</span>
                    </div>
                  );
                })}
              </div>

              {/* History rows */}
              <div className="sm-history-list">
                {moodHistory.map((e, i) => {
                  const moodOpt = e.answers[0];
                  return (
                    <div key={i} className="sm-history-row">
                      <span className="sm-hist-emoji">{moodOpt?.emoji}</span>
                      <div className="sm-hist-body">
                        <strong style={{ color: moodOpt?.color }}>{moodOpt?.label}</strong>
                        <span className="sm-hist-note">Wellbeing score: {e.avgScore}/5</span>
                      </div>
                      <span className="sm-hist-time">{e.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Breathing Exercise */}
          <div className="sm-card">
            <div className="sm-card-head">
              <h2>🌬 Box Breathing</h2>
              <span className="sm-card-sub">4-4-4-4 technique — reduces stress in minutes</span>
            </div>

            <div className="sm-breath-layout">
              {/* Animated circle */}
              <div className="sm-breath-circle-wrap" onClick={breathing ? stopBreathing : startBreathing}>
                <div
                  className="sm-breath-circle"
                  style={{
                    transform:          `scale(${breathing ? currentPhase.scale : 1})`,
                    transitionDuration: breathing
                      ? (currentPhase.name === "Hold" ? "0.3s" : `${currentPhase.duration}s`)
                      : "0.4s",
                    background: breathing
                      ? "linear-gradient(135deg, #8b5cf6 0%, #4f46e5 100%)"
                      : "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
                  }}
                >
                  <div className="sm-breath-inner">
                    {breathing ? (
                      <>
                        <span className="sm-breath-phase">{currentPhase.name}</span>
                        <span className="sm-breath-count">{phaseCount}</span>
                      </>
                    ) : (
                      <span className="sm-breath-hint">Tap<br/>to start</span>
                    )}
                  </div>
                </div>
                {/* Pulse ring when active */}
                {breathing && <div className="sm-breath-ring" />}
              </div>

              {/* Instructions */}
              <div className="sm-breath-info">
                <p className="sm-breath-instruction">
                  {breathing ? currentPhase.instruction
                    : "Box breathing calms your nervous system instantly. Tap the circle to begin."}
                </p>
                {breathing && (
                  <p className="sm-breath-cycles">
                    Cycles completed: <strong>{cycles}</strong>
                  </p>
                )}
                <div className="sm-breath-phases-row">
                  {BREATH_PHASES.map((p, i) => (
                    <div
                      key={i}
                      className={`sm-phase-chip ${breathing && phaseIdx === i ? "sm-phase-active" : ""}`}
                    >
                      {p.name} <em>{p.duration}s</em>
                    </div>
                  ))}
                </div>
                <button
                  className={`sm-breath-btn ${breathing ? "sm-breath-stop" : ""}`}
                  onClick={breathing ? stopBreathing : startBreathing}
                >
                  {breathing ? "⏹ Stop" : "▶ Start Breathing"}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="sm-side-col">

          {/* Stress Insight */}
          <div className="sm-card sm-insight-card">
            <h3>🧠 Stress Insight</h3>
            {!avgMood ? (
              <div className="sm-insight-empty">
                <span className="sm-insight-big-icon">📈</span>
                <p>Log a mood check-in to see your personalised stress insight here.</p>
              </div>
            ) : (
              <div className="sm-insight-body">
                <div className="sm-insight-score"
                  style={{ color: QUESTIONS[0].options[Math.min(Math.round(parseFloat(avgMood)) - 1, 4)]?.color }}>
                  {avgMood}
                  <span className="sm-insight-denom">/5</span>
                </div>
                <p className="sm-insight-label">
                  {parseFloat(avgMood) >= 4.2 ? "You're in great shape today! Keep it up. 🎉"
                   : parseFloat(avgMood) >= 3   ? "Moderate stress levels. Short breaks help. ☕"
                   : "High stress detected. Consider talking to someone. 💬"}
                </p>
                {parseFloat(avgMood) < 3 && (
                  <button className="sm-triage-cta" onClick={() => navigate("/triage")}>
                    💬 Talk to Triage Agent →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mentor Support */}
          <div className="sm-card sm-mentor-card">
            <div className="sm-mentor-card-head">
              <h3>🎓 Mentor Support</h3>
              {!mentorLoading && !editingMentor && mentor && (
                <button className="sm-mentor-edit-btn"
                  onClick={() => { setMentorDraft({ ...mentor }); setEditingMentor(true); setConnectOpen(false); }}>
                  ✏️ Edit
                </button>
              )}
            </div>

            {/* ── Edit / Add form ── */}
            {editingMentor ? (
              <div className="sm-mentor-edit-form">
                <div className="sm-mentor-edit-grid">
                  <div className="sm-mentor-field">
                    <label className="sm-mentor-form-label">Full Name</label>
                    <input className="sm-mentor-input" placeholder="e.g. Dr. Aisha Patel"
                      value={mentorDraft.name || ""}
                      onChange={(e) => setMentorDraft({ ...mentorDraft, name: e.target.value })} />
                  </div>
                  <div className="sm-mentor-field">
                    <label className="sm-mentor-form-label">Designation</label>
                    <input className="sm-mentor-input" placeholder="e.g. Associate Professor"
                      value={mentorDraft.designation || ""}
                      onChange={(e) => setMentorDraft({ ...mentorDraft, designation: e.target.value })} />
                  </div>
                  <div className="sm-mentor-field sm-mentor-field-full">
                    <label className="sm-mentor-form-label">Department</label>
                    <input className="sm-mentor-input" placeholder="e.g. Computer Science & Engineering"
                      value={mentorDraft.department || ""}
                      onChange={(e) => setMentorDraft({ ...mentorDraft, department: e.target.value })} />
                  </div>
                  <div className="sm-mentor-field">
                    <label className="sm-mentor-form-label">Email</label>
                    <input type="email" className="sm-mentor-input" placeholder="mentor@campus.edu"
                      value={mentorDraft.email || ""}
                      onChange={(e) => setMentorDraft({ ...mentorDraft, email: e.target.value })} />
                  </div>
                  <div className="sm-mentor-field">
                    <label className="sm-mentor-form-label">Phone</label>
                    <input className="sm-mentor-input" placeholder="+1-555-0000"
                      value={mentorDraft.phone || ""}
                      onChange={(e) => setMentorDraft({ ...mentorDraft, phone: e.target.value })} />
                  </div>
                  <div className="sm-mentor-field sm-mentor-field-full">
                    <label className="sm-mentor-form-label">Office / Location</label>
                    <input className="sm-mentor-input" placeholder="e.g. Block A, Room 204"
                      value={mentorDraft.office || ""}
                      onChange={(e) => setMentorDraft({ ...mentorDraft, office: e.target.value })} />
                  </div>
                  <div className="sm-mentor-field sm-mentor-field-full">
                    <label className="sm-mentor-form-label">Specialization</label>
                    <input className="sm-mentor-input" placeholder="e.g. Academic Stress, Career Guidance"
                      value={mentorDraft.specialization || ""}
                      onChange={(e) => setMentorDraft({ ...mentorDraft, specialization: e.target.value })} />
                  </div>
                  <div className="sm-mentor-field">
                    <label className="sm-mentor-form-label">Availability</label>
                    <select className="sm-mentor-input"
                      value={mentorDraft.availability || "available"}
                      onChange={(e) => setMentorDraft({ ...mentorDraft, availability: e.target.value })}>
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                  <div className="sm-mentor-field">
                    <label className="sm-mentor-form-label">Available Hours</label>
                    <input className="sm-mentor-input" placeholder="Mon–Fri, 9 AM – 5 PM"
                      value={mentorDraft.availability_hours || ""}
                      onChange={(e) => setMentorDraft({ ...mentorDraft, availability_hours: e.target.value })} />
                  </div>
                </div>
                <div className="sm-mentor-edit-actions">
                  <button className="sm-connect-submit-btn" onClick={saveMentorDraft}
                    disabled={!mentorDraft.name?.trim()}>
                    ✓ Save Mentor Details
                  </button>
                  <button className="sm-mentor-cancel-btn"
                    onClick={() => setEditingMentor(false)}>
                    Cancel
                  </button>
                </div>
              </div>

            ) : mentorLoading ? (
              <div className="sm-mentor-loading">
                <span className="sm-mentor-spin" /> Loading mentor…
              </div>

            ) : mentor ? (
              <>
                {/* Availability badge */}
                <div className="sm-mentor-avail-row">
                  <span className="sm-mentor-avail-dot" style={{ background: availColor }} />
                  <span className="sm-mentor-avail-label" style={{ color: availColor }}>{availLabel}</span>
                  <span className="sm-mentor-avail-hrs">{mentor.availability_hours}</span>
                </div>

                {/* Profile block */}
                <div className="sm-mentor-profile">
                  <div className="sm-mentor-avatar">{initials}</div>
                  <div className="sm-mentor-info">
                    <strong>{mentor.name}</strong>
                    <span>{mentor.designation}</span>
                    <span className="sm-mentor-dept">{mentor.department}</span>
                  </div>
                </div>

                {/* Contact details */}
                <div className="sm-mentor-contacts">
                  {mentor.email && (
                    <div className="sm-mentor-contact-row">
                      <span>📧</span>
                      <a href={`mailto:${mentor.email}`} className="sm-mentor-link">{mentor.email}</a>
                    </div>
                  )}
                  {mentor.phone && (
                    <div className="sm-mentor-contact-row">
                      <span>📞</span>
                      <a href={`tel:${mentor.phone}`} className="sm-mentor-link">{mentor.phone}</a>
                    </div>
                  )}
                  {mentor.office && (
                    <div className="sm-mentor-contact-row">
                      <span>📍</span>
                      <span className="sm-mentor-office">{mentor.office}</span>
                    </div>
                  )}
                  {mentor.specialization && (
                    <div className="sm-mentor-contact-row">
                      <span>🔬</span>
                      <span className="sm-mentor-spec">{mentor.specialization}</span>
                    </div>
                  )}
                </div>

                {/* Connect with Mentor — unified panel */}
                <button
                  className={`sm-connect-btn ${connectOpen ? "sm-connect-open" : ""}`}
                  onClick={() => {
                    if (connectOpen) { setConnectReason(null); setSrStatus(null); setMtgStatus(null); }
                    setConnectOpen(!connectOpen);
                  }}
                >
                  {connectOpen ? "✕  Close" : "💬  Connect with Mentor"}
                </button>

                {connectOpen && (
                  <div className="sm-connect-panel">
                    <p className="sm-mentor-form-label">What do you need help with?</p>
                    <div className="sm-connect-reasons">
                      {CONNECT_REASONS.map((r) => (
                        <button
                          key={r.id}
                          className={`sm-connect-reason-btn ${connectReason === r.id ? "sm-connect-reason-active" : ""}`}
                          onClick={() => { setConnectReason(r.id); setSrStatus(null); setMtgStatus(null); }}
                        >
                          <span>{r.icon}</span>{r.label}
                        </button>
                      ))}
                    </div>

                    {connectReason && (
                      <>
                        <div className="sm-connect-student-row">
                          <span className="sm-connect-student-lbl">Sending as</span>
                          <span className="sm-connect-student-val">{student?.name || firstName} · {studentId}</span>
                        </div>

                        {connectReason === "meeting" ? (
                          mtgStatus === "sent" ? (
                            <div className="sm-mentor-success">✅ Meeting request sent to {mentor.name}!</div>
                          ) : (
                            <>
                              <div className="sm-mentor-field-row">
                                <div className="sm-mentor-field">
                                  <label className="sm-mentor-form-label">Date</label>
                                  <input type="date" className="sm-mentor-input" value={mtgDate}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setMtgDate(e.target.value)} />
                                </div>
                                <div className="sm-mentor-field">
                                  <label className="sm-mentor-form-label">Time</label>
                                  <select className="sm-mentor-input" value={mtgTime} onChange={(e) => setMtgTime(e.target.value)}>
                                    <option value="">Select…</option>
                                    {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                                  </select>
                                </div>
                              </div>
                              <textarea
                                className="sm-textarea sm-mentor-msg-area"
                                placeholder="What would you like to discuss in this meeting?"
                                value={mtgTopic}
                                onChange={(e) => setMtgTopic(e.target.value)}
                                rows={2}
                              />
                              {mtgStatus === "error" && <p className="sm-mentor-err">Failed to schedule — please try again.</p>}
                              <button
                                className="sm-connect-submit-btn"
                                onClick={scheduleMeeting}
                                disabled={!mtgDate || !mtgTime || !mtgTopic.trim() || mtgStatus === "sending"}
                              >
                                {mtgStatus === "sending" ? "Scheduling…" : `📅 Schedule with ${mentor.name.split(" ").slice(-1)[0]} →`}
                              </button>
                            </>
                          )
                        ) : (
                          srStatus === "sent" ? (
                            <div className="sm-mentor-success">✅ Message sent to {mentor.name}!</div>
                          ) : (
                            <>
                              <div className="sm-mentor-urgency-row">
                                {URGENCY_OPTS.map((u) => (
                                  <button
                                    key={u}
                                    className={`sm-mentor-urgency-btn ${srUrgency === u ? "sm-mentor-urgency-active" : ""}`}
                                    style={srUrgency === u ? {
                                      background: u === "high" ? "rgba(239,68,68,0.12)" : u === "medium" ? "rgba(249,115,22,0.12)" : "rgba(16,185,129,0.12)",
                                      borderColor: u === "high" ? "#ef4444" : u === "medium" ? "#f97316" : "#10b981",
                                      color:       u === "high" ? "#ef4444" : u === "medium" ? "#f97316" : "#10b981",
                                    } : {}}
                                    onClick={() => setSrUrgency(u)}
                                  >
                                    {u === "high" ? "🔴" : u === "medium" ? "🟡" : "🟢"} {u.charAt(0).toUpperCase() + u.slice(1)}
                                  </button>
                                ))}
                              </div>
                              <textarea
                                className="sm-textarea sm-mentor-msg-area"
                                placeholder={
                                  connectReason === "academic" ? "Describe your academic concern or question…"
                                  : connectReason === "stress"  ? "Share what's been stressing you out…"
                                  : connectReason === "career"  ? "What career guidance do you need?"
                                  : "Share what's on your mind…"
                                }
                                value={srMessage}
                                onChange={(e) => setSrMessage(e.target.value)}
                                rows={3}
                              />
                              {srStatus === "error" && <p className="sm-mentor-err">Failed to send — please try again.</p>}
                              <button
                                className="sm-connect-submit-btn"
                                onClick={sendSupportRequest}
                                disabled={!srMessage.trim() || srStatus === "sending"}
                              >
                                {srStatus === "sending" ? "Sending…" : `Send to ${mentor.name.split(" ").slice(-1)[0]} →`}
                              </button>
                            </>
                          )
                        )}
                      </>
                    )}
                  </div>
                )}
              </>

            ) : (
              <>
                <p className="sm-mentor-empty-msg">No mentor assigned yet. Add your mentor's details to connect with them directly.</p>
                <button className="sm-connect-btn" onClick={() => {
                  setMentorDraft({ name: "", designation: "", department: "", email: "", phone: "", office: "", specialization: "", availability: "available", availability_hours: "Mon–Fri, 9 AM – 5 PM" });
                  setEditingMentor(true);
                }}>
                  + Add Mentor Details
                </button>
              </>
            )}
          </div>

          {/* Wellness Tips */}
          <div className="sm-card sm-tips-card">
            <h3>💡 Quick Wellness Tips</h3>
            <ul className="sm-tips-list">
              {TIPS.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useStudent } from "../context/StudentContext";
import "./LostFoundLayout.css";

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Psychology & Counselling",
  "Mathematics & Statistics",
  "Physics",
  "Chemistry & Life Sciences",
];

export default function LostFoundLayout() {
  const { student, saveStudent, clearStudent } = useStudent();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", studentId: "", department: "",
    year: "", email: "", phone: "",
  });

  const update = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.studentId.trim()) e.studentId = "Student ID is required";
    if (!form.department) e.department = "Please select a department";
    if (!form.year) e.year = "Please select your year";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Must be exactly 10 digits";
    return e;
  };

  const handleEnter = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    saveStudent(form);
    setSubmitting(false);
  };

  const initials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?";

  const navItems = [
    { to: "", label: "Hub", icon: "⬡", end: true },
    { to: "report-lost", label: "Report Lost", icon: "📤" },
    { to: "report-found", label: "Report Found", icon: "📥" },
    { to: "match-results", label: "AI Matches", icon: "🤖" },
    { to: "notifications", label: "Notifications", icon: "🔔", badge: 3 },
    { to: "analytics", label: "Analytics", icon: "📊" },
  ];

  /* ── REGISTRATION SCREEN ── */
  if (!student) {
    return (
      <div className="lfr-overlay">
        <div className="lfr-blobs">
          <div className="lfr-blob lfr-b1" />
          <div className="lfr-blob lfr-b2" />
          <div className="lfr-blob lfr-b3" />
        </div>

        <div className="lfr-card">
          <div className="lfr-brand">
            <div className="lfr-logo">⬡</div>
            <div>
              <h1>ECHO Lost &amp; Found</h1>
              <p>Smart Campus Governance Portal</p>
            </div>
          </div>

          <div className="lfr-divider" />
          <p className="lfr-intro">
            Provide your student details below to securely access the portal.
          </p>

          <div className="lfr-form">
            <div className="lfr-row">
              <div className={`lfr-field ${errors.name ? "lfr-field-err" : ""}`}>
                <label>Full Name</label>
                <input
                  placeholder="e.g. Aisha Rahman"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
                {errors.name && <span className="lfr-errmsg">{errors.name}</span>}
              </div>
              <div className={`lfr-field ${errors.studentId ? "lfr-field-err" : ""}`}>
                <label>Student ID</label>
                <input
                  placeholder="e.g. CS2024001"
                  value={form.studentId}
                  onChange={(e) => update("studentId", e.target.value)}
                />
                {errors.studentId && <span className="lfr-errmsg">{errors.studentId}</span>}
              </div>
            </div>

            <div className="lfr-row">
              <div className={`lfr-field ${errors.department ? "lfr-field-err" : ""}`}>
                <label>Department</label>
                <select value={form.department} onChange={(e) => update("department", e.target.value)}>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <span className="lfr-errmsg">{errors.department}</span>}
              </div>
              <div className={`lfr-field ${errors.year ? "lfr-field-err" : ""}`}>
                <label>Year of Study</label>
                <select value={form.year} onChange={(e) => update("year", e.target.value)}>
                  <option value="">Select Year</option>
                  {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                {errors.year && <span className="lfr-errmsg">{errors.year}</span>}
              </div>
            </div>

            <div className="lfr-row">
              <div className={`lfr-field ${errors.email ? "lfr-field-err" : ""}`}>
                <label>University Email</label>
                <input
                  type="email"
                  placeholder="student@university.edu"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
                {errors.email && <span className="lfr-errmsg">{errors.email}</span>}
              </div>
              <div className={`lfr-field ${errors.phone ? "lfr-field-err" : ""}`}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  maxLength={10}
                  onChange={(e) => update("phone", e.target.value.replace(/\D/g, ""))}
                />
                {errors.phone && <span className="lfr-errmsg">{errors.phone}</span>}
              </div>
            </div>

            <button
              className={`lfr-enter-btn ${submitting ? "lfr-loading" : ""}`}
              onClick={handleEnter}
              disabled={submitting}
            >
              {submitting ? (
                <><span className="lfr-spin" /> Verifying details…</>
              ) : (
                "Enter Portal →"
              )}
            </button>
          </div>

          <p className="lfr-disclaimer">
            Your information is stored locally for this session only.
          </p>
        </div>
      </div>
    );
  }

  /* ── PORTAL SHELL ── */
  return (
    <div className="lf-shell">
      {sidebarOpen && (
        <div className="lf-mob-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`lf-sidebar ${sidebarOpen ? "lf-sb-open" : ""}`}>
        <div className="lf-sb-brand">
          <div className="lf-sb-logo">⬡</div>
          <div className="lf-sb-title">
            <strong>ECHO</strong>
            <span>Lost &amp; Found</span>
          </div>
        </div>

        <nav className="lf-sb-nav">
          <p className="lf-sb-section">NAVIGATION</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `lf-navlink ${isActive ? "lf-navlink-active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="lf-navlink-icon">{item.icon}</span>
              <span className="lf-navlink-label">{item.label}</span>
              {item.badge && (
                <span className="lf-navlink-badge">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="lf-sb-divider" />

        <div className="lf-sb-footer">
          <div className="lf-sb-profile">
            <div className="lf-sb-avatar">{initials(student.name)}</div>
            <div className="lf-sb-pinfo">
              <strong>{student.name}</strong>
              <span>{student.studentId}</span>
              <span>{student.department}</span>
            </div>
          </div>
          <div className="lf-sb-actions">
            <button
              className="lf-sb-back-btn"
              onClick={() => navigate("/dashboard")}
            >
              ← Dashboard
            </button>
            <button
              className="lf-sb-exit-btn"
              onClick={() => { clearStudent(); navigate("/dashboard"); }}
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="lf-main">
        <header className="lf-topbar">
          <button className="lf-hamburger" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <div className="lf-tb-brand">
            <span className="lf-tb-logo">⬡</span>
            <span>Lost &amp; Found</span>
          </div>
          <button className="lf-tb-back" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
        </header>

        <div className="lf-page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

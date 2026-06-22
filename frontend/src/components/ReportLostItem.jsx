import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../context/StudentContext";
import "./ReportLostItem.css";

const CATEGORIES = [
  { key: "Electronics",  icon: "📱", desc: "Phone, laptop, tablet, earbuds" },
  { key: "Documents",    icon: "📄", desc: "ID card, notes, books, passbook" },
  { key: "Clothing",     icon: "👕", desc: "Jacket, hoodie, shoes, cap" },
  { key: "Accessories",  icon: "🎒", desc: "Bag, wallet, watch, glasses" },
  { key: "Keys",         icon: "🔑", desc: "Room key, bike key, car key" },
  { key: "Other",        icon: "📦", desc: "Anything not listed above" },
];

const TIME_SLOTS = ["Morning (6am–12pm)", "Afternoon (12pm–5pm)", "Evening (5pm–9pm)", "Night (9pm+)"];

const LOCATIONS = [
  "Main Library", "Cafeteria / Food Court", "Admin Block", "Sports Complex",
  "Computer Lab", "Main Auditorium", "Parking Lot", "Hostel Block A/B/C",
  "Science Block", "Engineering Block", "Management Block", "Convenience Store",
  "Medical Centre", "Other",
];

export default function ReportLostItem() {
  const navigate = useNavigate();
  const { student } = useStudent();

  const [step, setStep]           = useState(1);
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError]   = useState("");
  const [submittedId, setSubmittedId] = useState(null);
  const [image, setImage]         = useState(null);
  const [preview, setPreview]     = useState(null);
  const [drag, setDrag]           = useState(false);

  const [form, setForm] = useState({
    category: "", itemName: "", description: "",
    dateLost: "", timeLost: "", location: "", locationDetail: "",
  });

  const update = (field, val) => {
    setForm((p) => ({ ...p, [field]: val }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
    if (apiError) setApiError("");
  };

  const v1 = () => {
    const e = {};
    if (!form.category) e.category = "Select a category";
    if (!form.itemName.trim()) e.itemName = "Item name is required";
    if (form.description.trim().length < 10) e.description = "Please be more descriptive (min 10 chars)";
    return e;
  };

  const v2 = () => {
    const e = {};
    if (!form.dateLost) e.dateLost = "Select the date";
    if (!form.timeLost) e.timeLost = "Select a time range";
    if (!form.location) e.location = "Select a campus location";
    return e;
  };

  const next = () => {
    const e = step === 1 ? v1() : v2();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep((s) => s + 1);
  };

  const pickImage = (f) => {
    if (!f) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    pickImage(e.dataTransfer.files?.[0]);
  };

  const submit = async () => {
    setSubmitting(true);
    setApiError("");
    try {
      const fd = new FormData();
      fd.append("item_name",       form.itemName);
      fd.append("description",     form.description);
      fd.append("category",        form.category);
      fd.append("location",        form.location);
      fd.append("date_lost",       form.dateLost);
      fd.append("time_lost",       form.timeLost);
      fd.append("location_detail", form.locationDetail);
      fd.append("reported_by",     student?.studentId || "Student");
      if (image) fd.append("image", image);

      const res = await fetch("http://127.0.0.1:8000/report-lost", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = typeof err.detail === "object"
          ? Object.values(err.detail).join(" · ")
          : err.detail || `Server error (${res.status})`;
        throw new Error(msg);
      }

      const data = await res.json();
      setSubmittedId(data.id);
      setSubmitted(true);
    } catch (err) {
      setApiError(err.message || "Failed to submit. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setStep(1);
    setApiError("");
    setSubmittedId(null);
    setForm({ category: "", itemName: "", description: "", dateLost: "", timeLost: "", location: "", locationDetail: "" });
    setImage(null);
    setPreview(null);
  };

  /* ── SUCCESS SCREEN ── */
  if (submitted) {
    return (
      <div className="rl-wrap">
        <div className="rl-success-card">
          <div className="rl-success-ring">✅</div>
          <h2>Report Submitted!</h2>
          <p>Your lost item has been logged. Our AI will scan for potential matches and notify you.</p>
          <div className="rl-info-row">
            <div className="rl-info-chip">📦 {form.category}</div>
            <div className="rl-info-chip">📍 {form.location}</div>
            <div className="rl-info-chip">👤 {student?.name}</div>
            {submittedId && <div className="rl-info-chip">🆔 Case #{submittedId}</div>}
          </div>
          <div className="rl-success-actions">
            <button className="rl-btn-primary" onClick={() => navigate("../match-results")}>
              🤖 View AI Matches
            </button>
            <button className="rl-btn-ghost" onClick={reset}>
              Report Another Item
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = ["Item Details", "When & Where", "Upload & Submit"];

  return (
    <div className="rl-wrap">
      {/* Header */}
      <div className="rl-header">
        <h1>📤 Report Lost Item</h1>
        <p>Provide details about your missing item — AI will search for matches automatically</p>
      </div>

      {/* Stepper */}
      <div className="rl-stepper">
        {steps.map((label, i) => (
          <div
            key={i}
            className={`rl-step-item ${step === i + 1 ? "rl-step-active" : ""} ${step > i + 1 ? "rl-step-done" : ""}`}
          >
            <div className="rl-step-num">{step > i + 1 ? "✓" : i + 1}</div>
            <span className="rl-step-label">{label}</span>
            {i < steps.length - 1 && (
              <div className={`rl-step-line ${step > i + 1 ? "rl-line-done" : ""}`} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="rl-card">

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="rl-step-body">
            <h2>What did you lose?</h2>
            <p>Select a category and describe your item in as much detail as possible.</p>

            <div className="rl-field-group">
              <label className="rl-label">
                Category
                {errors.category && <span className="rl-err"> — {errors.category}</span>}
              </label>
              <div className="rl-cat-grid">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    className={`rl-cat-card ${form.category === c.key ? "rl-cat-selected" : ""}`}
                    onClick={() => update("category", c.key)}
                  >
                    <span className="rl-cat-icon">{c.icon}</span>
                    <strong>{c.key}</strong>
                    <small>{c.desc}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="rl-field-group">
              <label className="rl-label">
                Item Name
                {errors.itemName && <span className="rl-err"> — {errors.itemName}</span>}
              </label>
              <input
                className={`rl-input ${errors.itemName ? "rl-input-err" : ""}`}
                placeholder="e.g. Black Samsung Galaxy S23 Ultra"
                value={form.itemName}
                onChange={(e) => update("itemName", e.target.value)}
              />
            </div>

            <div className="rl-field-group">
              <label className="rl-label">
                Description
                {errors.description && <span className="rl-err"> — {errors.description}</span>}
              </label>
              <textarea
                className={`rl-input rl-textarea ${errors.description ? "rl-input-err" : ""}`}
                placeholder="Describe your item — colour, brand, model, any stickers, scratches, or unique marks. The more detail, the faster AI finds it..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
              />
              <span className="rl-char-count">{form.description.length} chars</span>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="rl-step-body">
            <h2>When and where did you lose it?</h2>
            <p>Help narrow down the search area for campus security and AI matching.</p>

            <div className="rl-two-col">
              <div className="rl-field-group">
                <label className="rl-label">
                  Date Lost
                  {errors.dateLost && <span className="rl-err"> — {errors.dateLost}</span>}
                </label>
                <input
                  type="date"
                  className={`rl-input ${errors.dateLost ? "rl-input-err" : ""}`}
                  value={form.dateLost}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => update("dateLost", e.target.value)}
                />
              </div>

              <div className="rl-field-group">
                <label className="rl-label">
                  Time of Day
                  {errors.timeLost && <span className="rl-err"> — {errors.timeLost}</span>}
                </label>
                <div className="rl-time-chips">
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      className={`rl-chip ${form.timeLost === t ? "rl-chip-active" : ""}`}
                      onClick={() => update("timeLost", t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rl-field-group">
              <label className="rl-label">
                Campus Location
                {errors.location && <span className="rl-err"> — {errors.location}</span>}
              </label>
              <div className="rl-loc-grid">
                {LOCATIONS.map((l) => (
                  <button
                    key={l}
                    className={`rl-loc-chip ${form.location === l ? "rl-loc-active" : ""}`}
                    onClick={() => update("location", l)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="rl-field-group">
              <label className="rl-label">Additional Location Details (optional)</label>
              <input
                className="rl-input"
                placeholder="e.g. Near the east entrance, 2nd floor reading room, Table 4..."
                value={form.locationDetail}
                onChange={(e) => update("locationDetail", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div className="rl-step-body">
            <h2>Upload a photo (optional)</h2>
            <p>A photo significantly improves AI matching accuracy. Skip if unavailable.</p>

            <label
              className={`rl-upload-zone ${drag ? "rl-drag-over" : ""} ${preview ? "rl-has-img" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
            >
              {preview ? (
                <img src={preview} alt="preview" className="rl-preview-img" />
              ) : (
                <div className="rl-upload-hint">
                  <span>🖼️</span>
                  <strong>Drop photo here</strong>
                  <span>or click to browse · JPG, PNG, WEBP</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => pickImage(e.target.files?.[0])} hidden />
            </label>
            {preview && (
              <button className="rl-remove-img" onClick={() => { setImage(null); setPreview(null); }}>
                ✕ Remove photo
              </button>
            )}

            {/* Summary */}
            <div className="rl-summary">
              <h4>Report Summary</h4>
              <div className="rl-summary-grid">
                {[
                  ["Category",    form.category],
                  ["Item",        form.itemName],
                  ["Location",    form.location],
                  ["Date Lost",   form.dateLost],
                  ["Time",        form.timeLost],
                  ["Reported by", student?.name || "—"],
                ].map(([label, val]) => (
                  <div key={label} className="rl-summary-row">
                    <span>{label}</span>
                    <strong>{val || "—"}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="rl-footer">
          {step > 1 && (
            <button className="rl-btn-ghost" onClick={() => setStep((s) => s - 1)}>
              ← Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {apiError && (
            <span style={{
              fontSize: 13, color: "#ef4444", fontWeight: 500,
              maxWidth: 320, textAlign: "right", lineHeight: 1.4,
            }}>
              ⚠ {apiError}
            </span>
          )}
          {step < 3 ? (
            <button className="rl-btn-primary" onClick={next}>
              Continue →
            </button>
          ) : (
            <button
              className={`rl-btn-submit ${submitting ? "rl-btn-busy" : ""}`}
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? <><span className="rl-spin" /> Submitting…</> : "🚀 Submit Report"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

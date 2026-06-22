import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../context/StudentContext";
import "./ReportFoundItem.css";

const CATEGORIES = [
  { key: "Electronics", icon: "📱" },
  { key: "Documents",   icon: "📄" },
  { key: "Clothing",    icon: "👕" },
  { key: "Accessories", icon: "🎒" },
  { key: "Keys",        icon: "🔑" },
  { key: "Other",       icon: "📦" },
];

const CAT_ICONS = {
  Electronics: "📱", Documents: "📄", Clothing: "👕",
  Accessories: "🎒", Keys: "🔑", Other: "📦", Unknown: "❓",
};

const LOCATIONS = [
  "Main Library", "Cafeteria / Food Court", "Admin Block", "Sports Complex",
  "Computer Lab", "Main Auditorium", "Parking Lot", "Hostel Block",
  "Science Block", "Engineering Block", "Management Block", "Other",
];

/* ── Inline match card shown on the success screen ────────────────────────── */
function MatchCard({ match, localStatus, onAccept, onReject }) {
  const conf    = match.confidence;
  const lost    = match.lost_item;
  const color   = conf >= 80 ? "#10b981" : conf >= 60 ? "#f59e0b" : "#4f8ef7";
  const label   = conf >= 80 ? "HIGH"    : conf >= 60 ? "GOOD"    : "POSSIBLE";
  const icon    = CAT_ICONS[lost?.category] || "📦";
  const status  = localStatus || "pending";

  return (
    <div className={`rf-match-card ${status === "accepted" ? "rf-match-card-accepted" : ""} ${status === "rejected" ? "rf-match-card-rejected" : ""}`}>
      {/* Confidence + category row */}
      <div className="rf-match-top">
        <div className="rf-match-badge" style={{ background: `${color}15`, color, border: `1px solid ${color}35` }}>
          <strong className="rf-match-pct">{conf}%</strong>
          <span className="rf-match-label">{label}</span>
        </div>
        <div className="rf-match-meta">
          <span className="rf-match-cat">{icon} {lost?.category}</span>
          <span className="rf-match-method">{match.match_method}</span>
        </div>
      </div>

      {/* Lost item details */}
      <div className="rf-match-lost-block">
        <span className="rf-match-tag">LOST ITEM</span>
        <p className="rf-match-name">{lost?.item_name}</p>
        <span className="rf-match-loc">📍 {lost?.location}{lost?.date_lost ? ` · ${lost.date_lost}` : ""}</span>
        {lost?.description && (
          <p className="rf-match-desc">
            {lost.description.length > 120 ? lost.description.slice(0, 120) + "…" : lost.description}
          </p>
        )}
        {lost?.reported_by && lost.reported_by !== "Student" && (
          <span className="rf-match-reporter">Reported by: {lost.reported_by}</span>
        )}
      </div>

      {/* Confidence bar */}
      <div className="rf-match-bar-wrap">
        <div className="rf-match-bar-track">
          <div className="rf-match-bar-fill" style={{ width: `${conf}%`, background: color }} />
        </div>
        <span style={{ fontSize: 11, color, fontWeight: 700, whiteSpace: "nowrap" }}>
          {conf}% match
        </span>
      </div>

      {/* Actions */}
      {status === "pending" && (
        <div className="rf-match-actions">
          <button className="rf-match-accept" onClick={() => onAccept(match.match_id)}>
            ✓ Confirm — this is the owner's item
          </button>
          <button className="rf-match-reject" onClick={() => onReject(match.match_id)}>
            ✕ Not a match
          </button>
        </div>
      )}
      {status === "accepted" && (
        <div className="rf-match-confirmed">
          ✅ Match confirmed! The lost item owner has been notified to collect.
        </div>
      )}
      {status === "rejected" && (
        <div className="rf-match-dismissed">
          Match dismissed. AI continues scanning.
        </div>
      )}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function ReportFoundItem() {
  const navigate = useNavigate();
  const { student } = useStudent();

  const [lostItems, setLostItems]           = useState([]);
  const [fetchingItems, setFetchingItems]   = useState(true);
  const [submitting, setSubmitting]         = useState(false);
  const [submitted, setSubmitted]           = useState(false);
  const [apiError, setApiError]             = useState("");
  const [submittedId, setSubmittedId]       = useState(null);
  const [matches, setMatches]               = useState([]);
  const [scanned, setScanned]               = useState(0);
  const [matchStatuses, setMatchStatuses]   = useState({});
  const [image, setImage]                   = useState(null);
  const [preview, setPreview]               = useState(null);
  const [drag, setDrag]                     = useState(false);
  const [errors, setErrors]                 = useState({});

  const [form, setForm] = useState({
    category: "", itemName: "", description: "",
    foundLocation: "", dateFound: "", additionalNotes: "",
  });

  useEffect(() => {
    fetch("http://127.0.0.1:8000/lost-items")
      .then((r) => r.json())
      .then(setLostItems)
      .catch(() => setLostItems([]))
      .finally(() => setFetchingItems(false));
  }, []);

  const update = (field, val) => {
    setForm((p) => ({ ...p, [field]: val }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.category)        e.category     = "Select a category";
    if (!form.itemName.trim()) e.itemName      = "Item name is required";
    if (!form.foundLocation)   e.foundLocation = "Select where you found it";
    if (!form.dateFound)       e.dateFound     = "Select the date";
    return e;
  };

  const pickImage = (f) => {
    if (!f) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSubmitting(true);
    setApiError("");
    try {
      const fd = new FormData();
      fd.append("item_name",        form.itemName);
      fd.append("description",      form.description);
      fd.append("category",         form.category);
      fd.append("location",         form.foundLocation);
      fd.append("date_found",       form.dateFound);
      fd.append("additional_notes", form.additionalNotes);
      fd.append("reported_by",      student?.studentId || "Student");
      if (image) fd.append("image", image);

      const res = await fetch("http://127.0.0.1:8000/report-found", {
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
      setScanned(data.scanned || 0);
      setMatches(data.matches || []);
      // seed local status map from server response
      const statusMap = {};
      (data.matches || []).forEach((m) => { statusMap[m.match_id] = "pending"; });
      setMatchStatuses(statusMap);
      setSubmitted(true);
    } catch (err) {
      setApiError(err.message || "Failed to submit. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptMatch = async (matchId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/matches/${matchId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      });
      if (res.ok) setMatchStatuses((p) => ({ ...p, [matchId]: "accepted" }));
    } catch {}
  };

  const handleRejectMatch = async (matchId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/matches/${matchId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      if (res.ok) setMatchStatuses((p) => ({ ...p, [matchId]: "rejected" }));
    } catch {}
  };

  const reset = () => {
    setSubmitted(false);
    setApiError("");
    setSubmittedId(null);
    setMatches([]);
    setScanned(0);
    setMatchStatuses({});
    setForm({ category: "", itemName: "", description: "", foundLocation: "", dateFound: "", additionalNotes: "" });
    setImage(null);
    setPreview(null);
    setErrors({});
  };

  /* ── SUCCESS + MATCH RESULTS SCREEN ──────────────────────────────────────── */
  if (submitted) {
    const acceptedCount = Object.values(matchStatuses).filter((s) => s === "accepted").length;

    return (
      <div className="rf-wrap">
        {/* Success banner */}
        <div className="rf-result-banner">
          <div className="rf-result-banner-left">
            <span className="rf-result-icon">📥</span>
            <div>
              <h2 className="rf-result-title">Found Item Logged!</h2>
              <div className="rf-result-chips">
                <span>📦 {form.category}</span>
                <span>📍 {form.foundLocation}</span>
                {submittedId && <span>🆔 Case #{submittedId}</span>}
              </div>
            </div>
          </div>
          <div className="rf-scan-stat">
            <strong>{scanned}</strong>
            <span>lost reports scanned</span>
          </div>
        </div>

        {/* Match results */}
        {matches.length > 0 ? (
          <div className="rf-matches-section">
            <div className="rf-matches-header">
              <div>
                <h3 className="rf-matches-title">
                  🎯 {matches.length} Match{matches.length !== 1 ? "es" : ""} Found
                  {acceptedCount > 0 && <span className="rf-accepted-count"> · {acceptedCount} confirmed</span>}
                </h3>
                <p className="rf-matches-sub">
                  AI compared your item against {scanned} open lost report{scanned !== 1 ? "s" : ""}
                  {" "}— sorted by confidence score
                </p>
              </div>
            </div>

            <div className="rf-match-list">
              {matches.map((m) => (
                <MatchCard
                  key={m.match_id}
                  match={m}
                  localStatus={matchStatuses[m.match_id]}
                  onAccept={handleAcceptMatch}
                  onReject={handleRejectMatch}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="rf-no-match-box">
            <span className="rf-no-match-icon">🔍</span>
            <div>
              <strong>No matches found right now</strong>
              <p>
                We scanned {scanned} open lost report{scanned !== 1 ? "s" : ""}.
                The system will automatically re-check whenever a new lost item is added.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="rf-result-actions">
          <button className="rf-btn-primary" onClick={() => navigate("../match-results")}>
            🤖 View All AI Matches
          </button>
          <button className="rf-btn-ghost" onClick={reset}>
            Report Another Item
          </button>
        </div>
      </div>
    );
  }

  /* ── FORM ──────────────────────────────────────────────────────────────────── */
  return (
    <div className="rf-wrap">
      <div className="rf-header">
        <h1>📥 Report Found Item</h1>
        <p>Found something on campus? Log it here — AI will instantly scan for the owner.</p>
      </div>

      <div className="rf-layout">
        {/* ── LEFT: FORM ── */}
        <div className="rf-form-col">
          <div className="rf-card">
            <h3>Item Details</h3>

            <div className="rf-field">
              <label className="rf-label">
                Category
                {errors.category && <span className="rf-err"> — {errors.category}</span>}
              </label>
              <div className="rf-cat-row">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    className={`rf-cat-btn ${form.category === c.key ? "rf-cat-active" : ""}`}
                    onClick={() => update("category", c.key)}
                  >
                    <span>{c.icon}</span>
                    <span>{c.key}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rf-field">
              <label className="rf-label">
                Item Name
                {errors.itemName && <span className="rf-err"> — {errors.itemName}</span>}
              </label>
              <input
                className={`rf-input ${errors.itemName ? "rf-input-err" : ""}`}
                placeholder="e.g. Black Leather Wallet with HDFC card"
                value={form.itemName}
                onChange={(e) => update("itemName", e.target.value)}
              />
            </div>

            <div className="rf-field">
              <label className="rf-label">Description (optional — improves AI matching)</label>
              <textarea
                className="rf-input rf-textarea"
                placeholder="Describe the item — colour, brand, contents, any distinguishing features..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="rf-card">
            <h3>When &amp; Where</h3>

            <div className="rf-field">
              <label className="rf-label">
                Found Location
                {errors.foundLocation && <span className="rf-err"> — {errors.foundLocation}</span>}
              </label>
              <div className="rf-loc-grid">
                {LOCATIONS.map((l) => (
                  <button
                    key={l}
                    className={`rf-loc-chip ${form.foundLocation === l ? "rf-loc-active" : ""}`}
                    onClick={() => update("foundLocation", l)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="rf-field">
              <label className="rf-label">
                Date Found
                {errors.dateFound && <span className="rf-err"> — {errors.dateFound}</span>}
              </label>
              <input
                type="date"
                className={`rf-input ${errors.dateFound ? "rf-input-err" : ""}`}
                value={form.dateFound}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => update("dateFound", e.target.value)}
              />
            </div>

            <div className="rf-field">
              <label className="rf-label">Additional Notes (optional)</label>
              <input
                className="rf-input"
                placeholder="e.g. Handed to security desk, left on table near window..."
                value={form.additionalNotes}
                onChange={(e) => update("additionalNotes", e.target.value)}
              />
            </div>
          </div>

          <div className="rf-card">
            <h3>Upload Photo (optional — boosts match accuracy)</h3>
            <label
              className={`rf-upload-zone ${drag ? "rf-drag-over" : ""} ${preview ? "rf-has-img" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pickImage(e.dataTransfer.files?.[0]); }}
            >
              {preview ? (
                <img src={preview} alt="preview" className="rf-preview-img" />
              ) : (
                <div className="rf-upload-hint">
                  <span>📸</span>
                  <strong>Drop a photo here</strong>
                  <span>or click to browse</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => pickImage(e.target.files?.[0])} hidden />
            </label>
            {preview && (
              <button className="rf-clear-img" onClick={() => { setImage(null); setPreview(null); }}>
                ✕ Remove photo
              </button>
            )}
          </div>

          {apiError && (
            <div className="rf-api-error">⚠ {apiError}</div>
          )}

          <button
            className={`rf-submit-btn ${submitting ? "rf-btn-busy" : ""}`}
            onClick={submit}
            disabled={submitting}
          >
            {submitting
              ? <><span className="rf-spin" /> Scanning &amp; Submitting…</>
              : "📥 Submit &amp; Run AI Match"}
          </button>
        </div>

        {/* ── RIGHT: LOST ITEMS PANEL ── */}
        <div className="rf-side-col">
          <div className="rf-card rf-lost-panel">
            <div className="rf-panel-header">
              <h3>🔍 Open Lost Reports</h3>
              <span className="rf-lost-count">{lostItems.length} active</span>
            </div>
            <p className="rf-panel-desc">
              AI will auto-match your found item against all of these after you submit.
            </p>

            {fetchingItems && (
              <div className="rf-loading-state">
                <span className="rf-spin" />
                <span>Loading reports…</span>
              </div>
            )}

            {!fetchingItems && lostItems.length === 0 && (
              <div className="rf-empty-state">
                <span>📭</span>
                <p>No open lost item reports right now.</p>
              </div>
            )}

            <div className="rf-lost-list">
              {lostItems.slice(0, 6).map((item) => (
                <div key={item.id} className="rf-lost-row">
                  <div className="rf-lost-dot" />
                  <div className="rf-lost-info">
                    <strong>{item.item_name}</strong>
                    <span>📍 {item.location} · {item.category}</span>
                  </div>
                  <span className="rf-status-badge">{item.status}</span>
                </div>
              ))}
            </div>

            {lostItems.length > 6 && (
              <p className="rf-more-label">+{lostItems.length - 6} more reports</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

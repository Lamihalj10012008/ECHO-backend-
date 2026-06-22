import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./MatchResults.css";

const CAT_ICONS = {
  Electronics: "📱", Documents: "📄", Clothing: "👕",
  Accessories: "🎒", Keys: "🔑", Other: "📦", Unknown: "❓",
};

const FILTERS = ["All", "High Confidence", "Pending", "Accepted"];

const confColor = (c) => {
  if (c >= 80) return "#10b981";
  if (c >= 60) return "#f59e0b";
  return "#4f8ef7";
};

const confLabel = (c) => {
  if (c >= 80) return "High";
  if (c >= 60) return "Medium";
  return "Low";
};

export default function MatchResults() {
  const navigate = useNavigate();

  const [matches, setMatches]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState("All");
  const [statuses, setStatuses] = useState({});

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/matches");
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setMatches(data);
      // Seed local statuses from API — don't overwrite user's in-session changes
      setStatuses((prev) => {
        const next = { ...prev };
        data.forEach((m) => {
          if (!(m.id in next)) next[m.id] = m.status || "pending";
        });
        return next;
      });
    } catch (err) {
      setError(err.message || "Could not load matches.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const updateStatus = async (matchId, newStatus) => {
    // Optimistic update
    setStatuses((p) => ({ ...p, [matchId]: newStatus }));
    try {
      const res = await fetch(`http://127.0.0.1:8000/matches/${matchId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        // Roll back on failure
        setStatuses((p) => {
          const prev = matches.find((m) => m.id === matchId)?.status || "pending";
          return { ...p, [matchId]: prev };
        });
      }
    } catch {
      setStatuses((p) => {
        const prev = matches.find((m) => m.id === matchId)?.status || "pending";
        return { ...p, [matchId]: prev };
      });
    }
  };

  const accept = (id) => updateStatus(id, "accepted");
  const reject = (id) => updateStatus(id, "rejected");

  const filtered = matches.filter((m) => {
    const st = statuses[m.id] || "pending";
    if (filter === "High Confidence") return m.confidence >= 80;
    if (filter === "Pending")         return st === "pending";
    if (filter === "Accepted")        return st === "accepted";
    return true;
  });

  const counts = {
    total:    matches.length,
    high:     matches.filter((m) => m.confidence >= 80).length,
    accepted: Object.values(statuses).filter((s) => s === "accepted").length,
    pending:  Object.values(statuses).filter((s) => s === "pending").length,
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="mr-wrap">
        <div className="mr-loading">
          <div className="mr-spin-lg" />
          <p>Loading AI match results…</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="mr-wrap">
        <div className="mr-error-box">
          <span>⚠️</span>
          <div>
            <strong>Could not load matches</strong>
            <p>{error}</p>
          </div>
          <button className="mr-retry-btn" onClick={fetchMatches}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mr-wrap">
      {/* Header */}
      <div className="mr-header">
        <div>
          <h1>🤖 AI Match Results</h1>
          <p>Potential matches detected using text similarity and location analysis</p>
        </div>
        <div className="mr-header-stats">
          <div className="mr-hstat">
            <strong>{counts.total}</strong><span>Total Matches</span>
          </div>
          <div className="mr-hstat mr-hstat-green">
            <strong>{counts.high}</strong><span>High Conf.</span>
          </div>
          <div className="mr-hstat mr-hstat-orange">
            <strong>{counts.pending}</strong><span>Pending</span>
          </div>
          <div className="mr-hstat mr-hstat-blue">
            <strong>{counts.accepted}</strong><span>Accepted</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mr-filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`mr-filter-btn ${filter === f ? "mr-filter-active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span className="mr-result-count">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Empty state */}
      {matches.length === 0 && (
        <div className="mr-empty">
          <span>🤖</span>
          <h3>No AI matches yet</h3>
          <p>When you report a found item, the system automatically scans all lost item reports and surfaces matches here.</p>
          <div className="mr-empty-actions">
            <button className="mr-empty-btn" onClick={() => navigate("../report-lost")}>
              Report Lost Item →
            </button>
            <button className="mr-empty-btn mr-empty-btn-ghost" onClick={() => navigate("../report-found")}>
              Report Found Item →
            </button>
          </div>
        </div>
      )}

      {matches.length > 0 && filtered.length === 0 && (
        <div className="mr-empty">
          <span>🔍</span>
          <h3>No matches for this filter</h3>
          <p>Try switching to "All" to see all {matches.length} match{matches.length !== 1 ? "es" : ""}.</p>
        </div>
      )}

      {/* Match Cards */}
      <div className="mr-grid">
        {filtered.map((m) => {
          const status = statuses[m.id] || "pending";
          const color  = confColor(m.confidence);
          const icon   = CAT_ICONS[m.lost_item?.category] || "📦";
          const lost   = m.lost_item;
          const found  = m.found_item;

          return (
            <div key={m.id} className={`mr-card mr-status-${status}`}>
              {/* Status ribbon */}
              {status === "accepted" && <div className="mr-ribbon mr-ribbon-green">✓ Accepted</div>}
              {status === "rejected" && <div className="mr-ribbon mr-ribbon-red">✕ Dismissed</div>}

              {/* Top: confidence ring + category/method */}
              <div className="mr-card-top">
                <div
                  className="mr-ring"
                  style={{
                    background: `conic-gradient(${color} ${m.confidence}%, rgba(0,0,0,0.08) 0%)`,
                  }}
                >
                  <div className="mr-ring-inner">
                    <span style={{ color }}>{m.confidence}%</span>
                  </div>
                </div>

                <div className="mr-card-title">
                  <div className="mr-category-chip">
                    <span>{icon}</span> {lost?.category || "Unknown"}
                  </div>
                  <span className="mr-method-tag">{m.match_method || "Text Similarity"}</span>
                </div>
              </div>

              {/* Lost vs Found comparison */}
              <div className="mr-comparison">
                <div className="mr-item-box mr-item-lost">
                  <span className="mr-item-tag">LOST</span>
                  <strong>{lost?.item_name || "—"}</strong>
                  <span>📍 {lost?.location || "—"}</span>
                  {lost?.date_lost && <small>{lost.date_lost}</small>}
                </div>
                <div className="mr-vs-arrow">⟷</div>
                <div className="mr-item-box mr-item-found">
                  <span className="mr-item-tag">FOUND</span>
                  <strong>{found?.item_name || "—"}</strong>
                  <span>📍 {found?.location || "—"}</span>
                  {found?.date_found && <small>{found.date_found}</small>}
                </div>
              </div>

              {/* Confidence bar */}
              <div className="mr-conf-bar-wrap">
                <div className="mr-conf-track">
                  <div
                    className="mr-conf-fill"
                    style={{ width: `${m.confidence}%`, background: color }}
                  />
                </div>
                <span style={{ color, fontSize: "12px", fontWeight: 700 }}>
                  {confLabel(m.confidence)} confidence
                </span>
              </div>

              {/* Description snippets (if available) */}
              {(lost?.description || found?.description) && (
                <div className="mr-desc-row">
                  {lost?.description && (
                    <p className="mr-desc-snippet">
                      <em>Lost:</em> {lost.description.length > 90 ? lost.description.slice(0, 90) + "…" : lost.description}
                    </p>
                  )}
                  {found?.description && (
                    <p className="mr-desc-snippet">
                      <em>Found:</em> {found.description.length > 90 ? found.description.slice(0, 90) + "…" : found.description}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              {status === "pending" && (
                <div className="mr-actions">
                  <button className="mr-btn-accept" onClick={() => accept(m.id)}>
                    ✓ Confirm Match
                  </button>
                  <button className="mr-btn-reject" onClick={() => reject(m.id)}>
                    ✕ Not a Match
                  </button>
                </div>
              )}

              {status === "accepted" && (
                <div className="mr-accepted-msg">
                  ✅ Match confirmed! Both items marked as Matched. Contact the finder to collect.
                </div>
              )}

              {status === "rejected" && (
                <div className="mr-rejected-msg">
                  Match dismissed. AI will continue scanning for new reports.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Info Banner */}
      {matches.length > 0 && (
        <div className="mr-ai-info">
          <span>🤖</span>
          <div>
            <strong>How AI Matching Works</strong>
            <p>
              The system compares category (30%), item name (30%), description (25%), and location (15%)
              using text similarity algorithms. Scores ≥ 80% indicate high-confidence matches.
              Uploading a photo adds a +5% bonus to the score.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

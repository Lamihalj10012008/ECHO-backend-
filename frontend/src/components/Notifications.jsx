import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../context/StudentContext";
import "./Notifications.css";

const TYPE_META = {
  match:  { icon: "🤖", color: "#a855f7", bg: "rgba(168,85,247,0.1)",  label: "Match" },
  found:  { icon: "✅", color: "#10b981", bg: "rgba(16,185,129,0.1)",  label: "Confirmed" },
  system: { icon: "⚙️", color: "#64748b", bg: "rgba(100,116,139,0.1)", label: "System" },
  admin:  { icon: "🛡️", color: "#4f8ef7", bg: "rgba(79,142,247,0.1)",  label: "Admin" },
};

const TABS = ["All", "Matches", "Confirmed", "System", "My Items"];

const CAT_ICONS = {
  Electronics: "📱", Documents: "📄", Clothing: "👕",
  Accessories: "🎒", Keys: "🔑", Other: "📦",
};

function timeAgo(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  if (isNaN(d)) return isoStr;
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60)     return "Just now";
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function itemStatusStyle(item) {
  if (item.status === "Matched" || item.confirmed_count > 0)
    return { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)" };
  if (item.match_count > 0)
    return { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" };
  return { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" };
}

function itemStatusLabel(item) {
  if (item.status === "Matched" || item.confirmed_count > 0) return "✓ Matched";
  if (item.match_count > 0) return `${item.match_count} Match${item.match_count !== 1 ? "es" : ""} Found`;
  return "🔍 Searching…";
}

export default function Notifications() {
  const navigate   = useNavigate();
  const { student } = useStudent();
  const reportedBy  = student?.studentId || "Student";

  const [tab,           setTab]           = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [myItems,       setMyItems]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [readIds,       setReadIds]       = useState(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nRes, iRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/notifications/${encodeURIComponent(reportedBy)}`),
        fetch(`http://127.0.0.1:8000/my-lost-items/${encodeURIComponent(reportedBy)}`),
      ]);
      if (nRes.ok) setNotifications(await nRes.json());
      if (iRes.ok) setMyItems(await iRes.json());
    } catch {
      setError("Could not connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [reportedBy]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isRead  = (n)  => n.is_read || readIds.has(n.id);
  const markRead = (id) => setReadIds((p) => new Set([...p, id]));
  const markAllRead = () =>
    setReadIds(new Set(notifications.filter((n) => !n.is_read).map((n) => n.id)));

  const filtered = notifications.filter((n) => {
    if (tab === "Matches")   return n.type === "match";
    if (tab === "Confirmed") return n.type === "found";
    if (tab === "System")    return n.type === "system" || n.type === "admin";
    return true;
  });

  const unread = notifications.filter((n) => !isRead(n)).length;

  const counts = {
    all:       notifications.length,
    matches:   notifications.filter((n) => n.type === "match").length,
    confirmed: notifications.filter((n) => n.type === "found").length,
    system:    notifications.filter((n) => n.type === "system" || n.type === "admin").length,
  };

  /* ── Tracker stats ── */
  const activeItems   = myItems.filter((i) => i.status !== "Matched").length;
  const matchedItems  = myItems.filter((i) => i.status === "Matched" || i.confirmed_count > 0).length;
  const pendingItems  = myItems.filter((i) => i.match_count > 0 && i.status !== "Matched").length;

  return (
    <div className="nf-wrap">
      {/* Header */}
      <div className="nf-header">
        <div>
          <h1>
            🔔 Notification Centre
            {unread > 0 && <span className="nf-unread-badge">{unread}</span>}
          </h1>
          <p>Track your lost items, AI matches, and status updates in real time</p>
        </div>
        <div className="nf-header-right">
          {unread > 0 && (
            <button className="nf-mark-all-btn" onClick={markAllRead}>
              ✓ Mark all read
            </button>
          )}
          <button className="nf-refresh-btn" onClick={fetchData} title="Refresh">
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="nf-layout">
        {/* ── LEFT: Notification feed ── */}
        <div className="nf-feed-col">
          {/* Summary row */}
          <div className="nf-summary-row">
            {[
              { label: "Total",     val: counts.all,       color: "var(--lf-text)" },
              { label: "Unread",    val: unread,            color: "var(--lf-red)" },
              { label: "Matches",   val: counts.matches,    color: "#a855f7" },
              { label: "Confirmed", val: counts.confirmed,  color: "var(--lf-green)" },
            ].map((s) => (
              <div key={s.label} className="nf-summary-chip">
                <strong style={{ color: s.color }}>{s.val}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div className="nf-tabs">
            {TABS.map((t) => {
              const c = t === "All"       ? counts.all
                      : t === "Matches"   ? counts.matches
                      : t === "Confirmed" ? counts.confirmed
                      : t === "My Items"  ? myItems.length
                      : counts.system;
              return (
                <button
                  key={t}
                  className={`nf-tab ${tab === t ? "nf-tab-active" : ""}`}
                  onClick={() => setTab(t)}
                >
                  {t}
                  <span className="nf-tab-count">{c}</span>
                </button>
              );
            })}
          </div>

          {/* Loading */}
          {loading && (
            <div className="nf-loading-state">
              <span className="nf-spin" />
              <span>Loading your notifications…</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="nf-error-box">
              <span>⚠️</span>
              <div>
                <strong>Connection error</strong>
                <p>{error}</p>
              </div>
              <button className="nf-retry-btn" onClick={fetchData}>Retry</button>
            </div>
          )}

          {/* ── MY ITEMS VIEW ── */}
          {tab === "My Items" && !loading && (
            <div className="nf-items-view">
              {myItems.length === 0 ? (
                <div className="nf-empty">
                  <span>📭</span>
                  <h3>No lost item reports yet</h3>
                  <p>Report a lost item to start tracking its status here.</p>
                  <button className="nf-empty-btn" onClick={() => navigate("../report-lost")}>
                    Report Lost Item →
                  </button>
                </div>
              ) : (
                <>
                  <div className="nf-items-summary">
                    <div className="nf-isumm nf-isumm-red">
                      <strong>{myItems.filter(i => i.status !== "Matched" && i.confirmed_count === 0).length}</strong>
                      <span>Still Missing</span>
                    </div>
                    <div className="nf-isumm nf-isumm-amber">
                      <strong>{myItems.filter(i => i.match_count > 0 && i.status !== "Matched").length}</strong>
                      <span>Match Found</span>
                    </div>
                    <div className="nf-isumm nf-isumm-green">
                      <strong>{myItems.filter(i => i.status === "Matched" || i.confirmed_count > 0).length}</strong>
                      <span>Recovered</span>
                    </div>
                  </div>

                  {myItems.map((item) => {
                    const st  = itemStatusStyle(item);
                    const lb  = itemStatusLabel(item);
                    const icon = CAT_ICONS[item.category] || "📦";
                    const isMatched  = item.status === "Matched" || item.confirmed_count > 0;
                    const hasMatches = item.match_count > 0 && !isMatched;
                    return (
                      <div key={item.id} className={`nf-item-card ${isMatched ? "nf-item-card-matched" : ""} ${hasMatches ? "nf-item-card-pending" : ""}`}>
                        <div className="nf-item-card-left">
                          <div className="nf-item-cat-icon">{icon}</div>
                          <div className="nf-item-card-info">
                            <strong className="nf-item-card-name">{item.item_name}</strong>
                            <span className="nf-item-card-meta">📍 {item.location} · {item.category}</span>
                            {item.date_lost && (
                              <span className="nf-item-card-meta">📅 Lost on {item.date_lost}</span>
                            )}
                            {item.description && (
                              <span className="nf-item-card-desc">{item.description.length > 80 ? item.description.slice(0, 80) + "…" : item.description}</span>
                            )}
                          </div>
                        </div>
                        <div className="nf-item-card-right">
                          <div className="nf-item-status-badge" style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}` }}>
                            {lb}
                          </div>
                          {hasMatches && (
                            <button
                              className="nf-item-view-match"
                              onClick={() => navigate("../match-results")}
                            >
                              View match →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <div className="nf-items-actions">
                    <button className="nf-empty-btn" style={{ fontSize: 13 }} onClick={() => navigate("../match-results")}>
                      🤖 View All AI Matches
                    </button>
                    <button className="nf-mark-all-btn" onClick={() => navigate("../report-lost")}>
                      + Report Another Item
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && tab !== "My Items" && (
            <div className="nf-empty">
              <span>🔕</span>
              <h3>{counts.all === 0 ? "No activity yet" : "No notifications here"}</h3>
              <p>
                {counts.all === 0
                  ? "Report a lost item to start receiving status updates here."
                  : "Try a different tab to see all your notifications."}
              </p>
              {counts.all === 0 && (
                <button className="nf-empty-btn" onClick={() => navigate("../report-lost")}>
                  Report Lost Item →
                </button>
              )}
            </div>
          )}

          {/* Notification list — hidden when My Items tab is active */}
          <div className="nf-list" style={{ display: tab === "My Items" ? "none" : "flex" }}>
            {filtered.map((n) => {
              const meta = TYPE_META[n.type] || TYPE_META.system;
              const read = isRead(n);
              return (
                <div
                  key={n.id}
                  className={`nf-item ${!read ? "nf-item-unread" : ""}`}
                  onClick={() => markRead(n.id)}
                >
                  <div className="nf-icon-wrap" style={{ background: meta.bg, color: meta.color }}>
                    {meta.icon}
                  </div>

                  <div className="nf-body">
                    <div className="nf-title-row">
                      <strong className="nf-title">{n.title}</strong>
                      <span className="nf-type-tag" style={{ color: meta.color, background: meta.bg }}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="nf-msg">{n.message}</p>
                    <div className="nf-meta-row">
                      <small className="nf-time">🕐 {timeAgo(n.time)}</small>
                      {n.action && (
                        <button
                          className="nf-action-link"
                          style={{ color: meta.color }}
                          onClick={(e) => { e.stopPropagation(); navigate("../match-results"); }}
                        >
                          {n.action} →
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="nf-right">
                    {!read && <div className="nf-dot" />}
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && notifications.length > 0 && tab !== "My Items" && (
            <p className="nf-footer-hint">Click a notification to mark it as read.</p>
          )}
        </div>

        {/* ── RIGHT: My Lost Reports tracker ── */}
        <div className="nf-tracker-col">
          <div className="nf-tracker-card">
            <div className="nf-tracker-header">
              <h3>📤 My Lost Reports</h3>
              <span className="nf-tracker-count">{myItems.length} total</span>
            </div>

            {/* Tracker stats */}
            {myItems.length > 0 && (
              <div className="nf-tracker-stats">
                <div className="nf-tstat">
                  <strong style={{ color: "#ef4444" }}>{activeItems}</strong>
                  <span>Still lost</span>
                </div>
                <div className="nf-tstat">
                  <strong style={{ color: "#f59e0b" }}>{pendingItems}</strong>
                  <span>Matches</span>
                </div>
                <div className="nf-tstat">
                  <strong style={{ color: "#10b981" }}>{matchedItems}</strong>
                  <span>Recovered</span>
                </div>
              </div>
            )}

            {loading && (
              <div className="nf-tracker-loading">
                <span className="nf-spin" /> Loading…
              </div>
            )}

            {!loading && myItems.length === 0 && (
              <div className="nf-tracker-empty">
                <span>📭</span>
                <p>You haven't reported any lost items yet.</p>
                <button className="nf-tracker-btn" onClick={() => navigate("../report-lost")}>
                  Report a Lost Item
                </button>
              </div>
            )}

            <div className="nf-tracker-list">
              {myItems.map((item) => {
                const st = itemStatusStyle(item);
                const lb = itemStatusLabel(item);
                return (
                  <div key={item.id} className="nf-tracker-row">
                    <div className="nf-tracker-info">
                      <strong className="nf-tracker-name">{item.item_name}</strong>
                      <span className="nf-tracker-meta">
                        📍 {item.location}
                      </span>
                      <span className="nf-tracker-meta">
                        🏷 {item.category}{item.date_lost ? ` · ${item.date_lost}` : ""}
                      </span>
                    </div>
                    <div
                      className="nf-tracker-badge"
                      style={{
                        color: st.color,
                        background: st.bg,
                        border: `1px solid ${st.border}`,
                      }}
                    >
                      {lb}
                    </div>
                  </div>
                );
              })}
            </div>

            {myItems.length > 0 && (
              <div className="nf-tracker-actions">
                <button
                  className="nf-tracker-view-btn"
                  onClick={() => navigate("../match-results")}
                >
                  🤖 View AI Matches
                </button>
                <button
                  className="nf-tracker-view-btn nf-tracker-btn-ghost"
                  onClick={() => navigate("../report-lost")}
                >
                  + Report Another
                </button>
              </div>
            )}
          </div>

          {/* AI status info box */}
          <div className="nf-ai-status-card">
            <div className="nf-ai-status-top">
              <span className="nf-ai-pulse" />
              <strong>AI Matching Active</strong>
            </div>
            <p>
              Every time a new found item is reported, the system automatically scans it
              against all open lost reports and sends you a notification if a match is detected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

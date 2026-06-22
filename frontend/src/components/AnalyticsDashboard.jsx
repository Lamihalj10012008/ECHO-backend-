import "./AnalyticsDashboard.css";

const OVERVIEW = [
  { label: "Total Cases",    value: "85",   sub: "All time",       icon: "📋", color: "#4f8ef7" },
  { label: "Resolved",       value: "52",   sub: "61% rate",       icon: "✅", color: "#10b981" },
  { label: "Pending",        value: "33",   sub: "Active cases",   icon: "⏳", color: "#f59e0b" },
  { label: "Avg Resolution", value: "2.4d", sub: "Days to close",  icon: "⚡", color: "#a855f7" },
];

const CATEGORIES = [
  { name: "Electronics",  count: 28, pct: 65, color: "#4f8ef7" },
  { name: "Accessories",  count: 18, pct: 42, color: "#a855f7" },
  { name: "Documents",    count: 15, pct: 35, color: "#10b981" },
  { name: "Clothing",     count: 12, pct: 28, color: "#f59e0b" },
  { name: "Keys",         count: 8,  pct: 19, color: "#ef4444" },
  { name: "Other",        count: 4,  pct: 9,  color: "#64748b" },
];

const MONTHLY = [
  { month: "Jan", lost: 12, found: 8  },
  { month: "Feb", lost: 18, found: 14 },
  { month: "Mar", lost: 15, found: 11 },
  { month: "Apr", lost: 22, found: 16 },
  { month: "May", lost: 10, found: 9  },
  { month: "Jun", lost: 8,  found: 7  },
];

const DONUT = [
  { label: "Resolved",  count: 52, color: "#10b981", pct: 61 },
  { label: "Pending",   count: 15, color: "#f59e0b", pct: 18 },
  { label: "Unmatched", count: 18, color: "#ef4444", pct: 21 },
];

const TIMELINE = [
  { msg: "AI matched 'iPhone 14' with found device in Auditorium — 92% confidence",         time: "2h ago",  color: "#a855f7" },
  { msg: "Black Leather Wallet successfully claimed by owner at Admin desk",                  time: "5h ago",  color: "#10b981" },
  { msg: "New lost item logged: Student ID Card near Cafeteria",                             time: "8h ago",  color: "#f59e0b" },
  { msg: "Blue Water Bottle found at Sports Complex — handed to security",                   time: "1d ago",  color: "#4f8ef7" },
  { msg: "AI detected 85% match for missing Keys reported yesterday",                       time: "1d ago",  color: "#a855f7" },
];

export default function AnalyticsDashboard() {
  const maxVal = Math.max(...MONTHLY.flatMap((d) => [d.lost, d.found]));

  const donutGradient = `conic-gradient(
    ${DONUT[0].color} 0% ${DONUT[0].pct}%,
    ${DONUT[1].color} ${DONUT[0].pct}% ${DONUT[0].pct + DONUT[1].pct}%,
    ${DONUT[2].color} ${DONUT[0].pct + DONUT[1].pct}% 100%
  )`;

  return (
    <div className="ad-wrap">

      {/* Header */}
      <div className="ad-header">
        <div>
          <h1>📊 Analytics Dashboard</h1>
          <p>Lost &amp; Found module performance overview — June 2024</p>
        </div>
        <button className="ad-export-btn">⬇ Export CSV</button>
      </div>

      {/* Overview stats */}
      <div className="ad-overview">
        {OVERVIEW.map((s, i) => (
          <div key={i} className="ad-ov-card">
            <div className="ad-ov-icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="ad-ov-body">
              <span className="ad-ov-label">{s.label}</span>
              <strong className="ad-ov-val" style={{ color: s.color }}>{s.value}</strong>
              <span className="ad-ov-sub">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="ad-charts-row">

        {/* Category horizontal bars */}
        <div className="ad-card ad-cat-card">
          <div className="ad-card-header">
            <h3>Category Breakdown</h3>
            <p>Distribution of all reported items by type</p>
          </div>
          <div className="ad-cat-list">
            {CATEGORIES.map((c, i) => (
              <div key={i} className="ad-cat-row">
                <div className="ad-cat-meta">
                  <span className="ad-cat-name">{c.name}</span>
                  <span className="ad-cat-count">{c.count} items</span>
                </div>
                <div className="ad-prog-track">
                  <div
                    className="ad-prog-fill"
                    style={{ width: `${c.pct}%`, background: c.color, animationDelay: `${i * 0.07}s` }}
                  />
                </div>
                <span className="ad-cat-pct" style={{ color: c.color }}>{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status donut + recovery ring */}
        <div className="ad-card ad-donut-card">
          <div className="ad-card-header">
            <h3>Status Distribution</h3>
            <p>Current breakdown of case outcomes</p>
          </div>
          <div className="ad-donut-area">
            <div className="ad-donut" style={{ background: donutGradient }}>
              <div className="ad-donut-inner">
                <strong>85</strong>
                <span>Cases</span>
              </div>
            </div>
            <div className="ad-donut-legend">
              {DONUT.map((seg, i) => (
                <div key={i} className="ad-legend-row">
                  <div className="ad-legend-dot" style={{ background: seg.color }} />
                  <span>{seg.label}</span>
                  <strong style={{ color: seg.color }}>{seg.count}</strong>
                  <small>{seg.pct}%</small>
                </div>
              ))}
            </div>
          </div>

          <div className="ad-recovery-row">
            <div className="ad-recovery-ring" style={{ background: `conic-gradient(#10b981 61%, rgba(255,255,255,0.06) 0%)` }}>
              <div className="ad-recovery-inner"><strong>61%</strong></div>
            </div>
            <div>
              <strong className="ad-recovery-title">Recovery Rate</strong>
              <p>Items successfully returned to their owners this month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="ad-card ad-bar-card">
        <div className="ad-bar-card-header">
          <div>
            <h3>Monthly Activity Trend</h3>
            <p>Lost vs Found report volume over the last 6 months</p>
          </div>
          <div className="ad-bar-legend">
            <span><i className="ad-sq ad-sq-lost" /> Lost</span>
            <span><i className="ad-sq ad-sq-found" /> Found</span>
          </div>
        </div>

        <div className="ad-bar-chart">
          {MONTHLY.map((d, i) => (
            <div key={i} className="ad-bar-group">
              <div className="ad-bars">
                <div
                  className="ad-bar ad-bar-lost"
                  style={{ height: `${(d.lost / maxVal) * 140}px`, animationDelay: `${i * 0.08}s` }}
                  title={`Lost: ${d.lost}`}
                />
                <div
                  className="ad-bar ad-bar-found"
                  style={{ height: `${(d.found / maxVal) * 140}px`, animationDelay: `${i * 0.08 + 0.04}s` }}
                  title={`Found: ${d.found}`}
                />
              </div>
              <div className="ad-bar-nums">
                <span style={{ color: "#ef4444" }}>{d.lost}</span>
                <span style={{ color: "#4f8ef7" }}>{d.found}</span>
              </div>
              <span className="ad-bar-month">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity timeline */}
      <div className="ad-card">
        <div className="ad-card-header">
          <h3>Recent Activity</h3>
          <p>Latest events across the Lost &amp; Found system</p>
        </div>
        <div className="ad-timeline">
          {TIMELINE.map((ev, i) => (
            <div key={i} className="ad-tl-item">
              <div className="ad-tl-track">
                <div className="ad-tl-dot" style={{ background: ev.color, boxShadow: `0 0 8px ${ev.color}60` }} />
                {i < TIMELINE.length - 1 && <div className="ad-tl-line" />}
              </div>
              <div className="ad-tl-body">
                <p>{ev.msg}</p>
                <small>🕐 {ev.time}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

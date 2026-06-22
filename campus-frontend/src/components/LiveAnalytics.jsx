import React from 'react';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, AreaChart, Area } from 'recharts';
import './LiveAnalytics.css';

const COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444'];

const visitData = [{name:'Library',visits:1247},{name:'Canteen',visits:1102},{name:'Sports',visits:983},{name:'Gallery',visits:876},{name:'Study Halls',visits:834},{name:'Activity Ctr',visits:756},{name:'Botanical',visits:698},{name:'Chapel',visits:623}];
const studyData = [{name:'Central Library',value:35},{name:'Study Halls',value:25},{name:'E-Learning',value:18},{name:'CSE Lab',value:12},{name:'Research',value:10}];
const radarData = [{subject:'Scenery',A:95},{subject:'Lighting',A:88},{subject:'Access',A:72},{subject:'Crowds',A:45},{subject:'Golden Hr',A:92},{subject:'Variety',A:78}];
const socialData = [5,3,2,2,3,5,12,28,35,42,55,68,85,72,58,52,60,78,92,88,72,55,35,18].map((v,i)=>({hour:`${i}:00`,activity:v}));
const heatData = [
  [0.4,0.9,0.7,0.8,0.6,0.2],[0.5,0.8,0.8,0.9,0.5,0.2],[0.4,0.9,0.7,0.7,0.6,0.3],
  [0.5,0.8,0.8,0.8,0.7,0.2],[0.6,0.7,0.9,0.6,0.8,0.4],[0.2,0.4,0.5,0.5,0.6,0.3],[0.1,0.3,0.4,0.3,0.4,0.2]
];
const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const timeBlocks = ['6-9','9-12','12-15','15-18','18-21','21-24'];

const GlassTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return <div className="glass-tooltip"><p>{label}</p><p style={{color:'#3b82f6',fontWeight:600}}>{payload[0].value}</p></div>;
};

function heatColor(v) {
  if (v > 0.7) return 'rgba(239,68,68,0.5)';
  if (v > 0.4) return 'rgba(245,158,11,0.35)';
  return 'rgba(30,58,95,0.6)';
}

export default function LiveAnalytics() {
  return (
    <section className="analytics section-container">
      <h2 className="section-title"><BarChart3 size={28} color="#3b82f6" /> Live Campus Analytics <span className="live-indicator" /></h2>
      <p className="section-subtitle">Real-time insights into campus activity patterns</p>
      <div className="analytics-grid">
        <div className="chart-card glass-card">
          <h3>Most Visited Locations</h3>
          <p className="chart-desc">Weekly visit counts across campus</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={visitData} layout="vertical" margin={{left:10}}>
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={80} />
              <Tooltip content={<GlassTooltip />} />
              <Bar dataKey="visits" fill="#3b82f6" radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card glass-card">
          <h3>Popular Study Areas</h3>
          <p className="chart-desc">Student distribution across study zones</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={studyData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value" label={({name,value})=>`${name} ${value}%`} fontSize={11}>
                {studyData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip content={<GlassTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card glass-card">
          <h3>Photography Hotspot Quality</h3>
          <p className="chart-desc">Multi-dimensional venue scoring</p>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
              <Radar name="Score" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} dot={{ r: 4, fill: '#f59e0b' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card glass-card">
          <h3>Social Activity Trends</h3>
          <p className="chart-desc">24-hour activity pattern</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={socialData}>
              <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="hour" stroke="#64748b" fontSize={10} interval={3} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip content={<GlassTooltip />} />
              <Area type="monotone" dataKey="activity" stroke="#8b5cf6" fill="url(#areaGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card glass-card chart-wide">
          <h3>Campus Traffic Density</h3>
          <p className="chart-desc">Weekly heatmap — darker = busier</p>
          <div className="heat-grid">
            <div className="heat-labels-y">{days.map(d => <span key={d}>{d}</span>)}</div>
            <div className="heat-body">
              <div className="heat-labels-x">{timeBlocks.map(t => <span key={t}>{t}</span>)}</div>
              {heatData.map((row, ri) => (
                <div key={ri} className="heat-row">
                  {row.map((v, ci) => <div key={ci} className="heat-cell" style={{ background: heatColor(v) }} title={`${days[ri]} ${timeBlocks[ci]}: ${Math.round(v*100)}%`} />)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

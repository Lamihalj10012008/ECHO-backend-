import React from 'react';
import { Brain, Lightbulb, TrendingUp, CloudSun, Clock, Gem } from 'lucide-react';
import './AIInsights.css';

const factors = [
  { name: 'Proximity', weight: 25, color: '#3b82f6' },
  { name: 'Crowd Fit', weight: 20, color: '#10b981' },
  { name: 'Rating', weight: 15, color: '#f59e0b' },
  { name: 'Weather Match', weight: 10, color: '#06b6d4' },
  { name: 'Time Relevance', weight: 10, color: '#8b5cf6' },
  { name: 'History', weight: 8, color: '#ec4899' },
  { name: 'Events', weight: 7, color: '#f97316' },
  { name: 'Freshness', weight: 5, color: '#14b8a6' },
];

const predictions = [
  { text: 'Central Library expected to reach HIGH by 2:00 PM', level: 'high' },
  { text: 'Sports Complex will be LOW after 4:00 PM', level: 'low' },
  { text: 'Main Canteen peak expected at 12:30 PM', level: 'high' },
  { text: 'Study Halls clearing up by 3:00 PM', level: 'low' },
];

const bestTimes = [
  { cat: 'Study', color: '#3b82f6', time: 'Early morning (6-9 AM) or late evening (8-10 PM)' },
  { cat: 'Social', color: '#10b981', time: 'Lunch break (12-1 PM) or evening (5-7 PM)' },
  { cat: 'Photography', color: '#f59e0b', time: 'Golden hour (5:30-6:30 PM) or dawn (6-7 AM)' },
  { cat: 'Sports', color: '#ef4444', time: 'Early morning (5-7 AM) or late afternoon (4-6 PM)' },
  { cat: 'Relaxation', color: '#8b5cf6', time: 'Mid-morning (10-11 AM) or sunset (5:30-6:30 PM)' },
];

const gems = [
  { name: 'Sunset Point Hilltop', rating: 4.9, visits: 23, perfect: 'Landscape photography with 360° mountain views' },
  { name: 'Meditation & Wellness Center', rating: 4.8, visits: 31, perfect: 'Quiet studying with mountain views' },
  { name: 'Postgraduate Research Block', rating: 4.8, visits: 19, perfect: 'Deep-focus research sessions' },
];

const levelColors = { high: '#ef4444', low: '#10b981', moderate: '#f59e0b' };

export default function AIInsights() {
  return (
    <section className="insights section-container">
      <h2 className="section-title"><Brain size={28} color="#8b5cf6" /> AI Insights ✨</h2>
      <p className="section-subtitle">How ECHO's recommendation engine thinks and predicts</p>

      <div className="insights-grid">
        <div className="insight-card glass-card">
          <h3><Lightbulb size={18} color="#f59e0b" /> How ECHO Thinks</h3>
          <div className="factor-bars">
            {factors.map(f => (
              <div key={f.name} className="factor-row">
                <span className="factor-label">{f.name}</span>
                <div className="factor-track">
                  <div className="factor-fill" style={{ width: `${f.weight * 4}%`, background: f.color, animationDelay: `${factors.indexOf(f) * 0.1}s` }} />
                </div>
                <span className="factor-pct">{f.weight}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="insight-card glass-card">
          <h3><TrendingUp size={18} color="#10b981" /> Crowd Forecast</h3>
          <div className="prediction-list">
            {predictions.map((p, i) => (
              <div key={i} className="prediction-row" style={{ borderLeftColor: levelColors[p.level] }}>
                <span className="pred-dot" style={{ background: levelColors[p.level] }} />
                <span>{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="insight-card glass-card">
          <h3><CloudSun size={18} color="#06b6d4" /> Weather Impact</h3>
          <p className="weather-current">28°C Partly Cloudy</p>
          <p className="weather-text">Outdoor locations recommended. Low UV index ideal for photography. Botanical Garden and Lake View Point are optimal choices.</p>
          <div className="weather-badges">
            <span className="weather-badge">Outdoor Friendly ☀️</span>
            <span className="weather-badge">Photography Ideal 📸</span>
          </div>
        </div>

        <div className="insight-card glass-card">
          <h3><Clock size={18} color="#8b5cf6" /> Optimal Visit Windows</h3>
          <div className="time-list">
            {bestTimes.map(t => (
              <div key={t.cat} className="time-row">
                <span className="time-cat" style={{ color: t.color }}>● {t.cat}</span>
                <span className="time-val">{t.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="insight-card glass-card insight-wide">
          <h3><Gem size={18} color="#ec4899" /> Hidden Campus Gems</h3>
          <div className="gems-grid">
            {gems.map(g => (
              <div key={g.name} className="gem-card glass-card">
                <h4>{g.name}</h4>
                <p className="gem-stat">⭐ {g.rating} rating · only {g.visits} visits this week</p>
                <p className="gem-perfect">Perfect for: {g.perfect}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

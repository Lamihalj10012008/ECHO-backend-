import React from 'react';
import { MapPin, Clock, Star, CheckCircle, XCircle } from 'lucide-react';
import { formatDistance, formatWalkingTime, formatMatchScore, formatCrowdLevel } from '../utils/formatters';
import './RecommendationResults.css';

export default function RecommendationResults({ recommendations = [], loading }) {
  if (loading) {
    return (
      <div className="rec-results section-container">
        <div className="rec-grid">
          {[0,1,2].map(i => <div key={i} className="rec-card skeleton"><div className="skeleton-img" /><div className="skeleton-body"><div className="skeleton-line w60" /><div className="skeleton-line w40" /><div className="skeleton-line w80" /></div></div>)}
        </div>
      </div>
    );
  }

  if (!recommendations.length) return null;

  return (
    <div className="rec-results section-container">
      <div className="rec-grid">
        {recommendations.map((rec, index) => {
          const crowd = formatCrowdLevel(rec.crowd_level);
          const scorePercent = Math.min(100, rec.match_score);
          return (
            <div key={rec.id || index} className="rec-card glass-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="rec-card-img-wrap">
                <img src={rec.image} alt={rec.name} className="rec-card-img" loading="lazy" />
                <div className="rec-card-img-overlay" />
                <div className="match-ring" style={{ '--score': scorePercent }}>
                  <span>{formatMatchScore(scorePercent)}</span>
                </div>
              </div>
              <div className="rec-card-body">
                <h3 className="rec-card-name">{rec.name}</h3>
                <div className="rec-card-meta">
                  <span><MapPin size={13} /> {formatDistance(rec.distance_m)}</span>
                  <span><Clock size={13} /> {formatWalkingTime(rec.walking_time)}</span>
                </div>
                <div className="rec-card-badges">
                  <span className="crowd-badge" style={{ color: crowd.color, borderColor: crowd.color + '40' }}>{crowd.icon} {crowd.text}</span>
                  <span className="rating-badge"><Star size={12} fill="#f59e0b" stroke="#f59e0b" /> {rec.rating}</span>
                  {rec.is_open ? (
                    <span className="status-badge open"><CheckCircle size={12} /> Open</span>
                  ) : (
                    <span className="status-badge closed"><XCircle size={12} /> Closed</span>
                  )}
                </div>
                <p className="rec-card-reason">{rec.ai_reason}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

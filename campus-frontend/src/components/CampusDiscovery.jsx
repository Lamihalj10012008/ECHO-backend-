import React, { useState } from 'react';
import { Grid, Search, Star, MapPin } from 'lucide-react';
import { FALLBACK_LOCATIONS, ACTIVITY_CATEGORIES, CROWD_COLORS } from '../utils/constants';
import './CampusDiscovery.css';

export default function CampusDiscovery() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const locs = FALLBACK_LOCATIONS.filter(l => {
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || l.category === filter;
    return matchSearch && matchFilter;
  });

  return (
    <section className="discovery section-container">
      <h2 className="section-title"><Grid size={28} color="#10b981" /> Campus Discovery</h2>
      <p className="section-subtitle">Explore all 25 campus locations in a Pinterest-style gallery</p>

      <div className="discovery-controls">
        <div className="search-wrap">
          <Search size={16} />
          <input type="text" placeholder="Search locations..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
        </div>
        <div className="filter-pills">
          <button className={`filter-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          {ACTIVITY_CATEGORIES.map(c => (
            <button key={c.id} className={`filter-pill ${filter === c.id ? 'active' : ''}`} style={filter === c.id ? {borderColor:c.color,color:c.color} : {}} onClick={() => setFilter(c.id)}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="masonry-grid">
        {locs.map((loc, i) => {
          const catInfo = ACTIVITY_CATEGORIES.find(c => c.id === loc.category) || {};
          return (
            <div key={loc.id} className="masonry-card glass-card" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="masonry-img-wrap">
                <img src={loc.images?.[0] || 'https://images.unsplash.com/photo-1562774053-701939374585?w=600'} alt={loc.name} className="masonry-img" loading="lazy" />
                <div className="masonry-overlay" />
                <span className="masonry-cat-badge" style={{color:catInfo.color,borderColor:catInfo.color+'60'}}>{catInfo.emoji} {catInfo.label}</span>
              </div>
              <div className="masonry-body">
                <h4 className="masonry-name">{loc.name}</h4>
                <p className="masonry-desc">{loc.description?.substring(0, 90)}...</p>
                <div className="masonry-footer">
                  <span className="masonry-rating"><Star size={12} fill="#f59e0b" stroke="#f59e0b" /> {loc.rating}</span>
                  <span className="masonry-reviews">{loc.review_count} reviews</span>
                  <span className="masonry-crowd" style={{ color: CROWD_COLORS[loc.crowd_level] }}>● {loc.crowd_level}</span>
                </div>
                <div className="masonry-facilities">
                  {(loc.facilities || []).slice(0, 3).map((f, j) => <span key={j} className="masonry-facility">{f}</span>)}
                  {(loc.facilities || []).length > 3 && <span className="masonry-facility">+{loc.facilities.length - 3}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="echo-footer">
        <p>ECHO AI Smart Campus Recommendation Engine</p>
        <p>Karunya Institute of Technology and Sciences, Coimbatore, India</p>
        <p>Built with ❤️ using React, Leaflet.js, Flask, PostGIS & Recharts</p>
      </footer>
    </section>
  );
}

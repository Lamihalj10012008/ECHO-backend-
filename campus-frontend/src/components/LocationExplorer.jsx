import React, { useState } from 'react';
import { Compass, ChevronDown, Star } from 'lucide-react';
import { FALLBACK_LOCATIONS, CROWD_COLORS, ACTIVITY_CATEGORIES } from '../utils/constants';
import './LocationExplorer.css';

const mockReviews = {
  1: [{name:'Ananya R.',rating:5,comment:'Best place for focused studying. Silent zones are a blessing during exams.',date:'2 weeks ago'},{name:'Karthik M.',rating:5,comment:'Amazing digital archives. Found all my research papers here.',date:'1 month ago'}],
  6: [{name:'Priya S.',rating:5,comment:'Gallery Halls during cultural fest is unbeatable!',date:'3 weeks ago'},{name:'Raj K.',rating:4,comment:'Great space for socializing. Gets crowded during lunch.',date:'1 month ago'}],
  11:[{name:'Deepa V.',rating:5,comment:'Most beautiful spot on campus. Golden hour is magical.',date:'1 week ago'},{name:'Arjun P.',rating:5,comment:'Western Ghats views are breathtaking. Must visit at sunset.',date:'2 weeks ago'}],
  16:[{name:'Vishnu S.',rating:4,comment:'Well-equipped gym. Badminton courts are excellent.',date:'3 weeks ago'}],
  22:[{name:'Lakshmi N.',rating:5,comment:'Guided meditation sessions changed my life. Highly recommend.',date:'2 weeks ago'}],
};

const defaultReviews = [{name:'Student',rating:4,comment:'Great location on campus. Would recommend visiting.',date:'Recently'}];

export default function LocationExplorer({ locations }) {
  const [openId, setOpenId] = useState(null);
  const locs = locations || FALLBACK_LOCATIONS;

  const categories = ACTIVITY_CATEGORIES.map(cat => ({
    ...cat,
    locations: locs.filter(l => l.category === cat.id)
  }));

  const toggle = (id) => setOpenId(openId === id ? null : id);

  return (
    <section className="explorer section-container">
      <h2 className="section-title"><Compass size={28} color="#f59e0b" /> Location Explorer</h2>
      <p className="section-subtitle">Discover every campus venue in detail</p>

      {categories.map(cat => (
        <div key={cat.id} className="explorer-category">
          <h3 className="category-header" style={{ color: cat.color }}>{cat.emoji} {cat.label} Locations</h3>
          {cat.locations.map(loc => {
            const isOpen = openId === loc.id;
            const reviews = mockReviews[loc.id] || defaultReviews;
            return (
              <div key={loc.id} className={`accordion-item ${isOpen ? 'expanded' : ''}`}>
                <button className="accordion-header" onClick={() => toggle(loc.id)}>
                  <div className="accordion-left">
                    <span className="acc-name">{loc.name}</span>
                    <span className="acc-rating"><Star size={12} fill="#f59e0b" stroke="#f59e0b" /> {loc.rating}</span>
                    <span className="acc-crowd" style={{ color: CROWD_COLORS[loc.crowd_level] }}>● {loc.crowd_level}</span>
                  </div>
                  <ChevronDown size={18} className={`acc-chevron ${isOpen ? 'rotated' : ''}`} />
                </button>
                <div className="accordion-body" style={{ maxHeight: isOpen ? '800px' : '0' }}>
                  <div className="accordion-content">
                    {loc.images?.[0] && <img src={loc.images[0]} alt={loc.name} className="acc-banner" loading="lazy" />}
                    <p className="acc-desc">{loc.description}</p>
                    <div className="acc-facilities">
                      {(loc.facilities || []).map((f, i) => <span key={i} className="facility-pill">{f}</span>)}
                    </div>
                    <div className="acc-reviews">
                      <h4>Student Reviews</h4>
                      {reviews.map((r, i) => (
                        <div key={i} className="review-card glass-card">
                          <div className="review-top"><strong>{r.name}</strong> <span className="review-stars"><Star size={11} fill="#f59e0b" stroke="#f59e0b" /> {r.rating}</span> <span className="review-date">{r.date}</span></div>
                          <p>{r.comment}</p>
                        </div>
                      ))}
                    </div>
                    <div className="acc-peak">
                      <h4>Crowd Pattern</h4>
                      <div className="peak-bars">
                        {Array.from({length:16}, (_, i) => i + 6).map(h => {
                          const isPeak = (h >= 9 && h <= 12) || (h >= 15 && h <= 17);
                          return <div key={h} className={`peak-bar ${isPeak ? 'peak' : 'quiet'}`} title={`${h}:00`} />;
                        })}
                      </div>
                      <div className="peak-labels"><span>6AM</span><span>12PM</span><span>6PM</span><span>10PM</span></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}

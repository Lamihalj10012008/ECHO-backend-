import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CAMPUS_CENTER, MAP_CONFIG, ACTIVITY_CATEGORIES, CROWD_COLORS, FALLBACK_LOCATIONS } from '../utils/constants';
import './CampusMap.css';

const categoryColors = { study:'#3b82f6', social:'#10b981', photography:'#f59e0b', sports:'#ef4444', relaxation:'#8b5cf6' };

function makeIcon(color, size = 12) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 0 8px ${color}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
}

const userIcon = L.divIcon({
  className: 'user-marker',
  html: '<div class="user-dot"><div class="user-dot-ring"></div></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function CampusMap({ locations, userLocation, recommendations, activeCategory, onCategoryChange }) {
  const [filters, setFilters] = useState(new Set(['study','social','photography','sports','relaxation']));
  const locs = locations || FALLBACK_LOCATIONS;
  const center = [userLocation?.latitude || CAMPUS_CENTER.lat, userLocation?.longitude || CAMPUS_CENTER.lng];

  const toggleFilter = (cat) => {
    setFilters(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
    if (onCategoryChange) onCategoryChange(cat);
  };

  const filtered = useMemo(() => locs.filter(l => filters.has(l.category)), [locs, filters]);

  const recIds = useMemo(() => new Set((recommendations || []).map(r => r.id)), [recommendations]);

  return (
    <div className="campus-map-wrapper">
      <div className="map-filters">
        {ACTIVITY_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`map-filter-pill ${filters.has(cat.id) ? 'active' : ''}`}
            style={filters.has(cat.id) ? { borderColor: cat.color, color: cat.color } : {}}
            onClick={() => toggleFilter(cat.id)}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>
      <MapContainer center={center} zoom={MAP_CONFIG.defaultZoom} scrollWheelZoom={true} zoomControl={false} className="campus-map">
        <TileLayer url={MAP_CONFIG.tileUrl} attribution={MAP_CONFIG.attribution} />
        <ZoomControl position="topright" />
        <Marker position={center} icon={userIcon}>
          <Popup><strong>📍 Your Location</strong></Popup>
        </Marker>
        {filtered.map(loc => (
          <React.Fragment key={loc.id}>
            <Marker position={[loc.latitude, loc.longitude]} icon={makeIcon(categoryColors[loc.category], recIds.has(loc.id) ? 18 : 12)}>
              <Popup>
                <div style={{minWidth:180}}>
                  <strong>{loc.name}</strong><br/>
                  <span style={{color:categoryColors[loc.category],textTransform:'capitalize'}}>{loc.category}</span> · ⭐ {loc.rating}<br/>
                  <span style={{color:CROWD_COLORS[loc.crowd_level]}}>● {loc.crowd_level}</span>
                  {recIds.has(loc.id) && <><br/><em style={{color:'#8b5cf6'}}>✨ AI Recommended</em></>}
                </div>
              </Popup>
            </Marker>
            <CircleMarker
              center={[loc.latitude, loc.longitude]}
              radius={loc.crowd_level === 'high' ? 25 : loc.crowd_level === 'moderate' ? 18 : 10}
              pathOptions={{ color: CROWD_COLORS[loc.crowd_level], fillColor: CROWD_COLORS[loc.crowd_level], fillOpacity: 0.15, weight: 1 }}
            />
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
}

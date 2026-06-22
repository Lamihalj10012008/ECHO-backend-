import React, { useState, useEffect } from 'react';
import { MapPin, Cloud, Clock, Users, Zap } from 'lucide-react';
import useWeather from '../hooks/useWeather';
import { formatTime, formatDate, formatTemperature } from '../utils/formatters';
import { CAMPUS_NAME } from '../utils/constants';
import './HeroHeader.css';

export default function HeroHeader() {
  const weather = useWeather();
  const [time, setTime] = useState(new Date());
  const [studentCount] = useState(Math.floor(Math.random() * 800) + 2400);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="hero-header">
      <div className="hero-inner">
        <div className="hero-brand">
          <h1 className="hero-logo">ECHO</h1>
          <p className="hero-tagline">Smart Campus AI Recommendation Engine</p>
          <p className="hero-campus">{CAMPUS_NAME}</p>
        </div>
        <div className="hero-stats">
          <div className="hero-pill">
            <MapPin size={14} />
            <span>Karunya Campus, Coimbatore</span>
          </div>
          <div className="hero-pill">
            <Cloud size={14} />
            <span>{formatTemperature(weather.temperature)} {weather.condition}</span>
          </div>
          <div className="hero-pill">
            <Clock size={14} />
            <span>{formatTime(time)} · {formatDate(time)}</span>
          </div>
          <div className="hero-pill hero-pill--live">
            <span className="live-dot" />
            <Users size={14} />
            <span>{studentCount.toLocaleString()} Active</span>
          </div>
          <div className="hero-pill hero-pill--ai">
            <Zap size={14} />
            <span>AI Engine Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}

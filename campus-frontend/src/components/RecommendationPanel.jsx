import React, { useState } from 'react';
import { BookOpen, Users, Camera, Trophy, Leaf, Sparkles, Loader } from 'lucide-react';
import { ACTIVITY_CATEGORIES, CAMPUS_CENTER } from '../utils/constants';
import { fetchRecommendations } from '../services/api';
import './RecommendationPanel.css';

const iconMap = { BookOpen, Users, Camera, Trophy, Leaf };

export default function RecommendationPanel({ onRecommendationsLoaded, userLocation }) {
  const [activity, setActivity] = useState('study');
  const [loading, setLoading] = useState(false);

  const handleRecommend = async () => {
    setLoading(true);
    const lat = userLocation?.latitude || CAMPUS_CENTER.lat;
    const lng = userLocation?.longitude || CAMPUS_CENTER.lng;

    const res = await fetchRecommendations(lat, lng, activity);
    if (res?.data) {
      onRecommendationsLoaded(res.data);
    } else {
      // Fallback mock recommendations
      onRecommendationsLoaded(getMockRecommendations(activity));
    }
    setLoading(false);
  };

  return (
    <section className="rec-panel section-container">
      <h2 className="section-title"><Sparkles size={28} color="#8b5cf6" /> AI Recommendations</h2>
      <p className="section-subtitle">Select your activity and let ECHO find the perfect campus spot</p>

      <div className="activity-pills">
        {ACTIVITY_CATEGORIES.map(cat => {
          const Icon = iconMap[cat.icon];
          return (
            <button
              key={cat.id}
              className={`activity-pill ${activity === cat.id ? 'active' : ''}`}
              style={activity === cat.id ? { '--pill-color': cat.color } : {}}
              onClick={() => setActivity(cat.id)}
            >
              {Icon && <Icon size={18} />}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      <button className="rec-btn" onClick={handleRecommend} disabled={loading}>
        {loading ? (
          <><Loader size={18} className="spin" /> Analyzing Campus...</>
        ) : (
          <><Sparkles size={18} /> Get AI Recommendations</>
        )}
      </button>
    </section>
  );
}

function getMockRecommendations(activity) {
  const mocks = {
    study: [
      {id:1,name:"Central Library & Computer Centre",distance_m:120,walking_time:1.4,match_score:94.5,crowd_level:"moderate",rating:4.9,is_open:true,ai_reason:"Central Library & Computer Centre: very close to your current location, quiet environment ideal for focused study, one of the highest-rated spots on campus.",image:"https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600",facilities:["WiFi","AC","Silent Zones"],category:"study",latitude:10.9361,longitude:76.7352},
      {id:5,name:"Postgraduate Research Block",distance_m:280,walking_time:3.4,match_score:88.2,crowd_level:"low",rating:4.8,is_open:true,ai_reason:"Postgraduate Research Block: quiet environment ideal for focused study, highly rated by students.",image:"https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600",facilities:["WiFi","AC","Research Databases"],category:"study",latitude:10.9370,longitude:76.7365},
      {id:3,name:"E-Learning Centre",distance_m:190,walking_time:2.3,match_score:85.1,crowd_level:"low",rating:4.6,is_open:true,ai_reason:"E-Learning Centre: peaceful and uncrowded, good timing for this type of activity.",image:"https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600",facilities:["WiFi","Computers","Smart Boards"],category:"study",latitude:10.9355,longitude:76.7358},
    ],
    social: [
      {id:6,name:"Gallery Halls",distance_m:95,walking_time:1.1,match_score:92.3,crowd_level:"high",rating:4.8,is_open:true,ai_reason:"Gallery Halls: lively atmosphere perfect for socializing, one of the highest-rated spots on campus.",image:"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600",facilities:["Exhibition Space","Stage"],category:"social",latitude:10.9359,longitude:76.7349},
      {id:8,name:"Student Activity Center",distance_m:200,walking_time:2.4,match_score:87.1,crowd_level:"high",rating:4.4,is_open:true,ai_reason:"Student Activity Center: lively atmosphere perfect for socializing, this is the optimal time to visit.",image:"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600",facilities:["WiFi","Games","Café"],category:"social",latitude:10.9375,longitude:76.7355},
    ],
    photography: [
      {id:11,name:"Bethesda Scenic Overlook",distance_m:380,walking_time:4.6,match_score:96.1,crowd_level:"low",rating:4.9,is_open:true,ai_reason:"Bethesda Scenic Overlook: uncrowded setting great for photography, one of the highest-rated spots on campus, current weather conditions are ideal.",image:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",facilities:["Viewpoint","Benches"],category:"photography",latitude:10.9340,longitude:76.7330},
      {id:15,name:"Sunset Point Hilltop",distance_m:450,walking_time:5.4,match_score:91.8,crowd_level:"low",rating:4.9,is_open:true,ai_reason:"Sunset Point Hilltop: uncrowded setting great for photography, one of the highest-rated spots on campus.",image:"https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=600",facilities:["Viewpoint","Trail Access"],category:"photography",latitude:10.9325,longitude:76.7340},
    ],
    sports: [
      {id:16,name:"Sports Complex",distance_m:250,walking_time:3.0,match_score:89.5,crowd_level:"moderate",rating:4.5,is_open:true,ai_reason:"Sports Complex: good crowd for team activities, within comfortable walking distance.",image:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600",facilities:["Indoor Courts","Gym"],category:"sports",latitude:10.9380,longitude:76.7370},
    ],
    relaxation: [
      {id:22,name:"Meditation & Wellness Center",distance_m:230,walking_time:2.8,match_score:93.2,crowd_level:"low",rating:4.8,is_open:true,ai_reason:"Meditation & Wellness Center: peaceful and uncrowded for relaxation, highly rated by students.",image:"https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600",facilities:["Yoga Mats","Quiet Rooms"],category:"relaxation",latitude:10.9350,longitude:76.7335},
    ],
  };
  return mocks[activity] || mocks.study;
}

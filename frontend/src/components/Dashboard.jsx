import React from 'react';
import { useNavigate } from "react-router-dom";
import './Dashboard.css';

const Dashboard = () => {

  const navigate = useNavigate();

  const metrics = [
    { title: "Active Requests", value: "24", change: "+12%", trend: "positive" },
    { title: "Resolved Today", value: "156", change: "+8%", trend: "positive" },
    { title: "Response Time", value: "2.3m", change: "-15%", trend: "positive-green" },
    { title: "Satisfaction", value: "94%", change: "+3%", trend: "positive" }
  ];

  const services = [
    {
      title: "Help & Support",
      desc: "Submit complaints and get instant assistance",
      icon: "💬",
      color: "#1e70e0"
    },

    { 
      title: "Stress Management", 
      desc: "Mental wellness and stress evaluation support", 
      icon: "🧠", 
      color: "#9c27b0",
      route: "/stress-management"
    },

    { 
      title: "Facilities & Logistics", 
      desc: "Report infrastructure issues and maintenance", 
      icon: "🔧", 
      color: "#f57c00"
    },

    { 
      title: "Lost & Found", 
      desc: "AI-powered item matching and recovery", 
      icon: "🔍", 
      color: "#388e3c",
      route: "/lost-found"
    },

    { 
      title: "Events & Academic", 
      desc: "Book venues and coordinate campus events", 
      icon: "📅", 
      color: "#3f51b5"
    },

    { 
      title: "K-MAP Navigator", 
      desc: "Campus navigation and location services", 
      icon: "📍", 
      color: "#d32f2f"
    },

    { 
      title: "Emergency SOS", 
      desc: "Quick access to emergency services", 
      icon: "⚠️", 
      color: "#e91e63"
    },

    {
      title: "Carbon & Sustainability",
      desc: "Track campus environmental impact",
      icon: "🍃",
      color: "#4caf50"
    },

    {
      title: "AI Recommendation Engine",
      desc: "Best Places on Campus",
      icon: "🤖",
      color: "#0288d1"
    }
  ];

  return (
    <div className="echo-dashboard-container">

      {/* Welcome Banner */}
      <div className="welcome-banner">
        <h1>Welcome to ECHO</h1>
        <p>Your AI-powered campus assistant for smart governance and student support</p>

        <div className="banner-buttons">
          <button className="btn-get-started">
            Get Started
          </button>

          <button className="btn-learn-more">
            Learn More
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        {metrics.map((metric, idx) => (
          <div key={idx} className="metric-card">
            <div className="metric-header">
              <span className="metric-title">{metric.title}</span>
              <span className={`metric-change ${metric.trend}`}>{metric.change}</span>
            </div>
            <div className="metric-value">{metric.value}</div>
          </div>
        ))}
      </div>

      {/* Services */}
      <h2 className="section-heading">Campus Services</h2>

      <div className="services-grid">
        {services.map((service, idx) => (
          <div
            key={idx}
            className="service-card"
            onClick={() => service.route && navigate(service.route)}
            style={{ cursor: service.route ? "pointer" : "default" }}
          >
            <div className="service-icon-wrapper" style={{ backgroundColor: service.color }}>
              <span className="service-icon">{service.icon}</span>
            </div>
            <h3>{service.title}</h3>
            <p>{service.desc}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="section-heading">Quick Actions</h2>

      <div className="quick-actions-grid">
        <div className="action-card">
          <div className="action-icon blue-text">💬</div>
          <div>
            <h4>Submit Request</h4>
            <p>File a new complaint</p>
          </div>
        </div>

        <div className="action-card">
          <div className="action-icon purple-text">❓</div>
          <div>
            <h4>Get Help</h4>
            <p>AI assistant support</p>
          </div>
        </div>

        <div className="action-card">
          <div className="action-icon green-text">🏠</div>
          <div>
            <h4>My Dashboard</h4>
            <p>View your activity</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
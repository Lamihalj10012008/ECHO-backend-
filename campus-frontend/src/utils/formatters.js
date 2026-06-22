export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatWalkingTime(minutes) {
  if (minutes < 1) return '< 1 min walk';
  return `~${Math.round(minutes)} min walk`;
}

export function formatMatchScore(score) {
  return `${Math.round(score)}%`;
}

export function formatCrowdLevel(level) {
  const map = {
    low: { text: 'Low', color: '#10b981', icon: '🟢' },
    moderate: { text: 'Moderate', color: '#f59e0b', icon: '🟡' },
    medium: { text: 'Moderate', color: '#f59e0b', icon: '🟡' },
    high: { text: 'High', color: '#ef4444', icon: '🔴' },
    very_high: { text: 'Very High', color: '#dc2626', icon: '🔴' },
  };
  return map[level] || map.moderate;
}

export function formatTemperature(celsius) {
  return `${celsius}°C`;
}

export function formatTime(date = new Date()) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

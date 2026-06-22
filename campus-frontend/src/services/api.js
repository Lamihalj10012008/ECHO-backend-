const API_BASE = 'http://127.0.0.1:5000/api';

async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`API call failed: ${endpoint}`, err.message);
    return null;
  }
}

export async function fetchRecommendations(lat, lng, activity, studentId) {
  return apiFetch('/recommend', {
    method: 'POST',
    body: JSON.stringify({ lat, lng, activity, student_id: studentId }),
  });
}

export async function fetchLocations(category, crowdLevel) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (crowdLevel) params.set('crowd_level', crowdLevel);
  return apiFetch(`/locations?${params}`);
}

export async function fetchLocationDetail(id) {
  return apiFetch(`/locations/${id}`);
}

export async function fetchDashboardAnalytics() {
  return apiFetch('/analytics/dashboard');
}

export async function fetchCrowdHistory(locationId) {
  return apiFetch(`/analytics/crowd/${locationId}`);
}

export async function fetchInsights() {
  return apiFetch('/insights');
}

export async function fetchWeather(lat, lng) {
  return apiFetch(`/weather?lat=${lat}&lng=${lng}`);
}

export async function fetchCampusStatus() {
  return apiFetch('/status');
}

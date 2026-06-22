const express = require('express');
const router = express.Router();
const { CAMPUS_BUILDINGS, EMERGENCY_CONTACTS } = require('../data/buildings');

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── GET /api/emergency/contacts ─────────────────────────────────────────────
router.get('/contacts', (req, res) => res.json(EMERGENCY_CONTACTS));

// ─── GET /api/emergency/medical ──────────────────────────────────────────────
router.get('/medical', (req, res) => {
  const { lat, lng } = req.query;
  const medical = CAMPUS_BUILDINGS.find(b => b.id === 'bld-025');
  if (!medical) return res.status(404).json({ error: 'Medical centre not found' });

  const result = { building: medical, contact: EMERGENCY_CONTACTS.medical };
  if (lat && lng) {
    result.distance = Math.round(haversine(parseFloat(lat), parseFloat(lng), medical.coordinates.lat, medical.coordinates.lng));
    result.etaMinutes = Math.ceil(result.distance / 84); // ~5 km/h running pace
  }
  res.json(result);
});

// ─── GET /api/emergency/security ─────────────────────────────────────────────
router.get('/security', (req, res) => {
  const security = CAMPUS_BUILDINGS.find(b => b.id === 'bld-026');
  res.json({ building: security, contact: EMERGENCY_CONTACTS.security });
});

// ─── GET /api/emergency/nearest ──────────────────────────────────────────────
router.get('/nearest', (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

  const emergencyBuildings = CAMPUS_BUILDINGS
    .filter(b => b.emergency)
    .map(b => ({
      ...b,
      distance: Math.round(haversine(parseFloat(lat), parseFloat(lng), b.coordinates.lat, b.coordinates.lng)),
    }))
    .sort((a, b) => a.distance - b.distance);

  res.json({ nearest: emergencyBuildings, contacts: EMERGENCY_CONTACTS });
});

module.exports = router;

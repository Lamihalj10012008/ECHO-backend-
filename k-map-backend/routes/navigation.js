const express = require('express');
const router = express.Router();
const { CAMPUS_BUILDINGS } = require('../data/buildings');

// Haversine distance (meters)
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Walking speeds m/s
const SPEEDS = { walking: 1.4, wheelchair: 0.8, bicycle: 4.0, running: 2.8 };

// ─── POST /api/route ──────────────────────────────────────────────────────────
// Calculate a route between origin and destination
router.post('/route', (req, res) => {
  const { origin, destinationId, mode = 'walking' } = req.body;
  if (!origin || !destinationId) {
    return res.status(400).json({ error: 'origin (lat/lng) and destinationId are required' });
  }

  const dest = CAMPUS_BUILDINGS.find(b => b.id === destinationId);
  if (!dest) return res.status(404).json({ error: 'Destination building not found' });

  const distance = haversine(origin.lat, origin.lng, dest.coordinates.lat, dest.coordinates.lng);
  const speed = SPEEDS[mode] || SPEEDS.walking;
  const durationSecs = Math.round(distance / speed);
  const eta = new Date(Date.now() + durationSecs * 1000).toISOString();

  // Generate a simple waypoint route (straight line + building center in campus graph)
  const route = {
    id: `route-${Date.now()}`,
    mode,
    origin,
    destination: dest.coordinates,
    destinationBuilding: { id: dest.id, name: dest.name, shortName: dest.shortName },
    distance: {
      meters: Math.round(distance),
      text: distance >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${Math.round(distance)} m`,
    },
    duration: {
      seconds: durationSecs,
      text:
        durationSecs < 60
          ? `${durationSecs} sec`
          : durationSecs < 3600
          ? `${Math.floor(durationSecs / 60)} min`
          : `${Math.floor(durationSecs / 3600)} hr ${Math.floor((durationSecs % 3600) / 60)} min`,
    },
    eta,
    steps: generateSteps(origin, dest.coordinates, dest.name, mode),
    polyline: [
      origin,
      // Midpoint waypoint to simulate a slightly curved path
      {
        lat: (origin.lat + dest.coordinates.lat) / 2 + 0.0002,
        lng: (origin.lng + dest.coordinates.lng) / 2,
      },
      dest.coordinates,
    ],
    accessible: mode === 'wheelchair' ? dest.accessibility?.wheelchair : true,
    warnings: mode === 'wheelchair' && !dest.accessibility?.wheelchair
      ? ['This building may not be fully wheelchair accessible']
      : [],
  };

  res.json({ route });
});

// ─── GET /api/eta ─────────────────────────────────────────────────────────────
router.get('/eta', (req, res) => {
  const { fromLat, fromLng, toId, mode = 'walking' } = req.query;
  if (!fromLat || !fromLng || !toId) {
    return res.status(400).json({ error: 'fromLat, fromLng, toId are required' });
  }
  const dest = CAMPUS_BUILDINGS.find(b => b.id === toId);
  if (!dest) return res.status(404).json({ error: 'Building not found' });

  const distance = haversine(
    parseFloat(fromLat), parseFloat(fromLng),
    dest.coordinates.lat, dest.coordinates.lng
  );
  const speed = SPEEDS[mode] || SPEEDS.walking;
  const durationSecs = Math.round(distance / speed);
  const eta = new Date(Date.now() + durationSecs * 1000);

  res.json({
    distance: { meters: Math.round(distance), text: distance >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${Math.round(distance)} m` },
    duration: { seconds: durationSecs, text: durationSecs < 60 ? `${durationSecs} sec` : `${Math.floor(durationSecs / 60)} min` },
    eta: eta.toISOString(),
    etaFormatted: eta.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    mode,
  });
});

// ─── POST /api/reroute ────────────────────────────────────────────────────────
router.post('/reroute', (req, res) => {
  const { currentLocation, destinationId, mode = 'walking', reason = 'off_route' } = req.body;
  if (!currentLocation || !destinationId) {
    return res.status(400).json({ error: 'currentLocation and destinationId are required' });
  }
  // Simply recalculate from new position
  req.body.origin = currentLocation;
  const dest = CAMPUS_BUILDINGS.find(b => b.id === destinationId);
  if (!dest) return res.status(404).json({ error: 'Building not found' });

  const distance = haversine(currentLocation.lat, currentLocation.lng, dest.coordinates.lat, dest.coordinates.lng);
  const speed = SPEEDS[mode] || SPEEDS.walking;
  const durationSecs = Math.round(distance / speed);

  res.json({
    rerouted: true,
    reason,
    route: {
      id: `reroute-${Date.now()}`,
      mode,
      origin: currentLocation,
      destination: dest.coordinates,
      distance: { meters: Math.round(distance), text: `${Math.round(distance)} m` },
      duration: { seconds: durationSecs, text: `${Math.floor(durationSecs / 60)} min` },
      steps: generateSteps(currentLocation, dest.coordinates, dest.name, mode),
      polyline: [currentLocation, dest.coordinates],
    },
  });
});

// ─── GET /api/nearby ─────────────────────────────────────────────────────────
router.get('/nearby', (req, res) => {
  const { lat, lng, radius = 200, category } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

  let buildings = CAMPUS_BUILDINGS;
  if (category && category !== 'all') buildings = buildings.filter(b => b.category === category);

  const nearby = buildings
    .map(b => ({
      ...b,
      distance: Math.round(haversine(parseFloat(lat), parseFloat(lng), b.coordinates.lat, b.coordinates.lng)),
    }))
    .filter(b => b.distance <= parseInt(radius))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10);

  res.json({ nearby, count: nearby.length });
});

// ─── Helper: generate step-by-step instructions ───────────────────────────────
function generateSteps(origin, destination, destName, mode) {
  const dist = haversine(origin.lat, origin.lng, destination.lat, destination.lng);
  const bearing = getBearing(origin.lat, origin.lng, destination.lat, destination.lng);
  const direction = bearingToDirection(bearing);

  return [
    {
      index: 0,
      instruction: `Head ${direction} toward ${destName}`,
      distance: { meters: Math.round(dist * 0.3), text: `${Math.round(dist * 0.3)} m` },
      maneuver: 'depart',
      icon: 'navigation',
    },
    {
      index: 1,
      instruction: `Continue straight on campus walkway`,
      distance: { meters: Math.round(dist * 0.5), text: `${Math.round(dist * 0.5)} m` },
      maneuver: 'straight',
      icon: 'arrow-up',
    },
    {
      index: 2,
      instruction: `Arrive at ${destName}`,
      distance: { meters: 0, text: '0 m' },
      maneuver: 'arrive',
      icon: 'map-pin',
    },
  ];
}

function getBearing(lat1, lon1, lat2, lon2) {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function bearingToDirection(bearing) {
  const dirs = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
  return dirs[Math.round(bearing / 45) % 8];
}

module.exports = router;

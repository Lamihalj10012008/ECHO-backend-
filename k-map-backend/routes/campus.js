const express = require('express');
const router = express.Router();
const axios = require('axios');
const { CAMPUS_BUILDINGS, CATEGORIES } = require('../data/buildings');
const { cacheMiddleware } = require('../middleware/cache');

// Safe import of osm2geojson-lite
let osm2geojson = null;
try {
  const mod = require('osm2geojson-lite');
  osm2geojson = typeof mod === 'function' ? mod : (mod.default || mod.osm2geojson || null);
} catch (e) {
  console.warn('⚠️  osm2geojson-lite not loaded:', e.message);
}

const EMPTY_FC = { type: 'FeatureCollection', features: [] };

// ─── GET /api/campus-live ─────────────────────────────────────────────────────
router.get('/campus-live', cacheMiddleware(600), async (req, res) => {
  if (!osm2geojson) return res.json(EMPTY_FC);

  const overpassQuery = '[out:json][timeout:25];(way["building"](10.930,76.735,10.945,76.755);way["highway"](10.930,76.735,10.945,76.755););out body;>;out skel qt;';
  try {
    const response = await axios.get('https://overpass-api.de/api/interpreter', {
      params: { data: overpassQuery },
      headers: { 'User-Agent': 'K-MAPCampusNavigator/2.0 (Student Project; Karunya University)' },
      timeout: 30000,
    });
    const geoJsonData = osm2geojson(response.data, { completeFeature: true, renderTagged: true }) || EMPTY_FC;
    if (res.sendJsonCached) return res.sendJsonCached(geoJsonData);
    res.json(geoJsonData);
  } catch (error) {
    console.error('❌ OSM Fetch Error:', error.message);
    res.json(EMPTY_FC); // Graceful degradation
  }
});

// ─── GET /api/buildings ───────────────────────────────────────────────────────
router.get('/buildings', cacheMiddleware(3600), (req, res) => {
  const { category } = req.query;
  let buildings = CAMPUS_BUILDINGS;
  if (category && category !== 'all') {
    buildings = CAMPUS_BUILDINGS.filter(b => b.category === category);
  }
  const data = { buildings, categories: CATEGORIES, total: buildings.length };
  if (res.sendJsonCached) return res.sendJsonCached(data);
  res.json(data);
});

// ─── GET /api/buildings/:id ───────────────────────────────────────────────────
router.get('/buildings/:id', (req, res) => {
  const building = CAMPUS_BUILDINGS.find(b => b.id === req.params.id);
  if (!building) return res.status(404).json({ error: 'Building not found' });
  res.json(building);
});

// ─── GET /api/search?q=... ────────────────────────────────────────────────────
router.get('/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) return res.json({ results: [] });

  const scored = CAMPUS_BUILDINGS.map(b => {
    let score = 0;
    const name      = b.name.toLowerCase();
    const shortName = b.shortName.toLowerCase();
    const aliases   = b.aliases || [];

    if      (name === q || shortName === q)                               score += 100;
    else if (name.startsWith(q) || shortName.startsWith(q))              score += 80;
    else if (name.includes(q) || shortName.includes(q))                  score += 60;
    else if (aliases.some(a => a.includes(q)))                            score += 50;
    else if (b.departments?.some(d => d.toLowerCase().includes(q)))      score += 40;
    else if (b.category?.toLowerCase().includes(q))                      score += 35;
    else if (b.description?.toLowerCase().includes(q))                   score += 20;

    return { ...b, _score: score };
  })
    .filter(b => b._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 12)
    .map(({ _score, ...b }) => b);

  res.json({ results: scored, query: q });
});

// ─── GET /api/categories ──────────────────────────────────────────────────────
router.get('/categories', (req, res) => res.json(CATEGORIES));

module.exports = router;

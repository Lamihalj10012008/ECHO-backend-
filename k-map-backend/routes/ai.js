const express = require('express');
const router = express.Router();
const { CAMPUS_BUILDINGS } = require('../data/buildings');

// Simple NLP intent detection (rule-based)
const intents = [
  { pattern: /take me to|navigate to|go to|directions to|how to get to/i, intent: 'navigate_to' },
  { pattern: /where is|find|locate|show me/i, intent: 'find_place' },
  { pattern: /nearest|closest|nearby/i, intent: 'find_nearest' },
  { pattern: /what building|which building|what place|where am i/i, intent: 'identify_place' },
  { pattern: /open|closed|hours|timing/i, intent: 'building_hours' },
  { pattern: /emergency|help|accident|fire|ambulance/i, intent: 'emergency' },
  { pattern: /shortest|fastest|quickest route/i, intent: 'optimize_route' },
  { pattern: /wheelchair|accessible|disability/i, intent: 'accessibility' },
  { pattern: /park|parking/i, intent: 'find_parking' },
  { pattern: /food|eat|canteen|cafe|cafeteria/i, intent: 'find_food' },
];

// Extract building entity from query
function extractBuilding(query) {
  const q = query.toLowerCase();
  let best = null;
  let bestScore = 0;

  for (const b of CAMPUS_BUILDINGS) {
    let score = 0;
    if (b.name.toLowerCase().includes(q)) score = 100;
    else if (b.shortName.toLowerCase().includes(q)) score = 90;
    else if ((b.aliases || []).some(a => q.includes(a))) score = 80;
    else if ((b.aliases || []).some(a => a.includes(q.split(' ').find(w => w.length > 3) || ''))) score = 60;

    if (score > bestScore) { bestScore = score; best = b; }
  }
  return bestScore > 0 ? best : null;
}

function detectIntent(query) {
  for (const { pattern, intent } of intents) {
    if (pattern.test(query)) return intent;
  }
  return 'general_query';
}

// ─── POST /api/ai/query ───────────────────────────────────────────────────────
router.post('/query', (req, res) => {
  const { query, userLocation } = req.body;
  if (!query) return res.status(400).json({ error: 'query is required' });

  const intent = detectIntent(query);
  const building = extractBuilding(query);

  let response = '';
  let action = null;

  switch (intent) {
    case 'navigate_to':
    case 'find_place':
      if (building) {
        response = `I found **${building.name}**! It's a ${building.category} facility. ${building.description} Ready to navigate?`;
        action = { type: 'navigate', buildingId: building.id, buildingName: building.name, coordinates: building.coordinates };
      } else {
        response = `I couldn't find that location on the Karunya campus. Try searching for a department name, hostel, or facility.`;
        action = { type: 'search_prompt', suggestions: CAMPUS_BUILDINGS.slice(0, 5).map(b => b.shortName) };
      }
      break;

    case 'find_nearest':
      const category = query.toLowerCase().includes('food') || query.toLowerCase().includes('canteen') ? 'food'
        : query.toLowerCase().includes('hostel') ? 'hostel'
        : query.toLowerCase().includes('parking') ? 'parking'
        : query.toLowerCase().includes('medical') || query.toLowerCase().includes('hospital') ? 'medical'
        : null;
      const suggestions = CAMPUS_BUILDINGS
        .filter(b => !category || b.category === category)
        .slice(0, 3);
      response = `Here are the nearest ${category || 'campus'} locations I found:`;
      action = { type: 'show_nearby', results: suggestions.map(s => ({ id: s.id, name: s.shortName, category: s.category })) };
      break;

    case 'building_hours':
      if (building) {
        response = `**${building.shortName}** is open ${building.hours.open} – ${building.hours.close}, ${building.hours.days}.`;
        action = { type: 'show_info', buildingId: building.id };
      } else {
        response = `Which building's hours would you like to know?`;
      }
      break;

    case 'emergency':
      response = `🚨 **Emergency detected!** Routing you to Campus Medical Centre (Building 025). For immediate help, call **108** (Ambulance) or **0422-2614300** (Campus Medical).`;
      action = { type: 'emergency', buildingId: 'bld-025', phone: '0422-2614300' };
      break;

    case 'find_food':
      const foodPlaces = CAMPUS_BUILDINGS.filter(b => b.category === 'food');
      response = `Here are the food options on campus:`;
      action = { type: 'show_nearby', results: foodPlaces.map(f => ({ id: f.id, name: f.name, category: f.subcategory })) };
      break;

    case 'find_parking':
      const parkingPlaces = CAMPUS_BUILDINGS.filter(b => b.category === 'parking');
      response = `Campus parking zones available:`;
      action = { type: 'show_nearby', results: parkingPlaces.map(p => ({ id: p.id, name: p.name, category: p.subcategory })) };
      break;

    case 'accessibility':
      const accessibleBuildings = CAMPUS_BUILDINGS.filter(b => b.accessibility?.wheelchair);
      response = `I can route you via wheelchair-accessible paths. ${accessibleBuildings.length} buildings on campus have ramp/wheelchair access.`;
      action = { type: 'set_mode', mode: 'wheelchair' };
      break;

    default:
      response = `I'm K-MAP AI, your campus navigation assistant! I can help you:\n• **Navigate** to any campus building\n• **Find nearest** cafeteria, hostel, or facility\n• **Check hours** for any building\n• Handle **emergencies**\n\nTry: "Take me to the Central Library" or "Where is the nearest canteen?"`;
      action = { type: 'help', suggestions: ['Take me to Central Library', 'Where is the nearest cafeteria?', 'Guide me to Emmanuel Auditorium', 'Find the AI Department'] };
  }

  res.json({
    query,
    intent,
    building: building ? { id: building.id, name: building.name } : null,
    response,
    action,
    timestamp: new Date().toISOString(),
  });
});

// ─── GET /api/ai/suggestions ──────────────────────────────────────────────────
router.get('/suggestions', (req, res) => {
  res.json({
    suggestions: [
      'Take me to the AI Department',
      'Where is the nearest cafeteria?',
      'Guide me to Central Library',
      'Find Emmanuel Auditorium',
      'Navigate to Living Star Hostel',
      'Where is the Medical Centre?',
      'Show me parking spots',
      'Which buildings are wheelchair accessible?',
    ],
  });
});

module.exports = router;

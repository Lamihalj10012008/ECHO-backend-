// server.js — K-MAP Backend v2.0
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Middleware ─────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Rate limiter — 200 requests/minute per IP
const limiter = rateLimit({ windowMs: 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
app.use('/api/', limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', require('./routes/campus'));
app.use('/api/navigation', require('./routes/navigation'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/emergency', require('./routes/emergency'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({
  status: 'healthy',
  version: '2.0.0',
  name: 'K-MAP Backend',
  timestamp: new Date().toISOString(),
  routes: ['/api/campus-live', '/api/buildings', '/api/search', '/api/navigation/route', '/api/ai/query', '/api/emergency'],
}));

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route ${req.path} not found` }));

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🗺️  K-MAP Backend v2.0 running at http://localhost:${PORT}`);
  console.log(`📡 Health: http://localhost:${PORT}/health`);
  console.log(`🏛️  Buildings: http://localhost:${PORT}/api/buildings`);
  console.log(`🔍 Search: http://localhost:${PORT}/api/search?q=library`);
  console.log(`🤖 AI: POST http://localhost:${PORT}/api/ai/query`);
  console.log(`🚨 Emergency: http://localhost:${PORT}/api/emergency/medical`);
});
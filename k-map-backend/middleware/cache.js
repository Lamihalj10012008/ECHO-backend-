/**
 * In-memory cache middleware using node-cache
 */
const NodeCache = require('node-cache');
require('dotenv').config();

const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL_OSM || '600'),
  checkperiod: 120,
});

const cacheMiddleware = (ttl) => (req, res, next) => {
  const key = `__cache__${req.originalUrl}`;
  const cachedBody = cache.get(key);
  if (cachedBody) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cachedBody);
  }
  res.sendJsonCached = (data) => {
    cache.set(key, data, ttl);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  };
  next();
};

module.exports = { cache, cacheMiddleware };

/**
 * Crowd simulation service
 * Generates realistic simulated crowd density for campus buildings
 * based on time-of-day and day-of-week patterns.
 */

const CROWD_PROFILES = {
  academic: {
    weekday: [0,0,0,0,0,0,1,2,4,5,5,4,3,5,5,4,3,2,1,1,0,0,0,0],
    weekend: [0,0,0,0,0,0,0,1,1,2,2,2,1,1,1,1,0,0,0,0,0,0,0,0],
  },
  library: {
    weekday: [0,0,0,0,0,0,1,3,5,5,5,4,4,5,5,5,4,4,4,3,2,1,0,0],
    weekend: [0,0,0,0,0,0,0,1,2,3,4,4,4,4,3,3,2,2,1,0,0,0,0,0],
  },
  food: {
    weekday: [0,0,0,0,0,0,1,2,2,1,1,4,5,5,3,1,1,2,4,5,3,2,1,0],
    weekend: [0,0,0,0,0,0,0,0,1,2,3,4,5,4,3,2,2,3,4,3,2,1,0,0],
  },
  hostel: {
    weekday: [3,3,3,3,3,3,2,1,1,1,1,1,1,1,1,1,1,1,2,3,3,4,4,4],
    weekend: [4,4,4,4,4,3,3,2,2,2,2,2,2,2,2,2,3,3,4,4,5,5,4,4],
  },
  sports: {
    weekday: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,4,5,4,3,1,0],
    weekend: [0,0,0,0,0,0,0,1,2,3,4,4,3,3,2,2,3,4,4,3,2,1,0,0],
  },
  default: {
    weekday: [0,0,0,0,0,0,1,2,3,4,4,3,3,4,4,3,2,2,2,1,1,0,0,0],
    weekend: [0,0,0,0,0,0,0,1,2,2,2,2,2,2,1,1,1,1,1,0,0,0,0,0],
  },
};

const LEVEL_LABELS = ['none','very low','low','moderate','high','very high'];
const LEVEL_COLORS = ['#94a3b8','#22c55e','#84cc16','#f59e0b','#ef4444','#dc2626'];
const LEVEL_WIDTHS = [0, 0.15, 0.35, 0.60, 0.82, 1.0];

export const crowdService = {
  /**
   * Get simulated crowd data for a building
   */
  getCrowdData(building) {
    const now  = new Date();
    const hour = now.getHours();
    const dow  = now.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dow === 0 || dow === 6;

    const profile = CROWD_PROFILES[building.category] || CROWD_PROFILES.default;
    const schedule = isWeekend ? profile.weekend : profile.weekday;

    // Add ±1 variation per building ID (deterministic jitter)
    const jitter = (parseInt(building.id?.replace(/\D/g, '') || '0', 10) % 2) - 0;
    const rawLevel = Math.max(0, Math.min(5, schedule[hour] + jitter));

    // Peak hour override
    const isPeak = (hour >= 9 && hour <= 11) || (hour >= 13 && hour <= 15);
    const finalLevel = isPeak && rawLevel > 0 ? Math.min(5, rawLevel + 1) : rawLevel;

    return {
      level: finalLevel,
      label: LEVEL_LABELS[finalLevel],
      color: LEVEL_COLORS[finalLevel],
      fillWidth: LEVEL_WIDTHS[finalLevel],
      updatedAt: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  },

  /**
   * Get crowd data for all buildings
   */
  getAllCrowdData(buildings) {
    return buildings.reduce((acc, b) => {
      acc[b.id] = this.getCrowdData(b);
      return acc;
    }, {});
  },

  /**
   * Get colour for a building's crowd level string (from DB data)
   */
  getLevelColor(levelStr) {
    const map = { none:'#94a3b8', 'very low':'#22c55e', low:'#84cc16', moderate:'#f59e0b', high:'#ef4444', 'very high':'#dc2626', variable:'#6366f1' };
    return map[levelStr] || '#94a3b8';
  },
};

export default crowdService;

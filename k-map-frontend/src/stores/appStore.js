import { create } from 'zustand';

/**
 * K-MAP Global State Store (Zustand)
 * Single source of truth for all app state
 */
const useAppStore = create((set, get) => ({
  // ── Theme ──────────────────────────────────────────────────────────────────
  theme: localStorage.getItem('kmap-theme') || 'light',
  setTheme: (theme) => {
    localStorage.setItem('kmap-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },

  // ── Language ───────────────────────────────────────────────────────────────
  language: localStorage.getItem('kmap-lang') || 'en-US',
  setLanguage: (language) => {
    localStorage.setItem('kmap-lang', language);
    set({ language });
  },

  // ── GPS & User Location ────────────────────────────────────────────────────
  userLocation: null,
  userHeading: null,
  userAccuracy: null,
  locationError: null,
  isLocating: false,
  setUserLocation: (location, accuracy, heading) =>
    set({ userLocation: location, userAccuracy: accuracy, userHeading: heading }),
  setLocationError: (err) => set({ locationError: err }),
  setIsLocating: (v) => set({ isLocating: v }),

  // ── Map State ──────────────────────────────────────────────────────────────
  mapRef: null,
  mapCenter: { lat: 10.9355, lng: 76.7432 },
  mapZoom: 16,
  is3DMode: false,
  showSatellite: false,
  showCrowdHeatmap: false,
  setMapRef: (ref) => set({ mapRef: ref }),
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  toggle3DMode: () => set((s) => ({ is3DMode: !s.is3DMode })),
  toggleSatellite: () => set((s) => ({ showSatellite: !s.showSatellite })),
  toggleCrowdHeatmap: () => set((s) => ({ showCrowdHeatmap: !s.showCrowdHeatmap })),

  // ── Buildings & POI Data ───────────────────────────────────────────────────
  buildings: [],
  categories: [],
  selectedBuilding: null,
  hoveredBuilding: null,
  setBuildings: (buildings) => set({ buildings }),
  setCategories: (categories) => set({ categories }),
  setSelectedBuilding: (building) => set({ selectedBuilding: building }),
  setHoveredBuilding: (building) => set({ hoveredBuilding: building }),
  clearSelectedBuilding: () => set({ selectedBuilding: null }),

  // ── Search ─────────────────────────────────────────────────────────────────
  searchQuery: '',
  searchResults: [],
  searchHistory: JSON.parse(localStorage.getItem('kmap-search-history') || '[]'),
  isSearchOpen: false,
  activeCategory: 'all',
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsSearchOpen: (v) => set({ isSearchOpen: v }),
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  addToSearchHistory: (building) => {
    const history = get().searchHistory;
    const updated = [building, ...history.filter(h => h.id !== building.id)].slice(0, 8);
    localStorage.setItem('kmap-search-history', JSON.stringify(updated));
    set({ searchHistory: updated });
  },
  clearSearchHistory: () => {
    localStorage.removeItem('kmap-search-history');
    set({ searchHistory: [] });
  },

  // ── Navigation State Machine ───────────────────────────────────────────────
  // States: 'idle' | 'route_preview' | 'navigating' | 'arrived' | 'emergency'
  navState: 'idle',
  currentRoute: null,
  currentStepIndex: 0,
  navigationMode: 'walking', // walking | wheelchair | bicycle | running
  distanceToNext: null,
  isOffRoute: false,
  arrivalThresholdMeters: 25,
  setNavState: (state) => set({ navState: state }),
  setCurrentRoute: (route) => set({ currentRoute: route, currentStepIndex: 0 }),
  setCurrentStepIndex: (i) => set({ currentStepIndex: i }),
  setNavigationMode: (mode) => set({ navigationMode: mode }),
  setDistanceToNext: (d) => set({ distanceToNext: d }),
  setIsOffRoute: (v) => set({ isOffRoute: v }),
  clearNavigation: () => set({ navState: 'idle', currentRoute: null, currentStepIndex: 0, isOffRoute: false, distanceToNext: null }),

  // ── Bottom Sheet ───────────────────────────────────────────────────────────
  sheetSnap: 'closed', // 'closed' | 'peek' | 'half' | 'full'
  setSheetSnap: (snap) => set({ sheetSnap: snap }),

  // ── AI Assistant ───────────────────────────────────────────────────────────
  isAIOpen: false,
  aiMessages: [],
  aiTyping: false,
  setIsAIOpen: (v) => set({ isAIOpen: v }),
  addAIMessage: (msg) => set((s) => ({ aiMessages: [...s.aiMessages, { ...msg, id: Date.now() }] })),
  setAITyping: (v) => set({ aiTyping: v }),
  clearAIMessages: () => set({ aiMessages: [] }),

  // ── Voice Navigation ───────────────────────────────────────────────────────
  isVoiceNavEnabled: false,
  isMicListening: false,
  toggleVoiceNav: () => set((s) => ({ isVoiceNavEnabled: !s.isVoiceNavEnabled })),
  setMicListening: (v) => set({ isMicListening: v }),

  // ── Accessibility ──────────────────────────────────────────────────────────
  accessibilityMode: false,
  highContrastMode: false,
  largeFontMode: false,
  toggleAccessibilityMode: () => set((s) => {
    const next = !s.accessibilityMode;
    if (next) set({ navigationMode: 'wheelchair' });
    return { accessibilityMode: next };
  }),
  toggleHighContrast: () => set((s) => ({ highContrastMode: !s.highContrastMode })),
  toggleLargeFont: () => set((s) => ({ largeFontMode: !s.largeFontMode })),

  // ── Emergency ─────────────────────────────────────────────────────────────
  isEmergencyPanelOpen: false,
  setIsEmergencyPanelOpen: (v) => set({ isEmergencyPanelOpen: v }),

  // ── Campus GeoJSON (OSM) ───────────────────────────────────────────────────
  campusGeoJson: { type: 'FeatureCollection', features: [] },
  setCampusGeoJson: (data) => set({ campusGeoJson: data }),

  // ── Recenter ───────────────────────────────────────────────────────────────
  recenterMap: () => {
    const { userLocation, mapRef } = get();
    if (mapRef && userLocation) {
      mapRef.panTo(userLocation);
      mapRef.setZoom(18);
    }
  },
}));

export default useAppStore;

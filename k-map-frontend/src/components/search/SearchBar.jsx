import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, MapPin, ChevronRight } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import { campusApi } from '../../services/apiService';
import { routeService } from '../../services/routeService';
import CategoryFilter from './CategoryFilter';

const POPULAR_SEARCHES = [
  { label: 'Central Library', icon: '📚' },
  { label: 'Main Canteen', icon: '🍽️' },
  { label: 'Emmanuel Auditorium', icon: '🎭' },
  { label: 'Medical Centre', icon: '🏥' },
  { label: 'CSE Department', icon: '💻' },
];

const SearchBar = () => {
  const {
    searchQuery, setSearchQuery, searchResults, setSearchResults,
    isSearchOpen, setIsSearchOpen, searchHistory, addToSearchHistory,
    clearSearchHistory, setSelectedBuilding, setSheetSnap,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const handleSearch = useCallback(async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setIsLoading(true);
    try {
      const res = await campusApi.search(q);
      setSearchResults(res.data.results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [setSearchResults]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, handleSearch]);

  const handleSelectBuilding = (building) => {
    addToSearchHistory(building);
    setSelectedBuilding(building);
    setSheetSnap('half');
    setIsSearchOpen(false);
    setSearchQuery('');
    routeService.calculateRoute(building);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    inputRef.current?.focus();
  };

  const hasResults  = searchQuery && searchResults.length > 0;
  const showHistory = !searchQuery && searchHistory.length > 0;
  const showPopular = !searchQuery;

  return (
    <div style={{
      position: 'absolute',
      top: 14,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'min(500px, calc(100vw - 136px))',
      zIndex: 40,
    }}>
      {/* ── Search pill ─────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        borderRadius: isSearchOpen ? '20px 20px 0 0' : '999px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.22)',
        border: '1px solid rgba(0,0,0,0.1)',
        overflow: 'hidden',
        transition: 'border-radius 0.2s ease',
      }}>
        {/* Input row */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', gap: 10 }}>
          {/* K-MAP badge */}
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #1a73e8, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17,
          }}>🗺️</div>

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search campus buildings, labs, hostels…"
            style={{
              flex: 1, border: 'none', background: 'transparent',
              fontSize: 14, fontWeight: 400, color: '#1f2937',
              outline: 'none', caretColor: '#1a73e8',
              fontFamily: 'Inter, sans-serif',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isLoading && (
              <div style={{
                width: 18, height: 18, border: '2.5px solid #1a73e8',
                borderTopColor: 'transparent', borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }} />
            )}
            {searchQuery && (
              <button onClick={handleClear} style={{
                background: '#e5e7eb', border: 'none', borderRadius: '50%',
                width: 26, height: 26, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#6b7280', flexShrink: 0,
              }}>
                <X size={13} strokeWidth={2.5} />
              </button>
            )}
            <button
              onClick={() => { setIsSearchOpen(!isSearchOpen); if (!isSearchOpen) inputRef.current?.focus(); }}
              style={{
                background: '#1a73e8', border: 'none', borderRadius: '50%',
                width: 36, height: 36, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', flexShrink: 0,
                boxShadow: '0 2px 8px rgba(26,115,232,0.4)',
              }}>
              <Search size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Category chips */}
        {isSearchOpen && (
          <div style={{ borderTop: '1px solid #f3f4f6', padding: '6px 0 4px' }}>
            <CategoryFilter />
          </div>
        )}
      </div>

      {/* ── Dropdown ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            style={{
              background: '#ffffff',
              borderTop: '1px solid #f3f4f6',
              border: '1px solid rgba(0,0,0,0.1)',
              borderTop: 'none',
              borderRadius: '0 0 20px 20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
              maxHeight: '55vh',
              overflowY: 'auto',
              paddingBottom: 8,
            }}
          >
            {/* Search results */}
            {hasResults && (
              <>
                <SectionHeader label={`Results (${searchResults.length})`} />
                {searchResults.map((b) => (
                  <SuggestionRow
                    key={b.id}
                    icon={<MapPin size={14} color="#1a73e8" />}
                    label={b.name}
                    sub={`${b.category} · ${b.hours?.open || ''}–${b.hours?.close || ''}`}
                    onClick={() => handleSelectBuilding(b)}
                    right={<ChevronRight size={14} color="#9ca3af" />}
                  />
                ))}
              </>
            )}

            {/* No results */}
            {searchQuery && !isLoading && searchResults.length === 0 && (
              <div style={{ padding: '28px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>🔍</div>
                No results for <strong style={{ color: '#374151' }}>"{searchQuery}"</strong>
              </div>
            )}

            {/* Recent history */}
            {showHistory && searchHistory.length > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px 2px' }}>
                  <SectionHeader label="Recent" inline />
                  <button onClick={clearSearchHistory} style={{
                    background: 'none', border: 'none', color: '#1a73e8',
                    fontSize: 12, cursor: 'pointer', fontWeight: 600,
                  }}>Clear</button>
                </div>
                {searchHistory.slice(0, 5).map((b) => (
                  <SuggestionRow
                    key={b.id}
                    icon={<Clock size={13} color="#9ca3af" />}
                    label={b.name} sub={b.category}
                    onClick={() => handleSelectBuilding(b)}
                  />
                ))}
              </>
            )}

            {/* Popular */}
            {showPopular && (
              <>
                <SectionHeader label="Popular on Campus" />
                {POPULAR_SEARCHES.map((p) => (
                  <SuggestionRow
                    key={p.label}
                    icon={<span style={{ fontSize: 16 }}>{p.icon}</span>}
                    label={p.label}
                    onClick={() => setSearchQuery(p.label)}
                  />
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SectionHeader = ({ label, inline = false }) => (
  <div style={{
    padding: inline ? '0' : '10px 16px 2px',
    fontSize: 10, fontWeight: 800, color: '#9ca3af',
    letterSpacing: '0.08em', textTransform: 'uppercase',
  }}>
    {label}
  </div>
);

const SuggestionRow = ({ icon, label, sub, onClick, right }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 16px', width: '100%',
      background: 'none', border: 'none', cursor: 'pointer',
      textAlign: 'left', color: '#1f2937',
      transition: 'background 0.12s',
    }}
    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
    onMouseLeave={e => e.currentTarget.style.background = 'none'}
  >
    <div style={{ flexShrink: 0, width: 20, display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{sub}</div>}
    </div>
    {right && <div style={{ flexShrink: 0 }}>{right}</div>}
  </button>
);

export default SearchBar;

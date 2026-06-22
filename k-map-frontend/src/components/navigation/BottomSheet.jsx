import React, { useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, X, Users, MapPin } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import { routeService } from '../../services/routeService';

const SNAP_HEIGHTS = { closed: 0, peek: 110, half: '52vh', full: '88vh' };

const getIcon = (category) => {
  const map = {
    academic: '🏫', hostel: '🏠', food: '🍽️', library: '📚',
    auditorium: '🎭', sports: '⚽', parking: '🅿️', medical: '🏥',
    laboratory: '🔬', administration: '🏛️', outdoor: '🌸',
    gate: '🚪', security: '🛡️', media: '📷',
  };
  return map[category] || '📍';
};

const BottomSheet = () => {
  const {
    sheetSnap, setSheetSnap, selectedBuilding, clearSelectedBuilding,
    currentRoute, navState,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('info');
  const startYRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback((e) => {
    startYRef.current = e.touches?.[0]?.clientY ?? e.clientY;
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback((e) => {
    setIsDragging(false);
    if (startYRef.current === null) return;
    const endY = e.changedTouches?.[0]?.clientY ?? e.clientY;
    const delta = endY - startYRef.current;
    const SNAPS = ['full', 'half', 'peek', 'closed'];
    const SNAP_UP = ['closed', 'peek', 'half', 'full'];
    if (delta > 70) {
      const i = SNAPS.indexOf(sheetSnap);
      setSheetSnap(SNAPS[Math.min(i + 1, SNAPS.length - 1)]);
    } else if (delta < -70) {
      const i = SNAP_UP.indexOf(sheetSnap);
      setSheetSnap(SNAP_UP[Math.min(i + 1, SNAP_UP.length - 1)]);
    }
    startYRef.current = null;
  }, [sheetSnap, setSheetSnap]);

  const handleClose = () => {
    // Always stop navigation — this clears the blue route line
    // regardless of whether we're in preview, navigating, or idle state
    routeService.stopNavigation();
  };

  const handleStartNav = () => routeService.startNavigation();

  const isVisible = sheetSnap !== 'closed' && (selectedBuilding || currentRoute);
  if (!isVisible) return null;

  const building = selectedBuilding;
  const route    = currentRoute;

  // Open/Closed status
  const isOpen = (() => {
    if (!building?.hours) return null;
    const h = new Date().getHours();
    const m = new Date().getMinutes();
    const [oh, om] = (building.hours.open || '00:00').split(':').map(Number);
    const [ch, cm] = (building.hours.close || '23:59').split(':').map(Number);
    const now = h * 60 + m;
    return now >= oh * 60 + om && now <= ch * 60 + cm;
  })();

  const sheetHeight = SNAP_HEIGHTS[sheetSnap];

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: sheetHeight,
        maxHeight: '88vh',
        // Solid opaque background — no transparency issues
        background: '#ffffff',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.18)',
        border: '1px solid rgba(0,0,0,0.08)',
        borderBottom: 'none',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'height 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* ── Drag handle ────────────────────────────────────────── */}
      <div
        onMouseDown={handleDragStart} onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart} onTouchEnd={handleDragEnd}
        style={{ padding: '10px 0 2px', cursor: 'grab', flexShrink: 0, userSelect: 'none' }}
      >
        <div style={{ width: 40, height: 4, background: '#d1d5db', borderRadius: 2, margin: '0 auto' }} />
      </div>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        padding: '8px 16px 12px', gap: 12, flexShrink: 0,
        borderBottom: '1px solid #f3f4f6',
      }}>
        {/* Category icon badge */}
        {building && (
          <div style={{
            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
            background: `${building.color || '#6366f1'}18`,
            border: `2px solid ${building.color || '#6366f1'}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
          }}>
            {getIcon(building.category)}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{
            fontSize: 16, fontWeight: 700, color: '#111827',
            margin: 0, lineHeight: 1.35,
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {building?.name || route?.destinationBuilding?.name || 'Route Preview'}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
            {building?.hours && isOpen !== null && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px',
                borderRadius: 999,
                background: isOpen ? '#dcfce7' : '#fee2e2',
                color: isOpen ? '#15803d' : '#dc2626',
              }}>
                {isOpen ? '● Open' : '● Closed'}
              </span>
            )}
            {building?.crowdLevel && (
              <span style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Users size={10} /> {building.crowdLevel} crowd
              </span>
            )}
            {route?.distance && (
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1a73e8' }}>
                {route.distance.text} away
              </span>
            )}
          </div>
        </div>

        <button onClick={handleClose} style={{
          background: '#f3f4f6', border: 'none', borderRadius: '50%',
          width: 32, height: 32, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, color: '#6b7280',
        }}>
          <X size={16} />
        </button>
      </div>

      {/* ── Route summary strip ─────────────────────────────────── */}
      {route && navState === 'route_preview' && (
        <div style={{
          margin: '10px 14px',
          background: '#eff6ff',
          borderRadius: 14,
          padding: '12px 14px',
          border: '1px solid #bfdbfe',
          display: 'flex', alignItems: 'center', gap: 12,
          flexShrink: 0,
        }}>
          <div style={{ textAlign: 'center', minWidth: 56 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1a73e8', lineHeight: 1.1 }}>
              {route.duration?.text}
            </div>
            <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, marginTop: 2 }}>ETA</div>
          </div>
          <div style={{ width: 1, height: 36, background: '#bfdbfe' }} />
          <div style={{ textAlign: 'center', minWidth: 56 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{route.distance?.text}</div>
            <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, marginTop: 2 }}>Distance</div>
          </div>
          <div style={{ width: 1, height: 36, background: '#bfdbfe' }} />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
              {route.eta ? new Date(route.eta).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </div>
            <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, marginTop: 2 }}>Arrives at</div>
          </div>
          <button
            onClick={handleStartNav}
            style={{
              background: '#1a73e8', color: '#fff', border: 'none',
              borderRadius: 999, padding: '10px 18px',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 2px 10px rgba(26,115,232,0.4)',
              flexShrink: 0,
            }}>
            <Navigation size={14} /> Start
          </button>
        </div>
      )}

      {/* ── Tab bar (full snap only) ──────────────────────────── */}
      {building && sheetSnap === 'full' && (
        <div style={{
          display: 'flex', borderBottom: '2px solid #f3f4f6',
          margin: '0 14px', flexShrink: 0,
        }}>
          {['info', 'floors', 'nearby'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '9px 0', background: 'none', border: 'none',
              fontSize: 12, fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? '#1a73e8' : '#9ca3af',
              cursor: 'pointer', textTransform: 'capitalize',
              borderBottom: activeTab === tab ? '2px solid #1a73e8' : '2px solid transparent',
              marginBottom: -2, transition: 'all 0.15s',
            }}>
              {tab === 'info' ? '📋 Info' : tab === 'floors' ? '🏢 Floors' : '📍 Nearby'}
            </button>
          ))}
        </div>
      )}

      {/* ── Scrollable content ─────────────────────────────────── */}
      {sheetSnap !== 'peek' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 28px' }}>
          {building && (activeTab === 'info' || sheetSnap === 'half') && <InfoTab building={building} />}
          {building && activeTab === 'floors' && sheetSnap === 'full' && <FloorsTab building={building} />}
          {building && activeTab === 'nearby' && sheetSnap === 'full' && <NearbyTab building={building} />}
        </div>
      )}
    </motion.div>
  );
};

/* ── Tab Content ──────────────────────────────────────────────── */
const InfoTab = ({ building }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>
      {building.description}
    </p>

    {building.departments?.length > 0 && (
      <Section title="Departments">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {building.departments.map(d => (
            <span key={d} style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 999,
              background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb',
              fontWeight: 500,
            }}>{d}</span>
          ))}
        </div>
      </Section>
    )}

    {building.hours && (
      <Section title="Hours">
        <div style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>
          {building.hours.open} – {building.hours.close}
          <span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: 8 }}>({building.hours.days})</span>
        </div>
      </Section>
    )}

    <Section title="Accessibility">
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[
          { key: 'wheelchair', label: '♿ Wheelchair' },
          { key: 'elevator',   label: '🛗 Elevator'   },
          { key: 'ramps',      label: '📐 Ramps'       },
        ].map(({ key, label }) => (
          <span key={key} style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 999, fontWeight: 600,
            background: building.accessibility?.[key] ? '#dcfce7' : '#fef2f2',
            color:      building.accessibility?.[key] ? '#15803d' : '#dc2626',
            border: `1px solid ${building.accessibility?.[key] ? '#bbf7d0' : '#fecaca'}`,
          }}>
            {label} {building.accessibility?.[key] ? '✓' : '✗'}
          </span>
        ))}
      </div>
    </Section>
  </div>
);

const FloorsTab = ({ building }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    {building.indoor?.floors?.length > 0 ? building.indoor.floors.map(floor => (
      <div key={floor.level} style={{
        background: '#f9fafb', borderRadius: 12, padding: '10px 14px',
        border: '1px solid #e5e7eb',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#1a73e8', marginBottom: 6 }}>
          {floor.level === 0 ? 'Ground Floor' : `Floor ${floor.level}`}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {floor.rooms.map(r => (
            <span key={r} style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 4,
              background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb',
            }}>{r}</span>
          ))}
        </div>
      </div>
    )) : (
      <p style={{ color: '#9ca3af', fontSize: 13 }}>No floor plan available.</p>
    )}
  </div>
);

const NearbyTab = ({ building }) => (
  <div>
    {building.nearbyFacilities?.length > 0 ? building.nearbyFacilities.map(name => (
      <div key={name} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 0', borderBottom: '1px solid #f3f4f6',
      }}>
        <MapPin size={14} color="#1a73e8" />
        <span style={{ fontSize: 13, color: '#374151' }}>{name}</span>
      </div>
    )) : (
      <p style={{ color: '#9ca3af', fontSize: 13 }}>No nearby facilities listed.</p>
    )}
  </div>
);

const Section = ({ title, children }) => (
  <div>
    <div style={{
      fontSize: 10, fontWeight: 800, color: '#9ca3af',
      letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8,
    }}>{title}</div>
    {children}
  </div>
);

export default BottomSheet;

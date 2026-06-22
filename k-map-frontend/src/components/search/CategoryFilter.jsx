import React from 'react';
import useAppStore from '../../stores/appStore';

const CATEGORIES = [
  { id: 'all',           label: 'All',      icon: '🗺️' },
  { id: 'academic',      label: 'Depts',    icon: '🏫' },
  { id: 'hostel',        label: 'Hostels',  icon: '🏠' },
  { id: 'food',          label: 'Food',     icon: '🍽️' },
  { id: 'library',       label: 'Library',  icon: '📚' },
  { id: 'auditorium',    label: 'Audis',    icon: '🎭' },
  { id: 'sports',        label: 'Sports',   icon: '⚽' },
  { id: 'parking',       label: 'Parking',  icon: '🅿️' },
  { id: 'medical',       label: 'Medical',  icon: '🏥' },
  { id: 'laboratory',    label: 'Labs',     icon: '🔬' },
];

const CategoryFilter = () => {
  const { activeCategory, setActiveCategory, setSearchQuery } = useAppStore();

  return (
    <div style={{
      display: 'flex', gap: 6, overflowX: 'auto',
      padding: '0 12px 4px',
      scrollbarWidth: 'none', msOverflowStyle: 'none',
    }}>
      {CATEGORIES.map((cat) => {
        const active = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              setSearchQuery(cat.id === 'all' ? '' : cat.label);
            }}
            style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 12px',
              borderRadius: 999,
              border: active ? '1.5px solid #1a73e8' : '1.5px solid #e5e7eb',
              background: active ? '#eff6ff' : '#f9fafb',
              color: active ? '#1a73e8' : '#6b7280',
              fontSize: 12, fontWeight: active ? 700 : 500,
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <span style={{ fontSize: 13 }}>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;

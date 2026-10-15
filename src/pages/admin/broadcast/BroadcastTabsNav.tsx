import React from 'react';
import { Radio, Layers } from 'lucide-react';

interface BroadcastTabsNavProps {
  studioTab: 'composer' | 'manage';
  onTabChange: (tab: 'composer' | 'manage') => void;
  announcementsCount: number;
}

export const BroadcastTabsNav: React.FC<BroadcastTabsNavProps> = ({
  studioTab,
  onTabChange,
  announcementsCount,
}) => {
  return (
    <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
      <button
        onClick={() => onTabChange('composer')}
        style={{
          padding: '8px 18px',
          fontSize: '0.85rem',
          fontWeight: 700,
          borderRadius: 'var(--radius-md)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: studioTab === 'composer' ? '#7C3AED' : 'transparent',
          color: studioTab === 'composer' ? '#FFFFFF' : 'var(--text-secondary)',
          boxShadow: studioTab === 'composer' ? '0 2px 6px rgba(124, 58, 237, 0.25)' : 'none',
        }}
      >
        <Radio size={15} />
        <span>Broadcast Composer & Live Preview</span>
      </button>

      <button
        onClick={() => onTabChange('manage')}
        style={{
          padding: '8px 18px',
          fontSize: '0.85rem',
          fontWeight: 700,
          borderRadius: 'var(--radius-md)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: studioTab === 'manage' ? 'var(--primary)' : 'transparent',
          color: studioTab === 'manage' ? '#FFFFFF' : 'var(--text-secondary)',
        }}
      >
        <Layers size={15} />
        <span>Active Bulletins Feed & Archive ({announcementsCount})</span>
      </button>
    </div>
  );
};

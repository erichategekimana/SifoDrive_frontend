import React from 'react';
import { Radio } from 'lucide-react';

interface TicketsTabsNavProps {
  activeTab: 'tickets' | 'bulletins';
  onTabChange: (tab: 'tickets' | 'bulletins') => void;
  ticketsCount: number;
  announcementsCount: number;
}

export const TicketsTabsNav: React.FC<TicketsTabsNavProps> = ({
  activeTab,
  onTabChange,
  ticketsCount,
  announcementsCount,
}) => {
  return (
    <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
      <button
        onClick={() => onTabChange('tickets')}
        style={{
          padding: '6px 14px',
          fontSize: '0.82rem',
          fontWeight: 700,
          borderRadius: 'var(--radius-md)',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: activeTab === 'tickets' ? 'var(--primary)' : 'transparent',
          color: activeTab === 'tickets' ? '#FFFFFF' : 'var(--text-secondary)',
        }}
      >
        All User Tickets & Inquiries ({ticketsCount})
      </button>
      <button
        onClick={() => onTabChange('bulletins')}
        style={{
          padding: '6px 14px',
          fontSize: '0.82rem',
          fontWeight: 700,
          borderRadius: 'var(--radius-md)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: activeTab === 'bulletins' ? '#7C3AED' : 'transparent',
          color: activeTab === 'bulletins' ? '#FFFFFF' : 'var(--text-secondary)',
        }}
      >
        <Radio size={14} />
        <span>Support Bulletins & Platform Updates ({announcementsCount})</span>
      </button>
    </div>
  );
};

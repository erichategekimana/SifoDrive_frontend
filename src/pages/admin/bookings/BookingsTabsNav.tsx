import React from 'react';

interface BookingsTabsNavProps {
  activeTab: 'ORDERS' | 'PRICING';
  onTabChange: (tab: 'ORDERS' | 'PRICING') => void;
  ordersCount: number;
}

export const BookingsTabsNav: React.FC<BookingsTabsNavProps> = ({
  activeTab,
  onTabChange,
  ordersCount,
}) => {
  return (
    <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
      <button
        onClick={() => onTabChange('ORDERS')}
        style={{
          padding: '10px 18px',
          background: 'transparent',
          border: 'none',
          borderBottom: activeTab === 'ORDERS' ? '2px solid var(--primary)' : '2px solid transparent',
          color: activeTab === 'ORDERS' ? 'var(--primary-light)' : 'var(--text-secondary)',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
        }}
      >
        Active Applications ({ordersCount})
      </button>
      <button
        onClick={() => onTabChange('PRICING')}
        style={{
          padding: '10px 18px',
          background: 'transparent',
          border: 'none',
          borderBottom: activeTab === 'PRICING' ? '2px solid var(--primary)' : '2px solid transparent',
          color: activeTab === 'PRICING' ? 'var(--primary-light)' : 'var(--text-secondary)',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
        }}
      >
        Category Pricing Setup
      </button>
    </div>
  );
};

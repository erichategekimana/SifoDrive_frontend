import React from 'react';

interface NotificationsTabsNavProps {
  activeTab: 'LOGS' | 'SINGLE_SMS' | 'TEMPLATES' | 'GATEWAY';
  onTabChange: (tab: 'LOGS' | 'SINGLE_SMS' | 'TEMPLATES' | 'GATEWAY') => void;
  logsCount: number;
}

export const NotificationsTabsNav: React.FC<NotificationsTabsNavProps> = ({
  activeTab,
  onTabChange,
  logsCount,
}) => {
  return (
    <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
      <button
        onClick={() => onTabChange('LOGS')}
        style={{
          padding: '10px 18px',
          background: 'transparent',
          border: 'none',
          borderBottom: activeTab === 'LOGS' ? '2px solid var(--primary)' : '2px solid transparent',
          color: activeTab === 'LOGS' ? 'var(--primary-light)' : 'var(--text-secondary)',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
        }}
      >
        Delivery Audit Logs ({logsCount})
      </button>
      <button
        onClick={() => onTabChange('SINGLE_SMS')}
        style={{
          padding: '10px 18px',
          background: 'transparent',
          border: 'none',
          borderBottom: activeTab === 'SINGLE_SMS' ? '2px solid var(--primary)' : '2px solid transparent',
          color: activeTab === 'SINGLE_SMS' ? 'var(--primary-light)' : 'var(--text-secondary)',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
        }}
      >
        Send Single SMS
      </button>
      <button
        onClick={() => onTabChange('TEMPLATES')}
        style={{
          padding: '10px 18px',
          background: 'transparent',
          border: 'none',
          borderBottom: activeTab === 'TEMPLATES' ? '2px solid var(--primary)' : '2px solid transparent',
          color: activeTab === 'TEMPLATES' ? 'var(--primary-light)' : 'var(--text-secondary)',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
        }}
      >
        SMS Templates
      </button>
      <button
        onClick={() => onTabChange('GATEWAY')}
        style={{
          padding: '10px 18px',
          background: 'transparent',
          border: 'none',
          borderBottom: activeTab === 'GATEWAY' ? '2px solid var(--primary)' : '2px solid transparent',
          color: activeTab === 'GATEWAY' ? 'var(--primary-light)' : 'var(--text-secondary)',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
        }}
      >
        Gateway Diagnostics
      </button>
    </div>
  );
};

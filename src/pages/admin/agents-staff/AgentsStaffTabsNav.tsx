import React from 'react';

interface AgentsStaffTabsNavProps {
  activeTab: 'staffs' | 'agents' | 'rates';
  onTabChange: (tab: 'staffs' | 'agents' | 'rates') => void;
  totalStaffCount: number;
  totalAgentCount: number;
  ratesCount: number;
}

export const AgentsStaffTabsNav: React.FC<AgentsStaffTabsNavProps> = ({
  activeTab,
  onTabChange,
  totalStaffCount,
  totalAgentCount,
  ratesCount,
}) => {
  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
      <button
        onClick={() => onTabChange('staffs')}
        className={`btn btn-sm ${activeTab === 'staffs' ? 'btn-primary' : 'btn-secondary'}`}
        style={{ fontSize: '0.82rem', padding: '6px 16px' }}
      >
        Staffs ({totalStaffCount})
      </button>

      <button
        onClick={() => onTabChange('agents')}
        className={`btn btn-sm ${activeTab === 'agents' ? 'btn-primary' : 'btn-secondary'}`}
        style={{ fontSize: '0.82rem', padding: '6px 16px' }}
      >
        Agents ({totalAgentCount})
      </button>

      <button
        onClick={() => onTabChange('rates')}
        className={`btn btn-sm ${activeTab === 'rates' ? 'btn-primary' : 'btn-secondary'}`}
        style={{ fontSize: '0.82rem', padding: '6px 16px' }}
      >
        Rates ({ratesCount})
      </button>
    </div>
  );
};

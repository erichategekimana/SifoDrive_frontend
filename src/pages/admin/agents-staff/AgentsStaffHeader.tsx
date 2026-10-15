import React from 'react';
import { Plus } from 'lucide-react';

interface AgentsStaffHeaderProps {
  activeTab: 'staffs' | 'agents' | 'rates';
  onAddStaff: () => void;
  onAddAgent: () => void;
}

export const AgentsStaffHeader: React.FC<AgentsStaffHeaderProps> = ({
  activeTab,
  onAddStaff,
  onAddAgent,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
          Agents & Staff
        </h1>
        <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
          Manage platform staff, field agents, service commissions, and monthly payouts.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {activeTab === 'staffs' && (
          <button
            onClick={onAddStaff}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
          >
            <Plus size={15} />
            <span>Add Staff</span>
          </button>
        )}

        {activeTab === 'agents' && (
          <button
            onClick={onAddAgent}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
          >
            <Plus size={15} />
            <span>Add Agent</span>
          </button>
        )}
      </div>
    </div>
  );
};

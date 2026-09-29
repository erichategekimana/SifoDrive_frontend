import React from 'react';
import { Search, Power, PowerOff } from 'lucide-react';
import { Badge } from '../../../../components/common/Badge';
import { Spinner } from '../../../../components/common/Spinner';
import { CommissionLedgerSection } from '../commissions/CommissionLedgerSection';
import type { StaffUserItem, AgentCommissionItem } from '../../types';

interface AgentDirectorySectionProps {
  agentSubTab: 'directory' | 'ledger';
  setAgentSubTab: (tab: 'directory' | 'ledger') => void;
  filteredAgentList: StaffUserItem[];
  commissionsLedger: AgentCommissionItem[];
  filteredLedger: AgentCommissionItem[];
  selectedAgentFilter: StaffUserItem | null;
  setSelectedAgentFilter: (agent: StaffUserItem | null) => void;
  staffList: StaffUserItem[];
  totalAgentCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  onViewAgentLedger: (agent: StaffUserItem) => void;
  onOpenPayout: (agent: StaffUserItem) => void;
  onOpenEdit: (agent: StaffUserItem) => void;
  onToggleStaffActive: (agent: StaffUserItem) => void;
}

export const AgentDirectorySection: React.FC<AgentDirectorySectionProps> = ({
  agentSubTab,
  setAgentSubTab,
  filteredAgentList,
  commissionsLedger,
  filteredLedger,
  selectedAgentFilter,
  setSelectedAgentFilter,
  staffList,
  totalAgentCount,
  searchQuery,
  setSearchQuery,
  isLoading,
  onViewAgentLedger,
  onOpenPayout,
  onOpenEdit,
  onToggleStaffActive,
}) => {
  return (
    <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
      {/* Sub-Header Toolbar: Sub-tabs & Search */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {/* Sub Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => setAgentSubTab('directory')}
            className={`btn btn-sm ${agentSubTab === 'directory' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.76rem', padding: '4px 12px' }}
          >
            Directory ({filteredAgentList.length})
          </button>

          <button
            onClick={() => setAgentSubTab('ledger')}
            className={`btn btn-sm ${agentSubTab === 'ledger' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.76rem', padding: '4px 12px' }}
          >
            Ledger ({selectedAgentFilter ? `${selectedAgentFilter.agent_code || selectedAgentFilter.full_name}: ${filteredLedger.length}` : commissionsLedger.length})
          </button>
        </div>

        {/* Filter by Agent (when on Ledger) & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {agentSubTab === 'ledger' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Agent:</label>
              <select
                value={selectedAgentFilter?.id || 'ALL'}
                onChange={(e) => {
                  if (e.target.value === 'ALL') {
                    setSelectedAgentFilter(null);
                  } else {
                    const found = staffList.find((s) => s.id === e.target.value);
                    setSelectedAgentFilter(found || null);
                  }
                }}
                style={{
                  padding: '5px 8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  maxWidth: '220px',
                }}
              >
                <option value="ALL">All Agents ({totalAgentCount})</option>
                {staffList
                  .filter((s) => s.role === 'AGENT')
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.full_name} ({a.agent_code || a.phone_number})
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={agentSubTab === 'directory' ? 'Search agents...' : 'Search ledger...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.8rem',
              }}
            />
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: AGENTS DIRECTORY */}
      {agentSubTab === 'directory' && (
        <div>
          {isLoading ? (
            <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
              <Spinner message="Loading agent directory..." />
            </div>
          ) : filteredAgentList.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              No agents registered yet. Use "Add Agent" to register field agents.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Agent</th>
                    <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Station / Location</th>
                    <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Accrued</th>
                    <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Paid Out</th>
                    <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Unpaid Balance</th>
                    <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Last Payout</th>
                    <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgentList.map((u) => {
                    const pendingBal = u.pending_balance_rwf || 0;

                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div
                            onClick={() => onViewAgentLedger(u)}
                            style={{ fontWeight: 600, color: '#ffffff', cursor: 'pointer', display: 'inline-block' }}
                            title="Click to view agent ledger"
                          >
                            {u.full_name || 'Agent User'}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '1px' }}>
                            {u.phone_number}
                          </div>
                          {u.agent_code && (
                            <div
                              onClick={() => onViewAgentLedger(u)}
                              style={{ fontSize: '0.72rem', color: '#93c5fd', fontFamily: 'monospace', fontWeight: 600, marginTop: '2px', cursor: 'pointer', display: 'inline-block' }}
                              title="Click to view agent ledger"
                            >
                              {u.agent_code}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                          <div>{u.business_name || 'Kiosk'}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {[u.district, u.sector].filter(Boolean).join(', ') || 'Rwanda'}
                          </div>
                        </td>

                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ffffff' }}>
                          {(u.total_accrued_rwf || 0).toLocaleString()} RWF
                        </td>

                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                          {(u.total_paid_out_rwf || 0).toLocaleString()} RWF
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontWeight: 700, color: pendingBal > 0 ? '#f59e0b' : '#10b981' }}>
                            {pendingBal.toLocaleString()} RWF
                          </span>
                        </td>

                        <td style={{ padding: '12px 16px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          {u.last_payout_date || 'First Cycle'}
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          {u.is_active ? (
                            <Badge variant="success">ACTIVE</Badge>
                          ) : (
                            <Badge variant="neutral">DEACTIVATED</Badge>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => onViewAgentLedger(u)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                              title="Review this agent's ledger"
                            >
                              Ledger
                            </button>

                            {pendingBal > 0 && (
                              <button
                                onClick={() => onOpenPayout(u)}
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                                title="Settle 30-day payout"
                              >
                                Settle
                              </button>
                            )}

                            <button
                              onClick={() => onOpenEdit(u)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                              title="Edit agent details"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => onToggleStaffActive(u)}
                              className="btn btn-secondary btn-sm"
                              style={{
                                fontSize: '0.72rem',
                                padding: '3px 8px',
                                color: u.is_active ? 'var(--danger)' : '#4ade80',
                                borderColor: u.is_active ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)',
                              }}
                              title={u.is_active ? 'Deactivate agent account' : 'Activate agent account'}
                            >
                              {u.is_active ? <PowerOff size={11} /> : <Power size={11} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: COMMISSIONS LEDGER */}
      {agentSubTab === 'ledger' && (
        <CommissionLedgerSection
          filteredLedger={filteredLedger}
          selectedAgentFilter={selectedAgentFilter}
          onOpenPayout={onOpenPayout}
          onClearAgentFilter={() => setSelectedAgentFilter(null)}
        />
      )}
    </div>
  );
};

import React from 'react';
import { Badge } from '../../../../components/common/Badge';
import type { AgentCommissionItem, StaffUserItem } from '../../types';

interface CommissionLedgerSectionProps {
  filteredLedger: AgentCommissionItem[];
  selectedAgentFilter: StaffUserItem | null;
  onOpenPayout: (agent: StaffUserItem) => void;
  onClearAgentFilter: () => void;
}

export const CommissionLedgerSection: React.FC<CommissionLedgerSectionProps> = ({
  filteredLedger,
  selectedAgentFilter,
  onOpenPayout,
  onClearAgentFilter,
}) => {
  return (
    <div>
      {/* Single Agent Review Banner */}
      {selectedAgentFilter && (
        <div
          style={{
            margin: '12px 16px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>
                {selectedAgentFilter.full_name}
              </span>
              {selectedAgentFilter.agent_code && (
                <span style={{ fontSize: '0.74rem', color: '#93c5fd', fontFamily: 'monospace', fontWeight: 600 }}>
                  {selectedAgentFilter.agent_code}
                </span>
              )}
              {selectedAgentFilter.is_active ? (
                <Badge variant="success">ACTIVE</Badge>
              ) : (
                <Badge variant="neutral">DEACTIVATED</Badge>
              )}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Phone: {selectedAgentFilter.phone_number} • Station: {selectedAgentFilter.business_name || 'Kiosk'} ({[selectedAgentFilter.district, selectedAgentFilter.sector].filter(Boolean).join(', ') || 'Rwanda'})
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Accrued: <strong style={{ color: '#ffffff' }}>{(selectedAgentFilter.total_accrued_rwf || 0).toLocaleString()} RWF</strong> • 
              Paid Out: <strong style={{ color: '#ffffff' }}>{(selectedAgentFilter.total_paid_out_rwf || 0).toLocaleString()} RWF</strong> • 
              Unpaid Balance: <strong style={{ color: (selectedAgentFilter.pending_balance_rwf || 0) > 0 ? '#f59e0b' : '#10b981' }}>{(selectedAgentFilter.pending_balance_rwf || 0).toLocaleString()} RWF</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(selectedAgentFilter.pending_balance_rwf || 0) > 0 && (
              <button
                onClick={() => onOpenPayout(selectedAgentFilter)}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.74rem', padding: '4px 10px' }}
              >
                Settle Payout
              </button>
            )}
            <button
              onClick={onClearAgentFilter}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.74rem', padding: '4px 10px' }}
            >
              Show All Agents
            </button>
          </div>
        </div>
      )}

      {filteredLedger.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          {selectedAgentFilter
            ? `No commissions recorded yet for Agent ${selectedAgentFilter.full_name} (${selectedAgentFilter.agent_code || selectedAgentFilter.phone_number}).`
            : 'No commissions recorded yet. Facilitated services appear here.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Date & Ref</th>
                <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Agent</th>
                <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Client</th>
                <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Service</th>
                <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Client Paid</th>
                <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Commission</th>
                <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.8rem' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {c.service_reference || c.id.slice(0, 8)}
                    </div>
                  </td>

                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#ffffff' }}>
                      {c.agent_name || 'Agent'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {c.agent_code || c.agent_phone}
                    </div>
                  </td>

                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ color: '#ffffff' }}>{c.client_name || 'Walk-in Client'}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {c.client_phone || '—'}
                    </div>
                  </td>

                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                    {c.service_type === 'BOOKING' && 'Driving Test Booking'}
                    {c.service_type === 'SUBSCRIPTION' && 'Course Subscription'}
                    {c.service_type === 'EXAM_PURCHASE' && 'Exam Purchase'}
                    {c.service_type === 'LEARNING_FEE' && 'Tuition Fee'}
                    {c.service_type === 'OTHER' && 'Other'}
                  </td>

                  <td style={{ padding: '10px 16px', color: '#ffffff' }}>
                    {c.amount_paid_by_client_rwf.toLocaleString()} RWF
                  </td>

                  <td style={{ padding: '10px 16px', fontWeight: 700, color: '#10b981' }}>
                    +{c.commission_amount_rwf.toLocaleString()} RWF
                  </td>

                  <td style={{ padding: '10px 16px' }}>
                    {c.status === 'ACCRUED' ? (
                      <Badge variant="warning">ACCRUED</Badge>
                    ) : (
                      <Badge variant="success">PAID OUT</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

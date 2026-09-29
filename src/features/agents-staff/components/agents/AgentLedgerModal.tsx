import React from 'react';
import { Search } from 'lucide-react';
import { Badge } from '../../../../components/common/Badge';
import type { StaffUserItem, AgentCommissionItem } from '../../types';

interface AgentLedgerModalProps {
  agentLedgerModal: StaffUserItem | null;
  agentModalLedger: AgentCommissionItem[];
  commissionsLedger: AgentCommissionItem[];
  agentModalSearchQuery: string;
  setAgentModalSearchQuery: (query: string) => void;
  onClose: () => void;
  onOpenPayout: (agent: StaffUserItem) => void;
}

export const AgentLedgerModal: React.FC<AgentLedgerModalProps> = ({
  agentLedgerModal,
  agentModalLedger,
  commissionsLedger,
  agentModalSearchQuery,
  setAgentModalSearchQuery,
  onClose,
  onOpenPayout,
}) => {
  if (!agentLedgerModal) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '1050px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-medium)',
          background: 'var(--bg-surface)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                {agentLedgerModal.full_name}
              </span>
              {agentLedgerModal.agent_code && (
                <span style={{ fontSize: '0.74rem', color: '#93c5fd', fontFamily: 'monospace', fontWeight: 600, background: 'rgba(59, 130, 246, 0.15)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                  {agentLedgerModal.agent_code}
                </span>
              )}
              <Badge variant="info">AGENT</Badge>
              {agentLedgerModal.is_active ? (
                <Badge variant="success">ACTIVE</Badge>
              ) : (
                <Badge variant="neutral">DEACTIVATED</Badge>
              )}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {agentLedgerModal.phone_number} {agentLedgerModal.email ? `• ${agentLedgerModal.email}` : ''}
            </div>
          </div>

          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Station: <strong style={{ color: '#ffffff' }}>{agentLedgerModal.business_name || 'Field Kiosk'}</strong> ({[agentLedgerModal.district, agentLedgerModal.sector].filter(Boolean).join(', ') || 'Rwanda'})
          </div>
        </div>

        {/* Profile / Financial Summary Strip */}
        <div
          style={{
            padding: '12px 20px',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Accrued</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
              {(agentLedgerModal.total_accrued_rwf || 0).toLocaleString()} RWF
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Paid Out</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
              {(agentLedgerModal.total_paid_out_rwf || 0).toLocaleString()} RWF
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Unpaid Balance</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: (agentLedgerModal.pending_balance_rwf || 0) > 0 ? '#f59e0b' : '#10b981', marginTop: '2px' }}>
              {(agentLedgerModal.pending_balance_rwf || 0).toLocaleString()} RWF
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Clients Facilitated</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
              {agentLedgerModal.clients_onboarded_count || 0}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Last Payout Date</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '4px' }}>
              {agentLedgerModal.last_payout_date || 'First 30-Day Cycle'}
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div
          style={{
            padding: '8px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={13} style={{ position: 'absolute', left: '9px', top: '8px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Filter by ref, client, or service..."
              value={agentModalSearchQuery}
              onChange={(e) => setAgentModalSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '5px 8px 5px 28px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.78rem',
              }}
            />
          </div>

          {(agentLedgerModal.pending_balance_rwf || 0) > 0 && (
            <button
              onClick={() => onOpenPayout(agentLedgerModal)}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.74rem', padding: '4px 12px' }}
            >
              Settle Payout
            </button>
          )}
        </div>

        {/* Ledger Table (Scrollable Body) */}
        <div style={{ overflowY: 'auto', flex: 1, minHeight: '220px' }}>
          {agentModalLedger.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
              {commissionsLedger.some(c => c.agent === agentLedgerModal.id || (agentLedgerModal.agent_code && c.agent_code === agentLedgerModal.agent_code))
                ? 'No transactions matching your search query.'
                : `No commission transactions recorded yet for ${agentLedgerModal.full_name}.`}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', background: 'var(--bg-surface)' }}>
                  <th style={{ padding: '10px 16px' }}>Date & Ref</th>
                  <th style={{ padding: '10px 16px' }}>Client</th>
                  <th style={{ padding: '10px 16px' }}>Service</th>
                  <th style={{ padding: '10px 16px' }}>Client Paid</th>
                  <th style={{ padding: '10px 16px' }}>Commission</th>
                  <th style={{ padding: '10px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {agentModalLedger.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.8rem' }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {c.service_reference || c.id.slice(0, 8)}
                      </div>
                    </td>

                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ color: '#ffffff', fontWeight: 600 }}>{c.client_name || 'Walk-in Client'}</div>
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

                    <td style={{ padding: '10px 16px', color: '#ffffff', fontWeight: 600 }}>
                      {c.amount_paid_by_client_rwf.toLocaleString()} RWF
                    </td>

                    <td style={{ padding: '10px 16px', fontWeight: 700, color: '#10b981' }}>
                      +{c.commission_amount_rwf.toLocaleString()} RWF
                    </td>

                    <td style={{ padding: '10px 16px' }}>
                      {c.status === 'ACCRUED' && <Badge variant="warning">ACCRUED</Badge>}
                      {c.status === 'PAID_OUT' && <Badge variant="success">PAID OUT</Badge>}
                      {c.status === 'CANCELLED' && <Badge variant="danger">CANCELLED</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Bar with single Close button */}
        <div
          style={{
            padding: '10px 20px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            fontSize: '0.76rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            Showing {agentModalLedger.length} ledger transactions for {agentLedgerModal.full_name} ({agentLedgerModal.agent_code || agentLedgerModal.phone_number})
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.74rem', padding: '4px 12px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

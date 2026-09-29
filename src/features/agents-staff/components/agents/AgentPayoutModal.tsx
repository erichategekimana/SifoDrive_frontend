import React from 'react';
import { X } from 'lucide-react';
import type { StaffUserItem } from '../../types';

interface AgentPayoutModalProps {
  isOpen: boolean;
  selectedStaff: StaffUserItem | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  payoutAmount: number;
  setPayoutAmount: (amount: number) => void;
  payoutNotes: string;
  setPayoutNotes: (notes: string) => void;
  isSubmitting: boolean;
}

export const AgentPayoutModal: React.FC<AgentPayoutModalProps> = ({
  isOpen,
  selectedStaff,
  onClose,
  onSubmit,
  payoutAmount,
  setPayoutAmount,
  payoutNotes,
  setPayoutNotes,
  isSubmitting,
}) => {
  if (!isOpen || !selectedStaff) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', padding: '16px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border-medium)', background: 'var(--bg-surface)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              Settle 30-Day Payout
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Agent: {selectedStaff.full_name} ({selectedStaff.agent_code || selectedStaff.phone_number})
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current Unpaid Balance</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
              {(selectedStaff.pending_balance_rwf || 0).toLocaleString()} RWF
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Payout Amount (RWF) *</label>
            <input
              type="number"
              required
              min="1"
              max={selectedStaff.pending_balance_rwf || undefined}
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(parseInt(e.target.value) || 0)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Settlement Notes</label>
            <textarea
              rows={2}
              value={payoutNotes}
              onChange={(e) => setPayoutNotes(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem', resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm">
              {isSubmitting ? 'Settling...' : 'Confirm Payout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

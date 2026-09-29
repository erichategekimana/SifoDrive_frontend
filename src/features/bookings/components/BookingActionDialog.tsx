import React from 'react';
import { X } from 'lucide-react';
import type { BookingOrderItem } from '../../../core/services/AdminService';
import type { BookingActionType } from '../types';

interface BookingActionDialogProps {
  actionOrder: BookingOrderItem | null;
  actionType: BookingActionType | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  agentId: string;
  setAgentId: (val: string) => void;
  nextStatus: string;
  setNextStatus: (val: string) => void;
  applicationNumber: string;
  setApplicationNumber: (val: string) => void;
  billId: string;
  setBillId: (val: string) => void;
  isSubmitting: boolean;
}

export const BookingActionDialog: React.FC<BookingActionDialogProps> = ({
  actionOrder,
  actionType,
  onClose,
  onSubmit,
  agentId,
  setAgentId,
  nextStatus,
  setNextStatus,
  applicationNumber,
  setApplicationNumber,
  billId,
  setBillId,
  isSubmitting,
}) => {
  if (!actionOrder || !actionType) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          borderRadius: 'var(--radius-2xl)',
          padding: '28px',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {actionType === 'STATUS'
              ? 'Update Order Status'
              : actionType === 'ASSIGN'
              ? 'Assign Concierge Agent'
              : 'Register Irembo Slot'}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {actionType === 'ASSIGN' ? (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Agent ID / User UUID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. usr-agent-001"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                }}
              />
            </div>
          ) : actionType === 'STATUS' ? (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                New Status
              </label>
              <select
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                }}
              >
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="CODE_GENERATED">CODE_GENERATED</option>
                <option value="PAID">PAID</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Irembo Application Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 240912-IREMBO-099"
                  value={applicationNumber}
                  onChange={(e) => setApplicationNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  RRA / Irembo Bill ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BILL-99201"
                  value={billId}
                  onChange={(e) => setBillId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : 'Save & Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

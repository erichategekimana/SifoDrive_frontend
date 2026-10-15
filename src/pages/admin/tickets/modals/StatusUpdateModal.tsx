import React from 'react';
import { X, Check } from 'lucide-react';
import type { HelpTicketDTO } from '../../../../core/services/SupportTicketService';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTicket: HelpTicketDTO | null;
  targetStatus: HelpTicketDTO['status'];
  setTargetStatus: (val: HelpTicketDTO['status']) => void;
  responseReply: string;
  setResponseReply: (val: string) => void;
  statusInternalNotes: string;
  setStatusInternalNotes: (val: string) => void;
  onUpdateStatus: () => void;
  isUpdating: boolean;
  statusError: string | null;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isOpen,
  onClose,
  selectedTicket,
  targetStatus,
  setTargetStatus,
  responseReply,
  setResponseReply,
  statusInternalNotes,
  setStatusInternalNotes,
  onUpdateStatus,
  isUpdating,
  statusError,
}) => {
  if (!isOpen || !selectedTicket) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Update Ticket Status & Reply
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {statusError && (
          <div style={{ padding: '8px 12px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '12px' }}>
            {statusError}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Status:
            </label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as any)}
              className="canvas-input"
              style={{ width: '100%', fontSize: '0.84rem' }}
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="REOPENED">Reopened</option>
            </select>
            {(targetStatus === 'RESOLVED' || targetStatus === 'CLOSED') && (
              <p style={{ fontSize: '0.74rem', color: '#059669', backgroundColor: '#ECFDF5', padding: '6px 10px', borderRadius: '4px', margin: '6px 0 0 0' }}>
                💡 Marking this ticket as Resolved or Closed triggers an automatic feedback prompt (Like/Dislike, Solved/Unsolved) for the sender.
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Resolution Reply (Visible to Sender):
            </label>
            <textarea
              rows={4}
              value={responseReply}
              onChange={(e) => setResponseReply(e.target.value)}
              placeholder="Official reply explaining the resolution or answer..."
              className="canvas-input"
              style={{ width: '100%', fontSize: '0.84rem', fontFamily: 'inherit' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Internal Staff Notes:
            </label>
            <input
              type="text"
              value={statusInternalNotes}
              onChange={(e) => setStatusInternalNotes(e.target.value)}
              placeholder="Private internal notes..."
              className="canvas-input"
              style={{ width: '100%', fontSize: '0.84rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button
              type="button"
              onClick={onUpdateStatus}
              disabled={isUpdating}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Check size={14} />
              <span>{isUpdating ? 'Updating...' : 'Save & Update'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X, Forward } from 'lucide-react';
import type { HelpTicketDTO, AssignableUserDTO } from '../../../../core/services/SupportTicketService';

interface ForwardTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTicket: HelpTicketDTO | null;
  assignableUsers: AssignableUserDTO[];
  selectedAssignee: string;
  setSelectedAssignee: (val: string) => void;
  forwardNotes: string;
  setForwardNotes: (val: string) => void;
  onForward: () => void;
  isForwarding: boolean;
  forwardError: string | null;
}

export const ForwardTicketModal: React.FC<ForwardTicketModalProps> = ({
  isOpen,
  onClose,
  selectedTicket,
  assignableUsers,
  selectedAssignee,
  setSelectedAssignee,
  forwardNotes,
  setForwardNotes,
  onForward,
  isForwarding,
  forwardError,
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
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Forward Ticket #{selectedTicket.id.slice(0, 8)}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {forwardError && (
          <div style={{ padding: '8px 12px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '12px' }}>
            {forwardError}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Assignee (Tutor / Staff Member):
            </label>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="canvas-input"
              style={{ width: '100%', fontSize: '0.84rem' }}
            >
              <option value="">-- Choose User --</option>
              {assignableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.role}) • {u.phone_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Handover / Internal Notes:
            </label>
            <textarea
              rows={3}
              value={forwardNotes}
              onChange={(e) => setForwardNotes(e.target.value)}
              placeholder="Instructions for the assignee..."
              className="canvas-input"
              style={{ width: '100%', fontSize: '0.84rem', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button
              type="button"
              onClick={onForward}
              disabled={isForwarding || !selectedAssignee}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Forward size={14} />
              <span>{isForwarding ? 'Forwarding...' : 'Forward Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X, Forward, MessageSquare, Sparkles } from 'lucide-react';
import type { HelpTicketDTO } from '../../../core/services/SupportTicketService';
import { getRoleBadge, getStatusBadge, getPriorityBadge } from './TicketBadges';

interface TicketDetailDrawerProps {
  selectedTicket: HelpTicketDTO;
  onClose: () => void;
  onOpenForwardModal: () => void;
  onOpenStatusModal: () => void;
}

export const TicketDetailDrawer: React.FC<TicketDetailDrawerProps> = ({
  selectedTicket,
  onClose,
  onOpenForwardModal,
  onOpenStatusModal,
}) => {
  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7' }}>
              TICKET #{selectedTicket.id.slice(0, 8).toUpperCase()}
            </span>
            {getPriorityBadge(selectedTicket.priority)}
            {getStatusBadge(selectedTicket.status)}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
            {selectedTicket.subject}
          </h3>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Sender Detail Block */}
      <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
          Sender Information
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {selectedTicket.user_name || 'Anonymous User'}
          </span>
          {getRoleBadge(selectedTicket.user_role)}
        </div>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {selectedTicket.user_phone && <span>📞 {selectedTicket.user_phone}</span>}
          {selectedTicket.user_email && <span>✉️ {selectedTicket.user_email}</span>}
          <span>📅 {new Date(selectedTicket.created_at).toLocaleString()}</span>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onOpenForwardModal}
          className="btn btn-secondary btn-sm"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <Forward size={14} />
          <span>Forward Ticket</span>
        </button>
        <button
          onClick={onOpenStatusModal}
          className="btn btn-primary btn-sm"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <MessageSquare size={14} />
          <span>Update & Reply</span>
        </button>
      </div>

      {/* Routing & Assignment Information */}
      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div>Assigned: <strong>{selectedTicket.assigned_to_name || 'Desk Queue (Unassigned)'}</strong></div>
        {selectedTicket.forwarded_by_name && (
          <div style={{ marginTop: '2px' }}>
            Forwarded by <strong>{selectedTicket.forwarded_by_name}</strong> on {selectedTicket.forwarded_at ? new Date(selectedTicket.forwarded_at).toLocaleDateString() : ''}
          </div>
        )}
      </div>

      {/* Internal Staff Notes */}
      {selectedTicket.internal_notes && (
        <div style={{ padding: '10px 14px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', marginBottom: '2px' }}>
            🔒 Internal Notes
          </div>
          <div style={{ fontSize: '0.8rem', color: '#92400E' }}>{selectedTicket.internal_notes}</div>
        </div>
      )}

      {/* Message Body */}
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
          Inquiry Details:
        </span>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0, padding: '12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', whiteSpace: 'pre-line' }}>
          {selectedTicket.message}
        </p>
      </div>

      {/* Response from Academy */}
      {selectedTicket.response && (
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', display: 'block', marginBottom: '4px' }}>
            Staff Resolution Response:
          </span>
          <p style={{ fontSize: '0.85rem', color: '#065F46', lineHeight: 1.5, margin: 0, padding: '12px', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0', whiteSpace: 'pre-line' }}>
            {selectedTicket.response}
          </p>
        </div>
      )}

      {/* Feedback Summary */}
      {selectedTicket.feedback_submitted_at && (
        <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Sparkles size={14} />
            Sender Satisfaction Feedback
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {selectedTicket.feedback_rating === 'LIKE' ? (
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#047857', backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: '3px' }}>
                👍 Liked (Helpful)
              </span>
            ) : (
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEE2E2', padding: '2px 8px', borderRadius: '3px' }}>
                👎 Disliked (Unhelpful)
              </span>
            )}

            {selectedTicket.feedback_resolution === 'SOLVED' ? (
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#047857' }}>✓ Issue Solved</span>
            ) : (
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#DC2626' }}>✗ Unsolved / Reopened</span>
            )}
          </div>
          {selectedTicket.feedback_notes && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px', fontStyle: 'italic' }}>
              "{selectedTicket.feedback_notes}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

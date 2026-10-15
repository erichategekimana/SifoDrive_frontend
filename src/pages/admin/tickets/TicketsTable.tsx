import React from 'react';
import type { HelpTicketDTO } from '../../../core/services/SupportTicketService';
import { getRoleBadge, getStatusBadge, getPriorityBadge } from './TicketBadges';

interface TicketsTableProps {
  tickets: HelpTicketDTO[];
  selectedTicket: HelpTicketDTO | null;
  onSelectTicket: (ticket: HelpTicketDTO | null) => void;
  isLoading: boolean;
  language: string;
}

export const TicketsTable: React.FC<TicketsTableProps> = ({
  tickets,
  selectedTicket,
  onSelectTicket,
  isLoading,
  language,
}) => {
  return (
    <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-elevated)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Collected Tickets & Inquiries ({tickets.length})
        </span>
      </div>

      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Fetching tickets...
        </div>
      ) : tickets.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No tickets found matching the specified filters.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="canvas-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Ticket & Subject</th>
                <th>Sender & Role</th>
                <th>Routing / Assignee</th>
                <th>Status</th>
                <th>Satisfaction</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((tkt) => {
                const isSelected = selectedTicket?.id === tkt.id;
                return (
                  <tr
                    key={tkt.id}
                    onClick={() => onSelectTicket(isSelected ? null : tkt)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.08)' : undefined,
                    }}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: '#0284c7', fontSize: '0.86rem' }}>
                        {tkt.subject}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{tkt.category}</span>
                        <span>•</span>
                        {getPriorityBadge(tkt.priority)}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {tkt.user_name || 'Anonymous User'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {getRoleBadge(tkt.user_role)}
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {tkt.user_phone || ''}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {tkt.assigned_to_name ? (
                          <span style={{ color: '#059669', fontWeight: 600 }}>{tkt.assigned_to_name}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned (Desk)</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Team: {tkt.recipient_role === 'TUTOR' ? 'Tutors' : tkt.recipient_role === 'TECH_SUPPORT' ? 'Technical Support' : 'Training Admin'}
                      </div>
                    </td>

                    <td>{getStatusBadge(tkt.status)}</td>

                    <td>
                      {tkt.feedback_submitted_at ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {tkt.feedback_rating === 'LIKE' ? (
                            <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700, backgroundColor: '#D1FAE5', padding: '1px 5px', borderRadius: '3px' }}>
                              👍 Liked
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 700, backgroundColor: '#FEE2E2', padding: '1px 5px', borderRadius: '3px' }}>
                              👎 Disliked
                            </span>
                          )}
                          {tkt.feedback_resolution === 'SOLVED' ? (
                            <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>✓ Solved</span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: 600 }}>✗ Unsolved</span>
                          )}
                        </div>
                      ) : tkt.status === 'RESOLVED' || tkt.status === 'CLOSED' ? (
                        <span style={{ fontSize: '0.7rem', color: '#D97706', fontStyle: 'italic' }}>
                          Awaiting Feedback
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>

                    <td style={{ fontSize: '0.73rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(tkt.created_at).toLocaleDateString(language === 'rw' ? 'rw-RW' : 'en-US')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

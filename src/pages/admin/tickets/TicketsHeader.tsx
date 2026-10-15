import React from 'react';
import { RefreshCw, Radio, Plus } from 'lucide-react';

interface TicketsHeaderProps {
  isSystemAdmin: boolean;
  onRefresh: () => void;
  onOpenBroadcastStudio: () => void;
  onNewTicket: () => void;
}

export const TicketsHeader: React.FC<TicketsHeaderProps> = ({
  isSystemAdmin,
  onRefresh,
  onOpenBroadcastStudio,
  onNewTicket,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '16px',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
            Tickets & Inquiries Desk
          </h1>
          <span
            style={{
              fontSize: '0.72rem',
              backgroundColor: isSystemAdmin ? '#EF4444' : '#0284c7',
              color: '#ffffff',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '12px',
            }}
          >
            {isSystemAdmin ? 'SUPER ADMIN CONSOLE' : 'TRAINING ADMIN CONSOLE'}
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0 }}>
          {isSystemAdmin
            ? 'Manage inquiries, forward to tutors/specialists, track resolutions, and broadcast platform updates & help support messages to all users.'
            : 'Process inquiries from students and all platform roles. Forward to instructors, update statuses, and monitor resolution feedback.'}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          title="Refresh tickets"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>

        {/* EXCLUSIVE FEATURE FOR SYSTEM ADMIN ONLY: Navigate to Broadcast Studio */}
        {isSystemAdmin && (
          <button
            onClick={onOpenBroadcastStudio}
            className="btn btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#7C3AED',
              color: '#FFFFFF',
              border: '1px solid #6D28D9',
              boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
            }}
            title="Open Broadcast Studio to manage platform updates, help messages, and announcements"
          >
            <Radio size={15} />
            <span>Broadcast Studio</span>
          </button>
        )}

        <button
          onClick={onNewTicket}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>New Ticket / Inquiry</span>
        </button>
      </div>
    </div>
  );
};

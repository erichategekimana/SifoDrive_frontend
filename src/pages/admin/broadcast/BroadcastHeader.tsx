import React from 'react';
import { ArrowLeft, RefreshCw, Eye, ExternalLink, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BroadcastHeaderProps {
  onBackToTickets: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const BroadcastHeader: React.FC<BroadcastHeaderProps> = ({
  onBackToTickets,
  onRefresh,
  isLoading,
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onBackToTickets}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
          title="Return to Tickets & Inquiries Desk"
        >
          <ArrowLeft size={15} />
          <span>Tickets Desk</span>
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              Broadcast Studio
            </h1>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                padding: '3px 9px',
                borderRadius: '20px',
                backgroundColor: '#7C3AED',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)',
              }}
            >
              <Radio size={11} className="pulse-icon" />
              <span>ON AIR • SUPER ADMIN ONLY</span>
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0 }}>
            Broadcast help support advisories, official announcements, and platform updates directly into the Support tab for all academy users.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          title="Refresh announcements list"
        >
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          <span>Sync Feeds</span>
        </button>

        <Link
          to="/help"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          title="Preview how users see the Support tab"
        >
          <Eye size={14} />
          <span>Open User Support Tab</span>
          <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
};

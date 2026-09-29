import React from 'react';
import { Send, RefreshCw } from 'lucide-react';
import type { GatewayStatusItem } from '../../../core/services/AdminService';

interface NotificationsHeaderProps {
  gatewayStatus: GatewayStatusItem | null;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenBroadcast: () => void;
}

export const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({
  gatewayStatus,
  isLoading,
  onRefresh,
  onOpenBroadcast,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            SMS Communication
          </h1>
          {gatewayStatus?.connected ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--success)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--success)',
                }}
              />
              Pindo Gateway Live
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--danger)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--danger)',
                }}
              />
              Gateway Checking
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Rwanda Pindo SMS gateway management, delivery receipts, single SMS dispatch, and mass broadcasts.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
        <button
          onClick={onOpenBroadcast}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Send size={15} />
          <span>Broadcast SMS</span>
        </button>
      </div>
    </div>
  );
};

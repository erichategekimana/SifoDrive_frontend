import React from 'react';
import { Server, Radio, RotateCcw } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import type { GatewayStatusItem } from '../../../core/services/AdminService';

interface GatewayBannerProps {
  gatewayStatus: GatewayStatusItem | null;
  isPingingGateway: boolean;
  onPingGateway: () => void;
}

export const GatewayBanner: React.FC<GatewayBannerProps> = ({
  gatewayStatus,
  isPingingGateway,
  onPingGateway,
}) => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '16px 20px',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        border: '1px solid var(--border-subtle)',
        background: 'rgba(255, 255, 255, 0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={16} color="var(--primary-light)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Provider:</span>
          <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Pindo Rwanda</strong>
        </div>
        <div style={{ height: '16px', width: '1px', background: 'var(--border-subtle)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={15} color="var(--success)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Endpoint:</span>
          <code
            style={{
              fontSize: '0.78rem',
              color: 'var(--primary-light)',
              background: 'var(--bg-surface-elevated)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            https://api.pindo.io/v1/sms/
          </code>
        </div>
        <div style={{ height: '16px', width: '1px', background: 'var(--border-subtle)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sender ID:</span>
          <Badge variant="neutral" style={{ fontFamily: 'monospace' }}>
            {gatewayStatus?.sender_id || 'PindoTest'}
          </Badge>
        </div>
      </div>

      <button
        onClick={onPingGateway}
        disabled={isPingingGateway}
        className="btn btn-secondary btn-sm"
        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
      >
        <RotateCcw size={13} className={isPingingGateway ? 'spin' : ''} />
        <span>{isPingingGateway ? 'Pinging...' : 'Ping Gateway'}</span>
      </button>
    </div>
  );
};

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import type { GatewayStatusItem } from '../../../core/services/AdminService';

interface SMSGatewayStatusSectionProps {
  gatewayStatus: GatewayStatusItem | null;
  isPingingGateway: boolean;
  onPingGateway: () => void;
}

export const SMSGatewayStatusSection: React.FC<SMSGatewayStatusSectionProps> = ({
  gatewayStatus,
  isPingingGateway,
  onPingGateway,
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 600px) 1fr', gap: '24px', alignItems: 'start' }}>
      <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-2xl)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Pindo SMS Gateway Configuration
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Gateway Provider:</span>
            <strong style={{ color: 'var(--text-primary)' }}>Pindo (api.pindo.io)</strong>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Absolute Base URL:</span>
            <code style={{ color: 'var(--primary-light)' }}>https://api.pindo.io</code>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Single SMS Endpoint:</span>
            <code style={{ color: 'var(--primary-light)' }}>https://api.pindo.io/v1/sms/</code>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Sender ID:</span>
            <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              {gatewayStatus?.sender_id || 'PindoTest'}
            </strong>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Authorization Header:</span>
            <span style={{ color: 'var(--success)', fontWeight: 700 }}>Bearer (Configured & Live)</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Connection Status:</span>
            <Badge variant={gatewayStatus?.connected ? 'success' : 'danger'}>
              {gatewayStatus?.connected ? 'ONLINE' : 'OFFLINE'}
            </Badge>
          </div>

          <button
            onClick={onPingGateway}
            disabled={isPingingGateway}
            className="btn btn-primary"
            style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <RotateCcw size={15} className={isPingingGateway ? 'spin' : ''} />
            <span>{isPingingGateway ? 'Verifying Gateway...' : 'Execute Live Gateway Health Check'}</span>
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-2xl)' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Diagnostic Response
        </h4>
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.5,
          }}
        >
          {JSON.stringify(gatewayStatus || { message: 'No diagnostic run yet' }, null, 2)}
        </div>
      </div>
    </div>
  );
};

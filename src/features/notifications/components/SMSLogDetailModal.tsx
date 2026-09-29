import React from 'react';
import { Eye, X, RotateCcw } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import type { SMSLogItem } from '../../../core/services/AdminService';

interface SMSLogDetailModalProps {
  inspectLog: SMSLogItem | null;
  onClose: () => void;
  onRetry: (log: SMSLogItem) => void;
  retryingId: string | null;
}

export const SMSLogDetailModal: React.FC<SMSLogDetailModalProps> = ({
  inspectLog,
  onClose,
  onRetry,
  retryingId,
}) => {
  if (!inspectLog) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        padding: '16px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '600px',
          borderRadius: 'var(--radius-2xl)',
          padding: '24px',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Eye size={16} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              SMS Transmission Receipt
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
          <div
            style={{
              padding: '12px 14px',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Recipient Phone:</span>
            <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>
              {inspectLog.recipient_phone || inspectLog.recipient}
            </strong>
          </div>

          <div
            style={{
              padding: '12px 14px',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Gateway Status:</span>
            <Badge
              variant={
                inspectLog.status === 'DELIVERED' || inspectLog.status === 'DELIVRD'
                  ? 'success'
                  : inspectLog.status === 'SENT'
                  ? 'info'
                  : inspectLog.status === 'FAILED'
                  ? 'danger'
                  : 'warning'
              }
            >
              {inspectLog.status}
            </Badge>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Full Message Body:
            </label>
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                lineHeight: 1.5,
              }}
            >
              {inspectLog.message_body}
            </div>
          </div>

          {inspectLog.provider_message_id && (
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Pindo Message ID:</span>
              <code style={{ color: 'var(--primary-light)' }}>{inspectLog.provider_message_id}</code>
            </div>
          )}

          {inspectLog.error_message && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--danger)',
              }}
            >
              <strong>Gateway Rejection:</strong> {inspectLog.error_message}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '8px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Dispatched:{' '}
              {new Date(inspectLog.created_at).toLocaleString('en-RW', {
                dateStyle: 'medium',
                timeStyle: 'medium',
              })}
            </span>

            {inspectLog.status === 'FAILED' && (
              <button
                onClick={() => onRetry(inspectLog)}
                disabled={retryingId === inspectLog.id}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RotateCcw size={13} className={retryingId === inspectLog.id ? 'spin' : ''} />
                <span>Retry Send</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

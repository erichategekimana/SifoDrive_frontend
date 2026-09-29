import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { AuditLogItem } from '../../../core/services/AdminService';

interface CriticalEventsWidgetProps {
  criticalEvents: AuditLogItem[];
}

export const CriticalEventsWidget: React.FC<CriticalEventsWidgetProps> = ({ criticalEvents }) => {
  if (criticalEvents.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontWeight: 700, marginBottom: '12px' }}>
        <AlertTriangle size={18} />
        <span>High Severity & Critical Events (Last 24 Hours)</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {criticalEvents.map((evt) => (
          <div
            key={evt.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.08)',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>{evt.action}</strong>
              <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>by {evt.actor_phone || 'System'}</span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              {new Date(evt.created_at).toLocaleTimeString('en-RW')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import type { AuditIntegrityStats } from '../../../core/services/AdminService';

interface AuditIntegrityHeaderProps {
  integrityStats: AuditIntegrityStats | null;
  totalLogsCount: number;
}

export const AuditIntegrityHeader: React.FC<AuditIntegrityHeaderProps> = ({
  integrityStats,
  totalLogsCount,
}) => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderLeft: `4px solid ${integrityStats?.tampered_count === 0 ? 'var(--success)' : 'var(--danger)'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            background: integrityStats?.tampered_count === 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: integrityStats?.tampered_count === 0 ? 'var(--success)' : 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {integrityStats?.tampered_count === 0 ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Database Tamper Status: {integrityStats?.system_integrity || 'SECURE'}
            </span>
            <Badge variant={integrityStats?.tampered_count === 0 ? 'success' : 'danger'}>
              {integrityStats?.tampered_count === 0 ? 'HASH CHAIN INTACT' : 'ANOMALY DETECTED'}
            </Badge>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Total audit entries verified: <strong style={{ color: 'var(--text-primary)' }}>{integrityStats?.total_records ?? totalLogsCount}</strong> | Tampered records: <strong style={{ color: integrityStats?.tampered_count ? 'var(--danger)' : 'var(--success)' }}>{integrityStats?.tampered_count ?? 0}</strong>
          </div>
        </div>
      </div>

      {integrityStats?.last_verified_hash && (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Latest Merkle Block Hash
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--primary-light)' }}>
            {integrityStats.last_verified_hash.slice(0, 24)}...
          </div>
        </div>
      )}
    </div>
  );
};

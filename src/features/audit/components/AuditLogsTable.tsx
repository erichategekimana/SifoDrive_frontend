import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import { Spinner } from '../../../components/common/Spinner';
import type { AuditLogItem, PaginatedResult } from '../../../core/services/AdminService';

interface AuditLogsTableProps {
  logsData: PaginatedResult<AuditLogItem>;
  isLoading: boolean;
  page: number;
  onPageChange: (newPage: number) => void;
}

export const AuditLogsTable: React.FC<AuditLogsTableProps> = ({
  logsData,
  isLoading,
  page,
  onPageChange,
}) => {
  return (
    <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
      {isLoading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Spinner message="Loading audit records from backend..." />
        </div>
      ) : logsData.results.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No audit records matching the specified criteria.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Action</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Severity</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Actor Phone</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>IP Address</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logsData.results.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                    {log.action}
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <Badge
                      variant={
                        log.severity === 'CRITICAL'
                          ? 'danger'
                          : log.severity === 'HIGH'
                          ? 'warning'
                          : log.severity === 'WARNING'
                          ? 'warning'
                          : 'neutral'
                      }
                    >
                      {log.severity}
                    </Badge>
                  </td>

                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {log.actor_phone || 'System Internal'}
                  </td>

                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {log.actor_role || 'SYSTEM'}
                  </td>

                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    {log.ip_address || '—'}
                  </td>

                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleString('en-RW')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface-elevated)',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
        }}
      >
        <div>
          Total Audit Records: <strong style={{ color: 'var(--text-primary)' }}>{logsData.count}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 8px' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span>Page {page}</span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={logsData.results.length < 10}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 8px' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

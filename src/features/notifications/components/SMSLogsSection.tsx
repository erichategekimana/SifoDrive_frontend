import React from 'react';
import { Phone, FileText, Eye, RotateCcw } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import { Spinner } from '../../../components/common/Spinner';
import type { SMSLogItem, PaginatedResult } from '../../../core/services/AdminService';

interface SMSLogsSectionProps {
  logsData: PaginatedResult<SMSLogItem>;
  isLoading: boolean;
  phoneFilter: string;
  setPhoneFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  retryingId: string | null;
  onInspect: (log: SMSLogItem) => void;
  onRetry: (log: SMSLogItem) => void;
}

export const SMSLogsSection: React.FC<SMSLogsSectionProps> = ({
  logsData,
  isLoading,
  phoneFilter,
  setPhoneFilter,
  statusFilter,
  setStatusFilter,
  retryingId,
  onInspect,
  onRetry,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Filters */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <input
              type="text"
              placeholder="Filter by phone number (e.g. +250...)"
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
            />
            <Phone
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="DELIVERED">Delivered</option>
            <option value="SENT">Sent</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Showing {logsData.results.length} of {logsData.count} logs
        </span>
      </div>

      {/* Logs Table */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Spinner message="Loading SMS delivery logs from backend..." />
          </div>
        ) : logsData.results.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              No SMS delivery records found
            </div>
            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              Try adjusting filters or send a test SMS from the "Send Single SMS" tab.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Recipient</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Message Preview</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Sender ID</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Gateway Status</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Timestamp</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {logsData.results.map((log) => {
                  const displayPhone = log.recipient_phone || log.recipient;
                  return (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Phone size={13} color="var(--primary-light)" />
                          <span style={{ fontFamily: 'monospace' }}>{displayPhone}</span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', maxWidth: '380px' }}>
                        <div
                          onClick={() => onInspect(log)}
                          title="Click to view full message"
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                          }}
                        >
                          {log.message_body}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        <Badge variant="neutral" style={{ fontSize: '0.72rem' }}>
                          {log.message_type || 'GENERAL'}
                        </Badge>
                      </td>

                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        {log.sender_id || 'PindoTest'}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <Badge
                          variant={
                            log.status === 'DELIVERED' || log.status === 'DELIVRD'
                              ? 'success'
                              : log.status === 'SENT'
                              ? 'info'
                              : log.status === 'FAILED'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {log.status}
                        </Badge>
                      </td>

                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleString('en-RW', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => onInspect(log)}
                            className="btn btn-secondary btn-xs"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Eye size={12} />
                            <span>Inspect</span>
                          </button>
                          {log.status === 'FAILED' && (
                            <button
                              onClick={() => onRetry(log)}
                              disabled={retryingId === log.id}
                              className="btn btn-secondary btn-xs"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: 'var(--danger)',
                                borderColor: 'rgba(239, 68, 68, 0.3)',
                              }}
                            >
                              <RotateCcw size={12} className={retryingId === log.id ? 'spin' : ''} />
                              <span>Retry</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

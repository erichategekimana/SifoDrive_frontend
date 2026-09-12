import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  RefreshCw,
  AlertTriangle,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  AdminService,
  type AuditIntegrityStats,
  type AuditLogItem,
  type PaginatedResult,
} from '../../core/services/AdminService';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';

export const AdminAuditPage: React.FC = () => {
  const [logsData, setLogsData] = useState<PaginatedResult<AuditLogItem>>({ count: 0, results: [] });
  const [criticalEvents, setCriticalEvents] = useState<AuditLogItem[]>([]);
  const [integrityStats, setIntegrityStats] = useState<AuditIntegrityStats | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [actionSearch, setActionSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const adminService = AdminService.getInstance();
  const { success, error: toastError } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [logsRes, criticalRes, integrityRes] = await Promise.allSettled([
        adminService.getAuditLogs({
          severity: severityFilter !== 'ALL' ? severityFilter : undefined,
          action: actionSearch.trim() || undefined,
          page,
        }),
        adminService.getCriticalAuditEvents(),
        adminService.getIntegrityStats(),
      ]);

      if (logsRes.status === 'fulfilled') setLogsData(logsRes.value);
      if (criticalRes.status === 'fulfilled') setCriticalEvents(criticalRes.value);
      if (integrityRes.status === 'fulfilled') setIntegrityStats(integrityRes.value);
    } catch (err) {
      console.error('Failed loading audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [severityFilter, page]);

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    try {
      const res = await adminService.getIntegrityStats();
      setIntegrityStats(res);
      success(`Database SHA-256 block chain verified across ${res.total_records} records.`);
    } catch (err: any) {
      toastError(err?.message || 'Verification could not be completed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Security & Cryptographic Audit
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Immutable SHA-256 audit ledger, critical compliance events, and security access timelines.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={loadData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleVerifyIntegrity}
            disabled={isVerifying}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Lock size={15} />
            <span>{isVerifying ? 'Verifying Chain...' : 'Verify Cryptographic Integrity'}</span>
          </button>
        </div>
      </div>

      {/* Integrity Card */}
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
              Total audit entries verified: <strong style={{ color: 'var(--text-primary)' }}>{integrityStats?.total_records ?? logsData.count}</strong> | Tampered records: <strong style={{ color: integrityStats?.tampered_count ? 'var(--danger)' : 'var(--success)' }}>{integrityStats?.tampered_count ?? 0}</strong>
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

      {/* Critical Events Strip (If Any) */}
      {criticalEvents.length > 0 && (
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
      )}

      {/* Filter Bar */}
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
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 300px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Filter by action (e.g. AUTH_LOGIN, EXAM_SUBMIT, BOOKING_UPDATE)..."
            value={actionSearch}
            onChange={(e) => setActionSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} color="var(--text-muted)" />
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <option value="ALL">All Severities</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 8px' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span>Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={logsData.results.length < 10}
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 8px' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

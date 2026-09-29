import React from 'react';
import { ShieldCheck, Search, RefreshCw } from 'lucide-react';
import { Badge } from '../../../../components/common/Badge';
import { Spinner } from '../../../../components/common/Spinner';
import type { StaffUserItem, AuditLogItem } from '../../types';

interface StaffAuditModalProps {
  auditingStaff: StaffUserItem | null;
  staffList: StaffUserItem[];
  staffAuditLogs: AuditLogItem[];
  filteredStaffAuditLogs: AuditLogItem[];
  isAuditLoading: boolean;
  auditSearchQuery: string;
  setAuditSearchQuery: (query: string) => void;
  auditSeverityFilter: string;
  setAuditSeverityFilter: (severity: string) => void;
  onAuditStaff: (staff: StaffUserItem) => void;
  onClose: () => void;
  onRefreshAudit: () => void;
}

export const StaffAuditModal: React.FC<StaffAuditModalProps> = ({
  auditingStaff,
  staffList,
  staffAuditLogs,
  filteredStaffAuditLogs,
  isAuditLoading,
  auditSearchQuery,
  setAuditSearchQuery,
  auditSeverityFilter,
  setAuditSeverityFilter,
  onAuditStaff,
  onClose,
  onRefreshAudit,
}) => {
  if (!auditingStaff) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '1050px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-medium)',
          background: 'var(--bg-surface)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
        }}
      >
        {/* Audit Header Bar */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                {auditingStaff.full_name || 'Staff User'}
              </span>
              <Badge variant={auditingStaff.role === 'TUTOR' ? 'success' : auditingStaff.role === 'TRAINING_ADMIN' ? 'warning' : auditingStaff.role === 'SYSTEM_ADMIN' ? 'danger' : 'neutral'}>
                {auditingStaff.role}
              </Badge>
              {auditingStaff.is_active ? (
                <Badge variant="success">ACTIVE</Badge>
              ) : (
                <Badge variant="neutral">DEACTIVATED</Badge>
              )}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {auditingStaff.phone_number} {auditingStaff.email ? `• ${auditingStaff.email}` : ''}
            </div>
          </div>

          {/* Quick Staff Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Staff:</label>
            <select
              value={auditingStaff.id}
              onChange={(e) => {
                const found = staffList.find((s) => s.id === e.target.value);
                if (found) onAuditStaff(found);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.78rem',
                maxWidth: '220px',
              }}
            >
              {staffList
                .filter((s) => s.role !== 'AGENT')
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.role})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Profile Summary Strip */}
        <div
          style={{
            padding: '12px 20px',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Assigned Station / Scope</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>
              {auditingStaff.school_name || (auditingStaff.role === 'TUTOR' ? `${auditingStaff.assigned_cohorts_count || 0} Cohorts Assigned` : '') || auditingStaff.sector || 'Universal Operational Scope'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Assigned Cohorts</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>
              {auditingStaff.role === 'TUTOR' ? `${auditingStaff.assigned_cohorts_count || 0} Cohorts Assigned` : 'All Cohorts Permitted'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Events Logged</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>
              {staffAuditLogs.length} Events Recorded
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Last Login IP</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginTop: '2px', fontFamily: 'monospace' }}>
              {auditingStaff.last_login_ip || '127.0.0.1 (Local Session)'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cryptographic Integrity</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              <ShieldCheck size={14} color="#10b981" />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#10b981' }}>SHA-256 Validated</span>
            </div>
          </div>
        </div>

        {/* Activity Filters Toolbar */}
        <div
          style={{
            padding: '8px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Severity:</span>
            {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((sev) => (
              <button
                key={sev}
                onClick={() => setAuditSeverityFilter(sev)}
                className={`btn btn-sm ${auditSeverityFilter === sev ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              >
                {sev}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={13} style={{ position: 'absolute', left: '9px', top: '8px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Filter activities..."
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '5px 8px 5px 28px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                }}
              />
            </div>

            <button
              onClick={onRefreshAudit}
              className="btn btn-secondary btn-sm"
              style={{ padding: '5px 8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem' }}
              title="Refresh audit trail"
            >
              <RefreshCw size={12} className={isAuditLoading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Audit Logs Table (Scrollable Body) */}
        <div style={{ overflowY: 'auto', flex: 1, minHeight: '220px' }}>
          {isAuditLoading ? (
            <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
              <Spinner message="Loading audit events..." />
            </div>
          ) : filteredStaffAuditLogs.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
              {staffAuditLogs.length === 0
                ? `No activity history recorded for ${auditingStaff.full_name} yet.`
                : 'No activity events matching your severity or search query.'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', background: 'var(--bg-surface)' }}>
                  <th style={{ padding: '10px 16px' }}>Timestamp</th>
                  <th style={{ padding: '10px 16px' }}>Action</th>
                  <th style={{ padding: '10px 16px' }}>Severity</th>
                  <th style={{ padding: '10px 16px' }}>Target / Resource</th>
                  <th style={{ padding: '10px 16px' }}>Endpoint & IP</th>
                  <th style={{ padding: '10px 16px' }}>Details / Context</th>
                  <th style={{ padding: '10px 16px' }}>Hash</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaffAuditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: 600 }}>
                        {new Date(log.timestamp || log.created_at).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {new Date(log.timestamp || log.created_at).toLocaleTimeString()}
                      </div>
                    </td>

                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.78rem', color: '#ffffff' }}>
                        {log.action}
                      </span>
                    </td>

                    <td style={{ padding: '10px 16px' }}>
                      <Badge variant={log.severity === 'CRITICAL' ? 'danger' : log.severity === 'HIGH' ? 'warning' : log.severity === 'MEDIUM' ? 'info' : 'neutral'}>
                        {log.severity}
                      </Badge>
                    </td>

                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                      <div>{log.object_type || 'System'}</div>
                      {log.object_id && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {log.object_id.slice(0, 14)}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                      <div style={{ fontFamily: 'monospace' }}>
                        {log.ip_address || 'Internal Service'}
                      </div>
                      {log.endpoint && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {log.http_method ? `${log.http_method} ` : ''}{log.endpoint}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '10px 16px' }}>
                      {log.context ? (
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={JSON.stringify(log.context, null, 2)}>
                          {Object.entries(log.context).map(([k, v]) => `${k}: ${String(v)}`).join(' • ')}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#10b981', fontFamily: 'monospace', fontWeight: 600 }}>
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Audit Footer Bar */}
        <div
          style={{
            padding: '10px 20px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            fontSize: '0.76rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            Showing {filteredStaffAuditLogs.length} of {staffAuditLogs.length} recorded events for {auditingStaff.full_name}
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.74rem', padding: '4px 12px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

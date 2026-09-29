import React from 'react';
import { Search, History, Edit3, Power, PowerOff } from 'lucide-react';
import { Badge } from '../../../../components/common/Badge';
import { Spinner } from '../../../../components/common/Spinner';
import type { StaffUserItem, StaffRoleFilter } from '../../types';

interface StaffSectionProps {
  staffList: StaffUserItem[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  staffRoleFilter: StaffRoleFilter;
  setStaffRoleFilter: (role: StaffRoleFilter) => void;
  onAuditStaff: (staff: StaffUserItem) => void;
  onOpenEdit: (staff: StaffUserItem) => void;
  onToggleStaffActive: (staff: StaffUserItem) => void;
}

export const StaffSection: React.FC<StaffSectionProps> = ({
  staffList,
  isLoading,
  searchQuery,
  setSearchQuery,
  staffRoleFilter,
  setStaffRoleFilter,
  onAuditStaff,
  onOpenEdit,
  onToggleStaffActive,
}) => {
  return (
    <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
      {/* Controls Bar: Search & Role Filter */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter:</span>
          {(['ALL', 'TUTOR', 'TRAINING_ADMIN', 'BOARD_REVIEWER', 'ENTERPRISE_ADMIN'] as StaffRoleFilter[]).map((r) => (
            <button
              key={r}
              onClick={() => setStaffRoleFilter(r)}
              className={`btn btn-sm ${staffRoleFilter === r ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.74rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
            >
              {r === 'ALL' && 'All'}
              {r === 'TUTOR' && 'Tutors'}
              {r === 'TRAINING_ADMIN' && 'Training Admins'}
              {r === 'BOARD_REVIEWER' && 'Reviewers'}
              {r === 'ENTERPRISE_ADMIN' && 'Driving Schools'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search staff to audit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '0.8rem',
            }}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
          <Spinner message="Loading staff list..." />
        </div>
      ) : staffList.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          No staff members found matching criteria.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 16px' }}>Staff Member</th>
                <th style={{ padding: '12px 16px' }}>Role</th>
                <th style={{ padding: '12px 16px' }}>Contact</th>
                <th style={{ padding: '12px 16px' }}>Station / Scope</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Last Login & IP</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => onAuditStaff(u)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        margin: 0,
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.86rem',
                        textDecoration: 'underline',
                        textDecorationColor: 'transparent',
                        transition: 'text-decoration-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecorationColor = 'var(--text-primary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecorationColor = 'transparent')}
                      title="Click to audit activity history"
                    >
                      {u.full_name || '—'}
                    </button>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      ID: {u.id.slice(0, 8)}...
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <Badge variant={u.role === 'TUTOR' ? 'success' : u.role === 'TRAINING_ADMIN' ? 'warning' : u.role === 'SYSTEM_ADMIN' ? 'danger' : 'neutral'}>
                      {u.role}
                    </Badge>
                  </td>

                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{u.phone_number}</div>
                    {u.email && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.email}</div>}
                  </td>

                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                    {u.school_name ? (
                      <div>{u.school_name}</div>
                    ) : u.role === 'TUTOR' ? (
                      <div>{u.assigned_cohorts_count || 0} Cohorts Assigned</div>
                    ) : u.sector ? (
                      <div>{u.sector}</div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Universal Scope</span>
                    )}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    {u.is_active ? (
                      <Badge variant="success">ACTIVE</Badge>
                    ) : (
                      <Badge variant="neutral">INACTIVE</Badge>
                    )}
                  </td>

                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                    {u.last_login ? (
                      <div>
                        <div>{new Date(u.last_login).toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {u.last_login_ip || '127.0.0.1'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Never logged in</span>
                    )}
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={() => onAuditStaff(u)}
                        className="btn btn-primary btn-sm"
                        style={{
                          fontSize: '0.74rem',
                          padding: '4px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="Audit individual staff member activities"
                      >
                        <History size={12} />
                        <span>Audit</span>
                      </button>

                      <button
                        onClick={() => onOpenEdit(u)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.74rem', padding: '4px 8px' }}
                        title="Edit staff details"
                      >
                        <Edit3 size={12} />
                      </button>

                      <button
                        onClick={() => onToggleStaffActive(u)}
                        className="btn btn-secondary btn-sm"
                        style={{
                          fontSize: '0.74rem',
                          padding: '4px 8px',
                          color: u.is_active ? 'var(--danger)' : '#4ade80',
                          borderColor: u.is_active ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)',
                        }}
                        title={u.is_active ? 'Deactivate staff account' : 'Activate staff account'}
                      >
                        {u.is_active ? <PowerOff size={12} /> : <Power size={12} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

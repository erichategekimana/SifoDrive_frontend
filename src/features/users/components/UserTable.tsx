import React from 'react';
import {
  Phone,
  Lock,
  Eye,
  Edit3,
  UserX,
  CheckCircle,
  Ban,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import { Spinner } from '../../../components/common/Spinner';
import type { AdminUserItem, PaginatedResult } from '../../../core/services/AdminService';

interface UserTableProps {
  usersData: PaginatedResult<AdminUserItem>;
  isLoading: boolean;
  page: number;
  setPage: (page: number | ((p: number) => number)) => void;
  onInspect: (user: AdminUserItem) => void;
  onChangeRole: (user: AdminUserItem) => void;
  onStatusChange: (user: AdminUserItem, status: 'ACTIVE' | 'DEACTIVATED' | 'SUSPENDED' | 'BLACKLISTED') => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  usersData,
  isLoading,
  page,
  setPage,
  onInspect,
  onChangeRole,
  onStatusChange,
}) => {
  return (
    <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
      {isLoading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Spinner message="Loading user directory..." />
        </div>
      ) : usersData.results.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No user accounts found matching your query criteria.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  textAlign: 'left',
                  background: 'var(--bg-surface-elevated)',
                }}
              >
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>User Identity</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Student ID</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>National ID</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Registered</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {usersData.results.map((u) => {
                const isSysAdmin = u.role === 'SYSTEM_ADMIN';
                return (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background var(--transition-fast)',
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'User'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <Phone size={12} />
                        <span>{u.phone_number}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <Badge
                        variant={
                          isSysAdmin
                            ? 'danger'
                            : u.role === 'STUDENT'
                            ? 'success'
                            : u.role === 'TUTOR' || u.role === 'ENTERPRISE_ADMIN'
                            ? 'info'
                            : 'neutral'
                        }
                      >
                        {u.role}
                      </Badge>
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {u.student_id ? (
                        <span style={{ fontFamily: 'monospace', color: 'var(--primary-light)' }}>
                          {u.student_id}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {u.has_national_id || u.national_id || u.national_id_encrypted ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '0.78rem' }}>
                          <Lock size={12} />
                          <span>AES-256 Verified</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Unregistered</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <Badge
                        variant={
                          u.status === 'ACTIVE'
                            ? 'success'
                            : u.status === 'BLACKLISTED'
                            ? 'danger'
                            : u.status === 'SUSPENDED'
                            ? 'danger'
                            : u.status === 'DEACTIVATED'
                            ? 'neutral'
                            : 'warning'
                        }
                      >
                        {u.status}
                      </Badge>
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(u.created_at).toLocaleDateString('en-RW')}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {/* 1. Inspect */}
                        <button
                          onClick={() => onInspect(u)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title="Inspect complete user profile"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>

                        {/* 2. Change Role */}
                        {isSysAdmin ? (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--text-muted)',
                              padding: '4px 8px',
                              background: 'var(--bg-surface-elevated)',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px dashed var(--border-subtle)',
                            }}
                            title="System Admin role cannot be modified"
                          >
                            Protected Admin
                          </span>
                        ) : (
                          <button
                            onClick={() => onChangeRole(u)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title="Change user role"
                          >
                            <Edit3 size={12} />
                            <span>Change Role</span>
                          </button>
                        )}

                        {/* 3. Activate or Deactivate */}
                        {!isSysAdmin && u.status === 'ACTIVE' && (
                          <button
                            onClick={() => onStatusChange(u, 'DEACTIVATED')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title="Deactivate account"
                          >
                            <UserX size={12} />
                            <span>Deactivate</span>
                          </button>
                        )}

                        {!isSysAdmin && u.status !== 'ACTIVE' && (
                          <button
                            onClick={() => onStatusChange(u, 'ACTIVE')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--success)' }}
                            title="Activate account"
                          >
                            <CheckCircle size={12} />
                            <span>Activate</span>
                          </button>
                        )}

                        {/* 4. Blacklist */}
                        {!isSysAdmin && (
                          <button
                            onClick={() => onStatusChange(u, 'BLACKLISTED')}
                            disabled={u.status === 'BLACKLISTED'}
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.75rem',
                              padding: '4px 8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: u.status === 'BLACKLISTED' ? 'var(--text-muted)' : 'var(--danger)',
                            }}
                            title="Blacklist account permanently"
                          >
                            <Ban size={12} />
                            <span>{u.status === 'BLACKLISTED' ? 'Blacklisted' : 'Blacklist'}</span>
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
          Total Records: <strong style={{ color: 'var(--text-primary)' }}>{usersData.count}</strong>
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
            disabled={usersData.results.length < 10}
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

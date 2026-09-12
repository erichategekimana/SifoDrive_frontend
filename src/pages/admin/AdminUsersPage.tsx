import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Phone,
  UserCheck,
  Lock,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AdminService, type AdminUserItem, type PaginatedResult } from '../../core/services/AdminService';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';

export const AdminUsersPage: React.FC = () => {
  const [usersData, setUsersData] = useState<PaginatedResult<AdminUserItem>>({ count: 0, results: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);

  const adminService = AdminService.getInstance();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getUsers({
        role: roleFilter,
        status: statusFilter,
        search: searchTerm.trim() || undefined,
        page,
      });
      setUsersData(data);
    } catch (err) {
      console.error('Failed to load user directory:', err);
      setUsersData({ count: 0, results: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Title & Stats Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            User Directory
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            System-wide user registry, role governance, encrypted National ID compliance, and student IDs.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

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
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 300px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by phone, name, email, or Student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>

        {/* Role and Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
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
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Student</option>
              <option value="GUEST">Guest Learner</option>
              <option value="TUTOR">Tutor</option>
              <option value="SYSTEM_ADMIN">System Admin</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
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
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Spinner message="Loading user directory from backend..." />
          </div>
        ) : usersData.results.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No users matched the selected filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>User Identity</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Student ID</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>National ID</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Registered</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersData.results.map((u) => (
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
                          u.role === 'SYSTEM_ADMIN'
                            ? 'danger'
                            : u.role === 'STUDENT'
                            ? 'success'
                            : u.role === 'TUTOR'
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
                      {u.national_id || u.national_id_encrypted ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '0.78rem' }}>
                          <Lock size={12} />
                          <span>AES-256 Verified</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Unregistered</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <Badge variant={u.status === 'ACTIVE' ? 'success' : u.status === 'SUSPENDED' ? 'danger' : 'warning'}>
                        {u.status}
                      </Badge>
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(u.created_at).toLocaleDateString('en-RW')}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                      >
                        Inspect
                      </button>
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

      {/* User Details Inspection Drawer / Modal */}
      {selectedUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            padding: '16px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              borderRadius: 'var(--radius-2xl)',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--border-medium)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-glow)',
                    color: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                  }}
                >
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {selectedUser.full_name || 'User Profile'}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ID: {selectedUser.id}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Phone Number</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedUser.phone_number}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Role</span>
                <Badge variant={selectedUser.role === 'SYSTEM_ADMIN' ? 'danger' : 'success'}>{selectedUser.role}</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Account Status</span>
                <Badge variant={selectedUser.status === 'ACTIVE' ? 'success' : 'warning'}>{selectedUser.status}</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Student ID</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{selectedUser.student_id || 'Not Assigned'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>National ID Storage</span>
                <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={12} />
                  <span>AES-256 Encrypted in PostgreSQL</span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Registered Timestamp</span>
                <span style={{ color: 'var(--text-secondary)' }}>{new Date(selectedUser.created_at).toLocaleString('en-RW')}</span>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedUser(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
  UserPlus,
  Shield,
  ShieldAlert,
  Ban,
  CheckCircle,
  UserX,
  Eye,
  Edit3,
} from 'lucide-react';
import {
  AdminService,
  type AdminUserItem,
  type PaginatedResult,
} from '../../core/services/AdminService';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';

const ASSIGNABLE_ROLES = [
  { value: 'TUTOR', label: 'Tutor / Facilitator' },
  { value: 'ENTERPRISE_ADMIN', label: 'Enterprise Admin (Driving School)' },
  { value: 'TRAINING_ADMIN', label: 'Training Administrator (Curriculum)' },
  { value: 'BOARD_REVIEWER', label: 'Board Reviewer (Examiner)' },
  { value: 'STUDENT', label: 'Enrolled Student' },
  { value: 'GUEST', label: 'Guest Learner' },
];

export const AdminUsersPage: React.FC = () => {
  const [usersData, setUsersData] = useState<PaginatedResult<AdminUserItem>>({ count: 0, results: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);

  // Modals state
  const [inspectUser, setInspectUser] = useState<AdminUserItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [roleChangeUser, setRoleChangeUser] = useState<AdminUserItem | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<string>('TUTOR');

  // Create User Form State
  const [newUserPhone, setNewUserPhone] = useState<string>('');
  const [newUserFirstName, setNewUserFirstName] = useState<string>('');
  const [newUserLastName, setNewUserLastName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<string>('TUTOR');
  const [newUserPassword, setNewUserPassword] = useState<string>('');
  const [newUserSchoolName, setNewUserSchoolName] = useState<string>('');
  const [newUserQuota, setNewUserQuota] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminService = AdminService.getInstance();
  const { success, warning, error: toastError } = useToast();

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

  // 1. Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserPhone.trim() || !newUserFirstName.trim() || !newUserLastName.trim() || !newUserPassword) {
      warning('Please fill in all required fields.');
      return;
    }

    if (newUserRole === 'SYSTEM_ADMIN') {
      toastError('Creating a System Admin account is prohibited through this portal.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await adminService.createUser({
        phone_number: newUserPhone.trim(),
        first_name: newUserFirstName.trim(),
        last_name: newUserLastName.trim(),
        email: newUserEmail.trim() || undefined,
        role: newUserRole,
        password: newUserPassword,
        school_name: newUserRole === 'ENTERPRISE_ADMIN' ? newUserSchoolName.trim() : undefined,
        station_quota: newUserRole === 'ENTERPRISE_ADMIN' ? newUserQuota : undefined,
      });

      success(`Account created successfully for ${created.full_name || created.first_name} (${created.role}).`);
      setIsCreateModalOpen(false);
      // Reset form
      setNewUserPhone('');
      setNewUserFirstName('');
      setNewUserLastName('');
      setNewUserEmail('');
      setNewUserRole('TUTOR');
      setNewUserPassword('');
      setNewUserSchoolName('');
      setNewUserQuota(10);
      fetchUsers();
    } catch (err: any) {
      toastError(err?.message || 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Change Role
  const handleChangeRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleChangeUser) return;

    if (selectedNewRole === 'SYSTEM_ADMIN') {
      toastError('Cannot elevate any account to System Admin.');
      return;
    }

    if (roleChangeUser.role === 'SYSTEM_ADMIN') {
      toastError('Cannot modify the role of a System Admin account.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await adminService.updateUserRole(roleChangeUser.id, selectedNewRole);
      success(`Role for ${updated.full_name || updated.phone_number} changed to ${updated.role}.`);
      setRoleChangeUser(null);
      if (inspectUser?.id === roleChangeUser.id) {
        setInspectUser((prev) => (prev ? { ...prev, role: updated.role } : null));
      }
      fetchUsers();
    } catch (err: any) {
      toastError(err?.message || 'Failed to change role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Status Transitions (Activate, Deactivate, Blacklist)
  const handleStatusChange = async (
    targetUser: AdminUserItem,
    newStatus: 'ACTIVE' | 'DEACTIVATED' | 'SUSPENDED' | 'BLACKLISTED'
  ) => {
    if (targetUser.role === 'SYSTEM_ADMIN') {
      toastError('Cannot alter status of a System Admin account.');
      return;
    }

    let confirmMsg = `Are you sure you want to change status of ${targetUser.full_name || targetUser.phone_number} to ${newStatus}?`;
    if (newStatus === 'BLACKLISTED') {
      confirmMsg = `WARNING: Blacklisting ${targetUser.full_name || targetUser.phone_number} will permanently revoke platform access and bar their phone number. Proceed?`;
    }

    if (!window.confirm(confirmMsg)) return;

    try {
      const updated = await adminService.updateUserStatus(targetUser.id, newStatus);
      success(`User ${updated.full_name || updated.phone_number} is now ${updated.status}.`);
      if (inspectUser?.id === targetUser.id) {
        setInspectUser((prev) => (prev ? { ...prev, status: updated.status } : null));
      }
      fetchUsers();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update account status.');
    }
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
            System-wide user registry, role governance, account lifecycle, and audit compliance.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchUsers}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Refresh user directory"
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UserPlus size={14} />
            <span>Create Account</span>
          </button>
        </div>
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
              <option value="TUTOR">Tutor / Facilitator</option>
              <option value="ENTERPRISE_ADMIN">Enterprise Admin</option>
              <option value="TRAINING_ADMIN">Training Admin</option>
              <option value="BOARD_REVIEWER">Board Reviewer</option>
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
              <option value="DEACTIVATED">Deactivated</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BLACKLISTED">Blacklisted</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Directory Table */}
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
                            onClick={() => setInspectUser(u)}
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
                              onClick={() => {
                                setRoleChangeUser(u);
                                setSelectedNewRole(u.role === 'SYSTEM_ADMIN' ? 'TUTOR' : u.role);
                              }}
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
                              onClick={() => handleStatusChange(u, 'DEACTIVATED')}
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
                              onClick={() => handleStatusChange(u, 'ACTIVE')}
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
                              onClick={() => handleStatusChange(u, 'BLACKLISTED')}
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

      {/* 1. CREATE USER MODAL */}
      {isCreateModalOpen && (
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
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '540px',
              borderRadius: 'var(--radius-2xl)',
              padding: '28px',
              boxShadow: 'var(--shadow-xl)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Create Admin Account
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Provision instructor, enterprise, reviewer, or learner accounts.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Note regarding System Admin restriction */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                fontSize: '0.78rem',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <span>
                System Admin accounts cannot be created here. System administrators are strictly initialized via CLI.
              </span>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label">First Name *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Jean"
                    value={newUserFirstName}
                    onChange={(e) => setNewUserFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Mugisha"
                    value={newUserLastName}
                    onChange={(e) => setNewUserLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Phone Number (Rwandan E.164) *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="+250788123456"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">Email Address (Optional)</label>
                <input
                  type="email"
                  className="input"
                  placeholder="instructor@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Assigned Role *</label>
                <select
                  className="input"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  required
                >
                  {ASSIGNABLE_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {newUserRole === 'ENTERPRISE_ADMIN' && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="label">Driving School Name *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Kigali Smart Driving Academy"
                      value={newUserSchoolName}
                      onChange={(e) => setNewUserSchoolName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Station Quota</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      className="input"
                      value={newUserQuota}
                      onChange={(e) => setNewUserQuota(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="label">Initial Password *</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Minimum 6 characters"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. CHANGE ROLE MODAL */}
      {roleChangeUser && (
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
          onClick={() => setRoleChangeUser(null)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '460px',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Change User Role
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Assigning new role for {roleChangeUser.full_name || roleChangeUser.phone_number}.
                </p>
              </div>
              <button
                onClick={() => setRoleChangeUser(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleChangeRoleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Select New Role</label>
                <select
                  className="input"
                  value={selectedNewRole}
                  onChange={(e) => setSelectedNewRole(e.target.value)}
                  required
                >
                  {ASSIGNABLE_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Note: System Admin role cannot be granted through the portal.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setRoleChangeUser(null)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Confirm Role Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. USER DETAILS INSPECTION MODAL */}
      {inspectUser && (
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
          onClick={() => setInspectUser(null)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '560px',
              borderRadius: 'var(--radius-2xl)',
              padding: '28px',
              boxShadow: 'var(--shadow-xl)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
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
                    {inspectUser.full_name || 'User Profile'}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ID: {inspectUser.id}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectUser(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {inspectUser.role === 'SYSTEM_ADMIN' && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontSize: '0.78rem',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '14px',
                }}
              >
                <Shield size={14} />
                <span>Protected System Administrator account. Role and status cannot be altered via portal.</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Phone Number</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inspectUser.phone_number}</span>
              </div>

              {inspectUser.email && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Email Address</span>
                  <span style={{ color: 'var(--text-primary)' }}>{inspectUser.email}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Role</span>
                <Badge variant={inspectUser.role === 'SYSTEM_ADMIN' ? 'danger' : 'info'}>{inspectUser.role}</Badge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Account Status</span>
                <Badge
                  variant={
                    inspectUser.status === 'ACTIVE'
                      ? 'success'
                      : inspectUser.status === 'BLACKLISTED'
                      ? 'danger'
                      : inspectUser.status === 'SUSPENDED'
                      ? 'danger'
                      : 'warning'
                  }
                >
                  {inspectUser.status}
                </Badge>
              </div>

              {inspectUser.student_id && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Student ID</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-light)', fontFamily: 'monospace' }}>
                    {inspectUser.student_id}
                  </span>
                </div>
              )}

              {inspectUser.school_name && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Driving School</span>
                  <span style={{ color: 'var(--text-primary)' }}>{inspectUser.school_name}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>National ID Storage</span>
                <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={12} />
                  <span>AES-256 Encrypted in PostgreSQL</span>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Registered Timestamp</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {new Date(inspectUser.created_at).toLocaleString('en-RW')}
                </span>
              </div>
            </div>

            {/* Lifecycle Quick Actions inside Drawer */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Account Actions
              </div>
              {inspectUser.role === 'SYSTEM_ADMIN' ? (
                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  This account has System Administrator privileges. Role modification and status changes of System Admins via the web interface are protected.
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {inspectUser.status !== 'ACTIVE' && (
                    <button
                      onClick={() => handleStatusChange(inspectUser, 'ACTIVE')}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <CheckCircle size={13} />
                      <span>Activate Account</span>
                    </button>
                  )}

                  {inspectUser.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleStatusChange(inspectUser, 'DEACTIVATED')}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <UserX size={13} />
                      <span>Deactivate Account</span>
                    </button>
                  )}

                  {inspectUser.status !== 'BLACKLISTED' && (
                    <button
                      onClick={() => handleStatusChange(inspectUser, 'BLACKLISTED')}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Ban size={13} />
                      <span>Blacklist User</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setRoleChangeUser(inspectUser);
                      setSelectedNewRole(inspectUser.role === 'SYSTEM_ADMIN' ? 'TUTOR' : inspectUser.role);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit3 size={13} />
                    <span>Change Role</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setInspectUser(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import {
  X,
  UserCheck,
  Shield,
  Lock,
  CheckCircle,
  UserX,
  Ban,
  Edit3,
} from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import type { AdminUserItem } from '../../../core/services/AdminService';

interface InspectUserModalProps {
  inspectUser: AdminUserItem | null;
  onClose: () => void;
  onStatusChange: (user: AdminUserItem, status: 'ACTIVE' | 'DEACTIVATED' | 'SUSPENDED' | 'BLACKLISTED') => void;
  onOpenRoleChange: (user: AdminUserItem) => void;
}

export const InspectUserModal: React.FC<InspectUserModalProps> = ({
  inspectUser,
  onClose,
  onStatusChange,
  onOpenRoleChange,
}) => {
  if (!inspectUser) return null;

  return (
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
      onClick={onClose}
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
            onClick={onClose}
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
                  onClick={() => onStatusChange(inspectUser, 'ACTIVE')}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <CheckCircle size={13} />
                  <span>Activate Account</span>
                </button>
              )}

              {inspectUser.status === 'ACTIVE' && (
                <button
                  onClick={() => onStatusChange(inspectUser, 'DEACTIVATED')}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <UserX size={13} />
                  <span>Deactivate Account</span>
                </button>
              )}

              {inspectUser.status !== 'BLACKLISTED' && (
                <button
                  onClick={() => onStatusChange(inspectUser, 'BLACKLISTED')}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Ban size={13} />
                  <span>Blacklist User</span>
                </button>
              )}

              <button
                onClick={() => onOpenRoleChange(inspectUser)}
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
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

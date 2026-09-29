import React from 'react';
import { X } from 'lucide-react';
import { ASSIGNABLE_ROLES } from '../types';
import type { AdminUserItem } from '../../../core/services/AdminService';

interface ChangeRoleModalProps {
  roleChangeUser: AdminUserItem | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  selectedNewRole: string;
  setSelectedNewRole: (role: string) => void;
  isSubmitting: boolean;
}

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  roleChangeUser,
  onClose,
  onSubmit,
  selectedNewRole,
  setSelectedNewRole,
  isSubmitting,
}) => {
  if (!roleChangeUser) return null;

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
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
              onClick={onClose}
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
  );
};

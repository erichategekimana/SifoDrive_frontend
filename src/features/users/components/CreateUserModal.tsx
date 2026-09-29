import React from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { ASSIGNABLE_ROLES } from '../types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  newUserPhone: string;
  setNewUserPhone: (val: string) => void;
  newUserFirstName: string;
  setNewUserFirstName: (val: string) => void;
  newUserLastName: string;
  setNewUserLastName: (val: string) => void;
  newUserEmail: string;
  setNewUserEmail: (val: string) => void;
  newUserRole: string;
  setNewUserRole: (val: string) => void;
  newUserPassword: string;
  setNewUserPassword: (val: string) => void;
  newUserSchoolName: string;
  setNewUserSchoolName: (val: string) => void;
  newUserQuota: number;
  setNewUserQuota: (val: number) => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  newUserPhone,
  setNewUserPhone,
  newUserFirstName,
  setNewUserFirstName,
  newUserLastName,
  setNewUserLastName,
  newUserEmail,
  setNewUserEmail,
  newUserRole,
  setNewUserRole,
  newUserPassword,
  setNewUserPassword,
  newUserSchoolName,
  setNewUserSchoolName,
  newUserQuota,
  setNewUserQuota,
}) => {
  if (!isOpen) return null;

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
            onClick={onClose}
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

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

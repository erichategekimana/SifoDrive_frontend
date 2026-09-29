import React from 'react';
import { X } from 'lucide-react';

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  newRole: string;
  setNewRole: (role: string) => void;
  newFirstName: string;
  setNewFirstName: (name: string) => void;
  newLastName: string;
  setNewLastName: (name: string) => void;
  newPhone: string;
  setNewPhone: (phone: string) => void;
  newEmail: string;
  setNewEmail: (email: string) => void;
  newBusinessName: string;
  setNewBusinessName: (bName: string) => void;
  newNationalId: string;
  setNewNationalId: (nid: string) => void;
  newDistrict: string;
  setNewDistrict: (district: string) => void;
  newSector: string;
  setNewSector: (sector: string) => void;
  newSchoolName: string;
  setNewSchoolName: (school: string) => void;
  newPassword: string;
  setNewPassword: (pwd: string) => void;
}

export const CreateStaffModal: React.FC<CreateStaffModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  newRole,
  setNewRole,
  newFirstName,
  setNewFirstName,
  newLastName,
  setNewLastName,
  newPhone,
  setNewPhone,
  newEmail,
  setNewEmail,
  newBusinessName,
  setNewBusinessName,
  newNationalId,
  setNewNationalId,
  newDistrict,
  setNewDistrict,
  newSector,
  setNewSector,
  newSchoolName,
  setNewSchoolName,
  newPassword,
  setNewPassword,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', padding: '16px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border-medium)', background: 'var(--bg-surface)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
              Add {newRole === 'AGENT' ? 'New Field Agent' : 'Staff Member'}
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Create an administrative user or agency kiosk login.
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>System Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
            >
              <option value="TUTOR">TUTOR (Curriculum & Class Instruction)</option>
              <option value="AGENT">AGENT (Field Kiosk & Service Concierge)</option>
              <option value="TRAINING_ADMIN">TRAINING ADMIN (Course Operations)</option>
              <option value="BOARD_REVIEWER">BOARD REVIEWER (Exam Review)</option>
              <option value="ENTERPRISE_ADMIN">DRIVING SCHOOL ADMIN (Enterprise)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>First Name *</label>
              <input
                type="text"
                required
                placeholder="First Name"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Last Name *</label>
              <input
                type="text"
                required
                placeholder="Last Name"
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Phone Number *</label>
              <input
                type="text"
                required
                placeholder="+250788123456"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontFamily: 'monospace', fontSize: '0.84rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Email</label>
              <input
                type="email"
                placeholder="staff@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
              />
            </div>
          </div>

          {/* Agent Specific Fields */}
          {newRole === 'AGENT' && (
            <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Agent Kiosk Details</div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>Business / Agency Name</label>
                <input
                  type="text"
                  placeholder="e.g. Remera Kiosk"
                  value={newBusinessName}
                  onChange={(e) => setNewBusinessName(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>National ID (16 Digits)</label>
                <input
                  type="text"
                  placeholder="1199..."
                  value={newNationalId}
                  onChange={(e) => setNewNationalId(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>District</label>
                  <input
                    type="text"
                    placeholder="e.g. Gasabo"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>Sector</label>
                  <input
                    type="text"
                    placeholder="e.g. Remera"
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Enterprise Specific Field */}
          {newRole === 'ENTERPRISE_ADMIN' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Driving School Name *</label>
              <input
                type="text"
                required
                placeholder="Inyange Driving Academy"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Password (Default: Staff@123456)</label>
            <input
              type="password"
              placeholder="Leave empty for default password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm">
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React from 'react';
import { X } from 'lucide-react';
import type { StaffUserItem } from '../../types';

interface EditStaffModalProps {
  isOpen: boolean;
  selectedStaff: StaffUserItem | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  editFirstName: string;
  setEditFirstName: (name: string) => void;
  editLastName: string;
  setEditLastName: (name: string) => void;
  editEmail: string;
  setEditEmail: (email: string) => void;
  editBusinessName: string;
  setEditBusinessName: (bName: string) => void;
  editDistrict: string;
  setEditDistrict: (dist: string) => void;
  editSector: string;
  setEditSector: (sec: string) => void;
  editSchoolName: string;
  setEditSchoolName: (school: string) => void;
}

export const EditStaffModal: React.FC<EditStaffModalProps> = ({
  isOpen,
  selectedStaff,
  onClose,
  onSubmit,
  isSubmitting,
  editFirstName,
  setEditFirstName,
  editLastName,
  setEditLastName,
  editEmail,
  setEditEmail,
  editBusinessName,
  setEditBusinessName,
  editDistrict,
  setEditDistrict,
  editSector,
  setEditSector,
  editSchoolName,
  setEditSchoolName,
}) => {
  if (!isOpen || !selectedStaff) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', padding: '16px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border-medium)', background: 'var(--bg-surface)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              Edit {selectedStaff.role}
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {selectedStaff.phone_number} {selectedStaff.agent_code ? `(${selectedStaff.agent_code})` : ''}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>First Name</label>
              <input
                type="text"
                required
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Last Name</label>
              <input
                type="text"
                required
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
            />
          </div>

          {selectedStaff.role === 'AGENT' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Business / Agency Name</label>
                <input
                  type="text"
                  value={editBusinessName}
                  onChange={(e) => setEditBusinessName(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>District</label>
                  <input
                    type="text"
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Sector</label>
                  <input
                    type="text"
                    value={editSector}
                    onChange={(e) => setEditSector(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
                  />
                </div>
              </div>
            </>
          )}

          {selectedStaff.role === 'ENTERPRISE_ADMIN' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Driving School</label>
              <input
                type="text"
                value={editSchoolName}
                onChange={(e) => setEditSchoolName(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm">
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

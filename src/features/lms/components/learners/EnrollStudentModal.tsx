import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { AdminService } from '../../../../core/services/AdminService';
import type { CohortItem, AdminUserItem } from '../../../../core/services/AdminService';
import { Spinner } from '../../../../components/common/Spinner';
import { useToast } from '../../../../context/ToastContext';

interface EnrollStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohorts: CohortItem[];
  tutors: AdminUserItem[];
  onSuccess: () => void;
}

export const EnrollStudentModal: React.FC<EnrollStudentModalProps> = ({
  isOpen,
  onClose,
  cohorts,
  tutors,
  onSuccess,
}) => {
  const [newStudentFirstName, setNewStudentFirstName] = useState<string>('');
  const [newStudentLastName, setNewStudentLastName] = useState<string>('');
  const [newStudentPhone, setNewStudentPhone] = useState<string>('+250');
  const [newStudentEmail, setNewStudentEmail] = useState<string>('');
  const [newStudentPassword, setNewStudentPassword] = useState<string>('Student@123');
  const [newStudentRole, setNewStudentRole] = useState<'STUDENT' | 'GUEST'>('STUDENT');
  const [newStudentCohortId, setNewStudentCohortId] = useState<string>('');
  const [newStudentTutorId, setNewStudentTutorId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminService = AdminService.getInstance();
  const { success, warning, error: toastError } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentFirstName.trim() || !newStudentLastName.trim() || !newStudentPhone.trim() || !newStudentPassword) {
      warning('Please fill in first name, last name, phone, and password.');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await adminService.createUser({
        first_name: newStudentFirstName.trim(),
        last_name: newStudentLastName.trim(),
        phone_number: newStudentPhone.trim(),
        email: newStudentEmail.trim() || undefined,
        password: newStudentPassword,
        role: newStudentRole,
      });

      if (newStudentCohortId && created.id) {
        try {
          await adminService.assignStudentsToCohort(newStudentCohortId, [created.id], 'enroll');
        } catch (cErr) {
          console.warn('Initial cohort assignment error:', cErr);
        }
      }

      if (newStudentTutorId && created.id) {
        try {
          await adminService.assignTutorToStudent(created.id, newStudentTutorId);
        } catch (tErr) {
          console.warn('Initial tutor assignment error:', tErr);
        }
      }

      success(`Successfully enrolled ${created.full_name || created.first_name} (${created.role}).`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Failed to enroll student.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          borderRadius: 'var(--radius-2xl)',
          padding: '28px',
          border: '1px solid var(--border-medium)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserPlus size={22} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              Enroll New Student
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                First Name *
              </label>
              <input
                type="text"
                required
                placeholder="Jean"
                value={newStudentFirstName}
                onChange={(e) => setNewStudentFirstName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.88rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Last Name *
              </label>
              <input
                type="text"
                required
                placeholder="Mugabo"
                value={newStudentLastName}
                onChange={(e) => setNewStudentLastName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Phone Number (+250) *
            </label>
            <input
              type="text"
              required
              placeholder="+250788123456"
              value={newStudentPhone}
              onChange={(e) => setNewStudentPhone(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.88rem', fontFamily: 'monospace' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Email (Optional)
              </label>
              <input
                type="email"
                placeholder="student@example.rw"
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.88rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Initial Password *
              </label>
              <input
                type="password"
                required
                placeholder="Student@123"
                value={newStudentPassword}
                onChange={(e) => setNewStudentPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Role
              </label>
              <select
                value={newStudentRole}
                onChange={(e) => setNewStudentRole(e.target.value as any)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.88rem' }}
              >
                <option value="STUDENT">Student (Full LMS Access)</option>
                <option value="GUEST">Guest (Free Materials Only)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Assign Cohort (Optional)
              </label>
              <select
                value={newStudentCohortId}
                onChange={(e) => setNewStudentCohortId(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.88rem' }}
              >
                <option value="">-- No Initial Cohort --</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code || 'COHORT'})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Assign Personal Tutor (Optional)
            </label>
            <select
              value={newStudentTutorId}
              onChange={(e) => setNewStudentTutorId(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.88rem' }}
            >
              <option value="">-- No Initial Tutor --</option>
              {tutors.map((t) => (
                <option key={t.id} value={t.id}>{t.full_name || 'Tutor'} ({t.phone_number})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isSubmitting ? <Spinner size={16} /> : <UserPlus size={16} />}
              <span>{isSubmitting ? 'Enrolling...' : 'Enroll Student'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

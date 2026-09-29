import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AdminService } from '../../../../core/services/AdminService';
import type { AdminUserItem } from '../../../../core/services/AdminService';
import { useToast } from '../../../../context/ToastContext';

interface StudentTutorModalProps {
  learner: AdminUserItem | null;
  tutors: AdminUserItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export const StudentTutorModal: React.FC<StudentTutorModalProps> = ({
  learner,
  tutors,
  onClose,
  onSuccess,
}) => {
  const [targetStudentTutorId, setTargetStudentTutorId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminService = AdminService.getInstance();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    if (learner) {
      setTargetStudentTutorId(learner.assigned_tutor_id || '');
    }
  }, [learner]);

  if (!learner) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminService.assignTutorToStudent(learner.id, targetStudentTutorId || null);
      success(`Updated tutor for ${learner.full_name || learner.phone_number}.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update tutor assignment.');
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
          maxWidth: '480px',
          borderRadius: 'var(--radius-2xl)',
          padding: '28px',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
              Assign Personal Tutor
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {learner.full_name || learner.phone_number} ({learner.role})
            </p>
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
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              Select Assigned Tutor
            </label>
            <select
              value={targetStudentTutorId}
              onChange={(e) => setTargetStudentTutorId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.88rem',
              }}
            >
              <option value="">-- No Tutor (Unassign) --</option>
              {tutors.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name || 'Tutor'} ({t.phone_number})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : 'Save Tutor Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

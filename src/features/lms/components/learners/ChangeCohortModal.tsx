import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AdminService } from '../../../../core/services/AdminService';
import type { AdminUserItem, CohortItem } from '../../../../core/services/AdminService';
import { useToast } from '../../../../context/ToastContext';

interface ChangeCohortModalProps {
  learner: AdminUserItem | null;
  cohorts: CohortItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangeCohortModal: React.FC<ChangeCohortModalProps> = ({
  learner,
  cohorts,
  onClose,
  onSuccess,
}) => {
  const [targetCohortId, setTargetCohortId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminService = AdminService.getInstance();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    if (learner) {
      setTargetCohortId(learner.cohort_id || '');
    }
  }, [learner]);

  if (!learner) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (targetCohortId) {
        if (learner.cohort_id && learner.cohort_id !== targetCohortId) {
          await adminService.assignStudentsToCohort(learner.cohort_id, [learner.id], 'unenroll');
        }
        await adminService.assignStudentsToCohort(targetCohortId, [learner.id], 'enroll');
        success(`Assigned ${learner.full_name || learner.phone_number} to cohort.`);
      } else if (learner.cohort_id) {
        await adminService.assignStudentsToCohort(learner.cohort_id, [learner.id], 'unenroll');
        success(`Removed ${learner.full_name || learner.phone_number} from cohort.`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update cohort assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
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
              Assign Cohort for Learner
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
              Select Target Cohort
            </label>
            <select
              value={targetCohortId}
              onChange={(e) => setTargetCohortId(e.target.value)}
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
              <option value="">-- Unassigned (Remove from Cohort) --</option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.identifier ? `[#${c.identifier}] ` : ''}{c.name} ({c.code || 'COHORT'}) — {c.student_count || 0}/{c.max_capacity || 60} enrolled
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : 'Save Cohort Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

import React, { useState } from 'react';
import { X, AlertCircle, Clock } from 'lucide-react';
import { TutorLmsService, type CohortQuizItem } from '../../../../core/services/TutorLmsService';
import { Spinner } from '../../../../components/common/Spinner';
import { useToast } from '../../../../context/ToastContext';

interface ExtendDeadlineModalProps {
  isOpen: boolean;
  cohortId: string;
  quiz: CohortQuizItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExtendDeadlineModal: React.FC<ExtendDeadlineModalProps> = ({
  isOpen,
  cohortId,
  quiz,
  onClose,
  onSuccess,
}) => {
  const [extendedDeadline, setExtendedDeadline] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { success, error: toastError } = useToast();

  if (!isOpen || !quiz) return null;

  const currentDeadline = quiz.extended_deadline || quiz.deadline || quiz.default_deadline;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendedDeadline) {
      toastError('Please select a new extended deadline.');
      return;
    }
    if (!reason.trim()) {
      toastError('Please provide a reason for the deadline extension.');
      return;
    }

    setIsSubmitting(true);
    try {
      await TutorLmsService.getInstance().extendCohortQuizDeadline(cohortId, quiz.id, {
        extended_deadline: extendedDeadline,
        extension_reason: reason.trim(),
      });
      success(`Quiz deadline extended for cohort successfully.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Failed to extend deadline.';
      toastError(typeof msg === 'string' ? msg : JSON.stringify(msg));
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
        background: 'rgba(0, 0, 0, 0.75)',
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
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="#f59e0b" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                Extend Quiz Deadline
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {quiz.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentDeadline && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                fontSize: '0.82rem',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={15} />
              <span>Current effective deadline: <strong>{new Date(currentDeadline).toLocaleString()}</strong></span>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              New Extended Deadline <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={extendedDeadline}
              onChange={(e) => setExtendedDeadline(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-elevated)',
                color: '#ffffff',
                fontSize: '0.88rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Reason for Extension <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Additional review required for highway traffic rules before examination."
              rows={3}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-elevated)',
                color: '#ffffff',
                fontSize: '0.88rem',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} disabled={isSubmitting} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-sm"
              style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#000000', fontWeight: 700 }}
            >
              {isSubmitting ? <Spinner size={16} /> : 'Confirm Extension'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

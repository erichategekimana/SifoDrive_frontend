import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Award, AlertCircle } from 'lucide-react';
import { TutorLmsService, type TutorAdminSummary } from '../../../../core/services/TutorLmsService';
import type { CurriculumItem } from '../../../../core/services/AdminService';
import { Badge } from '../../../../components/common/Badge';
import { Spinner } from '../../../../components/common/Spinner';
import { useToast } from '../../../../context/ToastContext';

interface AssignCurriculaModalProps {
  isOpen: boolean;
  tutor: TutorAdminSummary | null;
  curricula: CurriculumItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignCurriculaModal: React.FC<AssignCurriculaModalProps> = ({
  isOpen,
  tutor,
  curricula,
  onClose,
  onSuccess,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    if (tutor) {
      setSelectedIds((tutor.assigned_curricula || []).map((c) => c.id));
    }
  }, [tutor]);

  if (!isOpen || !tutor) return null;

  const handleToggle = (curriculumId: string) => {
    setSelectedIds((prev) =>
      prev.includes(curriculumId) ? prev.filter((id) => id !== curriculumId) : [...prev, curriculumId]
    );
  };

  const handleSave = async () => {
    if (selectedIds.length === 0) {
      if (!window.confirm('Warning: Approved active tutors must have at least one curriculum accredited. Are you sure you want to remove all curricula?')) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await TutorLmsService.getInstance().assignCurricula(tutor.id, selectedIds);
      success(`Curricula accreditation updated for ${tutor.full_name}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to update curricula assignments.';
      toastError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only published curricula can be assigned to tutors
  const publishedCurricula = curricula.filter((c) => c.is_published);

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
          maxWidth: '560px',
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
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
            <Award size={20} color="#0055A5" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                Accredit Curricula to Facilitator
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {tutor.full_name} ({tutor.phone_number})
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
              borderRadius: 'var(--radius-md)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Banner */}
        <div
          style={{
            padding: '12px 20px',
            background: 'rgba(0, 85, 165, 0.08)',
            borderBottom: '1px solid rgba(0, 85, 165, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
          }}
        >
          <AlertCircle size={16} color="#38bdf8" />
          <span>
            Facilitators must be accredited to a curriculum before they can be assigned courses belonging to it.
          </span>
        </div>

        {/* Curricula Checklist */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {publishedCurricula.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              No published curricula available to accredit. Curricula must be published by System Admin first.
            </div>
          ) : (
            publishedCurricula.map((curr) => {
              const isSelected = selectedIds.includes(curr.id);
              return (
                <div
                  key={curr.id}
                  onClick={() => handleToggle(curr.id)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-lg)',
                    border: `1px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-subtle)'}`,
                    background: isSelected ? 'rgba(0, 85, 165, 0.12)' : 'var(--bg-surface-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.92rem' }}>
                        {curr.title}
                      </span>
                      <Badge variant="neutral">{curr.code}</Badge>
                    </div>
                    {curr.description && (
                      <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {curr.description}
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-medium)'}`,
                      background: isSelected ? 'var(--primary-color)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                    }}
                  >
                    {isSelected && <Check size={16} strokeWidth={3} />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button onClick={onClose} disabled={isSubmitting} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting || publishedCurricula.length === 0}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isSubmitting ? <Spinner size={16} /> : <Check size={16} />}
            <span>Save Accreditation</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

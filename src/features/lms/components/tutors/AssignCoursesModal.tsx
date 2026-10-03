import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, BookOpen, AlertTriangle, Lock } from 'lucide-react';
import { TutorLmsService, type TutorAdminSummary } from '../../../../core/services/TutorLmsService';
import { Badge } from '../../../../components/common/Badge';
import { Spinner } from '../../../../components/common/Spinner';
import { useToast } from '../../../../context/ToastContext';

interface AssignCoursesModalProps {
  isOpen: boolean;
  tutor: TutorAdminSummary | null;
  courses: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignCoursesModal: React.FC<AssignCoursesModalProps> = ({
  isOpen,
  tutor,
  courses,
  onClose,
  onSuccess,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    return (tutor?.assigned_courses || []).map((c) => c.id);
  });
  const [isLoadingAssignments, setIsLoadingAssignments] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    let isMounted = true;
    if (tutor && isOpen) {
      setSelectedIds((tutor.assigned_courses || []).map((c) => c.id));
      setIsLoadingAssignments(true);

      TutorLmsService.getInstance()
        .getTutorCourses(tutor.id)
        .then((res) => {
          if (isMounted && Array.isArray(res)) {
            const activeIds = res
              .filter((a: any) => a.is_active)
              .map((a: any) => (typeof a.course === 'string' ? a.course : a.course?.id || a.id));
            setSelectedIds(activeIds);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch live tutor courses:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoadingAssignments(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [tutor?.id, isOpen]);

  const accreditedCurriculumIds = useMemo(() => {
    return new Set((tutor?.assigned_curricula || []).map((c) => c.id));
  }, [tutor]);

  if (!isOpen || !tutor) return null;

  // Filter only published courses
  const publishedCourses = courses.filter((c) => c.is_published);

  const handleToggle = (courseId: string, isAccredited: boolean) => {
    if (!isAccredited) return;
    setSelectedIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await TutorLmsService.getInstance().assignCourses(tutor.id, selectedIds);
      success(`Courses updated for ${tutor.full_name || tutor.phone_number}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to update course assignments.';
      toastError(typeof msg === 'string' ? msg : JSON.stringify(msg));
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
          maxWidth: '620px',
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
            <BookOpen size={20} color="#0055A5" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                Assign Courses
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {tutor.full_name || 'Instructor'} ({tutor.phone_number})
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

        {/* Accreditation Notice */}
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
          <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
          <span>
            Strict Accreditation Rule: Courses can only be assigned if their parent curriculum is already accredited to this facilitator.
          </span>
        </div>

        {/* Course List */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {isLoadingAssignments ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Spinner size={18} />
              <span>Loading current course assignments...</span>
            </div>
          ) : publishedCourses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              No published courses found. Courses must be published under a published curriculum first.
            </div>
          ) : (
            publishedCourses.map((c) => {
              const isAccredited = accreditedCurriculumIds.has(c.curriculum);
              const isSelected = selectedIds.includes(c.id);

              return (
                <div
                  key={c.id}
                  onClick={() => handleToggle(c.id, isAccredited)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-lg)',
                    border: `1px solid ${
                      !isAccredited
                        ? 'rgba(239, 68, 68, 0.2)'
                        : isSelected
                        ? 'var(--primary-color)'
                        : 'var(--border-subtle)'
                    }`,
                    background: !isAccredited
                      ? 'rgba(239, 68, 68, 0.04)'
                      : isSelected
                      ? 'rgba(0, 85, 165, 0.12)'
                      : 'var(--bg-surface-elevated)',
                    opacity: isAccredited ? 1 : 0.6,
                    cursor: isAccredited ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ flex: 1, marginRight: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.92rem' }}>
                        {c.title}
                      </span>
                      <Badge variant="neutral">{c.code || 'CRS'}</Badge>
                      {c.curriculum_name && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ({c.curriculum_name})
                        </span>
                      )}
                    </div>
                    {!isAccredited && (
                      <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Lock size={12} />
                        Parent curriculum not accredited.
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${
                        !isAccredited
                          ? 'var(--border-subtle)'
                          : isSelected
                          ? 'var(--primary-color)'
                          : 'var(--border-medium)'
                      }`,
                      background: isSelected && isAccredited ? 'var(--primary-color)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                    }}
                  >
                    {isSelected && isAccredited && <Check size={16} strokeWidth={3} />}
                    {!isAccredited && <Lock size={12} color="var(--text-muted)" />}
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
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button onClick={onClose} disabled={isSubmitting} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting || isLoadingAssignments}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isSubmitting ? (
              <>
                <Spinner size={16} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AssignCoursesModal;

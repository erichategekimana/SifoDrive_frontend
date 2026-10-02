import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, GraduationCap, Search, CheckSquare, Square } from 'lucide-react';
import { AdminService } from '../../../../core/services/AdminService';
import type { CohortItem } from '../../../../core/services/AdminService';
import type { TutorAdminSummary } from '../../../../core/services/TutorLmsService';
import { Badge } from '../../../../components/common/Badge';
import { Spinner } from '../../../../components/common/Spinner';
import { useToast } from '../../../../context/ToastContext';

interface AssignCohortsModalProps {
  isOpen: boolean;
  tutor: TutorAdminSummary | null;
  cohorts: CohortItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignCohortsModal: React.FC<AssignCohortsModalProps> = ({
  isOpen,
  tutor,
  cohorts,
  onClose,
  onSuccess,
}) => {
  const [selectedCohortIds, setSelectedCohortIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminService = AdminService.getInstance();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    if (tutor && cohorts) {
      const initialAssigned = cohorts
        .filter((c) => (c.assigned_tutors || []).some((t) => t.id === tutor.id))
        .map((c) => c.id);
      setSelectedCohortIds(initialAssigned);
      setSearchQuery('');
    }
  }, [tutor, cohorts]);

  const filteredCohorts = useMemo(() => {
    if (!searchQuery.trim()) return cohorts;
    const q = searchQuery.toLowerCase();
    return cohorts.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.schedule_description?.toLowerCase().includes(q)
    );
  }, [cohorts, searchQuery]);

  if (!isOpen || !tutor) return null;

  const handleToggleCohort = (cohortId: string) => {
    setSelectedCohortIds((prev) =>
      prev.includes(cohortId) ? prev.filter((id) => id !== cohortId) : [...prev, cohortId]
    );
  };

  const handleSelectAll = () => {
    const ids = filteredCohorts.map((c) => c.id);
    setSelectedCohortIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const handleDeselectAll = () => {
    const ids = filteredCohorts.map((c) => c.id);
    setSelectedCohortIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const originallyAssignedIds = cohorts
        .filter((c) => (c.assigned_tutors || []).some((t) => t.id === tutor.id))
        .map((c) => c.id);

      const toAssign = selectedCohortIds.filter((id) => !originallyAssignedIds.includes(id));
      const toUnassign = originallyAssignedIds.filter((id) => !selectedCohortIds.includes(id));

      const promises: Promise<any>[] = [];
      for (const cohortId of toAssign) {
        promises.push(adminService.assignTutorsToCohort(cohortId, [tutor.id], 'assign'));
      }
      for (const cohortId of toUnassign) {
        promises.push(adminService.assignTutorsToCohort(cohortId, [tutor.id], 'unassign'));
      }

      await Promise.all(promises);

      if (toAssign.length === 0 && toUnassign.length === 0) {
        success(`No changes to cohort assignments for ${tutor.full_name || 'instructor'}.`);
      } else {
        success(`Cohort assignments updated for instructor ${tutor.full_name || 'instructor'}.`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to update cohort assignments.';
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
          maxWidth: '640px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid var(--border-medium)',
          background: 'var(--bg-surface)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Header (Pinned) */}
        <div
          style={{
            flexShrink: 0,
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#f59e0b',
                  }}
                >
                  <GraduationCap size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  Assign Instructor to Cohorts
                </h3>
                <Badge variant={tutor.status === 'ACTIVE' ? 'success' : 'neutral'}>
                  {tutor.status || 'ACTIVE'}
                </Badge>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Instructor: <strong style={{ color: '#ffffff' }}>{tutor.full_name || 'Instructor'}</strong> ({tutor.phone_number})
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '6px',
              }}
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search & Bulk Select Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginTop: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search
                size={15}
                style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search cohorts by name, code, schedule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleSelectAll}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.74rem', padding: '6px 10px' }}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.74rem', padding: '6px 10px' }}
              >
                Deselect All
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Cohort Checklist (Middle Flex Area) */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '16px 24px',
          }}
        >
          {filteredCohorts.length === 0 ? (
            <div
              style={{
                padding: '48px 16px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.86rem',
              }}
            >
              {cohorts.length === 0 ? 'No cohorts available in the system.' : 'No cohorts match your search.'}
            </div>
          ) : (
            filteredCohorts.map((cohort) => {
              const isSelected = selectedCohortIds.includes(cohort.id);
              const isOriginallyAssigned = (cohort.assigned_tutors || []).some((t) => t.id === tutor.id);

              return (
                <div
                  key={cohort.id}
                  onClick={() => handleToggleCohort(cohort.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: isSelected ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-surface-elevated)',
                    border: isSelected ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isSelected ? (
                        <CheckSquare size={20} color="#f59e0b" />
                      ) : (
                        <Square size={20} color="var(--text-muted)" />
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color: isSelected ? '#ffffff' : 'var(--text-primary)',
                            fontSize: '0.9rem',
                          }}
                        >
                          {cohort.name}
                        </span>
                        <Badge variant="neutral">{cohort.code || 'COHORT'}</Badge>
                        <Badge variant={cohort.is_active ? 'success' : 'neutral'}>
                          {cohort.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </Badge>
                        {isOriginallyAssigned && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: 'rgba(34, 197, 94, 0.15)',
                              color: '#4ade80',
                              fontWeight: 600,
                            }}
                          >
                            Currently Teaching
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '0.76rem',
                          color: 'var(--text-muted)',
                          marginTop: '3px',
                        }}
                      >
                        {cohort.start_date} to {cohort.end_date || 'Open'} • {cohort.student_count || 0} learner(s)
                        {cohort.schedule_description ? ` • ${cohort.schedule_description}` : ''}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: isSelected ? '#f59e0b' : 'var(--text-muted)',
                    }}
                  >
                    {isSelected ? 'Assigned' : 'Click to assign'}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer (Pinned at Bottom) */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            disabled={isSubmitting}
            style={{ padding: '8px 16px' }}
          >
            Cancel
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: '#f59e0b' }}>{selectedCohortIds.length}</strong> cohort{selectedCohortIds.length === 1 ? '' : 's'} selected
            </span>

            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary btn-sm"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                fontWeight: 700,
                boxShadow: '0 2px 10px rgba(0, 85, 165, 0.4)',
              }}
            >
              {isSubmitting ? (
                <>
                  <Spinner size={16} />
                  <span>Saving Cohorts...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Save Cohort Assignments</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AssignCohortsModal;

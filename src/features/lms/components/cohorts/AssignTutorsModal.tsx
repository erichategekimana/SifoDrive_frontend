import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, CheckSquare, Square, Check, Users, UserCheck } from 'lucide-react';
import { AdminService } from '../../../../core/services/AdminService';
import type { CohortItem, AdminUserItem } from '../../../../core/services/AdminService';
import { Badge } from '../../../../components/common/Badge';
import { Spinner } from '../../../../components/common/Spinner';
import { useToast } from '../../../../context/ToastContext';

interface AssignTutorsModalProps {
  cohort: CohortItem | null;
  tutors: AdminUserItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignTutorsModal: React.FC<AssignTutorsModalProps> = ({
  cohort,
  tutors,
  onClose,
  onSuccess,
}) => {
  const [selectedTutorIds, setSelectedTutorIds] = useState<string[]>([]);
  const [tutorModalSearch, setTutorModalSearch] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminService = AdminService.getInstance();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    if (cohort) {
      setSelectedTutorIds((cohort.assigned_tutors || []).map((t) => t.id));
      setTutorModalSearch('');
    }
  }, [cohort]);

  const filteredModalTutors = useMemo(() => {
    if (!tutorModalSearch.trim()) return tutors;
    const q = tutorModalSearch.toLowerCase();
    return tutors.filter(
      (t) =>
        t.full_name?.toLowerCase().includes(q) ||
        t.phone_number?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q)
    );
  }, [tutors, tutorModalSearch]);

  if (!cohort) return null;

  const handleToggleTutor = (tutorId: string) => {
    setSelectedTutorIds((prev) =>
      prev.includes(tutorId) ? prev.filter((id) => id !== tutorId) : [...prev, tutorId]
    );
  };

  const handleSelectAllFiltered = () => {
    const ids = filteredModalTutors.map((t) => t.id);
    setSelectedTutorIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const handleDeselectAllFiltered = () => {
    const ids = filteredModalTutors.map((t) => t.id);
    setSelectedTutorIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const originalIds = (cohort.assigned_tutors || []).map((t) => t.id);
      const toAssign = selectedTutorIds.filter((id) => !originalIds.includes(id));
      const toUnassign = originalIds.filter((id) => !selectedTutorIds.includes(id));

      if (toAssign.length > 0) {
        await adminService.assignTutorsToCohort(cohort.id, toAssign, 'assign');
      }
      if (toUnassign.length > 0) {
        await adminService.assignTutorsToCohort(cohort.id, toUnassign, 'unassign');
      }

      if (toAssign.length === 0 && toUnassign.length === 0) {
        success(`No changes made to tutor assignments for "${cohort.name}".`);
      } else {
        success(`Successfully updated tutor assignments for cohort "${cohort.name}".`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to save tutor assignments.';
      toastError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const originallyAssignedCount = (cohort.assigned_tutors || []).length;
  const isDirty =
    selectedTutorIds.length !== originallyAssignedCount ||
    selectedTutorIds.some((id) => !(cohort.assigned_tutors || []).some((t) => t.id === id));

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
        {/* Modal Header (Pinned at Top) */}
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
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                  }}
                >
                  <Users size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  Assign Tutors to Cohort
                </h3>
                <Badge variant={cohort.is_active ? 'success' : 'neutral'}>
                  {cohort.is_active ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Cohort: <strong style={{ color: '#ffffff' }}>{cohort.name}</strong> ({cohort.code || 'COHORT'})
                {cohort.schedule_description ? ` • ${cohort.schedule_description}` : ''}
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
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                placeholder="Search tutors by name, phone, email..."
                value={tutorModalSearch}
                onChange={(e) => setTutorModalSearch(e.target.value)}
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
                onClick={handleSelectAllFiltered}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.74rem', padding: '6px 10px' }}
                title="Select all matching tutors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleDeselectAllFiltered}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.74rem', padding: '6px 10px' }}
                title="Deselect all matching tutors"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Selection Counter Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              marginTop: '10px',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={14} color="#38bdf8" />
              <span style={{ color: 'var(--text-secondary)' }}>
                Selected: <strong style={{ color: '#38bdf8' }}>{selectedTutorIds.length}</strong> of {tutors.length} instructors
              </span>
            </div>
            {isDirty && (
              <span style={{ color: '#f59e0b', fontSize: '0.72rem', fontWeight: 600 }}>
                • Unsaved changes
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Tutor Selection List (Middle Flex Area) */}
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
          {filteredModalTutors.length === 0 ? (
            <div
              style={{
                padding: '48px 16px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.86rem',
              }}
            >
              {tutors.length === 0
                ? 'No instructors registered in the system directory.'
                : 'No instructors match your search.'}
            </div>
          ) : (
            filteredModalTutors.map((tut) => {
              const isSelected = selectedTutorIds.includes(tut.id);
              const isOriginallyAssigned = (cohort.assigned_tutors || []).some((at) => at.id === tut.id);

              return (
                <div
                  key={tut.id}
                  onClick={() => handleToggleTutor(tut.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-surface-elevated)',
                    border: isSelected ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid var(--border-subtle)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isSelected ? (
                        <CheckSquare size={20} color="#38bdf8" />
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
                          {tut.full_name || 'Instructor'}
                        </span>
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
                            Currently Assigned
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '0.76rem',
                          color: 'var(--text-muted)',
                          fontFamily: 'monospace',
                          marginTop: '3px',
                        }}
                      >
                        {tut.phone_number} {tut.email ? `• ${tut.email}` : ''}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: isSelected ? '#38bdf8' : 'var(--text-muted)',
                    }}
                  >
                    {isSelected ? 'Assigned' : 'Click to assign'}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer (Pinned at Bottom - Always Accessible) */}
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
              <strong style={{ color: '#38bdf8' }}>{selectedTutorIds.length}</strong> instructor{selectedTutorIds.length === 1 ? '' : 's'} selected
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
                  <span>Saving Assignments...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Save Tutor Assignments</span>
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

export default AssignTutorsModal;

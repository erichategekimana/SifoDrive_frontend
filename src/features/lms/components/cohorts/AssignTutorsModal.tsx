import React, { useState, useMemo } from 'react';
import { X, Search, CheckSquare, Square, Check } from 'lucide-react';
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
  const [selectedTutorIds, setSelectedTutorIds] = useState<string[]>(() =>
    (cohort?.assigned_tutors || []).map((t) => t.id)
  );
  const [tutorModalSearch, setTutorModalSearch] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminService = AdminService.getInstance();
  const { success, error: toastError } = useToast();

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

      success(`Tutor assignments updated for cohort "${cohort.name}".`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Failed to save tutor assignments.');
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
          maxWidth: '620px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-2xl)',
          padding: '26px',
          border: '1px solid var(--border-medium)',
          background: 'var(--bg-surface)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingBottom: '14px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: '#ffffff' }}>
                Assign Tutors to Cohort
              </h3>
              <Badge variant={cohort.is_active ? 'success' : 'neutral'}>
                {cohort.is_active ? 'ACTIVE' : 'INACTIVE'}
              </Badge>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Cohort: <strong style={{ color: '#ffffff' }}>{cohort.name}</strong> ({cohort.code || 'COHORT'}) • Select tutors from the list below.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
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
            marginBottom: '12px',
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
              style={{ fontSize: '0.74rem', padding: '5px 10px' }}
              title="Select all matching tutors"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleDeselectAllFiltered}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.74rem', padding: '5px 10px' }}
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
            marginBottom: '12px',
            fontSize: '0.8rem',
          }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>
            Selected: <strong style={{ color: 'var(--primary-light)' }}>{selectedTutorIds.length}</strong> of {tutors.length} tutors
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
            Click tutor row or checkbox to toggle
          </span>
        </div>

        {/* Scrollable Tutor Selection List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            maxHeight: '360px',
            paddingRight: '4px',
          }}
        >
          {filteredModalTutors.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              {tutors.length === 0 ? 'No tutors registered in the system directory.' : 'No tutors match your search.'}
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
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-surface-elevated)',
                    border: isSelected ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid var(--border-subtle)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isSelected ? (
                        <CheckSquare size={19} color="#38bdf8" />
                      ) : (
                        <Square size={19} color="var(--text-muted)" />
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: isSelected ? '#ffffff' : 'var(--text-primary)', fontSize: '0.88rem' }}>
                          {tut.full_name || 'Tutor'}
                        </span>
                        {isOriginallyAssigned && (
                          <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 600 }}>
                            Currently Assigned
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                        {tut.phone_number} {tut.email ? `• ${tut.email}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: isSelected ? '#38bdf8' : 'var(--text-muted)' }}>
                    {isSelected ? 'Selected' : 'Click to select'}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '18px',
            paddingTop: '14px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {isSubmitting ? (
              <>
                <Spinner size={16} />
                <span>Saving Assignments...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Save Tutor Assignments ({selectedTutorIds.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

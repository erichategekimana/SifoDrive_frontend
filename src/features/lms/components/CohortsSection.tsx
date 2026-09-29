import React, { useState, useMemo } from 'react';
import { Search, Plus, Users, Power, PowerOff } from 'lucide-react';
import { AdminService } from '../../../core/services/AdminService';
import type { CohortItem, AdminUserItem } from '../../../core/services/AdminService';
import { Badge } from '../../../components/common/Badge';
import { useToast } from '../../../context/ToastContext';
import { CreateCohortModal } from './cohorts/CreateCohortModal';
import { AssignTutorsModal } from './cohorts/AssignTutorsModal';

export interface CohortsSectionProps {
  cohorts: CohortItem[];
  tutors: AdminUserItem[];
  refetch: () => Promise<void>;
}

export const CohortsSection: React.FC<CohortsSectionProps> = ({
  cohorts,
  tutors,
  refetch,
}) => {
  const [cohortSearch, setCohortSearch] = useState<string>('');
  const [isCreateCohortModalOpen, setIsCreateCohortModalOpen] = useState<boolean>(false);
  const [selectedCohortForTutors, setSelectedCohortForTutors] = useState<CohortItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminService = AdminService.getInstance();
  const { success, warning, error: toastError } = useToast();

  const filteredCohorts = useMemo(() => {
    return cohorts.filter((c) => {
      if (!cohortSearch) return true;
      const q = cohortSearch.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    });
  }, [cohorts, cohortSearch]);

  const handleOpenAssignTutorsModal = (cohort: CohortItem) => {
    setSelectedCohortForTutors(cohort);
  };

  const handleToggleCohortActive = async (cohort: CohortItem) => {
    if (cohort.is_active) {
      const ongoing = cohort.ongoing_student_count ?? 0;
      if (ongoing > 0) {
        warning(
          `Cannot deactivate cohort "${cohort.name}". There are ${ongoing} active student(s) currently enrolled who have not completed or withdrawn from the course.`
        );
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to deactivate cohort "${cohort.name}"? All students have completed or withdrawn.`
      );
      if (!confirmed) return;

      setIsSubmitting(true);
      try {
        await adminService.updateCohort(cohort.id, { is_active: false });
        success(`Cohort "${cohort.name}" has been deactivated.`);
        refetch();
      } catch (err: any) {
        const msg =
          err?.response?.data?.is_active ||
          err?.response?.data?.detail ||
          err?.message ||
          'Failed to deactivate cohort.';
        toastError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        await adminService.updateCohort(cohort.id, { is_active: true });
        success(`Cohort "${cohort.name}" is now active.`);
        refetch();
      } catch (err: any) {
        toastError(err?.message || 'Failed to activate cohort.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
      <div
        style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search cohorts..."
            value={cohortSearch}
            onChange={(e) => setCohortSearch(e.target.value)}
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

        <button
          onClick={() => setIsCreateCohortModalOpen(true)}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} />
          <span>Create Cohort</span>
        </button>
      </div>

      {filteredCohorts.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No cohorts registered. Create a student cohort to begin scheduling classes and assigning tutors.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Code</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Cohort Name</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Duration</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Enrolled / Capacity</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Assigned Tutors</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCohorts.map((co) => {
                const studentCount = co.student_count || 0;
                const maxCap = co.max_capacity || 50;
                const assignedTutorsList = co.assigned_tutors || [];
                const ongoingCount = co.ongoing_student_count ?? 0;

                return (
                  <tr key={co.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--primary-light)', fontFamily: 'monospace' }}>
                      {co.code || 'COHORT'}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ffffff' }}>
                      <div>{co.name}</div>
                      {co.schedule_description && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>
                          {co.schedule_description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {co.is_active ? (
                        <Badge variant="success">ACTIVE</Badge>
                      ) : (
                        <Badge variant="neutral">INACTIVE</Badge>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {co.start_date} to {co.end_date || 'Open'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#ffffff' }}>{studentCount}</span>
                        <span style={{ color: 'var(--text-muted)' }}>/ {maxCap}</span>
                      </div>
                      {co.ongoing_student_count !== undefined && (
                        ongoingCount === 0 ? (
                          <div style={{ fontSize: '0.72rem', color: '#4ade80', marginTop: '3px', fontWeight: 600 }}>
                            0 Ongoing (Eligible to Deactivate)
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                            {ongoingCount} ongoing learner{ongoingCount > 1 ? 's' : ''}
                          </div>
                        )
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {assignedTutorsList.length === 0 ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None assigned</span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {assignedTutorsList.map((tut) => (
                            <span
                              key={tut.id}
                              style={{
                                fontSize: '0.74rem',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-sm)',
                                background: 'rgba(56, 189, 248, 0.12)',
                                color: '#38bdf8',
                                border: '1px solid rgba(56, 189, 248, 0.25)',
                              }}
                            >
                              {tut.full_name || tut.phone_number}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenAssignTutorsModal(co)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                          title="Assign or update tutors for this cohort"
                        >
                          <Users size={13} />
                          <span>Assign Tutors</span>
                        </button>

                        {co.is_active ? (
                          <button
                            onClick={() => handleToggleCohortActive(co)}
                            disabled={isSubmitting}
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.75rem',
                              padding: '4px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              color: ongoingCount > 0 ? 'var(--text-muted)' : 'var(--danger)',
                              borderColor: ongoingCount > 0 ? 'var(--border-subtle)' : 'rgba(239, 68, 68, 0.35)',
                            }}
                            title={
                              ongoingCount > 0
                                ? `Cannot deactivate: ${ongoingCount} active student(s) still ongoing`
                                : 'Deactivate cohort'
                            }
                          >
                            <PowerOff size={13} />
                            <span>Deactivate</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleCohortActive(co)}
                            disabled={isSubmitting}
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.75rem',
                              padding: '4px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              color: '#4ade80',
                              borderColor: 'rgba(34, 197, 94, 0.35)',
                            }}
                            title="Activate cohort"
                          >
                            <Power size={13} />
                            <span>Activate</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CreateCohortModal
        isOpen={isCreateCohortModalOpen}
        onClose={() => setIsCreateCohortModalOpen(false)}
        onSuccess={refetch}
      />

      <AssignTutorsModal
        cohort={selectedCohortForTutors}
        tutors={tutors}
        onClose={() => setSelectedCohortForTutors(null)}
        onSuccess={refetch}
      />
    </div>
  );
};

export default CohortsSection;

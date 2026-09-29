import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Eye, Award, Power, PowerOff, ArrowRightLeft, UserCheck } from 'lucide-react';
import { AdminService } from '../../../core/services/AdminService';
import type { AdminUserItem, CohortItem } from '../../../core/services/AdminService';
import { Badge } from '../../../components/common/Badge';
import { useToast } from '../../../context/ToastContext';
import { useTranslation } from '../../../context/I18nContext';
import { ChangeCohortModal } from './learners/ChangeCohortModal';
import { StudentTutorModal } from './learners/StudentTutorModal';
import { EnrollStudentModal } from './learners/EnrollStudentModal';
import { StudentDetailsModal } from './learners/StudentDetailsModal';

export interface LearnersSectionProps {
  students: AdminUserItem[];
  guests: AdminUserItem[];
  cohorts: CohortItem[];
  tutors: AdminUserItem[];
  refetch: () => Promise<void>;
}

export const LearnersSection: React.FC<LearnersSectionProps> = ({
  students,
  guests,
  cohorts,
  tutors,
  refetch,
}) => {
  const { t } = useTranslation();
  const adminService = AdminService.getInstance();
  const { success, error: toastError } = useToast();

  const [learnerSearch, setLearnerSearch] = useState<string>('');
  const [learnerRoleFilter, setLearnerRoleFilter] = useState<'ALL' | 'STUDENT' | 'GUEST'>('ALL');
  const [learnerCohortFilter, setLearnerCohortFilter] = useState<string>('ALL');
  const [learnerTutorFilter, setLearnerTutorFilter] = useState<string>('ALL');
  const [learnerStatusFilter, setLearnerStatusFilter] = useState<string>('ALL');

  // Modal state
  const [selectedLearnerForCohort, setSelectedLearnerForCohort] = useState<AdminUserItem | null>(null);
  const [selectedLearnerForTutor, setSelectedLearnerForTutor] = useState<AdminUserItem | null>(null);
  const [isEnrollStudentModalOpen, setIsEnrollStudentModalOpen] = useState<boolean>(false);
  const [studentDetailsUser, setStudentDetailsUser] = useState<AdminUserItem | null>(null);

  const allLearners = useMemo(() => {
    const combined: AdminUserItem[] = [];
    if (learnerRoleFilter === 'ALL' || learnerRoleFilter === 'STUDENT') {
      combined.push(...students);
    }
    if (learnerRoleFilter === 'ALL' || learnerRoleFilter === 'GUEST') {
      combined.push(...guests);
    }
    return combined.filter((u) => {
      if (learnerStatusFilter !== 'ALL' && u.status !== learnerStatusFilter) return false;
      if (learnerCohortFilter !== 'ALL' && u.cohort_id !== learnerCohortFilter) return false;
      if (learnerTutorFilter !== 'ALL' && u.assigned_tutor_id !== learnerTutorFilter) return false;
      if (!learnerSearch) return true;
      const q = learnerSearch.toLowerCase();
      return (
        u.phone_number?.toLowerCase().includes(q) ||
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.student_id?.toLowerCase().includes(q)
      );
    });
  }, [students, guests, learnerRoleFilter, learnerStatusFilter, learnerCohortFilter, learnerTutorFilter, learnerSearch]);

  const handleToggleStudentStatus = async (learner: AdminUserItem) => {
    const nextStatus = learner.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminService.updateUserStatus(learner.id, nextStatus, 'Updated via LMS Studio');
      success(`Updated status for ${learner.full_name || learner.phone_number} to ${nextStatus}.`);
      refetch();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update account status.');
    }
  };

  const handlePromoteGuestToStudent = async (learner: AdminUserItem) => {
    try {
      await adminService.updateUserRole(learner.id, 'STUDENT');
      success(`Promoted ${learner.full_name || learner.phone_number} to Student.`);
      refetch();
    } catch (err: any) {
      toastError(err?.message || 'Failed to promote to student.');
    }
  };

  const handleOpenChangeCohort = (learner: AdminUserItem) => {
    setSelectedLearnerForCohort(learner);
  };

  const handleOpenStudentTutorModal = (learner: AdminUserItem) => {
    setSelectedLearnerForTutor(learner);
  };

  const handleOpenStudentDetails = (learner: AdminUserItem) => {
    setStudentDetailsUser(learner);
  };

  return (
    <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name, phone, student ID..."
              value={learnerSearch}
              onChange={(e) => setLearnerSearch(e.target.value)}
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

          {/* Role Buttons */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setLearnerRoleFilter('ALL')}
              className={`btn btn-sm ${learnerRoleFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              All ({students.length + guests.length})
            </button>
            <button
              onClick={() => setLearnerRoleFilter('STUDENT')}
              className={`btn btn-sm ${learnerRoleFilter === 'STUDENT' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              Students ({students.length})
            </button>
            <button
              onClick={() => setLearnerRoleFilter('GUEST')}
              className={`btn btn-sm ${learnerRoleFilter === 'GUEST' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              Guests ({guests.length})
            </button>
          </div>

          {/* Filter by Cohort */}
          <select
            value={learnerCohortFilter}
            onChange={(e) => setLearnerCohortFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '0.80rem',
            }}
          >
            <option value="ALL">All Cohorts</option>
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code || 'COHORT'})
              </option>
            ))}
          </select>

          {/* Filter by Tutor */}
          <select
            value={learnerTutorFilter}
            onChange={(e) => setLearnerTutorFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '0.80rem',
            }}
          >
            <option value="ALL">All Tutors</option>
            {tutors.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name || t.phone_number}
              </option>
            ))}
          </select>

          {/* Filter by Status */}
          <select
            value={learnerStatusFilter}
            onChange={(e) => setLearnerStatusFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '0.80rem',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>
        </div>

        {/* Enroll Student Action */}
        <button
          onClick={() => setIsEnrollStudentModalOpen(true)}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: 'var(--radius-lg)' }}
        >
          <UserPlus size={16} />
          <span>{t('admin.courses.enrollStudent') || 'Enroll Student'}</span>
        </button>
      </div>

      {allLearners.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No learners found matching the search criteria.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>{t('admin.courses.learnerCol') || 'Learner / Student'}</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>{t('admin.courses.phoneCol') || 'Phone'}</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>{t('admin.courses.statusCol') || 'Status'}</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>{t('admin.courses.cohortCol') || 'Assigned Cohort'}</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>{t('admin.courses.tutorCol') || 'Assigned Tutor'}</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>{t('admin.courses.registeredCol') || 'Registered'}</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allLearners.map((lrn) => {
                const initials = (lrn.full_name || lrn.phone_number)
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <tr key={lrn.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {/* Learner Info */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: lrn.role === 'STUDENT' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                            color: lrn.role === 'STUDENT' ? '#38bdf8' : '#a855f7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            flexShrink: 0,
                          }}
                        >
                          {initials || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.90rem' }}>
                            {lrn.full_name || 'Anonymous User'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                            {lrn.student_id ? (
                              <span
                                style={{
                                  fontSize: '0.70rem',
                                  color: 'var(--primary-light)',
                                  background: 'rgba(56, 189, 248, 0.12)',
                                  padding: '1px 6px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontFamily: 'monospace',
                                  fontWeight: 600,
                                }}
                              >
                                {lrn.student_id}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>No Student ID</span>
                            )}
                            {lrn.email && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {lrn.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.84rem' }}>
                      {lrn.phone_number}
                    </td>

                    {/* Role */}
                    <td style={{ padding: '14px 16px' }}>
                      <Badge variant={lrn.role === 'STUDENT' ? 'info' : 'neutral'}>
                        {lrn.role}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '999px',
                          background:
                            lrn.status === 'ACTIVE'
                              ? 'rgba(34, 197, 94, 0.15)'
                              : lrn.status === 'SUSPENDED'
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                          color:
                            lrn.status === 'ACTIVE'
                              ? '#22c55e'
                              : lrn.status === 'SUSPENDED'
                              ? '#f59e0b'
                              : '#ef4444',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background:
                              lrn.status === 'ACTIVE'
                                ? '#22c55e'
                                : lrn.status === 'SUSPENDED'
                                ? '#f59e0b'
                                : '#ef4444',
                          }}
                        />
                        {lrn.status || 'ACTIVE'}
                      </span>
                    </td>

                    {/* Assigned Cohort */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {lrn.cohort_name ? (
                          <span style={{ fontWeight: 600, color: '#38bdf8', fontSize: '0.84rem' }}>
                            {lrn.cohort_name}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.80rem' }}>Unassigned</span>
                        )}
                        <button
                          onClick={() => handleOpenChangeCohort(lrn)}
                          className="btn btn-secondary btn-sm"
                          title={lrn.cohort_name ? 'Change Cohort' : 'Assign Cohort'}
                          style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <ArrowRightLeft size={11} />
                          <span>{lrn.cohort_name ? 'Change' : 'Assign'}</span>
                        </button>
                      </div>
                    </td>

                    {/* Assigned Tutor */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {lrn.assigned_tutor_name ? (
                          <span style={{ fontWeight: 600, color: '#a78bfa', fontSize: '0.84rem' }}>
                            {lrn.assigned_tutor_name}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.80rem' }}>No Tutor</span>
                        )}
                        <button
                          onClick={() => handleOpenStudentTutorModal(lrn)}
                          className="btn btn-secondary btn-sm"
                          title={lrn.assigned_tutor_name ? 'Change Tutor' : 'Assign Tutor'}
                          style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <UserCheck size={11} />
                          <span>{lrn.assigned_tutor_name ? 'Change' : 'Assign'}</span>
                        </button>
                      </div>
                    </td>

                    {/* Registered */}
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.80rem' }}>
                      {lrn.created_at ? lrn.created_at.slice(0, 10) : '—'}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        {/* View Details */}
                        <button
                          onClick={() => handleOpenStudentDetails(lrn)}
                          className="btn btn-secondary btn-sm"
                          title="View Student Profile"
                          style={{ padding: '6px 9px' }}
                        >
                          <Eye size={13} />
                        </button>

                        {/* Promote Guest */}
                        {lrn.role === 'GUEST' && (
                          <button
                            onClick={() => handlePromoteGuestToStudent(lrn)}
                            className="btn btn-secondary btn-sm"
                            title="Promote to Student"
                            style={{ padding: '6px 9px', color: '#38bdf8' }}
                          >
                            <Award size={13} />
                          </button>
                        )}

                        {/* Status Toggle */}
                        <button
                          onClick={() => handleToggleStudentStatus(lrn)}
                          className="btn btn-secondary btn-sm"
                          title={lrn.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                          style={{
                            padding: '6px 9px',
                            color: lrn.status === 'ACTIVE' ? 'var(--text-muted)' : '#22c55e',
                          }}
                        >
                          {lrn.status === 'ACTIVE' ? <PowerOff size={13} /> : <Power size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <ChangeCohortModal
        learner={selectedLearnerForCohort}
        cohorts={cohorts}
        onClose={() => setSelectedLearnerForCohort(null)}
        onSuccess={refetch}
      />

      <StudentTutorModal
        learner={selectedLearnerForTutor}
        tutors={tutors}
        onClose={() => setSelectedLearnerForTutor(null)}
        onSuccess={refetch}
      />

      <EnrollStudentModal
        isOpen={isEnrollStudentModalOpen}
        onClose={() => setIsEnrollStudentModalOpen(false)}
        cohorts={cohorts}
        tutors={tutors}
        onSuccess={refetch}
      />

      <StudentDetailsModal
        learner={studentDetailsUser}
        onClose={() => setStudentDetailsUser(null)}
        onChangeCohort={(learner) => handleOpenChangeCohort(learner)}
        onChangeTutor={(learner) => handleOpenStudentTutorModal(learner)}
      />
    </div>
  );
};

export default LearnersSection;

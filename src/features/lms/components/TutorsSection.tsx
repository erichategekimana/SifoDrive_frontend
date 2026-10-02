import React, { useState, useEffect } from 'react';
import { Plus, Award, BookOpen, Users, GraduationCap } from 'lucide-react';
import type { AdminUserItem, LiveClassAdminItem, CohortItem, CurriculumItem } from '../../../core/services/AdminService';
import { Badge } from '../../../components/common/Badge';
import { ScheduleClassModal } from './tutors/ScheduleClassModal';
import { AssignCurriculaModal } from './tutors/AssignCurriculaModal';
import { AssignCoursesModal } from './tutors/AssignCoursesModal';
import { AssignCohortsModal } from './tutors/AssignCohortsModal';
import { TutorLmsService, type TutorAdminSummary } from '../../../core/services/TutorLmsService';

export interface TutorsSectionProps {
  tutors: AdminUserItem[];
  liveClasses: LiveClassAdminItem[];
  cohorts: CohortItem[];
  curricula?: CurriculumItem[];
  courses?: any[];
  refetch: () => Promise<void>;
}

export const TutorsSection: React.FC<TutorsSectionProps> = ({
  tutors,
  liveClasses,
  cohorts,
  curricula = [],
  courses = [],
  refetch,
}) => {
  const [isScheduleClassModalOpen, setIsScheduleClassModalOpen] = useState<boolean>(false);
  const [tutorSummaries, setTutorSummaries] = useState<TutorAdminSummary[]>([]);
  const [, setIsLoadingSummaries] = useState<boolean>(true);

  // Modals state
  const [selectedTutorForCurricula, setSelectedTutorForCurricula] = useState<TutorAdminSummary | null>(null);
  const [selectedTutorForCourses, setSelectedTutorForCourses] = useState<TutorAdminSummary | null>(null);
  const [selectedTutorForCohorts, setSelectedTutorForCohorts] = useState<TutorAdminSummary | null>(null);

  const fetchTutorSummaries = async () => {
    setIsLoadingSummaries(true);
    try {
      const data = await TutorLmsService.getInstance().getAdminTutors();
      setTutorSummaries(data);
    } catch (err) {
      console.error('Failed to load tutor summaries:', err);
    } finally {
      setIsLoadingSummaries(false);
    }
  };

  useEffect(() => {
    fetchTutorSummaries();
  }, [tutors]);

  const handleRefreshAll = async () => {
    await Promise.all([refetch(), fetchTutorSummaries()]);
  };

  // Merge admin tutors with tutorSummaries
  const displayTutors = tutorSummaries.length > 0 ? tutorSummaries : (tutors as unknown as TutorAdminSummary[]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Facilitator Accreditation & Course Assignment Directory */}
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
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
              Facilitator Accreditation & Course Distribution ({displayTutors.length})
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Accredit curricula and assign courses to certified instructors. Instructors can only be assigned courses belonging to their accredited curricula.
            </p>
          </div>
        </div>

        {displayTutors.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No instructors registered in the system.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Instructor</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Contact</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Accredited Curricula</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Assigned Courses</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Cohorts</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayTutors.map((tut) => {
                  const assignedCurrs = tut.assigned_curricula || [];
                  const assignedCourses = tut.assigned_courses || [];

                  return (
                    <tr key={tut.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{tut.full_name || 'Instructor'}</div>
                        <div style={{ marginTop: '4px' }}>
                          <Badge variant={tut.status === 'ACTIVE' ? 'success' : 'neutral'}>
                            {tut.status || 'ACTIVE'}
                          </Badge>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{tut.phone_number}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{tut.email || '—'}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {assignedCurrs.length === 0 ? (
                          <span style={{ color: '#f87171', fontSize: '0.78rem', fontWeight: 600 }}>
                            ⚠️ None (Pending Accreditation)
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {assignedCurrs.map((c) => (
                              <span
                                key={c.id}
                                style={{
                                  background: 'rgba(0, 85, 165, 0.15)',
                                  color: '#38bdf8',
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.74rem',
                                  fontWeight: 600,
                                }}
                              >
                                {c.code || c.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {assignedCourses.length === 0 ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                            0 Courses assigned
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {assignedCourses.map((c) => (
                              <span
                                key={c.id}
                                style={{
                                  background: 'rgba(5, 135, 40, 0.12)',
                                  color: '#4ade80',
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.74rem',
                                  fontWeight: 600,
                                }}
                              >
                                {c.code || c.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={14} color="#0055A5" />
                          <span>{tut.assigned_cohorts_count || 0} Cohorts</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => setSelectedTutorForCurricula(tut)}
                            className="btn btn-secondary btn-sm"
                            title="Accredit Curricula"
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}
                          >
                            <Award size={14} color="#38bdf8" />
                            <span>Curricula</span>
                          </button>
                          <button
                            onClick={() => setSelectedTutorForCourses(tut)}
                            className="btn btn-secondary btn-sm"
                            title="Assign Courses"
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}
                          >
                            <BookOpen size={14} color="#4ade80" />
                            <span>Courses</span>
                          </button>
                          <button
                            onClick={() => setSelectedTutorForCohorts(tut)}
                            className="btn btn-secondary btn-sm"
                            title="Assign Cohorts"
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}
                          >
                            <GraduationCap size={14} color="#f59e0b" />
                            <span>Cohorts</span>
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
      </div>

      {/* Scheduled Live Classes */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
              Scheduled Live Classes & Cohort Sessions
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Interactive cohort-wide lecture dispatches and live tele-classes
            </p>
          </div>
          <button
            onClick={() => setIsScheduleClassModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} />
            <span>Schedule Class</span>
          </button>
        </div>

        {liveClasses.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No live classes currently scheduled. Click "Schedule Class" to dispatch a session.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Class Title</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Cohort</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Instructor</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Schedule</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Meeting Link</th>
                </tr>
              </thead>
              <tbody>
                {liveClasses.map((cls) => (
                  <tr key={cls.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ffffff' }}>
                      {cls.title}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--primary-light)' }}>
                      {cls.cohort_name || 'Open Class'}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {cls.tutor_name || 'Unassigned'}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {cls.scheduled_at ? cls.scheduled_at.replace('T', ' ').slice(0, 16) : 'TBD'} ({cls.duration_minutes || 60} min)
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge variant={cls.status === 'COMPLETED' ? 'success' : cls.status === 'SCHEDULED' ? 'info' : 'neutral'}>
                        {cls.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {cls.meeting_link || cls.google_meet_url ? (
                        <a
                          href={cls.meeting_link || cls.google_meet_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#38bdf8', textDecoration: 'underline', fontSize: '0.82rem' }}
                        >
                          Google Meet
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ScheduleClassModal
        isOpen={isScheduleClassModalOpen}
        onClose={() => setIsScheduleClassModalOpen(false)}
        cohorts={cohorts}
        tutors={tutors}
        onSuccess={handleRefreshAll}
      />

      <AssignCurriculaModal
        isOpen={!!selectedTutorForCurricula}
        tutor={selectedTutorForCurricula}
        curricula={curricula}
        onClose={() => setSelectedTutorForCurricula(null)}
        onSuccess={handleRefreshAll}
      />

      <AssignCoursesModal
        isOpen={!!selectedTutorForCourses}
        tutor={selectedTutorForCourses}
        courses={courses}
        onClose={() => setSelectedTutorForCourses(null)}
        onSuccess={handleRefreshAll}
      />

      <AssignCohortsModal
        isOpen={!!selectedTutorForCohorts}
        tutor={selectedTutorForCohorts}
        cohorts={cohorts}
        onClose={() => setSelectedTutorForCohorts(null)}
        onSuccess={handleRefreshAll}
      />
    </div>
  );
};

export default TutorsSection;

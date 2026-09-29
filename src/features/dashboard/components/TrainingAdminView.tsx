import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, ExternalLink } from 'lucide-react';
import type { AdminDashboardStats, LiveClassAdminItem, CohortItem } from '../../../core/services/AdminService';
import { useTranslation } from '../../../context/I18nContext';

interface TrainingAdminViewProps {
  stats: AdminDashboardStats;
  courses: any[];
  cohorts: CohortItem[];
  liveClasses: LiveClassAdminItem[];
}

export const TrainingAdminView: React.FC<TrainingAdminViewProps> = ({
  stats,
  courses,
  cohorts,
  liveClasses,
}) => {
  const { t, language } = useTranslation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Functional KPI Metric Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderLeft: '4px solid #0284c7',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {t('admin.dashboard.activeLearners')}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            {stats.enrolled_students}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {t('admin.dashboard.activeLearnersSub')}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderLeft: '4px solid #0284c7',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {t('admin.dashboard.lmsCourses')}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            {courses.length || stats.lms_courses}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {t('admin.dashboard.lmsCoursesSub')}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderLeft: '4px solid #38bdf8',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {t('admin.dashboard.cohorts')}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            {cohorts.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {t('admin.dashboard.cohortsSub')}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderLeft: '4px solid #0284c7',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {t('admin.dashboard.liveSessions')}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            {liveClasses.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {t('admin.dashboard.liveSessionsSub')}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderLeft: '4px solid #f87171',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {t('admin.dashboard.examsReview')}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            {stats.total_graduated_students}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {t('admin.dashboard.examsReviewSub')}
          </div>
        </div>
      </div>

      {/* Canvas LMS 2-Column Functional Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(280px, 1fr)',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Canvas LMS Course Cards & Cohort Tables */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Canvas Course Cards Section */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {t('admin.dashboard.coursesSectionTitle')}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  {t('admin.dashboard.coursesSectionSub')}
                </p>
              </div>
              <Link
                to="/admin/courses"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#0284c7',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{t('admin.dashboard.viewAll')}</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {courses.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                {t('admin.dashboard.noCourses')}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '14px',
                }}
              >
                {courses.map((crs) => (
                  <div
                    key={crs.id}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    {/* Canvas style colored course header */}
                    <div
                      style={{
                        background: '#0284c7',
                        padding: '10px 14px',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                        {crs.code || 'LMS'}
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          background: crs.is_published ? '#10b981' : 'rgba(255, 255, 255, 0.25)',
                          color: '#ffffff',
                        }}
                      >
                        {crs.is_published ? t('admin.dashboard.published') : t('admin.dashboard.draft')}
                      </span>
                    </div>

                    {/* Course Body */}
                    <div style={{ padding: '14px' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                        {language === 'rw' && crs.title_rw ? crs.title_rw : (crs.title || crs.title_en || crs.title_rw)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        {t('admin.dashboard.hours')}: {crs.estimated_hours || 20}h • {t('admin.dashboard.modulesCount')}: {crs.module_count ?? 0}
                      </div>

                      <Link
                        to={`/admin/courses`}
                        className="btn btn-secondary btn-sm"
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '0.78rem',
                          padding: '6px 10px',
                        }}
                      >
                        <BookOpen size={13} />
                        <span>{t('admin.dashboard.courseModules')}</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Cohorts & Tutors Table */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {t('admin.dashboard.activeCohortsTitle')}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  {t('admin.dashboard.activeCohortsSub')}
                </p>
              </div>
              <Link
                to="/admin/schedules"
                style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0284c7', textDecoration: 'none' }}
              >
                {t('admin.dashboard.schedulesLink')}
              </Link>
            </div>

            {cohorts.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                {t('admin.dashboard.noCohorts')}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px 10px', fontWeight: 600 }}>{t('admin.dashboard.cohortHeader')}</th>
                      <th style={{ padding: '8px 10px', fontWeight: 600 }}>{t('admin.dashboard.tutorHeader')}</th>
                      <th style={{ padding: '8px 10px', fontWeight: 600 }}>{t('admin.dashboard.studentsHeader')}</th>
                      <th style={{ padding: '8px 10px', fontWeight: 600 }}>{t('admin.dashboard.statusHeader')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohorts.slice(0, 5).map((co) => (
                      <tr key={co.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {co.name}
                        </td>
                        <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>
                          {co.primary_tutor?.full_name || t('admin.dashboard.unassignedTutor')}
                        </td>
                        <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>
                          {co.student_count ?? 0} {t('admin.dashboard.students').toLowerCase()}
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              color: co.is_active ? '#10b981' : 'var(--text-muted)',
                            }}
                          >
                            {co.is_active ? t('admin.dashboard.activeStatus') : t('admin.dashboard.inactiveStatus')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Canvas LMS "To-Do" & "Coming Up" Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Canvas LMS "To-Do" Widget */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
              {t('admin.dashboard.todoTitle')}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                to="/admin/examinations"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{t('admin.dashboard.todoExamReviewTitle')}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {t('admin.dashboard.todoExamReviewSub')}
                  </div>
                </div>
                <ChevronRight size={15} color="#0284c7" />
              </Link>

              <Link
                to="/admin/courses"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{t('admin.dashboard.todoMaterialsTitle')}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {t('admin.dashboard.todoMaterialsSub')}
                  </div>
                </div>
                <ChevronRight size={15} color="#0284c7" />
              </Link>

              <Link
                to="/admin/live-classes"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{t('admin.dashboard.todoTutorsTitle')}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {t('admin.dashboard.todoTutorsSub')}
                  </div>
                </div>
                <ChevronRight size={15} color="#0284c7" />
              </Link>
            </div>
          </div>

          {/* Canvas LMS "Coming Up" Live Classes Widget */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {t('admin.dashboard.comingUpTitle')}
              </div>
              <Link
                to="/admin/live-classes"
                style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0284c7', textDecoration: 'none' }}
              >
                {t('admin.dashboard.viewAll')}
              </Link>
            </div>

            {liveClasses.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                {t('admin.dashboard.noUpcomingClasses')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {liveClasses.slice(0, 4).map((cls) => (
                  <div
                    key={cls.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {cls.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {cls.tutor_name || t('admin.liveClasses.tutor')} • {cls.cohort_name || t('admin.liveClasses.generalCohort')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {cls.scheduled_at || cls.scheduled_date
                          ? new Date(cls.scheduled_at || cls.scheduled_date || '').toLocaleTimeString(language === 'rw' ? 'rw-RW' : 'en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : t('admin.liveClasses.scheduled')}
                      </span>
                      {cls.meeting_link ? (
                        <a
                          href={cls.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: '#0284c7',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <span>{t('admin.dashboard.joinClass')}</span>
                          <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('admin.dashboard.classDetails')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

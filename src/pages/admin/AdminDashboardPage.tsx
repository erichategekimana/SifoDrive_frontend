import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarCheck2,
  BookOpen,
  GraduationCap,
  Award,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  AdminService,
  type AdminDashboardStats,
  type BookingOrderItem,
  type LiveClassAdminItem,
  type CohortItem,
} from '../../core/services/AdminService';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const isTrainingAdmin = user?.isTrainingAdmin();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<AdminDashboardStats>({
    total_registered_users: 0,
    total_booking_orders: 0,
    enrolled_students: 0,
    total_graduated_students: 0,
    lms_courses: 0,
  });
  const [bookings, setBookings] = useState<BookingOrderItem[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClassAdminItem[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<CohortItem[]>([]);

  const adminService = AdminService.getInstance();

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, bookingsRes, classesRes, coursesRes, cohortsRes] = await Promise.allSettled([
        adminService.getDashboardStats(),
        adminService.getBookingOrders(),
        adminService.getLiveClasses(),
        adminService.getCourses(),
        adminService.getCohorts(),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }

      if (bookingsRes.status === 'fulfilled') {
        setBookings(bookingsRes.value.results.slice(0, 5));
      }

      if (classesRes.status === 'fulfilled') {
        const relevant = classesRes.value
          .filter((c) => c.status === 'IN_PROGRESS' || c.status === 'SCHEDULED')
          .sort((a, b) => {
            if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1;
            if (b.status === 'IN_PROGRESS' && a.status !== 'IN_PROGRESS') return 1;
            const timeA = new Date(a.scheduled_at || a.scheduled_date || '').getTime() || 0;
            const timeB = new Date(b.scheduled_at || b.scheduled_date || '').getTime() || 0;
            return timeA - timeB;
          });
        setLiveClasses(relevant.slice(0, 6));
      }

      if (coursesRes.status === 'fulfilled') {
        setCourses(coursesRes.value || []);
      }

      if (cohortsRes.status === 'fulfilled') {
        setCohorts(cohortsRes.value || []);
      }
    } catch (err) {
      console.error('Failed loading dashboard metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Bar: Canvas LMS institutional style */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
            {isTrainingAdmin ? t('admin.dashboard.title') : t('admin.dashboard.systemTitle')}
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '3px', marginBottom: 0 }}>
            {isTrainingAdmin
              ? t('admin.dashboard.subtitle')
              : t('admin.dashboard.systemSubtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={loadDashboardData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px' }}
            title={t('admin.dashboard.refreshTitle')}
          >
            <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
            <span>{t('admin.dashboard.refresh')}</span>
          </button>
          {isTrainingAdmin && (
            <Link
              to="/admin/courses"
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px', background: '#0284c7' }}
            >
              <BookOpen size={13} />
              <span>{t('admin.dashboard.lmsStudioBtn')}</span>
            </Link>
          )}
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Spinner message="Loading..." />
        </div>
      ) : isTrainingAdmin ? (
        /* ========================================================================= */
        /* CANVAS LMS INSPIRED TRAINING ADMIN VIEW: Simple, Functional, Sifo Colors  */
        /* ========================================================================= */
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
                          {/* Green used strictly for published status */}
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
                            <span>{t('admin.dashboard.openCurriculum')}</span>
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
                              {/* Green strictly for active */}
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
      ) : (
        /* ========================================================================= */
        /* SYSTEM ADMIN VIEW (Full governance, bookings, platform KPIs intact)       */
        /* ========================================================================= */
        <>
          {/* 5 Core Basic Info KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
            }}
          >
            {/* 1. Total Registered Users */}
            <div
              style={{
                background: 'var(--bg-surface)',
                padding: '18px 20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Registered Users
                </span>
                <Users size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {stats.total_registered_users}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                All platform accounts
              </div>
            </div>

            {/* 2. Total Booking Orders */}
            <div
              style={{
                background: 'var(--bg-surface)',
                padding: '18px 20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Booking Orders
                </span>
                <CalendarCheck2 size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {stats.total_booking_orders}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Driving test applications
              </div>
            </div>

            {/* 3. Enrolled Students */}
            <div
              style={{
                background: 'var(--bg-surface)',
                padding: '18px 20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Enrolled Students
                </span>
                <GraduationCap size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {stats.enrolled_students}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Active full students
              </div>
            </div>

            {/* 4. Total Graduated Students */}
            <div
              style={{
                background: 'var(--bg-surface)',
                padding: '18px 20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Graduated Students
                </span>
                <Award size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {stats.total_graduated_students}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Completed & certified
              </div>
            </div>

            {/* 5. LMS Courses */}
            <div
              style={{
                background: 'var(--bg-surface)',
                padding: '18px 20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  LMS Courses
                </span>
                <BookOpen size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {stats.lms_courses}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Curriculum courses
              </div>
            </div>
          </div>

          {/* Ongoing & Scheduled Classes Section */}
          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '22px 24px',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Classes
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
                  Ongoing and scheduled live classes.
                </p>
              </div>

              <Link
                to="/admin/live-classes"
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>Manage Live Classes</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {liveClasses.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                <Clock size={22} style={{ opacity: 0.4, marginBottom: '6px' }} />
                <div>No live classes currently ongoing or scheduled.</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Topic</th>
                      <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Cohort</th>
                      <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Instructor</th>
                      <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Schedule (CAT)</th>
                      <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveClasses.map((cls) => (
                      <tr key={cls.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{cls.title}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{cls.cohort_name || 'General Cohort'}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{cls.tutor_name || 'Assigned Instructor'}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {cls.scheduled_at || cls.scheduled_date
                            ? new Date(cls.scheduled_at || cls.scheduled_date || '').toLocaleString('en-RW', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })
                            : 'Scheduled'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {/* Green strictly for in progress */}
                          <Badge variant={cls.status === 'IN_PROGRESS' ? 'success' : 'info'}>
                            {cls.status === 'IN_PROGRESS' ? 'In Progress' : 'Scheduled'}
                          </Badge>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          {cls.meeting_link ? (
                            <a
                              href={cls.meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '3px 8px' }}
                            >
                              <span>Join Meet</span>
                              <ExternalLink size={12} />
                            </a>
                          ) : (
                            <Link to="/admin/live-classes" style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', textDecoration: 'none' }}>
                              Details
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Booking Applications Section */}
          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '22px 24px',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Recent Booking Applications
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
                  Driving test applications submitted through the concierge.
                </p>
              </div>

              <Link
                to="/admin/bookings"
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>View Full Queue</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No active booking applications in queue.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Applicant</th>
                      <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Category</th>
                      <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>District</th>
                      <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Assigned Agent</th>
                      <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          <div>{b.applicant_name || 'Learner Applicant'}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.applicant_phone}</div>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                          Category {b.category}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{b.district}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <Badge
                            variant={
                              b.status === 'COMPLETED'
                                ? 'success'
                                : b.status === 'PAID' || b.status === 'CODE_GENERATED'
                                ? 'info'
                                : b.status === 'PENDING' || b.status === 'SUBMITTED'
                                ? 'warning'
                                : 'neutral'
                            }
                          >
                            {b.status}
                          </Badge>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                          {b.assigned_agent?.full_name || (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'right' }}>
                          {new Date(b.created_at).toLocaleDateString('en-RW')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

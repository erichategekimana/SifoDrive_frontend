import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket,
  FileText,
  Video,
  CheckCircle2,
  ExternalLink,
  X,
  Award,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';
import { StudentAccountService, type ExamEligibilityDTO, type StudentProfileDTO } from '../../core/services/StudentAccountService';
import { LmsService } from '../../core/services/LmsService';
import { LiveClassService } from '../../core/services/LiveClassService';
import { LiveClass } from '../../core/models/LiveClass';
import { Spinner } from '../../components/common/Spinner';
import { TutorLmsService, type CohortActivityItem } from '../../core/services/TutorLmsService';
import { SupportTicketService, type SupportAnnouncementDTO } from '../../core/services/SupportTicketService';
import { StudentSubmitActivityModal } from '../../features/lms/components/student/StudentSubmitActivityModal';

import { Course } from '../../core/models/Course';

export const StudentCanvasDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [eligibility, setEligibility] = useState<ExamEligibilityDTO | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfileDTO | null>(null);
  const [upcomingClasses, setUpcomingClasses] = useState<LiveClass[]>([]);
  const [publishedCourses, setPublishedCourses] = useState<Course[]>([]);
  const [cohortActivities, setCohortActivities] = useState<CohortActivityItem[]>([]);
  const [announcements, setAnnouncements] = useState<SupportAnnouncementDTO[]>([]);
  const [selectedActivityForSubmit, setSelectedActivityForSubmit] = useState<CohortActivityItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Canvas UI Interactive States
  const [showSummaryCounts, setShowSummaryCounts] = useState(true);
  const [showAllGrades, setShowAllGrades] = useState(true);
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses'>('dashboard');

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [eligData, profData, classesData, coursesData, activitiesData, announcementsData] = await Promise.all([
          StudentAccountService.getInstance().getEligibility(),
          StudentAccountService.getInstance().getProfile(),
          LiveClassService.getInstance().getClasses(),
          LmsService.getInstance().getCourses(),
          TutorLmsService.getInstance().getStudentCohortActivities().catch(() => []),
          SupportTicketService.getInstance().getAnnouncements().catch(() => []),
        ]);
        setEligibility(eligData);
        setStudentProfile(profData);
        setUpcomingClasses(classesData);
        setPublishedCourses(coursesData);
        setCohortActivities(activitiesData || []);
        setAnnouncements(announcementsData || []);
      } catch (err) {
        console.error('Failed to load student canvas dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAll();
  }, []);

  const refreshActivities = async () => {
    try {
      const data = await TutorLmsService.getInstance().getStudentCohortActivities();
      setCohortActivities(data || []);
    } catch (err) {
      console.error('Failed to refresh activities:', err);
    }
  };

  if (isLoading) {
    return <Spinner message={t('dashboard.student.loadingHub')} />;
  }

  const nextClass = upcomingClasses.find((c) => c.isJoinable()) || upcomingClasses[0];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Canvas Top Greeting Header */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '24px 32px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {t('dashboard.student.greeting', { name: user?.fullName || 'Student' })}
            </h1>
            <span
              style={{
                background: 'rgba(0, 85, 165, 0.12)',
                color: '#0055A5',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: '1px solid rgba(0, 85, 165, 0.25)',
              }}
            >
              {studentProfile?.license_category ? `Category ${studentProfile.license_category}` : 'Provisional Theory Candidate'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px', marginBottom: 0 }}>
            {t('dashboard.student.headerSubtitle', {
              id: user?.studentId || 'SIFO-STU-2026-0042',
              streak: studentProfile?.current_streak_days || 5,
            })}
          </p>
        </div>

        {/* View customization trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/courses"
            className="btn btn-primary btn-md"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0055A5', borderColor: '#0055A5' }}
          >
            <Rocket size={18} />
            <span>{t('dashboard.student.startMockExamBtn')}</span>
          </Link>
        </div>
      </div>

      {/* Canvas Top Tabs: Dashboard / Courses */}
      <div style={{ borderBottom: '2px solid var(--border-subtle)', display: 'flex', gap: '28px', paddingLeft: '8px' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 4px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'dashboard' ? '#0055A5' : 'var(--text-secondary)',
            borderBottom: activeTab === 'dashboard' ? '3px solid #0055A5' : '3px solid transparent',
            marginBottom: '-2px',
            transition: 'all var(--transition-fast)',
          }}
        >
          {t('dashboard.student.tabDashboard')}
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 4px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'courses' ? '#0055A5' : 'var(--text-secondary)',
            borderBottom: activeTab === 'courses' ? '3px solid #0055A5' : '3px solid transparent',
            marginBottom: '-2px',
            transition: 'all var(--transition-fast)',
          }}
        >
          {t('dashboard.student.tabCourses')}
        </button>
      </div>

      {/* Two Column Layout: Main Content (Left 70%) & Canvas Sidebar Widgets (Right 30%) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '28px' }}>
        {/* LEFT COLUMN: Course Work, Stats & Assignments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Official Exam Eligibility Tracker (Canvas Grade Weighting Table Style) */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={20} color="#0055A5" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  {t('dashboard.student.eligibilityTitle')}
                </h3>
              </div>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  background: eligibility?.eligible ? 'rgba(5, 135, 40, 0.12)' : 'rgba(209, 56, 56, 0.12)',
                  color: eligibility?.eligible ? '#058728' : '#d13838',
                  border: `1px solid ${eligibility?.eligible ? 'rgba(5, 135, 40, 0.3)' : 'rgba(209, 56, 56, 0.3)'}`,
                }}
              >
                {eligibility?.eligible
                  ? t('dashboard.student.eligible')
                  : t('dashboard.student.pendingCriteria')}
              </span>
            </div>

            {/* Criteria Breakdown Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              {/* Pillar 1: Tuition */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {t('dashboard.student.tuitionPayment')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color={eligibility?.criteria?.tuition_paid ? '#058728' : '#d13838'} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {eligibility?.criteria?.tuition_paid
                      ? t('dashboard.student.paid')
                      : t('dashboard.student.unpaid')}
                  </span>
                </div>
              </div>

              {/* Pillar 2: Live Attendance */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {t('dashboard.student.liveAttendanceRequirement')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2
                    size={16}
                    color={(eligibility?.criteria?.attendance_rate || 0) >= 0.75 ? '#058728' : '#d13838'}
                  />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {Math.round((eligibility?.criteria?.attendance_rate || 0) * 100)}% / 75%
                  </span>
                </div>
              </div>

              {/* Pillar 3: Foundational Modules */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {t('dashboard.student.foundationalModulesRequirement')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2
                    size={16}
                    color={(eligibility?.criteria?.module_completion || 0) >= 1.0 ? '#058728' : '#0055A5'}
                  />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {Math.round((eligibility?.criteria?.module_completion || 0) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Course Work Header with Show Summary Counts Toggle */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '20px',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '14px',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {t('dashboard.student.courseWork')}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Toggle Summary Counts */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={showSummaryCounts}
                    onChange={(e) => setShowSummaryCounts(e.target.checked)}
                    style={{ accentColor: '#058728', width: '16px', height: '16px' }}
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {t('dashboard.student.showSummaryCounts')}
                  </span>
                </label>

                {/* Course Filter Dropdown */}
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="ALL">{t('dashboard.student.allCourses')}</option>
                  <option value="CAT_B">Amategeko y'Umuhanda (Cat B)</option>
                  <option value="SIGNS">Ibyapa byo ku Muhanda (Road Signs)</option>
                </select>
              </div>
            </div>

            {/* 3 Metric Stat Boxes: Due, Missing, Submitted */}
            {showSummaryCounts && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {/* Due (Blue) */}
                <div
                  style={{
                    background: '#e8f3fb',
                    border: '1px solid rgba(0, 85, 165, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0055A5' }}>
                    {t('dashboard.student.due')}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0055A5', marginTop: '4px' }}>
                    {cohortActivities.filter((a) => !a.my_submission).length}
                  </div>
                </div>

                {/* Missing (Red) */}
                <div
                  style={{
                    background: '#fde8e8',
                    border: '1px solid rgba(209, 56, 56, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#d13838' }}>
                    {t('dashboard.student.missing')}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d13838', marginTop: '4px' }}>
                    {cohortActivities.filter((a) => !a.my_submission && a.due_date && new Date(a.due_date) < new Date()).length}
                  </div>
                </div>

                {/* Submitted (Green) */}
                <div
                  style={{
                    background: '#e8f7ec',
                    border: '1px solid rgba(5, 135, 40, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#058728' }}>
                    {t('dashboard.student.submitted')}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#058728', marginTop: '4px' }}>
                    {cohortActivities.filter((a) => !!a.my_submission).length}
                  </div>
                </div>
              </div>
            )}

            {/* Assignments List (Dynamic Real Cohort Activities) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cohortActivities.length === 0 ? (
                <div
                  style={{
                    padding: '36px',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border-subtle)',
                  }}
                >
                  <FileText size={28} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>
                    No cohort activities or practical drills assigned yet
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Tasks, driving drills, and case studies dispatched by your cohort facilitators will appear here.
                  </div>
                </div>
              ) : (
                cohortActivities.map((act) => {
                  const isGraded = act.my_submission?.status === 'GRADED';
                  const isSubmitted = !!act.my_submission;
                  const isOverdue = !isSubmitted && act.due_date && new Date(act.due_date) < new Date();

                  return (
                    <div
                      key={act.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '16px 20px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${isGraded ? 'rgba(5, 135, 40, 0.3)' : isOverdue ? 'rgba(209, 56, 56, 0.3)' : 'var(--border-subtle)'}`,
                        background: 'var(--bg-surface-elevated)',
                        transition: 'background var(--transition-fast)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: 'var(--radius-md)',
                              background:
                                act.activity_type === 'PRACTICAL_DRILL'
                                  ? 'rgba(0, 85, 165, 0.12)'
                                  : act.activity_type === 'CASE_STUDY'
                                  ? 'rgba(124, 58, 237, 0.12)'
                                  : 'rgba(5, 135, 40, 0.12)',
                              color:
                                act.activity_type === 'PRACTICAL_DRILL'
                                  ? '#0055A5'
                                  : act.activity_type === 'CASE_STUDY'
                                  ? '#a855f7'
                                  : '#058728',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {act.activity_type === 'PRACTICAL_DRILL' ? (
                              <Rocket size={18} />
                            ) : act.activity_type === 'CASE_STUDY' ? (
                              <Award size={18} />
                            ) : (
                              <FileText size={18} />
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                              {act.title}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {act.course_title || 'Cohort Course'} • {act.max_score} pts (Pass: {act.pass_score})
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {act.due_date && (
                            <div
                              style={{
                                background: isOverdue ? 'rgba(209, 56, 56, 0.1)' : 'var(--bg-surface)',
                                border: `1px solid ${isOverdue ? 'rgba(209, 56, 56, 0.3)' : 'var(--border-subtle)'}`,
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem',
                                color: isOverdue ? '#ef4444' : 'var(--text-secondary)',
                                fontWeight: isOverdue ? 700 : 500,
                              }}
                            >
                              {isOverdue ? 'Overdue: ' : 'Due: '}
                              {new Date(act.due_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </div>
                          )}

                          {isGraded ? (
                            <span
                              style={{
                                background: 'rgba(5, 135, 40, 0.15)',
                                color: '#4ade80',
                                border: '1px solid rgba(5, 135, 40, 0.3)',
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                              }}
                            >
                              Score: {act.my_submission?.score} / {act.max_score}
                            </span>
                          ) : isSubmitted ? (
                            <span
                              style={{
                                background: 'rgba(0, 85, 165, 0.15)',
                                color: '#38bdf8',
                                border: '1px solid rgba(0, 85, 165, 0.3)',
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                              }}
                            >
                              Submitted (Pending Grade)
                            </span>
                          ) : (
                            <button
                              onClick={() => setSelectedActivityForSubmit(act)}
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                            >
                              Submit Activity
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Instructor Feedback Display if Available */}
                      {act.my_submission?.feedback && (
                        <div
                          style={{
                            marginTop: '4px',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(0, 85, 165, 0.08)',
                            borderLeft: '3px solid #0055A5',
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <strong style={{ color: '#38bdf8' }}>Instructor Feedback: </strong>
                          {act.my_submission.feedback}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom Grid: Course Cards with Grades Badge (Canvas Look) */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                {t('dashboard.student.courseGrades')}
              </h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={showAllGrades}
                  onChange={(e) => setShowAllGrades(e.target.checked)}
                  style={{ accentColor: '#058728', width: '16px', height: '16px' }}
                />
                <span style={{ color: 'var(--text-secondary)' }}>
                  {t('dashboard.student.showAllGrades')}
                </span>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {publishedCourses.map((c, idx) => {
                const gradients = [
                  'linear-gradient(135deg, #0055A5 0%, #0374b5 100%)',
                  'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
                  'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)',
                ];
                const grad = gradients[idx % gradients.length];

                return (
                  <div
                    key={c.id}
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-subtle)',
                      overflow: 'hidden',
                      background: 'var(--bg-surface-elevated)',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        height: '110px',
                        background: grad,
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <span
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(4px)',
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {c.code || 'THEORY'}
                      </span>
                      <div
                        style={{
                          background: '#ffffff',
                          color: '#0055A5',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                      >
                        {c.progressPercentage}%
                      </div>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 700 }}>
                        <Link to={`/courses/${c.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                          {c.title}
                        </Link>
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {c.modulesCount} Modules • {c.estimatedHours || 12}h Theory
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Road Signs Reference Card */}
              <div
                style={{
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                  background: 'var(--bg-surface-elevated)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '110px',
                    background: 'linear-gradient(135deg, #058728 0%, #10b981 100%)',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    {t('dashboard.student.roadSigns')}
                  </span>
                  <div
                    style={{
                      background: '#ffffff',
                      color: '#058728',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    Interactive
                  </div>
                </div>
                <div style={{ padding: '16px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 700 }}>
                    <Link to="/road-signs" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                      {t('dashboard.student.course2Title')}
                    </Link>
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Rwandan Road Signs & Markings Library
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Canvas LMS Sidebar Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 1. Announcements Widget (Ibitangazwa) */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                {t('dashboard.student.announcements')}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {announcements.length} {announcements.length === 1 ? 'Notice' : 'Notices'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {announcements.length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Bell size={28} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.82rem', margin: 0 }}>
                    {t('dashboard.student.noAnnouncements') || 'No announcements yet.'}
                  </p>
                </div>
              ) : (
                announcements.slice(0, 3).map((ann) => (
                  <div
                    key={ann.id}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      borderLeft: '4px solid #0055A5',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: '#0055A5',
                            color: '#ffffff',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {(ann.author_name || ann.author || 'SF').substring(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {ann.author_name || ann.author}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {ann.date || (ann.created_at ? new Date(ann.created_at).toLocaleDateString() : '')}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0055A5' }}>
                      {ann.title}
                    </div>

                    {ann.target_type === 'SINGLE_COHORT' && ann.cohort_name ? (
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#0055A5',
                          backgroundColor: 'rgba(0, 85, 165, 0.08)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          margin: '4px 0',
                        }}
                      >
                        {ann.cohort_name}
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#15803D',
                          backgroundColor: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          margin: '4px 0',
                        }}
                      >
                        all
                      </span>
                    )}

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                      {ann.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. Upcoming Live Class Widget with Instant 1-Click Join */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(0, 85, 165, 0.08) 0%, rgba(3, 116, 181, 0.12) 100%)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(0, 85, 165, 0.3)',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Video size={18} color="#0055A5" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0055A5', textTransform: 'uppercase' }}>
                {t('dashboard.student.upcomingLiveLecture')}
              </span>
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '4px 0 8px 0' }}>
              {nextClass?.title || t('dashboard.student.defaultTopic')}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              {t('dashboard.student.instructorSubtitle', { instructor: 'Aline Uwase', time: '18:00' })}
            </p>
            <a
              href={nextClass?.googleMeetUrl || 'https://meet.google.com/sifo-class-theory'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-md"
              style={{ width: '100%', justifyContent: 'center', background: '#058728', borderColor: '#058728' }}
            >
              <ExternalLink size={16} />
              <span>{t('dashboard.student.joinGoogleMeetBtn')}</span>
            </a>
          </div>

          {/* 3. To Do Widget (Canvas Style with Points & Dismiss X) */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '20px',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 14px 0' }}>
              {t('dashboard.student.toDo')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0055A5' }}>
                    {t('dashboard.student.todoItem1')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    20 pts • Oct 30 at 11:59 PM
                  </div>
                </div>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  title="Dismiss"
                >
                  <X size={15} />
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0055A5' }}>
                    {t('dashboard.student.todoItem2')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Road Signs • Nov 2 at 11:59 PM
                  </div>
                </div>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  title="Dismiss"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Recent Feedback Widget (Ibiheruka Gusuzumwa) */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '20px',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 14px 0' }}>
              {t('dashboard.student.recentFeedback')}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#058728" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {t('dashboard.student.recentFeedbackItem1')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Amategeko y'Umuhanda
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#058728' }}>
                18/20 pts (90%)
              </span>
            </div>
          </div>
        </div>
      </div>

      <StudentSubmitActivityModal
        isOpen={!!selectedActivityForSubmit}
        activity={selectedActivityForSubmit}
        onClose={() => setSelectedActivityForSubmit(null)}
        onSuccess={refreshActivities}
      />
    </div>
  );
};

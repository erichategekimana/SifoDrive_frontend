import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Rocket,
  FileText,
  Video,
  CheckCircle2,
  ExternalLink,
  X,
  Award,
  Bell,
  Calendar,
  Clock,
  FileQuestion,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';
import { StudentAccountService, type ExamEligibilityDTO, type StudentProfileDTO } from '../../core/services/StudentAccountService';
import { LmsService } from '../../core/services/LmsService';
import { LiveClassService, type LiveClassScheduleItem } from '../../core/services/LiveClassService';
import { LiveClass } from '../../core/models/LiveClass';
import { Spinner } from '../../components/common/Spinner';
import { TutorLmsService, type CohortActivityItem } from '../../core/services/TutorLmsService';
import { SupportTicketService, type SupportAnnouncementDTO } from '../../core/services/SupportTicketService';
import { StudentSubmitActivityModal } from '../../features/lms/components/student/StudentSubmitActivityModal';
import { AdminService, type QuizItem } from '../../core/services/AdminService';
import { HttpClient } from '../../core/api/HttpClient';

import { Course } from '../../core/models/Course';

export const StudentCanvasDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [eligibility, setEligibility] = useState<ExamEligibilityDTO | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfileDTO | null>(null);
  const [upcomingClasses, setUpcomingClasses] = useState<LiveClass[]>([]);
  const [schedules, setSchedules] = useState<LiveClassScheduleItem[]>([]);
  const [publishedCourses, setPublishedCourses] = useState<Course[]>([]);
  const [cohortActivities, setCohortActivities] = useState<CohortActivityItem[]>([]);
  const [announcements, setAnnouncements] = useState<SupportAnnouncementDTO[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [dismissedTodoIds, setDismissedTodoIds] = useState<Set<string>>(new Set());
  const [selectedActivityForSubmit, setSelectedActivityForSubmit] = useState<CohortActivityItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const formatDays = (days: number[] | undefined): string => {
    if (!days || days.length === 0) return '';
    return days.map((d) => dayNames[d] ?? d).join(', ');
  };

  const formatTodoDueDate = (dateStr?: string | null, defaultLabel = 'Upcoming'): string => {
    if (!dateStr) return defaultLabel;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const month = d.toLocaleDateString(undefined, { month: 'short' });
      const day = d.getDate();
      const hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      const formattedHours = hours % 12 || 12;
      return `${month} ${day} at ${formattedHours}:${minutes}${ampm}`;
    } catch {
      return dateStr;
    }
  };

  const handleOpenQuizGradeDetails = (q: QuizItem) => {
    const courseId = q.course || publishedCourses[0]?.id || 'all';
    if (courseId && courseId !== 'all') {
      navigate(`/courses/${courseId}?tab=grades&review=${q.id}`);
    } else {
      navigate(`/quiz/${q.id}/review`);
    }
  };

  const handleOpenActivityGradeDetails = (act: CohortActivityItem) => {
    const courseId = (act as any).course || publishedCourses[0]?.id || 'all';
    if (courseId && courseId !== 'all') {
      navigate(`/courses/${courseId}?tab=grades&review=${act.id}&type=activity`);
    } else {
      navigate(`/activity/${act.id}/review`);
    }
  };

  // Canvas UI Interactive States
  const [showSummaryCounts, setShowSummaryCounts] = useState(true);
  const [showAllGrades, setShowAllGrades] = useState(true);
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses'>('dashboard');
  const [attendanceSummary, setAttendanceSummary] = useState<{
    attendance_rate?: number;
    meets_threshold?: boolean;
    present_count?: number;
    late_count?: number;
    absent_count?: number;
    total_classes?: number;
  } | null>(null);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [eligData, profData, classesData, schedulesData, coursesData, activitiesData, announcementsData, quizData, attRes] = await Promise.all([
          StudentAccountService.getInstance().getEligibility(),
          StudentAccountService.getInstance().getProfile(),
          LiveClassService.getInstance().getClasses().catch(() => []),
          LiveClassService.getInstance().getSchedules().catch(() => []),
          LmsService.getInstance().getCourses().catch(() => []),
          TutorLmsService.getInstance().getStudentCohortActivities().catch(() => []),
          SupportTicketService.getInstance().getAnnouncements().catch(() => []),
          AdminService.getInstance().getQuizzes().catch(() => []),
          HttpClient.getInstance().get<any>('/api/v1/live-classes/my-attendance/').catch(() => null),
        ]);
        setEligibility(eligData);
        setStudentProfile(profData);
        setUpcomingClasses(classesData);
        setSchedules(schedulesData);
        setPublishedCourses(coursesData);
        setCohortActivities(activitiesData || []);
        setAnnouncements(announcementsData || []);
        setQuizzes(quizData || []);
        if (attRes) {
          setAttendanceSummary(attRes.data?.summary || attRes.summary || null);
        }
      } catch (err) {
        console.error('Failed to load student canvas dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAll();
  }, []);

  const attendanceRate = Math.round(
    (attendanceSummary?.attendance_rate ?? eligibility?.criteria?.attendance_rate ?? 0.8) * 100
  );
  const meetsAttendanceThreshold =
    attendanceSummary?.meets_threshold ?? (attendanceRate >= 75);

  const averageGrade = useMemo(() => {
    const graded = cohortActivities.filter((a) => a.my_submission?.score !== null && a.my_submission?.score !== undefined);
    if (graded.length === 0) return 92;
    const totalPercentage = graded.reduce((acc, curr) => {
      const max = curr.max_score || 100;
      const score = curr.my_submission?.score || 0;
      return acc + (score / max) * 100;
    }, 0);
    return Math.round(totalPercentage / graded.length);
  }, [cohortActivities]);

  // Compute top 5 upcoming dates prioritizing quizzes, exams, and class activities
  const todoList = useMemo(() => {
    interface DashboardTodoItem {
      id: string;
      title: string;
      points?: number | string;
      dueDate: string;
      rawDateMs: number;
      type: 'quiz' | 'exam' | 'activity' | 'class' | 'discussion' | 'event';
      targetUrl?: string;
      meetUrl?: string;
    }

    const priorityItems: DashboardTodoItem[] = [];
    const secondaryItems: DashboardTodoItem[] = [];
    const seenIds = new Set<string>();

    // 1. Quizzes & Exams from AdminService
    if (quizzes && quizzes.length > 0) {
      for (const q of quizzes) {
        if (!q.is_published || q.status === 'DRAFT') continue;
        if (seenIds.has(q.id) || dismissedTodoIds.has(q.id)) continue;
        seenIds.add(q.id);
        const isExam = q.is_final_exam || q.title?.toLowerCase().includes('exam');
        const dueDateStr = q.deadline || q.closing_date || q.open_date;
        const rawMs = dueDateStr ? new Date(dueDateStr).getTime() : Number.MAX_SAFE_INTEGER;
        priorityItems.push({
          id: q.id,
          title: q.title,
          points: q.total_score || q.calculated_total_points || 20,
          dueDate: formatTodoDueDate(dueDateStr),
          rawDateMs: isNaN(rawMs) ? Number.MAX_SAFE_INTEGER : rawMs,
          type: isExam ? 'exam' : 'quiz',
          targetUrl: `/quiz/${q.id}`,
        });
      }
    }

    // 2. Class activities / Cohort activities (TutorLmsService)
    if (cohortActivities && cohortActivities.length > 0) {
      for (const act of cohortActivities) {
        if (seenIds.has(act.id) || dismissedTodoIds.has(act.id)) continue;
        seenIds.add(act.id);
        const rawMs = act.due_date ? new Date(act.due_date).getTime() : Number.MAX_SAFE_INTEGER;
        const actType = act.activity_type?.toUpperCase();

        if (actType === 'QUIZ' || actType === 'EXAM' || actType === 'ASSIGNMENT' || actType === 'ACTIVITY') {
          priorityItems.push({
            id: act.id,
            title: act.title,
            points: act.max_score,
            dueDate: formatTodoDueDate(act.due_date),
            rawDateMs: isNaN(rawMs) ? Number.MAX_SAFE_INTEGER : rawMs,
            type: actType === 'EXAM' ? 'exam' : actType === 'QUIZ' ? 'quiz' : 'activity',
            targetUrl: '/courses',
          });
        } else if (actType === 'DISCUSSION') {
          secondaryItems.push({
            id: act.id,
            title: act.title,
            points: act.max_score ? `${act.max_score} pts` : undefined,
            dueDate: formatTodoDueDate(act.due_date),
            rawDateMs: isNaN(rawMs) ? Number.MAX_SAFE_INTEGER : rawMs,
            type: 'discussion',
            targetUrl: '/courses',
          });
        } else {
          secondaryItems.push({
            id: act.id,
            title: act.title,
            dueDate: formatTodoDueDate(act.due_date),
            rawDateMs: isNaN(rawMs) ? Number.MAX_SAFE_INTEGER : rawMs,
            type: 'event',
            targetUrl: '/live-classes',
          });
        }
      }
    }

    // 3. Upcoming Live Classes
    if (upcomingClasses && upcomingClasses.length > 0) {
      for (const cls of upcomingClasses) {
        if (seenIds.has(cls.id) || dismissedTodoIds.has(cls.id)) continue;
        seenIds.add(cls.id);
        const timePart = cls.startTime ? cls.startTime.slice(0, 5) : '18:00';
        const rawMs = cls.scheduledDate ? new Date(`${cls.scheduledDate}T${timePart}:00`).getTime() : Number.MAX_SAFE_INTEGER;
        secondaryItems.push({
          id: cls.id,
          title: `Live Class: ${cls.title}`,
          dueDate: `${cls.scheduledDate} • ${cls.getFormattedTimeRange()}`,
          rawDateMs: isNaN(rawMs) ? Number.MAX_SAFE_INTEGER : rawMs,
          type: 'class',
          targetUrl: '/live-classes',
          meetUrl: cls.googleMeetUrl,
        });
      }
    }

    // Sort ascending by upcoming date
    priorityItems.sort((a, b) => a.rawDateMs - b.rawDateMs);
    secondaryItems.sort((a, b) => a.rawDateMs - b.rawDateMs);

    // Prioritization Rule:
    // Top 5 upcoming dates total.
    // Quizzes, exams, or class activities are the priorities.
    // If there are 6 upcoming quizzes, to do list will only be filled with quizzes.
    // If there are only 2 upcoming quizzes, there will still be 3 free slots available for other upcoming dates.
    const MAX_ITEMS = 5;
    const topPriority = priorityItems.slice(0, MAX_ITEMS);
    const freeSlots = MAX_ITEMS - topPriority.length;
    const topSecondary = freeSlots > 0 ? secondaryItems.slice(0, freeSlots) : [];

    return [...topPriority, ...topSecondary];
  }, [quizzes, cohortActivities, upcomingClasses, dismissedTodoIds]);

  const refreshActivities = async () => {
    try {
      const data = await TutorLmsService.getInstance().getStudentCohortActivities();
      setCohortActivities(data || []);
    } catch (err) {
      console.error('Failed to refresh activities:', err);
    }
  };

  const recentGradedItems = useMemo(() => {
    return cohortActivities
      .filter((a) => a.my_submission?.score !== null && a.my_submission?.score !== undefined && (a.grades_published || a.release_grades_immediately))
      .slice(0, 3);
  }, [cohortActivities]);

  if (isLoading) {
    return <Spinner message={t('dashboard.student.loadingHub')} />;
  }

  const activeSchedule = schedules.find((s) => s.is_active) || schedules[0];
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
                              Submitted
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                  {t('dashboard.student.courseGrades')}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Academic progress, module performance, and live class attendance
                </p>
              </div>
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

            {/* Performance & Attendance Quick Summary Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginBottom: '20px',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {/* Average Academic Grade */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 85, 165, 0.12)',
                    color: '#0055A5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Award size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Average Score
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {averageGrade}%
                  </div>
                </div>
              </div>

              {/* Attendance Rate */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: meetsAttendanceThreshold ? 'rgba(5, 135, 40, 0.12)' : 'rgba(209, 56, 56, 0.12)',
                    color: meetsAttendanceThreshold ? '#058728' : '#d13838',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Users size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    {t('dashboard.student.liveAttendance')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: meetsAttendanceThreshold ? '#058728' : '#d13838' }}>
                      {attendanceRate}%
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      (75% Target)
                    </span>
                  </div>
                </div>
              </div>

              {/* Attendance Gate Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: meetsAttendanceThreshold ? 'rgba(5, 135, 40, 0.12)' : 'rgba(217, 119, 6, 0.12)',
                    color: meetsAttendanceThreshold ? '#058728' : '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Attendance Requirement
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: meetsAttendanceThreshold ? '#058728' : '#D97706' }}>
                    {meetsAttendanceThreshold ? 'Eligible for Mock Exam' : 'Below 75% Requirement'}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Grade Report Table (Attendance + Quizzes + Activities) */}
            {showAllGrades && (
              <div
                style={{
                  marginBottom: '24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                  background: 'var(--bg-surface-elevated)',
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    background: 'rgba(0, 85, 165, 0.04)',
                  }}
                >
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Gradebook Breakdown: Attendance, Quizzes & Cohort Activities
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Minimum requirement: 75% Live Attendance & 88% Exam Pass
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                        <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Component Name</th>
                        <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Type</th>
                        <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Timeline / Due</th>
                        <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Score</th>
                        <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Quizzes */}
                      {quizzes.slice(0, 4).map((q) => {
                        const hasScore = (q as any).my_score !== undefined && (q as any).my_score !== null;
                        const maxScore = q.total_score || (q as any).max_score || 20;
                        return (
                          <tr key={`quiz-${q.id}`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 400, color: '#111827' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenQuizGradeDetails(q)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  margin: 0,
                                  font: 'inherit',
                                  fontSize: 'inherit',
                                  fontWeight: 400,
                                  color: '#111827',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  textDecoration: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  outline: 'none',
                                }}
                                onMouseEnter={(e) => {
                                  const textSpan = e.currentTarget.querySelector('.asg-link-text') as HTMLElement;
                                  if (textSpan) textSpan.style.textDecoration = 'underline';
                                }}
                                onMouseLeave={(e) => {
                                  const textSpan = e.currentTarget.querySelector('.asg-link-text') as HTMLElement;
                                  if (textSpan) textSpan.style.textDecoration = 'none';
                                }}
                                title="Click to view full grading details"
                              >
                                <FileQuestion size={15} color="#111827" />
                                <span className="asg-link-text" style={{ color: '#111827' }}>{q.title}</span>
                              </button>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: 'rgba(0, 85, 165, 0.12)',
                                  color: '#0055A5',
                                }}
                              >
                                QUIZ
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                              {q.deadline || q.closing_date ? formatTodoDueDate(q.deadline || q.closing_date) : 'End of Topic'}
                            </td>
                            <td style={{ padding: '12px 14px', fontWeight: 700, color: hasScore ? '#058728' : 'var(--text-muted)' }}>
                              {hasScore ? `${(q as any).my_score}/${maxScore}` : '-'}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                {hasScore ? 'Completed' : 'Available'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Cohort Activities */}
                      {cohortActivities.map((act) => {
                        const hasScore = act.my_submission?.score !== null && act.my_submission?.score !== undefined;
                        const isGradedAndPublished = hasScore && (act.grades_published || act.release_grades_immediately);

                        return (
                          <tr key={`act-${act.id}`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 400, color: '#111827' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenActivityGradeDetails(act)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  margin: 0,
                                  font: 'inherit',
                                  fontSize: 'inherit',
                                  fontWeight: 400,
                                  color: '#111827',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  textDecoration: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  outline: 'none',
                                }}
                                onMouseEnter={(e) => {
                                  const textSpan = e.currentTarget.querySelector('.asg-link-text') as HTMLElement;
                                  if (textSpan) textSpan.style.textDecoration = 'underline';
                                }}
                                onMouseLeave={(e) => {
                                  const textSpan = e.currentTarget.querySelector('.asg-link-text') as HTMLElement;
                                  if (textSpan) textSpan.style.textDecoration = 'none';
                                }}
                                title="Click to view full grading details"
                              >
                                <Award size={15} color="#111827" />
                                <span className="asg-link-text" style={{ color: '#111827' }}>{act.title}</span>
                              </button>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: 'rgba(124, 58, 237, 0.12)',
                                  color: '#7C3AED',
                                }}
                              >
                                ACTIVITY
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                              {act.due_date ? formatTodoDueDate(act.due_date) : 'Cohort Scheduled'}
                            </td>
                            <td style={{ padding: '12px 14px', fontWeight: 700, color: isGradedAndPublished ? '#058728' : 'var(--text-muted)' }}>
                              {isGradedAndPublished ? `${act.my_submission?.score}/${act.max_score}` : act.my_submission ? 'Submitted' : '-'}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  color: isGradedAndPublished ? '#058728' : act.my_submission ? '#0055A5' : 'var(--text-muted)',
                                }}
                              >
                                {isGradedAndPublished ? 'Graded' : act.my_submission ? 'Under Review' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Attendance (Always the last on the list, kept bold) */}
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#111827' }}>
                          ATTENDANCE
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'var(--bg-surface-elevated)',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            ATTENDANCE
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                          -
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {attendanceRate}%/100%
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {meetsAttendanceThreshold ? 'Met' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr style={{ background: 'var(--bg-surface)', borderTop: '2px solid var(--border-subtle)' }}>
                        <td colSpan={3} style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.92rem', color: '#111827' }}>
                          Average:
                        </td>
                        <td colSpan={2} style={{ padding: '14px 16px', fontWeight: 800, fontSize: '1rem', color: '#058728' }}>
                          {averageGrade}%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

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
                      <div
                        style={{
                          marginTop: '12px',
                          paddingTop: '10px',
                          borderTop: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <Users size={13} color="#0055A5" />
                          <span>Attendance:</span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: attendanceRate >= 75 ? '#058728' : '#d13838',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {attendanceRate}%
                          <CheckCircle2 size={13} color={attendanceRate >= 75 ? '#058728' : '#d13838'} />
                        </span>
                      </div>
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
                  <div
                    style={{
                      marginTop: '12px',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Practical Module
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#058728' }}>
                      Open Access
                    </span>
                  </div>
                </div>
              </div>

              {/* Dedicated Live Class Attendance & Session Record Card */}
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
                    background: 'linear-gradient(135deg, #0055A5 0%, #058728 100%)',
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
                      textTransform: 'uppercase',
                    }}
                  >
                    Attendance
                  </span>
                  <div
                    style={{
                      background: '#ffffff',
                      color: meetsAttendanceThreshold ? '#058728' : '#d13838',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    {attendanceRate}%
                  </div>
                </div>
                <div style={{ padding: '16px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 700 }}>
                    <Link to="/live-classes" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                      {t('dashboard.student.liveAttendance')}
                    </Link>
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Live Classroom & Google Meet Presence Record
                  </p>
                  <div
                    style={{
                      marginTop: '12px',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: meetsAttendanceThreshold ? '#058728' : '#D97706',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <CheckCircle2 size={13} color={meetsAttendanceThreshold ? '#058728' : '#D97706'} />
                      <span>{meetsAttendanceThreshold ? '75% Prerequisite Met' : 'Attendance < 75%'}</span>
                    </span>
                    <Link
                      to="/live-classes"
                      style={{
                        fontSize: '0.74rem',
                        color: '#0055A5',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      View Sessions →
                    </Link>
                  </div>
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
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Video size={18} color="#0055A5" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0055A5', textTransform: 'uppercase' }}>
                  {activeSchedule ? 'Master Class Schedule' : t('dashboard.student.upcomingLiveLecture')}
                </span>
              </div>
              {activeSchedule && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(0, 85, 165, 0.12)',
                    color: '#0055A5',
                  }}
                >
                  {activeSchedule.total_sessions_count} sessions
                </span>
              )}
            </div>

            <h4 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
              {activeSchedule?.title || nextClass?.title || t('dashboard.student.defaultTopic')}
            </h4>

            {activeSchedule ? (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <Clock size={13} style={{ color: '#0055A5' }} />
                  <span>Every {formatDays(activeSchedule.days_of_week)} • {activeSchedule.start_time?.slice(0, 5)} - {activeSchedule.end_time?.slice(0, 5)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={13} />
                  <span>
                    {activeSchedule.start_date} {activeSchedule.end_date ? `to ${activeSchedule.end_date}` : ''}
                    {activeSchedule.period_months ? ` (${activeSchedule.period_months} ${activeSchedule.period_unit || 'months'})` : ''}
                  </span>
                </div>
                {activeSchedule.next_upcoming_session && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#058728', fontWeight: 600 }}>
                    <CheckCircle2 size={13} />
                    <span>Next Class: {activeSchedule.next_upcoming_session.scheduled_date}</span>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0' }}>
                {t('dashboard.student.instructorSubtitle', { instructor: 'Aline Uwase', time: '18:00' })}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <a
                href={activeSchedule?.google_meet_url || nextClass?.googleMeetUrl || 'https://meet.google.com/sifo-class-theory'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-md"
                style={{ width: '100%', justifyContent: 'center', background: '#058728', borderColor: '#058728' }}
              >
                <ExternalLink size={16} />
                <span>{t('dashboard.student.joinGoogleMeetBtn')}</span>
              </a>

              <Link
                to="/live-classes"
                style={{
                  fontSize: '0.78rem',
                  color: '#0055A5',
                  fontWeight: 600,
                  textAlign: 'center',
                  textDecoration: 'none',
                  padding: '4px',
                }}
              >
                View Full Master Schedule & Calendar →
              </Link>
            </div>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                {t('dashboard.student.toDo')}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {todoList.length} items
              </span>
            </div>

            {todoList.length === 0 ? (
              <div
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                  padding: '12px 0',
                  textAlign: 'center',
                }}
              >
                Nothing due right now. You are all caught up!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {todoList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.targetUrl) navigate(item.targetUrl);
                    }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      padding: '4px 0',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.85';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1, minWidth: 0 }}>
                      <div style={{ marginTop: '2px', flexShrink: 0 }}>
                        {item.type === 'quiz' && <FileQuestion size={16} color="#0055A5" />}
                        {item.type === 'exam' && <Award size={16} color="#D9381E" />}
                        {item.type === 'activity' && <CheckCircle2 size={16} color="#058728" />}
                        {item.type === 'class' && <Video size={16} color="#0055A5" />}
                        {item.type === 'discussion' && <Bell size={16} color="#7C3AED" />}
                        {item.type === 'event' && <Calendar size={16} color="#D97706" />}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#0055A5',
                            lineHeight: 1.3,
                            textDecoration: 'underline',
                          }}
                        >
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {item.points !== undefined ? `${item.points} pts • ` : ''}{item.dueDate}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDismissedTodoIds((prev) => new Set([...prev, item.id]));
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: '2px',
                        marginLeft: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Dismiss"
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#D9381E')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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

            {recentGradedItems.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
                No graded feedback published yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentGradedItems.map((act) => (
                  <div key={act.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} color="#058728" />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {act.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {act.my_submission?.feedback || act.course_title || 'Graded Submission'}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#058728' }}>
                      {act.my_submission?.score} / {act.max_score} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
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

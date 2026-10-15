import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Menu,
  BookOpen,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  FileText,
  Lock,
  Award,
  Plus,
  Users,
  ArrowLeft,
  Check,
  Clock,
  Unlock,
  Settings,
  X,
  Trash2,
  Bell,
  Loader2,
  Edit2,
  Presentation,
  Image as ImageIcon,
  PenTool,
  ExternalLink,
  Download,
  AlertTriangle,
  Flag,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Course } from '../../../../core/models/Course';
import { useAuth } from '../../../../context/AuthContext';
import { useTranslation } from '../../../../context/I18nContext';
import { useToast } from '../../../../context/ToastContext';
import { SupportTicketService, type SupportAnnouncementDTO } from '../../../../core/services/SupportTicketService';
import { AdminService, type QuizSubmissionItem } from '../../../../core/services/AdminService';
import {
  TutorLmsService,
  type CohortSelectorItem,
  type CohortModuleItem,
  type CohortActivityItem,
  type CohortStudentItem,
  type StudentActivitySubmissionItem,
} from '../../../../core/services/TutorLmsService';
import { TutorQuizUpdateModal } from '../quiz/TutorQuizUpdateModal';
import { CreateActivityModal } from '../tutor/CreateActivityModal';
import { ReviewSubmissionsModal } from '../tutor/ReviewSubmissionsModal';
import { StudentSubmitActivityModal } from '../student/StudentSubmitActivityModal';
import { StudentQuizRunner } from '../quiz/StudentQuizRunner';
import { PdfViewer } from '../common/PdfViewer';
import { StudentAssessmentReviewView } from '../student/StudentAssessmentReviewView';
import type { CourseGroupDTO } from '../../../../core/services/CourseGroupService';
import { HttpClient } from '../../../../core/api/HttpClient';
import { StudentAccountService } from '../../../../core/services/StudentAccountService';

export interface CourseAssignmentItem {
  id: string;
  title: string;
  points: number;
  timeLimit: string;
  timeLimitMinutes?: number;
  attemptsAllowed: number;
  isLocked: boolean;
  gradesPublished: boolean;
  openDate: string;
  dueDate: string;
  closingDate: string;
  rawOpenDate?: string | null;
  rawDueDate?: string | null;
  rawClosingDate?: string | null;
  allowLateSubmission: boolean;
  isFinalExam: boolean;
  status: string;
  score: string | null;
  type: string;
  instructions: string;
  rubricText?: string;
  rubrics: { criteria: string; points: string }[];
  allowTutorScheduling?: boolean;
  allowTutorEditInstructions?: boolean;
  allowTutorEditDuration?: boolean;
  allowTutorEditAttempts?: boolean;
  submissions: {
    studentId: string;
    studentName?: string;
    studentRollNo?: string;
    category?: string;
    completed: boolean;
    submissionId?: string | null;
    score: string | null;
    submittedAt: string | null;
    isLate: boolean;
    daysLate: number;
    feedback?: string;
    rawSubmission?: any;
  }[];
  isCohortActivity?: boolean;
  activityRaw?: CohortActivityItem;
  quizRaw?: any;
  studentSubmitted?: boolean;
  studentSubmittedAt?: string | null;
  studentFeedback?: string | null;
  releaseGradesImmediately?: boolean;
  isSubmitted?: boolean;
}

export const parseRubrics = (
  rubricStr?: string | null,
  total: number = 20
): { criteria: string; points: string }[] => {
  if (!rubricStr || !rubricStr.trim()) {
    return [
      {
        criteria: 'Knowledge of road signs & ground markings',
        points: `${Math.round(total * 0.4)} pts`,
      },
      {
        criteria: 'Intersections and right-of-way rules (Article 34)',
        points: `${Math.round(total * 0.3)} pts`,
      },
      {
        criteria: 'Defensive driving and general road safety',
        points: `${Math.round(total * 0.3)} pts`,
      },
    ];
  }
  const lines = rubricStr
    .split(/\r?\n|;/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length > 1) {
    return lines.map((line) => {
      const match = line.match(/^(.*?)(?::|\s-\s|\s–\s)?\s*(\d+\s*(?:pts|points|marks)?)$/i);
      if (match) {
        const criteria = match[1].trim() || line;
        const pts = match[2].trim().toLowerCase().includes('pt') ? match[2].trim() : `${match[2].trim()} pts`;
        return { criteria, points: pts };
      }
      return { criteria: line, points: 'Evaluated' };
    });
  }
  return [{ criteria: rubricStr, points: `${total} pts` }];
};

export const formatD = (d?: string | null): string | null => {
  if (!d) return null;
  try {
    const date = new Date(d);
    return (
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' at ' +
      date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    );
  } catch {
    return d;
  }
};

import {
  CourseSecondaryNav,
  type CourseWorkspaceTab,
} from './CourseSecondaryNav';
import { CourseHomeContent } from './CourseHomeContent';
import { CourseRightSidebar } from './CourseRightSidebar';
import { CoursePeopleTab } from './CoursePeopleTab';
import { CourseLiveClassesTab } from './CourseLiveClassesTab';
import { CourseDiscussionsTab } from './CourseDiscussionsTab';
import { LessonViewPage } from '../../../../pages/lms/LessonViewPage';



interface CanvasCourseWorkspaceProps {
  course: Course;
  announcements?: SupportAnnouncementDTO[];
  onBackToCourses: () => void;
  highlightAnnouncementId?: string | null;
}

export const CanvasCourseWorkspace: React.FC<CanvasCourseWorkspaceProps> = ({
  course,
  announcements: initialAnnouncements = [],
  onBackToCourses,
  highlightAnnouncementId,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const isTutor = Boolean(user?.isTutor() || user?.role === 'TRAINING_ADMIN' || user?.role === 'SYSTEM_ADMIN');
  const isTrainingAdmin = Boolean(user?.role === 'TRAINING_ADMIN' || user?.role === 'SYSTEM_ADMIN');
  const isGuest = user?.role === 'GUEST';

  const [activeTab, setActiveTab] = useState<CourseWorkspaceTab>(
    highlightAnnouncementId ? 'announcements' : 'home'
  );
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [courseGroups, setCourseGroups] = useState<CourseGroupDTO[]>([]);

  const { success: showToastSuccess, error: showToastError } = useToast();

  // Announcement Modal State (for Tutors)
  const [showPostAnnouncementModal, setShowPostAnnouncementModal] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementTargetType, setAnnouncementTargetType] = useState<'SINGLE_COHORT' | 'ALL_ASSIGNED_COHORTS'>('ALL_ASSIGNED_COHORTS');
  const [announcementCohortId, setAnnouncementCohortId] = useState<string>('');
  const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [localAnnouncements, setLocalAnnouncements] = useState<SupportAnnouncementDTO[]>(initialAnnouncements);

  const [searchParams, setSearchParams] = useSearchParams();
  const lessonParam = searchParams.get('lesson');
  const assignmentParam = searchParams.get('assignment');
  const viewParam = searchParams.get('view');
  const groupParam = searchParams.get('group');
  const tabParam = searchParams.get('tab') as CourseWorkspaceTab | null;
  const reviewParam = searchParams.get('review');
  const reviewTypeParam = searchParams.get('type');

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(lessonParam);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(assignmentParam);
  const [isGradingView, setIsGradingView] = useState<boolean>(viewParam === 'grading');
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  // Tutor Cohorts & Cohort-specific Material Controls
  const [tutorCohorts, setTutorCohorts] = useState<CohortSelectorItem[]>([]);
  const [activeCohortId, setActiveCohortId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('cohort') || localStorage.getItem('sifo_tutor_active_cohort') || null;
  });
  const [cohortModulesMap, setCohortModulesMap] = useState<Record<string, CohortModuleItem>>({});

  const handleCohortChange = (newCohortId: string) => {
    if (!newCohortId || newCohortId === activeCohortId) return;
    localStorage.setItem('sifo_tutor_active_cohort', newCohortId);
    const params = new URLSearchParams(window.location.search);
    params.set('cohort', newCohortId);
    window.location.search = params.toString();
  };

  const activeCohort = tutorCohorts.find((c) => c.id === activeCohortId) || tutorCohorts[0] || null;
  const activeCohortName = activeCohort ? (activeCohort.name || activeCohort.code || 'Active Cohort') : 'Active Cohort';

  // Cohort Activities state (for Tutors, Training Admins, and Students)
  const [cohortActivities, setCohortActivities] = useState<CohortActivityItem[]>([]);
  const [activitySubmissionsMap, setActivitySubmissionsMap] = useState<Record<string, StudentActivitySubmissionItem[]>>({});
  const [, setLoadingCohortActivities] = useState<boolean>(false);
  const [showCreateActivityModal, setShowCreateActivityModal] = useState<boolean>(false);
  const [editingCohortActivity, setEditingCohortActivity] = useState<CohortActivityItem | null>(null);
  const [reviewSubmissionsActivity, setReviewSubmissionsActivity] = useState<CohortActivityItem | null>(null);
  const [studentSubmitActivity, setStudentSubmitActivity] = useState<CohortActivityItem | null>(null);
  const [togglingLockActivityId, setTogglingLockActivityId] = useState<string | null>(null);
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null);
  const [publishingGradesActivityId, setPublishingGradesActivityId] = useState<string | null>(null);

  const fetchCohortActivities = useCallback(async () => {
    try {
      setLoadingCohortActivities(true);
      if (isTutor) {
        const targetCohort = activeCohortId || (tutorCohorts[0]?.id ?? '');
        if (targetCohort) {
          const data = await TutorLmsService.getInstance().getCohortActivities(targetCohort, course.id);
          const validActs = Array.isArray(data) ? data : [];
          setCohortActivities(validActs);
          if (validActs.length > 0) {
            const subsMap: Record<string, StudentActivitySubmissionItem[]> = {};
            await Promise.all(
              validActs.map(async (act) => {
                try {
                  const subs = await TutorLmsService.getInstance().getActivitySubmissions(targetCohort, act.id);
                  subsMap[act.id] = Array.isArray(subs) ? subs : [];
                } catch {
                  subsMap[act.id] = [];
                }
              })
            );
            setActivitySubmissionsMap(subsMap);
          }
        } else if (isTrainingAdmin) {
          // If training admin without a specific cohort, fetch with course
          const allData = await TutorLmsService.getInstance().getCohortActivities('00000000-0000-0000-0000-000000000000', course.id).catch(() => []);
          setCohortActivities(Array.isArray(allData) ? allData : []);
        }
      } else {
        const data = await TutorLmsService.getInstance().getStudentCohortActivities(undefined, course.id);
        setCohortActivities(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load cohort activities:', err);
    } finally {
      setLoadingCohortActivities(false);
    }
  }, [isTutor, isTrainingAdmin, activeCohortId, tutorCohorts, course.id]);

  useEffect(() => {
    fetchCohortActivities();
  }, [fetchCohortActivities]);

  // Student Live Class Attendance state & metrics
  const [attendanceSummary, setAttendanceSummary] = useState<{
    attendance_rate?: number;
    meets_threshold?: boolean;
    present_count?: number;
    late_count?: number;
    absent_count?: number;
    total_classes?: number;
  } | null>(null);

  useEffect(() => {
    if (isTutor) return;
    let isMounted = true;
    HttpClient.getInstance()
      .get<any>('/api/v1/live-classes/my-attendance/')
      .then((res) => {
        if (!isMounted) return;
        if (res?.data?.summary) setAttendanceSummary(res.data.summary);
        else if (res?.summary) setAttendanceSummary(res.summary);
      })
      .catch(() => {
        StudentAccountService.getInstance()
          .getEligibility()
          .then((elig) => {
            if (!isMounted) return;
            if (elig?.criteria?.attendance_rate !== undefined) {
              setAttendanceSummary({
                attendance_rate: Math.round(elig.criteria.attendance_rate * 100),
                meets_threshold: elig.criteria.attendance_rate >= 0.75,
                total_classes: 10,
                present_count: Math.round(elig.criteria.attendance_rate * 10),
              });
            }
          })
          .catch(() => {});
      });
    return () => {
      isMounted = false;
    };
  }, [isTutor]);

  const studentAttendanceRate = useMemo(() => {
    if (attendanceSummary?.attendance_rate !== undefined) {
      return Math.round(
        attendanceSummary.attendance_rate <= 1
          ? attendanceSummary.attendance_rate * 100
          : attendanceSummary.attendance_rate
      );
    }
    return 80;
  }, [attendanceSummary]);

  const handleToggleActivityLock = async (activity: CohortActivityItem) => {
    const nextLocked = !activity.is_locked;
    setTogglingLockActivityId(activity.id);
    try {
      await TutorLmsService.getInstance().updateCohortActivity(
        activity.cohort || activeCohortId || '',
        activity.id,
        { is_locked: nextLocked }
      );
      showToastSuccess(
        nextLocked
          ? `Activity "${activity.title}" locked (hidden from cohort learners).`
          : `Activity "${activity.title}" unlocked (now visible to cohort learners).`
      );
      await fetchCohortActivities();
    } catch (err: any) {
      showToastError(err?.message || 'Failed to update activity lock status.');
    } finally {
      setTogglingLockActivityId(null);
    }
  };

  const handlePublishGradesDirect = async (activity: CohortActivityItem) => {
    if (activity.open_date) {
      const openDate = new Date(activity.open_date);
      if (!isNaN(openDate.getTime()) && openDate.getTime() > Date.now()) {
        const formatted = openDate.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        showToastError(
          `Cannot publish activity grades before the activity open date (${formatted}). The activity has not opened yet.`
        );
        return;
      }
    }
    if (activity.due_date) {
      const dueDate = new Date(activity.due_date);
      if (!isNaN(dueDate.getTime()) && dueDate.getTime() > Date.now()) {
        const formatted = dueDate.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        showToastError(
          `Cannot publish activity grades before the activity deadline (${formatted}). Students may still be submitting their work.`
        );
        return;
      }
    }
    try {
      setPublishingGradesActivityId(activity.id);
      const targetCohort = activity.cohort || activeCohortId || (tutorCohorts[0]?.id ?? '');
      await TutorLmsService.getInstance().publishActivityGrades(targetCohort, activity.id);
      showToastSuccess(`Grades for "${activity.title}" published successfully to students.`);
      await fetchCohortActivities();
    } catch (err: any) {
      showToastError(err?.message || 'Failed to publish grades.');
    } finally {
      setPublishingGradesActivityId(null);
    }
  };

  const handleDeleteActivity = async (activity: CohortActivityItem) => {
    if (!window.confirm(`Are you sure you want to delete activity "${activity.title}"?`)) {
      return;
    }
    setDeletingActivityId(activity.id);
    try {
      await TutorLmsService.getInstance().deleteCohortActivity(
        activity.cohort || activeCohortId || '',
        activity.id
      );
      showToastSuccess(`Activity "${activity.title}" deleted.`);
      await fetchCohortActivities();
    } catch (err: any) {
      showToastError(err?.message || 'Failed to delete activity.');
    } finally {
      setDeletingActivityId(null);
    }
  };

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoadingAnnouncements(true);
      const data = await SupportTicketService.getInstance().getAnnouncements({
        course_id: course.id,
        cohort_id: isTutor && activeCohortId ? activeCohortId : undefined,
      });
      setLocalAnnouncements(data || []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoadingAnnouncements(false);
    }
  }, [course.id, isTutor, activeCohortId]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  useEffect(() => {
    if (activeCohortId && !announcementCohortId) {
      setAnnouncementCohortId(activeCohortId);
    } else if (tutorCohorts.length > 0 && !announcementCohortId) {
      setAnnouncementCohortId(tutorCohorts[0].id);
    }
  }, [activeCohortId, tutorCohorts, announcementCohortId]);

  const allModules = course.modules || [];
  // Students only see modules released and unlocked by tutor for their cohort
  const modules = isTutor ? allModules : allModules.filter((m) => !m.isLocked);
  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const completedLessons = modules.reduce((sum, m) => sum + (m.completedLessonsCount || 0), 0);
  const courseProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  useEffect(() => {
    if (lessonParam) {
      setSelectedLessonId(lessonParam);
      setActiveTab('modules');
    } else {
      setSelectedLessonId(null);
    }
  }, [lessonParam]);

  useEffect(() => {
    if (assignmentParam) {
      setSelectedAssignmentId(assignmentParam);
      setActiveTab('assignments');
      setIsGradingView(searchParams.get('view') === 'grading');
    } else {
      setSelectedAssignmentId(null);
      setIsGradingView(false);
    }
  }, [assignmentParam, searchParams]);

  useEffect(() => {
    if (groupParam) {
      setActiveGroupId(groupParam);
      setActiveTab('people');
    } else {
      setActiveGroupId(null);
    }
  }, [groupParam]);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const activeLesson = selectedLessonId
    ? modules.flatMap((m) => m.lessons || []).find((l) => l.id === selectedLessonId)
    : null;

  const toggleModule = (modId: string) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const handleOpenLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setActiveTab('modules');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('lesson', lessonId);
      next.delete('assignment');
      return next;
    });
  };

  const handleCloseLesson = () => {
    setSelectedLessonId(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('lesson');
      return next;
    });
  };

  const handleOpenGradeReview = (asg: CourseAssignmentItem) => {
    setActiveTab('grades');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', 'grades');
      next.set('review', asg.id);
      if (asg.isCohortActivity) {
        next.set('type', 'activity');
      } else {
        next.delete('type');
      }
      return next;
    });
  };

  const handleCloseGradeReview = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', 'grades');
      next.delete('review');
      next.delete('type');
      return next;
    });
  };

  const handleOpenAssignment = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setIsGradingView(false);
    setAssignmentFilter('all');
    setActiveTab('assignments');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('assignment', assignmentId);
      next.delete('view');
      next.delete('lesson');
      return next;
    });
  };

  const handleOpenGradingView = () => {
    setIsGradingView(true);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('view', 'grading');
      return next;
    });
  };

  const handleExitGradingView = () => {
    setIsGradingView(false);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('view');
      return next;
    });
  };

  const handleCloseAssignment = () => {
    setSelectedAssignmentId(null);
    setIsGradingView(false);
    setAssignmentFilter('all');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('assignment');
      next.delete('view');
      return next;
    });
  };

  const handleOpenGroup = (groupId: string) => {
    setActiveGroupId(groupId);
    setActiveTab('people');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', 'people');
      next.set('group', groupId);
      return next;
    });
  };

  const handleCloseGroup = () => {
    setActiveGroupId(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('group');
      return next;
    });
  };

  const handleOpenGroupFromSidebar = (groupId: string) => {
    handleOpenGroup(groupId);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;

    try {
      setSubmittingAnnouncement(true);
      const chosenCohortId = announcementTargetType === 'SINGLE_COHORT'
        ? (announcementCohortId || activeCohortId || (tutorCohorts[0]?.id ?? ''))
        : undefined;

      const created = await SupportTicketService.getInstance().createAnnouncement({
        course_id: course.id,
        title: announcementTitle.trim(),
        content: announcementContent.trim(),
        target_type: announcementTargetType,
        cohort_id: chosenCohortId,
      });

      setLocalAnnouncements((prev) => [created, ...prev]);
      setAnnouncementTitle('');
      setAnnouncementContent('');
      setShowPostAnnouncementModal(false);
      showToastSuccess('Announcement posted successfully.');
    } catch (err: any) {
      console.error('Failed to post announcement:', err);
      showToastError(err?.message || 'Failed to post announcement.');
    } finally {
      setSubmittingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await SupportTicketService.getInstance().deleteAnnouncement(id);
      setLocalAnnouncements((prev) => prev.filter((a) => a.id !== id));
      showToastSuccess('Announcement deleted successfully.');
    } catch (err: any) {
      console.error('Failed to delete announcement:', err);
      showToastError(err?.message || 'Failed to delete announcement.');
    }
  };



  // Real cohort students loaded from database
  const [cohortStudents, setCohortStudents] = useState<CohortStudentItem[]>([]);

  useEffect(() => {
    if (!activeCohortId) {
      setCohortStudents([]);
      return;
    }
    let isCancelled = false;
    TutorLmsService.getInstance()
      .getCohortStudents(activeCohortId)
      .then((students) => {
        if (!isCancelled) {
          setCohortStudents(students);
        }
      })
      .catch((err) => {
        console.warn('Failed to load enrolled cohort students:', err);
        if (!isCancelled) setCohortStudents([]);
      });
    return () => {
      isCancelled = true;
    };
  }, [activeCohortId]);

  // Selected assignment for Tutor & Student detailed inspection view (managed via URL & state)
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Quizzes/Assignments with individual student completion details & tutor controls
  const [assignmentsData, setAssignmentsData] = useState<CourseAssignmentItem[]>([]);

  // Unified mixed assignments: Quizzes + Cohort Activities mixed together
  const mixedAssignments = useMemo<CourseAssignmentItem[]>(() => {
    const formatD = (d?: string | null) => {
      if (!d) return null;
      try {
        const date = new Date(d);
        return (
          date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
          ' at ' +
          date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        );
      } catch {
        return d;
      }
    };

    const activityItems: CourseAssignmentItem[] = cohortActivities.map((act) => {
      const isPast = Boolean(act.due_date && new Date(act.due_date) < new Date());
      const isScheduled = Boolean(act.open_date && new Date(act.open_date) > new Date());
      const totalScore = act.max_score || act.total_points || 100;
      const studentSub = act.submission;
      const isGradesPublished = Boolean(
        act.grades_published ||
        act.release_grades_immediately ||
        (act as any).releaseGradesImmediately
      );
      const hasSubmitted = Boolean(studentSub && (studentSub.id || studentSub.status || studentSub.submitted_at));
      const studentScore =
        (isTutor || isGradesPublished) && studentSub && studentSub.score !== null
          ? `${studentSub.score} / ${totalScore}`
          : null;

      const actTypeLabel =
        act.activity_type === 'PRACTICAL_DRILL'
          ? 'Practical Drill'
          : act.activity_type === 'CASE_STUDY'
          ? 'Case Study'
          : act.activity_type === 'ASSIGNMENT'
          ? 'Written Assignment'
          : act.activity_type === 'OBSERVATION'
          ? 'Observation'
          : 'Activity';

      return {
        id: act.id,
        title: act.title,
        points: totalScore,
        timeLimit: 'Self-paced',
        attemptsAllowed: 1,
        isLocked: Boolean(act.is_locked),
        gradesPublished: isGradesPublished,
        openDate: formatD(act.open_date) || 'Open Access',
        dueDate: formatD(act.due_date) || 'No deadline',
        closingDate: formatD(act.due_date) || 'No cutoff',
        rawOpenDate: act.open_date,
        rawDueDate: act.due_date,
        rawClosingDate: act.due_date,
        allowLateSubmission: Boolean(act.allow_late_submissions),
        isFinalExam: false,
        status: isPast ? 'Past' : isScheduled ? 'Scheduled' : 'Open',
        score: studentScore,
        type: actTypeLabel,
        instructions: act.instructions || act.description || 'Complete this cohort activity according to instructions.',
        rubrics: [
          { criteria: 'Completion of required tasks', points: `${Math.round(totalScore * 0.5)} pts` },
          { criteria: 'Technical accuracy & safety standard', points: `${Math.round(totalScore * 0.3)} pts` },
          { criteria: 'Documentation / evidence quality', points: `${Math.round(totalScore * 0.2)} pts` },
        ],
        submissions: (() => {
          const actSubs = activitySubmissionsMap[act.id] || [];
          const mappedSubs = cohortStudents.map((st) => {
            const matchedSub = actSubs.find(
              (s) =>
                String(s.student) === String(st.id) ||
                (s.student_phone && st.phone_number && s.student_phone.replace(/\D/g, '') === st.phone_number.replace(/\D/g, '')) ||
                (s.student_name && st.name && s.student_name.trim().toLowerCase() === st.name.trim().toLowerCase())
            );
            const effectiveSub = matchedSub || (act.submission && String(act.submission.student) === String(st.id) ? act.submission : null);
            const isMatch = Boolean(effectiveSub);
            return {
              studentId: st.id,
              studentName: st.name,
              studentRollNo: st.student_id,
              category: st.category,
              completed: isMatch,
              submissionId: effectiveSub?.id || null,
              score:
                effectiveSub && effectiveSub.score !== null && effectiveSub.score !== undefined
                  ? `${effectiveSub.score} / ${totalScore}`
                  : null,
              submittedAt: effectiveSub && effectiveSub.submitted_at ? formatD(effectiveSub.submitted_at) : null,
              isLate: false,
              daysLate: 0,
              feedback: effectiveSub ? effectiveSub.tutor_feedback || (effectiveSub as any).feedback || '' : '',
              rawSubmission: effectiveSub,
            };
          });

          // Also include any submissions from database for students not yet in cohortStudents list
          const unmappedSubs = actSubs.filter(
            (sub) => !cohortStudents.some((st) => String(st.id) === String(sub.student))
          );
          for (const sub of unmappedSubs) {
            mappedSubs.push({
              studentId: String(sub.student),
              studentName: sub.student_name || 'Enrolled Student',
              studentRollNo: sub.student_phone || `SF-${String(sub.student).slice(0, 8).toUpperCase()}`,
              category: 'Activity Candidate',
              completed: true,
              submissionId: sub.id,
              score: sub.score !== null && sub.score !== undefined ? `${sub.score} / ${totalScore}` : null,
              submittedAt: formatD(sub.submitted_at),
              isLate: false,
              daysLate: 0,
              feedback: sub.tutor_feedback || (sub as any).feedback || '',
              rawSubmission: sub,
            });
          }
          return mappedSubs;
        })(),
        isCohortActivity: true,
        activityRaw: act,
        studentSubmitted: hasSubmitted,
        isSubmitted: hasSubmitted,
        releaseGradesImmediately: Boolean(act.release_grades_immediately),
        studentSubmittedAt: studentSub?.submitted_at || null,
        studentFeedback: (isTutor || isGradesPublished) ? (studentSub?.tutor_feedback || (studentSub as any)?.feedback || null) : null,
      };
    });

    return [...assignmentsData, ...activityItems];
  }, [assignmentsData, cohortActivities, cohortStudents, activitySubmissionsMap]);

  // Visible assignments for the current viewer:
  // - Tutors see all quizzes and activities (including locked ones, so tutor can inspect, manage, and unlock them)
  // - Students from that cohort can NOT see locked quizzes or activities anywhere (completely hidden from assignments & grades)
  const visibleAssignments = isTutor ? mixedAssignments : mixedAssignments.filter((a) => !a.isLocked);

  const fetchQuizzes = useCallback(async () => {
    try {
      const allQuizzes = await AdminService.getInstance().getQuizzes(
        activeCohortId ? { cohort: activeCohortId } : undefined
      );

      // Quizzes specifically targeting this course
      const courseQuizzes = allQuizzes.filter(
        (q) => !q.course || String(q.course) === String(course.id)
      );
      const candidateQuizzes = courseQuizzes;

      // Drafts are strictly for Training Admin and System Admin.
      // Tutors and Students must NOT see drafts.
      // Published quizzes (Open, Scheduled, Closed) are visible and controllable by tutors.
      const targetQuizzes = candidateQuizzes.filter((q) => {
        return q.is_published && q.status !== 'DRAFT';
      });

      if (targetQuizzes.length > 0) {
        // Ensure we have current cohort students
        let currentStudents = cohortStudents;
        if (currentStudents.length === 0 && activeCohortId) {
          try {
            currentStudents = await TutorLmsService.getInstance().getCohortStudents(activeCohortId);
            setCohortStudents(currentStudents);
          } catch {}
        }

        // Fetch cohort quiz schedules map if cohort is active
        let cohortQuizMap: Record<string, any> = {};
        if (activeCohortId) {
          try {
            const cQuizzes = await TutorLmsService.getInstance().getCohortQuizzes(activeCohortId, course.id);
            if (Array.isArray(cQuizzes)) {
              cQuizzes.forEach((cq) => {
                cohortQuizMap[cq.id] = cq;
              });
            }
          } catch {}
        }

        // Fetch real submissions from PostgreSQL for all target quizzes
        const quizSubmissionsMap: Record<string, QuizSubmissionItem[]> = {};
        await Promise.all(
          targetQuizzes.map(async (quiz) => {
            try {
              let subs = await AdminService.getInstance().getQuizSubmissions(
                quiz.id,
                undefined,
                activeCohortId || undefined
              );
              // If cohort filter yielded empty results, fetch all submissions for this quiz to avoid missing students
              if ((!subs || subs.length === 0) && activeCohortId) {
                try {
                  const allSubs = await AdminService.getInstance().getQuizSubmissions(quiz.id);
                  if (allSubs && allSubs.length > 0) {
                    subs = allSubs;
                  }
                } catch {}
              }
              quizSubmissionsMap[quiz.id] = subs || [];
            } catch {
              quizSubmissionsMap[quiz.id] = [];
            }
          })
        );

        const formatD = (d?: string | null) => {
          if (!d) return null;
          try {
            const date = new Date(d);
            return (
              date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
              ' at ' +
              date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            );
          } catch {
            return d;
          }
        };

        const mapped: CourseAssignmentItem[] = targetQuizzes.map((quiz) => {
          const isPast =
            (quiz.deadline && new Date(quiz.deadline) < new Date()) ||
            quiz.status === 'CLOSED';
          const isScheduled =
            quiz.status === 'SCHEDULED' ||
            Boolean(quiz.open_date && new Date(quiz.open_date) > new Date());
          const isOpen = quiz.status === 'OPEN' || (!isPast && !isScheduled && quiz.is_published);
          const totalScore = quiz.total_score || quiz.calculated_total_points || 20;

          const storedLockedCohort = activeCohortId
            ? localStorage.getItem(`sifo_quiz_locked_${activeCohortId}_${quiz.id}`)
            : null;
          const storedLockedGeneral = localStorage.getItem(`sifo_quiz_locked_${quiz.id}`);
          const storedLocked = storedLockedCohort !== null ? storedLockedCohort : storedLockedGeneral;

          const cohortSch = cohortQuizMap[quiz.id];

          let isLocked: boolean;
          if (storedLocked !== null) {
            // Local explicit toggle in current session has top priority
            isLocked = storedLocked === 'true';
          } else if (cohortSch && typeof cohortSch.is_locked === 'boolean') {
            // Cohort schedule from backend
            isLocked = cohortSch.is_locked;
          } else if (typeof quiz.is_locked === 'boolean') {
            // Quiz list serializer value
            isLocked = quiz.is_locked;
          } else {
            // By default, quizzes are locked for cohorts until a tutor unlocks/publishes them
            isLocked = true;
          }

          const dbSubs = quizSubmissionsMap[quiz.id] || [];

          // Map enrolled students to database submissions
          const studentSubmissions = currentStudents.map((st) => {
            const studentSub = dbSubs.find((s) => {
              const sid = typeof s.student === 'object' && s.student !== null ? String((s.student as any).id) : String(s.student || '');
              const stId = String(st.id || '');
              const phoneMatch = Boolean(
                st.phone_number &&
                s.student_phone &&
                String(s.student_phone).replace(/\D/g, '') === String(st.phone_number).replace(/\D/g, '')
              );
              const nameMatch = Boolean(
                s.student_name &&
                st.name &&
                s.student_name.trim().toLowerCase() === st.name.trim().toLowerCase()
              );
              return (
                (sid && stId && sid.toLowerCase() === stId.toLowerCase()) ||
                phoneMatch ||
                nameMatch
              );
            });
            const effectiveSub = studentSub;
            const isCompleted = Boolean(effectiveSub);
            const finalScore =
              effectiveSub && effectiveSub.score !== null && effectiveSub.score !== undefined
                ? `${effectiveSub.score} / ${effectiveSub.total_score || totalScore}`
                : null;

            let mergedRaw: any = effectiveSub ? { ...effectiveSub } : null;
            let displayScore = finalScore;
            let displayFeedback = effectiveSub?.feedback || '';

            return {
              studentId: st.id,
              studentName: st.name,
              studentRollNo: st.student_id,
              category: st.category,
              completed: isCompleted,
              submissionId: effectiveSub?.id || null,
              score: displayScore,
              feedback: displayFeedback,
              submittedAt: effectiveSub?.created_at ? formatD(effectiveSub.created_at) : null,
              isLate: false,
              daysLate: 0,
              rawSubmission: mergedRaw,
            };
          });

          // Also include any submissions that are in the database whose students are not in currentStudents
          const unmappedSubs = dbSubs.filter(
            (sub) => !currentStudents.some((st) => String(st.id) === String(sub.student))
          );
          for (const sub of unmappedSubs) {
            let rawSubObj: any = { ...sub };
            let subScore =
              sub.score !== null && sub.score !== undefined
                ? `${sub.score} / ${sub.total_score || totalScore}`
                : null;
            let subFeedback = sub.feedback || '';

            studentSubmissions.push({
              studentId: String(sub.student),
              studentName: sub.student_name || 'Enrolled Student',
              studentRollNo: sub.student_phone || `SF-${String(sub.student).slice(0, 8).toUpperCase()}`,
              category: 'Assessment Candidate',
              completed: true,
              submissionId: sub.id,
              score: subScore,
              feedback: subFeedback,
              submittedAt: formatD(sub.created_at),
              isLate: false,
              daysLate: 0,
              rawSubmission: rawSubObj,
            });
          }

          // Student personal score (if logged-in user is a student)
          let personalScore: string | null = null;
          let isStudentSubmitted = false;
          const isImmediateRelease = Boolean(
            quiz.release_grades_immediately ||
            (quiz as any).releaseGradesImmediately ||
            cohortQuizMap[quiz.id]?.release_grades_immediately
          );
          const isGradesReleased = Boolean(
            isImmediateRelease ||
            (quiz as any).is_grades_published ||
            quiz.grades_published ||
            cohortQuizMap[quiz.id]?.grades_published ||
            cohortQuizMap[quiz.id]?.is_grades_published
          );
          try {
            const rawUser = localStorage.getItem('sifo_user');
            if (rawUser) {
              const currentUserId = JSON.parse(rawUser).id;
              const mySub = dbSubs.find((s) => String(s.student) === String(currentUserId));
              if (mySub) {
                isStudentSubmitted = true;
                if (isGradesReleased && mySub.score !== null && mySub.score !== undefined) {
                  personalScore = `${mySub.score} / ${mySub.total_score || totalScore}`;
                }
              }
            }
          } catch {}

          return {
            id: quiz.id,
            title: quiz.title,
            points: totalScore,
            timeLimit: `${quiz.time_limit_minutes || 20} Minutes`,
            timeLimitMinutes: quiz.time_limit_minutes || 20,
            attemptsAllowed: quiz.max_attempts || 1,
            isLocked,
            gradesPublished: isGradesReleased,
            releaseGradesImmediately: isImmediateRelease,
            isSubmitted: isStudentSubmitted,
            openDate: formatD(quiz.open_date) || 'Open Access',
            dueDate: formatD(quiz.deadline) || 'No deadline',
            closingDate:
              formatD(quiz.closing_date) || formatD(quiz.deadline) || 'No cutoff',
            rawOpenDate: quiz.open_date,
            rawDueDate: quiz.deadline,
            rawClosingDate: quiz.closing_date,
            allowLateSubmission: Boolean(quiz.allow_late_submission),
            isFinalExam: Boolean(quiz.is_final_exam),
            status: isPast ? 'Past' : isScheduled ? 'Scheduled' : isOpen ? 'Open' : 'Draft',
            score: personalScore,
            type: quiz.is_final_exam ? 'Final Exam' : 'Quiz',
            instructions:
              quiz.description ||
              'Review course guidelines and complete this assessment accurately.',
            rubricText: quiz.rubric || '',
            rubrics: parseRubrics(quiz.rubric, totalScore),
            allowTutorScheduling: quiz.allow_tutor_scheduling,
            allowTutorEditInstructions: quiz.allow_tutor_edit_instructions,
            allowTutorEditDuration: quiz.allow_tutor_edit_duration,
            allowTutorEditAttempts: quiz.allow_tutor_edit_attempts,
            submissions: studentSubmissions,
            quizRaw: quiz,
          };
        });

        setAssignmentsData(mapped);
      } else {
        setAssignmentsData([]);
      }
    } catch (err) {
      console.error('Failed to sync course assignments:', err);
    }
  }, [course.id, activeCohortId, cohortStudents]);

  useEffect(() => {
    fetchQuizzes();

    const handleQuizEvents = () => {
      fetchQuizzes();
    };
    window.addEventListener('sifo_quiz_submitted', handleQuizEvents);
    window.addEventListener('sifo_quiz_graded', handleQuizEvents);
    return () => {
      window.removeEventListener('sifo_quiz_submitted', handleQuizEvents);
      window.removeEventListener('sifo_quiz_graded', handleQuizEvents);
    };
  }, [fetchQuizzes]);

  // Tutor quiz update modal state
  const [updatingAssignment, setUpdatingAssignment] = useState<CourseAssignmentItem | null>(null);

  const handleQuizUpdatedByTutor = (updated: Partial<CourseAssignmentItem>) => {
    if (!updatingAssignment) return;
    setAssignmentsData((prev) =>
      prev.map((item) => {
        if (item.id === updatingAssignment.id) {
          const merged = { ...item, ...updated };
          if (updated.rawOpenDate !== undefined || updated.rawDueDate !== undefined) {
            const isPast = Boolean(merged.rawDueDate && new Date(merged.rawDueDate) < new Date());
            const isScheduled = Boolean(merged.rawOpenDate && new Date(merged.rawOpenDate) > new Date());
            merged.status = isPast ? 'Past' : isScheduled ? 'Scheduled' : 'Open';
            // If open date or due date has not arrived yet, grades cannot be published
            const isOpenPassed = !merged.rawOpenDate || new Date(merged.rawOpenDate) <= new Date();
            const isDuePassed = !merged.rawDueDate || new Date(merged.rawDueDate) <= new Date();
            if (!isOpenPassed || !isDuePassed) {
              merged.gradesPublished = false;
              localStorage.removeItem(`sifo_quiz_grades_published_${item.id}`);
            }
          }
          if (updated.rubricText !== undefined) {
            merged.rubrics = parseRubrics(updated.rubricText, merged.points);
          }
          return merged;
        }
        return item;
      })
    );
    setUpdatingAssignment((prev) => (prev ? { ...prev, ...updated } : null));
  };

  // Fetch tutor's assigned cohorts
  useEffect(() => {
    if (!isTutor) return;
    let isMounted = true;
    const loadCohorts = async () => {
      try {
        const cohorts = await TutorLmsService.getInstance().getTutorCohorts();
        if (!isMounted) return;
        if (Array.isArray(cohorts) && cohorts.length > 0) {
          setTutorCohorts(cohorts);
          const savedCohortId = new URLSearchParams(window.location.search).get('cohort') || localStorage.getItem('sifo_tutor_active_cohort');
          const matchedCohort = cohorts.find((c) => c.id === savedCohortId);
          const finalCohortId = matchedCohort ? matchedCohort.id : cohorts[0].id;
          setActiveCohortId(finalCohortId);
          localStorage.setItem('sifo_tutor_active_cohort', finalCohortId);
        }
      } catch (err) {
        console.error('Failed to load tutor cohorts:', err);
      }
    };
    loadCohorts();
    return () => {
      isMounted = false;
    };
  }, [isTutor]);

  // Sync cohort module release & quiz schedule states for the active cohort
  useEffect(() => {
    if (!isTutor || !activeCohortId || !course.id) return;
    let isMounted = true;
    const syncCohortMaterials = async () => {
      try {
        // 1. Fetch modules release & lock states for active cohort
        const modItems = await TutorLmsService.getInstance().getCohortModules(activeCohortId, course.id);
        if (!isMounted) return;
        if (Array.isArray(modItems)) {
          const map: Record<string, CohortModuleItem> = {};
          modItems.forEach((m) => {
            map[m.id] = m;
          });
          setCohortModulesMap(map);
        }

        // 2. Fetch quiz schedules for active cohort to set lock states per cohort
        const quizItems = await TutorLmsService.getInstance().getCohortQuizzes(activeCohortId, course.id);
        if (!isMounted) return;
        if (Array.isArray(quizItems) && quizItems.length > 0) {
          const lockMap = new Map<string, boolean>();
          quizItems.forEach((q) => {
            lockMap.set(q.id, q.is_locked);
            if (activeCohortId) {
              localStorage.setItem(`sifo_quiz_locked_${activeCohortId}_${q.id}`, String(q.is_locked));
            }
            localStorage.setItem(`sifo_quiz_locked_${q.id}`, String(q.is_locked));
          });
          setAssignmentsData((prev) =>
            prev.map((item) => {
              if (lockMap.has(item.id)) {
                return { ...item, isLocked: lockMap.get(item.id)! };
              }
              return item;
            })
          );
        }
      } catch (err) {
        console.error('Failed to sync materials for active cohort:', err);
      }
    };
    syncCohortMaterials();
    return () => {
      isMounted = false;
    };
  }, [isTutor, activeCohortId, course.id]);

  // Tutor lock/unlock handler for modules for the ACTIVE COHORT ONLY
  const handleToggleModuleLock = async (moduleId: string, nextLocked: boolean) => {
    if (!activeCohortId) return;

    setCohortModulesMap((prev) => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] || {
          id: moduleId,
          title: '',
          order: 0,
          is_default_published: true,
          unlock_date: null,
        }),
        is_locked: nextLocked,
        is_published: !nextLocked,
      },
    }));

    try {
      await TutorLmsService.getInstance().updateCohortModuleRelease(activeCohortId, moduleId, {
        is_locked: nextLocked,
        is_published: !nextLocked,
      });
    } catch (err) {
      console.error('Failed to update cohort module release state:', err);
    }
  };

  const [togglingQuizLockId, setTogglingQuizLockId] = useState<string | null>(null);

  // Tutor lock/unlock handler for quizzes for the ACTIVE COHORT ONLY
  const handleToggleLock = async (assignmentId: string) => {
    const targetItem = assignmentsData.find((item) => item.id === assignmentId);
    if (!targetItem) return;
    const nextLocked = !targetItem.isLocked;

    setTogglingQuizLockId(assignmentId);

    // 1. Immediately update local UI state (optimistic update)
    setAssignmentsData((prev) =>
      prev.map((item) => {
        if (item.id === assignmentId) {
          return { ...item, isLocked: nextLocked };
        }
        return item;
      })
    );

    // 2. Persist to localStorage immediately
    if (activeCohortId) {
      localStorage.setItem(`sifo_quiz_locked_${activeCohortId}_${assignmentId}`, String(nextLocked));
    }
    localStorage.setItem(`sifo_quiz_locked_${assignmentId}`, String(nextLocked));

    // 3. Inform tutor with clear toast
    showToastSuccess(
      nextLocked
        ? `Quiz "${targetItem.title}" locked (hidden from ${activeCohortName} learners).`
        : `Quiz "${targetItem.title}" unlocked (now accessible to ${activeCohortName} learners).`
    );

    // 4. Dispatch event for other components/tabs
    window.dispatchEvent(
      new CustomEvent('sifo_quiz_lock_changed', {
        detail: { assignmentId, isLocked: nextLocked, cohortId: activeCohortId },
      })
    );

    // 5. Sync cohort lock state to backend for active cohort ONLY
    try {
      if (activeCohortId) {
        await TutorLmsService.getInstance().scheduleCohortQuiz(activeCohortId, assignmentId, {
          is_locked: nextLocked,
          is_published: !nextLocked,
        });
      }
    } catch (err: any) {
      console.error('Failed to sync cohort quiz schedule:', err);
      showToastError(err?.message || 'Failed to update quiz lock status on server.');
      // Revert if failed
      setAssignmentsData((prev) =>
        prev.map((item) => (item.id === assignmentId ? { ...item, isLocked: !nextLocked } : item))
      );
      if (activeCohortId) {
        localStorage.setItem(`sifo_quiz_locked_${activeCohortId}_${assignmentId}`, String(!nextLocked));
      }
      localStorage.setItem(`sifo_quiz_locked_${assignmentId}`, String(!nextLocked));
    } finally {
      setTogglingQuizLockId(null);
    }
  };

  // Student taking quiz runner state
  const [takingQuizId, setTakingQuizId] = useState<string | null>(null);

  useEffect(() => {
    const onLockChanged = (e: any) => {
      const detail = e.detail;
      if (detail && detail.assignmentId) {
        setAssignmentsData((prev) =>
          prev.map((item) =>
            item.id === detail.assignmentId ? { ...item, isLocked: detail.isLocked } : item
          )
        );
      }
    };
    window.addEventListener('sifo_quiz_lock_changed', onLockChanged);
    return () => {
      window.removeEventListener('sifo_quiz_lock_changed', onLockChanged);
    };
  }, []);

  // Tutor student grading modal state
  const [gradingStudentModal, setGradingStudentModal] = useState<{
    studentId: string;
    name: string;
    studentRollNo: string;
    category: string;
    score: string;
    feedback: string;
    completed: boolean;
    submissionId?: string | null;
    rawSubmission?: any | null;
  } | null>(null);

  // Tutor publish grades handler - grades CANNOT be published before assignment open date or due date arrives/passes!
  const handlePublishGrades = async (assignmentId: string) => {
    const target = mixedAssignments.find((a) => a.id === assignmentId);
    if (!target) return;
    const isOpenPassed = !target.rawOpenDate || new Date(target.rawOpenDate) <= new Date();
    const isDuePassed = !target.rawDueDate || new Date(target.rawDueDate) <= new Date();
    if (!isOpenPassed) {
      alert(
        `Illogical action prevented: Grades cannot be published before the ${target.isCohortActivity ? 'activity' : 'quiz'} open date (${target.openDate || 'scheduled start'}) has arrived.`
      );
      return;
    }
    if (!isDuePassed) {
      alert(
        `Illogical action prevented: Grades cannot be published before the ${target.isCohortActivity ? 'activity' : 'quiz'} due date (${target.dueDate || 'scheduled deadline'}) has reached.`
      );
      return;
    }
    try {
      if (target.isCohortActivity) {
        if (activeCohortId) {
          await TutorLmsService.getInstance().publishActivityGrades(activeCohortId, assignmentId);
        }
      } else {
        await AdminService.getInstance().publishQuizGrades(assignmentId, activeCohortId || undefined);
      }
    } catch (err) {
      console.warn('Failed to publish grades via API:', err);
    }
    localStorage.setItem(`sifo_quiz_grades_published_${assignmentId}`, 'true');
    setAssignmentsData((prev) =>
      prev.map((item) =>
        item.id === assignmentId ? { ...item, gradesPublished: true } : item
      )
    );
    if (target.isCohortActivity) {
      await fetchCohortActivities();
    } else {
      await fetchQuizzes();
    }
  };

  // Tutor individual student grading handler
  const handleSaveStudentGrade = async (
    assignmentId: string,
    studentId: string,
    score: string,
    feedback: string,
    submissionId?: string | null
  ) => {
    const activeAsg = mixedAssignments.find((a) => a.id === assignmentId);
    const maxPoints = activeAsg?.points || 20;
    const formattedScore = score
      ? score.includes('/')
        ? score
        : `${score} / ${maxPoints}`
      : null;

    const tutorName =
      (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '') ||
      (user as any)?.name ||
      'Tutor';

    const prevSub = activeAsg?.submissions.find((s) => s.studentId === studentId);
    const prevRaw = (prevSub as any)?.rawSubmission || {};
    const autoScoreVal =
      prevRaw.auto_score ??
      (prevSub?.score ? Number(prevSub.score.split('/')[0].trim()) : null);

    // Persist manual grade in localStorage for client caching
    localStorage.setItem(
      `sifo_quiz_manual_grade_${assignmentId}_${studentId}`,
      JSON.stringify({
        score: formattedScore,
        feedback,
        gradedAt: new Date().toISOString(),
        is_grade_overridden: true,
        grade_overridden_by_name: tutorName,
        grade_overridden_at: new Date().toISOString(),
        auto_score: autoScoreVal,
      })
    );

    // Call backend API if submission ID is available
    try {
      let subId = submissionId;
      if (!subId) {
        const rawSub = localStorage.getItem(`sifo_quiz_sub_${assignmentId}_${studentId}`);
        if (rawSub) {
          const parsedSub = JSON.parse(rawSub);
          subId = parsedSub?.id;
        }
      }
      if (subId) {
        const numScore = Number(score.split('/')[0].trim());
        if (!isNaN(numScore)) {
          if (activeAsg?.isCohortActivity && activeCohortId) {
            await TutorLmsService.getInstance().gradeActivitySubmission(
              activeCohortId,
              assignmentId,
              subId,
              { score: numScore, feedback }
            );
          } else {
            await AdminService.getInstance().gradeQuizSubmission(assignmentId, subId, {
              score: numScore,
              feedback,
            });
          }
        }
      }
    } catch (err) {
      console.warn('Backend grade update error:', err);
    }

    setAssignmentsData((prev) =>
      prev.map((asg) => {
        if (asg.id !== assignmentId) return asg;
        const updatedSubmissions = asg.submissions.map((sub) => {
          if (sub.studentId !== studentId) return sub;
          const prevRawSub = (sub as any).rawSubmission || {};
          const numScore = Number(score.split('/')[0].trim());
          const autoScore =
            prevRawSub.auto_score ??
            (sub.score ? Number(sub.score.split('/')[0].trim()) : numScore);
          return {
            ...sub,
            completed: true,
            score: formattedScore,
            feedback,
            submittedAt: sub.submittedAt || 'Today',
            rawSubmission: {
              ...prevRawSub,
              score: numScore,
              auto_score: autoScore,
              is_grade_overridden: true,
              grade_overridden_by_name: tutorName,
              grade_overridden_at: new Date().toISOString(),
              feedback,
            },
          };
        });
        return { ...asg, submissions: updatedSubmissions };
      })
    );
    setGradingStudentModal(null);
    window.dispatchEvent(
      new CustomEvent('sifo_quiz_graded', {
        detail: { quizId: assignmentId, studentId, score: formattedScore, feedback },
      })
    );
    // Sync with database
    if (activeAsg?.isCohortActivity) {
      fetchCohortActivities();
    } else {
      fetchQuizzes();
    }
  };

  // Auto-grade completed submissions shortcut (saves database auto-calculated scores)
  const handleAutoGradeCompleted = async (assignmentId: string) => {
    const target = mixedAssignments.find((a) => a.id === assignmentId);
    if (!target) return;
    for (const sub of target.submissions) {
      if (sub.completed && !sub.score && sub.submissionId) {
        const rawScore = (sub as any).rawSubmission?.auto_score ?? (sub as any).rawSubmission?.score;
        if (rawScore !== null && rawScore !== undefined) {
          try {
            if (target.isCohortActivity && activeCohortId) {
              await TutorLmsService.getInstance().gradeActivitySubmission(
                activeCohortId,
                assignmentId,
                sub.submissionId,
                { score: Number(rawScore), feedback: 'Evaluated according to activity benchmark.' }
              );
            } else {
              await AdminService.getInstance().gradeQuizSubmission(assignmentId, sub.submissionId, {
                score: Number(rawScore),
                feedback: 'Auto-evaluated submission score recorded.',
              });
            }
          } catch (e) {
            console.warn('Failed to auto-grade submission:', e);
          }
        }
      }
    }
    if (target.isCohortActivity) {
      await fetchCohortActivities();
    } else {
      await fetchQuizzes();
    }
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 1. Canvas Top Breadcrumb Bar (edge-to-edge flush with frame) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 32px 12px 24px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #D0D5DD',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => setNavCollapsed(!navCollapsed)}
            className="canvas-btn"
            title="Toggle Course Navigation"
            style={{
              padding: '6px 8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Menu size={20} color="#2D3B45" />
          </button>

          {/* Breadcrumb Trail matching Canvas LMS: Hamburger > Courses > Course_Title > Modules > Lesson_Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.02rem', flexWrap: 'wrap' }}>
            {onBackToCourses && (
              <>
                <button
                  onClick={onBackToCourses}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0055A5',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '1.02rem',
                    padding: 0,
                    textDecoration: 'underline',
                  }}
                >
                  Courses
                </button>
                <ChevronRight size={15} color="#9CA3AF" />
              </>
            )}
            <span
              onClick={() => {
                setActiveTab('home');
                handleCloseLesson();
              }}
              style={{
                color: '#1E293B',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {course.title.replace(/\s+/g, '_')}
            </span>
            {activeTab !== 'home' && (
              <>
                <ChevronRight size={15} color="#9CA3AF" />
                <span
                  onClick={() => {
                    if (activeTab === 'assignments') {
                      handleCloseAssignment();
                    } else if (activeTab === 'modules') {
                      handleCloseLesson();
                    } else if (activeTab === 'people') {
                      handleCloseGroup();
                    } else if (activeTab === 'grades') {
                      handleCloseGradeReview();
                    }
                  }}
                  style={{
                    color: (selectedLessonId || selectedAssignmentId || reviewParam || (activeTab === 'people' && activeGroupId)) ? '#0055A5' : '#2D3B45',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: (selectedLessonId || selectedAssignmentId || reviewParam || (activeTab === 'people' && activeGroupId)) ? 'pointer' : 'default',
                    textDecoration: (selectedLessonId || selectedAssignmentId || reviewParam || (activeTab === 'people' && activeGroupId)) ? 'underline' : 'none',
                  }}
                >
                  {activeTab}
                </span>
              </>
            )}
            {activeTab === 'grades' && reviewParam && (
              <>
                <ChevronRight size={15} color="#9CA3AF" />
                <span style={{ color: '#2D3B45', fontWeight: 600 }}>
                  {visibleAssignments.find((a) => a.id === reviewParam)?.title || assignmentsData.find((a) => a.id === reviewParam)?.title || 'Assessment Review'}
                </span>
              </>
            )}
            {activeTab === 'people' && activeGroupId && (
              <>
                <ChevronRight size={15} color="#9CA3AF" />
                <span style={{ color: '#2D3B45', fontWeight: 600 }}>
                  Group Chat
                </span>
              </>
            )}
            {selectedLessonId && activeLesson && (
              <>
                <ChevronRight size={15} color="#9CA3AF" />
                <span style={{ color: '#2D3B45', fontWeight: 600 }}>
                  {activeLesson.title}
                </span>
              </>
            )}
            {selectedAssignmentId && (
              <>
                <ChevronRight size={15} color="#9CA3AF" />
                <span
                  onClick={() => {
                    if (isGradingView) {
                      handleExitGradingView();
                    }
                  }}
                  style={{
                    color: isGradingView ? '#0055A5' : '#2D3B45',
                    fontWeight: 600,
                    cursor: isGradingView ? 'pointer' : 'default',
                    textDecoration: isGradingView ? 'underline' : 'none',
                  }}
                >
                  {visibleAssignments.find((a) => a.id === selectedAssignmentId)?.title || assignmentsData.find((a) => a.id === selectedAssignmentId)?.title || 'Assessment'}
                </span>
                {isGradingView && isTutor && (
                  <>
                    <ChevronRight size={15} color="#9CA3AF" />
                    <span style={{ color: '#2D3B45', fontWeight: 700 }}>Grading</span>
                  </>
                )}
              </>
            )}
            {reviewSubmissionsActivity && (
              <>
                <ChevronRight size={15} color="#9CA3AF" />
                <span
                  onClick={() => setReviewSubmissionsActivity(null)}
                  style={{
                    color: '#0055A5',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {reviewSubmissionsActivity.title}
                </span>
                <ChevronRight size={15} color="#9CA3AF" />
                <span style={{ color: '#2D3B45', fontWeight: 700 }}>
                  Submissions
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right side of Top Bar: Tutor Cohort Selector */}
        {isTutor && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#F8FAFC',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} color="#0055A5" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                Active Cohort:
              </span>
            </div>
            {tutorCohorts.length > 0 ? (
              <select
                id="tutor-cohort-selector"
                value={activeCohortId || ''}
                onChange={(e) => handleCohortChange(e.target.value)}
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {tutorCohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.code ? `(${c.code})` : ''} — {c.student_count || 0} students
                  </option>
                ))}
              </select>
            ) : (
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>No assigned cohorts</span>
            )}
          </div>
        )}
      </div>

      {/* 2. Main 3-Column Canvas LMS Course Layout (Frame fits 100% width) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '32px',
          width: '100%',
          padding: '24px 32px 48px 24px',
          boxSizing: 'border-box',
          flex: 1,
        }}
      >
        {/* Column 1: Course Secondary Navigation Sidebar */}
        <CourseSecondaryNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'people') {
              handleCloseGroup();
            } else {
              setActiveGroupId(null);
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.delete('group');
                return next;
              });
            }
            if (tab === 'assignments') {
              handleCloseAssignment();
            } else if (tab === 'modules') {
              handleCloseLesson();
            } else if (tab === 'grades') {
              handleCloseGradeReview();
            }
          }}
          gradesCount={!isTutor ? visibleAssignments.length : undefined}
          announcementsCount={localAnnouncements.length}
          isCollapsed={navCollapsed}
          isTutor={Boolean(isTutor)}
        />

        {/* Column 2: Center Main Content Area */}
        <main
          role="main"
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {reviewSubmissionsActivity ? (
            <ReviewSubmissionsModal
              isOpen={true}
              cohortId={reviewSubmissionsActivity.cohort || activeCohortId || ''}
              activity={reviewSubmissionsActivity}
              onClose={() => setReviewSubmissionsActivity(null)}
              onSuccess={fetchCohortActivities}
            />
          ) : (
            <>
              {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <CourseHomeContent
              course={course}
              onNavigateTab={(tab, targetId) => {
                setActiveTab(tab);
                setActiveGroupId(null);
                if (tab === 'modules' && targetId) {
                  setCollapsedModules((prev) => ({ ...prev, [targetId]: false }));
                }
              }}
              onOpenLesson={(lesId) => {
                handleOpenLesson(lesId);
              }}
            />
          )}

          {/* TAB 2: MODULES */}
          {activeTab === 'modules' && (
            selectedLessonId ? (
              <div style={{ width: '100%', padding: '0 0 32px 0' }}>
                <LessonViewPage
                  lessonId={selectedLessonId}
                  courseId={course.id}
                  onBack={handleCloseLesson}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2D3B45', margin: 0 }}>
                      Course Modules & Lessons
                    </h2>
                    <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: '3px 0 0 0' }}>
                      {isTutor
                        ? `Target Cohort: ${activeCohortName} — Release modules one-by-one to this cohort.`
                        : `${completedLessons} of ${totalLessons} lessons completed (${courseProgress}%)`}
                    </p>
                  </div>
                </div>

                {modules.length === 0 ? (
                  <div
                    className="canvas-card"
                    style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#FFFFFF' }}
                  >
                    <BookOpen size={36} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                      No Modules in This Course
                    </h3>
                  </div>
                ) : (
                  modules.map((mod, modIdx) => {
                    const isModuleStudentOnly = mod.isStudentOnly;
                    const isModuleOutside = mod.isOutsideResource;
                    const isModuleCollapsed = !!collapsedModules[mod.id];

                    return (
                      <div
                        key={mod.id}
                        id={`module-${mod.id}`}
                        className="canvas-card"
                        style={{
                          padding: 0,
                          overflow: 'hidden',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          backgroundColor: '#FFFFFF',
                        }}
                      >
                        <div
                          onClick={() => toggleModule(mod.id)}
                          style={{
                            padding: '14px 20px',
                            backgroundColor: '#F8FAFC',
                            borderBottom: isModuleCollapsed ? 'none' : '1px solid #E2E8F0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '10px',
                            cursor: 'pointer',
                            userSelect: 'none',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {isModuleCollapsed ? (
                              <ChevronRight size={18} color="#64748B" />
                            ) : (
                              <ChevronDown size={18} color="#64748B" />
                            )}
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: '#475569',
                                backgroundColor: '#F1F5F9',
                                border: '1px solid #E2E8F0',
                                padding: '2px 8px',
                                borderRadius: '3px',
                              }}
                            >
                              Module {modIdx + 1}
                            </span>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: '0.98rem',
                                color: isModuleOutside ? '#0055A5' : '#1E293B',
                              }}
                            >
                              {mod.title}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {isTutor && activeCohortId && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                              >
                                <span
                                  style={{
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: (cohortModulesMap[mod.id]?.is_locked ?? true) ? '#FEF2F2' : '#F0FDF4',
                                    color: (cohortModulesMap[mod.id]?.is_locked ?? true) ? '#991B1B' : '#166534',
                                    border: (cohortModulesMap[mod.id]?.is_locked ?? true) ? '1px solid #FECACA' : '1px solid #BBF7D0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  {(cohortModulesMap[mod.id]?.is_locked ?? true) ? <Lock size={12} /> : <Unlock size={12} />}
                                  {(cohortModulesMap[mod.id]?.is_locked ?? true) ? `Locked for ${activeCohortName}` : `Released to ${activeCohortName}`}
                                </span>
                                <button
                                  onClick={() => {
                                    const currentlyLocked = cohortModulesMap[mod.id]?.is_locked ?? true;
                                    handleToggleModuleLock(mod.id, !currentlyLocked);
                                  }}
                                  className="canvas-btn"
                                  style={{
                                    fontSize: '0.74rem',
                                    padding: '4px 10px',
                                    fontWeight: 600,
                                    backgroundColor: (cohortModulesMap[mod.id]?.is_locked ?? true) ? '#0055A5' : '#DC2626',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {(cohortModulesMap[mod.id]?.is_locked ?? true) ? 'Unlock' : 'Lock'}
                                </button>
                              </div>
                            )}
                            {!isTutor && (
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>
                                {t('canvasCourses.lessonsCount', { count: mod.lessons?.length || 0 })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Lessons list */}
                        {!isModuleCollapsed && (
                          <div>
                            {(!mod.lessons || mod.lessons.length === 0) ? (
                              <div style={{ padding: '16px 22px', fontSize: '0.82rem', color: '#94A3B8', fontStyle: 'italic' }}>
                                No lessons available in this module yet.
                              </div>
                            ) : (
                              mod.lessons.map((les) => {
                                const isLessonStudentOnly = les.isStudentOnly || isModuleStudentOnly;
                                const isLessonLockedForGuest = isGuest && isLessonStudentOnly && !les.isFreePreview;
                                const isLessonOutside = les.isOutsideResource;

                                return (
                                  <div
                                    key={les.id}
                                    onClick={() => handleOpenLesson(les.id)}
                                    style={{
                                      padding: '14px 20px',
                                      borderBottom: '1px solid #F1F5F9',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      backgroundColor: '#FFFFFF',
                                      cursor: 'pointer',
                                      transition: 'background-color 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                                      <div style={{ flexShrink: 0 }}>
                                        {isLessonLockedForGuest ? (
                                          <Lock size={17} color="#94A3B8" />
                                        ) : (
                                          <FileText size={17} color="#64748B" />
                                        )}
                                      </div>
                                      <div>
                                        <div
                                          style={{
                                            fontSize: '0.88rem',
                                            fontWeight: 600,
                                            color: isLessonOutside ? '#0055A5' : '#1E293B',
                                          }}
                                        >
                                          {les.title}
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                                          {les.getFormattedDuration()}
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      {les.isCompleted ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                                          <CheckCircle size={15} color="#64748B" />
                                          <span>Completed</span>
                                        </span>
                                      ) : (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenLesson(les.id);
                                          }}
                                          className="canvas-btn canvas-btn-primary"
                                          style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                                        >
                                          <span>Start Lesson</span>
                                          <ChevronRight size={13} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )
          )}

          {/* TAB 3: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* If an assignment is selected (for Student OR Tutor) */}
              {selectedAssignmentId ? (
                (() => {
                  const currentAsg = visibleAssignments.find((a) => a.id === selectedAssignmentId);
                  if (!currentAsg) {
                    return (
                      <div
                        style={{
                          padding: '40px 20px',
                          textAlign: 'center',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <Lock size={32} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                          Assessment Unavailable
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '420px', margin: '0 auto 16px auto' }}>
                          This assessment is not visible or has been locked for your cohort by the instructor.
                        </p>
                        <button
                          onClick={() => {
                            setSelectedAssignmentId(null);
                            setAssignmentFilter('all');
                          }}
                          className="canvas-btn"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            fontSize: '0.84rem',
                            backgroundColor: '#FFFFFF',
                            color: '#1E293B',
                            border: '1px solid #CBD5E1',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <ArrowLeft size={14} />
                          <span>Back to Assignments</span>
                        </button>
                      </div>
                    );
                  }

                  const submissionsWithStudent = currentAsg.submissions.map((sub) => {
                    const studentInfo = cohortStudents.find((s) => s.id === sub.studentId);
                    return {
                      ...sub,
                      name: (sub as any).studentName || studentInfo?.name || 'Unknown Student',
                      studentRollNo: (sub as any).studentRollNo || studentInfo?.student_id || studentInfo?.email || 'N/A',
                      category: (sub as any).category || studentInfo?.category || 'Enrolled Student',
                    };
                  });

                  const completedList = submissionsWithStudent.filter((s) => s.completed);
                  const pendingList = submissionsWithStudent.filter((s) => !s.completed);

                  const filteredList =
                    assignmentFilter === 'completed'
                      ? completedList
                      : assignmentFilter === 'pending'
                      ? pendingList
                      : submissionsWithStudent;

                  const completionPercent = Math.round(
                    (completedList.length / (submissionsWithStudent.length || 1)) * 100
                  );

                  // DEDICATED GRADING PAGE (Tutor only)
                  if (isGradingView && isTutor) {
                    const isOpenPassed = !currentAsg.rawOpenDate || new Date(currentAsg.rawOpenDate) <= new Date();
                    const isDuePassed = !currentAsg.rawDueDate || new Date(currentAsg.rawDueDate) <= new Date();
                    const canPublish = isOpenPassed && isDuePassed;
                    const gradedCount = submissionsWithStudent.filter((s) => s.score).length;

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Top Bar: Back Button & Context Header */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px',
                            borderBottom: '1px solid #E2E8F0',
                            paddingBottom: '14px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <button
                              onClick={handleExitGradingView}
                              className="canvas-btn"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 14px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                backgroundColor: '#FFFFFF',
                                color: '#334155',
                                border: '1px solid #CBD5E1',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                              title="Return to Assignment Details"
                            >
                              <ArrowLeft size={14} />
                              <span>Back to Assignment Details</span>
                            </button>

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                                  {currentAsg.title}
                                </h2>
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                                Cohort: <strong style={{ color: '#1E293B' }}>{activeCohortName}</strong> &bull; Due: {currentAsg.dueDate || 'No Due Date'} &bull; Points: {currentAsg.points}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => handleAutoGradeCompleted(currentAsg.id)}
                              className="canvas-btn"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                backgroundColor: '#F8FAFC',
                                color: '#334155',
                                border: '1px solid #CBD5E1',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                              title="Auto-grade all completed submissions without recorded scores"
                            >
                              <CheckCircle size={13} color="#0055A5" />
                              <span>Auto-Grade Completed</span>
                            </button>
                          </div>
                        </div>

                        {/* Assessment Grading & Student Roster */}
                        <div
                          id="assignment-grading-section"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            padding: '20px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                          }}
                        >
                          {/* Section Header */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '12px',
                              paddingBottom: '14px',
                              borderBottom: '2px solid #E2E8F0',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '6px',
                                  backgroundColor: '#EFF6FF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid #BFDBFE',
                                }}
                              >
                                <Award size={18} color="#0055A5" />
                              </div>
                              <div>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                                  Assessment Grading & Student Roster
                                </h3>
                                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0 0' }}>
                                  Grade cohort submissions, review scores, track completion, and release grades once due date has arrived.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Tutor Action Toolbar & Grade Status */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '14px',
                              backgroundColor: '#F8FAFC',
                              padding: '14px 18px',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                              <div>
                                <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
                                  Roster Completion
                                </div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0055A5', marginTop: '1px' }}>
                                  {completedList.length} of {submissionsWithStudent.length} ({completionPercent}%)
                                </div>
                              </div>
                              <div style={{ height: '26px', width: '1px', backgroundColor: '#CBD5E1' }} />
                              <div>
                                <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
                                  Graded Submissions
                                </div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#334155', marginTop: '1px' }}>
                                  {gradedCount} of {submissionsWithStudent.length}
                                </div>
                              </div>
                              <div style={{ height: '26px', width: '1px', backgroundColor: '#CBD5E1' }} />
                              <div>
                                <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
                                  Grade Publishing Status
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    color: currentAsg.gradesPublished ? '#15803D' : !canPublish ? '#B45309' : '#0055A5',
                                    marginTop: '1px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                  }}
                                >
                                  {currentAsg.gradesPublished ? (
                                    <>
                                      <Check size={14} color="#15803D" />
                                      <span>Grades Published to Students</span>
                                    </>
                                  ) : !isOpenPassed ? (
                                    <>
                                      <Lock size={13} color="#B45309" />
                                      <span>Awaiting Open Date ({currentAsg.openDate})</span>
                                    </>
                                  ) : !isDuePassed ? (
                                    <>
                                      <Clock size={13} color="#B45309" />
                                      <span>Awaiting Due Date ({currentAsg.dueDate})</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock size={13} color="#0055A5" />
                                      <span>Dates Passed — Ready to Publish</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {!currentAsg.gradesPublished ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <button
                                    onClick={() => handlePublishGrades(currentAsg.id)}
                                    disabled={!canPublish}
                                    className="canvas-btn"
                                    style={{
                                      padding: '7px 16px',
                                      fontSize: '0.8rem',
                                      fontWeight: 700,
                                      backgroundColor: canPublish ? '#0055A5' : '#94A3B8',
                                      color: '#FFFFFF',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: canPublish ? 'pointer' : 'not-allowed',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      opacity: canPublish ? 1 : 0.75,
                                    }}
                                    title={
                                      canPublish
                                        ? 'Publish grades to all students in this cohort'
                                        : !isOpenPassed
                                        ? `Grades cannot be published until the open date has arrived (${currentAsg.openDate})`
                                        : `Grades cannot be published until the due date has passed (${currentAsg.dueDate})`
                                    }
                                  >
                                    {canPublish ? <Check size={14} /> : <Lock size={14} />}
                                    <span>
                                      {canPublish
                                        ? 'Publish Grades'
                                        : !isOpenPassed
                                        ? 'Grades Locked (Open Date Pending)'
                                        : 'Grades Locked (Due Date Pending)'}
                                    </span>
                                  </button>
                                </div>
                              ) : (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    color: '#15803D',
                                    backgroundColor: '#DCFCE7',
                                    padding: '6px 14px',
                                    borderRadius: '4px',
                                    border: '1px solid #BBF7D0',
                                  }}
                                >
                                  <Check size={14} />
                                  <span>Grades Published to Students</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Filter Tabs */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              borderBottom: '1px solid #E2E8F0',
                              paddingBottom: '8px',
                            }}
                          >
                            <button
                              onClick={() => setAssignmentFilter('all')}
                              style={{
                                padding: '6px 14px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                border: 'none',
                                background: assignmentFilter === 'all' ? '#0055A5' : '#F1F5F9',
                                color: assignmentFilter === 'all' ? '#FFFFFF' : '#475569',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                            >
                              All Students ({submissionsWithStudent.length})
                            </button>
                            <button
                              onClick={() => setAssignmentFilter('completed')}
                              style={{
                                padding: '6px 14px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                border: 'none',
                                background: assignmentFilter === 'completed' ? '#0055A5' : '#F1F5F9',
                                color: assignmentFilter === 'completed' ? '#FFFFFF' : '#475569',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                            >
                              Completed ({completedList.length})
                            </button>
                            <button
                              onClick={() => setAssignmentFilter('pending')}
                              style={{
                                padding: '6px 14px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                border: 'none',
                                background: assignmentFilter === 'pending' ? '#0055A5' : '#F1F5F9',
                                color: assignmentFilter === 'pending' ? '#FFFFFF' : '#475569',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                            >
                              Not Completed ({pendingList.length})
                            </button>
                          </div>

                          {/* Student Submissions Table */}
                          <div className="canvas-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div
                              style={{
                                padding: '12px 18px',
                                backgroundColor: '#F8FAFC',
                                borderBottom: '1px solid #E5E7EB',
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr 1.2fr 1fr 1.2fr 1fr',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                color: '#475569',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                              }}
                            >
                              <div>Student Name</div>
                              <div>Student ID</div>
                              <div>Status</div>
                              <div>Score</div>
                              <div>Submitted Date</div>
                              <div style={{ textAlign: 'right' }}>Grading Action</div>
                            </div>

                            <div>
                              {filteredList.length === 0 ? (
                                <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontSize: '0.86rem' }}>
                                  No students found for this filter.
                                </div>
                              ) : (
                                filteredList.map((st) => (
                                  <div
                                    key={st.studentId}
                                    onClick={() =>
                                      setGradingStudentModal({
                                        studentId: st.studentId,
                                        name: st.name,
                                        studentRollNo: st.studentRollNo,
                                        category: st.category,
                                        score: st.score || '',
                                        feedback: st.feedback || '',
                                        completed: st.completed,
                                        submissionId: (st as any).submissionId,
                                        rawSubmission: (st as any).rawSubmission,
                                      })
                                    }
                                    style={{
                                      padding: '14px 18px',
                                      borderBottom: '1px solid #F1F5F9',
                                      display: 'grid',
                                      gridTemplateColumns: '2fr 1fr 1.2fr 1fr 1.2fr 1fr',
                                      alignItems: 'center',
                                      fontSize: '0.84rem',
                                      backgroundColor: '#FFFFFF',
                                      cursor: 'pointer',
                                      transition: 'background-color 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                                    title={`Click to view submission and grade ${st.name}`}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <div
                                        style={{
                                          width: '28px',
                                          height: '28px',
                                          borderRadius: '50%',
                                          backgroundColor: '#F1F5F9',
                                          color: '#1E293B',
                                          fontWeight: 700,
                                          fontSize: '0.75rem',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          border: '1px solid #CBD5E1',
                                        }}
                                      >
                                        {st.name.charAt(0)}
                                      </div>
                                      <div>
                                        <div style={{ fontWeight: 700, color: '#1E293B' }}>{st.name}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{st.category}</div>
                                      </div>
                                    </div>

                                    <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                      {st.studentRollNo}
                                    </div>

                                    <div>
                                      {st.completed ? (
                                        st.isLate ? (
                                          <span
                                            style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px',
                                              fontSize: '0.74rem',
                                              fontWeight: 700,
                                              color: '#B45309',
                                              backgroundColor: '#FEF3C7',
                                              padding: '3px 8px',
                                              borderRadius: '3px',
                                              border: '1px solid #FDE68A',
                                            }}
                                          >
                                            <Clock size={12} />
                                            <span>Late ({st.daysLate || 1} day{st.daysLate === 1 ? '' : 's'} late)</span>
                                          </span>
                                        ) : (
                                          <span
                                            style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px',
                                              fontSize: '0.74rem',
                                              fontWeight: 700,
                                              color: '#15803D',
                                              backgroundColor: '#F0FDF4',
                                              padding: '3px 8px',
                                              borderRadius: '3px',
                                              border: '1px solid #DCFCE7',
                                            }}
                                          >
                                            <Check size={12} />
                                            <span>Completed</span>
                                          </span>
                                        )
                                      ) : (
                                        <span
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '0.74rem',
                                            fontWeight: 600,
                                            color: '#64748B',
                                            backgroundColor: '#F8FAFC',
                                            padding: '3px 8px',
                                            borderRadius: '3px',
                                            border: '1px solid #E2E8F0',
                                          }}
                                        >
                                          <Clock size={12} />
                                          <span>Not Completed</span>
                                        </span>
                                      )}
                                    </div>

                                    <div>
                                      <div style={{ fontWeight: 700, color: st.completed ? '#0055A5' : '#94A3B8' }}>
                                        {st.score || '—'}
                                      </div>
                                      {Boolean((st as any).rawSubmission?.is_grade_overridden) && (
                                        <div
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '3px',
                                            fontSize: '0.68rem',
                                            fontWeight: 700,
                                            color: '#92400E',
                                            backgroundColor: '#FEF3C7',
                                            border: '1px solid #FDE68A',
                                            padding: '2px 6px',
                                            borderRadius: '3px',
                                            marginTop: '3px',
                                          }}
                                          title={`Original auto score: ${(st as any).rawSubmission?.auto_score ?? 'auto'} pts. Edited by ${(st as any).rawSubmission?.grade_overridden_by_name || 'Tutor'}`}
                                        >
                                          <span>Edited by {(st as any).rawSubmission?.grade_overridden_by_name || 'Tutor'}</span>
                                        </div>
                                      )}
                                    </div>

                                    <div style={{ color: '#64748B', fontSize: '0.78rem' }}>
                                      {st.submittedAt || '—'}
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setGradingStudentModal({
                                            studentId: st.studentId,
                                            name: st.name,
                                            studentRollNo: st.studentRollNo,
                                            category: st.category,
                                            score: st.score || '',
                                            feedback: st.feedback || '',
                                            completed: st.completed,
                                            submissionId: (st as any).submissionId,
                                            rawSubmission: (st as any).rawSubmission,
                                          });
                                        }}
                                        className="canvas-btn"
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '5px',
                                          padding: '5px 12px',
                                          fontSize: '0.75rem',
                                          fontWeight: 600,
                                          backgroundColor: '#FFFFFF',
                                          color: st.completed ? '#0055A5' : '#64748B',
                                          border: `1px solid ${st.completed ? '#0055A5' : '#CBD5E1'}`,
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                        }}
                                        title={st.completed ? `Grade or update score for ${st.name}` : `View submission status for ${st.name}`}
                                      >
                                        {st.completed ? (
                                          <>
                                            <Award size={13} />
                                            <span>{st.score ? 'Edit Grade' : 'Grade'}</span>
                                          </>
                                        ) : (
                                          <>
                                            <Clock size={13} />
                                            <span>Pending</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const isAct = Boolean(currentAsg.isCohortActivity && currentAsg.activityRaw);
                  const actRaw = currentAsg.activityRaw;

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* Top Bar: Context Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px',
                          borderBottom: '1px solid #E2E8F0',
                          paddingBottom: '14px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          {isTutor && (
                            <button
                              type="button"
                              onClick={handleCloseAssignment}
                              className="canvas-btn"
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                backgroundColor: '#FFFFFF',
                                color: '#334155',
                                border: '1px solid #CBD5E1',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <ArrowLeft size={14} />
                              <span>Back to Assignments</span>
                            </button>
                          )}
                          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                            {currentAsg.title}
                          </h2>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: '4px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              backgroundColor: isAct ? '#EFF6FF' : '#F1F5F9',
                              color: isAct ? '#1D4ED8' : '#475569',
                            }}
                          >
                            {currentAsg.type}
                          </span>
                          {isTutor && (
                            <span
                              style={{
                                padding: '3px 10px',
                                borderRadius: '4px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                backgroundColor: currentAsg.isLocked ? '#FEE2E2' : '#DCFCE7',
                                color: currentAsg.isLocked ? '#DC2626' : '#15803D',
                                border: `1px solid ${currentAsg.isLocked ? '#FECACA' : '#BBF7D0'}`,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              {currentAsg.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                              <span>{currentAsg.isLocked ? 'Locked for Cohort' : 'Unlocked for Cohort'}</span>
                            </span>
                          )}
                        </div>

                        {/* Tutor Actions Toolbar */}
                        {isTutor && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isAct && actRaw ? (
                              <>
                                <button
                                  type="button"
                                  disabled={togglingLockActivityId === actRaw.id}
                                  onClick={() => handleToggleActivityLock(actRaw)}
                                  className="canvas-btn"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    fontSize: '0.76rem',
                                    fontWeight: 600,
                                    backgroundColor: currentAsg.isLocked ? '#0055A5' : '#FFFFFF',
                                    color: currentAsg.isLocked ? '#FFFFFF' : '#475569',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                  }}
                                  title={currentAsg.isLocked ? `Unlock for ${activeCohortName}` : `Lock for ${activeCohortName}`}
                                >
                                  {currentAsg.isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                                  <span>{currentAsg.isLocked ? 'Unlock' : 'Lock'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCohortActivity(actRaw);
                                    setShowCreateActivityModal(true);
                                  }}
                                  className="canvas-btn"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 14px',
                                    fontSize: '0.76rem',
                                    fontWeight: 600,
                                    backgroundColor: '#FFFFFF',
                                    color: '#475569',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                  }}
                                  title="Edit Activity"
                                >
                                  <Edit2 size={14} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReviewSubmissionsActivity(actRaw)}
                                  className="canvas-btn"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 14px',
                                    fontSize: '0.76rem',
                                    fontWeight: 600,
                                    backgroundColor: '#0055A5',
                                    color: '#FFFFFF',
                                    border: '1px solid #0055A5',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                  }}
                                  title="Review student submissions and award grades"
                                >
                                  <Users size={14} />
                                  <span>Submissions ({actRaw.submission_count || 0})</span>
                                </button>
                                {actRaw.grades_published ? (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      padding: '6px 12px',
                                      fontSize: '0.76rem',
                                      fontWeight: 700,
                                      backgroundColor: '#DCFCE7',
                                      color: '#15803D',
                                      borderRadius: '4px',
                                      border: '1px solid #BBF7D0',
                                    }}
                                    title="Grades are published and visible to cohort students"
                                  >
                                    <Check size={14} />
                                    <span>Grades Published</span>
                                  </span>
                                ) : actRaw.open_date && new Date(actRaw.open_date).getTime() > Date.now() ? (
                                  <button
                                    type="button"
                                    disabled
                                    className="canvas-btn"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      padding: '6px 12px',
                                      fontSize: '0.76rem',
                                      fontWeight: 600,
                                      backgroundColor: '#F3F4F6',
                                      color: '#9CA3AF',
                                      border: '1px solid #E5E7EB',
                                      borderRadius: '4px',
                                      cursor: 'not-allowed',
                                    }}
                                    title={`Grades cannot be published until the activity has opened (${new Date(actRaw.open_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })})`}
                                  >
                                    <Lock size={13} />
                                    <span>Grades Locked (Open Date Pending)</span>
                                  </button>
                                ) : actRaw.due_date && new Date(actRaw.due_date).getTime() > Date.now() ? (
                                  <button
                                    type="button"
                                    disabled
                                    className="canvas-btn"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      padding: '6px 12px',
                                      fontSize: '0.76rem',
                                      fontWeight: 600,
                                      backgroundColor: '#F3F4F6',
                                      color: '#9CA3AF',
                                      border: '1px solid #E5E7EB',
                                      borderRadius: '4px',
                                      cursor: 'not-allowed',
                                    }}
                                    title={`Grades cannot be published until the activity deadline has passed (${new Date(actRaw.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })})`}
                                  >
                                    <Lock size={13} />
                                    <span>Grades Locked (Due Date Pending)</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={publishingGradesActivityId === actRaw.id}
                                    onClick={() => handlePublishGradesDirect(actRaw)}
                                    className="canvas-btn"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '6px 14px',
                                      fontSize: '0.76rem',
                                      fontWeight: 700,
                                      backgroundColor: '#15803D',
                                      color: '#FFFFFF',
                                      border: '1px solid #15803D',
                                      borderRadius: '4px',
                                      cursor: publishingGradesActivityId === actRaw.id ? 'wait' : 'pointer',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    }}
                                    title="Publish grades to make scores visible to students"
                                  >
                                    {publishingGradesActivityId === actRaw.id ? (
                                      <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                      <Award size={14} />
                                    )}
                                    <span>Publish Grades</span>
                                  </button>
                                )}
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  disabled={togglingQuizLockId === currentAsg.id}
                                  onClick={() => handleToggleLock(currentAsg.id)}
                                  className="canvas-btn"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    fontSize: '0.76rem',
                                    fontWeight: 600,
                                    backgroundColor: currentAsg.isLocked ? '#0055A5' : '#FFFFFF',
                                    color: currentAsg.isLocked ? '#FFFFFF' : '#475569',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    opacity: togglingQuizLockId === currentAsg.id ? 0.7 : 1,
                                  }}
                                  title={currentAsg.isLocked ? `Unlock for ${activeCohortName}` : `Lock for ${activeCohortName}`}
                                >
                                  {togglingQuizLockId === currentAsg.id ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : currentAsg.isLocked ? (
                                    <Unlock size={14} />
                                  ) : (
                                    <Lock size={14} />
                                  )}
                                  <span>{currentAsg.isLocked ? 'Unlock' : 'Lock'}</span>
                                </button>
                                <button
                                  onClick={() => setUpdatingAssignment(currentAsg)}
                                  className="canvas-btn"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 14px',
                                    fontSize: '0.76rem',
                                    fontWeight: 600,
                                    backgroundColor: '#FFFFFF',
                                    color: '#475569',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                  }}
                                  title="Update Quiz Rules & Settings"
                                >
                                  <Settings size={14} />
                                  <span>Update</span>
                                </button>
                                <button
                                  onClick={handleOpenGradingView}
                                  className="canvas-btn"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 14px',
                                    fontSize: '0.76rem',
                                    fontWeight: 600,
                                    backgroundColor: '#0055A5',
                                    color: '#FFFFFF',
                                    border: '1px solid #0055A5',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                  }}
                                  title="Go to Grading page: grade student submissions, view completion status and release grades"
                                >
                                  <Award size={14} />
                                  <span>Grading</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* STUDENT VIEW: Personal Submission Details & Work on Activity / Take Quiz Button (FIRST BLOCK) */}
                      {!isTutor && (
                        isAct && actRaw ? (
                          (() => {
                            const studentSub = actRaw.submission || (actRaw as any).my_submission;
                            const hasSubmitted = Boolean(studentSub && (studentSub.id || studentSub.status || studentSub.submitted_at));
                            const isGradesPublished = Boolean(actRaw.grades_published);
                            const hasScore = isGradesPublished && studentSub && studentSub.score !== null;

                            if (hasSubmitted) {
                              return (
                                <div
                                  className="canvas-card"
                                  style={{
                                    padding: '22px',
                                    border: hasScore ? '1px solid #BBF7D0' : '1px solid #BAE6FD',
                                    backgroundColor: hasScore ? '#F0FDF4' : '#F0F9FF',
                                    borderRadius: '8px',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                                    <div style={{ flex: 1, minWidth: '260px' }}>
                                      {hasScore ? (
                                        <>
                                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '0.75rem', fontWeight: 800 }}>
                                            <CheckCircle size={14} />
                                            <span>OFFICIAL GRADE RELEASED</span>
                                          </div>
                                          <div style={{ fontSize: '1.4rem', fontWeight: 850, color: '#15803D', marginTop: '8px' }}>
                                            Score: {studentSub.score} / {actRaw.max_score || actRaw.total_points || 100} Points
                                          </div>
                                          <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '3px' }}>
                                            {studentSub.score >= (actRaw.passing_points || 70) ? (
                                              <strong style={{ color: '#15803D' }}>Passing grade benchmark achieved.</strong>
                                            ) : (
                                              <strong style={{ color: '#B45309' }}>Passing benchmark not met. Review tutor feedback.</strong>
                                            )}
                                            {studentSub.submitted_at && ` • Submitted on ${formatD(studentSub.submitted_at)}`}
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '4px', backgroundColor: '#DBEAFE', color: '#1D4ED8', fontSize: '0.75rem', fontWeight: 800 }}>
                                            <CheckCircle size={14} />
                                            <span>ACTIVITY SUBMITTED</span>
                                          </div>
                                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', marginTop: '8px' }}>
                                            Submission Received
                                          </div>
                                          <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
                                            Your activity submission was successfully received. Your tutor is currently reviewing cohort submissions. Points and instructor feedback will be displayed here once grades are officially published.
                                          </div>
                                          {studentSub.submitted_at && (
                                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '6px' }}>
                                              Submitted on: <strong>{formatD(studentSub.submitted_at)}</strong>
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                      <div
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '12px',
                                          fontSize: '0.8rem',
                                          color: '#334155',
                                          backgroundColor: '#FFFFFF',
                                          padding: '6px 14px',
                                          borderRadius: '6px',
                                          border: '1px solid #E2E8F0',
                                        }}
                                      >
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                          <Award size={13} color="#0055A5" />
                                          <span><strong>Total Points:</strong> {currentAsg.points} pts</span>
                                        </span>
                                        <span style={{ color: '#CBD5E1' }}>•</span>
                                        <span><strong>Passing:</strong> {actRaw.passing_points || 70} pts</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Tutor Feedback Block (when published) */}
                                  {hasScore && (studentSub.tutor_feedback || (studentSub as any).feedback) && (
                                    <div
                                      style={{
                                        marginTop: '16px',
                                        padding: '14px 18px',
                                        borderRadius: '6px',
                                        backgroundColor: '#FFFFFF',
                                        border: '1px solid #BBF7D0',
                                      }}
                                    >
                                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '4px' }}>
                                        Instructor Feedback & Remarks
                                      </div>
                                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#1F2937', fontStyle: 'italic', lineHeight: 1.5 }}>
                                        "{studentSub.tutor_feedback || (studentSub as any).feedback}"
                                      </p>
                                    </div>
                                  )}

                                  {/* Student Submitted Attachment / Details (if any) */}
                                  {(() => {
                                    const subAtt = studentSub.attachment_file || studentSub.attachment || studentSub.submission_file;
                                    const subTxt = studentSub.submission_text || studentSub.text_content;
                                    if (!subAtt && !studentSub.submission_link && !subTxt) return null;

                                    const isSubPdf = Boolean(
                                      subAtt &&
                                        (/\.pdf(\?.*)?$/i.test(subAtt) ||
                                          subAtt.toLowerCase().includes('.pdf') ||
                                          studentSub.submission_method === 'pdf_upload')
                                    );

                                    return (
                                      <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div
                                          style={{
                                            padding: '12px 16px',
                                            borderRadius: '6px',
                                            backgroundColor: '#FFFFFF',
                                            border: '1px solid #E2E8F0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            flexWrap: 'wrap',
                                            gap: '10px',
                                          }}
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FileText size={16} color="#64748B" />
                                            <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                                              Your Submitted Work:
                                            </span>
                                            {subTxt && (
                                              <span style={{ fontSize: '0.82rem', color: '#1E293B' }}>
                                                "{subTxt.slice(0, 80)}{subTxt.length > 80 ? '...' : ''}"
                                              </span>
                                            )}
                                          </div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {subAtt && (
                                              <a
                                                href={subAtt}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                className="canvas-btn"
                                                style={{
                                                  padding: '5px 12px',
                                                  fontSize: '0.78rem',
                                                  fontWeight: 600,
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: '5px',
                                                  color: '#0055A5',
                                                  backgroundColor: '#EFF6FF',
                                                  border: '1px solid #BFDBFE',
                                                  borderRadius: '4px',
                                                  textDecoration: 'none',
                                                }}
                                              >
                                                <Download size={13} />
                                                <span>Download File</span>
                                              </a>
                                            )}
                                            {studentSub.submission_link && (
                                              <a
                                                href={studentSub.submission_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="canvas-btn"
                                                style={{
                                                  padding: '5px 12px',
                                                  fontSize: '0.78rem',
                                                  fontWeight: 600,
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: '5px',
                                                  color: '#0055A5',
                                                  backgroundColor: '#EFF6FF',
                                                  border: '1px solid #BFDBFE',
                                                  borderRadius: '4px',
                                                  textDecoration: 'none',
                                                }}
                                              >
                                                <ExternalLink size={13} />
                                                <span>Open Submitted Link</span>
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                        {/* Inline PDF Viewer for Student's Submitted Document */}
                                        {isSubPdf && subAtt && (
                                          <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                                            <PdfViewer url={subAtt} title="Your Submitted PDF" minHeight="420px" />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              );
                            }

                            const isBeforeOpenDate = Boolean(actRaw.open_date && new Date(actRaw.open_date) > new Date());

                            // Student has NOT submitted yet -> Render "Work on Activity" button
                            return (
                              <div
                                className="canvas-card"
                                style={{
                                  padding: '22px',
                                  border: '1px solid #E2E8F0',
                                  backgroundColor: '#FFFFFF',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                                  <div>
                                    <div style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
                                      Your Activity Status
                                    </div>
                                    <div style={{ marginTop: '4px' }}>
                                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B' }}>
                                        {currentAsg.title}
                                      </div>
                                      <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                                        {isBeforeOpenDate
                                          ? `This activity is scheduled to open on ${currentAsg.openDate}. You can review instructions, learning materials, and the rubric below, but submissions cannot be made before the open date.`
                                          : 'Review the instructions and learning materials below, or click below to submit your work.'}
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                    <div
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        fontSize: '0.8rem',
                                        color: '#334155',
                                        backgroundColor: '#F1F5F9',
                                        padding: '5px 12px',
                                        borderRadius: '4px',
                                        border: '1px solid #E2E8F0',
                                      }}
                                    >
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                        <Award size={13} color="#0055A5" />
                                        <span><strong>Total Points:</strong> {currentAsg.points} pts</span>
                                      </span>
                                      <span style={{ color: '#CBD5E1' }}>•</span>
                                      <span><strong>Passing:</strong> {actRaw.passing_points || 70} pts</span>
                                    </div>

                                    {currentAsg.isLocked ? (
                                      <div
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          padding: '8px 16px',
                                          backgroundColor: '#F1F5F9',
                                          color: '#64748B',
                                          borderRadius: '4px',
                                          fontSize: '0.85rem',
                                          fontWeight: 600,
                                        }}
                                      >
                                        <Lock size={15} />
                                        <span>Activity is currently locked by your instructor</span>
                                      </div>
                                    ) : isBeforeOpenDate ? (
                                      <div
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          padding: '9px 18px',
                                          backgroundColor: '#F8FAFC',
                                          color: '#475569',
                                          borderRadius: '6px',
                                          fontSize: '0.85rem',
                                          fontWeight: 600,
                                          border: '1px solid #E2E8F0',
                                        }}
                                      >
                                        <Clock size={16} color="#0055A5" />
                                        <span>Opens on {currentAsg.openDate}</span>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setStudentSubmitActivity(actRaw)}
                                        className="canvas-btn canvas-btn-primary"
                                        style={{
                                          padding: '10px 24px',
                                          fontSize: '0.9rem',
                                          fontWeight: 700,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        <PenTool size={16} />
                                        <span>Work on Activity</span>
                                        <ChevronRight size={16} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div
                            className="canvas-card"
                            style={{
                              padding: '22px',
                              border: '1px solid #E2E8F0',
                              backgroundColor: '#FFFFFF',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                              <div>
                                <div style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
                                  Assessment Status
                                </div>
                                {(() => {
                                  let currentStudentId = 'u-4';
                                  try {
                                    const rawUser = localStorage.getItem('sifo_user');
                                    if (rawUser) currentStudentId = JSON.parse(rawUser).id || currentStudentId;
                                  } catch {}

                                  const isQuizBeforeOpen = Boolean(
                                    (currentAsg.rawOpenDate && new Date(currentAsg.rawOpenDate) > new Date()) ||
                                    currentAsg.status === 'Scheduled'
                                  );

                                  const studentSub = currentAsg.submissions.find(
                                    (s) => s.studentId === currentStudentId
                                  );

                                  if (studentSub && studentSub.completed) {
                                    if (currentAsg.gradesPublished && studentSub.score) {
                                      return (
                                        <div style={{ marginTop: '4px' }}>
                                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803D' }}>
                                            Score: {studentSub.score}
                                          </div>
                                          <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                                            {studentSub.feedback ? (
                                              <span>
                                                Instructor Feedback: <em>"{studentSub.feedback}"</em>
                                              </span>
                                            ) : (
                                              'Completed & Graded • Official Record Logged'
                                            )}
                                          </div>
                                        </div>
                                      );
                                    }
                                    return (
                                      <div style={{ marginTop: '4px' }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#15803D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <CheckCircle size={16} color="#15803D" /> Submitted
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                                          Your answers have been submitted. Results will be visible once your instructor publishes the grades.
                                        </div>
                                      </div>
                                    );
                                  }

                                  if (currentAsg.status === 'Graded') {
                                    if (currentAsg.gradesPublished && currentAsg.score) {
                                      return (
                                        <div style={{ marginTop: '4px' }}>
                                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803D' }}>
                                            Score: {currentAsg.score}
                                          </div>
                                          <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                                            Completed & Graded • Passing Grade Achieved
                                          </div>
                                        </div>
                                      );
                                    }
                                    return (
                                      <div style={{ marginTop: '4px' }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#15803D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <CheckCircle size={16} color="#15803D" /> Submitted
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                                          Official records pending release by instructor.
                                        </div>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div style={{ marginTop: '4px' }}>
                                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B' }}>
                                        {currentAsg.title}
                                      </div>
                                      <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                                        {isQuizBeforeOpen
                                          ? `This quiz is scheduled to open on ${currentAsg.openDate}. You can review instructions, time limit, and rubric below, but you cannot take this quiz until it opens.`
                                          : 'Review the rubrics and guidelines below before starting.'}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                <div
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    fontSize: '0.8rem',
                                    color: '#334155',
                                    backgroundColor: '#F1F5F9',
                                    padding: '5px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #E2E8F0',
                                  }}
                                >
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                    <Clock size={13} color="#0055A5" />
                                    <span><strong>Duration:</strong> {currentAsg.timeLimit}</span>
                                  </span>
                                  <span style={{ color: '#CBD5E1' }}>•</span>
                                  <span><strong>Attempts:</strong> {currentAsg.attemptsAllowed || 1}</span>
                                </div>

                                {currentAsg.isLocked ? (
                                  <div
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '8px 16px',
                                      backgroundColor: '#F1F5F9',
                                      color: '#64748B',
                                      borderRadius: '4px',
                                      fontSize: '0.85rem',
                                      fontWeight: 600,
                                    }}
                                  >
                                    <Lock size={15} />
                                    <span>Quiz is currently locked by your instructor</span>
                                  </div>
                                ) : (() => {
                                  const isQuizBeforeOpen = Boolean(
                                    (currentAsg.rawOpenDate && new Date(currentAsg.rawOpenDate) > new Date()) ||
                                    currentAsg.status === 'Scheduled'
                                  );

                                  if (isQuizBeforeOpen) {
                                    return (
                                      <div
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          padding: '9px 18px',
                                          backgroundColor: '#F8FAFC',
                                          color: '#475569',
                                          borderRadius: '6px',
                                          fontSize: '0.85rem',
                                          fontWeight: 600,
                                          border: '1px solid #E2E8F0',
                                        }}
                                      >
                                        <Clock size={16} color="#0055A5" />
                                        <span>Opens on {currentAsg.openDate}</span>
                                      </div>
                                    );
                                  }

                                  let currentStudentId = 'u-4';
                                  try {
                                    const rawUser = localStorage.getItem('sifo_user');
                                    if (rawUser) currentStudentId = JSON.parse(rawUser).id || currentStudentId;
                                  } catch {}

                                  const attemptsKey = `sifo_quiz_attempts_${currentAsg.id}_${currentStudentId}`;
                                  const generalAttemptsKey = `sifo_quiz_attempts_${currentAsg.id}`;
                                  const studentSub = currentAsg.submissions.find(
                                    (s) => s.studentId === currentStudentId && s.completed
                                  );

                                  const attemptsCount = Math.max(
                                    Number(localStorage.getItem(attemptsKey) || 0),
                                    Number(localStorage.getItem(generalAttemptsKey) || 0),
                                    studentSub ? 1 : 0
                                  );

                                  const maxAttempts = currentAsg.attemptsAllowed || 1; // 0 means unlimited
                                  const hasAttemptsRemaining = maxAttempts === 0 || attemptsCount < maxAttempts;

                                  if (!hasAttemptsRemaining) {
                                    // When student is done and reaches maximum attempts allowed -> button disappears!
                                    return (
                                      <div
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          padding: '8px 16px',
                                          backgroundColor: '#F0FDF4',
                                          color: '#15803D',
                                          borderRadius: '4px',
                                          fontSize: '0.85rem',
                                          fontWeight: 700,
                                          border: '1px solid #DCFCE7',
                                        }}
                                      >
                                        <CheckCircle size={15} color="#15803D" />
                                        <span>All {maxAttempts} {maxAttempts === 1 ? 'Attempt' : 'Attempts'} Completed</span>
                                      </div>
                                    );
                                  }

                                  const buttonLabel = attemptsCount === 0 ? 'Take Quiz' : 'Retake Quiz';

                                  return (
                                    <button
                                      onClick={() => setTakingQuizId(currentAsg.id)}
                                      className="canvas-btn canvas-btn-primary"
                                      style={{
                                        padding: '10px 24px',
                                        fontSize: '0.9rem',
                                        fontWeight: 700,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <span>{buttonLabel}</span>
                                      <ChevronRight size={16} />
                                    </button>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        )
                      )}

                      {/* Common Assessment / Activity Metadata Summary */}
                      <div
                        className="canvas-card"
                        style={{
                          padding: '16px 20px',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '16px',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#1E293B', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.02em' }}>Due Date</div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#475569', marginTop: '2px' }}>
                            {currentAsg.dueDate}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#1E293B', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.02em' }}>Available</div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#475569', marginTop: '2px' }}>
                            {currentAsg.openDate}
                          </div>
                        </div>
                        {isAct ? (
                          <div>
                            <div style={{ fontSize: '0.8rem', color: '#1E293B', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.02em' }}>Submission Methods</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0055A5', marginTop: '2px' }}>
                              {Array.isArray(actRaw?.allowed_submission_methods) && actRaw.allowed_submission_methods.length > 0
                                ? actRaw.allowed_submission_methods
                                    .map((m: string) =>
                                      m === 'online_text' ? 'Text Response' :
                                      m === 'pdf_upload' ? 'PDF Upload' :
                                      m === 'image_upload' ? 'Image Upload' :
                                      m === 'link' ? 'Link / Drive' : m
                                    )
                                    .join(', ')
                                : 'Online Text & Files'}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: '0.8rem', color: '#1E293B', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.02em' }}>Closing</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#475569', marginTop: '2px' }}>
                              {currentAsg.closingDate}
                            </div>
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#1E293B', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.02em' }}>
                            {isAct ? 'Total Points & Passing' : 'Points & Time Limit'}
                          </div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#0055A5', marginTop: '2px' }}>
                            {currentAsg.points} pts {isAct ? `• Pass: ${actRaw?.passing_points || 70} pts` : `• ${currentAsg.timeLimit}`}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#1E293B', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.02em' }}>Late Submission</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 500, color: currentAsg.allowLateSubmission ? '#B45309' : '#64748B', marginTop: '2px' }}>
                            {currentAsg.allowLateSubmission
                              ? `Allowed until closing cutoff`
                              : 'Strict Deadline — No late submissions'}
                          </div>
                        </div>
                      </div>

                      {/* Attached Learning Materials for Activity (Google Slides, Attachment Files, Links) */}
                      {isAct && actRaw && (actRaw.attachment_url || actRaw.attachment) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {/* Google Slides presentation */}
                          {(actRaw.resource_type === 'GOOGLE_SLIDES' ||
                            (actRaw.attachment_url && actRaw.attachment_url.includes('docs.google.com/presentation'))) && (
                            <div
                              style={{
                                padding: '16px 20px',
                                borderRadius: '8px',
                                backgroundColor: '#FEF3C7',
                                border: '1px solid #FDE68A',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '14px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div
                                  style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '8px',
                                    backgroundColor: '#FDE68A',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#B45309',
                                  }}
                                >
                                  <Presentation size={24} />
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#92400E' }}>
                                    Google Slides Presentation Attached
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#B45309', marginTop: '2px' }}>
                                    Your instructor provided interactive slides for this activity. Click to review before submitting.
                                  </div>
                                </div>
                              </div>
                              <a
                                href={actRaw.attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="canvas-btn"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '8px 18px',
                                  fontSize: '0.84rem',
                                  fontWeight: 700,
                                  backgroundColor: '#B45309',
                                  color: '#FFFFFF',
                                  borderRadius: '6px',
                                  textDecoration: 'none',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                                }}
                              >
                                <span>Open Google Slides</span>
                                <ExternalLink size={14} />
                              </a>
                            </div>
                          )}

                          {/* Uploaded File / PDF / Diagram */}
                          {Boolean(actRaw.attachment_file || actRaw.attachment) && (
                            (() => {
                              const actDocUrl = actRaw.attachment_file || actRaw.attachment;
                              const isPdf =
                                actRaw.resource_type === 'PDF' ||
                                Boolean(
                                  actDocUrl &&
                                    (/\.pdf(\?.*)?$/i.test(actDocUrl) ||
                                      actDocUrl.toLowerCase().includes('.pdf'))
                                );
                              const isImg =
                                actRaw.resource_type === 'IMAGE' ||
                                Boolean(
                                  actDocUrl &&
                                    /\.(png|jpe?g|webp|gif|svg)$/i.test(actDocUrl)
                                );

                              if (isPdf) {
                                return (
                                  <div style={{ marginTop: '10px' }}>
                                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                                      Activity Reference Document (PDF):
                                    </div>
                                    <PdfViewer
                                      url={actDocUrl}
                                      title={actRaw.title || 'Activity Reference PDF'}
                                      minHeight="520px"
                                    />
                                  </div>
                                );
                              }

                              if (isImg) {
                                return (
                                  <div
                                    style={{
                                      marginTop: '10px',
                                      border: '1px solid #E2E8F0',
                                      borderRadius: '8px',
                                      overflow: 'hidden',
                                      padding: '12px',
                                      backgroundColor: '#F8FAFC',
                                      textAlign: 'center',
                                    }}
                                  >
                                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '8px', textAlign: 'left' }}>
                                      Activity Reference Diagram:
                                    </div>
                                    <img
                                      src={actDocUrl || undefined}
                                      alt="Activity Reference"
                                      style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: '6px', objectFit: 'contain' }}
                                    />
                                  </div>
                                );
                              }

                              return (
                                <div
                                  style={{
                                    padding: '16px 20px',
                                    borderRadius: '8px',
                                    backgroundColor: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '14px',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div
                                      style={{
                                        width: '42px',
                                        height: '42px',
                                        borderRadius: '8px',
                                        backgroundColor: '#EFF6FF',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#1D4ED8',
                                      }}
                                    >
                                      <FileText size={22} />
                                    </div>
                                    <div>
                                      <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#1E293B' }}>
                                        Activity Reference Document
                                      </div>
                                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                                        Supporting study and practical material provided by instructor.
                                      </div>
                                    </div>
                                  </div>
                                  <a
                                    href={actDocUrl || undefined}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="canvas-btn"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '8px 16px',
                                      fontSize: '0.82rem',
                                      fontWeight: 700,
                                      backgroundColor: '#FFFFFF',
                                      color: '#0055A5',
                                      border: '1px solid #0055A5',
                                      borderRadius: '6px',
                                      textDecoration: 'none',
                                    }}
                                  >
                                    <Download size={14} />
                                    <span>Download / View Resource</span>
                                  </a>
                                </div>
                              );
                            })()
                          )}

                          {/* External Resource Link (or External PDF) */}
                          {actRaw.attachment_url &&
                            !actRaw.attachment_url.includes('docs.google.com/presentation') && (
                              (() => {
                                const isUrlPdf = Boolean(
                                  /\.pdf(\?.*)?$/i.test(actRaw.attachment_url) ||
                                    actRaw.attachment_url.toLowerCase().includes('.pdf')
                                );
                                if (isUrlPdf) {
                                  return (
                                    <div style={{ marginTop: '10px' }}>
                                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                                        Activity Reference Link (PDF):
                                      </div>
                                      <PdfViewer
                                        url={actRaw.attachment_url}
                                        title={actRaw.title || 'External PDF Resource'}
                                        minHeight="520px"
                                      />
                                    </div>
                                  );
                                }
                                return (
                                  <div
                                    style={{
                                      padding: '12px 18px',
                                      borderRadius: '6px',
                                      backgroundColor: '#F0F9FF',
                                      border: '1px solid #BAE6FD',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      flexWrap: 'wrap',
                                      gap: '10px',
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <ExternalLink size={16} color="#0284C7" />
                                      <span style={{ fontSize: '0.84rem', color: '#0369A1', fontWeight: 600 }}>
                                        External Learning Link: {actRaw.attachment_url}
                                      </span>
                                    </div>
                                    <a
                                      href={actRaw.attachment_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="canvas-btn"
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 14px',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        backgroundColor: '#0284C7',
                                        color: '#FFFFFF',
                                        borderRadius: '4px',
                                        textDecoration: 'none',
                                      }}
                                    >
                                      <span>Open Link</span>
                                      <ExternalLink size={13} />
                                    </a>
                                  </div>
                                );
                              })()
                            )}
                        </div>
                      )}

                      {/* Instructions & Requirements Section */}
                      <div className="canvas-card" style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#DC2626', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <BookOpen size={17} color="#DC2626" />
                          <span>Instructions & Requirements</span>
                        </h3>
                        <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                          {currentAsg.instructions}
                        </p>

                        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#475569', margin: '0 0 10px 0' }}>
                            Evaluation Rubric & Breakdown
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {currentAsg.rubrics.map((rubric, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 12px',
                                  backgroundColor: '#F8FAFC',
                                  borderRadius: '4px',
                                  border: '1px solid #E2E8F0',
                                  fontSize: '0.82rem',
                                }}
                              >
                                <span style={{ color: '#1E293B', fontWeight: 500 }}>{rubric.criteria}</span>
                                <span style={{ fontWeight: 700, color: '#0055A5' }}>{rubric.points}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })()
              ) : (
                /* Default Assignments List: No external Take Quiz button */
                <>
                  {isTutor && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCohortActivity(null);
                          setShowCreateActivityModal(true);
                        }}
                        className="canvas-btn canvas-btn-primary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 18px',
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={16} />
                        <span>Create Activity</span>
                      </button>
                    </div>
                  )}

                  {/* UPCOMING & ACTIVE ASSIGNMENTS BLOCK (Mixed Quizzes & Activities) */}
                  <div className="canvas-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 18px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB', fontWeight: 700, fontSize: '0.88rem', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="#64748B" />
                        <span>Upcoming & Active Assignments ({visibleAssignments.filter(a => a.status === 'Open' || a.status === 'Scheduled').length})</span>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                        {isTutor ? 'Click to inspect submissions & grade' : 'Click to read instructions & open assignment'}
                      </span>
                    </div>
                    <div>
                      {visibleAssignments.filter(a => a.status === 'Open' || a.status === 'Scheduled').length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                          No upcoming or scheduled assignments at this time.
                        </div>
                      ) : (
                        visibleAssignments
                          .filter(a => a.status === 'Open' || a.status === 'Scheduled')
                          .map((item) => {
                            const isAct = Boolean(item.isCohortActivity && item.activityRaw);
                            const act = item.activityRaw;

                            const isGoogleSlides =
                              act &&
                              (act.resource_type === 'GOOGLE_SLIDES' ||
                                (act.attachment_url && act.attachment_url.includes('docs.google.com/presentation')));
                            const isPdf =
                              act &&
                              (act.resource_type === 'PDF' ||
                                Boolean(
                                  (act.attachment_url && (/\.pdf(\?.*)?$/i.test(act.attachment_url) || act.attachment_url.toLowerCase().includes('.pdf'))) ||
                                  (act.attachment && (/\.pdf(\?.*)?$/i.test(act.attachment) || act.attachment.toLowerCase().includes('.pdf')))
                                ));
                            const isImage =
                              act &&
                              (act.resource_type === 'IMAGE' ||
                                (act.attachment_url && /\.(png|jpe?g|webp|gif)$/i.test(act.attachment_url)));

                            const totalRoster = item.submissions?.length || cohortStudents.length;
                            const completedCount = item.submissions?.filter((s) => s.completed).length || 0;
                            const completionPct = Math.round((completedCount / totalRoster) * 100);

                            return (
                              <div
                                key={item.id}
                                onClick={() => handleOpenAssignment(item.id)}
                                style={{
                                  padding: '14px 20px',
                                  borderBottom: '1px solid #F1F5F9',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  cursor: 'pointer',
                                  backgroundColor: '#FFFFFF',
                                  transition: 'background-color 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  {isAct ? (
                                    <div
                                      style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        backgroundColor: isGoogleSlides
                                          ? '#FEF3C7'
                                          : isPdf
                                          ? '#FEE2E2'
                                          : isImage
                                          ? '#E0F2FE'
                                          : '#F1F5F9',
                                        color: isGoogleSlides
                                          ? '#D97706'
                                          : isPdf
                                          ? '#DC2626'
                                          : isImage
                                          ? '#0284C7'
                                          : '#475569',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      {isGoogleSlides ? (
                                        <Presentation size={18} />
                                      ) : isPdf ? (
                                        <FileText size={18} />
                                      ) : isImage ? (
                                        <ImageIcon size={18} />
                                      ) : (
                                        <BookOpen size={18} />
                                      )}
                                    </div>
                                  ) : (
                                    <div
                                      style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        backgroundColor: '#EFF6FF',
                                        color: '#1D4ED8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      <Award size={18} />
                                    </div>
                                  )}

                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                                        {item.title}
                                      </span>

                                      {/* Type pill */}
                                      <span
                                        style={{
                                          padding: '2px 8px',
                                          borderRadius: '4px',
                                          fontSize: '0.72rem',
                                          fontWeight: 700,
                                          backgroundColor: '#F1F5F9',
                                          color: '#475569',
                                        }}
                                      >
                                        {item.type}
                                      </span>

                                      {item.status === 'Scheduled' && (
                                        <span
                                          style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            backgroundColor: '#EFF6FF',
                                            color: '#1D4ED8',
                                            border: '1px solid #DBEAFE',
                                          }}
                                        >
                                          Scheduled
                                        </span>
                                      )}

                                      {/* Media badges */}
                                      {isGoogleSlides && (
                                        <span
                                          style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            backgroundColor: '#FEF3C7',
                                            color: '#B45309',
                                            border: '1px solid #FDE68A',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                          }}
                                        >
                                          <Presentation size={11} />
                                          <span>Google Slides</span>
                                        </span>
                                      )}
                                      {isPdf && (
                                        <span
                                          style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            backgroundColor: '#FEE2E2',
                                            color: '#B91C1C',
                                            border: '1px solid #FECACA',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                          }}
                                        >
                                          <FileText size={11} />
                                          <span>PDF Attached</span>
                                        </span>
                                      )}
                                      {isImage && (
                                        <span
                                          style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            backgroundColor: '#E0F2FE',
                                            color: '#0369A1',
                                            border: '1px solid #BAE6FD',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                          }}
                                        >
                                          <ImageIcon size={11} />
                                          <span>Diagram</span>
                                        </span>
                                      )}

                                      {/* Lock/Unlock status badge for tutor */}
                                      {isTutor && (
                                        item.isLocked ? (
                                          <span
                                            style={{
                                              padding: '2px 8px',
                                              borderRadius: '4px',
                                              fontSize: '0.72rem',
                                              fontWeight: 700,
                                              backgroundColor: '#FEE2E2',
                                              color: '#DC2626',
                                              border: '1px solid #FECACA',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px',
                                            }}
                                          >
                                            <Lock size={11} />
                                            <span>Locked</span>
                                          </span>
                                        ) : (
                                          <span
                                            style={{
                                              padding: '2px 8px',
                                              borderRadius: '4px',
                                              fontSize: '0.72rem',
                                              fontWeight: 700,
                                              backgroundColor: '#DCFCE7',
                                              color: '#15803D',
                                              border: '1px solid #BBF7D0',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px',
                                            }}
                                          >
                                            <Unlock size={11} />
                                            <span>Unlocked</span>
                                          </span>
                                        )
                                      )}

                                      {/* Submitted / completed badge for student */}
                                      {!isTutor && (item.isSubmitted || item.studentSubmitted) && !item.gradesPublished && (
                                        <span
                                          style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            backgroundColor: '#FEF3C7',
                                            color: '#B45309',
                                            border: '1px solid #FDE68A',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                          }}
                                        >
                                          <Clock size={11} />
                                          <span>Submitted</span>
                                        </span>
                                      )}
                                      {!isTutor && item.score && item.gradesPublished && (
                                        <span
                                          style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            backgroundColor: '#DCFCE7',
                                            color: '#15803D',
                                            border: '1px solid #BBF7D0',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                          }}
                                        >
                                          <CheckCircle size={11} />
                                          <span>Score: {item.score}</span>
                                        </span>
                                      )}
                                    </div>

                                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                                      {item.openDate !== 'Open Access' ? `Opens: ${item.openDate} • ` : ''}Due: {item.dueDate} • {item.points} pts
                                    </div>
                                  </div>
                                </div>

                                {/* Right side controls */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  {isTutor ? (
                                    isAct ? (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {/* Lock/Unlock Activity */}
                                        <button
                                          type="button"
                                          disabled={togglingLockActivityId === act!.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleActivityLock(act!);
                                          }}
                                          className="canvas-btn"
                                          style={{
                                            padding: '5px 10px',
                                            fontSize: '0.74rem',
                                            fontWeight: 600,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            backgroundColor: item.isLocked ? '#0055A5' : '#FFFFFF',
                                            color: item.isLocked ? '#FFFFFF' : '#475569',
                                            border: '1px solid #CBD5E1',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                          }}
                                          title={item.isLocked ? `Unlock for ${activeCohortName}` : `Lock for ${activeCohortName}`}
                                        >
                                          {item.isLocked ? <Unlock size={12} /> : <Lock size={12} />}
                                          <span>{item.isLocked ? 'Unlock' : 'Lock'}</span>
                                        </button>

                                        {/* Edit Activity */}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingCohortActivity(act!);
                                            setShowCreateActivityModal(true);
                                          }}
                                          className="canvas-btn"
                                          style={{
                                            padding: '5px 10px',
                                            fontSize: '0.74rem',
                                            fontWeight: 600,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            backgroundColor: '#FFFFFF',
                                            color: '#475569',
                                            border: '1px solid #CBD5E1',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                          }}
                                          title="Edit Activity"
                                        >
                                          <Edit2 size={12} />
                                          <span>Edit</span>
                                        </button>

                                        {/* Submissions Activity */}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setReviewSubmissionsActivity(act!);
                                          }}
                                          className="canvas-btn"
                                          style={{
                                            padding: '5px 12px',
                                            fontSize: '0.74rem',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            backgroundColor: '#0055A5',
                                            color: '#FFFFFF',
                                            border: '1px solid #0055A5',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                          }}
                                          title="Review student submissions & award grades"
                                        >
                                          <Users size={12} />
                                          <span>Submissions ({act?.submission_count || 0})</span>
                                        </button>

                                        {/* Delete Activity */}
                                        <button
                                          type="button"
                                          disabled={deletingActivityId === act!.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteActivity(act!);
                                          }}
                                          className="canvas-btn"
                                          style={{
                                            padding: '5px 8px',
                                            fontSize: '0.74rem',
                                            backgroundColor: '#FFFFFF',
                                            color: '#DC2626',
                                            border: '1px solid #FECACA',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                          }}
                                          title="Delete Activity"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    ) : (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {/* Lock/Unlock Quiz */}
                                        <button
                                          type="button"
                                          disabled={togglingQuizLockId === item.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleLock(item.id);
                                          }}
                                          className="canvas-btn"
                                          style={{
                                            padding: '5px 10px',
                                            fontSize: '0.74rem',
                                            fontWeight: 600,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            backgroundColor: item.isLocked ? '#0055A5' : '#FFFFFF',
                                            color: item.isLocked ? '#FFFFFF' : '#475569',
                                            border: '1px solid #CBD5E1',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            opacity: togglingQuizLockId === item.id ? 0.7 : 1,
                                          }}
                                          title={item.isLocked ? `Unlock for ${activeCohortName}` : `Lock for ${activeCohortName}`}
                                        >
                                          {togglingQuizLockId === item.id ? (
                                            <Loader2 size={12} className="animate-spin" />
                                          ) : item.isLocked ? (
                                            <Unlock size={12} />
                                          ) : (
                                            <Lock size={12} />
                                          )}
                                          <span>{item.isLocked ? 'Unlock' : 'Lock'}</span>
                                        </button>
                                        <div style={{ textAlign: 'right' }}>
                                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                                            {completedCount} / {totalRoster} completed
                                          </div>
                                          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '1px' }}>
                                            {completionPct}% completion rate
                                          </div>
                                        </div>
                                        <span
                                          className="canvas-btn"
                                          style={{
                                            padding: '6px 12px',
                                            fontSize: '0.76rem',
                                            fontWeight: 600,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            backgroundColor: '#F1F5F9',
                                            color: '#475569',
                                            border: '1px solid #CBD5E1',
                                            borderRadius: '4px',
                                          }}
                                        >
                                          <Users size={13} />
                                          <span>Manage & Grade</span>
                                        </span>
                                      </div>
                                    )
                                  ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                                        {item.score ? 'View Submission & Grade' : 'View Instructions & Details'}
                                      </span>
                                      <ChevronRight size={15} color="#94A3B8" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>

                  {/* PAST ASSIGNMENTS BLOCK (Mixed Quizzes & Activities) */}
                  <div className="canvas-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 18px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB', fontWeight: 700, fontSize: '0.88rem', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={16} color="#64748B" />
                        <span>Past Assignments ({visibleAssignments.filter(a => a.status === 'Past' || a.status === 'Closed').length})</span>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                        {isTutor ? 'Inspect past submissions & records' : 'Completed & graded assessments'}
                      </span>
                    </div>
                    <div>
                      {visibleAssignments.filter(a => a.status === 'Past' || a.status === 'Closed').length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                          No past assignments recorded.
                        </div>
                      ) : (
                        visibleAssignments
                          .filter(a => a.status === 'Past' || a.status === 'Closed')
                          .map((item) => {
                            const isAct = Boolean(item.isCohortActivity && item.activityRaw);
                            const act = item.activityRaw;

                            const isGoogleSlides =
                              act &&
                              (act.resource_type === 'GOOGLE_SLIDES' ||
                                (act.attachment_url && act.attachment_url.includes('docs.google.com/presentation')));
                            const isPdf =
                              act &&
                              (act.resource_type === 'PDF' ||
                                Boolean(
                                  (act.attachment_url && (/\.pdf(\?.*)?$/i.test(act.attachment_url) || act.attachment_url.toLowerCase().includes('.pdf'))) ||
                                  (act.attachment && (/\.pdf(\?.*)?$/i.test(act.attachment) || act.attachment.toLowerCase().includes('.pdf')))
                                ));
                            const isImage =
                              act &&
                              (act.resource_type === 'IMAGE' ||
                                (act.attachment_url && /\.(png|jpe?g|webp|gif)$/i.test(act.attachment_url)));

                            const totalRoster = item.submissions?.length || cohortStudents.length;
                            const completedCount = item.submissions?.filter((s) => s.completed).length || 0;
                            const completionPct = Math.round((completedCount / totalRoster) * 100);

                            return (
                              <div
                                key={item.id}
                                onClick={() => handleOpenAssignment(item.id)}
                                style={{
                                  padding: '14px 20px',
                                  borderBottom: '1px solid #F1F5F9',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  cursor: 'pointer',
                                  backgroundColor: '#FFFFFF',
                                  transition: 'background-color 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  {isAct ? (
                                    <div
                                      style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        backgroundColor: isGoogleSlides
                                          ? '#FEF3C7'
                                          : isPdf
                                          ? '#FEE2E2'
                                          : isImage
                                          ? '#E0F2FE'
                                          : '#F1F5F9',
                                        color: isGoogleSlides
                                          ? '#D97706'
                                          : isPdf
                                          ? '#DC2626'
                                          : isImage
                                          ? '#0284C7'
                                          : '#475569',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      {isGoogleSlides ? (
                                        <Presentation size={18} />
                                      ) : isPdf ? (
                                        <FileText size={18} />
                                      ) : isImage ? (
                                        <ImageIcon size={18} />
                                      ) : (
                                        <BookOpen size={18} />
                                      )}
                                    </div>
                                  ) : (
                                    <div
                                      style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        backgroundColor: '#EFF6FF',
                                        color: '#1D4ED8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      <Award size={18} />
                                    </div>
                                  )}

                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                                        {item.title}
                                      </span>

                                      <span
                                        style={{
                                          padding: '2px 8px',
                                          borderRadius: '4px',
                                          fontSize: '0.72rem',
                                          fontWeight: 700,
                                          backgroundColor: '#F1F5F9',
                                          color: '#475569',
                                        }}
                                      >
                                        {item.type}
                                      </span>

                                      {isGoogleSlides && (
                                        <span
                                          style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            backgroundColor: '#FEF3C7',
                                            color: '#B45309',
                                            border: '1px solid #FDE68A',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                          }}
                                        >
                                          <Presentation size={11} />
                                          <span>Google Slides</span>
                                        </span>
                                      )}
                                      {isPdf && (
                                        <span
                                          style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            backgroundColor: '#FEE2E2',
                                            color: '#B91C1C',
                                            border: '1px solid #FECACA',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                          }}
                                        >
                                          <FileText size={11} />
                                          <span>PDF Attached</span>
                                        </span>
                                      )}
                                      {isImage && (
                                        <span
                                          style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            backgroundColor: '#E0F2FE',
                                            color: '#0369A1',
                                            border: '1px solid #BAE6FD',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                          }}
                                        >
                                          <ImageIcon size={11} />
                                          <span>Diagram</span>
                                        </span>
                                      )}

                                      {!isTutor && item.score && (
                                        <span
                                          style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            backgroundColor: '#DCFCE7',
                                            color: '#15803D',
                                            border: '1px solid #BBF7D0',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                          }}
                                        >
                                          <CheckCircle size={11} />
                                          <span>Score: {item.score}</span>
                                        </span>
                                      )}
                                    </div>

                                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                                      Due: {item.dueDate} • {item.points} pts
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  {isTutor ? (
                                    isAct ? (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setReviewSubmissionsActivity(act!);
                                          }}
                                          className="canvas-btn"
                                          style={{
                                            padding: '5px 12px',
                                            fontSize: '0.74rem',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            backgroundColor: '#0055A5',
                                            color: '#FFFFFF',
                                            border: '1px solid #0055A5',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <Users size={12} />
                                          <span>Submissions ({act?.submission_count || 0})</span>
                                        </button>
                                      </div>
                                    ) : (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ textAlign: 'right' }}>
                                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                                            {completedCount} / {totalRoster} completed
                                          </div>
                                          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '1px' }}>
                                            {completionPct}% completion rate
                                          </div>
                                        </div>
                                        <span
                                          className="canvas-btn"
                                          style={{
                                            padding: '6px 12px',
                                            fontSize: '0.76rem',
                                            fontWeight: 600,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            backgroundColor: '#F1F5F9',
                                            color: '#475569',
                                            border: '1px solid #CBD5E1',
                                            borderRadius: '4px',
                                          }}
                                        >
                                          <Users size={13} />
                                          <span>Manage & Grade</span>
                                        </span>
                                      </div>
                                    )
                                  ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      <div style={{ textAlign: 'right' }}>
                                        {item.isCohortActivity ? (
                                          item.studentSubmitted ? (
                                            <>
                                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: item.score ? '#15803D' : '#0055A5' }}>
                                                {item.score ? `Score: ${item.score}` : 'Submitted'}
                                              </span>
                                              <div style={{ fontSize: '0.68rem', color: item.score ? '#15803D' : '#64748B' }}>
                                                {item.score ? 'Graded & Published' : 'Awaiting Grade Release'}
                                              </div>
                                            </>
                                          ) : (
                                            <>
                                              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>
                                                Not Submitted
                                              </span>
                                              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                                                Pending Student Work
                                              </div>
                                            </>
                                          )
                                        ) : (
                                          <>
                                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                                              Score: {item.score || (item.gradesPublished ? 'Graded' : 'Completed')}
                                            </span>
                                            <div style={{ fontSize: '0.68rem', color: item.score || item.gradesPublished ? '#15803D' : '#64748B' }}>
                                              {item.score || item.gradesPublished ? 'Graded & Recorded' : 'Submission Completed'}
                                            </div>
                                          </>
                                        )}
                                      </div>
                                      <ChevronRight size={15} color="#94A3B8" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 4: GRADES (Student-only view) */}
          {activeTab === 'grades' && !isTutor && (
            reviewParam ? (
              <StudentAssessmentReviewView
                assessmentId={reviewParam}
                isActivity={reviewTypeParam === 'activity'}
                courseId={course.id}
                courseTitle={course.title}
                onBackToGrades={handleCloseGradeReview}
                hideBreadcrumbs
              />
            ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2D3B45', margin: 0 }}>
                  Your Course Grade Report
                </h2>
                <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: '3px 0 0 0' }}>
                  Overview of your assessment grades and academic performance.
                </p>
              </div>

              <div className="canvas-card" style={{ padding: '20px', backgroundColor: '#FFFFFF' }}>
                <div style={{ border: '1px solid #E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                        <th style={{ padding: '10px 14px', color: '#475569' }}>Name</th>
                        <th style={{ padding: '10px 14px', color: '#475569' }}>Due</th>
                        <th style={{ padding: '10px 14px', color: '#475569' }}>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleAssignments.map((asg) => {
                        const scoreVal = asg.score ? asg.score.split('/')[0].trim() : null;
                        return (
                          <tr key={asg.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 400, color: '#111827' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenGradeReview(asg)}
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
                                  outline: 'none',
                                }}
                                onMouseEnter={(e) => {
                                  (e.currentTarget as HTMLElement).style.textDecoration = 'underline';
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLElement).style.textDecoration = 'none';
                                }}
                                title="Click to view full grading details"
                              >
                                {asg.title}
                              </button>
                            </td>
                            <td style={{ padding: '12px 14px', color: '#64748B' }}>{asg.dueDate}</td>
                            <td style={{ padding: '12px 14px', fontWeight: 700, color: scoreVal ? '#058728' : '#94A3B8' }}>
                              {scoreVal ? `${scoreVal}/${asg.points}` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                      {/* Attendance Row (Always the last on the list, kept bold) */}
                      <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#111827' }}>
                          ATTENDANCE
                        </td>
                        <td style={{ padding: '12px 14px', color: '#64748B' }}>
                          -
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#64748B' }}>
                          {studentAttendanceRate}%/100%
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr style={{ backgroundColor: '#F8FAFC', borderTop: '2px solid #E5E7EB' }}>
                        <td colSpan={2} style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.92rem', color: '#111827' }}>
                          Average:
                        </td>
                        <td colSpan={1} style={{ padding: '14px 16px', fontWeight: 800, fontSize: '1rem', color: '#058728' }}>
                          94.2% (Grade A)
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            )
          )}

          {/* TAB 5: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2D3B45', margin: 0 }}>
                    Course Announcements
                  </h2>
                  <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: '3px 0 0 0' }}>
                    Official notices, schedule updates, and exam briefings from your instructors.
                  </p>
                </div>

                {isTutor && (
                  <button
                    onClick={() => setShowPostAnnouncementModal(true)}
                    className="canvas-btn canvas-btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
                  >
                    <Plus size={15} />
                    <span>Post Announcement</span>
                  </button>
                )}
              </div>

              {loadingAnnouncements ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', color: '#64748B', gap: '8px', alignItems: 'center' }}>
                  <Loader2 size={20} className="animate-spin" />
                  <span style={{ fontSize: '0.86rem' }}>Loading course announcements...</span>
                </div>
              ) : localAnnouncements.length === 0 ? (
                <div
                  className="canvas-card"
                  style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    backgroundColor: '#FFFFFF',
                    border: '1px dashed #CBD5E1',
                    borderRadius: '6px',
                  }}
                >
                  <Bell size={40} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                    No Announcements Yet
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: '#64748B', maxWidth: '420px', margin: '6px auto 0 auto', lineHeight: 1.5 }}>
                    Official notices, schedule changes, and cohort exam briefings will appear here when posted by instructors.
                  </p>
                  {isTutor && (
                    <button
                      onClick={() => setShowPostAnnouncementModal(true)}
                      className="canvas-btn canvas-btn-primary"
                      style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
                    >
                      <Plus size={14} />
                      <span>Post the First Announcement</span>
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {localAnnouncements.map((ann) => (
                    <div
                      key={ann.id}
                      className="canvas-card"
                      style={{
                        padding: '20px 24px',
                        backgroundColor: '#FFFFFF',
                        borderLeft: '4px solid #0055A5',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
                            {ann.title}
                          </h4>
                          {ann.target_type === 'SINGLE_COHORT' ? (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                color: '#0055A5',
                                backgroundColor: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              {ann.cohort_name || 'Cohort'}
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                color: '#15803D',
                                backgroundColor: '#F0FDF4',
                                border: '1px solid #BBF7D0',
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              all
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                          {ann.date || (ann.created_at ? new Date(ann.created_at).toLocaleDateString() : '')}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.6, margin: '0 0 14px 0', whiteSpace: 'pre-wrap' }}>
                        {ann.content}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                          Posted by: <strong style={{ color: '#1E293B' }}>{ann.author_name || ann.author}</strong>
                          {ann.author_role ? ` • ${ann.author_role}` : ''}
                        </div>

                        {isTutor && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#DC2626',
                              fontSize: '0.76rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                            title="Delete announcement"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: DISCUSSIONS */}
          {activeTab === 'discussions' && (
            <CourseDiscussionsTab course={course} />
          )}

          {/* TAB 7: PEOPLE (Classmates, Instructors, Course Groups & Group Chat) */}
          {activeTab === 'people' && (
            <CoursePeopleTab
              course={course}
              activeGroupId={activeGroupId}
              onSelectGroup={(grpId) => {
                if (grpId) {
                  handleOpenGroup(grpId);
                } else {
                  handleCloseGroup();
                }
              }}
              onGroupsLoaded={setCourseGroups}
            />
          )}

              {/* TAB 8: LIVE CLASSES */}
              {activeTab === 'live' && (
                <CourseLiveClassesTab isTutor={Boolean(isTutor)} cohortId={activeCohortId} />
              )}
            </>
          )}
        </main>

        {/* Column 3: Canvas Right Sidebar */}
        {!selectedLessonId && !reviewSubmissionsActivity && (
          <CourseRightSidebar
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setActiveGroupId(null);
            }}
            onOpenGroup={handleOpenGroupFromSidebar}
            isTutor={Boolean(isTutor)}
            assignments={visibleAssignments}
            courseId={course.id}
            cohortId={activeCohortId}
            groups={courseGroups}
          />
        )}
      </div>

      {/* Post Announcement Modal (for Tutors) */}
      {showPostAnnouncementModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => !submittingAnnouncement && setShowPostAnnouncementModal(false)}
        >
          <div
            className="canvas-card"
            style={{
              maxWidth: '540px',
              width: '100%',
              padding: '28px',
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                  Post Course Announcement
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>
                  Send timely notices and briefings directly to your students' course feeds.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !submittingAnnouncement && setShowPostAnnouncementModal(false)}
                disabled={submittingAnnouncement}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Change: Friday Q&A Review Session"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  disabled={submittingAnnouncement}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '4px',
                    fontSize: '0.86rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Audience & Visibility *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: announcementTargetType === 'ALL_ASSIGNED_COHORTS' ? '1.5px solid #0055A5' : '1px solid #E2E8F0',
                      backgroundColor: announcementTargetType === 'ALL_ASSIGNED_COHORTS' ? '#F0F7FF' : '#FAFAFA',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="announcementTarget"
                      checked={announcementTargetType === 'ALL_ASSIGNED_COHORTS'}
                      onChange={() => setAnnouncementTargetType('ALL_ASSIGNED_COHORTS')}
                      disabled={submittingAnnouncement}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1E293B' }}>
                        All Cohorts Assigned to Me
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                        Broadcast to learners across all {tutorCohorts.length > 0 ? `${tutorCohorts.length} cohorts` : 'cohorts'} assigned to you for this course.
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: announcementTargetType === 'SINGLE_COHORT' ? '1.5px solid #0055A5' : '1px solid #E2E8F0',
                      backgroundColor: announcementTargetType === 'SINGLE_COHORT' ? '#F0F7FF' : '#FAFAFA',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="announcementTarget"
                      checked={announcementTargetType === 'SINGLE_COHORT'}
                      onChange={() => setAnnouncementTargetType('SINGLE_COHORT')}
                      disabled={submittingAnnouncement}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1E293B' }}>
                        One Specific Cohort
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                        Visible exclusively to students in the selected learning group.
                      </div>
                    </div>
                  </label>
                </div>

                {announcementTargetType === 'SINGLE_COHORT' && (
                  <div style={{ marginTop: '10px', paddingLeft: '4px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Select Target Cohort *
                    </label>
                    <select
                      value={announcementCohortId || activeCohortId || (tutorCohorts[0]?.id ?? '')}
                      onChange={(e) => setAnnouncementCohortId(e.target.value)}
                      disabled={submittingAnnouncement}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      {tutorCohorts.map((cohort) => (
                        <option key={cohort.id} value={cohort.id}>
                          {cohort.name} ({cohort.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                  Content *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide instructions, timetable adjustments, or exam preparation guidance..."
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  disabled={submittingAnnouncement}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '4px',
                    fontSize: '0.86rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowPostAnnouncementModal(false)}
                  disabled={submittingAnnouncement}
                  className="canvas-btn"
                  style={{ fontSize: '0.84rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAnnouncement}
                  className="canvas-btn canvas-btn-primary"
                  style={{ fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {submittingAnnouncement ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish Announcement</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tutor Quiz Update Modal */}
      {updatingAssignment && (
        <TutorQuizUpdateModal
          isOpen={Boolean(updatingAssignment)}
          assignment={updatingAssignment}
          onClose={() => setUpdatingAssignment(null)}
          onSuccess={handleQuizUpdatedByTutor}
        />
      )}

      {/* Tutor Student Grading Modal */}
      {gradingStudentModal && (() => {
        const activeAsgForModal =
          (selectedAssignmentId &&
            (visibleAssignments.find((a) => a.id === selectedAssignmentId) ||
              assignmentsData.find((a) => a.id === selectedAssignmentId))) || {
            id: selectedAssignmentId || '',
            title: (gradingStudentModal as any).rawSubmission?.quiz_title || 'Assessment',
            points: 100,
          };
        return (
          <TutorStudentGradingModal
            isOpen={Boolean(gradingStudentModal)}
            assignment={activeAsgForModal as any}
            student={gradingStudentModal}
            maxPoints={activeAsgForModal.points || 100}
            currentTutorName={
              (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '') ||
              (user as any)?.name ||
              'Tutor'
            }
            onClose={() => setGradingStudentModal(null)}
            onSaveGrade={(studentId, score, feedback, submissionId) =>
              handleSaveStudentGrade(
                activeAsgForModal.id,
                studentId,
                score,
                feedback,
                submissionId || gradingStudentModal.submissionId
              )
            }
          />
        );
      })()}

      {/* Create / Edit Cohort Activity Modal */}
      {showCreateActivityModal && (
        <CreateActivityModal
          isOpen={showCreateActivityModal}
          cohortId={activeCohortId || tutorCohorts[0]?.id || ''}
          courseId={course.id}
          activityToEdit={editingCohortActivity}
          availableCohorts={tutorCohorts.map((c) => ({ id: c.id, name: c.name, code: c.code }))}
          onClose={() => {
            setShowCreateActivityModal(false);
            setEditingCohortActivity(null);
          }}
          onSuccess={fetchCohortActivities}
        />
      )}



      {/* Student Submit Activity Modal */}
      {studentSubmitActivity && (
        <StudentSubmitActivityModal
          isOpen={Boolean(studentSubmitActivity)}
          activity={studentSubmitActivity}
          onClose={() => setStudentSubmitActivity(null)}
          onSuccess={fetchCohortActivities}
        />
      )}

      {/* Student Quiz Runner (Pre-flight diagnostics + Live Timed Proctoring) */}
      {takingQuizId && (
        <StudentQuizRunner
          quizId={takingQuizId}
          courseId={course.id}
          courseTitle={course.title}
          cohortId={activeCohortId || undefined}
          onClose={() => {
            setTakingQuizId(null);
            fetchQuizzes();
          }}
          onCompleted={(sub) => {
            setAssignmentsData((prev) =>
              prev.map((item) =>
                item.id === takingQuizId
                  ? {
                      ...item,
                      status: 'Graded',
                      score: `${sub.score} / ${sub.total_score}`,
                    }
                  : item
              )
            );
            fetchQuizzes();
          }}
        />
      )}
    </div>
  );
};

interface TutorStudentGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment?: CourseAssignmentItem | null;
  student: {
    studentId: string;
    name: string;
    studentRollNo: string;
    category: string;
    score: string;
    feedback: string;
    completed: boolean;
    submissionId?: string | null;
    rawSubmission?: any | null;
  } | null;
  maxPoints: number;
  currentTutorName?: string;
  onSaveGrade: (studentId: string, score: string, feedback: string, submissionId?: string | null) => void;
}

const TutorStudentGradingModal: React.FC<TutorStudentGradingModalProps> = ({
  isOpen,
  onClose,
  assignment,
  student,
  maxPoints,
  currentTutorName: _currentTutorName,
  onSaveGrade,
}) => {
  if (!isOpen || !student) return null;

  const currentPointsValue = student.score
    ? student.score.split('/')[0].trim()
    : '';

  const [pointsInput, setPointsInput] = useState(currentPointsValue);
  const [feedbackInput, setFeedbackInput] = useState(student.feedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProctoringViolationsLog, setShowProctoringViolationsLog] = useState(false);

  const rawSub = student.rawSubmission;
  const breakdown: any[] = rawSub?.question_breakdown || [];
  const isCohortActivity = Boolean(
    assignment?.isCohortActivity ||
    (assignment as any)?.activityRaw ||
    rawSub?.activity ||
    rawSub?.submission_method
  );
  const workText: string | undefined =
    rawSub?.submission_text ||
    rawSub?.text_content ||
    rawSub?.work_submission_text;
  const workFileUrl: string | undefined =
    rawSub?.attachment_file ||
    rawSub?.attachment_url ||
    rawSub?.attachment ||
    rawSub?.work_submission_file_url ||
    rawSub?.work_submission_file ||
    rawSub?.file;
  const workLink: string | undefined =
    rawSub?.submission_link ||
    rawSub?.link;
  const tabSwitches: number = rawSub?.tab_switch_count || 0;
  const isFlagged: boolean = Boolean(rawSub?.is_flagged);
  const flagReason: string | undefined = rawSub?.flag_reason;
  const timeSpentSecs: number | undefined = rawSub?.time_spent_seconds;
  const violations: any[] = Array.isArray(rawSub?.proctoring_violations) ? rawSub.proctoring_violations : [];

  // Quiz / Activity Type Detection
  const quizType: 'LIVE_TIMED' | 'WORK_SUBMISSION' =
    isCohortActivity
      ? 'WORK_SUBMISSION'
      : rawSub?.quiz_type ||
        assignment?.quizRaw?.quiz_type ||
        (workText || workFileUrl || workLink ? 'WORK_SUBMISSION' : 'LIVE_TIMED');

  const isLiveTimed = !isCohortActivity && (quizType === 'LIVE_TIMED' || (breakdown.length > 0 && !workText && !workFileUrl && !workLink));
  const isWorkSubmission = isCohortActivity || quizType === 'WORK_SUBMISSION' || Boolean(workText || workFileUrl || workLink);

  // Questions Flagged for Review
  const flaggedReviewItems = breakdown.filter(
    (q: any) =>
      q.is_flagged_for_review ||
      (rawSub?.flagged_questions &&
        (rawSub.flagged_questions.includes(q.item_id) ||
          rawSub.flagged_questions.includes(q.order) ||
          rawSub.flagged_questions.includes(String(q.order))))
  );
  const flaggedReviewCount = flaggedReviewItems.length || (rawSub?.flagged_questions?.length || 0);

  const passingScore = assignment?.quizRaw?.passing_score ?? 70;
  const maxTabSwitchesAllowed = assignment?.quizRaw?.max_tab_switches_allowed ?? 3;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveGrade(student.studentId, pointsInput, feedbackInput, student.submissionId);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!student.completed) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}
        onClick={onClose}
      >
        <div
          className="canvas-card"
          style={{
            width: '100%',
            maxWidth: '560px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.25)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Clock size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Pending Submission
                  </h3>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#FEF3C7',
                      color: '#B45309',
                    }}
                  >
                    Pending
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                  Assessment: <strong style={{ color: '#1E293B' }}>{assignment?.title || rawSub?.quiz_title || 'Quiz'}</strong> • Student:{' '}
                  <strong style={{ color: '#1E293B' }}>{student.name}</strong> ({student.studentRollNo})
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748B',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="canvas-card"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: isLiveTimed ? '#EFF6FF' : '#F5F3FF',
                color: isLiveTimed ? '#0055A5' : '#7C3AED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {isLiveTimed ? 'Review Submission' : 'Grade Work Submission'}
                </h3>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: isLiveTimed ? '#DBEAFE' : '#EDE9FE',
                    color: isLiveTimed ? '#1E40AF' : '#6D28D9',
                  }}
                >
                  {isLiveTimed ? 'Live Timed' : 'Work Submission'}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                Assessment: <strong style={{ color: '#1E293B' }}>{assignment?.title || rawSub?.quiz_title || 'Quiz'}</strong> • Student:{' '}
                <strong style={{ color: '#1E293B' }}>{student.name}</strong> ({student.studentRollNo})
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div
          style={{
            padding: '22px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {/* Student Status Summary Banner */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.95rem' }}>
                {student.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                {student.category} • Roll ID: <span style={{ fontFamily: 'monospace' }}>{student.studentRollNo}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#15803D',
                  backgroundColor: '#DCFCE7',
                  border: '1px solid #BBF7D0',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Check size={13} />
                <span>Submitted</span>
              </span>
              {rawSub?.score !== null && rawSub?.score !== undefined && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#0055A5',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    padding: '4px 10px',
                    borderRadius: '999px',
                  }}
                >
                  Recorded Grade: {rawSub.score} / {rawSub.total_score || maxPoints} pts
                </span>
              )}
            </div>
          </div>

          {/* Grade Override Audit Alert Banner */}
          {Boolean(rawSub?.is_grade_overridden) && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#FEF3C7',
                border: '1px solid #FDE68A',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <AlertTriangle size={18} color="#B45309" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#92400E' }}>
                  Auto-Grade Overridden by {rawSub?.grade_overridden_by_name || 'Tutor'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#B45309', marginTop: '2px' }}>
                  Original system auto-grade: <strong>{rawSub?.auto_score ?? 'auto'} pts</strong>. Overridden to <strong>{rawSub?.score ?? pointsInput} pts</strong>
                  {rawSub?.grade_overridden_at ? ` on ${new Date(rawSub.grade_overridden_at).toLocaleString()}` : ''}.
                </div>
              </div>
            </div>
          )}


          {/* ──────────────────────────────────────────────────────────────────
              LIVE TIMED QUIZ SPECIFIC SECTION
             ────────────────────────────────────────────────────────────────── */}
          {isLiveTimed && (
            <>
              {/* Proctoring & Integrity Telemetry Card */}
              <div
                style={{
                  backgroundColor: isFlagged ? '#FEF2F2' : tabSwitches > 0 ? '#FFFBEB' : '#F8FAFC',
                  borderRadius: '8px',
                  border: `1px solid ${isFlagged ? '#FECACA' : tabSwitches > 0 ? '#FDE68A' : '#E2E8F0'}`,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isFlagged ? (
                      <AlertTriangle size={18} color="#DC2626" />
                    ) : tabSwitches > 0 ? (
                      <AlertTriangle size={18} color="#D97706" />
                    ) : (
                      <CheckCircle size={18} color="#16A34A" />
                    )}
                    <div>
                      <div
                        style={{
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          color: isFlagged ? '#991B1B' : tabSwitches > 0 ? '#92400E' : '#15803D',
                        }}
                      >
                        {isFlagged
                          ? `Proctoring Flagged: ${flagReason || 'Excessive tab switches detected'}`
                          : tabSwitches > 0
                          ? `Proctoring Alert: ${tabSwitches} tab switch(es) recorded`
                          : 'Proctoring Verified Clean'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        Tab Switches: <strong>{tabSwitches}</strong> / Max allowed: <strong>{maxTabSwitchesAllowed}</strong>
                        {timeSpentSecs !== undefined && timeSpentSecs > 0 && (
                          <span> • Session Duration: <strong>{Math.floor(timeSpentSecs / 60)}m {timeSpentSecs % 60}s</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {violations.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowProctoringViolationsLog((prev) => !prev)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#475569',
                      }}
                    >
                      {showProctoringViolationsLog ? 'Hide Violations Log' : `View Log (${violations.length})`}
                    </button>
                  )}
                </div>

                {showProctoringViolationsLog && violations.length > 0 && (
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '10px 12px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      fontSize: '0.76rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                      Chronological Tab Blur Telemetry:
                    </div>
                    {violations.map((v: any, idx: number) => (
                      <div key={idx} style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontFamily: 'monospace', color: '#0F172A' }}>
                          {v.timestamp ? new Date(v.timestamp).toLocaleTimeString() : `#${idx + 1}`}
                        </span>
                        <span>•</span>
                        <span>{v.reason || v.event || 'Window unfocused / tab changed'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Auto-Grade Decisions Summary Card */}
              {rawSub?.score !== null && rawSub?.score !== undefined && (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={17} color="#0055A5" />
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
                        System Auto-Grade Decision
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '4px',
                        backgroundColor: rawSub.is_passed ? '#DCFCE7' : '#FEE2E2',
                        color: rawSub.is_passed ? '#15803D' : '#DC2626',
                        border: `1px solid ${rawSub.is_passed ? '#86EFAC' : '#FCA5A5'}`,
                      }}
                    >
                      {rawSub.is_passed ? 'PASSED' : 'DID NOT PASS'}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '10px',
                      backgroundColor: '#F8FAFC',
                      padding: '10px 14px',
                      borderRadius: '6px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Auto-Graded Score</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                        {rawSub.score} / {rawSub.total_score || maxPoints} pts
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Percentage</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0055A5' }}>
                        {rawSub.percentage !== undefined ? `${rawSub.percentage}%` : `${Math.round(((rawSub.score || 0) / (rawSub.total_score || maxPoints || 1)) * 100)}%`}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Passing Benchmark</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#475569' }}>
                        {passingScore}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Accuracy</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#16A34A' }}>
                        {breakdown.filter((q: any) => q.is_correct).length} / {breakdown.length} Correct
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Questions Flagged for Review Banner */}
              {flaggedReviewCount > 0 && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <Flag size={18} color="#D97706" />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#92400E' }}>
                      {flaggedReviewCount} Question(s) Flagged for Review by Student
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#B45309' }}>
                      The student marked questions for secondary review during their session:{' '}
                      <strong>Q{flaggedReviewItems.map((q: any, i: number) => q.order || i + 1).join(', Q')}</strong>.
                      Review their choices and award adjusted manual points below if warranted.
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Questions & Student Answers */}
              {breakdown.length > 0 && (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <FileText size={16} color="#0055A5" />
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                        Questions & Student Answers
                      </h4>
                    </div>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0055A5' }}>
                      {breakdown.length} Total Questions
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {breakdown.map((q: any, idx: number) => {
                      const isCorrect = Boolean(q.is_correct);
                      const isFlaggedForReview = Boolean(
                        q.is_flagged_for_review ||
                          (rawSub?.flagged_questions &&
                            (rawSub.flagged_questions.includes(q.item_id) ||
                              rawSub.flagged_questions.includes(q.order) ||
                              rawSub.flagged_questions.includes(String(q.order))))
                      );
                      const opts = q.options && typeof q.options === 'object' ? q.options : {};
                      const optKeys = Object.keys(opts);

                      return (
                        <div
                          key={q.item_id || idx}
                          style={{
                            padding: '14px 16px',
                            backgroundColor: '#F8FAFC',
                            borderRadius: '8px',
                            border: `1px solid ${isFlaggedForReview ? '#F59E0B' : isCorrect ? '#E2E8F0' : '#FECACA'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1E293B', flex: 1 }}>
                              <span style={{ color: '#64748B', marginRight: '6px' }}>Q{q.order || idx + 1}.</span>
                              {q.question_text}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                              {isFlaggedForReview && (
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    color: '#B45309',
                                    backgroundColor: '#FEF3C7',
                                    border: '1px solid #FDE68A',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                  }}
                                  title="Student flagged this question for review during attempt"
                                >
                                  <Flag size={11} />
                                  <span>Flagged for Review</span>
                                </span>
                              )}
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  color: isCorrect ? '#15803D' : '#DC2626',
                                  backgroundColor: isCorrect ? '#DCFCE7' : '#FEE2E2',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                {isCorrect ? <Check size={11} /> : <X size={11} />}
                                <span>{isCorrect ? `${q.points} / ${q.points} pts` : `0 / ${q.points} pts`}</span>
                              </span>
                            </div>
                          </div>

                          {/* Multiple choice options */}
                          {optKeys.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '4px' }}>
                              {optKeys.map((k) => {
                                const isStudentChoice = String(q.student_answer).trim().toUpperCase() === k.toUpperCase();
                                const isCorrectChoice = String(q.correct_option || q.correct_answer).trim().toUpperCase() === k.toUpperCase();

                                let rowBg = '#FFFFFF';
                                let rowBorder = '#E2E8F0';
                                let badgeText: string | null = null;
                                let badgeColor = '#64748B';

                                if (isStudentChoice && isCorrectChoice) {
                                  rowBg = '#F0FDF4';
                                  rowBorder = '#86EFAC';
                                  badgeText = 'Student Selected (Correct)';
                                  badgeColor = '#15803D';
                                } else if (isStudentChoice && !isCorrectChoice) {
                                  rowBg = '#FEF2F2';
                                  rowBorder = '#FCA5A5';
                                  badgeText = 'Student Selected (Incorrect)';
                                  badgeColor = '#DC2626';
                                } else if (isCorrectChoice) {
                                  rowBg = '#F0FDF4';
                                  rowBorder = '#BBF7D0';
                                  badgeText = 'Correct Answer';
                                  badgeColor = '#16A34A';
                                }

                                return (
                                  <div
                                    key={k}
                                    style={{
                                      padding: '8px 12px',
                                      borderRadius: '4px',
                                      backgroundColor: rowBg,
                                      border: `1px solid ${rowBorder}`,
                                      fontSize: '0.8rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                    }}
                                  >
                                    <div>
                                      <strong style={{ marginRight: '6px', color: '#334155' }}>{k}.</strong>
                                      <span style={{ color: '#1E293B' }}>{opts[k]}</span>
                                    </div>
                                    {badgeText && (
                                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: badgeColor }}>
                                        {badgeText}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                              Student Answer: <strong>{q.student_answer || 'None provided'}</strong>
                            </div>
                          )}

                          {q.explanation && (
                            <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px', fontStyle: 'italic' }}>
                              Explanation: {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              WORK SUBMISSION SPECIFIC SECTION
             ────────────────────────────────────────────────────────────────── */}
          {isWorkSubmission && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#7C3AED" />
                <div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                    Student Work Submission Contents
                  </h4>
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                    Review the student's written response and attached files, then manually award points and provide rubric remarks below.
                  </div>
                </div>
              </div>

              {workText ? (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Written Response / Submission Body:
                  </div>
                  <div
                    style={{
                      padding: '14px 16px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.88rem',
                      lineHeight: '1.65',
                      color: '#1E293B',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '260px',
                      overflowY: 'auto',
                    }}
                  >
                    {workText}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic' }}>
                  No written text was provided for this submission.
                </div>
              )}

              {workLink && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '6px',
                    backgroundColor: '#F0F9FF',
                    border: '1px solid #BAE6FD',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ExternalLink size={16} color="#0284C7" />
                    <span style={{ fontSize: '0.84rem', color: '#0369A1', fontWeight: 600 }}>
                      Shared URL / Student Link:
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#1E293B', fontWeight: 500, maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {workLink}
                    </span>
                  </div>
                  <a
                    href={workLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="canvas-btn"
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#FFFFFF',
                      backgroundColor: '#0055A5',
                      borderRadius: '4px',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={13} />
                    <span>Open Student Link</span>
                  </a>
                </div>
              )}

              {workFileUrl ? (
                (() => {
                  const isGradingPdf = Boolean(
                    /\.pdf(\?.*)?$/i.test(workFileUrl) ||
                      workFileUrl.toLowerCase().includes('.pdf') ||
                      rawSub?.submission_method === 'pdf_upload' ||
                      (assignment as any)?.activityRaw?.submission_type === 'FILE_UPLOAD' ||
                      (assignment as any)?.submission_type === 'FILE_UPLOAD'
                  );
                  const isGradingImg = Boolean(
                    /\.(png|jpe?g|webp|gif|svg)$/i.test(workFileUrl) ||
                      rawSub?.submission_method === 'image_upload'
                  );

                  if (isGradingPdf) {
                    return (
                      <div style={{ marginTop: '10px' }}>
                        <PdfViewer
                          url={workFileUrl}
                          title={`${student.name}'s PDF Submission`}
                          minHeight="540px"
                        />
                      </div>
                    );
                  }

                  if (isGradingImg) {
                    return (
                      <div
                        style={{
                          marginTop: '10px',
                          border: '1px solid #BAE6FD',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          padding: '12px',
                          backgroundColor: '#F0F9FF',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0369A1', marginBottom: '8px', textAlign: 'left' }}>
                          Student Image Submission:
                        </div>
                        <img
                          src={workFileUrl}
                          alt="Student submission"
                          style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '4px', objectFit: 'contain' }}
                        />
                      </div>
                    );
                  }

                  return (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        backgroundColor: '#F0F9FF',
                        borderRadius: '6px',
                        border: '1px solid #BAE6FD',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Download size={18} color="#0284C7" />
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0369A1' }}>
                            Attachment Uploaded
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#0284C7' }}>
                            Student attached file for manual grading evaluation
                          </div>
                        </div>
                      </div>
                      <a
                        href={workFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="canvas-btn"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          backgroundColor: '#0284C7',
                          color: '#FFFFFF',
                          borderRadius: '4px',
                          textDecoration: 'none',
                        }}
                      >
                        <span>View / Download File</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  );
                })()
              ) : (
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic' }}>
                  No file attachment was uploaded for this submission.
                </div>
              )}
            </div>
          )}

          {!student.completed && (
            <div
              style={{
                padding: '14px',
                textAlign: 'center',
                backgroundColor: '#FFFBEB',
                borderRadius: '6px',
                border: '1px solid #FDE68A',
                color: '#92400E',
                fontSize: '0.82rem',
              }}
            >
              Student has not yet finalized this submission. Tutors may record a provisional manual score or evaluation comments.
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              MANUAL GRADING & EVALUATION FORM (FOR BOTH TYPES)
             ────────────────────────────────────────────────────────────────── */}
          <form
            id="tutor-grading-form"
            onSubmit={handleSave}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={16} color="#0055A5" />
              <span>{isWorkSubmission ? 'Manual Grading & Score Award' : 'Tutor Manual Grade Override & Evaluation'}</span>
            </div>
            {isLiveTimed && (
              <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                System original auto-grade: <strong>{rawSub?.auto_score ?? (student.score ? student.score.split('/')[0].trim() : 'auto')} / {maxPoints} pts</strong>.
                {rawSub?.is_grade_overridden
                  ? ` Overridden by ${rawSub.grade_overridden_by_name || 'Tutor'}.`
                  : ' Overriding this will record an audit trail entry under your name.'}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Awarded Points (Max: {maxPoints} pts)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min="0"
                  max={maxPoints}
                  value={pointsInput}
                  onChange={(e) => setPointsInput(e.target.value)}
                  placeholder={`e.g. ${maxPoints}`}
                  style={{
                    width: '130px',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: '#1E293B',
                  }}
                  required
                />
                <span style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: 600 }}>/ {maxPoints} pts</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Tutor Feedback & Evaluation Remarks (Visible to Student)
              </label>
              <textarea
                rows={3}
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="Write constructive evaluation notes, rubric commentary, or improvement feedback..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '4px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  color: '#1E293B',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            backgroundColor: '#F8FAFC',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="canvas-btn"
            style={{
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            form="tutor-grading-form"
            type="submit"
            disabled={isSubmitting}
            className="canvas-btn"
            style={{
              padding: '8px 20px',
              fontSize: '0.82rem',
              fontWeight: 700,
              backgroundColor: '#0055A5',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            <span>{isSubmitting ? 'Saving to Database...' : 'Save & Update Grade'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

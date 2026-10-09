import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Course } from '../../../../core/models/Course';
import { useAuth } from '../../../../context/AuthContext';
import { useTranslation } from '../../../../context/I18nContext';
import { useToast } from '../../../../context/ToastContext';
import { SupportTicketService, type SupportAnnouncementDTO } from '../../../../core/services/SupportTicketService';
import { AdminService } from '../../../../core/services/AdminService';
import {
  TutorLmsService,
  type CohortSelectorItem,
  type CohortModuleItem,
} from '../../../../core/services/TutorLmsService';
import { TutorQuizUpdateModal } from '../quiz/TutorQuizUpdateModal';

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
    completed: boolean;
    score: string | null;
    submittedAt: string | null;
    isLate: boolean;
    daysLate: number;
    feedback?: string;
  }[];
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
  const navigate = useNavigate();

  const isTutor = user?.isTutor();
  const isGuest = user?.role === 'GUEST';

  const [activeTab, setActiveTab] = useState<CourseWorkspaceTab>(
    highlightAnnouncementId ? 'announcements' : 'home'
  );
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

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



  const courseStudents = [
    { id: 'u-3', name: 'Alice Uwase', studentId: 'SF-2026-0904', category: 'General Road Rules' },
    { id: 'u-4', name: 'Jean Mugisha', studentId: 'SF-2026-0891', category: 'National Mock Exam Prep' },
    { id: 'u-5', name: 'Patrick Ndayisaba', studentId: 'SF-2026-0912', category: 'Road Signs & Markings' },
    { id: 'u-6', name: 'Diane Mukamana', studentId: 'SF-2026-0925', category: 'Intersections & Priorities' },
    { id: 'u-7', name: 'Eric Bizimana', studentId: 'SF-2026-0940', category: 'General Road Rules' },
    { id: 'u-8', name: 'Sandrine Uwitonze', studentId: 'SF-2026-0955', category: 'National Mock Exam Prep' },
  ];

  // Selected assignment for Tutor & Student detailed inspection view (managed via URL & state)
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Quizzes/Assignments with individual student completion details & tutor controls
  const [assignmentsData, setAssignmentsData] = useState<CourseAssignmentItem[]>([]);

  // Visible assignments for the current viewer:
  // - Tutors see all quizzes (including locked ones, so tutor can inspect, manage, and unlock them)
  // - Students from that cohort can NOT see locked quizzes anywhere (completely hidden from assignments & grades)
  const visibleAssignments = isTutor ? assignmentsData : assignmentsData.filter((a) => !a.isLocked);

  useEffect(() => {
    let isMounted = true;
    const fetchQuizzes = async () => {
      try {
        const allQuizzes = await AdminService.getInstance().getQuizzes();
        if (!isMounted) return;

        // Quizzes specifically targeting this course, or all active quizzes
        const courseQuizzes = allQuizzes.filter(
          (q) => !q.course || String(q.course) === String(course.id)
        );
        const candidateQuizzes = courseQuizzes.length > 0 ? courseQuizzes : allQuizzes;

        // Drafts are strictly for Training Admin and System Admin.
        // Tutors and Students must NOT see drafts.
        // Published quizzes (Open, Scheduled, Closed) are visible and controllable by tutors.
        const targetQuizzes = candidateQuizzes.filter((q) => {
          return q.is_published && q.status !== 'DRAFT';
        });

        if (targetQuizzes.length > 0) {
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

            const isLockedStored = localStorage.getItem(`sifo_quiz_locked_${quiz.id}`);
            let isLocked: boolean;
            if (typeof quiz.is_locked === 'boolean') {
              isLocked = quiz.is_locked;
            } else if (isLockedStored !== null) {
              isLocked = isLockedStored === 'true';
            } else {
              // By default, quizzes are locked for cohorts until a tutor unlocks/publishes them
              isLocked = true;
            }

            return {
              id: quiz.id,
              title: quiz.title,
              points: totalScore,
              timeLimit: `${quiz.time_limit_minutes || 20} Minutes`,
              timeLimitMinutes: quiz.time_limit_minutes || 20,
              attemptsAllowed: quiz.max_attempts || 1,
              isLocked,
              gradesPublished: Boolean(
                Boolean(quiz.deadline && new Date(quiz.deadline) <= new Date()) &&
                  localStorage.getItem(`sifo_quiz_grades_published_${quiz.id}`) === 'true'
              ),
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
              score: isPast ? `${Math.max(14, totalScore - 2)} / ${totalScore}` : null,
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
              submissions: courseStudents.map((st, sIdx) => ({
                studentId: st.id,
                completed: isPast ? sIdx % 2 === 0 : sIdx === 0,
                score:
                  isPast && sIdx % 2 === 0
                    ? `${Math.max(14, totalScore - sIdx)} / ${totalScore}`
                    : sIdx === 0
                    ? `${Math.max(16, totalScore - 1)} / ${totalScore}`
                    : null,
                submittedAt: isPast || sIdx === 0 ? 'Recently' : null,
                isLate: false,
                daysLate: 0,
              })),
            };
          });

          setAssignmentsData(mapped);
        } else {
          setAssignmentsData([]);
        }
      } catch (err) {
        console.error('Failed to sync course assignments:', err);
      }
    };

    fetchQuizzes();
    return () => {
      isMounted = false;
    };
  }, [course.id, isTutor]);

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
            // If due date was updated and has not arrived yet, grades cannot be published
            const isDuePassed = Boolean(merged.rawDueDate && new Date(merged.rawDueDate) <= new Date());
            if (!isDuePassed) {
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

  // Tutor lock/unlock handler for quizzes for the ACTIVE COHORT ONLY
  const handleToggleLock = async (assignmentId: string) => {
    const targetItem = assignmentsData.find((item) => item.id === assignmentId);
    if (!targetItem) return;
    const nextLocked = !targetItem.isLocked;

    // Immediately update local UI state
    setAssignmentsData((prev) =>
      prev.map((item) => {
        if (item.id === assignmentId) {
          return { ...item, isLocked: nextLocked };
        }
        return item;
      })
    );

    // Sync cohort lock state to backend for active cohort ONLY
    try {
      if (activeCohortId) {
        await TutorLmsService.getInstance().scheduleCohortQuiz(activeCohortId, assignmentId, {
          is_locked: nextLocked,
          is_published: !nextLocked,
        });
      }
    } catch (err) {
      console.error('Failed to sync cohort quiz schedule:', err);
    }
  };

  // Tutor student grading modal state
  const [gradingStudentModal, setGradingStudentModal] = useState<{
    studentId: string;
    name: string;
    studentRollNo: string;
    category: string;
    score: string;
    feedback: string;
    completed: boolean;
  } | null>(null);

  // Tutor publish grades handler - grades CANNOT be published before assignment due date reaches!
  const handlePublishGrades = (assignmentId: string) => {
    const target = assignmentsData.find((a) => a.id === assignmentId);
    if (!target) return;
    const isDuePassed = Boolean(target.rawDueDate && new Date(target.rawDueDate) <= new Date());
    if (!isDuePassed) {
      alert(
        `Illogical action prevented: Grades cannot be published before the assignment due date (${target.dueDate || 'scheduled deadline'}) has reached.`
      );
      return;
    }
    localStorage.setItem(`sifo_quiz_grades_published_${assignmentId}`, 'true');
    setAssignmentsData((prev) =>
      prev.map((item) =>
        item.id === assignmentId ? { ...item, gradesPublished: true } : item
      )
    );
  };

  // Tutor individual student grading handler
  const handleSaveStudentGrade = (
    assignmentId: string,
    studentId: string,
    score: string,
    feedback: string
  ) => {
    setAssignmentsData((prev) =>
      prev.map((asg) => {
        if (asg.id !== assignmentId) return asg;
        const formattedScore = score
          ? score.includes('/')
            ? score
            : `${score} / ${asg.points}`
          : null;
        const updatedSubmissions = asg.submissions.map((sub) => {
          if (sub.studentId !== studentId) return sub;
          return {
            ...sub,
            completed: true,
            score: formattedScore,
            feedback,
            submittedAt: sub.submittedAt || 'Today',
          };
        });
        return { ...asg, submissions: updatedSubmissions };
      })
    );
    setGradingStudentModal(null);
  };

  // Auto-grade completed submissions shortcut
  const handleAutoGradeCompleted = (assignmentId: string) => {
    setAssignmentsData((prev) =>
      prev.map((asg) => {
        if (asg.id !== assignmentId) return asg;
        const updatedSubmissions = asg.submissions.map((sub, sIdx) => {
          if (!sub.completed || sub.score) return sub;
          const assignedPts = Math.max(Math.round(asg.points * 0.75), asg.points - (sIdx % 3));
          return {
            ...sub,
            score: `${assignedPts} / ${asg.points}`,
            feedback: 'Satisfactory completion verified by tutor.',
            submittedAt: sub.submittedAt || 'Today',
          };
        });
        return { ...asg, submissions: updatedSubmissions };
      })
    );
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
                    }
                  }}
                  style={{
                    color: (selectedLessonId || selectedAssignmentId || (activeTab === 'people' && activeGroupId)) ? '#0055A5' : '#2D3B45',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: (selectedLessonId || selectedAssignmentId || (activeTab === 'people' && activeGroupId)) ? 'pointer' : 'default',
                    textDecoration: (selectedLessonId || selectedAssignmentId || (activeTab === 'people' && activeGroupId)) ? 'underline' : 'none',
                  }}
                >
                  {activeTab}
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
                  {assignmentsData.find((a) => a.id === selectedAssignmentId)?.title || 'Assessment'}
                </span>
                {isGradingView && isTutor && (
                  <>
                    <ChevronRight size={15} color="#9CA3AF" />
                    <span style={{ color: '#2D3B45', fontWeight: 700 }}>Grading</span>
                  </>
                )}
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
                    const studentInfo = courseStudents.find((s) => s.id === sub.studentId);
                    return {
                      ...sub,
                      name: studentInfo?.name || 'Unknown Student',
                      studentRollNo: studentInfo?.studentId || 'N/A',
                      category: studentInfo?.category || 'General',
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
                    const isDuePassed = Boolean(
                      currentAsg.rawDueDate && new Date(currentAsg.rawDueDate) <= new Date()
                    );
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
                                    color: currentAsg.gradesPublished ? '#15803D' : !isDuePassed ? '#B45309' : '#0055A5',
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
                                  ) : !isDuePassed ? (
                                    <>
                                      <Lock size={13} color="#B45309" />
                                      <span>Awaiting</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock size={13} color="#0055A5" />
                                      <span>Due Date Reached — Ready to Publish</span>
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
                                    disabled={!isDuePassed}
                                    className="canvas-btn"
                                    style={{
                                      padding: '7px 16px',
                                      fontSize: '0.8rem',
                                      fontWeight: 700,
                                      backgroundColor: isDuePassed ? '#0055A5' : '#94A3B8',
                                      color: '#FFFFFF',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: isDuePassed ? 'pointer' : 'not-allowed',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      opacity: isDuePassed ? 1 : 0.75,
                                    }}
                                    title={
                                      isDuePassed
                                        ? 'Publish grades to all students in this cohort'
                                        : `Grades cannot be published until the assignment due date has passed (${currentAsg.dueDate})`
                                    }
                                  >
                                    {isDuePassed ? <Check size={14} /> : <Lock size={14} />}
                                    <span>{isDuePassed ? 'Publish Grades' : 'Grades Locked (Due Date Pending)'}</span>
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
                                    style={{
                                      padding: '14px 18px',
                                      borderBottom: '1px solid #F1F5F9',
                                      display: 'grid',
                                      gridTemplateColumns: '2fr 1fr 1.2fr 1fr 1.2fr 1fr',
                                      alignItems: 'center',
                                      fontSize: '0.84rem',
                                      backgroundColor: '#FFFFFF',
                                    }}
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

                                    <div style={{ fontWeight: 700, color: st.completed ? '#0055A5' : '#94A3B8' }}>
                                      {st.score || '—'}
                                    </div>

                                    <div style={{ color: '#64748B', fontSize: '0.78rem' }}>
                                      {st.submittedAt || '—'}
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                      <button
                                        onClick={() =>
                                          setGradingStudentModal({
                                            studentId: st.studentId,
                                            name: st.name,
                                            studentRollNo: st.studentRollNo,
                                            category: st.category,
                                            score: st.score || '',
                                            feedback: st.feedback || '',
                                            completed: st.completed,
                                          })
                                        }
                                        className="canvas-btn"
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '5px',
                                          padding: '5px 12px',
                                          fontSize: '0.75rem',
                                          fontWeight: 600,
                                          backgroundColor: '#FFFFFF',
                                          color: '#0055A5',
                                          border: '1px solid #0055A5',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                        }}
                                        title={`Grade or update score for ${st.name}`}
                                      >
                                        <Award size={13} />
                                        <span>{st.score ? 'Edit Grade' : 'Grade'}</span>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                            {currentAsg.title}
                          </h2>
                        </div>

                        {/* Tutor Actions Toolbar */}
                        {isTutor && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
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
                              }}
                              title={currentAsg.isLocked ? `Unlock for ${activeCohortName}` : `Lock for ${activeCohortName}`}
                            >
                              {currentAsg.isLocked ? <Unlock size={14} /> : <Lock size={14} />}
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
                          </div>
                        )}
                      </div>

                      {/* Common Assessment Metadata Summary */}
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
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#1E293B', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.02em' }}>Closing</div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#475569', marginTop: '2px' }}>
                            {currentAsg.closingDate}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#1E293B', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.02em' }}>Points & Time Limit</div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#0055A5', marginTop: '2px' }}>
                            {currentAsg.points} pts • {currentAsg.timeLimit}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#1E293B', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.02em' }}>Late Submission</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 500, color: currentAsg.allowLateSubmission ? '#B45309' : '#64748B', marginTop: '2px' }}>
                            {currentAsg.allowLateSubmission
                              ? `Allowed until closing date (${currentAsg.closingDate})`
                              : 'Strict Deadline — No late submissions'}
                          </div>
                        </div>
                      </div>

                      {/* Instructions & Grading Rubric Section */}
                      <div className="canvas-card" style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#DC2626', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <BookOpen size={17} color="#DC2626" />
                          <span>Instructions & Requirements</span>
                        </h3>
                        <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
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

                      {/* STUDENT VIEW: Personal Submission Details & Take Quiz Button */}
                      {!isTutor && (
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
                                Your Assessment Status
                              </div>
                              {currentAsg.status === 'Graded' ? (
                                <div style={{ marginTop: '4px' }}>
                                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803D' }}>
                                    Score: {currentAsg.score}
                                  </div>
                                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                                    Completed & Graded • Passing Grade Achieved
                                  </div>
                                </div>
                              ) : (
                                <div style={{ marginTop: '4px' }}>
                                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B' }}>
                                    {currentAsg.title}
                                  </div>
                                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                                    Review the rubrics and guidelines above before starting.
                                  </div>
                                </div>
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
                                <span><strong>Attempts:</strong> {currentAsg.attemptsAllowed} {currentAsg.attemptsAllowed === 1 ? 'attempt' : 'attempts'} allowed</span>
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
                              ) : (
                                <button
                                  onClick={() => navigate('/practice-quiz')}
                                  className="canvas-btn canvas-btn-primary"
                                  style={{
                                    padding: '10px 24px',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                  }}
                                >
                                  <span>{currentAsg.status === 'Graded' ? 'Retake Quiz' : 'Take Quiz'}</span>
                                  <ChevronRight size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })()
              ) : (
                /* Default Assignments List: No external Take Quiz button */
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2D3B45', margin: 0 }}>
                        Course Assessments & Quizzes
                      </h2>
                      <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: '3px 0 0 0' }}>
                        {isTutor
                          ? `Target Cohort: ${activeCohortName} — Control quiz lock/unlock visibility individually for this cohort.`
                          : 'Select an assessment below to review instructions, submission rules, and rubrics before starting.'}
                      </p>
                    </div>
                  </div>

                  {/* UPCOMING & ACTIVE ASSIGNMENTS BLOCK */}
                  <div className="canvas-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 18px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB', fontWeight: 700, fontSize: '0.88rem', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="#64748B" />
                        <span>Upcoming & Active Assignments ({visibleAssignments.filter(a => a.status === 'Open' || a.status === 'Scheduled').length})</span>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                        {isTutor ? 'Click to inspect submissions & grade' : 'Click to read instructions & open assessment'}
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
                            const totalRoster = item.submissions?.length || courseStudents.length;
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
                                  <Award size={18} color="#64748B" />
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                                        {item.title}
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
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                                      {item.openDate !== 'Open Access' ? `Opens: ${item.openDate} • ` : ''}Due: {item.dueDate} • {item.points} pts • {item.type}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  {isTutor ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      <button
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
                                        }}
                                        title={item.isLocked ? `Unlock for ${activeCohortName}` : `Lock for ${activeCohortName}`}
                                      >
                                        {item.isLocked ? <Unlock size={12} /> : <Lock size={12} />}
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
                                  ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                                        View Instructions & Details
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

                  {/* PAST ASSIGNMENTS BLOCK */}
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
                            const totalRoster = item.submissions?.length || courseStudents.length;
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
                                  <Award size={18} color="#64748B" />
                                  <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                                      {item.title}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                                      Due: {item.dueDate} • {item.points} pts • {item.type}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  {isTutor ? (
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
                                  ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                                          Score: {item.gradesPublished && item.score ? item.score : 'Grade Pending'}
                                        </span>
                                        <div style={{ fontSize: '0.68rem', color: item.gradesPublished ? '#15803D' : '#64748B' }}>
                                          {item.gradesPublished ? 'Graded & Released' : 'Awaiting Grade Release'}
                                        </div>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2D3B45', margin: 0 }}>
                  Your Course Grade Report
                </h2>
                <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: '3px 0 0 0' }}>
                  Minimum passing benchmark for provisional exam certification is 88% (18/20 minimum).
                </p>
              </div>

              <div className="canvas-card" style={{ padding: '20px', backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B' }}>
                    Weighted Course Average: <strong style={{ color: '#058728' }}>94.2% (Grade A)</strong>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: '#DCFCE7',
                      color: '#15803D',
                      padding: '3px 10px',
                      borderRadius: '2px',
                    }}
                  >
                    Final Exam Ready
                  </span>
                </div>

                <div style={{ border: '1px solid #E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                        <th style={{ padding: '10px 14px', color: '#475569' }}>Name</th>
                        <th style={{ padding: '10px 14px', color: '#475569' }}>Due</th>
                        <th style={{ padding: '10px 14px', color: '#475569' }}>Score</th>
                        <th style={{ padding: '10px 14px', color: '#475569' }}>Out of</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleAssignments.map((asg) => (
                        <tr key={asg.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0055A5' }}>{asg.title}</td>
                          <td style={{ padding: '12px 14px', color: '#64748B' }}>{asg.dueDate}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: asg.score ? '#058728' : '#94A3B8' }}>
                            {asg.score ? asg.score.split('/')[0].trim() : '-'}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#64748B' }}>{asg.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
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
            />
          )}

          {/* TAB 8: LIVE CLASSES */}
          {activeTab === 'live' && (
            <CourseLiveClassesTab isTutor={Boolean(isTutor)} cohortId={activeCohortId} />
          )}
        </main>

        {/* Column 3: Canvas Right Sidebar */}
        {!selectedLessonId && (
          <CourseRightSidebar
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setActiveGroupId(null);
            }}
            onOpenGroup={handleOpenGroupFromSidebar}
            isTutor={Boolean(isTutor)}
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
      {gradingStudentModal && selectedAssignmentId && (() => {
        const activeAsgForModal = assignmentsData.find((a) => a.id === selectedAssignmentId);
        if (!activeAsgForModal) return null;
        return (
          <TutorStudentGradingModal
            isOpen={Boolean(gradingStudentModal)}
            student={gradingStudentModal}
            maxPoints={activeAsgForModal.points}
            onClose={() => setGradingStudentModal(null)}
            onSaveGrade={(studentId, score, feedback) =>
              handleSaveStudentGrade(activeAsgForModal.id, studentId, score, feedback)
            }
          />
        );
      })()}
    </div>
  );
};

interface TutorStudentGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    studentId: string;
    name: string;
    studentRollNo: string;
    category: string;
    score: string;
    feedback: string;
    completed: boolean;
  } | null;
  maxPoints: number;
  onSaveGrade: (studentId: string, score: string, feedback: string) => void;
}

const TutorStudentGradingModal: React.FC<TutorStudentGradingModalProps> = ({
  isOpen,
  onClose,
  student,
  maxPoints,
  onSaveGrade,
}) => {
  if (!isOpen || !student) return null;

  const currentPointsValue = student.score
    ? student.score.split('/')[0].trim()
    : '';

  const [pointsInput, setPointsInput] = useState(currentPointsValue);
  const [feedbackInput, setFeedbackInput] = useState(student.feedback || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGrade(student.studentId, pointsInput, feedbackInput);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="canvas-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="#0055A5" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
              Grade Assessment Submission
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#F1F5F9',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem' }}>{student.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Roll: {student.studentRollNo} • {student.category}
              </div>
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: student.completed ? '#15803D' : '#B45309',
                backgroundColor: student.completed ? '#DCFCE7' : '#FEF3C7',
                padding: '3px 8px',
                borderRadius: '4px',
              }}
            >
              {student.completed ? 'Submitted' : 'Pending Submission'}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Score (Max Points: {maxPoints})
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min="0"
                max={maxPoints}
                value={pointsInput}
                onChange={(e) => setPointsInput(e.target.value)}
                placeholder="e.g. 18"
                style={{
                  width: '120px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
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
              Tutor Feedback & Evaluation Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              placeholder="Provide constructive feedback or rubric evaluation comments..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #CBD5E1',
                fontSize: '0.84rem',
                color: '#1E293B',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              paddingTop: '10px',
              borderTop: '1px solid #F1F5F9',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="canvas-btn"
              style={{
                padding: '7px 14px',
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
              type="submit"
              className="canvas-btn"
              style={{
                padding: '7px 18px',
                fontSize: '0.82rem',
                fontWeight: 700,
                backgroundColor: '#0055A5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Check size={14} />
              <span>Save Grade</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

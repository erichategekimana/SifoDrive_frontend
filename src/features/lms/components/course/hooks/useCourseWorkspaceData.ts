import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Course } from '../../../../../core/models/Course';
import { SupportTicketService, type SupportAnnouncementDTO } from '../../../../../core/services/SupportTicketService';
import { AdminService, type QuizSubmissionItem } from '../../../../../core/services/AdminService';
import {
  TutorLmsService,
  type CohortSelectorItem,
  type CohortModuleItem,
  type CohortActivityItem,
  type CohortStudentItem,
  type StudentActivitySubmissionItem,
} from '../../../../../core/services/TutorLmsService';
import { HttpClient } from '../../../../../core/api/HttpClient';
import { StudentAccountService } from '../../../../../core/services/StudentAccountService';
import type { CourseAssignmentItem } from '../types';
import { parseRubrics } from '../utils/rubricUtils';
import { formatD } from '../utils/dateUtils';

interface UseCourseWorkspaceDataParams {
  course: Course;
  user: any;
  initialAnnouncements?: SupportAnnouncementDTO[];
  isTutor: boolean;
  isTrainingAdmin: boolean;
  showToastSuccess: (msg: string) => void;
  showToastError: (msg: string) => void;
}

export function useCourseWorkspaceData({
  course,
  user,
  initialAnnouncements = [],
  isTutor,
  isTrainingAdmin,
  showToastSuccess,
  showToastError,
}: UseCourseWorkspaceDataParams) {
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
    rate?: number;
    percentage?: number;
    meets_threshold?: boolean;
    present_count?: number;
    late_count?: number;
    absent_count?: number;
    total_classes?: number;
    total_attended?: number;
  } | null>(null);

  useEffect(() => {
    if (isTutor) return;
    let isMounted = true;
    HttpClient.getInstance()
      .get<any>('/api/v1/live-classes/my-attendance/')
      .then((res) => {
        if (!isMounted) return;
        const summary = res?.data?.summary || res?.summary;
        if (summary) setAttendanceSummary(summary);
      })
      .catch(() => {
        StudentAccountService.getInstance()
          .getEligibility()
          .then((elig) => {
            if (!isMounted) return;
            if (elig?.criteria?.attendance_rate !== undefined) {
              setAttendanceSummary({
                attendance_rate: elig.criteria.attendance_rate,
                rate: elig.criteria.attendance_rate,
                percentage: Math.round(elig.criteria.attendance_rate * 100),
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
    const absentCount = (attendanceSummary as any)?.absent_count ?? 0;
    const lateCount = (attendanceSummary as any)?.late_count ?? 0;

    // Real Roll Call Rule: If student has no absence and no late, they have 100%
    if (absentCount === 0 && lateCount === 0) {
      return 100;
    }

    if ((attendanceSummary as any)?.percentage !== undefined) {
      return Math.round((attendanceSummary as any).percentage);
    }
    if ((attendanceSummary as any)?.rate !== undefined) {
      const r = (attendanceSummary as any).rate;
      return Math.round(r <= 1 ? r * 100 : r);
    }
    if ((attendanceSummary as any)?.attendance_rate !== undefined) {
      const r = (attendanceSummary as any).attendance_rate;
      return Math.round(r <= 1 ? r * 100 : r);
    }

    const presentCount = (attendanceSummary as any)?.present_count ?? 0;
    const totalMarked = presentCount + lateCount + absentCount;
    if (totalMarked > 0) {
      const earned = presentCount + lateCount * 0.8;
      return Math.round((earned / totalMarked) * 100);
    }

    return 100;
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

  // Announcements state
  const [showPostAnnouncementModal, setShowPostAnnouncementModal] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementTargetType, setAnnouncementTargetType] = useState<'SINGLE_COHORT' | 'ALL_ASSIGNED_COHORTS'>('ALL_ASSIGNED_COHORTS');
  const [announcementCohortId, setAnnouncementCohortId] = useState<string>('');
  const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [localAnnouncements, setLocalAnnouncements] = useState<SupportAnnouncementDTO[]>(initialAnnouncements);

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

  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [assignmentsData, setAssignmentsData] = useState<CourseAssignmentItem[]>([]);

  // Unified mixed assignments: Quizzes + Cohort Activities
  const mixedAssignments = useMemo<CourseAssignmentItem[]>(() => {
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
  }, [assignmentsData, cohortActivities, cohortStudents, activitySubmissionsMap, isTutor]);

  const visibleAssignments = isTutor ? mixedAssignments : mixedAssignments.filter((a) => !a.isLocked);

  const fetchQuizzes = useCallback(async () => {
    try {
      const allQuizzes = await AdminService.getInstance().getQuizzes(
        activeCohortId ? { cohort: activeCohortId } : undefined
      );

      const courseQuizzes = allQuizzes.filter(
        (q) => !q.course || String(q.course) === String(course.id)
      );

      const targetQuizzes = courseQuizzes.filter((q) => {
        return q.is_published && q.status !== 'DRAFT';
      });

      if (targetQuizzes.length > 0) {
        let currentStudents = cohortStudents;
        if (currentStudents.length === 0 && activeCohortId) {
          try {
            currentStudents = await TutorLmsService.getInstance().getCohortStudents(activeCohortId);
            setCohortStudents(currentStudents);
          } catch {}
        }

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

        const quizSubmissionsMap: Record<string, QuizSubmissionItem[]> = {};
        await Promise.all(
          targetQuizzes.map(async (quiz) => {
            try {
              let subs = await AdminService.getInstance().getQuizSubmissions(
                quiz.id,
                undefined,
                activeCohortId || undefined
              );
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
            isLocked = storedLocked === 'true';
          } else if (cohortSch && typeof cohortSch.is_locked === 'boolean') {
            isLocked = cohortSch.is_locked;
          } else if (typeof quiz.is_locked === 'boolean') {
            isLocked = quiz.is_locked;
          } else {
            isLocked = true;
          }

          const dbSubs = quizSubmissionsMap[quiz.id] || [];

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

            return {
              studentId: st.id,
              studentName: st.name,
              studentRollNo: st.student_id,
              category: st.category,
              completed: isCompleted,
              submissionId: effectiveSub?.id || null,
              score: finalScore,
              feedback: effectiveSub?.feedback || '',
              submittedAt: effectiveSub?.created_at ? formatD(effectiveSub.created_at) : null,
              isLate: false,
              daysLate: 0,
              rawSubmission: effectiveSub ? { ...effectiveSub } : null,
            };
          });

          const unmappedSubs = dbSubs.filter(
            (sub) => !currentStudents.some((st) => String(st.id) === String(sub.student))
          );
          for (const sub of unmappedSubs) {
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
              rawSubmission: { ...sub },
            });
          }

          let personalScore: string | null = null;
          let isStudentSubmitted = false;
          let mySubItem: any = null;
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
                mySubItem = mySub;
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
            studentSubmitted: isStudentSubmitted,
            studentSubmittedAt: mySubItem?.created_at || null,
            studentFeedback: isGradesReleased ? (mySubItem?.feedback || null) : null,
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

  useEffect(() => {
    if (!isTutor || !activeCohortId || !course.id) return;
    let isMounted = true;
    const syncCohortMaterials = async () => {
      try {
        const modItems = await TutorLmsService.getInstance().getCohortModules(activeCohortId, course.id);
        if (!isMounted) return;
        if (Array.isArray(modItems)) {
          const map: Record<string, CohortModuleItem> = {};
          modItems.forEach((m) => {
            map[m.id] = m;
          });
          setCohortModulesMap(map);
        }

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

  const handleToggleLock = async (assignmentId: string) => {
    const targetItem = assignmentsData.find((item) => item.id === assignmentId);
    if (!targetItem) return;
    const nextLocked = !targetItem.isLocked;

    setTogglingQuizLockId(assignmentId);

    setAssignmentsData((prev) =>
      prev.map((item) => {
        if (item.id === assignmentId) {
          return { ...item, isLocked: nextLocked };
        }
        return item;
      })
    );

    if (activeCohortId) {
      localStorage.setItem(`sifo_quiz_locked_${activeCohortId}_${assignmentId}`, String(nextLocked));
    }
    localStorage.setItem(`sifo_quiz_locked_${assignmentId}`, String(nextLocked));

    showToastSuccess(
      nextLocked
        ? `Quiz "${targetItem.title}" locked (hidden from ${activeCohortName} learners).`
        : `Quiz "${targetItem.title}" unlocked (now accessible to ${activeCohortName} learners).`
    );

    window.dispatchEvent(
      new CustomEvent('sifo_quiz_lock_changed', {
        detail: { assignmentId, isLocked: nextLocked, cohortId: activeCohortId },
      })
    );

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
    if (activeAsg?.isCohortActivity) {
      fetchCohortActivities();
    } else {
      fetchQuizzes();
    }
  };

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

  return {
    tutorCohorts,
    activeCohortId,
    activeCohortName,
    handleCohortChange,
    cohortModulesMap,
    handleToggleModuleLock,
    cohortActivities,
    fetchCohortActivities,
    handleToggleActivityLock,
    handlePublishGradesDirect,
    handleDeleteActivity,
    togglingLockActivityId,
    publishingGradesActivityId,
    deletingActivityId,
    showPostAnnouncementModal,
    setShowPostAnnouncementModal,
    announcementTitle,
    setAnnouncementTitle,
    announcementContent,
    setAnnouncementContent,
    announcementTargetType,
    setAnnouncementTargetType,
    announcementCohortId,
    setAnnouncementCohortId,
    submittingAnnouncement,
    loadingAnnouncements,
    localAnnouncements,
    handleCreateAnnouncement,
    handleDeleteAnnouncement,
    cohortStudents,
    assignmentFilter,
    setAssignmentFilter,
    assignmentsData,
    setAssignmentsData,
    mixedAssignments,
    visibleAssignments,
    fetchQuizzes,
    updatingAssignment,
    setUpdatingAssignment,
    handleQuizUpdatedByTutor,
    togglingQuizLockId,
    handleToggleLock,
    takingQuizId,
    setTakingQuizId,
    gradingStudentModal,
    setGradingStudentModal,
    handlePublishGrades,
    handleSaveStudentGrade,
    handleAutoGradeCompleted,
    showCreateActivityModal,
    setShowCreateActivityModal,
    editingCohortActivity,
    setEditingCohortActivity,
    studentSubmitActivity,
    setStudentSubmitActivity,
    reviewSubmissionsActivity,
    setReviewSubmissionsActivity,
    attendanceSummary,
    studentAttendanceRate,
  };
}

export default useCourseWorkspaceData;

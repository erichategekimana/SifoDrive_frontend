import React, { useState, useEffect } from 'react';
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
  MessageSquare,
  Video,
  ExternalLink,
  Users,
  ArrowLeft,
  Check,
  Clock,
  Unlock,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Course } from '../../../../core/models/Course';
import { useAuth } from '../../../../context/AuthContext';
import { useTranslation } from '../../../../context/I18nContext';
import type { SupportAnnouncementDTO } from '../../../../core/services/SupportTicketService';
import { AdminService } from '../../../../core/services/AdminService';

export interface CourseAssignmentItem {
  id: string;
  title: string;
  points: number;
  timeLimit: string;
  attemptsAllowed: number;
  isLocked: boolean;
  gradesPublished: boolean;
  openDate: string;
  dueDate: string;
  closingDate: string;
  allowLateSubmission: boolean;
  isFinalExam: boolean;
  status: string;
  score: string | null;
  type: string;
  instructions: string;
  rubrics: { criteria: string; points: string }[];
  submissions: {
    studentId: string;
    completed: boolean;
    score: string | null;
    submittedAt: string | null;
    isLate: boolean;
    daysLate: number;
  }[];
}
import {
  CourseSecondaryNav,
  type CourseWorkspaceTab,
} from './CourseSecondaryNav';
import { CourseHomeContent } from './CourseHomeContent';
import { CourseRightSidebar } from './CourseRightSidebar';
import { CoursePeopleTab } from './CoursePeopleTab';
import { LessonViewPage } from '../../../../pages/lms/LessonViewPage';

interface CanvasCourseWorkspaceProps {
  course: Course;
  announcements: SupportAnnouncementDTO[];
  onBackToCourses: () => void;
  highlightAnnouncementId?: string | null;
}

export const CanvasCourseWorkspace: React.FC<CanvasCourseWorkspaceProps> = ({
  course,
  announcements,
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

  // Announcement Modal State (for Tutors)
  const [showPostAnnouncementModal, setShowPostAnnouncementModal] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [localAnnouncements, setLocalAnnouncements] = useState<SupportAnnouncementDTO[]>(
    announcements.filter((a) => !a.course_id || a.course_id === course.id)
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const lessonParam = searchParams.get('lesson');

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(lessonParam);
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  const modules = course.modules || [];
  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const completedLessons = modules.reduce((sum, m) => sum + (m.completedLessonsCount || 0), 0);
  const courseProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  useEffect(() => {
    if (lessonParam) {
      setSelectedLessonId(lessonParam);
      setActiveTab('modules');
    }
  }, [lessonParam]);

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
    setSearchParams({ lesson: lessonId });
  };

  const handleCloseLesson = () => {
    setSelectedLessonId(null);
    setSearchParams({});
  };

  const handleOpenGroupFromSidebar = (groupId: string) => {
    setActiveGroupId(groupId);
    setActiveTab('people');
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;

    const newAnn: SupportAnnouncementDTO = {
      id: `ann-${Date.now()}`,
      title: announcementTitle.trim(),
      content: announcementContent.trim(),
      category: 'COURSE_UPDATE',
      author: user?.fullName || 'Instructor',
      date: 'Just now',
      course_id: course.id,
      is_pinned: false,
    };

    setLocalAnnouncements([newAnn, ...localAnnouncements]);
    setAnnouncementTitle('');
    setAnnouncementContent('');
    setShowPostAnnouncementModal(false);
  };


  // Mock student roster for assignment completion tracking
  const courseStudents = [
    { id: 'u-3', name: 'Alice Uwase', studentId: 'SF-2026-0904', category: 'General Road Rules' },
    { id: 'u-4', name: 'Jean Mugisha', studentId: 'SF-2026-0891', category: 'National Mock Exam Prep' },
    { id: 'u-5', name: 'Patrick Ndayisaba', studentId: 'SF-2026-0912', category: 'Road Signs & Markings' },
    { id: 'u-6', name: 'Diane Mukamana', studentId: 'SF-2026-0925', category: 'Intersections & Priorities' },
    { id: 'u-7', name: 'Eric Bizimana', studentId: 'SF-2026-0940', category: 'General Road Rules' },
    { id: 'u-8', name: 'Sandrine Uwitonze', studentId: 'SF-2026-0955', category: 'National Mock Exam Prep' },
  ];

  // Selected assignment for Tutor & Student detailed inspection view
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Quizzes/Assignments with individual student completion details & tutor controls
  const [assignmentsData, setAssignmentsData] = useState<CourseAssignmentItem[]>([]);

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
        // Those set to 'OPEN' are the ones tutors can see and control cohort visibility for.
        const targetQuizzes = candidateQuizzes.filter((q) => {
          if (isTutor) {
            return q.is_published && q.status === 'OPEN';
          }
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
            const isOpen = quiz.status === 'OPEN' || (!isPast && quiz.is_published);
            const totalScore = quiz.total_score || quiz.calculated_total_points || 20;

            return {
              id: quiz.id,
              title: quiz.title,
              points: totalScore,
              timeLimit: `${quiz.time_limit_minutes || 20} Minutes`,
              attemptsAllowed: quiz.max_attempts || 1,
              isLocked: !quiz.is_published,
              gradesPublished: true,
              openDate: formatD(quiz.open_date) || 'Open Access',
              dueDate: formatD(quiz.deadline) || 'No deadline',
              closingDate:
                formatD(quiz.closing_date) || formatD(quiz.deadline) || 'No cutoff',
              allowLateSubmission: Boolean(quiz.allow_late_submission),
              isFinalExam: Boolean(quiz.is_final_exam),
              status: isPast ? 'Past' : isOpen ? 'Open' : 'Draft',
              score: isPast ? `${Math.max(14, totalScore - 2)} / ${totalScore}` : null,
              type: quiz.is_final_exam ? 'Final Exam' : 'Quiz',
              instructions:
                quiz.description ||
                'Review course guidelines and complete this assessment accurately.',
              rubrics: quiz.rubric
                ? [{ criteria: quiz.rubric, points: `${totalScore} pts` }]
                : [
                    {
                      criteria: 'Knowledge of road signs & ground markings',
                      points: `${Math.round(totalScore * 0.4)} pts`,
                    },
                    {
                      criteria: 'Intersections and right-of-way rules (Article 34)',
                      points: `${Math.round(totalScore * 0.3)} pts`,
                    },
                    {
                      criteria: 'Defensive driving and general road safety',
                      points: `${Math.round(totalScore * 0.3)} pts`,
                    },
                  ],
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

  // Tutor lock/unlock handler
  const handleToggleLock = (assignmentId: string) => {
    setAssignmentsData((prev) =>
      prev.map((item) =>
        item.id === assignmentId ? { ...item, isLocked: !item.isLocked } : item
      )
    );
  };

  // Tutor publish grades handler
  const handlePublishGrades = (assignmentId: string) => {
    setAssignmentsData((prev) =>
      prev.map((item) =>
        item.id === assignmentId ? { ...item, gradesPublished: true } : item
      )
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
                    handleCloseLesson();
                  }}
                  style={{
                    color: selectedLessonId ? '#0055A5' : '#2D3B45',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: selectedLessonId ? 'pointer' : 'default',
                    textDecoration: selectedLessonId ? 'underline' : 'none',
                  }}
                >
                  {activeTab}
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
          </div>
        </div>
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
            setActiveGroupId(null);
          }}
          gradesCount={!isTutor ? 7 : undefined}
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
                      {completedLessons} of {totalLessons} lessons completed ({courseProgress}%)
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
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>
                            {t('canvasCourses.lessonsCount', { count: mod.lessons?.length || 0 })}
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
                  const currentAsg = assignmentsData.find((a) => a.id === selectedAssignmentId);
                  if (!currentAsg) return null;

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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                              padding: '6px 14px',
                              fontSize: '0.82rem',
                              backgroundColor: '#F1F5F9',
                              color: '#1E293B',
                              border: '1px solid #CBD5E1',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            <ArrowLeft size={15} />
                            <span>Back to Assignments</span>
                          </button>
                          <div>
                            {isTutor && (
                              <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Assessment Management & Grading
                              </div>
                            )}
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E293B', margin: '2px 0 0 0' }}>
                              {currentAsg.title}
                            </h2>
                          </div>
                        </div>

                        {/* Status / Visibility Badges (Tutors only) */}
                        {isTutor && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {currentAsg.isLocked ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '4px 10px',
                                  borderRadius: '4px',
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  backgroundColor: '#FEF2F2',
                                  color: '#991B1B',
                                  border: '1px solid #FEE2E2',
                                }}
                              >
                                <Lock size={13} />
                                <span>Locked for Cohort</span>
                              </span>
                            ) : (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '4px 10px',
                                  borderRadius: '4px',
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  backgroundColor: '#F0FDF4',
                                  color: '#166534',
                                  border: '1px solid #DCFCE7',
                                }}
                              >
                                <Check size={13} />
                                <span>Published</span>
                              </span>
                            )}

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
                                backgroundColor: '#FFFFFF',
                                color: currentAsg.isLocked ? '#166534' : '#475569',
                                border: '1px solid #CBD5E1',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                              title={currentAsg.isLocked ? 'Unlock visibility for all students' : 'Lock visibility from students'}
                            >
                              {currentAsg.isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                              <span>{currentAsg.isLocked ? 'Unlock Quiz' : 'Lock Quiz'}</span>
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

                      {/* TUTOR VIEW: Management Bar & Student Completion/Grading Roster */}
                      {isTutor && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {/* Tutor Action Toolbar */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '12px',
                              backgroundColor: '#F8FAFC',
                              padding: '12px 18px',
                              borderRadius: '4px',
                              border: '1px solid #CBD5E1',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div>
                                <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Roster Completion</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0055A5', marginTop: '1px' }}>
                                  {completedList.length} of {submissionsWithStudent.length} ({completionPercent}%)
                                </div>
                              </div>
                              <div style={{ height: '24px', width: '1px', backgroundColor: '#CBD5E1' }} />
                              <div>
                                <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Grade Status</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: currentAsg.gradesPublished ? '#15803D' : '#B45309', marginTop: '1px' }}>
                                  {currentAsg.gradesPublished ? 'Grades Published to Students' : 'Grades Unpublished'}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {!currentAsg.gradesPublished ? (
                                <button
                                  onClick={() => handlePublishGrades(currentAsg.id)}
                                  className="canvas-btn"
                                  style={{
                                    padding: '7px 16px',
                                    fontSize: '0.8rem',
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
                                  <span>Publish Grades</span>
                                </button>
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
                                    padding: '5px 12px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  <Check size={13} />
                                  <span>Grades Published</span>
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
                                gridTemplateColumns: '2fr 1fr 1.2fr 1fr 1.2fr',
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
                                      gridTemplateColumns: '2fr 1fr 1.2fr 1fr 1.2fr',
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
                                  </div>
                                ))
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
                          ? 'Select any assessment to inspect student completions, late submissions, and publish grades.'
                          : 'Select an assessment below to review instructions, submission rules, and rubrics before starting.'}
                      </p>
                    </div>
                  </div>

                  {/* UPCOMING ASSIGNMENTS BLOCK */}
                  <div className="canvas-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 18px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB', fontWeight: 700, fontSize: '0.88rem', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="#64748B" />
                        <span>Upcoming Assignments ({assignmentsData.filter(a => a.status === 'Open').length})</span>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                        {isTutor ? 'Click to inspect submissions & grade' : 'Click to read instructions & open assessment'}
                      </span>
                    </div>
                    <div>
                      {assignmentsData.filter(a => a.status === 'Open').length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                          No upcoming assignments at this time.
                        </div>
                      ) : (
                        assignmentsData
                          .filter(a => a.status === 'Open')
                          .map((item) => {
                            const totalRoster = item.submissions?.length || courseStudents.length;
                            const completedCount = item.submissions?.filter((s) => s.completed).length || 0;
                            const completionPct = Math.round((completedCount / totalRoster) * 100);

                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  setSelectedAssignmentId(item.id);
                                  setAssignmentFilter('all');
                                }}
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
                        <span>Past Assignments ({assignmentsData.filter(a => a.status !== 'Open').length})</span>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                        {isTutor ? 'Inspect past submissions & records' : 'Completed & graded assessments'}
                      </span>
                    </div>
                    <div>
                      {assignmentsData.filter(a => a.status !== 'Open').length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                          No past assignments recorded.
                        </div>
                      ) : (
                        assignmentsData
                          .filter(a => a.status !== 'Open')
                          .map((item) => {
                            const totalRoster = item.submissions?.length || courseStudents.length;
                            const completedCount = item.submissions?.filter((s) => s.completed).length || 0;
                            const completionPct = Math.round((completedCount / totalRoster) * 100);

                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  setSelectedAssignmentId(item.id);
                                  setAssignmentFilter('all');
                                }}
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
                                          Score: {item.score}
                                        </span>
                                        <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Passed</div>
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
                      {assignmentsData.map((asg) => (
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {localAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="canvas-card"
                    style={{
                      padding: '18px 22px',
                      backgroundColor: '#FFFFFF',
                      borderLeft: '4px solid #0055A5 !important',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
                        {ann.title}
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{ann.date}</span>
                    </div>

                    <p style={{ fontSize: '0.86rem', color: '#4B5563', lineHeight: 1.55, margin: '0 0 10px 0' }}>
                      {ann.content}
                    </p>

                    <div style={{ fontSize: '0.76rem', color: '#6B7280' }}>
                      Posted by: <strong>{ann.author}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: DISCUSSIONS */}
          {activeTab === 'discussions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2D3B45', margin: 0 }}>
                  Course Discussion Forums
                </h2>
                <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: '3px 0 0 0' }}>
                  Ask questions, share tricky mock questions, and explore road traffic scenarios.
                </p>
              </div>

              <div className="canvas-card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <MessageSquare size={22} color="#0055A5" />
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
                      General Course Q&A Thread
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0 0' }}>
                      Moderated by Claude Kamanzi (Theory Lead)
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: '0.86rem', color: '#4B5563', lineHeight: 1.55 }}>
                  Have questions about overtaking rules on dual carriageways or what to do when a traffic officer signals differently from a traffic light? Post here or join a Course Group under the People tab.
                </p>

                <button
                  onClick={() => setActiveTab('people')}
                  className="canvas-btn"
                  style={{ marginTop: '12px', fontSize: '0.8rem', color: '#0055A5' }}
                >
                  <span>Go to Course Groups & Study Circles</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: PEOPLE (Classmates, Instructors, Course Groups & Group Chat) */}
          {activeTab === 'people' && (
            <CoursePeopleTab
              course={course}
              initialGroupId={activeGroupId}
            />
          )}

          {/* TAB 8: LIVE CLASSES */}
          {activeTab === 'live' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2D3B45', margin: 0 }}>
                  Upcoming Live Classes & Google Meet Links
                </h2>
                <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: '3px 0 0 0' }}>
                  Interactive live lectures and Q&A sessions led by qualified driving instructors.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  {
                    title: 'Cohort Alpha - Priority Rules at Intersections & Roundabouts',
                    time: 'Today • 18:00 - 19:30 CAT',
                    instructor: 'Claude Kamanzi',
                    link: 'https://meet.google.com/sifo-drive-alpha',
                    badge: 'Starting Soon',
                  },
                  {
                    title: 'Cohort Beta - Danger and Prohibitory Signs (Ibyapa Bibuza)',
                    time: 'Tomorrow • 19:30 - 21:00 CAT',
                    instructor: 'Jeanette Mukamana',
                    link: 'https://meet.google.com/sifo-drive-beta',
                    badge: 'Scheduled',
                  },
                  {
                    title: 'Weekend Intensive - Full 20-Question Timed Mock Simulation Review',
                    time: 'Saturday • 09:00 - 12:00 CAT',
                    instructor: 'Claude Kamanzi & Guest Officers',
                    link: 'https://meet.google.com/sifo-drive-weekend',
                    badge: 'Weekend',
                  },
                ].map((cls, idx) => (
                  <div
                    key={idx}
                    className="canvas-card"
                    style={{
                      padding: '18px 22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            backgroundColor: idx === 0 ? '#DCFCE7' : '#EFF6FF',
                            color: idx === 0 ? '#15803D' : '#0055A5',
                            padding: '2px 8px',
                            borderRadius: '2px',
                          }}
                        >
                          {cls.badge}
                        </span>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
                          {cls.title}
                        </h4>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        {cls.time} • Instructor: <strong>{cls.instructor}</strong>
                      </div>
                    </div>

                    <a
                      href={cls.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="canvas-btn canvas-btn-primary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        fontSize: '0.82rem',
                        textDecoration: 'none',
                      }}
                    >
                      <Video size={15} />
                      <span>Join Google Meet</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
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
          onClick={() => setShowPostAnnouncementModal(false)}
        >
          <div
            className="canvas-card"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              backgroundColor: '#FFFFFF',
              borderRadius: '4px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                Post Course Announcement
              </h3>
              <button
                type="button"
                onClick={() => setShowPostAnnouncementModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '2px',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                  Content *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide instructions, meeting time adjustments, or preparation guidance..."
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '2px',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowPostAnnouncementModal(false)}
                  className="canvas-btn"
                  style={{ fontSize: '0.82rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="canvas-btn canvas-btn-primary"
                  style={{ fontSize: '0.82rem' }}
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

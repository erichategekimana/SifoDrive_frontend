import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Course } from '../../../../core/models/Course';
import { useAuth } from '../../../../context/AuthContext';
import { useTranslation } from '../../../../context/I18nContext';
import { useToast } from '../../../../context/ToastContext';
import type { SupportAnnouncementDTO } from '../../../../core/services/SupportTicketService';
import type { CourseGroupDTO } from '../../../../core/services/CourseGroupService';
import { ReviewSubmissionsModal } from '../tutor/ReviewSubmissionsModal';

// Re-exports for backward compatibility across the entire codebase
export type {
  CourseAssignmentItem,
  AssignmentSubmissionItem,
  RubricItem,
  CourseWorkspaceTab,
} from './types';
export { parseRubrics } from './utils/rubricUtils';
export { formatD, formatCanvasDue, formatCanvasSubmitted } from './utils/dateUtils';

import type { CourseAssignmentItem, CourseWorkspaceTab } from './types';

// Structural & Navigation Components
import { CourseSecondaryNav } from './layout/CourseSecondaryNav';
import { CourseHomeContent } from './home/CourseHomeContent';
import { CourseRightSidebar } from './layout/CourseRightSidebar';
import { CourseBreadcrumbs } from './layout/CourseBreadcrumbs';
import { CourseTabLoadingFallback } from './layout/CourseTabLoadingFallback';
import { CourseWorkspaceModals } from './modals/CourseWorkspaceModals';
import { useCourseWorkspaceData } from './hooks/useCourseWorkspaceData';

// Lazy-loaded Domain Tabs for fast on-demand code-splitting
const CourseModulesTab = lazy(() => import('./modules/CourseModulesTab'));
const CourseAssignmentsTab = lazy(() => import('./assignments/CourseAssignmentsTab'));
const CourseGradesTab = lazy(() => import('./grades/CourseGradesTab'));
const CourseAnnouncementsTab = lazy(() => import('./announcements/CourseAnnouncementsTab'));
const CourseDiscussionsTab = lazy(() => import('./discussions/CourseDiscussionsTab'));
const CoursePeopleTab = lazy(() => import('./people/CoursePeopleTab'));
const CourseLiveClassesTab = lazy(() => import('./live-classes/CourseLiveClassesTab'));

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
  useTranslation();
  const { success: showToastSuccess, error: showToastError } = useToast();

  const isTutor = Boolean(user?.isTutor() || user?.role === 'TRAINING_ADMIN' || user?.role === 'SYSTEM_ADMIN');
  const isTrainingAdmin = Boolean(user?.role === 'TRAINING_ADMIN' || user?.role === 'SYSTEM_ADMIN');
  const isGuest = user?.role === 'GUEST';

  const [searchParams, setSearchParams] = useSearchParams();
  const lessonParam = searchParams.get('lesson');
  const assignmentParam = searchParams.get('assignment');
  const viewParam = searchParams.get('view');
  const groupParam = searchParams.get('group');
  const tabParam = searchParams.get('tab') as CourseWorkspaceTab | null;
  const reviewParam = searchParams.get('review');
  const reviewTypeParam = searchParams.get('type');

  const [activeTab, setActiveTab] = useState<CourseWorkspaceTab>(
    highlightAnnouncementId ? 'announcements' : tabParam || 'home'
  );
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(groupParam);
  const [courseGroups, setCourseGroups] = useState<CourseGroupDTO[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(lessonParam);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(assignmentParam);
  const [isGradingView, setIsGradingView] = useState<boolean>(viewParam === 'grading');
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  // Encapsulated data & business logic hook
  const {
    tutorCohorts,
    activeCohortId,
    activeCohortName,
    handleCohortChange,
    cohortModulesMap,
    handleToggleModuleLock,
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
    studentAttendanceRate,
  } = useCourseWorkspaceData({
    course,
    user,
    initialAnnouncements,
    isTutor,
    isTrainingAdmin,
    showToastSuccess,
    showToastError,
  });

  // Calculate modules and lesson completion progress
  const allModules = course.modules || [];
  const modules = isTutor ? allModules : allModules.filter((m) => !m.isLocked);
  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const completedLessons = modules.reduce((sum, m) => sum + (m.completedLessonsCount || 0), 0);
  const courseProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Sync state with URL params
  useEffect(() => {
    if (lessonParam) {
      setSelectedLessonId(lessonParam);
      setActiveTab('modules');
    } else {
      setSelectedLessonId(null);
    }
  }, [lessonParam]);

  useEffect(() => {
    if (assignmentParam && (!tabParam || tabParam === 'assignments')) {
      setSelectedAssignmentId(assignmentParam);
      setActiveTab('assignments');
      setIsGradingView(searchParams.get('view') === 'grading');
    } else {
      setSelectedAssignmentId(null);
      setIsGradingView(false);
    }
  }, [assignmentParam, tabParam, searchParams]);

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
    setSelectedAssignmentId(null);
    setIsGradingView(false);
    setActiveTab('modules');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', 'modules');
      next.set('lesson', lessonId);
      next.delete('assignment');
      next.delete('view');
      next.delete('review');
      next.delete('type');
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
    setSelectedAssignmentId(null);
    setSelectedLessonId(null);
    setIsGradingView(false);
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
      next.delete('assignment');
      next.delete('lesson');
      next.delete('view');
      return next;
    });
  };

  const handleOpenAttendanceReview = () => {
    setSelectedAssignmentId(null);
    setSelectedLessonId(null);
    setIsGradingView(false);
    setActiveTab('grades');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', 'grades');
      next.set('review', 'attendance');
      next.set('type', 'attendance');
      next.delete('assignment');
      next.delete('lesson');
      next.delete('view');
      return next;
    });
  };

  const handleCloseGradeReview = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', 'grades');
      next.delete('review');
      next.delete('type');
      next.delete('assignment');
      next.delete('lesson');
      next.delete('view');
      return next;
    });
  };

  const handleOpenAssignment = (assignmentId: string | null) => {
    setSelectedAssignmentId(assignmentId);
    setSelectedLessonId(null);
    setIsGradingView(false);
    setAssignmentFilter('all');
    setActiveTab('assignments');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', 'assignments');
      if (assignmentId) {
        next.set('assignment', assignmentId);
      } else {
        next.delete('assignment');
      }
      next.delete('view');
      next.delete('lesson');
      next.delete('review');
      next.delete('type');
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

  const clearSubViews = () => {
    setSelectedLessonId(null);
    setSelectedAssignmentId(null);
    setIsGradingView(false);
    setActiveGroupId(null);
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
      {/* 1. Canvas Top Breadcrumb Bar */}
      <CourseBreadcrumbs
        courseTitle={course.title}
        onBackToCourses={onBackToCourses}
        navCollapsed={navCollapsed}
        setNavCollapsed={setNavCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedLessonId={selectedLessonId}
        activeLessonTitle={activeLesson?.title}
        handleCloseLesson={handleCloseLesson}
        selectedAssignmentId={selectedAssignmentId}
        selectedAssignmentTitle={
          visibleAssignments.find((a) => a.id === selectedAssignmentId)?.title ||
          assignmentsData.find((a) => a.id === selectedAssignmentId)?.title ||
          'Assessment'
        }
        handleCloseAssignment={handleCloseAssignment}
        isGradingView={isGradingView}
        handleExitGradingView={handleExitGradingView}
        reviewParam={reviewParam}
        reviewParamTitle={
          visibleAssignments.find((a) => a.id === reviewParam)?.title ||
          assignmentsData.find((a) => a.id === reviewParam)?.title
        }
        handleCloseGradeReview={handleCloseGradeReview}
        activeGroupId={activeGroupId}
        handleCloseGroup={handleCloseGroup}
        reviewSubmissionsActivity={reviewSubmissionsActivity}
        setReviewSubmissionsActivity={setReviewSubmissionsActivity}
        isTutor={Boolean(isTutor)}
        tutorCohorts={tutorCohorts}
        activeCohortId={activeCohortId}
        onCohortChange={handleCohortChange}
      />

      {/* 2. Main 3-Column Canvas LMS Course Layout */}
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
            clearSubViews();
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.set('tab', tab);
              next.delete('assignment');
              next.delete('view');
              next.delete('lesson');
              next.delete('review');
              next.delete('type');
              next.delete('group');
              return next;
            });
          }}
          gradesCount={!isTutor ? visibleAssignments.length : undefined}
          announcementsCount={localAnnouncements.length}
          isCollapsed={navCollapsed}
          isTutor={Boolean(isTutor)}
        />

        {/* Column 2: Center Main Content Area with Lazy-Loaded Suspense */}
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
            <Suspense fallback={<CourseTabLoadingFallback />}>
              {/* TAB 1: HOME */}
              {activeTab === 'home' && (
                <CourseHomeContent
                  course={course}
                  onNavigateTab={(tab, targetId) => {
                    setActiveTab(tab);
                    clearSubViews();
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set('tab', tab);
                      next.delete('assignment');
                      next.delete('view');
                      next.delete('lesson');
                      next.delete('review');
                      next.delete('type');
                      next.delete('group');
                      return next;
                    });
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
                <CourseModulesTab
                  course={course}
                  modules={modules}
                  selectedLessonId={selectedLessonId}
                  isTutor={Boolean(isTutor)}
                  isGuest={Boolean(isGuest)}
                  activeCohortName={activeCohortName}
                  activeCohortId={activeCohortId}
                  cohortModulesMap={cohortModulesMap}
                  completedLessons={completedLessons}
                  totalLessons={totalLessons}
                  courseProgress={courseProgress}
                  collapsedModules={collapsedModules}
                  onToggleModule={toggleModule}
                  onOpenLesson={handleOpenLesson}
                  onCloseLesson={handleCloseLesson}
                  onToggleModuleLock={handleToggleModuleLock}
                />
              )}

              {/* TAB 3: ASSIGNMENTS */}
              {activeTab === 'assignments' && (
                <CourseAssignmentsTab
                  isTutor={Boolean(isTutor)}
                  visibleAssignments={visibleAssignments}
                  cohortStudents={cohortStudents}
                  activeCohortName={activeCohortName}
                  activeCohortId={activeCohortId}
                  selectedAssignmentId={selectedAssignmentId}
                  onSelectAssignment={handleOpenAssignment}
                  isGradingView={isGradingView}
                  setIsGradingView={setIsGradingView}
                  assignmentFilter={assignmentFilter}
                  setAssignmentFilter={setAssignmentFilter}
                  togglingLockActivityId={togglingLockActivityId}
                  togglingQuizLockId={togglingQuizLockId}
                  publishingGradesActivityId={publishingGradesActivityId}
                  deletingActivityId={deletingActivityId}
                  onCreateActivity={() => {
                    setEditingCohortActivity(null);
                    setShowCreateActivityModal(true);
                  }}
                  onEditActivity={(act) => {
                    setEditingCohortActivity(act);
                    setShowCreateActivityModal(true);
                  }}
                  onDeleteActivity={handleDeleteActivity}
                  onToggleActivityLock={handleToggleActivityLock}
                  onToggleQuizLock={handleToggleLock}
                  onReviewSubmissions={(act) => setReviewSubmissionsActivity(act)}
                  onPublishGradesDirect={handlePublishGradesDirect}
                  onAutoGradeCompleted={handleAutoGradeCompleted}
                  onPublishGrades={handlePublishGrades}
                  onSelectStudentForGrading={(student) => setGradingStudentModal(student)}
                  onUpdateQuiz={(asg) => setUpdatingAssignment(asg)}
                  onWorkOnActivity={(actRaw) => setStudentSubmitActivity(actRaw)}
                  onTakeQuiz={(quizId) => setTakingQuizId(quizId)}
                />
              )}

              {/* TAB 4: GRADES */}
              {activeTab === 'grades' && (
                <CourseGradesTab
                  course={course}
                  user={user}
                  visibleAssignments={visibleAssignments}
                  studentAttendanceRate={studentAttendanceRate}
                  reviewParam={reviewParam}
                  reviewTypeParam={reviewTypeParam}
                  onOpenGradeReview={handleOpenGradeReview}
                  onOpenAttendanceReview={handleOpenAttendanceReview}
                  onCloseGradeReview={handleCloseGradeReview}
                />
              )}

              {/* TAB 5: ANNOUNCEMENTS */}
              {activeTab === 'announcements' && (
                <CourseAnnouncementsTab
                  isTutor={Boolean(isTutor)}
                  announcements={localAnnouncements}
                  loadingAnnouncements={loadingAnnouncements}
                  onOpenPostModal={() => setShowPostAnnouncementModal(true)}
                  onDeleteAnnouncement={handleDeleteAnnouncement}
                />
              )}

              {/* TAB 6: DISCUSSIONS */}
              {activeTab === 'discussions' && (
                <CourseDiscussionsTab course={course} />
              )}

              {/* TAB 7: PEOPLE */}
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
            </Suspense>
          )}
        </main>

        {/* Column 3: Canvas Right Sidebar */}
        {!selectedLessonId && !reviewSubmissionsActivity && (
          <CourseRightSidebar
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              clearSubViews();
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('tab', tab);
                next.delete('assignment');
                next.delete('view');
                next.delete('lesson');
                next.delete('review');
                next.delete('type');
                next.delete('group');
                return next;
              });
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

      {/* Heavy modals encapsulated in dedicated component */}
      <CourseWorkspaceModals
        course={course}
        user={user}
        activeCohortId={activeCohortId}
        tutorCohorts={tutorCohorts}
        showPostAnnouncementModal={showPostAnnouncementModal}
        setShowPostAnnouncementModal={setShowPostAnnouncementModal}
        submittingAnnouncement={submittingAnnouncement}
        announcementTitle={announcementTitle}
        setAnnouncementTitle={setAnnouncementTitle}
        announcementContent={announcementContent}
        setAnnouncementContent={setAnnouncementContent}
        announcementTargetType={announcementTargetType}
        setAnnouncementTargetType={setAnnouncementTargetType}
        announcementCohortId={announcementCohortId}
        setAnnouncementCohortId={setAnnouncementCohortId}
        handleCreateAnnouncement={handleCreateAnnouncement}
        updatingAssignment={updatingAssignment}
        setUpdatingAssignment={setUpdatingAssignment}
        handleQuizUpdatedByTutor={handleQuizUpdatedByTutor}
        gradingStudentModal={gradingStudentModal}
        setGradingStudentModal={setGradingStudentModal}
        selectedAssignmentId={selectedAssignmentId}
        visibleAssignments={visibleAssignments}
        assignmentsData={assignmentsData}
        handleSaveStudentGrade={handleSaveStudentGrade}
        showCreateActivityModal={showCreateActivityModal}
        setShowCreateActivityModal={setShowCreateActivityModal}
        editingCohortActivity={editingCohortActivity}
        setEditingCohortActivity={setEditingCohortActivity}
        fetchCohortActivities={fetchCohortActivities}
        studentSubmitActivity={studentSubmitActivity}
        setStudentSubmitActivity={setStudentSubmitActivity}
        takingQuizId={takingQuizId}
        setTakingQuizId={setTakingQuizId}
        fetchQuizzes={fetchQuizzes}
        setAssignmentsData={setAssignmentsData}
      />
    </div>
  );
};

export default CanvasCourseWorkspace;

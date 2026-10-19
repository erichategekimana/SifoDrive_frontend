import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Play } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { useTranslation } from '../../../context/I18nContext';
import { useLmsStudioData } from '../../../features/lms/hooks/useLmsStudioData';
import { AdminService, type QuizItem, type CohortActivityItem } from '../../../core/services/AdminService';
import { TutorLmsService } from '../../../core/services/TutorLmsService';
import { QuizInspectionModal } from '../../../features/lms/components/quiz/QuizInspectionModal';
import { QuizSubmissionsModal } from '../../../features/lms/components/quiz/QuizSubmissionsModal';
import { CreateActivityModal } from '../../../features/lms/components/tutor/CreateActivityModal';
import { ReviewSubmissionsModal } from '../../../features/lms/components/tutor/ReviewSubmissionsModal';
import { QuizBankHeader } from './QuizBankHeader';
import { QuizBankKpiRibbon } from './QuizBankKpiRibbon';
import { QuizBankTabsNav, type QuizBankSection } from './QuizBankTabsNav';
import { QuizDirectoryTab } from './QuizDirectoryTab';
import { QuizSimulatorTab } from './QuizSimulatorTab';
import { QuestionBankTab } from './QuestionBankTab';
import { ActivitiesDirectoryTab } from './ActivitiesDirectoryTab';

export const AdminQuizBankPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { success, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  const {
    quizzes,
    activities,
    courses,
    cohorts,
    questions,
    isLoading,
    isRefetching,
    refetch,
  } = useLmsStudioData();

  // 3 Primary Sections: 'quizzesAssignments' | 'activities' | 'questionBank'
  const [activeSection, setActiveSection] = useState<QuizBankSection>('quizzesAssignments');

  // Sub-navigation within Quizzes & Assignments
  const [qaSubTab, setQaSubTab] = useState<'directory' | 'simulator'>('directory');

  // Filters for Quizzes & Assignments directory
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'LIVE_TIMED' | 'WORK_SUBMISSION'>('ALL');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Question bank tab filters
  const [qbSearch, setQbSearch] = useState<string>('');
  const [qbDomainFilter, setQbDomainFilter] = useState<string>('ALL');

  // Quiz / Exam Modals
  const [inspectingQuiz, setInspectingQuiz] = useState<QuizItem | null>(null);
  const [submissionsQuiz, setSubmissionsQuiz] = useState<QuizItem | null>(null);

  // Activity Modals
  const [isActivityModalOpen, setIsActivityModalOpen] = useState<boolean>(false);
  const [activityToEdit, setActivityToEdit] = useState<CohortActivityItem | null>(null);
  const [reviewActivity, setReviewActivity] = useState<CohortActivityItem | null>(null);

  // Simulator target quiz
  const [simulatorQuiz, setSimulatorQuiz] = useState<QuizItem | null>(null);

  // Quizzes & Assignments
  const quizzesAndAssignments = useMemo(() => {
    return quizzes.filter((q) => !q.is_final_exam);
  }, [quizzes]);

  // Filtered Quizzes & Assignments
  const filteredQuizzes = useMemo(() => {
    return quizzesAndAssignments.filter((q) => {
      if (typeFilter !== 'ALL') {
        const qType = q.quiz_type || 'LIVE_TIMED';
        if (qType !== typeFilter) return false;
      }
      if (courseFilter !== 'ALL' && String(q.course) !== String(courseFilter)) {
        return false;
      }
      if (statusFilter !== 'ALL' && q.status?.toUpperCase() !== statusFilter.toUpperCase()) {
        return false;
      }
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      return (
        q.title?.toLowerCase().includes(term) ||
        q.title_kinyarwanda?.toLowerCase().includes(term) ||
        q.title_french?.toLowerCase().includes(term) ||
        q.course_title?.toLowerCase().includes(term) ||
        q.module_title?.toLowerCase().includes(term) ||
        q.description?.toLowerCase().includes(term) ||
        q.description_french?.toLowerCase().includes(term)
      );
    });
  }, [quizzesAndAssignments, typeFilter, courseFilter, statusFilter, searchQuery]);


  // Filtered Question Bank
  const filteredQuestions = useMemo(() => {
    return questions.filter((q: any) => {
      if (qbDomainFilter !== 'ALL' && q.domain !== qbDomainFilter) return false;
      if (!qbSearch) return true;
      const term = qbSearch.toLowerCase();
      return (
        q.question_text?.toLowerCase().includes(term) ||
        q.question_text_kinyarwanda?.toLowerCase().includes(term) ||
        q.question_text_french?.toLowerCase().includes(term) ||
        String(q.question_number)?.includes(term)
      );
    });
  }, [questions, qbDomainFilter, qbSearch]);

  // Counts for KPIs
  const liveCount = useMemo(
    () => quizzesAndAssignments.filter((q) => (q.quiz_type || 'LIVE_TIMED') === 'LIVE_TIMED').length,
    [quizzesAndAssignments]
  );
  const workSubmissionCount = useMemo(
    () => quizzesAndAssignments.filter((q) => q.quiz_type === 'WORK_SUBMISSION').length,
    [quizzesAndAssignments]
  );
  const proctoredCount = useMemo(
    () => quizzesAndAssignments.filter((q) => (q.quiz_type || 'LIVE_TIMED') === 'LIVE_TIMED' && q.enable_proctoring).length,
    [quizzesAndAssignments]
  );

  const practicalDrillsCount = useMemo(
    () => activities.filter((a) => a.activity_type === 'PRACTICAL_DRILL').length,
    [activities]
  );
  const otherActivitiesCount = useMemo(
    () => activities.filter((a) => a.activity_type !== 'PRACTICAL_DRILL').length,
    [activities]
  );

  // Actions
  const handleOpenCreateQuiz = () => {
    navigate('/admin/quizzes/create');
  };

  const handleOpenEditQuiz = (q: QuizItem) => {
    navigate(`/admin/quizzes/${q.id}/edit`);
  };

  const handleTogglePublish = async (q: QuizItem) => {
    try {
      const updated = await adminService.togglePublishQuiz(q.id);
      success(`Assessment "${updated.title}" ${updated.is_published ? 'published' : 'unpublished'}.`);
      refetch();
    } catch (err: any) {
      toastError(err?.message || 'Failed to toggle assessment publish state.');
    }
  };

  const handleDeleteQuiz = async (q: QuizItem) => {
    if (!window.confirm(`Are you sure you want to delete assessment "${q.title}"?`)) return;
    try {
      await adminService.deleteQuiz(q.id);
      success(`Assessment "${q.title}" deleted.`);
      refetch();
    } catch (err: any) {
      toastError(err?.message || 'Failed to delete assessment.');
    }
  };

  const handleLaunchSimulator = (q: QuizItem) => {
    setSimulatorQuiz(q);
    setActiveSection('quizzesAssignments');
    setQaSubTab('simulator');
  };

  // Activity Actions
  const handleOpenCreateActivity = () => {
    setActivityToEdit(null);
    setIsActivityModalOpen(true);
  };

  const handleOpenEditActivity = (act: CohortActivityItem) => {
    setActivityToEdit(act);
    setIsActivityModalOpen(true);
  };

  const handleDeleteActivity = async (act: CohortActivityItem) => {
    if (!window.confirm(`Are you sure you want to delete activity "${act.title}"?`)) return;
    try {
      await TutorLmsService.getInstance().deleteCohortActivity(act.cohort, act.id);
      success(`Activity "${act.title}" deleted.`);
      refetch();
    } catch (err: any) {
      toastError(err?.message || 'Failed to delete activity.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Top Header */}
      <QuizBankHeader
        onRefresh={() => refetch()}
        onCreateQuiz={
          activeSection === 'activities'
            ? handleOpenCreateActivity
            : activeSection === 'quizzesAssignments'
            ? handleOpenCreateQuiz
            : undefined as any
        }
        createButtonText={
          activeSection === 'activities'
            ? 'Create Activity'
            : activeSection === 'quizzesAssignments'
            ? 'Create New Quiz'
            : undefined
        }
        isLoading={isLoading}
        isRefetching={isRefetching}
        refreshText={t('admin.dashboard.refresh')}
      />

      {/* KPI Ribbon */}
      <QuizBankKpiRibbon
        section={activeSection}
        totalQuizzes={quizzesAndAssignments.length}
        liveCount={liveCount}
        proctoredCount={proctoredCount}
        workSubmissionCount={workSubmissionCount}
        totalActivities={activities.length}
        practicalDrillsCount={practicalDrillsCount}
        otherActivitiesCount={otherActivitiesCount}
        totalQuestions={questions.length}
      />

      {/* Primary 3-Section Navigation Bar */}
      <QuizBankTabsNav
        activeSection={activeSection}
        onSectionChange={(sec) => {
          setActiveSection(sec);
          if (sec === 'quizzesAssignments' && qaSubTab === 'simulator' && !simulatorQuiz && quizzes.length > 0) {
            setSimulatorQuiz(quizzes[0]);
          }
        }}
        quizzesCount={quizzesAndAssignments.length}
        activitiesCount={activities.length}
        questionsCount={questions.length}
      />

      {/* ============================================================ */}
      {/* SECTION 1: Quizzes & Assignments                             */}
      {/* ============================================================ */}
      {activeSection === 'quizzesAssignments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sub-tabs for Quizzes & Assignments */}
          <div
            style={{
              display: 'inline-flex',
              padding: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              gap: '4px',
              alignSelf: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => setQaSubTab('directory')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: qaSubTab === 'directory' ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: qaSubTab === 'directory' ? '#1E293B' : 'transparent',
                color: qaSubTab === 'directory' ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
                boxShadow: qaSubTab === 'directory' ? '0 2px 8px rgba(0, 0, 0, 0.25)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <FileText size={14} />
              <span>Quizzes & Assignments Directory</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!simulatorQuiz && quizzes.length > 0) setSimulatorQuiz(quizzes[0]);
                setQaSubTab('simulator');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: qaSubTab === 'simulator' ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: qaSubTab === 'simulator' ? '#1E293B' : 'transparent',
                color: qaSubTab === 'simulator' ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
                boxShadow: qaSubTab === 'simulator' ? '0 2px 8px rgba(0, 0, 0, 0.25)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Play size={14} />
              <span>Live Proctoring Simulator</span>
            </button>

          </div>

          {/* Sub-tab 1: Directory */}
          {qaSubTab === 'directory' && (
            <QuizDirectoryTab
              quizzes={quizzesAndAssignments}
              filteredQuizzes={filteredQuizzes}
              courses={courses}
              isLoading={isLoading}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              courseFilter={courseFilter}
              setCourseFilter={setCourseFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onLaunchSimulator={handleLaunchSimulator}
              onViewSubmissions={(q) => setSubmissionsQuiz(q)}
              onInspectQuiz={(q) => setInspectingQuiz(q)}
              onEditQuiz={handleOpenEditQuiz}
              onTogglePublish={handleTogglePublish}
              onDeleteQuiz={handleDeleteQuiz}
            />
          )}

          {/* Sub-tab 2: Live Simulator */}
          {qaSubTab === 'simulator' && (
            <QuizSimulatorTab
              quizzes={quizzes}
              simulatorQuiz={simulatorQuiz}
              onSelectQuiz={setSimulatorQuiz}
              onClose={() => setQaSubTab('directory')}
              onSubmitted={() => refetch()}
            />
          )}

        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 2: Activities                                        */}
      {/* ============================================================ */}
      {activeSection === 'activities' && (
        <ActivitiesDirectoryTab
          activities={activities}
          courses={courses}
          cohorts={cohorts}
          isLoading={isLoading}
          onCreateActivity={handleOpenCreateActivity}
          onEditActivity={handleOpenEditActivity}
          onReviewSubmissions={(act) => setReviewActivity(act)}
          onDeleteActivity={handleDeleteActivity}
        />
      )}

      {/* ============================================================ */}
      {/* SECTION 3: Question Bank                                     */}
      {/* ============================================================ */}
      {activeSection === 'questionBank' && (
        <QuestionBankTab
          questions={questions}
          filteredQuestions={filteredQuestions}
          qbSearch={qbSearch}
          setQbSearch={setQbSearch}
          qbDomainFilter={qbDomainFilter}
          setQbDomainFilter={setQbDomainFilter}
          onRefresh={() => refetch()}
        />
      )}

      {/* ============================================================ */}
      {/* Modals                                                       */}
      {/* ============================================================ */}

      {/* Quiz / Exam Inspection Modal */}
      <QuizInspectionModal
        quiz={inspectingQuiz}
        courses={courses}
        onClose={() => setInspectingQuiz(null)}
        onEdit={(q) => {
          setInspectingQuiz(null);
          handleOpenEditQuiz(q);
        }}
        onTogglePublish={async (q) => {
          await handleTogglePublish(q);
        }}
        onDelete={async (q) => {
          setInspectingQuiz(null);
          await handleDeleteQuiz(q);
        }}
      />

      {/* Quiz / Exam Submissions Modal */}
      {submissionsQuiz && (
        <QuizSubmissionsModal
          quiz={submissionsQuiz}
          onClose={() => setSubmissionsQuiz(null)}
        />
      )}

      {/* Activity Create / Edit Modal */}
      {isActivityModalOpen && (
        <CreateActivityModal
          isOpen={isActivityModalOpen}
          activityToEdit={activityToEdit}
          courseId={courses[0]?.id ? String(courses[0].id) : ''}
          cohortId={cohorts[0]?.id ? String(cohorts[0].id) : ''}
          availableCohorts={cohorts.map((c) => ({ id: String(c.id), name: c.name, code: c.code }))}
          onClose={() => setIsActivityModalOpen(false)}
          onSuccess={() => {
            setIsActivityModalOpen(false);
            refetch();
          }}
        />
      )}

      {/* Activity Submissions Review Modal */}
      {reviewActivity && (
        <ReviewSubmissionsModal
          isOpen={Boolean(reviewActivity)}
          cohortId={String(reviewActivity.cohort)}
          activity={reviewActivity}
          onClose={() => setReviewActivity(null)}
          onSuccess={() => {
            setReviewActivity(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default AdminQuizBankPage;

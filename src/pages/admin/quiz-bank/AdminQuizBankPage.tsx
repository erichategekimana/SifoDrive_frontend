import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useTranslation } from '../../../context/I18nContext';
import { useLmsStudioData } from '../../../features/lms/hooks/useLmsStudioData';
import { AdminService, type QuizItem } from '../../../core/services/AdminService';
import { QuizBuilderModal } from '../../../features/lms/components/quiz/QuizBuilderModal';
import { QuizInspectionModal } from '../../../features/lms/components/quiz/QuizInspectionModal';
import { QuizSubmissionsModal } from '../../../features/lms/components/quiz/QuizSubmissionsModal';
import { QuizBankHeader } from './QuizBankHeader';
import { QuizBankKpiRibbon } from './QuizBankKpiRibbon';
import { QuizBankTabsNav } from './QuizBankTabsNav';
import { QuizDirectoryTab } from './QuizDirectoryTab';
import { QuizSimulatorTab } from './QuizSimulatorTab';
import { QuestionBankTab } from './QuestionBankTab';

export const AdminQuizBankPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { success, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  const isTrainingAdmin = user?.isTrainingAdmin();
  const isSystemAdmin = user?.isSystemAdmin();

  const {
    quizzes,
    courses,
    questions,
    isLoading,
    isRefetching,
    refetch,
  } = useLmsStudioData();

  // Top tabs
  const [activeTab, setActiveTab] = useState<'quizzes' | 'simulator' | 'questionBank'>('quizzes');

  // Filters for Quizzes directory
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'LIVE_TIMED' | 'WORK_SUBMISSION'>('ALL');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Question bank tab filters
  const [qbSearch, setQbSearch] = useState<string>('');
  const [qbDomainFilter, setQbDomainFilter] = useState<string>('ALL');
  const [qbDifficultyFilter, setQbDifficultyFilter] = useState<string>('ALL');

  // Modal states
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingQuizId, setEditingQuizId] = useState<string>('');
  const [inspectingQuiz, setInspectingQuiz] = useState<QuizItem | null>(null);
  const [submissionsQuiz, setSubmissionsQuiz] = useState<QuizItem | null>(null);

  // Simulator target quiz
  const [simulatorQuiz, setSimulatorQuiz] = useState<QuizItem | null>(null);

  // Filtered Quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      // Type filter
      if (typeFilter !== 'ALL') {
        const qType = q.quiz_type || 'LIVE_TIMED';
        if (qType !== typeFilter) return false;
      }
      // Course filter
      if (courseFilter !== 'ALL' && String(q.course) !== String(courseFilter)) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && q.status?.toUpperCase() !== statusFilter.toUpperCase()) {
        return false;
      }
      // Search query
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      return (
        q.title?.toLowerCase().includes(term) ||
        q.title_kinyarwanda?.toLowerCase().includes(term) ||
        q.course_title?.toLowerCase().includes(term) ||
        q.module_title?.toLowerCase().includes(term) ||
        q.description?.toLowerCase().includes(term)
      );
    });
  }, [quizzes, typeFilter, courseFilter, statusFilter, searchQuery]);

  // Filtered Question Bank
  const filteredQuestions = useMemo(() => {
    return questions.filter((q: any) => {
      if (qbDomainFilter !== 'ALL' && q.domain !== qbDomainFilter) return false;
      if (qbDifficultyFilter !== 'ALL' && q.difficulty !== qbDifficultyFilter) return false;
      if (!qbSearch) return true;
      const term = qbSearch.toLowerCase();
      return (
        q.question_text?.toLowerCase().includes(term) ||
        q.question_text_kinyarwanda?.toLowerCase().includes(term) ||
        String(q.question_number)?.includes(term)
      );
    });
  }, [questions, qbDomainFilter, qbDifficultyFilter, qbSearch]);

  // Counts for KPIs
  const liveCount = useMemo(() => quizzes.filter((q) => (q.quiz_type || 'LIVE_TIMED') === 'LIVE_TIMED').length, [quizzes]);
  const workSubmissionCount = useMemo(() => quizzes.filter((q) => q.quiz_type === 'WORK_SUBMISSION').length, [quizzes]);
  const proctoredCount = useMemo(() => quizzes.filter((q) => (q.quiz_type || 'LIVE_TIMED') === 'LIVE_TIMED' && q.enable_proctoring).length, [quizzes]);

  // Actions
  const handleOpenCreateQuiz = () => {
    setIsEditMode(false);
    setEditingQuizId('');
    setIsBuilderModalOpen(true);
  };

  const handleOpenEditQuiz = (q: QuizItem) => {
    setIsEditMode(true);
    setEditingQuizId(q.id);
    setIsBuilderModalOpen(true);
  };

  const handleTogglePublish = async (q: QuizItem) => {
    try {
      const updated = await adminService.togglePublishQuiz(q.id);
      success(`Quiz "${updated.title}" ${updated.is_published ? 'published' : 'unpublished'}.`);
      refetch();
    } catch (err: any) {
      toastError(err?.message || 'Failed to toggle quiz publish state.');
    }
  };

  const handleDeleteQuiz = async (q: QuizItem) => {
    if (!window.confirm(`Are you sure you want to delete quiz "${q.title}"?`)) return;
    try {
      await adminService.deleteQuiz(q.id);
      success(`Quiz "${q.title}" deleted.`);
      refetch();
    } catch (err: any) {
      toastError(err?.message || 'Failed to delete quiz.');
    }
  };

  const handleLaunchSimulator = (q: QuizItem) => {
    setSimulatorQuiz(q);
    setActiveTab('simulator');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <QuizBankHeader
        onRefresh={() => refetch()}
        onCreateQuiz={handleOpenCreateQuiz}
        isLoading={isLoading}
        isRefetching={isRefetching}
        refreshText={t('admin.dashboard.refresh')}
      />

      {/* KPI Ribbon */}
      <QuizBankKpiRibbon
        totalQuizzes={quizzes.length}
        liveCount={liveCount}
        proctoredCount={proctoredCount}
        workSubmissionCount={workSubmissionCount}
        totalQuestions={questions.length}
      />

      {/* Main Tab Navigation */}
      <QuizBankTabsNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'simulator' && !simulatorQuiz && quizzes.length > 0) {
            setSimulatorQuiz(quizzes[0]);
          }
          setActiveTab(tab);
        }}
        quizzesCount={quizzes.length}
        questionsCount={questions.length}
      />

      {/* TAB 1: Quizzes & Assessments Directory */}
      {activeTab === 'quizzes' && (
        <QuizDirectoryTab
          quizzes={quizzes}
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

      {/* TAB 2: Live Simulator & Proctoring Demo */}
      {activeTab === 'simulator' && (
        <QuizSimulatorTab
          quizzes={quizzes}
          simulatorQuiz={simulatorQuiz}
          onSelectQuiz={setSimulatorQuiz}
          onClose={() => setActiveTab('quizzes')}
          onSubmitted={() => refetch()}
        />
      )}

      {/* TAB 3: Central Question Bank */}
      {activeTab === 'questionBank' && (
        <QuestionBankTab
          questions={questions}
          filteredQuestions={filteredQuestions}
          qbSearch={qbSearch}
          setQbSearch={setQbSearch}
          qbDomainFilter={qbDomainFilter}
          setQbDomainFilter={setQbDomainFilter}
          qbDifficultyFilter={qbDifficultyFilter}
          setQbDifficultyFilter={setQbDifficultyFilter}
        />
      )}

      {/* Quiz Builder Modal */}
      <QuizBuilderModal
        isOpen={isBuilderModalOpen}
        isEditMode={isEditMode}
        editingQuizId={editingQuizId}
        courses={courses}
        questions={questions}
        isSystemAdmin={isSystemAdmin}
        isTrainingAdmin={isTrainingAdmin}
        onClose={() => setIsBuilderModalOpen(false)}
        onSuccess={() => refetch()}
        fetchBankQuestions={async () => { await adminService.getQuestions(); refetch(); }}
        isLoadingBankQuestions={false}
      />

      {/* Quiz Inspection Modal */}
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

      {/* Submissions & Telemetry Modal */}
      {submissionsQuiz && (
        <QuizSubmissionsModal
          quiz={submissionsQuiz}
          onClose={() => setSubmissionsQuiz(null)}
        />
      )}
    </div>
  );
};

export default AdminQuizBankPage;

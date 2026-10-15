import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Clock,
  FileCheck,
  ShieldAlert,
  Plus,
  RefreshCw,
  Search,
  Eye,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Sparkles,
  BookOpen,
  Award,
  Play,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/I18nContext';
import { Spinner } from '../../components/common/Spinner';
import { Badge } from '../../components/common/Badge';
import { useLmsStudioData } from '../../features/lms/hooks/useLmsStudioData';
import { AdminService, type QuizItem } from '../../core/services/AdminService';
import { QuizBuilderModal } from '../../features/lms/components/quiz/QuizBuilderModal';
import { QuizInspectionModal } from '../../features/lms/components/quiz/QuizInspectionModal';
import { QuizSubmissionsModal } from '../../features/lms/components/quiz/QuizSubmissionsModal';
import { LiveQuizSimulator } from '../../features/lms/components/quiz/LiveQuizSimulator';

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Quiz Bank & Assessment Lifecycle
            </h1>
            <Badge variant="neutral">Engine v2</Badge>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage and schedule theoretical assessments. Supports Live Timed quizzes with active tab-switching proctoring and self-paced Work Submissions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => refetch()}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isLoading || isRefetching ? 'spin' : ''} />
            <span>{t('admin.dashboard.refresh')}</span>
          </button>

          <button
            onClick={handleOpenCreateQuiz}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: 'var(--radius-lg)', fontWeight: 700 }}
          >
            <Plus size={16} />
            <span>Create New Quiz</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-lg)', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HelpCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>{quizzes.length}</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Total Quizzes in Bank</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-lg)', background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>{liveCount}</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Live Timed ({proctoredCount} Proctored)</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-lg)', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>{workSubmissionCount}</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Work Submissions (Take-Home)</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-lg)', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>{questions.length}</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Central Highway Code Questions</div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '10px',
        }}
      >
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`btn btn-sm ${activeTab === 'quizzes' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
        >
          <HelpCircle size={15} />
          <span>Quizzes & Assessments ({quizzes.length})</span>
        </button>

        <button
          onClick={() => {
            if (!simulatorQuiz && quizzes.length > 0) {
              setSimulatorQuiz(quizzes[0]);
            }
            setActiveTab('simulator');
          }}
          className={`btn btn-sm ${activeTab === 'simulator' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
        >
          <Play size={15} />
          <span>Live Proctoring Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('questionBank')}
          className={`btn btn-sm ${activeTab === 'questionBank' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
        >
          <BookOpen size={15} />
          <span>Central Question Bank ({questions.length})</span>
        </button>
      </div>

      {/* TAB 1: Quizzes & Assessments Directory */}
      {activeTab === 'quizzes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filter Bar */}
          <div
            className="glass-panel"
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
              {/* Search */}
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search
                  size={15}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder="Search quizzes, modules, rubrics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                  }}
                />
              </div>

              {/* Type Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                  }}
                >
                  <option value="ALL">All Quiz Types</option>
                  <option value="LIVE_TIMED">Live Timed (Proctored)</option>
                  <option value="WORK_SUBMISSION">Work Submission (Take-Home)</option>
                </select>
              </div>

              {/* Course Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Course:</span>
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                  }}
                >
                  <option value="ALL">All Courses</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title || c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="CLOSED">Closed</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {filteredQuizzes.length} of {quizzes.length} assessments
            </div>
          </div>

          {/* Quizzes List Cards */}
          {isLoading && quizzes.length === 0 ? (
            <div style={{ padding: '80px 0', textAlign: 'center' }}>
              <Spinner message="Loading Quiz Bank assessments..." />
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div
              className="glass-panel"
              style={{ padding: '60px 24px', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}
            >
              <HelpCircle size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>No quizzes found</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Try adjusting your search query, type, course, or status filter.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredQuizzes.map((quiz) => {
                const isLive = (quiz.quiz_type || 'LIVE_TIMED') === 'LIVE_TIMED';
                const isProctored = Boolean(isLive && quiz.enable_proctoring);

                return (
                  <div
                    key={quiz.id}
                    className="glass-panel"
                    style={{
                      padding: '20px 24px',
                      borderRadius: 'var(--radius-xl)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Upper row: Title, Badges, and Status */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: 'var(--radius-lg)',
                            background: isLive ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                            color: isLive ? '#38bdf8' : '#c084fc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isLive ? <Clock size={22} /> : <FileCheck size={22} />}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                              {quiz.title}
                            </h3>
                            <Badge variant={isLive ? 'info' : 'neutral'}>
                              {isLive ? 'Live Timed' : 'Work Submission'}
                            </Badge>
                            {isProctored && (
                              <Badge variant="warning">
                                <ShieldAlert size={12} style={{ marginRight: '3px' }} />
                                Tab Proctoring (Max {quiz.max_tab_switches_allowed || 3})
                              </Badge>
                            )}
                            {quiz.is_final_exam && (
                              <Badge variant="danger">
                                <Award size={12} style={{ marginRight: '3px' }} />
                                Final Exam
                              </Badge>
                            )}
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {quiz.course_title} {quiz.module_title ? `• ${quiz.module_title}` : ''}
                          </div>
                        </div>
                      </div>

                      {/* Status badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Badge
                          variant={
                            quiz.status === 'OPEN'
                              ? 'success'
                              : quiz.status === 'SCHEDULED'
                              ? 'info'
                              : quiz.status === 'DRAFT'
                              ? 'neutral'
                              : 'danger'
                          }
                        >
                          {quiz.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Middle description */}
                    {quiz.description && (
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                        {quiz.description}
                      </p>
                    )}

                    {/* Lower specs & action bar */}
                    <div
                      style={{
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      {/* Specifications */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <div>
                          <strong style={{ color: '#ffffff' }}>{quiz.question_count || quiz.items?.length || 0}</strong> Questions
                        </div>
                        <div>
                          Passing: <strong style={{ color: '#ffffff' }}>{quiz.passing_score}%</strong>
                        </div>
                        <div>
                          Time: <strong style={{ color: '#ffffff' }}>{quiz.time_limit_minutes > 0 ? `${quiz.time_limit_minutes}m` : 'Untimed'}</strong>
                        </div>
                        <div>
                          Attempts: <strong style={{ color: '#ffffff' }}>{quiz.max_attempts > 0 ? quiz.max_attempts : 'Unlimited'}</strong>
                        </div>
                        {quiz.deadline && (
                          <div>
                            Deadline: <strong style={{ color: '#ffffff' }}>{new Date(quiz.deadline).toLocaleDateString()}</strong>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Test Drive in Simulator */}
                        <button
                          onClick={() => handleLaunchSimulator(quiz)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}
                          title="Test-drive this quiz in interactive simulation mode"
                        >
                          <Play size={14} />
                          <span>Test Drive</span>
                        </button>

                        {/* Submissions & Telemetry */}
                        <button
                          onClick={() => setSubmissionsQuiz(quiz)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          title="View student attempts, telemetry and proctoring violations"
                        >
                          <FileCheck size={14} />
                          <span>Submissions</span>
                        </button>

                        {/* Inspect */}
                        <button
                          onClick={() => setInspectingQuiz(quiz)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          title="Inspect rubric, questions and configuration"
                        >
                          <Eye size={14} />
                          <span>Inspect</span>
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEditQuiz(quiz)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          title="Edit quiz parameters"
                        >
                          <Pencil size={14} />
                          <span>Edit</span>
                        </button>

                        {/* Publish / Unpublish */}
                        <button
                          onClick={() => handleTogglePublish(quiz)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          title={quiz.is_published ? 'Unpublish quiz' : 'Publish quiz'}
                        >
                          {quiz.is_published ? <PowerOff size={14} style={{ color: '#ef4444' }} /> : <Power size={14} style={{ color: '#10b981' }} />}
                          <span>{quiz.is_published ? 'Unpublish' : 'Publish'}</span>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteQuiz(quiz)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#ef4444', padding: '6px 8px' }}
                          title="Delete quiz"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Live Simulator & Proctoring Demo */}
      {activeTab === 'simulator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Target Quiz Selector */}
          <div
            className="glass-panel"
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={18} style={{ color: '#38bdf8' }} />
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
                  Interactive Quiz Test Runner
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                  Select any quiz to test live timer, question selection, and tab-switching proctoring violation detection.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Quiz:</span>
              <select
                value={simulatorQuiz?.id || ''}
                onChange={(e) => {
                  const target = quizzes.find((q) => q.id === e.target.value);
                  if (target) setSimulatorQuiz(target);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  minWidth: '240px',
                }}
              >
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title} ({(q.quiz_type || 'LIVE_TIMED') === 'LIVE_TIMED' ? 'Live' : 'Take-Home'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {simulatorQuiz ? (
            <LiveQuizSimulator
              key={simulatorQuiz.id}
              quiz={simulatorQuiz}
              onClose={() => setActiveTab('quizzes')}
              onSubmitted={() => {
                refetch();
              }}
            />
          ) : (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No quiz selected for simulation.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Central Question Bank */}
      {activeTab === 'questionBank' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filter Bar */}
          <div
            className="glass-panel"
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search
                  size={15}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder="Search question bank by English or Kinyarwanda..."
                  value={qbSearch}
                  onChange={(e) => setQbSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Domain:</span>
                <select
                  value={qbDomainFilter}
                  onChange={(e) => setQbDomainFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                  }}
                >
                  <option value="ALL">All Domains</option>
                  <option value="PRIORITY">Priority & Right-of-Way</option>
                  <option value="ROAD_SIGNS">Road Signs</option>
                  <option value="SPEED">Speed Limits</option>
                  <option value="TECHNICAL">Technical Rules</option>
                  <option value="SIGNALS">Traffic Signals</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Difficulty:</span>
                <select
                  value={qbDifficultyFilter}
                  onChange={(e) => setQbDifficultyFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                  }}
                >
                  <option value="ALL">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {filteredQuestions.length} of {questions.length} questions
            </div>
          </div>

          {/* Question Bank Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredQuestions.slice(0, 50).map((q: any) => (
              <div
                key={q.id}
                className="glass-panel"
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-xl)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8' }}>
                      #{q.question_number || 'Q'}
                    </span>
                    <Badge variant="neutral">{q.domain}</Badge>
                    <Badge
                      variant={q.difficulty === 'EASY' ? 'success' : q.difficulty === 'HARD' ? 'danger' : 'warning'}
                    >
                      {q.difficulty}
                    </Badge>
                  </div>
                </div>

                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                  {q.question_text}
                </div>

                {q.question_text_kinyarwanda && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    {q.question_text_kinyarwanda}
                  </div>
                )}

                {/* Option summary */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div>A: {q.option_a}</div>
                  <div>B: {q.option_b}</div>
                  {q.option_c && <div>C: {q.option_c}</div>}
                  {q.option_d && <div>D: {q.option_d}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
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

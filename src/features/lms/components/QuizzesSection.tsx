import React, { useState, useMemo } from 'react';
import {
  ListChecks,
  Plus,
  CheckCircle2,
  Clock,
  FileCheck,
  Search,
  Calendar,
  Eye,
  Pencil,
  Power,
  PowerOff,
  Trash2,
} from 'lucide-react';
import { AdminService } from '../../../core/services/AdminService';
import type { QuizItem } from '../../../core/services/AdminService';
import { useToast } from '../../../context/ToastContext';
import { useTranslation } from '../../../context/I18nContext';
import { QuizBuilderModal } from './quiz/QuizBuilderModal';
import { QuizInspectionModal } from './quiz/QuizInspectionModal';

export interface QuizzesSectionProps {
  quizzes: QuizItem[];
  courses: any[];
  questions: any[];
  refetch: () => Promise<void>;
  isSystemAdmin?: boolean;
  isTrainingAdmin?: boolean;
}

export const QuizzesSection: React.FC<QuizzesSectionProps> = ({
  quizzes,
  courses,
  questions,
  refetch,
  isSystemAdmin,
  isTrainingAdmin,
}) => {
  const { t } = useTranslation();
  const { success, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  const [quizSearch, setQuizSearch] = useState<string>('');
  const [quizCourseFilter, setQuizCourseFilter] = useState<string>('ALL');
  const [quizStatusFilter, setQuizStatusFilter] = useState<string>('ALL');

  // Modal states
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);
  const [isEditQuizMode, setIsEditQuizMode] = useState<boolean>(false);
  const [editingQuizId, setEditingQuizId] = useState<string>('');
  const [inspectingQuiz, setInspectingQuiz] = useState<QuizItem | null>(null);
  const [isLoadingBankQuestions, setIsLoadingBankQuestions] = useState<boolean>(false);

  const fetchBankQuestions = async () => {
    setIsLoadingBankQuestions(true);
    try {
      await adminService.getQuestions();
      refetch();
    } catch (e: any) {
      console.error('Failed to load question bank:', e);
    } finally {
      setIsLoadingBankQuestions(false);
    }
  };

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      if (quizCourseFilter !== 'ALL' && quiz.course !== quizCourseFilter) return false;
      if (quizStatusFilter !== 'ALL' && quiz.status !== quizStatusFilter) return false;
      if (!quizSearch) return true;
      const search = quizSearch.toLowerCase();
      return (
        quiz.title?.toLowerCase().includes(search) ||
        quiz.title_kinyarwanda?.toLowerCase().includes(search) ||
        quiz.course_title?.toLowerCase().includes(search) ||
        quiz.module_title?.toLowerCase().includes(search) ||
        quiz.description?.toLowerCase().includes(search)
      );
    });
  }, [quizzes, quizCourseFilter, quizStatusFilter, quizSearch]);

  const handleOpenCreateQuiz = () => {
    setIsEditQuizMode(false);
    setEditingQuizId('');
    setIsQuizModalOpen(true);
  };

  const handleOpenEditQuiz = (quiz: QuizItem) => {
    setIsEditQuizMode(true);
    setEditingQuizId(quiz.id);
    setIsQuizModalOpen(true);
  };

  const handleDeleteQuiz = async (quiz: QuizItem) => {
    if (!window.confirm(`Are you sure you want to delete quiz "${quiz.title}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await adminService.deleteQuiz(quiz.id);
      success(`Quiz "${quiz.title}" deleted.`);
      refetch();
    } catch (err: any) {
      toastError(err?.message || 'Failed to delete quiz.');
    }
  };

  const handleTogglePublishQuiz = async (quiz: QuizItem) => {
    try {
      const res = await adminService.togglePublishQuiz(quiz.id);
      success(`Quiz ${res.is_published ? 'published' : 'unpublished'}.`);
      refetch();
    } catch (err: any) {
      toastError(err?.message || 'Failed to toggle publish state.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-xl)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              {t('admin.courses.tabQuizBank')}
            </h2>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {quizzes.length} Quizzes
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleOpenCreateQuiz}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: 'var(--radius-lg)', fontWeight: 700 }}
          >
            <Plus size={16} />
            <span>{t('admin.courses.createQuiz')}</span>
          </button>
        </div>
      </div>

      {/* Course Quizzes Directory */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Status Metrics Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
              <ListChecks size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>{quizzes.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Quizzes</div>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {quizzes.filter((q) => q.status === 'OPEN').length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active & Open</div>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {quizzes.filter((q) => q.status === 'SCHEDULED').length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scheduled</div>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
              <FileCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {quizzes.filter((q) => q.status === 'DRAFT').length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Draft Mode</div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div
          className="glass-panel"
          style={{
            borderRadius: 'var(--radius-xl)',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search quizzes, courses, modules..."
                value={quizSearch}
                onChange={(e) => setQuizSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                }}
              />
            </div>

            <select
              value={quizCourseFilter}
              onChange={(e) => setQuizCourseFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.84rem',
              }}
            >
              <option value="ALL">All Courses ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            <select
              value={quizStatusFilter}
              onChange={(e) => setQuizStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.84rem',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open (Live Now)</option>
              <option value="SCHEDULED">Scheduled (Future Open Date)</option>
              <option value="CLOSED">Closed (Deadline Passed)</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Showing {filteredQuizzes.length} of {quizzes.length} quizzes
          </div>
        </div>

        {/* Quizzes Table */}
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          {filteredQuizzes.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: '#60a5fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <ListChecks size={28} />
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                No quizzes found
              </h4>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                {quizSearch || quizCourseFilter !== 'ALL' || quizStatusFilter !== 'ALL'
                  ? 'No quizzes matched your filter criteria. Try resetting the filters.'
                  : t('admin.courses.noQuizzesFound')}
              </p>
              <button
                type="button"
                onClick={handleOpenCreateQuiz}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={16} />
                <span>{t('admin.courses.createQuiz')}</span>
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Quiz & Course Scope</th>
                    <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Availability Window</th>
                    <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Assessment Rules</th>
                    <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Questions</th>
                    <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Author / Oversight</th>
                    <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuizzes.map((quiz) => {
                    const statusColors: Record<string, { bg: string; text: string; border: string }> = {
                      OPEN: { bg: 'rgba(255, 255, 255, 0.08)', text: '#ffffff', border: 'var(--border-subtle)' },
                      SCHEDULED: { bg: 'rgba(255, 255, 255, 0.04)', text: 'var(--text-secondary)', border: 'var(--border-subtle)' },
                      CLOSED: { bg: 'rgba(255, 255, 255, 0.03)', text: 'var(--text-muted)', border: 'var(--border-subtle)' },
                      DRAFT: { bg: 'rgba(255, 255, 255, 0.03)', text: 'var(--text-muted)', border: 'var(--border-subtle)' },
                    };
                    const col = statusColors[quiz.status] || statusColors.DRAFT;

                    return (
                      <tr
                        key={quiz.id}
                        style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        {/* Title & Scope */}
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>
                            {quiz.title}
                          </div>
                          {quiz.title_kinyarwanda && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {quiz.title_kinyarwanda}
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.04)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-subtle)',
                                fontWeight: 500,
                              }}
                            >
                              Course: {quiz.course_title}
                            </span>
                            {quiz.module_title && (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  color: 'var(--text-secondary)',
                                  border: '1px solid var(--border-subtle)',
                                  fontWeight: 500,
                                }}
                              >
                                Module: {quiz.module_title}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '16px 18px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              padding: '3px 8px',
                              borderRadius: '4px',
                              background: col.bg,
                              color: col.text,
                              border: `1px solid ${col.border}`,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: col.text }} />
                            {quiz.status}
                          </span>
                        </td>

                        {/* Availability Window */}
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.78rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: quiz.open_date ? '#ffffff' : 'var(--text-muted)' }}>
                              <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                              <span>Open: {quiz.open_date ? new Date(quiz.open_date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Immediately'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: quiz.deadline ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                              <Clock size={13} style={{ color: 'var(--text-muted)' }} />
                              <span>Due: {quiz.deadline ? new Date(quiz.deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No deadline'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Rules */}
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
                            <div style={{ fontWeight: 700, color: '#ffffff' }}>
                              {quiz.total_score} Pts • Pass {quiz.passing_score}%
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                              {quiz.time_limit_minutes > 0 ? `${quiz.time_limit_minutes} min limit` : 'No time limit'} • {quiz.max_attempts > 0 ? `${quiz.max_attempts} attempt(s)` : 'Unlimited attempts'}
                            </div>
                          </div>
                        </td>

                        {/* Questions */}
                        <td style={{ padding: '16px 18px' }}>
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: '0.82rem',
                              color: '#ffffff',
                              background: 'rgba(255, 255, 255, 0.04)',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            {quiz.question_count} Qs
                          </span>
                        </td>

                        {/* Author */}
                        <td style={{ padding: '16px 18px' }}>
                          {quiz.created_by_detail ? (
                            <div style={{ fontSize: '0.78rem' }}>
                              <div style={{ fontWeight: 700, color: '#ffffff' }}>
                                {quiz.created_by_detail.full_name}
                              </div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                                {quiz.created_by_detail.role.replace('_', ' ')} • {quiz.created_by_detail.phone_number}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>System Staff</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              title="Inspect Quiz & Rubric"
                              onClick={() => setInspectingQuiz(quiz)}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-subtle)',
                                background: 'var(--bg-surface-elevated)',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              type="button"
                              title="Edit Quiz"
                              onClick={() => handleOpenEditQuiz(quiz)}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                background: 'rgba(59, 130, 246, 0.1)',
                                color: '#60a5fa',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Pencil size={14} />
                            </button>

                            <button
                              type="button"
                              title={quiz.is_published ? 'Unpublish Quiz' : 'Publish Quiz'}
                              onClick={() => handleTogglePublishQuiz(quiz)}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: quiz.is_published ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--border-subtle)',
                                background: quiz.is_published ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-surface-elevated)',
                                color: quiz.is_published ? '#4ade80' : 'var(--text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {quiz.is_published ? <Power size={14} /> : <PowerOff size={14} />}
                            </button>

                            <button
                              type="button"
                              title="Delete Quiz"
                              onClick={() => handleDeleteQuiz(quiz)}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#f87171',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <QuizBuilderModal
        isOpen={isQuizModalOpen}
        isEditMode={isEditQuizMode}
        editingQuizId={editingQuizId}
        courses={courses}
        questions={questions}
        isSystemAdmin={isSystemAdmin}
        isTrainingAdmin={isTrainingAdmin}
        onClose={() => setIsQuizModalOpen(false)}
        onSuccess={refetch}
        fetchBankQuestions={fetchBankQuestions}
        isLoadingBankQuestions={isLoadingBankQuestions}
      />

      <QuizInspectionModal
        quiz={inspectingQuiz}
        onClose={() => setInspectingQuiz(null)}
        onEdit={(q) => {
          setInspectingQuiz(null);
          handleOpenEditQuiz(q);
        }}
      />
    </div>
  );
};

export default QuizzesSection;

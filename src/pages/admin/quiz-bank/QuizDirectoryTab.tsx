import React from 'react';
import {
  Search,
  HelpCircle,
  Clock,
  FileCheck,
  ShieldAlert,
  Award,
  Play,
  Eye,
  Pencil,
  Power,
  PowerOff,
  Trash2,
} from 'lucide-react';
import { Spinner } from '../../../components/common/Spinner';
import { Badge } from '../../../components/common/Badge';
import type { QuizItem } from '../../../core/services/AdminService';

interface QuizDirectoryTabProps {
  quizzes: QuizItem[];
  filteredQuizzes: QuizItem[];
  courses: Array<{ id: string | number; title?: string; name?: string }>;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  typeFilter: 'ALL' | 'LIVE_TIMED' | 'WORK_SUBMISSION';
  setTypeFilter: (val: 'ALL' | 'LIVE_TIMED' | 'WORK_SUBMISSION') => void;
  courseFilter: string;
  setCourseFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  onLaunchSimulator: (q: QuizItem) => void;
  onViewSubmissions: (q: QuizItem) => void;
  onInspectQuiz: (q: QuizItem) => void;
  onEditQuiz: (q: QuizItem) => void;
  onTogglePublish: (q: QuizItem) => void;
  onDeleteQuiz: (q: QuizItem) => void;
}

export const QuizDirectoryTab: React.FC<QuizDirectoryTabProps> = ({
  quizzes,
  filteredQuizzes,
  courses,
  isLoading,
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  courseFilter,
  setCourseFilter,
  statusFilter,
  setStatusFilter,
  onLaunchSimulator,
  onViewSubmissions,
  onInspectQuiz,
  onEditQuiz,
  onTogglePublish,
  onDeleteQuiz,
}) => {
  return (
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
              <option value="LIVE_TIMED">Live Timed</option>
              <option value="WORK_SUBMISSION">Work Submission</option>
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
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
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
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                      title={isLive ? 'Live Timed Quiz' : 'Work Submission'}
                    >
                      {isLive ? <Clock size={22} /> : <FileCheck size={22} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                          {quiz.title}
                        </h3>
                        {isProctored && (
                          <Badge variant="warning">
                            <ShieldAlert size={12} style={{ marginRight: '3px' }} />
                            Proctoring on
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

                {/* Lower specs & action bar */}
                <div
                  style={{
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  {/* Specifications */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <div>
                      <strong style={{ color: '#ffffff' }}>{quiz.question_count || quiz.items?.length || 0}</strong> Questions
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Simulation */}
                    <button
                      onClick={() => onLaunchSimulator(quiz)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}
                      title="Launch interactive simulation mode"
                    >
                      <Play size={14} />
                      <span>Simulation</span>
                    </button>

                    {/* Submissions & Telemetry */}
                    <button
                      onClick={() => onViewSubmissions(quiz)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="View student attempts, telemetry and proctoring violations"
                    >
                      <FileCheck size={14} />
                      <span>Submissions</span>
                    </button>

                    {/* Inspect */}
                    <button
                      onClick={() => onInspectQuiz(quiz)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="Inspect rubric, questions and configuration"
                    >
                      <Eye size={14} />
                      <span>Inspect</span>
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEditQuiz(quiz)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="Edit quiz parameters"
                    >
                      <Pencil size={14} />
                      <span>Edit</span>
                    </button>

                    {/* Publish / Unpublish */}
                    <button
                      onClick={() => onTogglePublish(quiz)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      title={quiz.is_published ? 'Unpublish quiz' : 'Publish quiz'}
                    >
                      {quiz.is_published ? <PowerOff size={14} style={{ color: '#ef4444' }} /> : <Power size={14} style={{ color: '#10b981' }} />}
                      <span>{quiz.is_published ? 'Unpublish' : 'Publish'}</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDeleteQuiz(quiz)}
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
  );
};

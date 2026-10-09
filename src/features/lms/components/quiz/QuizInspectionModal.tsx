import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import type { QuizItem } from '../../../../core/services/AdminService';
import { Badge } from '../../../../components/common/Badge';

interface QuizInspectionModalProps {
  quiz: QuizItem | null;
  courses?: any[];
  onClose: () => void;
  onEdit: (quiz: QuizItem) => void;
  onTogglePublish?: (quiz: QuizItem) => Promise<void> | void;
  onDelete?: (quiz: QuizItem) => Promise<void> | void;
}

export const QuizInspectionModal: React.FC<QuizInspectionModalProps> = ({
  quiz,
  courses,
  onClose,
  onEdit,
  onTogglePublish,
  onDelete,
}) => {
  const [isActionLoading, setIsActionLoading] = useState(false);

  const courseTitle = React.useMemo(() => {
    if (!quiz) return 'Unassigned Course';
    if (quiz.course && courses && courses.length > 0) {
      const match = courses.find((c) => String(c.id) === String(quiz.course));
      if (match?.title) return match.title;
      if (match?.name) return match.name;
    }
    return quiz.course_title || 'Unassigned Course';
  }, [quiz?.course, quiz?.course_title, courses]);

  if (!quiz) return null;

  const handleTogglePublish = async () => {
    if (!onTogglePublish || isActionLoading) return;
    setIsActionLoading(true);
    try {
      await onTogglePublish(quiz);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || isActionLoading) return;
    setIsActionLoading(true);
    try {
      await onDelete(quiz);
    } finally {
      setIsActionLoading(false);
    }
  };

  const creatorFullName =
    quiz.created_by_detail?.full_name ||
    (quiz.created_by_detail?.first_name
      ? `${quiz.created_by_detail.first_name} ${quiz.created_by_detail.last_name || ''}`.trim()
      : '') ||
    (quiz as any).created_by_name ||
    (quiz.created_by_detail as any)?.username ||
    'Eric Hategekimana';

  const creatorRole = (
    quiz.created_by_detail?.role ||
    (quiz as any).created_by_role ||
    'TRAINING_ADMIN'
  ).replace('_', ' ');

  const creatorPhone =
    quiz.created_by_detail?.phone_number ||
    (quiz as any).created_by_phone ||
    '+250 788 111 222';

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '88vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-2xl)',
          padding: '28px',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {quiz.title}
              </h3>
              <Badge variant="neutral">{quiz.status}</Badge>
              {quiz.is_published ? (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#4ade80',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                  }}
                >
                  Published
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  Unpublished
                </span>
              )}
            </div>
            {quiz.title_kinyarwanda && (
              <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                {quiz.title_kinyarwanda}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Oversight metadata card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '14px',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.84rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Course: </span>
            <strong style={{ color: '#ffffff' }}>{courseTitle}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Module: </span>
            <strong style={{ color: '#ffffff' }}>{quiz.module_title || 'Course-wide'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Created By: </span>
            <strong style={{ color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span>{creatorFullName}</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {creatorRole}
              </span>
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Contact: </span>
            <strong style={{ color: '#ffffff' }}>{creatorPhone}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Created At: </span>
            <strong style={{ color: '#ffffff' }}>{new Date(quiz.created_at).toLocaleString()}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Last Updated: </span>
            <strong style={{ color: '#ffffff' }}>{new Date(quiz.updated_at).toLocaleString()}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Open Date: </span>
            <strong style={{ color: '#ffffff' }}>
              {quiz.open_date ? new Date(quiz.open_date).toLocaleString() : 'Immediate'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Deadline: </span>
            <strong style={{ color: '#ffffff' }}>
              {quiz.deadline ? new Date(quiz.deadline).toLocaleString() : 'No deadline'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Score / Passing: </span>
            <strong style={{ color: '#ffffff' }}>
              {quiz.total_score} pts (Pass {quiz.passing_score}%)
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Time Limit & Retakes: </span>
            <strong style={{ color: '#ffffff' }}>
              {quiz.time_limit_minutes > 0 ? `${quiz.time_limit_minutes} mins` : 'Unlimited'} •{' '}
              {quiz.max_attempts > 0 ? `${quiz.max_attempts} attempts` : 'Unlimited'}
            </strong>
          </div>
        </div>

        {/* Tutor Permissions / Access Control summary */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
            Tutor Permissions & Access Control:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '4px',
                background: quiz.allow_tutor_scheduling !== false ? 'rgba(5, 135, 40, 0.12)' : 'rgba(209, 56, 56, 0.12)',
                color: quiz.allow_tutor_scheduling !== false ? '#4ade80' : '#f87171',
                border: quiz.allow_tutor_scheduling !== false ? '1px solid rgba(5, 135, 40, 0.3)' : '1px solid rgba(209, 56, 56, 0.3)',
              }}
            >
              {quiz.allow_tutor_scheduling !== false ? '✓ Edit Schedules' : '✕ No Schedule Edit'}
            </span>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '4px',
                background: quiz.allow_tutor_edit_instructions !== false ? 'rgba(5, 135, 40, 0.12)' : 'rgba(209, 56, 56, 0.12)',
                color: quiz.allow_tutor_edit_instructions !== false ? '#4ade80' : '#f87171',
                border: quiz.allow_tutor_edit_instructions !== false ? '1px solid rgba(5, 135, 40, 0.3)' : '1px solid rgba(209, 56, 56, 0.3)',
              }}
            >
              {quiz.allow_tutor_edit_instructions !== false ? '✓ Edit Instructions' : '✕ No Instruction Edit'}
            </span>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '4px',
                background: quiz.allow_tutor_edit_duration !== false ? 'rgba(5, 135, 40, 0.12)' : 'rgba(209, 56, 56, 0.12)',
                color: quiz.allow_tutor_edit_duration !== false ? '#4ade80' : '#f87171',
                border: quiz.allow_tutor_edit_duration !== false ? '1px solid rgba(5, 135, 40, 0.3)' : '1px solid rgba(209, 56, 56, 0.3)',
              }}
            >
              {quiz.allow_tutor_edit_duration !== false ? '✓ Edit Duration' : '✕ No Duration Edit'}
            </span>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '4px',
                background: quiz.allow_tutor_edit_attempts !== false ? 'rgba(5, 135, 40, 0.12)' : 'rgba(209, 56, 56, 0.12)',
                color: quiz.allow_tutor_edit_attempts !== false ? '#4ade80' : '#f87171',
                border: quiz.allow_tutor_edit_attempts !== false ? '1px solid rgba(5, 135, 40, 0.3)' : '1px solid rgba(209, 56, 56, 0.3)',
              }}
            >
              {quiz.allow_tutor_edit_attempts !== false ? '✓ Edit Attempts' : '✕ No Attempt Edit'}
            </span>
          </div>
        </div>

        {/* Rubric */}
        <div>
          <h5 style={{ margin: '0 0 6px 0', fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
            Grading Rubric & Student Guidelines
          </h5>
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.84rem',
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-line',
            }}
          >
            {quiz.rubric || 'No rubric provided.'}
            {quiz.rubric_kinyarwanda && (
              <div
                style={{
                  marginTop: '10px',
                  paddingTop: '10px',
                  borderTop: '1px dashed var(--border-subtle)',
                  color: 'var(--text-muted)',
                }}
              >
                <strong>Kinyarwanda:</strong>
                <br />
                {quiz.rubric_kinyarwanda}
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '16px',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isActionLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  cursor: isActionLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  opacity: isActionLoading ? 0.6 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <Trash2 size={15} />
                <span>Delete Quiz</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onTogglePublish && (
              <button
                type="button"
                onClick={handleTogglePublish}
                disabled={isActionLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: quiz.is_published ? 'rgba(255, 255, 255, 0.05)' : 'rgba(34, 197, 94, 0.15)',
                  border: quiz.is_published ? '1px solid var(--border-subtle)' : '1px solid rgba(34, 197, 94, 0.3)',
                  color: quiz.is_published ? 'var(--text-secondary)' : '#4ade80',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  cursor: isActionLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  opacity: isActionLoading ? 0.6 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {quiz.is_published ? <PowerOff size={15} /> : <Power size={15} />}
                <span>{quiz.is_published ? 'Unpublish Quiz' : 'Publish Quiz'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(quiz);
              }}
              disabled={isActionLoading}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Pencil size={15} />
              <span>Edit This Quiz</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isActionLoading}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

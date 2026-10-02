import React from 'react';
import { createPortal } from 'react-dom';
import { X, Pencil } from 'lucide-react';
import type { QuizItem } from '../../../../core/services/AdminService';
import { Badge } from '../../../../components/common/Badge';

interface QuizInspectionModalProps {
  quiz: QuizItem | null;
  onClose: () => void;
  onEdit: (quiz: QuizItem) => void;
}

export const QuizInspectionModal: React.FC<QuizInspectionModalProps> = ({
  quiz,
  onClose,
  onEdit,
}) => {
  if (!quiz) return null;

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {quiz.title}
              </h3>
              <Badge variant="neutral">{quiz.status}</Badge>
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
            <strong style={{ color: '#ffffff' }}>{quiz.course_title}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Module: </span>
            <strong style={{ color: '#ffffff' }}>{quiz.module_title || 'Course-wide'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Created By: </span>
            <strong style={{ color: '#ffffff' }}>
              {quiz.created_by_detail
                ? `${quiz.created_by_detail.full_name} (${quiz.created_by_detail.role})`
                : 'System Staff'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Contact: </span>
            <strong style={{ color: '#ffffff' }}>{quiz.created_by_detail?.phone_number || 'N/A'}</strong>
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

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '14px',
          }}
        >
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(quiz);
            }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Pencil size={14} />
            <span>Edit This Quiz</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

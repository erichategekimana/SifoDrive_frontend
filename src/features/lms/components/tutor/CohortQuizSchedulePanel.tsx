import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { TutorLmsService, type CohortQuizItem } from '../../../../core/services/TutorLmsService';
import { ExtendDeadlineModal } from './ExtendDeadlineModal';
import { useToast } from '../../../../context/ToastContext';

interface CohortQuizSchedulePanelProps {
  cohortId: string;
  courseId: string;
  quizzes: CohortQuizItem[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export const CohortQuizSchedulePanel: React.FC<CohortQuizSchedulePanelProps> = ({
  cohortId,
  courseId: _courseId,
  quizzes,
  isLoading,
  onRefresh,
}) => {
  const [selectedQuizForExtension, setSelectedQuizForExtension] = useState<CohortQuizItem | null>(null);
  const [editingScheduleQuizId, setEditingScheduleQuizId] = useState<string | null>(null);
  const [openDateInput, setOpenDateInput] = useState<string>('');
  const [deadlineInput, setDeadlineInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { success, error: toastError } = useToast();

  const handleStartEditSchedule = (q: CohortQuizItem) => {
    setEditingScheduleQuizId(q.id);
    setOpenDateInput(q.open_date ? q.open_date.slice(0, 16) : '');
    setDeadlineInput(q.deadline ? q.deadline.slice(0, 16) : '');
  };

  const handleSaveSchedule = async (quizId: string) => {
    setIsSubmitting(true);
    try {
      await TutorLmsService.getInstance().scheduleCohortQuiz(cohortId, quizId, {
        open_date: openDateInput || null,
        deadline: deadlineInput || null,
      });
      success('Cohort quiz schedule updated.');
      setEditingScheduleQuizId(null);
      await onRefresh();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update quiz schedule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLock = async (q: CohortQuizItem) => {
    try {
      await TutorLmsService.getInstance().scheduleCohortQuiz(cohortId, q.id, {
        is_locked: !q.is_locked,
      });
      success(`Quiz ${!q.is_locked ? 'locked' : 'unlocked'} for cohort.`);
      await onRefresh();
    } catch (err: any) {
      toastError(err?.message || 'Failed to toggle quiz lock.');
    }
  };

  const handleTogglePublish = async (q: CohortQuizItem) => {
    try {
      await TutorLmsService.getInstance().scheduleCohortQuiz(cohortId, q.id, {
        is_published: !q.is_published,
      });
      success(`Quiz ${!q.is_published ? 'published' : 'hidden'} for cohort.`);
      await onRefresh();
    } catch (err: any) {
      toastError(err?.message || 'Failed to toggle quiz publication.');
    }
  };

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading quizzes...</div>;
  }

  if (quizzes.length === 0) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No quizzes found in this course. Quizzes are authored in the Training Admin Studio.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
              <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Quiz Title</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Scheduling Permission</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Open Date</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Deadline</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((q) => {
              const isEditing = editingScheduleQuizId === q.id;
              const hasExtension = !!q.extended_deadline;

              return (
                <tr key={q.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{q.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Pass Score: {q.pass_score}%
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    {q.allow_tutor_scheduling ? (
                      <span style={{ color: '#4ade80', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                        <CheckCircle size={14} /> Tutor Managed
                      </span>
                    ) : (
                      <span style={{ color: '#f59e0b', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                        <Lock size={14} /> Training Admin Controlled
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={openDateInput}
                        onChange={(e) => setOpenDateInput(e.target.value)}
                        style={{
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface-elevated)',
                          color: '#ffffff',
                          fontSize: '0.78rem',
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {q.open_date ? new Date(q.open_date).toLocaleString() : 'Open Immediately'}
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={deadlineInput}
                        onChange={(e) => setDeadlineInput(e.target.value)}
                        style={{
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface-elevated)',
                          color: '#ffffff',
                          fontSize: '0.78rem',
                        }}
                      />
                    ) : (
                      <div>
                        {hasExtension ? (
                          <div>
                            <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.82rem' }}>
                              {new Date(q.extended_deadline!).toLocaleString()}
                            </span>
                            <div style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: '2px' }}>
                              Extension Reason: {q.extension_reason}
                            </div>
                          </div>
                        ) : q.deadline ? (
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {new Date(q.deadline).toLocaleString()}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No Deadline</span>
                        )}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          width: 'fit-content',
                          background: q.is_published ? 'rgba(5, 135, 40, 0.12)' : 'rgba(209, 56, 56, 0.12)',
                          color: q.is_published ? '#058728' : '#d13838',
                        }}
                      >
                        {q.is_published ? 'Published' : 'Unpublished'}
                      </span>
                      {q.is_locked && (
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            width: 'fit-content',
                            background: 'rgba(245, 158, 11, 0.12)',
                            color: '#f59e0b',
                          }}
                        >
                          Locked
                        </span>
                      )}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveSchedule(q.id)}
                            disabled={isSubmitting}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.76rem', padding: '4px 8px' }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingScheduleQuizId(null)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.76rem', padding: '4px 8px' }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {q.allow_tutor_scheduling && (
                            <button
                              onClick={() => handleStartEditSchedule(q)}
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem' }}
                            >
                              <Calendar size={13} />
                              <span>Schedule</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedQuizForExtension(q)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', color: '#f59e0b' }}
                          >
                            <Clock size={13} />
                            <span>Extend</span>
                          </button>

                          <button
                            onClick={() => handleToggleLock(q)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.76rem', padding: '6px' }}
                            title={q.is_locked ? 'Unlock for cohort' : 'Lock for cohort'}
                          >
                            {q.is_locked ? <Unlock size={13} color="#38bdf8" /> : <Lock size={13} color="#f59e0b" />}
                          </button>

                          <button
                            onClick={() => handleTogglePublish(q)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.76rem', padding: '6px' }}
                            title={q.is_published ? 'Hide from cohort' : 'Publish to cohort'}
                          >
                            {q.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ExtendDeadlineModal
        isOpen={!!selectedQuizForExtension}
        cohortId={cohortId}
        quiz={selectedQuizForExtension}
        onClose={() => setSelectedQuizForExtension(null)}
        onSuccess={onRefresh}
      />
    </div>
  );
};

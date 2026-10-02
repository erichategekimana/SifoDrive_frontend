import React, { useState, useEffect } from 'react';
import { X, Award, ExternalLink, Check, User, Calendar, FileText } from 'lucide-react';
import {
  TutorLmsService,
  type CohortActivityItem,
  type StudentActivitySubmissionItem,
} from '../../../../core/services/TutorLmsService';
import { Badge } from '../../../../components/common/Badge';
import { Spinner } from '../../../../components/common/Spinner';
import { useToast } from '../../../../context/ToastContext';

interface ReviewSubmissionsModalProps {
  isOpen: boolean;
  cohortId: string;
  activity: CohortActivityItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewSubmissionsModal: React.FC<ReviewSubmissionsModalProps> = ({
  isOpen,
  cohortId,
  activity,
  onClose,
  onSuccess,
}) => {
  const [submissions, setSubmissions] = useState<StudentActivitySubmissionItem[]>([]);
  const [selectedSub, setSelectedSub] = useState<StudentActivitySubmissionItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [scoreInput, setScoreInput] = useState<string>('');
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [isGrading, setIsGrading] = useState<boolean>(false);

  const { success, error: toastError } = useToast();

  const fetchSubmissions = async () => {
    if (!activity) return;
    setIsLoading(true);
    try {
      const data = await TutorLmsService.getInstance().getActivitySubmissions(cohortId, activity.id);
      setSubmissions(data);
      if (data.length > 0) {
        setSelectedSub(data[0]);
        setScoreInput(data[0].score !== null ? String(data[0].score) : '');
        setFeedbackInput(data[0].feedback || '');
      } else {
        setSelectedSub(null);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to load activity submissions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && activity) {
      fetchSubmissions();
    }
  }, [isOpen, activity]);

  const handleSelectSubmission = (sub: StudentActivitySubmissionItem) => {
    setSelectedSub(sub);
    setScoreInput(sub.score !== null ? String(sub.score) : '');
    setFeedbackInput(sub.feedback || '');
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !activity) return;

    const numScore = parseFloat(scoreInput);
    if (isNaN(numScore) || numScore < 0 || numScore > activity.max_score) {
      toastError(`Score must be a number between 0 and ${activity.max_score}.`);
      return;
    }

    setIsGrading(true);
    try {
      const updated = await TutorLmsService.getInstance().gradeActivitySubmission(
        cohortId,
        activity.id,
        selectedSub.id,
        {
          score: numScore,
          feedback: feedbackInput.trim(),
        }
      );
      success(`Grade awarded to ${selectedSub.student_name || 'student'}.`);
      setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setSelectedSub(updated);
      onSuccess();
    } catch (err: any) {
      toastError(err?.message || 'Failed to submit grade.');
    } finally {
      setIsGrading(false);
    }
  };

  if (!isOpen || !activity) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
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
          maxWidth: '960px',
          height: '85vh',
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="#0055A5" />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                Review Submissions: {activity.title}
              </h3>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Max Points: {activity.max_score} • Passing: {activity.pass_score} • Total Submissions: {submissions.length}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', flex: 1, minHeight: 0 }}>
          {/* Left Student List */}
          <div
            style={{
              borderRight: '1px solid var(--border-subtle)',
              overflowY: 'auto',
              background: 'var(--bg-surface-elevated)',
            }}
          >
            {isLoading ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <Spinner size={24} message="Loading submissions..." />
              </div>
            ) : submissions.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                No submissions recorded yet for this activity.
              </div>
            ) : (
              submissions.map((sub) => {
                const isSelected = selectedSub?.id === sub.id;
                const isGraded = sub.status === 'GRADED';

                return (
                  <div
                    key={sub.id}
                    onClick={() => handleSelectSubmission(sub)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(0, 85, 165, 0.15)' : 'transparent',
                      borderLeft: isSelected ? '3px solid #0055A5' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.88rem' }}>
                        {sub.student_name || 'Student'}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          background: isGraded ? 'rgba(5, 135, 40, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: isGraded ? '#4ade80' : '#f59e0b',
                        }}
                      >
                        {isGraded ? `${sub.score}/${activity.max_score}` : 'Pending'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={12} />
                      {new Date(sub.submitted_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Detail & Grading Pane */}
          <div style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {!selectedSub ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                Select a student submission from the left list to review and grade.
              </div>
            ) : (
              <>
                {/* Student Info Card */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(0, 85, 165, 0.2)',
                        color: '#38bdf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <User size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                        {selectedSub.student_name || 'Enrolled Student'}
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {selectedSub.student_phone || 'Learner in cohort'}
                      </p>
                    </div>
                  </div>

                  <Badge variant={selectedSub.status === 'GRADED' ? 'success' : 'warning'}>
                    {selectedSub.status}
                  </Badge>
                </div>

                {/* Submitted Content Display */}
                <div>
                  <h5 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Student Response / Drill Evidence
                  </h5>

                  {selectedSub.text_content && (
                    <div
                      style={{
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.88rem',
                        lineHeight: 1.6,
                        color: '#ffffff',
                        whiteSpace: 'pre-wrap',
                        marginBottom: '12px',
                      }}
                    >
                      {selectedSub.text_content}
                    </div>
                  )}

                  {selectedSub.attachment_file ? (
                    <div style={{ marginTop: '8px' }}>
                      <a
                        href={selectedSub.attachment_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}
                      >
                        <FileText size={16} />
                        <span>View Attached File / Photo Evidence</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  ) : !selectedSub.text_content ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                      No written response or attachment uploaded. Practical observation recorded in vehicle.
                    </div>
                  ) : null}
                </div>

                {/* Grading Form */}
                <form
                  onSubmit={handleSaveGrade}
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    marginTop: 'auto',
                  }}
                >
                  <h5 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                    Instructor Evaluation & Grade
                  </h5>

                  <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Awarded Score (Max {activity.max_score})
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min={0}
                        max={activity.max_score}
                        value={scoreInput}
                        onChange={(e) => setScoreInput(e.target.value)}
                        required
                        placeholder={`0 - ${activity.max_score}`}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          color: '#ffffff',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Instructor Feedback & Corrections
                      </label>
                      <textarea
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        placeholder="Provide actionable driving tips, commendations, or areas to improve..."
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          color: '#ffffff',
                          fontSize: '0.85rem',
                          resize: 'vertical',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <button
                      type="submit"
                      disabled={isGrading}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {isGrading ? <Spinner size={16} /> : <Check size={16} />}
                      <span>Save & Award Grade</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

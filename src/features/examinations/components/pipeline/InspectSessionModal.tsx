import React, { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import {


  AdminService,
  type ExamSessionDetailItem,
} from '../../../../core/services/AdminService';
import { Badge } from '../../../../components/common/Badge';
import { Spinner } from '../../../../components/common/Spinner';
import { useToast } from '../../../../context/ToastContext';
import { getExamStatusBadge } from '../../utils/examBadges';

interface InspectSessionModalProps {
  isOpen: boolean;
  sessionId: string | null;
  onClose: () => void;
  onActionCompleted: () => void;
  isBoardReviewer: boolean;
  isTrainingAdmin: boolean;
  isSystemAdmin: boolean;
}

export const InspectSessionModal: React.FC<InspectSessionModalProps> = ({
  isOpen,
  sessionId,
  onClose,
  onActionCompleted,
  isBoardReviewer,
  isTrainingAdmin,
  isSystemAdmin,
}) => {
  const { showToast } = useToast();
  const adminService = AdminService.getInstance();

  const [inspectDetail, setInspectDetail] = useState<ExamSessionDetailItem | null>(null);
  const [isInspectLoading, setIsInspectLoading] = useState<boolean>(false);
  const [actionNotes, setActionNotes] = useState<string>('');
  const [isExecutingAction, setIsExecutingAction] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && sessionId) {
      setIsInspectLoading(true);
      setActionNotes('');
      adminService
        .getExamSessionDetail(sessionId)
        .then((data) => setInspectDetail(data))
        .catch((err) => {
          showToast(err?.message || 'Failed to load session details', 'error');
        })
        .finally(() => setIsInspectLoading(false));
    } else {
      setInspectDetail(null);
    }
  }, [isOpen, sessionId]);

  if (!isOpen || !sessionId) return null;

  const handleStageAction = async (
    action: 'BOARD_DECISION' | 'TRAINING_DECISION' | 'SYSTEM_APPROVE' | 'REJECT' | string,
    decision: 'APPROVE' | 'REJECT' = 'APPROVE'
  ) => {
    if (!inspectDetail) return;

    if (decision === 'APPROVE' && (action === 'BOARD_DECISION' || action === 'TRAINING_DECISION')) {
      if (!actionNotes.trim()) {
        showToast('A review comment is required before approving.', 'error');
        return;
      }
    }

    try {
      setIsExecutingAction(true);
      const res = await adminService.executeExamStageAction(inspectDetail.id, action, decision, actionNotes.trim());
      showToast(res.message || 'Action executed.', 'success');
      const updated = await adminService.getExamSessionDetail(inspectDetail.id);
      setInspectDetail(updated);
      setActionNotes('');
      onActionCompleted();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Action failed.';
      showToast(errorMsg, 'error');
    } finally {
      setIsExecutingAction(false);
    }
  };

  const handleSinglePublish = async () => {
    if (!inspectDetail) return;
    try {
      await adminService.publishExams({ publish_type: 'SINGLE', session_id: inspectDetail.id });
      showToast('Exam published to candidate portal.', 'success');
      const updated = await adminService.getExamSessionDetail(inspectDetail.id);
      setInspectDetail(updated);
      onActionCompleted();
    } catch (err: any) {
      showToast('Publish failed: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '22px 24px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)',
        }}
      >
        {isInspectLoading || !inspectDetail ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <Spinner size={28} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    {inspectDetail.student_name}
                  </h2>
                  {getExamStatusBadge(inspectDetail.status)}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {inspectDetail.student_phone} &bull; {inspectDetail.track_type === 'GUEST' ? 'Guest' : 'Student'} &bull; {inspectDetail.cohort_name || 'Individual'}
                </div>
              </div>

              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 3-Stage Governance Trail */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
              }}
            >
              {/* Stage 1: Board Review */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    1. Board Review
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {inspectDetail.board_decision === 'APPROVE'
                      ? 'Approved'
                      : inspectDetail.board_decision === 'REJECT'
                      ? 'Rejected'
                      : inspectDetail.status === 'BOARD_REVIEW' || inspectDetail.status === 'SUBMITTED'
                      ? 'Active'
                      : 'Pending'}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                  {inspectDetail.board_reviewer?.full_name || 'Board Reviewer'}
                </div>

                {inspectDetail.board_reviewed_at && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {new Date(inspectDetail.board_reviewed_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}

                {inspectDetail.board_notes && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    "{inspectDetail.board_notes}"
                  </div>
                )}
              </div>

              {/* Stage 2: Training Admin Audit */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    2. Training Audit
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {inspectDetail.training_decision === 'APPROVE'
                      ? 'Approved'
                      : inspectDetail.training_decision === 'REJECT'
                      ? 'Rejected'
                      : inspectDetail.status === 'TRAINING_REVIEW'
                      ? 'Active'
                      : 'Pending'}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                  {inspectDetail.training_admin?.full_name || 'Training Admin'}
                </div>

                {inspectDetail.training_reviewed_at && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {new Date(inspectDetail.training_reviewed_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}

                {inspectDetail.training_notes && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    "{inspectDetail.training_notes}"
                  </div>
                )}
              </div>

              {/* Stage 3: System Admin Approval */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    3. System Approval
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {inspectDetail.status === 'APPROVED' || inspectDetail.status === 'PUBLISHED'
                      ? 'Certified'
                      : inspectDetail.status === 'SYSTEM_REVIEW'
                      ? 'Active'
                      : 'Pending'}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                  {inspectDetail.approved_by?.full_name || 'System Admin'}
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {inspectDetail.certificate_number
                    ? `Cert: ${inspectDetail.certificate_number}`
                    : 'Certificate pending'}
                </div>
              </div>
            </div>

            {/* Proctoring & Identity Audit Evidence Section */}
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#0055A5" />
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Proctoring & Identity Audit Dossier
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      background: (inspectDetail.violation_count || 0) > 0 ? 'rgba(209, 56, 56, 0.15)' : 'rgba(5, 135, 40, 0.15)',
                      color: (inspectDetail.violation_count || 0) > 0 ? '#d13838' : '#058728',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    {inspectDetail.violation_count || 0} {(inspectDetail.violation_count || 0) === 1 ? 'Violation Flag' : 'Violations Flagged'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Auto-Graded (Score Locked)
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: (inspectDetail as any).identity_image ? '130px 1fr' : '1fr', gap: '14px', alignItems: 'center' }}>
                {(inspectDetail as any).identity_image && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div
                      style={{
                        width: '130px',
                        height: '98px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-subtle)',
                        background: '#000',
                      }}
                    >
                      <img
                        src={(inspectDetail as any).identity_image}
                        alt="Candidate Identity"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      Pre-flight Selfie
                    </span>
                  </div>
                )}

                {/* Telemetry stream logs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(() => {
                    const events = (inspectDetail as any).proctoring_events || [];
                    if (events.length === 0) {
                      return (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          No proctoring violations recorded. Clean session telemetry.
                        </div>
                      );
                    }
                    return (
                      <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {events.map((evt: any, eIdx: number) => (
                          <div
                            key={evt.id || eIdx}
                            style={{
                              background: evt.is_violation ? 'rgba(209, 56, 56, 0.08)' : 'rgba(0, 85, 165, 0.05)',
                              borderLeft: evt.is_violation ? '3px solid #d13838' : '3px solid #0055A5',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.74rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                              {evt.event_type} {evt.is_violation ? '(Violation Flag)' : ''}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                              {evt.created_at ? new Date(evt.created_at).toLocaleTimeString() : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Questions Table */}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Responses ({inspectDetail.score}/{inspectDetail.total_questions} &bull; {inspectDetail.passed ? 'Pass' : 'Fail'})
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Submitted: {inspectDetail.submitted_at ? new Date(inspectDetail.submitted_at).toLocaleTimeString() : '—'}
                </span>
              </div>

              <div
                style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-surface-elevated)',
                }}
              >
                {(() => {
                  const questionsList = (inspectDetail as any).session_questions || inspectDetail.questions || [];
                  return questionsList.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                          <th style={{ padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>#</th>
                          <th style={{ padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Question</th>
                          <th style={{ padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Selected</th>
                          <th style={{ padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Key</th>
                          <th style={{ padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questionsList.map((q: any) => (
                          <tr key={q.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{q.sequence_number}</td>
                            <td style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>{q.question_text}</td>
                            <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{q.selected_option || '—'}</td>
                            <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{q.correct_option}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 500 }}>
                              {q.is_correct ? 'Correct' : 'Incorrect'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      No question breakdown available.
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Role Action Section */}
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {/* STAGE 1: BOARD REVIEW */}
              {(inspectDetail.status === 'SUBMITTED' || inspectDetail.status === 'BOARD_REVIEW') && (
                <>
                  {isBoardReviewer ? (
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Stage 1: Board Review Decision
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        Add a comment to approve. Once approved, authority transfers permanently to Training Admin.
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Add review comment (required)..."
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          fontSize: '0.8rem',
                          outline: 'none',
                          marginBottom: '10px',
                          resize: 'none',
                        }}
                      />

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => handleStageAction('BOARD_DECISION', 'REJECT')}
                          disabled={isExecutingAction}
                          className="btn btn-secondary btn-sm"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleStageAction('BOARD_DECISION', 'APPROVE')}
                          disabled={isExecutingAction || !actionNotes.trim()}
                          className="btn btn-primary btn-sm"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Read-only: </strong>
                      Under review by Board Reviewer (Stage 1).
                    </div>
                  )}
                </>
              )}

              {/* STAGE 2: TRAINING ADMIN AUDIT */}
              {inspectDetail.status === 'TRAINING_REVIEW' && (
                <>
                  {isTrainingAdmin ? (
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Stage 2: Training Admin Audit
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        Add an audit comment to approve. Once approved, authority transfers permanently to System Admin.
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Add audit comment (required)..."
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          fontSize: '0.8rem',
                          outline: 'none',
                          marginBottom: '10px',
                          resize: 'none',
                        }}
                      />

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => handleStageAction('TRAINING_DECISION', 'REJECT')}
                          disabled={isExecutingAction}
                          className="btn btn-secondary btn-sm"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleStageAction('TRAINING_DECISION', 'APPROVE')}
                          disabled={isExecutingAction || !actionNotes.trim()}
                          className="btn btn-primary btn-sm"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ) : isBoardReviewer ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Locked: </strong>
                      Stage 1 approved. Now under audit by Training Admin.
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Read-only: </strong>
                      Under audit by Training Admin (Stage 2).
                    </div>
                  )}
                </>
              )}

              {/* STAGE 3: SYSTEM ADMIN APPROVAL */}
              {inspectDetail.status === 'SYSTEM_REVIEW' && (
                <>
                  {isSystemAdmin ? (
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Stage 3: System Admin Approval
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        Approve to generate certificate or publish result.
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Add approval comment (optional)..."
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          fontSize: '0.8rem',
                          outline: 'none',
                          marginBottom: '10px',
                          resize: 'none',
                        }}
                      />

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => handleStageAction('REJECT', 'REJECT')}
                          disabled={isExecutingAction}
                          className="btn btn-secondary btn-sm"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleStageAction('SYSTEM_APPROVE', 'APPROVE')}
                          disabled={isExecutingAction}
                          className="btn btn-primary btn-sm"
                        >
                          Approve & Generate Certificate
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Locked: </strong>
                      Stages 1 & 2 approved. Now under System Admin review (Stage 3).
                    </div>
                  )}
                </>
              )}

              {/* STAGE 4: APPROVED */}
              {inspectDetail.status === 'APPROVED' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Certificate: {inspectDetail.certificate_number || inspectDetail.certificate?.certificate_number || 'Issued'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {inspectDetail.is_published
                        ? 'Published to candidate portal.'
                        : isSystemAdmin
                        ? 'Ready to publish.'
                        : 'Awaiting System Admin publication.'}
                    </div>
                  </div>

                  {isSystemAdmin && !inspectDetail.is_published && (
                    <button
                      onClick={handleSinglePublish}
                      className="btn btn-primary btn-sm"
                    >
                      Publish
                    </button>
                  )}
                </div>
              )}

              {/* STAGE 5: PUBLISHED */}
              {inspectDetail.status === 'PUBLISHED' && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Published: </strong>
                  Result and certificate released to candidate portal.
                </div>
              )}

              {/* REJECTED */}
              {inspectDetail.status === 'REJECTED' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Badge variant="danger">Rejected</Badge>
                  <span>
                    {inspectDetail.approval_notes || inspectDetail.training_notes || inspectDetail.board_notes || 'Session rejected.'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


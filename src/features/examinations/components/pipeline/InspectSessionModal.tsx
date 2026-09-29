import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
      showToast(res.message || 'Action executed successfully.', 'success');
      const updated = await adminService.getExamSessionDetail(inspectDetail.id);
      setInspectDetail(updated);
      setActionNotes('');
      onActionCompleted();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Action failed: Governance rules prevent this transition.';
      showToast(errorMsg, 'error');
    } finally {
      setIsExecutingAction(false);
    }
  };

  const handleSinglePublish = async () => {
    if (!inspectDetail) return;
    try {
      await adminService.publishExams({ publish_type: 'SINGLE', session_id: inspectDetail.id });
      showToast('Exam published successfully to candidate portal.', 'success');
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
        background: 'rgba(0, 0, 0, 0.75)',
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
          maxWidth: '850px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '20px 24px',
          borderRadius: '8px',
          background: '#0f172a',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)',
        }}
      >
        {isInspectLoading || !inspectDetail ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Spinner size={32} />
            <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Loading examination details...
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                    Candidate: {inspectDetail.student_name}
                  </h2>
                  <span
                    style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      background: 'rgba(255,255,255,0.06)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {inspectDetail.track_type === 'GUEST' ? 'Guest' : 'Student'}
                  </span>
                  {getExamStatusBadge(inspectDetail.status)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Phone: {inspectDetail.student_phone} &bull; Cohort: {inspectDetail.cohort_name || 'Individual'} &bull; Track: {inspectDetail.track}
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

            {/* Review Trail */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
              }}
            >
              {/* Gate 1: Board Review */}
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'rgba(0, 0, 0, 0.25)',
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
                  {inspectDetail.board_decision === 'APPROVE' ? (
                    <Badge variant="success">Approved</Badge>
                  ) : inspectDetail.board_decision === 'REJECT' ? (
                    <Badge variant="danger">Rejected</Badge>
                  ) : inspectDetail.status === 'BOARD_REVIEW' || inspectDetail.status === 'SUBMITTED' ? (
                    <Badge variant="warning">In Review</Badge>
                  ) : (
                    <Badge variant="neutral">Pending</Badge>
                  )}
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px' }}>
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
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '2px', background: 'rgba(255,255,255,0.02)', padding: '4px 6px', borderRadius: '4px' }}>
                    "{inspectDetail.board_notes}"
                  </div>
                )}

                {inspectDetail.board_decision === 'APPROVE' && (
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
                    Finalized (Locked)
                  </div>
                )}
              </div>

              {/* Gate 2: Training Admin Audit */}
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'rgba(0, 0, 0, 0.25)',
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
                  {inspectDetail.training_decision === 'APPROVE' ? (
                    <Badge variant="success">Approved</Badge>
                  ) : inspectDetail.training_decision === 'REJECT' ? (
                    <Badge variant="danger">Rejected</Badge>
                  ) : inspectDetail.status === 'TRAINING_REVIEW' ? (
                    <Badge variant="warning">In Audit</Badge>
                  ) : (
                    <Badge variant="neutral">Pending</Badge>
                  )}
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px' }}>
                  {inspectDetail.training_admin?.full_name || 'Training Administrator'}
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
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '2px', background: 'rgba(255,255,255,0.02)', padding: '4px 6px', borderRadius: '4px' }}>
                    "{inspectDetail.training_notes}"
                  </div>
                )}

                {inspectDetail.training_decision === 'APPROVE' && (
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
                    Finalized (Locked)
                  </div>
                )}
              </div>

              {/* Gate 3: System Admin Certification */}
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'rgba(0, 0, 0, 0.25)',
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
                  {inspectDetail.status === 'APPROVED' || inspectDetail.status === 'PUBLISHED' ? (
                    <Badge variant="success">Certified</Badge>
                  ) : inspectDetail.status === 'SYSTEM_REVIEW' ? (
                    <Badge variant="warning">Pending Approval</Badge>
                  ) : (
                    <Badge variant="neutral">Pending</Badge>
                  )}
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px' }}>
                  {inspectDetail.approved_by?.full_name || 'System Administrator'}
                </div>

                {inspectDetail.certificate_number ? (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    Cert: {inspectDetail.certificate_number}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Certificate: Awaiting approval
                  </div>
                )}

                {inspectDetail.is_published && (
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
                    Published to Portal
                  </div>
                )}
              </div>
            </div>

            {/* Questions Evaluation */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                  Questions ({inspectDetail.score}/{inspectDetail.total_questions} Correct &bull; {inspectDetail.passed ? 'Pass' : 'Fail'})
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Submitted: {inspectDetail.submitted_at ? new Date(inspectDetail.submitted_at).toLocaleTimeString() : '—'}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '6px',
                  background: 'rgba(0,0,0,0.2)',
                }}
              >
                {inspectDetail.questions && inspectDetail.questions.length > 0 ? (
                  inspectDetail.questions.map((q) => (
                    <div
                      key={q.id}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        fontSize: '0.78rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)', flex: 1, paddingRight: '8px' }}>
                          {q.sequence_number}. {q.question_text}
                        </span>
                        <Badge variant={q.is_correct ? 'success' : 'danger'}>
                          {q.is_correct ? 'Correct' : 'Incorrect'}
                        </Badge>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span>Candidate: <strong style={{ color: 'var(--text-primary)' }}>{q.selected_option || 'None'}</strong></span>
                        <span>Correct Key: <strong style={{ color: 'var(--text-primary)' }}>{q.correct_option}</strong></span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                    No question breakdown logged.
                  </div>
                )}
              </div>
            </div>

            {/* Action / Governance Section */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '6px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {/* STAGE 1: BOARD REVIEW */}
              {(inspectDetail.status === 'SUBMITTED' || inspectDetail.status === 'BOARD_REVIEW') && (
                <>
                  {isBoardReviewer ? (
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Stage 1 Action: Board Review Decision
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        Evaluation remarks are required. Approving permanently transfers review authority to Training Admin.
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Enter evaluation remarks (required for approval)..."
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: 'rgba(0,0,0,0.3)',
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
                          style={{ color: '#ef4444' }}
                        >
                          Reject Exam
                        </button>
                        <button
                          onClick={() => handleStageAction('BOARD_DECISION', 'APPROVE')}
                          disabled={isExecutingAction || !actionNotes.trim()}
                          className="btn btn-primary btn-sm"
                        >
                          Approve Stage 1
                        </button>
                      </div>
                    </div>
                  ) : isTrainingAdmin ? (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Stage 1 in progress: </strong>
                      Board Reviewer is currently evaluating this exam. Training Admin audit access unlocks upon Stage 1 approval. Read-only access.
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Stage 1 in progress: </strong>
                      Under review by Board Reviewer. System Admin access unlocks at Stage 3. Read-only access.
                    </div>
                  )}
                </>
              )}

              {/* STAGE 2: TRAINING ADMIN AUDIT */}
              {inspectDetail.status === 'TRAINING_REVIEW' && (
                <>
                  {isTrainingAdmin ? (
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Stage 2 Action: Training Admin Audit Decision
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        Audit remarks are required. Approving permanently transfers review authority to System Admin.
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Enter pedagogical audit remarks (required for approval)..."
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: 'rgba(0,0,0,0.3)',
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
                          style={{ color: '#ef4444' }}
                        >
                          Reject Exam
                        </button>
                        <button
                          onClick={() => handleStageAction('TRAINING_DECISION', 'APPROVE')}
                          disabled={isExecutingAction || !actionNotes.trim()}
                          className="btn btn-primary btn-sm"
                        >
                          Approve Stage 2
                        </button>
                      </div>
                    </div>
                  ) : isBoardReviewer ? (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Stage 1 finalized: </strong>
                      Board review completed. Currently undergoing Training Admin pedagogical audit. Read-only access.
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Stage 2 in progress: </strong>
                      Under audit by Training Administrator. System Admin access unlocks at Stage 3. Read-only access.
                    </div>
                  )}
                </>
              )}

              {/* STAGE 3: SYSTEM ADMIN APPROVAL */}
              {inspectDetail.status === 'SYSTEM_REVIEW' && (
                <>
                  {isSystemAdmin ? (
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Stage 3 Action: System Administrator Approval
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        Approving will issue an official verification Certificate and finalize the exam evaluation.
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Enter approval remarks (optional)..."
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: 'rgba(0,0,0,0.3)',
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
                          style={{ color: '#ef4444' }}
                        >
                          Reject Exam
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
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Stage 3 in progress: </strong>
                      Stages 1 & 2 approved. Currently awaiting final System Admin approval and certificate generation. Read-only access.
                    </div>
                  )}
                </>
              )}

              {/* STAGE 4: APPROVED */}
              {inspectDetail.status === 'APPROVED' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Certificate Generated: {inspectDetail.certificate_number || inspectDetail.certificate?.certificate_number || 'Issued'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {inspectDetail.is_published
                        ? 'Exam published to candidate portal.'
                        : isSystemAdmin
                        ? 'Ready for release to the learner portal.'
                        : 'Awaiting publication by System Administrator.'}
                    </div>
                  </div>

                  {isSystemAdmin && !inspectDetail.is_published && (
                    <button
                      onClick={handleSinglePublish}
                      className="btn btn-primary btn-sm"
                    >
                      Publish Result
                    </button>
                  )}
                </div>
              )}

              {/* STAGE 5: PUBLISHED */}
              {inspectDetail.status === 'PUBLISHED' && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Status: </strong>
                  Exam results and official certificate have been published to the candidate portal.
                </div>
              )}

              {/* REJECTED */}
              {inspectDetail.status === 'REJECTED' && (
                <div style={{ fontSize: '0.78rem', color: '#ef4444' }}>
                  <strong>Status: Rejected. </strong>
                  {inspectDetail.approval_notes || inspectDetail.training_notes || inspectDetail.board_notes || 'This examination session has been rejected.'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

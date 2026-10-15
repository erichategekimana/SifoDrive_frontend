import React, { useState } from 'react';
import {
  Clock,
  Award,
  X,
  Check,
  AlertTriangle,
  CheckCircle,
  Flag,
  FileText,
  ExternalLink,
  Download,
  Loader2,
} from 'lucide-react';
import type { CourseAssignmentItem } from '../../types/courseWorkspace.types';
import { PdfViewer } from '../../../common/PdfViewer';

export interface TutorStudentGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment?: CourseAssignmentItem | null;
  student: {
    studentId: string;
    name: string;
    studentRollNo: string;
    category: string;
    score: string;
    feedback: string;
    completed: boolean;
    submissionId?: string | null;
    rawSubmission?: any | null;
  } | null;
  maxPoints: number;
  currentTutorName?: string;
  onSaveGrade: (studentId: string, score: string, feedback: string, submissionId?: string | null) => void;
}

export const TutorStudentGradingModal: React.FC<TutorStudentGradingModalProps> = ({
  isOpen,
  onClose,
  assignment,
  student,
  maxPoints,
  currentTutorName: _currentTutorName,
  onSaveGrade,
}) => {
  if (!isOpen || !student) return null;

  const currentPointsValue = student.score
    ? student.score.split('/')[0].trim()
    : '';

  const [pointsInput, setPointsInput] = useState(currentPointsValue);
  const [feedbackInput, setFeedbackInput] = useState(student.feedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProctoringViolationsLog, setShowProctoringViolationsLog] = useState(false);

  const rawSub = student.rawSubmission;
  const breakdown: any[] = rawSub?.question_breakdown || [];
  const isCohortActivity = Boolean(
    assignment?.isCohortActivity ||
    (assignment as any)?.activityRaw ||
    rawSub?.activity ||
    rawSub?.submission_method
  );
  const workText: string | undefined =
    rawSub?.submission_text ||
    rawSub?.text_content ||
    rawSub?.work_submission_text;
  const workFileUrl: string | undefined =
    rawSub?.attachment_file ||
    rawSub?.attachment_url ||
    rawSub?.attachment ||
    rawSub?.work_submission_file_url ||
    rawSub?.work_submission_file ||
    rawSub?.file;
  const workLink: string | undefined =
    rawSub?.submission_link ||
    rawSub?.link;
  const tabSwitches: number = rawSub?.tab_switch_count || 0;
  const isFlagged: boolean = Boolean(rawSub?.is_flagged);
  const flagReason: string | undefined = rawSub?.flag_reason;
  const timeSpentSecs: number | undefined = rawSub?.time_spent_seconds;
  const violations: any[] = Array.isArray(rawSub?.proctoring_violations) ? rawSub.proctoring_violations : [];

  // Quiz / Activity Type Detection
  const quizType: 'LIVE_TIMED' | 'WORK_SUBMISSION' =
    isCohortActivity
      ? 'WORK_SUBMISSION'
      : rawSub?.quiz_type ||
        assignment?.quizRaw?.quiz_type ||
        (workText || workFileUrl || workLink ? 'WORK_SUBMISSION' : 'LIVE_TIMED');

  const isLiveTimed = !isCohortActivity && (quizType === 'LIVE_TIMED' || (breakdown.length > 0 && !workText && !workFileUrl && !workLink));
  const isWorkSubmission = isCohortActivity || quizType === 'WORK_SUBMISSION' || Boolean(workText || workFileUrl || workLink);

  // Questions Flagged for Review
  const flaggedReviewItems = breakdown.filter(
    (q: any) =>
      q.is_flagged_for_review ||
      (rawSub?.flagged_questions &&
        (rawSub.flagged_questions.includes(q.item_id) ||
          rawSub.flagged_questions.includes(q.order) ||
          rawSub.flagged_questions.includes(String(q.order))))
  );
  const flaggedReviewCount = flaggedReviewItems.length || (rawSub?.flagged_questions?.length || 0);

  const passingScore = assignment?.quizRaw?.passing_score ?? 70;
  const maxTabSwitchesAllowed = assignment?.quizRaw?.max_tab_switches_allowed ?? 3;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveGrade(student.studentId, pointsInput, feedbackInput, student.submissionId);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!student.completed) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}
        onClick={onClose}
      >
        <div
          className="canvas-card"
          style={{
            width: '100%',
            maxWidth: '560px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.25)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Clock size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Pending Submission
                  </h3>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#FEF3C7',
                      color: '#B45309',
                    }}
                  >
                    Pending
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                  Assessment: <strong style={{ color: '#1E293B' }}>{assignment?.title || rawSub?.quiz_title || 'Quiz'}</strong> • Student:{' '}
                  <strong style={{ color: '#1E293B' }}>{student.name}</strong> ({student.studentRollNo})
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748B',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="canvas-card"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: isLiveTimed ? '#EFF6FF' : '#F5F3FF',
                color: isLiveTimed ? '#0055A5' : '#7C3AED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {isLiveTimed ? 'Review Submission' : 'Grade Work Submission'}
                </h3>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: isLiveTimed ? '#DBEAFE' : '#EDE9FE',
                    color: isLiveTimed ? '#1E40AF' : '#6D28D9',
                  }}
                >
                  {isLiveTimed ? 'Live Timed' : 'Work Submission'}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                Assessment: <strong style={{ color: '#1E293B' }}>{assignment?.title || rawSub?.quiz_title || 'Quiz'}</strong> • Student:{' '}
                <strong style={{ color: '#1E293B' }}>{student.name}</strong> ({student.studentRollNo})
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div
          style={{
            padding: '22px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {/* Student Status Summary Banner */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.95rem' }}>
                {student.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                {student.category} • Roll ID: <span style={{ fontFamily: 'monospace' }}>{student.studentRollNo}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#15803D',
                  backgroundColor: '#DCFCE7',
                  border: '1px solid #BBF7D0',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Check size={13} />
                <span>Submitted</span>
              </span>
              {rawSub?.score !== null && rawSub?.score !== undefined && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#0055A5',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    padding: '4px 10px',
                    borderRadius: '999px',
                  }}
                >
                  Recorded Grade: {rawSub.score} / {rawSub.total_score || maxPoints} pts
                </span>
              )}
            </div>
          </div>

          {/* Grade Override Audit Alert Banner */}
          {Boolean(rawSub?.is_grade_overridden) && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#FEF3C7',
                border: '1px solid #FDE68A',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <AlertTriangle size={18} color="#B45309" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#92400E' }}>
                  Auto-Grade Overridden by {rawSub?.grade_overridden_by_name || 'Tutor'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#B45309', marginTop: '2px' }}>
                  Original system auto-grade: <strong>{rawSub?.auto_score ?? 'auto'} pts</strong>. Overridden to <strong>{rawSub?.score ?? pointsInput} pts</strong>
                  {rawSub?.grade_overridden_at ? ` on ${new Date(rawSub.grade_overridden_at).toLocaleString()}` : ''}.
                </div>
              </div>
            </div>
          )}

          {/* LIVE TIMED QUIZ SPECIFIC SECTION */}
          {isLiveTimed && (
            <>
              {/* Proctoring & Integrity Telemetry Card */}
              <div
                style={{
                  backgroundColor: isFlagged ? '#FEF2F2' : tabSwitches > 0 ? '#FFFBEB' : '#F8FAFC',
                  borderRadius: '8px',
                  border: `1px solid ${isFlagged ? '#FECACA' : tabSwitches > 0 ? '#FDE68A' : '#E2E8F0'}`,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isFlagged ? (
                      <AlertTriangle size={18} color="#DC2626" />
                    ) : tabSwitches > 0 ? (
                      <AlertTriangle size={18} color="#D97706" />
                    ) : (
                      <CheckCircle size={18} color="#16A34A" />
                    )}
                    <div>
                      <div
                        style={{
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          color: isFlagged ? '#991B1B' : tabSwitches > 0 ? '#92400E' : '#15803D',
                        }}
                      >
                        {isFlagged
                          ? `Proctoring Flagged: ${flagReason || 'Excessive tab switches detected'}`
                          : tabSwitches > 0
                          ? `Proctoring Alert: ${tabSwitches} tab switch(es) recorded`
                          : 'Proctoring Verified Clean'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        Tab Switches: <strong>{tabSwitches}</strong> / Max allowed: <strong>{maxTabSwitchesAllowed}</strong>
                        {timeSpentSecs !== undefined && timeSpentSecs > 0 && (
                          <span> • Session Duration: <strong>{Math.floor(timeSpentSecs / 60)}m {timeSpentSecs % 60}s</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {violations.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowProctoringViolationsLog((prev) => !prev)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#475569',
                      }}
                    >
                      {showProctoringViolationsLog ? 'Hide Violations Log' : `View Log (${violations.length})`}
                    </button>
                  )}
                </div>

                {showProctoringViolationsLog && violations.length > 0 && (
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '10px 12px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      fontSize: '0.76rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                      Chronological Tab Blur Telemetry:
                    </div>
                    {violations.map((v: any, idx: number) => (
                      <div key={idx} style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontFamily: 'monospace', color: '#0F172A' }}>
                          {v.timestamp ? new Date(v.timestamp).toLocaleTimeString() : `#${idx + 1}`}
                        </span>
                        <span>•</span>
                        <span>{v.reason || v.event || 'Window unfocused / tab changed'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Auto-Grade Decisions Summary Card */}
              {rawSub?.score !== null && rawSub?.score !== undefined && (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={17} color="#0055A5" />
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
                        System Auto-Grade Decision
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '4px',
                        backgroundColor: rawSub.is_passed ? '#DCFCE7' : '#FEE2E2',
                        color: rawSub.is_passed ? '#15803D' : '#DC2626',
                        border: `1px solid ${rawSub.is_passed ? '#86EFAC' : '#FCA5A5'}`,
                      }}
                    >
                      {rawSub.is_passed ? 'PASSED' : 'DID NOT PASS'}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '10px',
                      backgroundColor: '#F8FAFC',
                      padding: '10px 14px',
                      borderRadius: '6px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Auto-Graded Score</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                        {rawSub.score} / {rawSub.total_score || maxPoints} pts
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Percentage</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0055A5' }}>
                        {rawSub.percentage !== undefined ? `${rawSub.percentage}%` : `${Math.round(((rawSub.score || 0) / (rawSub.total_score || maxPoints || 1)) * 100)}%`}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Passing Benchmark</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#475569' }}>
                        {passingScore}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Accuracy</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#16A34A' }}>
                        {breakdown.filter((q: any) => q.is_correct).length} / {breakdown.length} Correct
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Questions Flagged for Review Banner */}
              {flaggedReviewCount > 0 && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <Flag size={18} color="#D97706" />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#92400E' }}>
                      {flaggedReviewCount} Question(s) Flagged for Review by Student
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#B45309' }}>
                      The student marked questions for secondary review during their session:{' '}
                      <strong>Q{flaggedReviewItems.map((q: any, i: number) => q.order || i + 1).join(', Q')}</strong>.
                      Review their choices and award adjusted manual points below if warranted.
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Questions & Student Answers */}
              {breakdown.length > 0 && (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <FileText size={16} color="#0055A5" />
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                        Questions & Student Answers
                      </h4>
                    </div>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0055A5' }}>
                      {breakdown.length} Total Questions
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {breakdown.map((q: any, idx: number) => {
                      const isCorrect = Boolean(q.is_correct);
                      const isFlaggedForReview = Boolean(
                        q.is_flagged_for_review ||
                          (rawSub?.flagged_questions &&
                            (rawSub.flagged_questions.includes(q.item_id) ||
                              rawSub.flagged_questions.includes(q.order) ||
                              rawSub.flagged_questions.includes(String(q.order))))
                      );
                      const opts = q.options && typeof q.options === 'object' ? q.options : {};
                      const optKeys = Object.keys(opts);

                      return (
                        <div
                          key={q.item_id || idx}
                          style={{
                            padding: '14px 16px',
                            backgroundColor: '#F8FAFC',
                            borderRadius: '8px',
                            border: `1px solid ${isFlaggedForReview ? '#F59E0B' : isCorrect ? '#E2E8F0' : '#FECACA'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1E293B', flex: 1 }}>
                              <span style={{ color: '#64748B', marginRight: '6px' }}>Q{q.order || idx + 1}.</span>
                              {q.question_text}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                              {isFlaggedForReview && (
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    color: '#B45309',
                                    backgroundColor: '#FEF3C7',
                                    border: '1px solid #FDE68A',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                  }}
                                  title="Student flagged this question for review during attempt"
                                >
                                  <Flag size={11} />
                                  <span>Flagged for Review</span>
                                </span>
                              )}
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  color: isCorrect ? '#15803D' : '#DC2626',
                                  backgroundColor: isCorrect ? '#DCFCE7' : '#FEE2E2',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                {isCorrect ? <Check size={11} /> : <X size={11} />}
                                <span>{isCorrect ? `${q.points} / ${q.points} pts` : `0 / ${q.points} pts`}</span>
                              </span>
                            </div>
                          </div>

                          {/* Multiple choice options */}
                          {optKeys.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '4px' }}>
                              {optKeys.map((k) => {
                                const isStudentChoice = String(q.student_answer).trim().toUpperCase() === k.toUpperCase();
                                const isCorrectChoice = String(q.correct_option || q.correct_answer).trim().toUpperCase() === k.toUpperCase();

                                let rowBg = '#FFFFFF';
                                let rowBorder = '#E2E8F0';
                                let badgeText: string | null = null;
                                let badgeColor = '#64748B';

                                if (isStudentChoice && isCorrectChoice) {
                                  rowBg = '#F0FDF4';
                                  rowBorder = '#86EFAC';
                                  badgeText = 'Student Selected (Correct)';
                                  badgeColor = '#15803D';
                                } else if (isStudentChoice && !isCorrectChoice) {
                                  rowBg = '#FEF2F2';
                                  rowBorder = '#FCA5A5';
                                  badgeText = 'Student Selected (Incorrect)';
                                  badgeColor = '#DC2626';
                                } else if (isCorrectChoice) {
                                  rowBg = '#F0FDF4';
                                  rowBorder = '#BBF7D0';
                                  badgeText = 'Correct Answer';
                                  badgeColor = '#16A34A';
                                }

                                return (
                                  <div
                                    key={k}
                                    style={{
                                      padding: '8px 12px',
                                      borderRadius: '4px',
                                      backgroundColor: rowBg,
                                      border: `1px solid ${rowBorder}`,
                                      fontSize: '0.8rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                    }}
                                  >
                                    <div>
                                      <strong style={{ marginRight: '6px', color: '#334155' }}>{k}.</strong>
                                      <span style={{ color: '#1E293B' }}>{opts[k]}</span>
                                    </div>
                                    {badgeText && (
                                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: badgeColor }}>
                                        {badgeText}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                              Student Answer: <strong>{q.student_answer || 'None provided'}</strong>
                            </div>
                          )}

                          {q.explanation && (
                            <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px', fontStyle: 'italic' }}>
                              Explanation: {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* WORK SUBMISSION SPECIFIC SECTION */}
          {isWorkSubmission && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#7C3AED" />
                <div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                    Student Work Submission Contents
                  </h4>
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                    Review the student's written response and attached files, then manually award points and provide rubric remarks below.
                  </div>
                </div>
              </div>

              {workText ? (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Written Response / Submission Body:
                  </div>
                  <div
                    style={{
                      padding: '14px 16px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.88rem',
                      lineHeight: '1.65',
                      color: '#1E293B',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '260px',
                      overflowY: 'auto',
                    }}
                  >
                    {workText}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic' }}>
                  No written text was provided for this submission.
                </div>
              )}

              {workLink && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '6px',
                    backgroundColor: '#F0F9FF',
                    border: '1px solid #BAE6FD',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ExternalLink size={16} color="#0284C7" />
                    <span style={{ fontSize: '0.84rem', color: '#0369A1', fontWeight: 600 }}>
                      Shared URL / Student Link:
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#1E293B', fontWeight: 500, maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {workLink}
                    </span>
                  </div>
                  <a
                    href={workLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="canvas-btn"
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#FFFFFF',
                      backgroundColor: '#0055A5',
                      borderRadius: '4px',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={13} />
                    <span>Open Student Link</span>
                  </a>
                </div>
              )}

              {workFileUrl ? (
                (() => {
                  const isGradingPdf = Boolean(
                    /\.pdf(\?.*)?$/i.test(workFileUrl) ||
                      workFileUrl.toLowerCase().includes('.pdf') ||
                      rawSub?.submission_method === 'pdf_upload' ||
                      (assignment as any)?.activityRaw?.submission_type === 'FILE_UPLOAD' ||
                      (assignment as any)?.submission_type === 'FILE_UPLOAD'
                  );
                  const isGradingImg = Boolean(
                    /\.(png|jpe?g|webp|gif|svg)$/i.test(workFileUrl) ||
                      rawSub?.submission_method === 'image_upload'
                  );

                  if (isGradingPdf) {
                    return (
                      <div style={{ marginTop: '10px' }}>
                        <PdfViewer
                          url={workFileUrl}
                          title={`${student.name}'s PDF Submission`}
                          minHeight="540px"
                        />
                      </div>
                    );
                  }

                  if (isGradingImg) {
                    return (
                      <div
                        style={{
                          marginTop: '10px',
                          border: '1px solid #BAE6FD',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          padding: '12px',
                          backgroundColor: '#F0F9FF',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0369A1', marginBottom: '8px', textAlign: 'left' }}>
                          Student Image Submission:
                        </div>
                        <img
                          src={workFileUrl}
                          alt="Student submission"
                          style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '4px', objectFit: 'contain' }}
                        />
                      </div>
                    );
                  }

                  return (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        backgroundColor: '#F0F9FF',
                        borderRadius: '6px',
                        border: '1px solid #BAE6FD',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Download size={18} color="#0284C7" />
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0369A1' }}>
                            Attachment Uploaded
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#0284C7' }}>
                            Student attached file for manual grading evaluation
                          </div>
                        </div>
                      </div>
                      <a
                        href={workFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="canvas-btn"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          backgroundColor: '#0284C7',
                          color: '#FFFFFF',
                          borderRadius: '4px',
                          textDecoration: 'none',
                        }}
                      >
                        <span>View / Download File</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  );
                })()
              ) : (
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic' }}>
                  No file attachment was uploaded for this submission.
                </div>
              )}
            </div>
          )}

          {!student.completed && (
            <div
              style={{
                padding: '14px',
                textAlign: 'center',
                backgroundColor: '#FFFBEB',
                borderRadius: '6px',
                border: '1px solid #FDE68A',
                color: '#92400E',
                fontSize: '0.82rem',
              }}
            >
              Student has not yet finalized this submission. Tutors may record a provisional manual score or evaluation comments.
            </div>
          )}

          {/* MANUAL GRADING & EVALUATION FORM */}
          <form
            id="tutor-grading-form"
            onSubmit={handleSave}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={16} color="#0055A5" />
              <span>{isWorkSubmission ? 'Manual Grading & Score Award' : 'Tutor Manual Grade Override & Evaluation'}</span>
            </div>
            {isLiveTimed && (
              <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                System original auto-grade: <strong>{rawSub?.auto_score ?? (student.score ? student.score.split('/')[0].trim() : 'auto')} / {maxPoints} pts</strong>.
                {rawSub?.is_grade_overridden
                  ? ` Overridden by ${rawSub.grade_overridden_by_name || 'Tutor'}.`
                  : ' Overriding this will record an audit trail entry under your name.'}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Awarded Points (Max: {maxPoints} pts)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min="0"
                  max={maxPoints}
                  value={pointsInput}
                  onChange={(e) => setPointsInput(e.target.value)}
                  placeholder={`e.g. ${maxPoints}`}
                  style={{
                    width: '130px',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: '#1E293B',
                  }}
                  required
                />
                <span style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: 600 }}>/ {maxPoints} pts</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Tutor Feedback & Evaluation Remarks (Visible to Student)
              </label>
              <textarea
                rows={3}
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="Write constructive evaluation notes, rubric commentary, or improvement feedback..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '4px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  color: '#1E293B',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            backgroundColor: '#F8FAFC',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="canvas-btn"
            style={{
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            form="tutor-grading-form"
            type="submit"
            disabled={isSubmitting}
            className="canvas-btn"
            style={{
              padding: '8px 20px',
              fontSize: '0.82rem',
              fontWeight: 700,
              backgroundColor: '#0055A5',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            <span>{isSubmitting ? 'Saving to Database...' : 'Save & Update Grade'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorStudentGradingModal;

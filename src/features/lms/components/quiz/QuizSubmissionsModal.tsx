import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  Search,
} from 'lucide-react';
import { AdminService, type QuizItem, type QuizSubmissionItem } from '../../../../core/services/AdminService';
import { Badge } from '../../../../components/common/Badge';
import { Spinner } from '../../../../components/common/Spinner';

interface QuizSubmissionsModalProps {
  quiz: QuizItem | null;
  onClose: () => void;
}

export const QuizSubmissionsModal: React.FC<QuizSubmissionsModalProps> = ({ quiz, onClose }) => {
  const adminService = AdminService.getInstance();
  const [submissions, setSubmissions] = useState<QuizSubmissionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<'ALL' | 'FLAGGED' | 'PASSED' | 'FAILED'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<QuizSubmissionItem | null>(null);

  const loadSubmissions = async () => {
    if (!quiz) return;
    setIsLoading(true);
    try {
      const data = await adminService.getQuizSubmissions(quiz.id);
      setSubmissions(Array.isArray(data) ? data : []);
    } catch {
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [quiz?.id]);

  if (!quiz) return null;

  const isLive = (quiz.quiz_type || 'LIVE_TIMED') === 'LIVE_TIMED';

  const filteredSubmissions = submissions.filter((sub) => {
    if (filterMode === 'FLAGGED' && !sub.is_flagged) return false;
    if (filterMode === 'PASSED' && !sub.is_passed) return false;
    if (filterMode === 'FAILED' && sub.is_passed) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      sub.student_name?.toLowerCase().includes(term) ||
      sub.student_phone?.toLowerCase().includes(term) ||
      sub.cohort_name?.toLowerCase().includes(term) ||
      sub.cohort?.toLowerCase().includes(term)
    );
  });

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-2xl)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-elevated)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isLive ? <Clock size={22} /> : <FileCheck size={22} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Submissions & Proctoring Telemetry
                </h3>
                <Badge variant={isLive ? 'info' : 'neutral'}>
                  {isLive ? 'Live Timed' : 'Work Submission'}
                </Badge>
                {quiz.enable_proctoring && (
                  <Badge variant="warning">
                    Proctoring on
                  </Badge>
                )}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                {quiz.title} • {quiz.course_title}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={loadSubmissions}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '8px',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Strip */}
        <div
          style={{
            padding: '14px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.01)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setFilterMode('ALL')}
              className={`btn btn-sm ${filterMode === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              All ({submissions.length})
            </button>
            <button
              onClick={() => setFilterMode('FLAGGED')}
              className={`btn btn-sm ${filterMode === 'FLAGGED' ? 'btn-danger' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <ShieldAlert size={14} />
              <span>Flagged ({submissions.filter((s) => s.is_flagged).length})</span>
            </button>
            <button
              onClick={() => setFilterMode('PASSED')}
              className={`btn btn-sm ${filterMode === 'PASSED' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              Passed ({submissions.filter((s) => s.is_passed).length})
            </button>
            <button
              onClick={() => setFilterMode('FAILED')}
              className={`btn btn-sm ${filterMode === 'FAILED' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              Failed ({submissions.filter((s) => !s.is_passed).length})
            </button>
          </div>

          <div style={{ position: 'relative', width: '240px' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 32px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.82rem',
              }}
            />
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {isLoading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <Spinner message="Loading submissions & telemetry..." />
            </div>
          ) : submissions.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileCheck size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>No student submissions yet</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                When enrolled students complete and submit this assessment, their attempts, scores, and proctoring telemetry will appear here.
              </p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No submissions match the current filter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredSubmissions.map((sub) => {
                const isViolationExceeded = (sub.tab_switch_count || 0) > (quiz.max_tab_switches_allowed || 3);
                return (
                  <div
                    key={sub.id}
                    className="glass-panel"
                    style={{
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-xl)',
                      border: sub.is_flagged ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
                      background: sub.is_flagged ? 'rgba(239, 68, 68, 0.04)' : 'var(--bg-surface-elevated)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                    }}
                  >
                    {/* Left: Student info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '999px',
                          background: sub.is_passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: sub.is_passed ? '#10b981' : '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                        }}
                      >
                        {sub.student_name ? sub.student_name.slice(0, 2).toUpperCase() : 'ST'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                          {sub.student_name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {sub.student_phone} • {sub.cohort_name || sub.cohort || 'General'}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Score & Performance */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Score</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                          {sub.score} / {sub.total_score}{' '}
                          <span style={{ fontSize: '0.8rem', color: sub.is_passed ? '#34d399' : '#f87171' }}>
                            ({sub.percentage}%)
                          </span>
                        </div>
                        {sub.is_grade_overridden && (
                          <div style={{ marginTop: '3px' }}>
                            <Badge variant="warning">
                              Edited by {sub.grade_overridden_by_name || 'Tutor'}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Time Elapsed</div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {formatSeconds(sub.time_spent_seconds || 0)}
                        </div>
                      </div>

                      {/* Proctoring status badge */}
                      {isLive && quiz.enable_proctoring && (
                        <div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Tab Telemetry</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                color: isViolationExceeded ? '#ef4444' : '#10b981',
                              }}
                            >
                              {sub.tab_switch_count} switches
                            </span>
                            {sub.is_flagged ? (
                              <Badge variant="danger">
                                <ShieldAlert size={12} style={{ marginRight: '3px' }} />
                                FLAGGED
                              </Badge>
                            ) : (
                              <Badge variant="success">
                                CLEAN
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Inspection CTA */}
                    <div>
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Eye size={14} />
                        <span>Inspect Telemetry</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Submission Detail Sub-Modal */}
        {selectedSubmission && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.82)',
              padding: '16px',
            }}
          >
            <div
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: '650px',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-surface-elevated)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Attempt #{selectedSubmission.attempt_number} — {selectedSubmission.student_name}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Submitted {new Date(selectedSubmission.created_at).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status summary */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                  padding: '12px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Grade Result</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: selectedSubmission.is_passed ? '#10b981' : '#ef4444' }}>
                    {selectedSubmission.score} / {selectedSubmission.total_score} ({selectedSubmission.percentage}%)
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Duration</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    {formatSeconds(selectedSubmission.time_spent_seconds || 0)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Flag Status</div>
                  <div>
                    {selectedSubmission.is_flagged ? (
                      <Badge variant="danger">FLAGGED</Badge>
                    ) : (
                      <Badge variant="success">CLEAN</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Audit / Manual Override Box */}
              {selectedSubmission.is_grade_overridden && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={15} />
                    <span>Auto-Grade Overridden by Tutor</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Original System Score: <strong style={{ color: '#ffffff' }}>{selectedSubmission.auto_score ?? 'Auto'} pts</strong>
                    {' • '}
                    Overridden By: <strong style={{ color: '#f59e0b' }}>{selectedSubmission.grade_overridden_by_name || selectedSubmission.graded_by_name || 'Tutor'}</strong>
                    {selectedSubmission.grade_overridden_at && ` on ${new Date(selectedSubmission.grade_overridden_at).toLocaleString()}`}
                  </div>
                  {selectedSubmission.feedback && (
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Tutor Note: "{selectedSubmission.feedback}"
                    </div>
                  )}
                </div>
              )}

              {/* Proctoring Log */}
              {selectedSubmission.proctoring_violations && selectedSubmission.proctoring_violations.length > 0 ? (
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={15} style={{ color: '#f59e0b' }} />
                    <span>Recorded Tab Switch Events ({selectedSubmission.proctoring_violations.length})</span>
                  </div>
                  <div
                    style={{
                      maxHeight: '180px',
                      overflowY: 'auto',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '8px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {selectedSubmission.proctoring_violations.map((v, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '4px 0',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        <span style={{ color: '#f87171' }}>• {v.reason || v.event || 'Left assessment window'}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>{v.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.08)', color: '#34d399', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} />
                  <span>No proctoring violations recorded. Student stayed on this tab during the full session.</span>
                </div>
              )}

              {/* Work submission text (if take-home) */}
              {selectedSubmission.work_submission_text && (
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={15} style={{ color: '#c084fc' }} />
                    <span>Student Submitted Work / Notes</span>
                  </div>
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      maxHeight: '120px',
                      overflowY: 'auto',
                    }}
                  >
                    {selectedSubmission.work_submission_text}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button onClick={() => setSelectedSubmission(null)} className="btn btn-secondary btn-sm">
                  Close Detail
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

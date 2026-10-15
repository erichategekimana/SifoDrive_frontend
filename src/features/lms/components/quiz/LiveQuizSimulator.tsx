import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Clock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Send,
  RotateCcw,
  Sparkles,
  FileCheck,
  Upload,
  Globe,
  Award,
} from 'lucide-react';
import { AdminService, type QuizItem, type QuizSubmissionItem } from '../../../../core/services/AdminService';
import { Badge } from '../../../../components/common/Badge';
import { useToast } from '../../../../context/ToastContext';

interface LiveQuizSimulatorProps {
  quiz: QuizItem;
  onClose?: () => void;
  onSubmitted?: (submission: QuizSubmissionItem) => void;
}

export const LiveQuizSimulator: React.FC<LiveQuizSimulatorProps> = ({ quiz, onClose, onSubmitted }) => {
  const adminService = AdminService.getInstance();
  const { warning, success, error: toastError } = useToast();

  const isLiveTimed = (quiz.quiz_type || 'LIVE_TIMED') === 'LIVE_TIMED';
  const proctoringEnabled = Boolean(isLiveTimed && quiz.enable_proctoring);
  const maxSwitchesAllowed = quiz.max_tab_switches_allowed || 3;

  // Simulator state
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [language, setLanguage] = useState<'EN' | 'RW'>('EN');

  // Answers & Work
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [workText, setWorkText] = useState<string>('');
  const [workFile, setWorkFile] = useState<File | null>(null);

  // Live Timer
  const initialSeconds = (quiz.time_limit_minutes || 15) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);
  const [timeSpent, setTimeSpent] = useState<number>(0);

  // Proctoring Telemetry
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [violationsLog, setViolationsLog] = useState<Array<{ timestamp: string; reason: string }>>([]);
  const [latestWarning, setLatestWarning] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<QuizSubmissionItem | null>(null);

  const lastViolationTimeRef = useRef<number>(0);

  // Trigger violation
  const recordViolation = useCallback((reason: string) => {
    if (!isStarted || isSubmitted || !proctoringEnabled) return;

    // Throttle duplicate events within 1.5 seconds
    const now = Date.now();
    if (now - lastViolationTimeRef.current < 1500) return;
    lastViolationTimeRef.current = now;

    setTabSwitchCount((prev) => {
      const nextCount = prev + 1;
      const violationMsg = `Tab switch detected! You navigated away from the assessment (${nextCount} / ${maxSwitchesAllowed} warnings).`;
      setLatestWarning(violationMsg);
      warning(violationMsg);
      return nextCount;
    });

    setViolationsLog((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString(),
        reason,
      },
    ]);
  }, [isStarted, isSubmitted, proctoringEnabled, maxSwitchesAllowed, warning]);

  // Tab switch & Window Blur listeners
  useEffect(() => {
    if (!isStarted || isSubmitted || !proctoringEnabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('Tab switched / document hidden');
      }
    };

    const handleWindowBlur = () => {
      recordViolation('Window lost focus (clicked outside or switched app)');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isStarted, isSubmitted, proctoringEnabled, recordViolation]);

  // Timer interval
  useEffect(() => {
    if (!isStarted || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
      if (isLiveTimed && quiz.time_limit_minutes > 0) {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isSubmitted, isLiveTimed, quiz.time_limit_minutes]);

  const questions = quiz.items || [];

  const handleSelectOption = (questionId: string, option: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    try {
      const result = await adminService.submitQuiz(quiz.id, {
        student_answers: selectedAnswers,
        work_submission_text: workText,
        work_submission_file: workFile,
        time_spent_seconds: timeSpent,
        tab_switch_count: tabSwitchCount,
        proctoring_violations: violationsLog,
      });

      setSubmissionResult(result);
      if (result.is_flagged) {
        warning(`Quiz submitted. Note: Flagged for suspicious activity due to exceeding allowed tab switches (${tabSwitchCount} / ${maxSwitchesAllowed}).`);
      } else if (result.is_passed) {
        success(`Quiz submitted successfully! Passed with score ${result.score}/${result.total_score} (${result.percentage}%).`);
      } else {
        warning(`Quiz submitted. Score: ${result.score}/${result.total_score} (${result.percentage}%). Did not meet passing threshold.`);
      }

      if (onSubmitted) {
        onSubmitted(result);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to submit quiz.');
    }
  };

  const handleRestart = () => {
    setIsStarted(false);
    setIsSubmitted(false);
    setSelectedAnswers({});
    setWorkText('');
    setWorkFile(null);
    setSecondsRemaining(initialSeconds);
    setTimeSpent(0);
    setTabSwitchCount(0);
    setViolationsLog([]);
    setLatestWarning(null);
    setSubmissionResult(null);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isFlagged = proctoringEnabled && tabSwitchCount > maxSwitchesAllowed;

  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: 'var(--radius-2xl)',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'var(--bg-surface-elevated)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-lg)',
              background: isLiveTimed ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)',
              color: isLiveTimed ? '#38bdf8' : '#c084fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isLiveTimed ? <Clock size={20} /> : <FileCheck size={20} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                {language === 'RW' && quiz.title_kinyarwanda ? quiz.title_kinyarwanda : quiz.title}
              </span>
              <Badge variant={isLiveTimed ? 'info' : 'neutral'}>
                {isLiveTimed ? 'Live Timed Simulation' : 'Work Submission'}
              </Badge>
              {proctoringEnabled && (
                <Badge variant={isFlagged ? 'danger' : 'warning'}>
                  <ShieldAlert size={12} style={{ marginRight: '4px' }} />
                  {isFlagged ? 'FLAGGED FOR VIOLATION' : `Proctoring Active (Max ${maxSwitchesAllowed})`}
                </Badge>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {quiz.course_title} • Passing threshold: {quiz.passing_score}% • Max attempts: {quiz.max_attempts || 'Unlimited'}
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setLanguage((l) => (l === 'EN' ? 'RW' : 'EN'))}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Globe size={14} />
            <span>{language === 'EN' ? 'Kinyarwanda' : 'English'}</span>
          </button>

          {isStarted && !isSubmitted && isLiveTimed && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-lg)',
                background: secondsRemaining < 120 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                border: secondsRemaining < 120 ? '1px solid #ef4444' : '1px solid #38bdf8',
                color: secondsRemaining < 120 ? '#ef4444' : '#38bdf8',
                fontWeight: 800,
                fontSize: '1rem',
              }}
            >
              <Clock size={16} />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          )}

          {isStarted && (
            <button
              onClick={handleRestart}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}

          {onClose && (
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              Exit
            </button>
          )}
        </div>
      </div>

      {/* Proctoring Warning Banner if alert triggered */}
      {latestWarning && !isSubmitted && (
        <div
          style={{
            padding: '10px 20px',
            background: isFlagged ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)',
            borderBottom: isFlagged ? '1px solid #ef4444' : '1px solid #f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.84rem',
            fontWeight: 700,
            color: isFlagged ? '#f87171' : '#fbbf24',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>{latestWarning}</span>
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Recorded in proctoring audit log
          </span>
        </div>
      )}

      {/* Simulator Body */}
      {!isStarted ? (
        /* Welcome / Start Screen */
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            maxWidth: '680px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-xl)',
              background: isLiveTimed ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)',
              color: isLiveTimed ? '#38bdf8' : '#c084fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={32} />
          </div>

          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              {quiz.title}
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
              {quiz.description || 'Test and assess comprehensive Rwanda Highway Code theoretical and practical road safety mastery.'}
            </p>
          </div>

          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              textAlign: 'left',
            }}
          >
            <div className="glass-panel" style={{ padding: '14px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Format</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                {isLiveTimed ? 'Live Timed' : 'Work Submission'}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '14px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Time Limit</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                {quiz.time_limit_minutes > 0 ? `${quiz.time_limit_minutes} minutes` : 'Self-Paced'}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '14px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Tab Proctoring</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: proctoringEnabled ? '#38bdf8' : 'var(--text-muted)', marginTop: '2px' }}>
                {proctoringEnabled ? `Active (Max ${maxSwitchesAllowed})` : 'Disabled'}
              </div>
            </div>
          </div>

          {proctoringEnabled && (
            <div
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                textAlign: 'left',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <ShieldAlert size={20} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff' }}>
                  Anti-Cheating Proctoring Rules
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                  This quiz actively tracks whether you switch tabs or minimize the browser window. If you leave this window more than {maxSwitchesAllowed} times, your attempt will be flagged for tutor inspection.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsStarted(true)}
            className="btn btn-primary"
            style={{
              padding: '12px 32px',
              fontSize: '1rem',
              fontWeight: 800,
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '8px',
            }}
          >
            <Sparkles size={18} />
            <span>Begin Assessment</span>
          </button>
        </div>
      ) : isSubmitted ? (
        /* Results View */
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            maxWidth: '680px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '999px',
              background: submissionResult?.is_passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: submissionResult?.is_passed ? '#10b981' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {submissionResult?.is_passed ? <CheckCircle2 size={36} /> : <XCircle size={36} />}
          </div>

          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              {submissionResult?.is_passed ? 'Assessment Passed!' : 'Assessment Completed'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Your answers and proctoring telemetry have been recorded in the LMS Quiz Bank.
            </p>
          </div>

          {/* Results Metric Card */}
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              textAlign: 'left',
            }}
          >
            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Score Achieved</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                {submissionResult?.score} / {submissionResult?.total_score}
              </div>
              <div style={{ fontSize: '0.78rem', color: submissionResult?.is_passed ? '#34d399' : '#f87171' }}>
                {submissionResult?.percentage}% (Passing: {quiz.passing_score}%)
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Time Elapsed</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                {formatTimer(timeSpent)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {isLiveTimed ? `${quiz.time_limit_minutes}m allocated` : 'Take-home'}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Proctoring Telemetry</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isFlagged ? '#ef4444' : '#10b981', marginTop: '2px' }}>
                {tabSwitchCount} switches
              </div>
              <div style={{ fontSize: '0.78rem', color: isFlagged ? '#f87171' : '#34d399' }}>
                {isFlagged ? 'FLAGGED FOR REVIEW' : 'VERIFIED CLEAN'}
              </div>
            </div>
          </div>

          {/* Proctoring Timeline Audit */}
          {violationsLog.length > 0 && (
            <div
              style={{
                width: '100%',
                textAlign: 'left',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '14px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                Tab Navigation Audit Log:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem' }}>
                {violationsLog.map((v, idx) => (
                  <div key={idx} style={{ color: '#f87171' }}>
                    [{v.timestamp}] {v.reason}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleRestart} className="btn btn-secondary">
              Retake Assessment
            </button>
            {onClose && (
              <button onClick={onClose} className="btn btn-primary">
                Done & Return to Bank
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Active Assessment View */
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Work Submission Quiz Mode */}
          {!isLiveTimed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-xl)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 8px 0' }}>
                  Written Work Submission & Project Response
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                  {language === 'RW' && quiz.rubric_kinyarwanda ? quiz.rubric_kinyarwanda : quiz.rubric || 'Please type your answers, essay response, or assignment solution below according to the rubric criteria.'}
                </p>

                <textarea
                  rows={8}
                  placeholder="Type your submission response here..."
                  value={workText}
                  onChange={(e) => setWorkText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                  }}
                />

                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Upload size={14} />
                    <span>{workFile ? workFile.name : 'Attach File (PDF, DOCX, ZIP)'}</span>
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setWorkFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {workFile && (
                    <button onClick={() => setWorkFile(null)} className="btn btn-secondary btn-sm" style={{ color: '#ef4444' }}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {/* Multiple Choice Questions */}
          {questions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              {questions.map((q, idx) => {
                const questionPrompt = language === 'RW' && q.question_text_kinyarwanda ? q.question_text_kinyarwanda : q.question_text;
                const optA = language === 'RW' && q.option_a_kinyarwanda ? q.option_a_kinyarwanda : q.option_a;
                const optB = language === 'RW' && q.option_b_kinyarwanda ? q.option_b_kinyarwanda : q.option_b;
                const optC = language === 'RW' && q.option_c_kinyarwanda ? q.option_c_kinyarwanda : q.option_c;
                const optD = language === 'RW' && q.option_d_kinyarwanda ? q.option_d_kinyarwanda : q.option_d;
                const qId = q.id || `q-${idx}`;
                const currentChoice = selectedAnswers[qId];

                return (
                  <div
                    key={qId}
                    className="glass-panel"
                    style={{
                      padding: '20px 24px',
                      borderRadius: 'var(--radius-xl)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.5 }}>
                        <span style={{ color: '#38bdf8', marginRight: '6px' }}>Q{idx + 1}.</span>
                        {questionPrompt}
                      </div>
                      <span style={{ fontSize: '0.74rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                        {q.points || 1} pt{q.points === 1 ? '' : 's'}
                      </span>
                    </div>

                    {/* Options list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { key: 'A', text: optA },
                        { key: 'B', text: optB },
                        { key: 'C', text: optC },
                        { key: 'D', text: optD },
                      ]
                        .filter((opt) => Boolean(opt.text))
                        .map((opt) => {
                          const isSelected = currentChoice === opt.key;
                          return (
                            <div
                              key={opt.key}
                              onClick={() => handleSelectOption(qId, opt.key)}
                              style={{
                                padding: '10px 14px',
                                borderRadius: 'var(--radius-md)',
                                border: isSelected ? '2px solid #38bdf8' : '1px solid var(--border-subtle)',
                                background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-surface-elevated)',
                                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '0.86rem',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '999px',
                                  border: isSelected ? '2px solid #38bdf8' : '1px solid var(--border-subtle)',
                                  background: isSelected ? '#38bdf8' : 'transparent',
                                  color: isSelected ? '#000000' : 'var(--text-muted)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                }}
                              >
                                {opt.key}
                              </div>
                              <span style={{ flex: 1 }}>{opt.text}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Submission Bar */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              maxWidth: '800px',
              margin: '0 auto',
              width: '100%',
            }}
          >
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Answered: {Object.keys(selectedAnswers).length} / {questions.length} questions
            </div>

            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                borderRadius: 'var(--radius-lg)',
                fontWeight: 800,
              }}
            >
              <Send size={16} />
              <span>Submit Assessment</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

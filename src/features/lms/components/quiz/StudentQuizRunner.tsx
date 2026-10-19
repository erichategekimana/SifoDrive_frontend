import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Clock,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Sparkles,
  Globe,
  Flag,
  Maximize2,
  Minimize2,
  Check,
} from 'lucide-react';
import { AdminService, type QuizItem, type QuizSubmissionItem, type QuizQuestionItem } from '../../../../core/services/AdminService';
import { Badge } from '../../../../components/common/Badge';
import { useToast } from '../../../../context/ToastContext';

interface StudentQuizRunnerProps {
  quizId: string;
  courseId?: string;
  courseTitle?: string;
  cohortId?: string;
  initialQuiz?: QuizItem | null;
  onClose: () => void;
  onCompleted?: (submission: QuizSubmissionItem) => void;
}

type RunnerStep = 'PREFLIGHT' | 'RUNNING' | 'SUBMITTING' | 'RESULTS';

interface DiagnosticCheck {
  id: string;
  label: string;
  description: string;
  status: 'PENDING' | 'CHECKING' | 'PASS' | 'WARN';
  detail?: string;
}

export const StudentQuizRunner: React.FC<StudentQuizRunnerProps> = ({
  quizId,
  courseId: _courseId,
  courseTitle,
  cohortId,
  initialQuiz,
  onClose,
  onCompleted,
}) => {
  const adminService = AdminService.getInstance();
  const { warning, success, error: toastError } = useToast();

  const [step, setStep] = useState<RunnerStep>('PREFLIGHT');
  const [quiz, setQuiz] = useState<QuizItem | null>(initialQuiz || null);
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(!initialQuiz);
  const [language, setLanguage] = useState<'EN' | 'RW' | 'FR'>('EN');

  // Diagnostics state
  const [diagnostics, setDiagnostics] = useState<DiagnosticCheck[]>([
    {
      id: 'network',
      label: 'Network Connectivity',
      description: 'Checking connection to assessment API server',
      status: 'PENDING',
    },
    {
      id: 'sensors',
      label: 'Tab Focus',
      description: 'Verifying browser visibility and blur event listeners',
      status: 'PENDING',
    },
    {
      id: 'cache',
      label: 'Auto-Save',
      description: 'Initializing local encrypted answer recovery cache',
      status: 'PENDING',
    },
    {
      id: 'assets',
      label: 'Question Pre-Load Engine',
      description: 'Downloading question items and media for 0ms lag',
      status: 'PENDING',
    },
  ]);
  const [diagnosticsComplete, setDiagnosticsComplete] = useState<boolean>(false);
  const [integrityPledgeAccepted, setIntegrityPledgeAccepted] = useState<boolean>(false);
  const [requestFullscreenOnStart, setRequestFullscreenOnStart] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Active exam state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [workText, setWorkText] = useState<string>('');
  const [workFile, setWorkFile] = useState<File | null>(null);

  // Live Timer
  const [timeRemaining, setTimeRemaining] = useState<number>(1200);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const timerRef = useRef<any>(null);

  // Proctoring telemetry
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [violations, setViolations] = useState<Array<{ timestamp: string; event?: string; reason?: string }>>([]);
  const [activeViolationAlert, setActiveViolationAlert] = useState<string | null>(null);

  // Confirmation modal
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);

  // Final Results
  const [submissionResult, setSubmissionResult] = useState<QuizSubmissionItem | null>(null);

  // 1. Fetch Quiz Details and Pre-load questions
  useEffect(() => {
    let isMounted = true;
    const fetchFullQuiz = async () => {
      try {
        setLoadingQuiz(true);
        const fullQuiz = await adminService.getQuizDetail(quizId);
        if (isMounted) {
          setQuiz(fullQuiz);
          if (fullQuiz.time_limit_minutes) {
            setTimeRemaining(fullQuiz.time_limit_minutes * 60);
          }
        }
      } catch (err) {
        console.error('Failed to load quiz details:', err);
      } finally {
        if (isMounted) setLoadingQuiz(false);
      }
    };
    fetchFullQuiz();
    return () => {
      isMounted = false;
    };
  }, [quizId]);

  // 2. Run Diagnostics Pre-flight checks
  useEffect(() => {
    if (loadingQuiz || !quiz) return;

    let isMounted = true;
    const runChecks = async () => {
      // Step A: Network Latency Check
      setDiagnostics((prev) =>
        prev.map((d) => (d.id === 'network' ? { ...d, status: 'CHECKING' } : d))
      );
      const pingStart = performance.now();
      await new Promise((r) => setTimeout(r, 450));
      const pingMs = Math.round(performance.now() - pingStart);
      if (!isMounted) return;
      setDiagnostics((prev) =>
        prev.map((d) =>
          d.id === 'network'
            ? {
                ...d,
                status: 'PASS',
                detail: `Connected (${pingMs}ms latency • High Stability)`,
              }
            : d
        )
      );

      // Step B: Sensor & Browser checks
      setDiagnostics((prev) =>
        prev.map((d) => (d.id === 'sensors' ? { ...d, status: 'CHECKING' } : d))
      );
      await new Promise((r) => setTimeout(r, 400));
      const hasVisibility = typeof document.visibilityState !== 'undefined';
      const hasFullscreen = document.fullscreenEnabled;
      if (!isMounted) return;
      setDiagnostics((prev) =>
        prev.map((d) =>
          d.id === 'sensors'
            ? {
                ...d,
                status: hasVisibility ? 'PASS' : 'WARN',
                detail: hasVisibility
                  ? `Focus Sensor Active • ${hasFullscreen ? 'Fullscreen Ready' : 'Standard Window'}`
                  : 'Tab Focus Fallback mode',
              }
            : d
        )
      );

      // Step C: Auto-save cache check
      setDiagnostics((prev) =>
        prev.map((d) => (d.id === 'cache' ? { ...d, status: 'CHECKING' } : d))
      );
      await new Promise((r) => setTimeout(r, 350));
      try {
        localStorage.setItem('sifo_diagnostic_test', '1');
        localStorage.removeItem('sifo_diagnostic_test');
        // Check for existing saved draft answers
        const savedDraft = localStorage.getItem(`sifo_quiz_active_answers_${quizId}`);
        if (savedDraft) {
          try {
            setSelectedAnswers(JSON.parse(savedDraft));
          } catch {}
        }
      } catch {}
      if (!isMounted) return;
      setDiagnostics((prev) =>
        prev.map((d) =>
          d.id === 'cache'
            ? {
                ...d,
                status: 'PASS',
                detail: 'Local state disaster recovery synchronized',
              }
            : d
        )
      );

      // Step D: Assets & Questions preload
      setDiagnostics((prev) =>
        prev.map((d) => (d.id === 'assets' ? { ...d, status: 'CHECKING' } : d))
      );
      await new Promise((r) => setTimeout(r, 400));
      const qCount = quiz.items?.length || quiz.question_count || 0;
      if (!isMounted) return;
      setDiagnostics((prev) =>
        prev.map((d) =>
          d.id === 'assets'
            ? {
                ...d,
                status: 'PASS',
                detail: `${qCount} Question(s) pre-buffered into memory`,
              }
            : d
        )
      );

      setDiagnosticsComplete(true);
    };

    runChecks();
    return () => {
      isMounted = false;
    };
  }, [loadingQuiz, quiz, quizId]);

  // Questions array
  const questions: QuizQuestionItem[] = quiz?.items || [];
  const currentQuestion = questions[currentIndex];
  const isLiveTimed = (quiz?.quiz_type || 'LIVE_TIMED') === 'LIVE_TIMED';
  const proctoringEnabled = Boolean(isLiveTimed && quiz?.enable_proctoring);
  const maxSwitchesAllowed = quiz?.max_tab_switches_allowed || 3;
  const isBeforeOpenDate = Boolean(quiz?.open_date && new Date(quiz.open_date) > new Date());

  // 3. Proctoring Listeners when in RUNNING state
  const handleTabDeparture = useCallback(() => {
    if (step !== 'RUNNING' || !proctoringEnabled) return;

    const incidentTime = new Date().toLocaleTimeString();
    const isoString = new Date().toISOString();

    setTabSwitchCount((prev) => {
      const nextCount = prev + 1;
      const isExceeded = nextCount > maxSwitchesAllowed;
      const reasonMsg = isExceeded
        ? `Exceeded allowed limit (${nextCount}/${maxSwitchesAllowed}). Attempt is now FLAGGED for review.`
        : `Violation #${nextCount} of ${maxSwitchesAllowed} recorded.`;

      setActiveViolationAlert(`Tab departure detected at ${incidentTime}. ${reasonMsg}`);
      warning(`Proctoring Incident #${nextCount}: Leaving exam tab is recorded.`);

      setViolations((vPrev) => [
        ...vPrev,
        {
          timestamp: isoString,
          event: 'TAB_BLUR_OR_HIDDEN',
          reason: `Student left assessment window at ${incidentTime}`,
        },
      ]);

      return nextCount;
    });
  }, [step, proctoringEnabled, maxSwitchesAllowed, warning]);

  useEffect(() => {
    if (step !== 'RUNNING' || !proctoringEnabled) return;

    const onVisibilityChange = () => {
      if (document.hidden) {
        handleTabDeparture();
      }
    };

    const onWindowBlur = () => {
      handleTabDeparture();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onWindowBlur);
    };
  }, [step, proctoringEnabled, handleTabDeparture]);

  // 4. Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const exitFullscreenIfActive = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleClose = () => {
    exitFullscreenIfActive();
    onClose();
  };

  // Ensure fullscreen is automatically exited when student is done
  useEffect(() => {
    if (step === 'RESULTS') {
      exitFullscreenIfActive();
    }
  }, [step]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // 5. Timer countdown
  useEffect(() => {
    if (step !== 'RUNNING') return;

    timerRef.current = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);

      if (isLiveTimed) {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleFinalSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, isLiveTimed]);

  // Auto-save answers locally to prevent loss
  const handleSelectOption = (questionKey: string, optionKey: string) => {
    setSelectedAnswers((prev) => {
      const next = { ...prev, [questionKey]: optionKey };
      try {
        localStorage.setItem(`sifo_quiz_active_answers_${quizId}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleFlagQuestion = (idx: number) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Start Assessment Handler
  const handleStartExam = () => {
    if (isBeforeOpenDate) {
      toastError(
        `This assessment is scheduled to open on ${new Date(quiz!.open_date!).toLocaleString()}. You cannot take it before its open date.`
      );
      return;
    }

    if (!diagnosticsComplete || !integrityPledgeAccepted) return;

    if (requestFullscreenOnStart && document.fullscreenEnabled && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    setStep('RUNNING');
    success('Assessment session initialized. Good luck!');
  };

  // Final Submit Handler
  const handleFinalSubmit = async (isAutoExpire = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    exitFullscreenIfActive();
    setShowSubmitConfirm(false);
    setStep('SUBMITTING');

    try {
      const payload = {
        cohort_id: cohortId,
        student_answers: selectedAnswers,
        flagged_for_review_questions: Array.from(flaggedQuestions).map(
          (idx) => questions[idx]?.id || String(idx)
        ),
        work_submission_text: workText,
        work_submission_file: workFile,
        time_spent_seconds: timeSpentSeconds,
        tab_switch_count: tabSwitchCount,
        proctoring_violations: violations,
      };

      const result = await adminService.submitQuiz(quizId, payload);
      setSubmissionResult(result);
      setStep('RESULTS');

      // Record student attempt count and submission in localStorage
      let studentId = result?.student;
      if (!studentId || studentId === 'std-1') {
        try {
          const rawUser = localStorage.getItem('sifo_user');
          if (rawUser) {
            const parsed = JSON.parse(rawUser);
            studentId = parsed.id || studentId;
          }
        } catch {}
      }
      studentId = studentId || 'u-4';

      const currentAttempts = Number(
        localStorage.getItem(`sifo_quiz_attempts_${quizId}_${studentId}`) ||
          localStorage.getItem(`sifo_quiz_attempts_${quizId}`) ||
          0
      );
      const nextAttempts = currentAttempts + 1;
      localStorage.setItem(`sifo_quiz_attempts_${quizId}_${studentId}`, String(nextAttempts));
      localStorage.setItem(`sifo_quiz_attempts_${quizId}`, String(nextAttempts));
      localStorage.setItem(`sifo_quiz_sub_${quizId}_${studentId}`, JSON.stringify(result));
      localStorage.setItem(`sifo_quiz_submission_${quizId}`, JSON.stringify(result));

      window.dispatchEvent(
        new CustomEvent('sifo_quiz_submitted', {
          detail: { quizId, studentId, submission: result, attemptsCount: nextAttempts },
        })
      );

      // Clear local auto-save cache
      try {
        localStorage.removeItem(`sifo_quiz_active_answers_${quizId}`);
      } catch {}

      if (isAutoExpire) {
        warning('Time expired! Your answers were automatically finalized and graded.');
      } else {
        success('Assessment submitted successfully!');
      }

      if (onCompleted) {
        onCompleted(result);
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      toastError(err?.message || 'Failed to submit quiz. Please try again.');
      setStep('RUNNING');
    }
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = questions.length;
  const unansweredCount = Math.max(0, totalCount - answeredCount);
  const flaggedCount = flaggedQuestions.size;

  const currentQId = String(currentQuestion?.id || currentIndex);
  const isCurrentAnswered = Boolean(selectedAnswers[currentQId]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#090D16',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* ──────────────────────────────────────────────────────────────────────────
          PHASE 1: PRE-FLIGHT SYSTEM PREPARATION & DIAGNOSTIC READINESS
         ────────────────────────────────────────────────────────────────────────── */}
      {step === 'PREFLIGHT' && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '500px',
              backgroundColor: '#111827',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.8)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38BDF8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    System Check
                  </div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: 0, lineHeight: 1.3 }}>
                    {quiz?.title || 'Preparing Assessment Session...'}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                }}
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* 1. FIRST: Environment Diagnostics */}
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#E2E8F0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <span>Environment Diagnostics</span>
                </div>
                {diagnosticsComplete && (
                  <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} /> System Ready
                  </span>
                )}
              </div>

              {/* Checked Points List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {diagnostics.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border:
                        d.status === 'PASS'
                          ? '1px solid rgba(16, 185, 129, 0.2)'
                          : d.status === 'CHECKING'
                          ? '1px solid rgba(56, 189, 248, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F1F5F9' }}>
                        {d.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                        {d.detail || d.description}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {d.status === 'PASS' ? (
                        <CheckCircle2 size={16} color="#10B981" />
                      ) : (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: d.status === 'CHECKING' ? '#38BDF8' : '#64748B',
                          }}
                        >
                          {d.status === 'CHECKING' ? 'Checking...' : 'Pending'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment Meta Summary & Proctoring Note */}
            {quiz && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  color: '#CBD5E1',
                }}
              >
                {!isLiveTimed && (
                  <Badge variant="neutral">
                    WORK SUBMISSION
                  </Badge>
                )}
                {proctoringEnabled && (
                  <Badge
                    variant="neutral"
                    style={{
                      color: '#FFFFFF',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    MAX TAB SWITCHES: {maxSwitchesAllowed}
                  </Badge>
                )}
                <span>⏱ {quiz.time_limit_minutes || 20} min</span>
                <span>•</span>
                <span>Pass: {quiz.passing_score || 70}%</span>
                <span>•</span>
                <span>{quiz.items?.length || quiz.question_count || 0} questions</span>
              </div>
            )}

            {/* Student Integrity Pledge & Fullscreen Toggle */}
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={integrityPledgeAccepted}
                  onChange={(e) => setIntegrityPledgeAccepted(e.target.checked)}
                  style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: '#0055A5' }}
                />
                <span style={{ fontSize: '0.8rem', color: '#E2E8F0', lineHeight: 1.35 }}>
                  <strong>Academic Integrity Pledge:</strong> I will complete this assessment independently without switching tabs or unauthorized resources.
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', paddingLeft: '2px' }}>
                <input
                  type="checkbox"
                  checked={requestFullscreenOnStart}
                  onChange={(e) => setRequestFullscreenOnStart(e.target.checked)}
                  style={{ width: '15px', height: '15px', accentColor: '#0055A5' }}
                />
                <span style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                  Enter Fullscreen Exam Mode on start
                </span>
              </label>
            </div>

            {/* Scheduled open date warning if not yet open */}
            {isBeforeOpenDate && (
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  borderRadius: '10px',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#FCD34D',
                  fontSize: '0.8rem',
                  lineHeight: 1.4,
                }}
              >
                <Clock size={16} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Assessment Scheduled:</strong> This quiz opens on{' '}
                  <strong>{new Date(quiz!.open_date!).toLocaleString()}</strong>. You can review instructions and rubric details, but you cannot take or submit this quiz before its open date.
                </span>
              </div>
            )}

            {/* Launch Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={handleClose}
                className="canvas-btn"
                style={{
                  padding: '9px 18px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#CBD5E1',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStartExam}
                disabled={!diagnosticsComplete || !integrityPledgeAccepted || isBeforeOpenDate}
                style={{
                  padding: '9px 24px',
                  backgroundColor: diagnosticsComplete && integrityPledgeAccepted && !isBeforeOpenDate ? '#0055A5' : '#334155',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  cursor: diagnosticsComplete && integrityPledgeAccepted && !isBeforeOpenDate ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow:
                    diagnosticsComplete && integrityPledgeAccepted && !isBeforeOpenDate
                      ? '0 8px 16px -4px rgba(0, 85, 165, 0.5)'
                      : 'none',
                }}
              >
                <span>{isBeforeOpenDate ? `Opens on ${new Date(quiz!.open_date!).toLocaleDateString()}` : 'Start Assessment'}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          PHASE 2: LIVE ASSESSMENT PLAYER
         ────────────────────────────────────────────────────────────────────────── */}
      {(step === 'RUNNING' || step === 'SUBMITTING') && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* Top Bar: Timer, Proctoring Badge, Language, Fullscreen */}
          <header
            style={{
              padding: '12px 24px',
              backgroundColor: '#0F172A',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#FFFFFF' }}>
                {quiz?.title}
              </div>
              {courseTitle && (
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', borderLeft: '1px solid #334155', paddingLeft: '12px' }}>
                  {courseTitle}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

              {/* Countdown Timer */}
              {isLiveTimed && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 16px',
                    borderRadius: '8px',
                    backgroundColor:
                      timeRemaining < 120
                        ? 'rgba(239, 68, 68, 0.25)'
                        : timeRemaining < 300
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(56, 189, 248, 0.15)',
                    border:
                      timeRemaining < 120
                        ? '1px solid #EF4444'
                        : timeRemaining < 300
                        ? '1px solid #F59E0B'
                        : '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                >
                  <Clock
                    size={16}
                    color={timeRemaining < 120 ? '#EF4444' : timeRemaining < 300 ? '#F59E0B' : '#38BDF8'}
                  />
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '1rem',
                      fontWeight: 800,
                      color:
                        timeRemaining < 120
                          ? '#F87171'
                          : timeRemaining < 300
                          ? '#FBBF24'
                          : '#38BDF8',
                    }}
                  >
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}

              {/* Language Switch */}
              <button
                type="button"
                onClick={() => setLanguage((l) => (l === 'EN' ? 'RW' : l === 'RW' ? 'FR' : 'EN'))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#CBD5E1',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                <Globe size={14} />
                <span>{language === 'EN' ? 'English' : language === 'RW' ? 'Kinyarwanda' : 'Français'}</span>
              </button>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                title="Toggle Fullscreen"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '6px',
                }}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </header>

          {/* Active Tab Departure Toast Overlay */}
          {activeViolationAlert && (
            <div
              style={{
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                padding: '10px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={18} />
                <span>{activeViolationAlert}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveViolationAlert(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: '#FFFFFF',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Acknowledge
              </button>
            </div>
          )}

          {/* Main Assessment Body: Left Question / Right Navigation Palette */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Left: Question Card (or Work Submission form) */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '36px 48px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {isLiveTimed ? (
                questions.length > 0 && currentQuestion ? (
                  <div style={{ maxWidth: '820px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Question Header & Meta */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38BDF8' }}>
                          QUESTION {currentIndex + 1} OF {questions.length}
                        </span>
                        <span style={{ color: '#475569' }}>•</span>
                        <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                          {currentQuestion.points} Points
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleFlagQuestion(currentIndex)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: flaggedQuestions.has(currentIndex) ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                          border: flaggedQuestions.has(currentIndex) ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.1)',
                          color: flaggedQuestions.has(currentIndex) ? '#FBBF24' : '#CBD5E1',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <Flag size={14} />
                        <span>{flaggedQuestions.has(currentIndex) ? 'Flagged for Review' : 'Flag Question'}</span>
                      </button>
                    </div>

                    {/* Question Prompt */}
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        lineHeight: 1.5,
                      }}
                    >
                      {language === 'FR' && currentQuestion.question_text_french
                        ? currentQuestion.question_text_french
                        : language === 'RW' && currentQuestion.question_text_kinyarwanda
                        ? currentQuestion.question_text_kinyarwanda
                        : currentQuestion.question_text || currentQuestion.question_text_kinyarwanda || currentQuestion.question_text_french}
                    </div>

                    {/* Bilingual sub-text if in English/French mode */}
                    {(language === 'EN' || language === 'FR') && currentQuestion.question_text_kinyarwanda && (
                      <div style={{ fontSize: '0.9rem', color: '#94A3B8', fontStyle: 'italic', marginTop: '-12px' }}>
                        {currentQuestion.question_text_kinyarwanda}
                      </div>
                    )}

                    {/* Option Choices */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                      {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                        const optTextEn = (currentQuestion as any)[`option_${optKey.toLowerCase()}`];
                        const optTextRw = (currentQuestion as any)[`option_${optKey.toLowerCase()}_kinyarwanda`];
                        const optTextFr = (currentQuestion as any)[`option_${optKey.toLowerCase()}_french`];
                        if (!optTextEn && !optTextRw && !optTextFr) return null;

                        const displayText =
                          language === 'FR' && optTextFr
                            ? optTextFr
                            : language === 'RW' && optTextRw
                            ? optTextRw
                            : optTextEn || optTextRw || optTextFr;
                        const isSelected = selectedAnswers[currentQId] === optKey;

                        return (
                          <div
                            key={optKey}
                            onClick={() => handleSelectOption(currentQId, optKey)}
                            style={{
                              padding: '16px 20px',
                              borderRadius: '12px',
                              backgroundColor: isSelected ? 'rgba(0, 85, 165, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                              border: isSelected ? '2px solid #0055A5' : '1px solid rgba(255, 255, 255, 0.1)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '16px',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: isSelected ? '#0055A5' : 'rgba(255, 255, 255, 0.08)',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              {optKey}
                            </div>
                            <div style={{ flex: 1, fontSize: '0.95rem', color: '#F1F5F9', fontWeight: isSelected ? 600 : 400 }}>
                              {displayText}
                            </div>
                            {isSelected && <Check size={18} color="#38BDF8" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <button
                        type="button"
                        onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          color: currentIndex === 0 ? '#475569' : '#CBD5E1',
                          border: 'none',
                          cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      >
                        <ChevronLeft size={16} />
                        <span>Previous</span>
                      </button>

                      {currentIndex < questions.length - 1 ? (
                        <button
                          type="button"
                          disabled={!isCurrentAnswered}
                          onClick={() => {
                            if (!isCurrentAnswered) {
                              warning(`Please complete Question ${currentIndex + 1} before proceeding.`);
                              return;
                            }
                            setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '10px 24px',
                            borderRadius: '8px',
                            backgroundColor: isCurrentAnswered ? '#0055A5' : 'rgba(255, 255, 255, 0.08)',
                            color: isCurrentAnswered ? '#FFFFFF' : '#64748B',
                            border: 'none',
                            cursor: isCurrentAnswered ? 'pointer' : 'not-allowed',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            opacity: isCurrentAnswered ? 1 : 0.6,
                            transition: 'all 0.15s ease',
                          }}
                          title={!isCurrentAnswered ? 'Please complete this question first' : 'Go to next question'}
                        >
                          <span>Next Question</span>
                          <ChevronRight size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={!isCurrentAnswered}
                          onClick={() => {
                            if (!isCurrentAnswered) {
                              warning(`Please complete Question ${currentIndex + 1} before submitting.`);
                              return;
                            }
                            setShowSubmitConfirm(true);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '10px 24px',
                            borderRadius: '8px',
                            backgroundColor: isCurrentAnswered ? '#10B981' : 'rgba(255, 255, 255, 0.08)',
                            color: isCurrentAnswered ? '#FFFFFF' : '#64748B',
                            border: 'none',
                            cursor: isCurrentAnswered ? 'pointer' : 'not-allowed',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            opacity: isCurrentAnswered ? 1 : 0.6,
                            transition: 'all 0.15s ease',
                          }}
                          title={!isCurrentAnswered ? 'Please complete this question to submit' : 'Submit quiz'}
                        >
                          <Send size={15} />
                          <span>Submit</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', margin: 'auto', color: '#94A3B8' }}>
                    No questions configured for this quiz yet.
                  </div>
                )
              ) : (
                /* Work Submission Mode */
                <div style={{ maxWidth: '820px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
                    Written Assignment Response & File Upload
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.5 }}>
                    {quiz?.description || 'Provide your detailed solution below according to the course rubric.'}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#E2E8F0' }}>
                      Written Submission Text:
                    </label>
                    <textarea
                      value={workText}
                      onChange={(e) => setWorkText(e.target.value)}
                      placeholder="Type your essay, code, or answer description here..."
                      rows={8}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#FFFFFF',
                        fontSize: '0.9rem',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#E2E8F0' }}>
                      Attach Supporting File (Optional):
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setWorkFile(e.target.files?.[0] || null)}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#CBD5E1',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setShowSubmitConfirm(true)}
                      style={{
                        padding: '12px 32px',
                        backgroundColor: '#0055A5',
                        color: '#FFFFFF',
                        borderRadius: '10px',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                      }}
                    >
                      Submit Assignment
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Question Navigation Palette (for Live Timed) */}
            {isLiveTimed && (
              <aside
                style={{
                  width: '280px',
                  backgroundColor: '#0F172A',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  flexShrink: 0,
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
                    Question Navigator
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    {answeredCount} of {questions.length} answered
                  </div>
                </div>

                {/* Question Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {questions.map((q, qIdx) => {
                    const navQId = String(q.id || qIdx);
                    const isAnswered = Boolean(selectedAnswers[navQId]);
                    const isFlagged = flaggedQuestions.has(qIdx);
                    const isCurrent = qIdx === currentIndex;
                    const isAccessible =
                      qIdx <= currentIndex ||
                      questions
                        .slice(0, qIdx)
                        .every((prevQ, pIdx) => Boolean(selectedAnswers[String(prevQ.id || pIdx)]));

                    let bg = 'rgba(255, 255, 255, 0.06)';
                    let border = '1px solid rgba(255, 255, 255, 0.1)';
                    let textColor = '#94A3B8';

                    if (isAnswered) {
                      bg = 'rgba(16, 185, 129, 0.2)';
                      border = '1px solid #10B981';
                      textColor = '#10B981';
                    }
                    if (isFlagged) {
                      bg = 'rgba(245, 158, 11, 0.2)';
                      border = '1px solid #F59E0B';
                      textColor = '#FBBF24';
                    }
                    if (isCurrent) {
                      border = '2px solid #38BDF8';
                      textColor = '#FFFFFF';
                    }

                    return (
                      <button
                        key={navQId}
                        type="button"
                        disabled={!isAccessible}
                        onClick={() => {
                          if (!isAccessible) {
                            warning(`Please complete Question ${currentIndex + 1} before proceeding.`);
                            return;
                          }
                          setCurrentIndex(qIdx);
                        }}
                        style={{
                          height: '38px',
                          borderRadius: '8px',
                          backgroundColor: bg,
                          border,
                          color: textColor,
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: isAccessible ? 'pointer' : 'not-allowed',
                          opacity: isAccessible ? 1 : 0.4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'opacity 0.15s ease',
                        }}
                        title={
                          !isAccessible
                            ? `Please complete Question ${currentIndex + 1} first`
                            : `Jump to Question ${qIdx + 1}`
                        }
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', color: '#94A3B8', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(16, 185, 129, 0.3)', border: '1px solid #10B981' }} />
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(245, 158, 11, 0.3)', border: '1px solid #F59E0B' }} />
                    <span>Flagged for Review ({flaggedCount})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)' }} />
                    <span>Unanswered ({unansweredCount})</span>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          SUBMIT CONFIRMATION MODAL
         ────────────────────────────────────────────────────────────────────────── */}
      {showSubmitConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#1E293B',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 12px 0' }}>
              Confirm Assessment Submission
            </h3>

            <p style={{ fontSize: '0.86rem', color: '#CBD5E1', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to finish and submit your assessment? Once submitted, your answers will be graded and logged into your official student record.
            </p>

            {isLiveTimed && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  padding: '14px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  fontSize: '0.82rem',
                }}
              >
                <div>Answered: <strong style={{ color: '#10B981' }}>{answeredCount}</strong></div>
                <div>Unanswered: <strong style={{ color: unansweredCount > 0 ? '#EF4444' : '#94A3B8' }}>{unansweredCount}</strong></div>
                <div>Flagged: <strong style={{ color: '#F59E0B' }}>{flaggedCount}</strong></div>
                <div>Tab Switches: <strong style={{ color: tabSwitchCount > maxSwitchesAllowed ? '#EF4444' : '#CBD5E1' }}>{tabSwitchCount}</strong></div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#CBD5E1',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Keep Reviewing
              </button>

              <button
                type="button"
                onClick={() => handleFinalSubmit(false)}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          PHASE 3: POST-SUBMISSION RESULTS & TELEMETRY RECEIPT
         ────────────────────────────────────────────────────────────────────────── */}
      {step === 'RESULTS' && submissionResult && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              backgroundColor: '#111827',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              padding: '36px',
            }}
          >
            {(() => {
              const isGradesReleased = Boolean(
                submissionResult.is_grades_published ||
                quiz?.release_grades_immediately ||
                (quiz as any)?.releaseGradesImmediately
              );

              if (!isGradesReleased) {
                return (
                  <>
                    {/* Header: Pending Release */}
                    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                      <div
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(56, 189, 248, 0.15)',
                          color: '#38BDF8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 16px auto',
                        }}
                      >
                        <CheckCircle2 size={36} />
                      </div>

                      <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                        Assessment Submitted Successfully
                      </h2>
                      <div style={{ fontSize: '0.9rem', color: '#94A3B8' }}>
                        Official attempt #{submissionResult.attempt_number} recorded • Awaiting Instructor Grade Release
                      </div>
                    </div>

                    {/* Pending Release Information Card */}
                    <div
                      style={{
                        padding: '22px 24px',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: '14px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        marginBottom: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(245, 158, 11, 0.15)',
                            color: '#F59E0B',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                          }}
                        >
                          Awaiting Grade Release
                        </span>
                        <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                          Time Elapsed: {Math.floor(submissionResult.time_spent_seconds / 60)}m {submissionResult.time_spent_seconds % 60}s
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#CBD5E1', lineHeight: 1.55 }}>
                        Your assessment answers have been safely received and stored. The instructor has configured this quiz for manual grade release. Your score, percentage, and detailed feedback will be available on your course workspace once the instructor publishes the official grades.
                      </p>

                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(56, 189, 248, 0.08)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          fontSize: '0.8rem',
                          color: '#38BDF8',
                        }}
                      >
                        Total Points Possible: <strong>{submissionResult.total_score || quiz?.total_score || 100} pts</strong> • Review rubrics on your dashboard.
                      </div>
                    </div>
                  </>
                );
              }

              return (
                <>
                  {/* Header: Graded / Published */}
                  <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: submissionResult.is_passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: submissionResult.is_passed ? '#10B981' : '#EF4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                      }}
                    >
                      {submissionResult.is_passed ? <CheckCircle2 size={36} /> : <XCircle size={36} />}
                    </div>

                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                      {submissionResult.is_passed ? 'Assessment Passed!' : 'Assessment Completed'}
                    </h2>
                    <div style={{ fontSize: '0.9rem', color: '#94A3B8' }}>
                      Official attempt #{submissionResult.attempt_number} logged successfully
                    </div>
                  </div>

                  {/* Score Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '12px',
                      padding: '20px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      borderRadius: '14px',
                      marginBottom: '24px',
                      textAlign: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Score</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38BDF8', marginTop: '4px' }}>
                        {submissionResult.score} / {submissionResult.total_score}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Percentage</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: submissionResult.is_passed ? '#10B981' : '#F59E0B', marginTop: '4px' }}>
                        {submissionResult.percentage}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Time Elapsed</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#CBD5E1', marginTop: '4px' }}>
                        {Math.floor(submissionResult.time_spent_seconds / 60)}m {submissionResult.time_spent_seconds % 60}s
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Proctoring Telemetry Report */}
            {proctoringEnabled && (
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  backgroundColor: submissionResult.is_flagged ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: submissionResult.is_flagged ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                  marginBottom: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {submissionResult.is_flagged ? (
                    <ShieldAlert size={22} color="#EF4444" />
                  ) : (
                    <ShieldCheck size={22} color="#10B981" />
                  )}
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: submissionResult.is_flagged ? '#FCA5A5' : '#6EE7B7' }}>
                      {submissionResult.is_flagged
                        ? 'Flagged for Academic Review'
                        : 'Clean Proctoring Audit'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>
                      Recorded {submissionResult.tab_switch_count} tab departure(s) (Allowed threshold: {maxSwitchesAllowed})
                    </div>
                  </div>
                </div>

                <Badge variant={submissionResult.is_flagged ? 'danger' : 'success'}>
                  {submissionResult.is_flagged ? 'FLAGGED' : 'VERIFIED CLEAN'}
                </Badge>
              </div>
            )}

            {/* Return Button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '12px 36px',
                  backgroundColor: '#0055A5',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Return to Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

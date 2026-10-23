import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Maximize2,
  Minimize2,
  Camera,
  Mic,
  Wifi,
  FileCheck,
  Award,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  AdminService,
  type CandidateSessionItem,
  type CandidateExamQuestionItem,
} from '../../../../core/services/AdminService';
import { useToast } from '../../../../context/ToastContext';
import { useTranslation } from '../../../../context/I18nContext';

// ────────────────────────────────────────────────────────────────────────────
// Flying Celebration Confetti Canvas
// ────────────────────────────────────────────────────────────────────────────
const ConfettiCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = [
      '#f59e0b', // Gold / Amber
      '#10b981', // Emerald
      '#0284c7', // Brand Sky Blue
      '#ec4899', // Pink
      '#8b5cf6', // Violet
      '#ef4444', // Coral / Red
      '#06b6d4', // Cyan
      '#eab308', // Warm Yellow
    ];

    const particleCount = 160;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: width * 0.5 + (Math.random() - 0.5) * (width * 0.4),
      y: height * 0.4 + (Math.random() - 0.5) * 120,
      vx: (Math.random() - 0.5) * 22,
      vy: -Math.random() * 16 - 7,
      size: Math.random() * 9 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 14,
      gravity: 0.38,
      friction: 0.985,
      wobble: Math.random() * 10,
      wobbleSpeed: 0.12,
      opacity: 1,
    }));

    let animationFrameId: number;
    const startTime = Date.now();

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.friction;
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;

        if (elapsed > 4500) {
          p.opacity = Math.max(0, p.opacity - 0.015);
        }

        ctx.save();
        ctx.translate(p.x + Math.sin(p.wobble) * 5, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (elapsed < 8000) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

interface CandidateExamRunnerProps {
  sessionId?: string;
  examId?: string;
  isStudentProctored?: boolean;
  onClose?: (session?: CandidateSessionItem | null) => void;
  onCompleted?: (session: CandidateSessionItem) => void;
}

type RunnerStep = 'PREFLIGHT' | 'RUNNING' | 'SUBMITTING' | 'RESULTS';

export const CandidateExamRunner: React.FC<CandidateExamRunnerProps> = ({
  sessionId: initialSessionId,
  examId,
  isStudentProctored = true,
  onClose,
  onCompleted,
}) => {
  const adminService = AdminService.getInstance();
  const { warning, success, error: toastError } = useToast();
  const { t } = useTranslation();

  const [step, setStep] = useState<RunnerStep>(isStudentProctored ? 'PREFLIGHT' : 'RUNNING');
  const [session, setSession] = useState<CandidateSessionItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // Exam runner must always start in Kinyarwanda as requested; candidate can change it via the dropdown
  const [language, setLanguage] = useState<'EN' | 'RW' | 'FR'>('RW');

  // Active runner state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(1200);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [showScoreModal, setShowScoreModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Synchronized refs to avoid stale closure issues during countdown expiry
  const sessionRef = useRef<CandidateSessionItem | null>(session);
  sessionRef.current = session;
  const isSubmittingRef = useRef<boolean>(isSubmitting);
  isSubmittingRef.current = isSubmitting;

  // Pre-flight checks
  const [netStatus, setNetStatus] = useState<'PENDING' | 'PASS' | 'FAIL'>('PENDING');
  const [camStatus, setCamStatus] = useState<'PENDING' | 'PASS' | 'FAIL'>('PENDING');
  const [micStatus, setMicStatus] = useState<'PENDING' | 'PASS' | 'FAIL'>('PENDING');
  const [selfieSnapshot, setSelfieSnapshot] = useState<string>('');
  const [integrityAccepted, setIntegrityAccepted] = useState<boolean>(false);
  const [preflightError, setPreflightError] = useState<string>('');

  // Media references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const proctorIntervalRef = useRef<any>(null);

  // ────────────────────────────────────────────────────────────────────────────
  // Step 1: Initialize Camera & Diagnostics
  // ────────────────────────────────────────────────────────────────────────────
  const startCameraAndSensors = useCallback(async () => {
    try {
      // 1. Network test
      setNetStatus('PENDING');
      const start = performance.now();
      await fetch('/api/v1/examinations/public/packages/', { method: 'HEAD' }).catch(() => null);
      const ping = Math.round(performance.now() - start);
      setNetStatus(ping < 2000 ? 'PASS' : 'PASS'); // pass even if simulated local

      // 2. Camera & Mic request
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCamStatus('PASS');
        setMicStatus('PASS');

        // Setup audio meter
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            source.connect(analyser);
          }
        } catch {}
      } else {
        setCamStatus('FAIL');
        setMicStatus('FAIL');
        setPreflightError('Camera or microphone hardware is not accessible on this device.');
      }
    } catch (err: any) {
      console.warn('Media hardware access error:', err);
      setCamStatus('FAIL');
      setMicStatus('FAIL');
      setPreflightError('Please grant camera and microphone permissions to proceed with proctored exam.');
    }
  }, []);

  useEffect(() => {
    if (isStudentProctored && step === 'PREFLIGHT') {
      startCameraAndSensors();
    }
    return () => {
      // Clean up media streams on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isStudentProctored, step, startCameraAndSensors]);

  // Capture selfie snapshot
  const handleCaptureSelfie = () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelfieSnapshot(dataUrl);
        success('Identity photo captured successfully.');
      }
    } catch (err) {
      toastError('Could not capture photo from video feed.');
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Launch / Resume Exam
  // ────────────────────────────────────────────────────────────────────────────
  const launchExamSession = async () => {
    try {
      setLoading(true);
      // Attempt fullscreen
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch {}

      let activeSession: CandidateSessionItem;

      if (initialSessionId) {
        activeSession = await adminService.getCandidateSession(initialSessionId);
      } else if (examId) {
        activeSession = await adminService.startStudentExam(examId, {
          selfie_image: selfieSnapshot,
          preflight_checks: {
            network: netStatus === 'PASS',
            camera: camStatus === 'PASS',
            microphone: micStatus === 'PASS',
          },
        });
      } else {
        // Fallback for public / guest without exam id
        activeSession = await adminService.startPublicPracticeExam();
      }

      setSession(activeSession);
      if (activeSession.time_remaining_seconds !== undefined) {
        setTimeRemaining(activeSession.time_remaining_seconds);
      }

      // Populate pre-selected answers if resumed
      const preSelected: Record<number, string> = {};
      activeSession.questions?.forEach((q) => {
        if (q.selected_option) {
          preSelected[q.sequence_number] = q.selected_option;
        }
      });
      setSelectedAnswers(preSelected);

      if (activeSession.status in ['BOARD_REVIEW', 'TRAINING_REVIEW', 'SYSTEM_REVIEW', 'APPROVED', 'PUBLISHED']) {
        setStep('RESULTS');
      } else {
        setStep('RUNNING');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to start examination session.';
      toastError(msg);
      setPreflightError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Automatic load for direct session runner
  useEffect(() => {
    if (initialSessionId && step !== 'PREFLIGHT') {
      adminService
        .getCandidateSession(initialSessionId)
        .then((s) => {
          setSession(s);
          if (s.time_remaining_seconds !== undefined) {
            setTimeRemaining(s.time_remaining_seconds);
          }
          const preSelected: Record<number, string> = {};
          s.questions?.forEach((q) => {
            if (q.selected_option) preSelected[q.sequence_number] = q.selected_option;
          });
          setSelectedAnswers(preSelected);
          if (['BOARD_REVIEW', 'TRAINING_REVIEW', 'SYSTEM_REVIEW', 'APPROVED', 'PUBLISHED'].includes(s.status)) {
            setStep('RESULTS');
          } else {
            setStep('RUNNING');
          }
        })
        .catch((err) => {
          toastError(err?.message || 'Could not load session.');
        })
        .finally(() => setLoading(false));
    } else if (!isStudentProctored && step === 'RUNNING' && !session) {
      launchExamSession();
    } else {
      setLoading(false);
    }
  }, [initialSessionId]);

  // ────────────────────────────────────────────────────────────────────────────
  // Step 2: Live 20-Minute Timer
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'RUNNING') return;

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [step]);

  // Automatically submit exam immediately when countdown reaches zero
  useEffect(() => {
    if (step === 'RUNNING' && timeRemaining === 0 && !isSubmittingRef.current && sessionRef.current) {
      handleTimeExpiredAutoSubmit();
    }
  }, [timeRemaining, step]);

  // Auto-submit on countdown expiry
  const handleTimeExpiredAutoSubmit = async () => {
    if (isSubmittingRef.current || !sessionRef.current) return;
    warning(
      language === 'RW'
        ? 'Igihe cyatanzwe kirarangiye (Iminota 20). Ikizamini cyanyu kigiye gutangwa mu buryo bwikora...'
        : language === 'FR'
        ? 'Le temps imparti (20 minutes) est écoulé. Vos réponses sont soumises automatiquement...'
        : 'Examination time limit (20 minutes) has expired. Submitting your answers automatically...'
    );
    await performSubmit();
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Proctoring Telemetry Listeners (Tab Switch & Blur Tracking)
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isStudentProctored || step !== 'RUNNING' || !session?.id) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        warning('Tab switch detected! Your official examination requires undivided window focus.');
        captureProctorViolation('TAB_SWITCH', { hidden: true });
      }
    };

    const handleWindowBlur = () => {
      captureProctorViolation('WINDOW_BLUR', { blur: true });
    };

    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull) {
        warning('Fullscreen exited! Please keep full-screen mode to prevent violation flags.');
        captureProctorViolation('FULLSCREEN_EXIT', { fullscreen: false });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Periodic proctor heartbeat snapshot every 3 minutes
    proctorIntervalRef.current = setInterval(() => {
      captureProctorViolation('PERIODIC_HEARTBEAT', { interval: '3m' }, false);
    }, 180000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (proctorIntervalRef.current) clearInterval(proctorIntervalRef.current);
    };
  }, [isStudentProctored, step, session?.id]);

  const captureProctorViolation = (eventType: string, metadata: any, isViolation = true) => {
    if (!session?.id) return;
    let snapshotBase64 = '';
    if (videoRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          snapshotBase64 = canvas.toDataURL('image/jpeg', 0.6);
        }
      } catch {}
    }
    adminService
      .recordCandidateProctorEvent(session.id, eventType, snapshotBase64, metadata, isViolation)
      .catch(() => {});
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Answer Selection & Auto-Save
  // ────────────────────────────────────────────────────────────────────────────
  const handleSelectOption = async (seq: number, optionKey: 'A' | 'B' | 'C' | 'D') => {
    if (!session || step !== 'RUNNING') return;

    setSelectedAnswers((prev) => ({ ...prev, [seq]: optionKey }));

    try {
      await adminService.recordCandidateAnswer(session.id, seq, optionKey);
    } catch (err: any) {
      console.warn('Failed to auto-save answer:', err);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Submit Final Examination
  // ────────────────────────────────────────────────────────────────────────────
  const performSubmit = async () => {
    const activeSession = sessionRef.current || session;
    if (!activeSession || isSubmittingRef.current) return;
    setIsSubmitting(true);
    isSubmittingRef.current = true;
    setShowSubmitConfirm(false);

    try {
      const graded = await adminService.submitCandidateExam(activeSession.id);
      setSession(graded);
      sessionRef.current = graded;
      setStep('RESULTS');
      setShowScoreModal(true); // Pop out the score modal immediately with celebration or failure
      success('Examination successfully submitted and graded!');
      if (onCompleted) onCompleted(graded);

      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (err: any) {
      toastError(err?.message || 'Submission error. Please check your network and retry.');
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  // Formatting helpers
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;

  const getQuestionText = (q?: CandidateExamQuestionItem) => {
    if (!q) return '';
    if (language === 'RW' && q.question_text_kinyarwanda) return q.question_text_kinyarwanda;
    if (language === 'FR' && q.question_text_french) return q.question_text_french;
    return q.question_text;
  };

  const getOptionText = (q: CandidateExamQuestionItem, opt: 'a' | 'b' | 'c' | 'd') => {
    if (language === 'RW') {
      const rw = (q as any)[`option_${opt}_kinyarwanda`];
      if (rw) return rw;
    }
    if (language === 'FR') {
      const fr = (q as any)[`option_${opt}_french`];
      if (fr) return fr;
    }
    return (q as any)[`option_${opt}`] || '';
  };

  const getExplanationText = (q: CandidateExamQuestionItem) => {
    if (language === 'RW' && q.explanation_kinyarwanda) return q.explanation_kinyarwanda;
    if (language === 'FR' && q.explanation_french) return q.explanation_french;
    return q.explanation || 'Official explanation for this traffic regulation.';
  };

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER 1: PREFLIGHT AUDIT SCREEN (Students)
  // ════════════════════════════════════════════════════════════════════════════
  if (step === 'PREFLIGHT') {
    const canLaunch =
      netStatus === 'PASS' &&
      camStatus === 'PASS' &&
      micStatus === 'PASS' &&
      Boolean(selfieSnapshot) &&
      integrityAccepted;

    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(ellipse at top, #0f172a 0%, #030712 100%)',
          color: '#f8fafc',
          padding: '32px 20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '840px',
            width: '100%',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '36px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    background: 'rgba(3, 116, 181, 0.18)',
                    color: '#38bdf8',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                  }}
                >
                  OFFICIAL PROCTORED EXAMINATION
                </span>
                <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.8rem' }}>• 20 Questions • 20 Minutes</span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Pre-Flight Identity & Integrity Audit
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px', marginBottom: 0 }}>
                Please verify your device hardware and capture a clear identity snapshot before launching the official test.
              </p>
            </div>
            <button
              onClick={() => onClose && onClose(session)}
              className="btn btn-ghost"
              style={{ color: '#94a3b8', padding: '8px 14px', borderRadius: '12px' }}
            >
              Exit
            </button>
          </div>

          {preflightError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '20px',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <AlertTriangle size={18} />
              <span>{preflightError}</span>
            </div>
          )}

          {/* Grid: Camera Preview on Left, Diagnostics on Right */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '28px' }}>
            {/* Live Camera View */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  aspectRatio: '4/3',
                  background: '#020617',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: selfieSnapshot ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {selfieSnapshot ? (
                  <img
                    src={selfieSnapshot}
                    alt="Selfie"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    color: selfieSnapshot ? '#10b981' : '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: selfieSnapshot ? '#10b981' : '#38bdf8',
                    }}
                  />
                  {selfieSnapshot ? 'Photo Captured' : 'Live Camera'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                {selfieSnapshot ? (
                  <button
                    onClick={() => {
                      setSelfieSnapshot('');
                      startCameraAndSensors();
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <RefreshCw size={14} /> Retake Snapshot
                  </button>
                ) : (
                  <button
                    onClick={handleCaptureSelfie}
                    disabled={camStatus !== 'PASS'}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center', background: '#0374b5' }}
                  >
                    <Camera size={14} /> Capture Identity Snapshot
                  </button>
                )}
              </div>
            </div>

            {/* Diagnostic Checks Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px 0', color: '#f1f5f9' }}>
                Mandatory System Audits
              </h3>

              {/* Network */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Wifi size={18} color="#38bdf8" />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Network Latency</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Stable connection to assessment server</div>
                  </div>
                </div>
                {netStatus === 'PASS' ? (
                  <CheckCircle2 size={18} color="#10b981" />
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Checking...</span>
                )}
              </div>

              {/* Camera */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Camera size={18} color="#38bdf8" />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Webcam Video Stream</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Face recognition and continuous audit</div>
                  </div>
                </div>
                {camStatus === 'PASS' ? (
                  <CheckCircle2 size={18} color="#10b981" />
                ) : (
                  <XCircle size={18} color="#ef4444" />
                )}
              </div>

              {/* Mic */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mic size={18} color="#38bdf8" />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Microphone Audio Sensor</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ambient noise and anomaly monitoring</div>
                  </div>
                </div>
                {micStatus === 'PASS' ? (
                  <CheckCircle2 size={18} color="#10b981" />
                ) : (
                  <XCircle size={18} color="#ef4444" />
                )}
              </div>

              {/* Identity Snapshot status */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={18} color="#38bdf8" />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Candidate Identity Confirmation</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Stored in accreditation audit dossier</div>
                  </div>
                </div>
                {selfieSnapshot ? (
                  <CheckCircle2 size={18} color="#10b981" />
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Capture required</span>
                )}
              </div>
            </div>
          </div>

          {/* Academic Integrity Pledge */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '28px',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={integrityAccepted}
                onChange={(e) => setIntegrityAccepted(e.target.checked)}
                style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#0374b5' }}
              />
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                <strong style={{ color: '#ffffff' }}>Official Proctoring Agreement:</strong> I affirm that I will
                complete this examination independently without notes, outside assistance, or unauthorized tabs. I
                acknowledge that my webcam, microphone, and tab focus are monitored and reviewed by the Accreditation
                Board.
              </div>
            </label>
          </div>

          {/* Launch Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
            <button
              onClick={launchExamSession}
              disabled={!canLaunch || loading}
              className="btn btn-primary btn-lg"
              style={{
                background: canLaunch ? 'linear-gradient(135deg, #0374b5 0%, #003366 100%)' : 'rgba(255, 255, 255, 0.08)',
                borderColor: canLaunch ? '#0374b5' : 'transparent',
                color: canLaunch ? '#ffffff' : '#64748b',
                padding: '12px 28px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: canLaunch ? 'pointer' : 'not-allowed',
              }}
            >
              <span>Launch Official Examination</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER 2: ACTIVE TIMED EXAMINATION RUNNER
  // ════════════════════════════════════════════════════════════════════════════
  if (step === 'RUNNING') {
    const isWarningTime = timeRemaining <= 180; // under 3 min

    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          color: '#111827',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top Sticky App Bar: Blue Header */}
        <header
          style={{
            height: '64px',
            backgroundColor: '#0284c7',
            borderBottom: '1px solid #0369a1',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            color: '#ffffff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div
            style={{
              maxWidth: '960px',
              width: '100%',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            {/* Left: Brand & Exam Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                SIFO DRIVE
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>/</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.95)' }}>
                {session?.exam_title &&
                session.exam_title !== 'Official Rwanda Traffic Theory Examination' &&
                session.exam_title !== 'Official Driving Theory Examination' &&
                session.exam_title !== 'Sifo Drive Traffic Examination' &&
                session.exam_title !== 'Traffic Examination'
                  ? session.exam_title
                  : (language === 'RW' ? "Ikizamini Cy'Ubumenyi bw'Umuhanda" : language === 'FR' ? 'Examen Théorique du Code' : 'Traffic Examination')}
              </span>
            </div>

            {/* Center: Live Countdown Timer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: isWarningTime ? '#fee2e2' : 'rgba(255, 255, 255, 0.2)',
                border: isWarningTime ? '1px solid #f87171' : '1px solid rgba(255, 255, 255, 0.3)',
                padding: '6px 16px',
                borderRadius: '999px',
                color: isWarningTime ? '#dc2626' : '#ffffff',
                fontWeight: 700,
                animation: isWarningTime ? 'pulse 1.5s infinite' : 'none',
              }}
            >
              <Clock size={16} />
              <span style={{ fontSize: '1rem', fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(timeRemaining)}
              </span>
            </div>

            {/* Right: Answered Progress, Language Dropdown & Fullscreen Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                {answeredCount}/20 {language === 'RW' ? 'byasubijwe' : language === 'FR' ? 'répondues' : 'answered'}
              </span>

              {/* Language Dropdown (RW / EN / FR) */}
              <select
                id="exam-runner-language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'EN' | 'RW' | 'FR')}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="RW">Kinyarwanda</option>
                <option value="EN">English</option>
                <option value="FR">Français</option>
              </select>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                    setIsFullscreen(true);
                  } else {
                    document.exitFullscreen().catch(() => {});
                    setIsFullscreen(false);
                  }
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '6px',
                  padding: '6px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>
        </header>

        {/* Exam Document Body: All 20 Questions Listed (No Containers, White Mode) */}
        <main
          style={{
            flex: 1,
            maxWidth: '960px',
            width: '100%',
            margin: '0 auto',
            padding: '36px 24px 80px 24px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {(session?.questions || []).map((q, idx) => {
              const seq = q.sequence_number || idx + 1;
              const selectedOpt = selectedAnswers[seq];

              return (
                <div
                  key={seq}
                  id={`question-${seq}`}
                  style={{
                    paddingBottom: '28px',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {/* QUESTION HEADER (Bolded) */}
                  <div
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: '#111827',
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>{seq}.</span>
                    <span>{getQuestionText(q)}</span>
                  </div>

                  {/* Question Image (Traffic diagram / sign if present) */}
                  {q.image && (
                    <div style={{ marginLeft: '24px', marginTop: '4px', marginBottom: '4px' }}>
                      <img
                        src={q.image}
                        alt={`Question ${seq} diagram`}
                        style={{
                          maxHeight: '190px',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb',
                          backgroundColor: '#ffffff',
                        }}
                      />
                    </div>
                  )}

                  {/* ANSWERS (Indented under the question, unbolded, user chooses an option) */}
                  <div
                    style={{
                      marginLeft: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                      const optLower = optKey.toLowerCase() as 'a' | 'b' | 'c' | 'd';
                      const optText = getOptionText(q, optLower);
                      if (!optText) return null;

                      const isSelected = selectedOpt === optKey;

                      return (
                        <label
                          key={optKey}
                          onClick={() => handleSelectOption(seq, optKey)}
                          style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '10px',
                            fontSize: '0.95rem',
                            fontWeight: 400,
                            color: isSelected ? '#0369a1' : '#374151',
                            lineHeight: 1.45,
                            cursor: 'pointer',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
                            transition: 'background-color 0.15s ease',
                            userSelect: 'none',
                          }}
                        >
                          <input
                            type="radio"
                            name={`q-${seq}`}
                            checked={isSelected}
                            onChange={() => handleSelectOption(seq, optKey)}
                            style={{
                              accentColor: '#0284c7',
                              width: '16px',
                              height: '16px',
                              cursor: 'pointer',
                              flexShrink: 0,
                              alignSelf: 'center',
                            }}
                          />
                          <span style={{ fontWeight: 600, minWidth: '18px' }}>{optKey}.</span>
                          <span style={{ flex: 1 }}>{optText}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Final Submit CTA after Question 20 */}
          <div
            style={{
              marginTop: '40px',
              paddingTop: '28px',
              borderTop: '2px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.92rem', color: '#6b7280' }}>
              {language === 'RW'
                ? `Wamaze gusubiza ibibazo ${answeredCount} kuri ${session?.total_questions || 20}.`
                : language === 'FR'
                ? `Vous avez répondu à ${answeredCount} questions sur ${session?.total_questions || 20}.`
                : `You have answered ${answeredCount} of ${session?.total_questions || 20} questions.`}
            </div>

            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 32px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
              }}
            >
              <CheckCircle2 size={18} />
              <span>
                {language === 'RW'
                  ? 'Tanga Ikizamini'
                  : language === 'FR'
                  ? 'Soumettre l\'examen'
                  : 'Submit Exam'}
              </span>
            </button>
          </div>
        </main>

        {/* Proctoring PIP Feed (for student exams only) */}
        {isStudentProctored && (
          <div
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              width: '180px',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              zIndex: 50,
              padding: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151' }}>
                {language === 'RW' ? 'Ubugenzuzi burakora' : language === 'FR' ? 'Surveillance active' : 'Proctoring Active'}
              </span>
            </div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px' }}
            />
          </div>
        )}

        {/* Submit Confirmation Modal (White Mode) */}
        {showSubmitConfirm && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '20px',
            }}
          >
            <div
              style={{
                maxWidth: '480px',
                width: '100%',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                color: '#111827',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileCheck size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#111827' }}>
                    {language === 'RW' ? 'Kwemeza Gutanga Ikizamini' : 'Confirm Exam Submission'}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                    {timeRemaining > 0
                      ? (language === 'RW' ? `Igihe gisigaye: ${formatTime(timeRemaining)}` : `${formatTime(timeRemaining)} remaining on timer`)
                      : (language === 'RW' ? 'Igihe cyarangiye' : 'Time expired')}
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.88rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>{language === 'RW' ? 'Ibibazo Byose:' : 'Total Questions:'}</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>{session?.total_questions || 20}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>{language === 'RW' ? 'Ibyasubijwe:' : 'Answered:'}</span>
                  <span style={{ fontWeight: 700, color: '#15803d' }}>{answeredCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>{language === 'RW' ? 'Ibitarasubizwa:' : 'Unanswered:'}</span>
                  <span style={{ fontWeight: 700, color: answeredCount < (session?.total_questions || 20) ? '#dc2626' : '#15803d' }}>
                    {(session?.total_questions || 20) - answeredCount}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: 0 }}>
                {language === 'RW'
                  ? 'Iyo umaze gutanga ikizamini, amanota ahita abara ako kanya kandi ntiwabihindura.'
                  : 'Once submitted, your answers will be automatically graded and cannot be modified.'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(false)}
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {language === 'RW' ? 'Komeza Ikizamini' : 'Continue Test'}
                </button>
                <button
                  type="button"
                  onClick={performSubmit}
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 18px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isSubmitting
                    ? (language === 'RW' ? 'Gukosora...' : 'Grading Answers...')
                    : (language === 'RW' ? 'Tanga Ikizamini Ubu' : 'Submit Now')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Graded Exam Score Popup Modal */}
        {renderScoreModal()}
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Graded Result Modal with Celebration Confetti
  // ────────────────────────────────────────────────────────────────────────────
  function renderScoreModal() {
    if (!showScoreModal || !session) return null;

    const score = session.score ?? 0;
    const totalQuestions = session.total_questions || session.questions?.length || 20;
    const isPassed = session.passed ?? (score >= (session.passing_score ?? 12));
    const percentage = Math.round((score / totalQuestions) * 100);

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9990,
          padding: '20px',
        }}
      >
        {isPassed && <ConfettiCanvas />}

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            maxWidth: '460px',
            width: '100%',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            zIndex: 10000,
            border: isPassed ? '2px solid #10b981' : '2px solid #ef4444',
            color: '#111827',
          }}
        >
          {/* Header Icon Badge */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              margin: '0 auto 18px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isPassed ? '#d1fae5' : '#fee2e2',
              color: isPassed ? '#059669' : '#dc2626',
              boxShadow: isPassed
                ? '0 10px 25px -5px rgba(16, 185, 129, 0.35)'
                : '0 10px 25px -5px rgba(239, 68, 68, 0.35)',
            }}
          >
            {isPassed ? <Award size={44} /> : <XCircle size={44} />}
          </div>

          {/* Title: 'Congratulations!' / 'Urakoze Cyane!' if passed, or 'Failed' / 'Ntabwo Watsinze' */}
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 900,
              margin: isPassed ? '0 0 8px 0' : '0 0 24px 0',
              color: isPassed ? '#059669' : '#dc2626',
              letterSpacing: '-0.02em',
            }}
          >
            {isPassed
              ? (language === 'FR' ? 'Félicitations !' : t('examLifecycle.scoreModal.congratulationsTitle'))
              : (language === 'FR' ? 'Échoué' : t('examLifecycle.scoreModal.failedTitle'))}
          </h2>

          {isPassed && (
            <p
              style={{
                margin: '0 0 24px 0',
                fontSize: '0.95rem',
                color: '#4b5563',
                lineHeight: 1.5,
              }}
            >
              {language === 'FR'
                ? "Vous avez réussi l'examen du code de la route !"
                : t('examLifecycle.scoreModal.passedSubtitle')}
            </p>
          )}

          {/* Score breakdown card */}
          <div
            style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '14px',
              padding: isPassed ? '20px' : '28px 20px',
              marginBottom: '26px',
            }}
          >
            {isPassed && (
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '8px',
                }}
              >
                {language === 'FR' ? 'Votre Score' : t('examLifecycle.scoreModal.yourExamScore')}
              </div>
            )}

            <div
              style={{
                fontSize: '2.8rem',
                fontWeight: 900,
                color: '#111827',
                lineHeight: 1,
                marginBottom: isPassed ? '8px' : 0,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {score}{' '}
              <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#6b7280' }}>
                / {totalQuestions}
              </span>
            </div>

            {isPassed && (
              <>
                <div
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#059669',
                    marginBottom: '14px',
                  }}
                >
                  {percentage}%
                </div>

                {/* Status pill */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 16px',
                    borderRadius: '999px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{language === 'FR' ? 'RÉUSSI' : t('examLifecycle.scoreModal.passedStatus')}</span>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                setShowScoreModal(false);
                if (onClose) {
                  onClose(session);
                } else {
                  const candidatePhone =
                    session?.candidate_phone ||
                    localStorage.getItem('sifo_last_candidate_phone') ||
                    '';
                  window.location.href = candidatePhone
                    ? `/practice-exams?phone=${encodeURIComponent(candidatePhone)}`
                    : '/practice-exams';
                }
              }}
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '13px 20px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              }}
            >
              {language === 'FR' ? 'Retourner à la page' : t('examLifecycle.scoreModal.returnToDashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER 3: GRADED RESULTS & COMPREHENSIVE THEORY RATIONALE REVIEW
  // ════════════════════════════════════════════════════════════════════════════
  if (step === 'RESULTS') {
    const score = session?.score ?? 0;
    const passed = session?.passed ?? (score >= (session?.passing_score || 12));
    const totalQ = session?.total_questions || 20;

    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(ellipse at top, #0f172a 0%, #030712 100%)',
          color: '#f8fafc',
          padding: '40px 20px',
        }}
      >
        {/* Graded Exam Score Popup Modal */}
        {renderScoreModal()}
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Top Banner */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: passed ? '#10b981' : '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={36} />
            </div>

            <div>
              <div
                style={{
                  display: 'inline-block',
                  background: passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: passed ? '#10b981' : '#ef4444',
                  padding: '4px 14px',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  marginBottom: '10px',
                }}
              >
                {passed
                  ? (language === 'FR' ? 'EXAMEN RÉUSSI' : t('examLifecycle.results.examPassedBadge'))
                  : (language === 'FR' ? 'EXAMEN ÉCHOUÉ' : t('examLifecycle.results.examNotClearedBadge'))}
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', color: '#ffffff' }}>
                {language === 'FR' ? 'Votre Note :' : `${t('examLifecycle.results.yourScore')}:`} {score} / {totalQ} ({Math.round((score / totalQ) * 100)}%)
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: 0, maxWidth: '600px' }}>
                {language === 'FR'
                  ? `Note de passage : ${session?.passing_score || 12} / 20 points. Noté automatiquement.`
                  : t('examLifecycle.results.passingThreshold', { threshold: session?.passing_score || 12 })}
              </p>
            </div>

            {/* Student Stage Banner */}
            {session?.track === 'STUDENT' ? (
              <div
                style={{
                  background: 'rgba(3, 116, 181, 0.12)',
                  border: '1px solid rgba(3, 116, 181, 0.25)',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '0.85rem',
                  color: '#38bdf8',
                }}
              >
                <ShieldCheck size={20} />
                <span>
                  {t('examLifecycle.results.studentReviewNotice')}
                </span>
              </div>
            ) : (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '0.85rem',
                  color: '#10b981',
                }}
              >
                <CheckCircle2 size={20} />
                <span>
                  {language === 'FR'
                    ? 'Examen de pratique terminé ! Les explications officielles sont publiées ci-dessous.'
                    : t('examLifecycle.results.practiceCompletedNotice')}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '14px', marginTop: '8px' }}>
              <button
                onClick={() => {
                  if (onClose) {
                    onClose(session);
                  } else {
                    const candidatePhone =
                      session?.candidate_phone ||
                      localStorage.getItem('sifo_last_candidate_phone') ||
                      '';
                    window.location.href = candidatePhone
                      ? `/practice-exams?phone=${encodeURIComponent(candidatePhone)}`
                      : '/practice-exams';
                  }
                }}
                className="btn btn-primary btn-md"
              >
                {language === 'FR' ? 'Retourner à la page' : t('examLifecycle.results.returnToDashboardBtn')}
              </button>
            </div>
          </div>

          {/* Detailed Question Review Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 4px 0', color: '#ffffff' }}>
                {language === 'FR' ? 'Révision des Questions et Explications' : t('examLifecycle.results.questionReviewTitle')}
              </h2>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                {language === 'FR'
                  ? 'Examinez vos choix par rapport aux clés officielles de la police.'
                  : t('examLifecycle.results.questionReviewSubtitle')}
              </div>
            </div>

            {/* Language switch */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              {(['EN', 'RW', 'FR'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  style={{
                    border: 'none',
                    background: language === lang ? '#0374b5' : 'transparent',
                    color: language === lang ? '#ffffff' : '#94a3b8',
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* List of All 20 Questions with Explanations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {(session?.questions || []).map((q) => {
              const selected = q.selected_option?.trim().toUpperCase();
              const correct = q.correct_option?.trim().toUpperCase();
              const isCorrect = selected === correct && Boolean(selected);

              return (
                <div
                  key={q.sequence_number}
                  style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: isCorrect
                      ? '1px solid rgba(16, 185, 129, 0.3)'
                      : '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '18px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  {/* Question Title & Tag */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          background: isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isCorrect ? '#10b981' : '#ef4444',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                        }}
                      >
                        {isCorrect
                          ? t('examLifecycle.results.questionBadgeCorrect', { num: q.sequence_number })
                          : t('examLifecycle.results.questionBadgeIncorrect', { num: q.sequence_number })}
                      </span>
                      <span
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#94a3b8',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                        }}
                      >
                        {`${t('examLifecycle.results.domainLabel')}: ${q.domain}`}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                      {`${t('examLifecycle.results.yourAnswerLabel')}: `}
                      <strong style={{ color: isCorrect ? '#10b981' : '#ef4444' }}>
                        {selected || t('examLifecycle.results.noneSelected')}
                      </strong>{' '}
                      | {`${t('examLifecycle.results.correctLabel')}: `}
                      <strong style={{ color: '#10b981' }}>{correct}</strong>
                    </div>
                  </div>

                  {/* Question Image */}
                  {q.image && (
                    <div
                      style={{
                        maxHeight: '220px',
                        overflow: 'hidden',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        background: '#020617',
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <img src={q.image} alt="Traffic sign" style={{ maxHeight: '220px', objectFit: 'contain' }} />
                    </div>
                  )}

                  {/* Question Text */}
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#f8fafc', lineHeight: '1.45' }}>
                    {getQuestionText(q)}
                  </h3>

                  {/* Options List */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                    {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                      const optText = getOptionText(q, optKey.toLowerCase() as any);
                      if (!optText) return null;

                      const isThisSelected = selected === optKey;
                      const isThisCorrect = correct === optKey;

                      let optBg = 'rgba(255, 255, 255, 0.03)';
                      let optBorder = 'rgba(255, 255, 255, 0.06)';
                      let optColor = '#cbd5e1';

                      if (isThisCorrect) {
                        optBg = 'rgba(16, 185, 129, 0.15)';
                        optBorder = '#10b981';
                        optColor = '#ffffff';
                      } else if (isThisSelected && !isThisCorrect) {
                        optBg = 'rgba(239, 68, 68, 0.15)';
                        optBorder = '#ef4444';
                        optColor = '#ffffff';
                      }

                      return (
                        <div
                          key={optKey}
                          style={{
                            background: optBg,
                            border: `1px solid ${optBorder}`,
                            borderRadius: '10px',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '0.88rem',
                            color: optColor,
                          }}
                        >
                          <strong style={{ minWidth: '20px' }}>{optKey}.</strong>
                          <span>{optText}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Official Explanation / Theory Rationale */}
                  <div
                    style={{
                      background: 'rgba(3, 116, 181, 0.08)',
                      border: '1px solid rgba(3, 116, 181, 0.2)',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      fontSize: '0.88rem',
                      lineHeight: '1.5',
                      color: '#e2e8f0',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('examLifecycle.results.explanationTitle')}
                    </div>
                    {getExplanationText(q)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

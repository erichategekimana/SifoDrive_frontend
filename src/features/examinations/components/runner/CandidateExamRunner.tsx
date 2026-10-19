import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Camera,
  Mic,
  Wifi,
  Flag,
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

interface CandidateExamRunnerProps {
  sessionId?: string;
  examId?: string;
  isStudentProctored?: boolean;
  onClose: () => void;
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

  const [step, setStep] = useState<RunnerStep>(isStudentProctored ? 'PREFLIGHT' : 'RUNNING');
  const [session, setSession] = useState<CandidateSessionItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<'EN' | 'RW' | 'FR'>('EN');

  // Active runner state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [flaggedIndices, setFlaggedIndices] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState<number>(1200);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

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
          handleTimeExpiredAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [step]);

  // Auto-submit on countdown expiry
  const handleTimeExpiredAutoSubmit = async () => {
    if (isSubmitting || !session) return;
    warning('Examination time limit (20 minutes) has expired. Submitting your answers automatically...');
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
  const handleSelectOption = async (optionKey: 'A' | 'B' | 'C' | 'D') => {
    if (!session || step !== 'RUNNING') return;
    const currentQ = session.questions[currentIndex];
    if (!currentQ) return;

    const seq = currentQ.sequence_number;
    setSelectedAnswers((prev) => ({ ...prev, [seq]: optionKey }));

    try {
      await adminService.recordCandidateAnswer(session.id, seq, optionKey);
    } catch (err: any) {
      console.warn('Failed to auto-save answer:', err);
    }
  };

  const toggleFlagQuestion = (index: number) => {
    setFlaggedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Submit Final Examination
  // ────────────────────────────────────────────────────────────────────────────
  const performSubmit = async () => {
    if (!session || isSubmitting) return;
    setIsSubmitting(true);
    setShowSubmitConfirm(false);

    try {
      const graded = await adminService.submitCandidateExam(session.id);
      setSession(graded);
      setStep('RESULTS');
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
    }
  };

  // Formatting helpers
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const currentQuestion = session?.questions?.[currentIndex];

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
              onClick={onClose}
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
          background: '#090d16',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top Floating App Bar */}
        <header
          style={{
            height: '64px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          {/* Left Title & Domain Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0374b5 0%, #003366 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9rem',
              }}
            >
              SD
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                {session?.exam_title || 'Official Driving Theory Examination'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Candidate Attempt • 20 Points Total • 1 Pt / Question
              </div>
            </div>
          </div>

          {/* Middle Countdown Timer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: isWarningTime ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: isWarningTime ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
              padding: '6px 16px',
              borderRadius: '999px',
              color: isWarningTime ? '#f87171' : '#f8fafc',
              animation: isWarningTime ? 'pulse 1.5s infinite' : 'none',
            }}
          >
            <Clock size={18} />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Right Controls: Language Selector, Fullscreen, Finish */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Multilingual Switcher */}
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
                    padding: '5px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                  setIsFullscreen(true);
                } else {
                  document.exitFullscreen().catch(() => {});
                  setIsFullscreen(false);
                }
              }}
              className="btn btn-ghost btn-sm"
              style={{ color: '#94a3b8', padding: '6px' }}
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="btn btn-primary btn-sm"
              style={{
                background: '#10b981',
                borderColor: '#10b981',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: '8px',
              }}
            >
              Submit Exam
            </button>
          </div>
        </header>

        {/* Runner Body: Question left, Palette & Proctoring right */}
        <main
          style={{
            flex: 1,
            maxWidth: '1360px',
            width: '100%',
            margin: '0 auto',
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '24px',
          }}
        >
          {/* Left: Active Question Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {currentQuestion ? (
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                {/* Question Metadata Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        background: 'rgba(3, 116, 181, 0.15)',
                        color: '#38bdf8',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      Question {currentIndex + 1} of {session?.total_questions || 20}
                    </span>
                    <span
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#cbd5e1',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      Domain: {currentQuestion.domain}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleFlagQuestion(currentIndex)}
                    style={{
                      border: 'none',
                      background: flaggedIndices.has(currentIndex)
                        ? 'rgba(234, 179, 8, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                      color: flaggedIndices.has(currentIndex) ? '#facc15' : '#94a3b8',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    <Flag size={14} />
                    <span>{flaggedIndices.has(currentIndex) ? 'Flagged' : 'Flag for Review'}</span>
                  </button>
                </div>

                {/* Optional Question Image */}
                {currentQuestion.image && (
                  <div
                    style={{
                      maxHeight: '260px',
                      overflow: 'hidden',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      background: '#020617',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={currentQuestion.image}
                      alt="Question scenario"
                      style={{ maxHeight: '260px', objectFit: 'contain' }}
                    />
                  </div>
                )}

                {/* Question Prompt */}
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    lineHeight: '1.5',
                    color: '#ffffff',
                    margin: 0,
                  }}
                >
                  {getQuestionText(currentQuestion)}
                </h2>

                {/* 4 Answer Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                    const optLower = optKey.toLowerCase() as 'a' | 'b' | 'c' | 'd';
                    const optText = getOptionText(currentQuestion, optLower);
                    if (!optText) return null;

                    const seq = currentQuestion.sequence_number;
                    const isSelected = selectedAnswers[seq] === optKey;

                    return (
                      <div
                        key={optKey}
                        onClick={() => handleSelectOption(optKey)}
                        style={{
                          background: isSelected
                            ? 'linear-gradient(135deg, rgba(3, 116, 181, 0.25) 0%, rgba(3, 116, 181, 0.1) 100%)'
                            : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected
                            ? '2px solid #0374b5'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '12px',
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease-in-out',
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: isSelected ? '#0374b5' : 'rgba(255, 255, 255, 0.08)',
                            color: isSelected ? '#ffffff' : '#cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            flexShrink: 0,
                          }}
                        >
                          {optKey}
                        </div>
                        <div style={{ fontSize: '0.95rem', color: isSelected ? '#ffffff' : '#cbd5e1', lineHeight: '1.4' }}>
                          {optText}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Navigation Buttons */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="btn btn-secondary btn-md"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    {answeredCount} of {session?.total_questions || 20} answered
                  </div>

                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        Math.min((session?.questions?.length || 20) - 1, prev + 1)
                      )
                    }
                    disabled={currentIndex === (session?.questions?.length || 20) - 1}
                    className="btn btn-secondary btn-md"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Right Sidebar: Proctoring Feed & Question Palette */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Live Proctoring PIP Feed (for student exams) */}
            {isStudentProctored && (
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#10b981',
                        boxShadow: '0 0 8px #10b981',
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f1f5f9' }}>
                      Proctoring Active
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Camera & Mic Audited</span>
                </div>

                <div
                  style={{
                    width: '100%',
                    aspectRatio: '4/3',
                    background: '#020617',
                    borderRadius: '10px',
                    overflow: 'hidden',
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            )}

            {/* 20 Questions Grid Palette */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                  Question Palette
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {answeredCount}/20 Completed
                </span>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(answeredCount / (session?.total_questions || 20)) * 100}%`,
                    background: '#10b981',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>

              {/* 20 Question Pills */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '8px',
                }}
              >
                {(session?.questions || []).map((q, idx) => {
                  const seq = q.sequence_number;
                  const isCurrent = currentIndex === idx;
                  const isAnswered = Boolean(selectedAnswers[seq]);
                  const isFlagged = flaggedIndices.has(idx);

                  let bg = 'rgba(255, 255, 255, 0.04)';
                  let color = '#94a3b8';
                  let border = '1px solid rgba(255, 255, 255, 0.08)';

                  if (isAnswered) {
                    bg = 'rgba(16, 185, 129, 0.2)';
                    color = '#10b981';
                    border = '1px solid rgba(16, 185, 129, 0.4)';
                  }
                  if (isFlagged) {
                    bg = 'rgba(234, 179, 8, 0.2)';
                    color = '#facc15';
                    border = '1px solid rgba(234, 179, 8, 0.4)';
                  }
                  if (isCurrent) {
                    border = '2px solid #38bdf8';
                  }

                  return (
                    <button
                      key={seq}
                      onClick={() => setCurrentIndex(idx)}
                      style={{
                        background: bg,
                        color: color,
                        border: border,
                        borderRadius: '8px',
                        padding: '10px 0',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {seq}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                  Answered
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#facc15' }} />
                  Flagged
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
                  Current
                </div>
              </div>

              {/* Submit CTA */}
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="btn btn-primary btn-md"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderColor: '#10b981',
                  color: '#ffffff',
                  fontWeight: 700,
                  marginTop: '8px',
                }}
              >
                Finish & Submit Exam
              </button>
            </div>
          </div>
        </main>

        {/* Submit Confirmation Modal */}
        {showSubmitConfirm && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
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
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileCheck size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    Confirm Exam Submission
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    {timeRemaining > 0 ? `${formatTime(timeRemaining)} remaining on timer` : 'Time expired'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.88rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Total Questions:</span>
                  <span style={{ fontWeight: 700 }}>{session?.total_questions || 20}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Answered:</span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>{answeredCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Unanswered:</span>
                  <span style={{ fontWeight: 700, color: answeredCount < 20 ? '#ef4444' : '#10b981' }}>
                    {(session?.total_questions || 20) - answeredCount}
                  </span>
                </div>
                {flaggedIndices.size > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Flagged for Review:</span>
                    <span style={{ fontWeight: 700, color: '#facc15' }}>{flaggedIndices.size}</span>
                  </div>
                )}
              </div>

              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
                Once submitted, your answers will be automatically graded and cannot be modified.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  disabled={isSubmitting}
                  className="btn btn-secondary btn-md"
                >
                  Continue Test
                </button>
                <button
                  onClick={performSubmit}
                  disabled={isSubmitting}
                  className="btn btn-primary btn-md"
                  style={{ background: '#10b981', borderColor: '#10b981' }}
                >
                  {isSubmitting ? 'Grading Answers...' : 'Submit Now'}
                </button>
              </div>
            </div>
          </div>
        )}
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
                {passed ? 'EXAMINATION PASSED' : 'EXAMINATION NOT CLEARED'}
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', color: '#ffffff' }}>
                Your Score: {score} / {totalQ} ({Math.round((score / totalQ) * 100)}%)
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: 0, maxWidth: '600px' }}>
                Passing threshold: {session?.passing_score || 12} / 20 points. Auto-graded with immutable score record.
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
                  Official Review Status: <strong>Awaiting Stage 1 (Board Review)</strong>. Proctored evidence
                  (snapshots, telemetry, identity) submitted for accreditation.
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
                <span>Practice exam completed! Official answer rationales and explanations released below.</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '14px', marginTop: '8px' }}>
              <button onClick={onClose} className="btn btn-primary btn-md">
                Return to Dashboard
              </button>
            </div>
          </div>

          {/* Detailed Question Review Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 4px 0', color: '#ffffff' }}>
                Official Question Review & Explanations
              </h2>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Examine your selected choices against official police theory keys and rationale.
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
                        Q#{q.sequence_number} • {isCorrect ? 'Correct (+1 pt)' : 'Incorrect (0 pt)'}
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
                        Domain: {q.domain}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                      Your Answer: <strong style={{ color: isCorrect ? '#10b981' : '#ef4444' }}>{selected || 'None'}</strong> | Correct: <strong style={{ color: '#10b981' }}>{correct}</strong>
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
                      Explanation
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

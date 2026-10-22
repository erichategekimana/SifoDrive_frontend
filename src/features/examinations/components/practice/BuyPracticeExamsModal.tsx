import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  User,
  Clock,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  AdminService,
  type ExamPackageItem,
  type ExamCreditBalance,
} from '../../../../core/services/AdminService';
import { useToast } from '../../../../context/ToastContext';
import { useAuth } from '../../../../context/AuthContext';
import momoLogo from '../../../../assets/momo-logo.png';

type ModalStep = 'INFO' | 'OTP' | 'PAYMENT' | 'PROCESSING' | 'CONFIRMED';

interface BuyPracticeExamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (credits: ExamCreditBalance) => void;
  defaultPhone?: string;
  initialPackageKey?: string;
  initialExamCount?: number;
}

export const BuyPracticeExamsModal: React.FC<BuyPracticeExamsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultPhone = '',
  initialPackageKey = 'BASIC',
  initialExamCount,
}) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  const [step, setStep] = useState<ModalStep>('INFO');

  const [packages, setPackages] = useState<ExamPackageItem[]>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_exam_packages');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(
            (p: any) =>
              p.key !== 'UNLIMITED_PASS' &&
              p.isActive !== false &&
              (p as any).is_active !== false
          );
        }
      }
    } catch {}
    return [];
  });

  const [selectedKey, setSelectedKey] = useState<string>(initialPackageKey);
  const [examCount, setExamCount] = useState<number>(initialExamCount || 1);
  const [fullName, setFullName] = useState<string>(() => {
    return (
      user?.fullName ||
      (user as any)?.name ||
      ((user as any)?.first_name
        ? `${(user as any)?.first_name || ''} ${(user as any)?.last_name || ''}`.trim()
        : '')
    );
  });
  const [phoneNumber, setPhoneNumber] = useState<string>(() => {
    return user?.phoneNumber || defaultPhone || '';
  });

  // OTP State (Valid for 5 min = 300s)
  const [otpCode, setOtpCode] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);

  // Payment Screen State
  const [payingNumber, setPayingNumber] = useState<string>('');
  const [paymentRefId, setPaymentRefId] = useState<string>('');
  const [confirmedResult, setConfirmedResult] = useState<any>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Helper to determine tier boundaries dynamically from packages or fallbacks
  const getTierLimits = (key: string, badge?: string, pkgObj?: ExamPackageItem) => {
    let pkg = pkgObj || packages.find((p) => p.key === key);
    if (!pkg) {
      try {
        const stored = localStorage.getItem('sifo_admin_exam_packages');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            pkg = parsed.find((p: any) => p.key === key);
          }
        }
      } catch {}
    }
    const k = (key || '').toUpperCase();
    const b = (badge || pkg?.badge || '').toLowerCase();
    const isEnt = k === 'ENTERPRISE' || b === 'enterprise';

    const fallbackRate = isEnt
      ? 50000
      : k === 'BASIC' || k === 'SINGLE' || b === 'basic'
      ? 1000
      : k === 'REGULAR' || k === 'BUNDLE_5' || k === 'BUNDLE_10' || b === 'regular'
      ? 800
      : 700;
    const fallbackMin = isEnt
      ? 1
      : k === 'BASIC' || k === 'SINGLE' || b === 'basic'
      ? 1
      : k === 'REGULAR' || k === 'BUNDLE_5' || k === 'BUNDLE_10' || b === 'regular'
      ? 6
      : 11;
    const fallbackMax = isEnt
      ? 1
      : k === 'BASIC' || k === 'SINGLE' || b === 'basic'
      ? 5
      : k === 'REGULAR' || k === 'BUNDLE_5' || k === 'BUNDLE_10' || b === 'regular'
      ? 10
      : 20;
    const fallbackDefault = isEnt ? 1 : fallbackMin;

    const rate = pkg?.price_per_exam_rwf ?? fallbackRate;
    const min = pkg?.min_exams ?? fallbackMin;
    const max = pkg?.max_exams ?? fallbackMax;
    const def = pkg?.default_exams ?? (pkg?.min_exams ?? fallbackDefault);

    const badgeName =
      isEnt
        ? 'Enterprise'
        : k === 'BASIC' || k === 'SINGLE' || b === 'basic'
        ? 'Basic'
        : k === 'REGULAR' || k === 'BUNDLE_5' || k === 'BUNDLE_10' || b === 'regular'
        ? 'Regular'
        : 'Premium';

    return {
      min,
      max,
      rate,
      default: def,
      isEnterprise: isEnt,
      badge: pkg?.badge || badgeName,
    };
  };

  // Reset and initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('INFO');
      setOtpCode('');
      setTimeLeft(300);
      setIsTimerRunning(false);
      setPayingNumber(user?.phoneNumber || defaultPhone || '');

      const activeKey = initialPackageKey || 'BASIC';
      setSelectedKey(activeKey);

      // Check local storage for admin overrides
      let localPkgs: ExamPackageItem[] | null = null;
      const disabledKeys = new Set<string>();
      try {
        const stored = localStorage.getItem('sifo_admin_exam_packages');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localPkgs = parsed;
            parsed.forEach((item: any) => {
              if (item && (item.isActive === false || item.is_active === false)) {
                disabledKeys.add(String(item.key).toUpperCase());
              }
            });
          }
        }
      } catch {}

      const targetPkg = localPkgs?.find((p) => p.key === activeKey);
      const limits = getTierLimits(activeKey, undefined, targetPkg);

      if (initialExamCount !== undefined && initialExamCount >= limits.min && initialExamCount <= limits.max) {
        setExamCount(initialExamCount);
      } else if (limits.isEnterprise) {
        setExamCount(1);
      } else if (initialExamCount !== undefined) {
        setExamCount(Math.max(limits.min, Math.min(limits.max, initialExamCount)));
      } else {
        setExamCount(limits.default);
      }

      adminService
        .getPublicExamPackages()
        .then((remotePkgs) => {
          const sourceList = localPkgs && localPkgs.length > 0 ? localPkgs : remotePkgs;
          const filtered = sourceList.filter(
            (p) =>
              p.key !== 'UNLIMITED_PASS' &&
              p.isActive !== false &&
              (p as any).is_active !== false &&
              !disabledKeys.has(String(p.key).toUpperCase())
          );
          setPackages(filtered);
        })
        .catch(() => {
          if (localPkgs && localPkgs.length > 0) {
            const filtered = localPkgs.filter(
              (p) =>
                p.key !== 'UNLIMITED_PASS' &&
                p.isActive !== false &&
                (p as any).is_active !== false &&
                !disabledKeys.has(String(p.key).toUpperCase())
            );
            setPackages(filtered);
          }
        });

      if (user?.phoneNumber) {
        setPhoneNumber(user.phoneNumber);
      } else if (defaultPhone) {
        setPhoneNumber(defaultPhone);
      }

      if (user) {
        setFullName(user.fullName || (user as any).name || '');
      }
    }
  }, [isOpen, user, defaultPhone, initialPackageKey, initialExamCount]);

  // Real-time synchronization with admin updates
  useEffect(() => {
    const handleSync = (e?: any) => {
      const pkgs = e?.detail;
      if (Array.isArray(pkgs)) {
        const filtered = pkgs.filter(
          (p) =>
            p.key !== 'UNLIMITED_PASS' &&
            p.isActive !== false &&
            (p as any).is_active !== false
        );
        setPackages(filtered);
      }
    };

    window.addEventListener('sifo_exam_packages_updated', handleSync);
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('sifo_exam_packages_sync');
      channel.onmessage = (event) => {
        if (event.data?.packages && Array.isArray(event.data.packages)) {
          const filtered = event.data.packages.filter(
            (p: any) =>
              p.key !== 'UNLIMITED_PASS' &&
              p.isActive !== false &&
              (p as any).is_active !== false
          );
          setPackages(filtered);
        }
      };
    } catch {}

    return () => {
      window.removeEventListener('sifo_exam_packages_updated', handleSync);
      if (channel) channel.close();
    };
  }, []);

  // Countdown timer for 5-minute OTP validity
  useEffect(() => {
    let timer: any = null;
    if (step === 'OTP' && isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, isTimerRunning, timeLeft]);

  if (!isOpen) return null;

  const selectedPkg = packages.find((p) => p.key === selectedKey);
  const activeLimits = getTierLimits(selectedKey, selectedPkg?.badge, selectedPkg);
  const safeCount = activeLimits.isEnterprise ? 1 : Math.max(activeLimits.min, Math.min(activeLimits.max, examCount));
  const calculatedTotal = safeCount * activeLimits.rate;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // STEP 1: Request OTP and proceed to verification
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toastError('Please enter your full name.');
      return;
    }
    if (!phoneNumber.trim()) {
      toastError('Please enter your Rwanda phone number.');
      return;
    }

    try {
      setIsProcessing(true);
      const res = await adminService.requestPublicExamOTP(phoneNumber.trim(), fullName.trim());
      setTimeLeft(res.expires_in_seconds || 300);
      setIsTimerRunning(true);
      setStep('OTP');
      success(`Verification code sent to ${phoneNumber.trim()}. Valid for 5 minutes.`);
    } catch (err: any) {
      toastError(err?.message || 'Failed to send OTP verification code. Please check phone number and retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Resend OTP code
  const handleResendOTP = async () => {
    try {
      setIsResending(true);
      const res = await adminService.requestPublicExamOTP(phoneNumber.trim(), fullName.trim());
      setTimeLeft(res.expires_in_seconds || 300);
      setIsTimerRunning(true);
      setOtpCode('');
      success(`New verification code sent to ${phoneNumber.trim()}. Valid for 5 minutes.`);
    } catch (err: any) {
      toastError(err?.message || 'Failed to resend code. Please retry.');
    } finally {
      setIsResending(false);
    }
  };

  // STEP 2: Verify OTP code
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      toastError('Please enter the 6-digit verification code.');
      return;
    }
    if (timeLeft <= 0) {
      toastError('Verification code has expired (valid for 5 minutes). Please click Resend Code.');
      return;
    }

    try {
      setIsProcessing(true);
      await adminService.verifyPublicExamOTP(phoneNumber.trim(), otpCode.trim());
      success('Phone number verified successfully!');
      setPayingNumber(phoneNumber.trim());
      setStep('PAYMENT');
    } catch (err: any) {
      toastError(err?.message || 'Invalid or expired verification code. Please check and retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Polling loop for MoMo payment authorization
  useEffect(() => {
    let interval: any = null;
    if (step === 'PROCESSING' && paymentRefId) {
      interval = setInterval(async () => {
        try {
          const res = await adminService.getPublicExamPaymentStatus(paymentRefId);
          if (res?.status === 'SUCCESSFUL') {
            clearInterval(interval);
            setConfirmedResult(res);
            setStep('CONFIRMED');
            success('Payment confirmed! Practice exam credits added.');
            const updated = await adminService.getPublicExamCredits(phoneNumber.trim());
            onSuccess(updated);
          } else if (res?.status === 'FAILED') {
            clearInterval(interval);
            toastError(res?.message || 'Payment was cancelled or failed on your phone.');
            setStep('PAYMENT');
          }
        } catch {
          // Ignore transient polling network errors
        }
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, paymentRefId, phoneNumber]);

  // STEP 3: Complete MoMo Payment
  const handlePayWithMoMo = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPayingNumber = (payingNumber || phoneNumber).trim();

    if (!finalPayingNumber) {
      toastError('Please enter a paying MoMo phone number.');
      return;
    }

    try {
      setIsProcessing(true);
      const res = await adminService.buyPublicExamCredits({
        package_key: selectedKey,
        exam_count: safeCount,
        phone_number: phoneNumber.trim(),
        paying_number: finalPayingNumber,
        full_name: fullName.trim(),
      });

      if (res?.reference_id) {
        setPaymentRefId(res.reference_id);
        setStep('PROCESSING');
      } else {
        success(res?.message || 'Exams purchased successfully via MoMo!');
        const updatedBalance = await adminService.getPublicExamCredits(phoneNumber.trim());
        onSuccess(updatedBalance);
        onClose();
      }
    } catch (err: any) {
      toastError(err?.message || 'Payment processing failed. Please verify MoMo balance and retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '640px',
          width: '100%',
          background: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '28px',
          padding: '40px 44px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header - Capitalized amount and exam count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
          <div>
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                margin: 0,
                color: '#ffffff',
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
              }}
            >
              {step === 'PROCESSING'
                ? 'CHECK YOUR PHONE'
                : step === 'CONFIRMED'
                ? 'PAYMENT SUCCESSFUL'
                : `YOU ARE PAYING ${calculatedTotal.toLocaleString()} RWF FOR ${safeCount} ${safeCount === 1 ? 'EXAM' : 'EXAMS'}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* ── STEP 1: Candidate Names & Rwanda Phone Number ── */}
        {step === 'INFO' && (
          <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Names field */}
            <div>
              <label style={{ display: 'block', fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '10px' }}>
                Full Name:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Mugisha Jean"
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    padding: '16px 20px 16px 54px',
                    color: '#ffffff',
                    fontSize: '1.12rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <User
                  size={22}
                  style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
              </div>
            </div>

            {/* Phone number field (Rwanda) */}
            <div>
              <label style={{ display: 'block', fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '10px' }}>
                Phone Number (Rwanda):
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 0788123456"
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    padding: '16px 20px 16px 54px',
                    color: '#ffffff',
                    fontSize: '1.12rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <Phone
                  size={22}
                  style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: '#94a3b8' }}>
                We will send a 6-digit OTP verification code valid for 5 minutes to this number.
              </p>
            </div>

            {/* Action Button: Full width Buy button */}
            <div style={{ marginTop: '10px', width: '100%' }}>
              <button
                type="submit"
                disabled={isProcessing}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  padding: '16px 24px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <span>{isProcessing ? 'Sending Verification Code...' : 'Buy'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 2: OTP Verification Screen (5-Min Validity) ── */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div
              style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '16px',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.98rem', color: '#e2e8f0', fontWeight: 600 }}>
                  Enter code sent to <strong style={{ color: '#38bdf8' }}>{phoneNumber}</strong>
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: timeLeft > 0 ? '#38bdf8' : '#ef4444',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                  }}
                >
                  <Clock size={16} />
                  <span>{timeLeft > 0 ? formatTimer(timeLeft) : 'Expired'}</span>
                </div>
              </div>
            </div>

            {/* OTP Code Input */}
            <div>
              <label style={{ display: 'block', fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '10px' }}>
                Enter 6-Digit Verification Code:
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoFocus
                required
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: timeLeft > 0 ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #ef4444',
                  borderRadius: '16px',
                  padding: '18px 20px',
                  color: '#ffffff',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.35em',
                  textAlign: 'center',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Resend Code Action */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  transition: 'opacity 0.2s',
                }}
              >
                <RotateCcw size={15} />
                <span>{isResending ? 'Resending Code...' : "Didn't receive code? Resend"}</span>
              </button>
            </div>

            {/* Action Buttons: Verify Code on top, Back/Cancel at bottom */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px', width: '100%' }}>
              <button
                type="submit"
                disabled={isProcessing || timeLeft <= 0 || otpCode.trim().length < 4}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  padding: '16px 24px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isProcessing || timeLeft <= 0 ? 'not-allowed' : 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <span>{isProcessing ? 'Verifying OTP...' : 'Verify Code'}</span>
              </button>
              <button
                type="button"
                onClick={() => setStep('INFO')}
                disabled={isProcessing}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  padding: '14px 24px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <ArrowLeft size={18} />
                <span>Change Phone Number</span>
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: Payment Summary & Confirmation ── */}
        {step === 'PAYMENT' && (
          <form onSubmit={handlePayWithMoMo} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Two-column aligned details (labels on left, values on right) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'max-content 1fr',
                columnGap: '28px',
                rowGap: '20px',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: '1.15rem', color: '#94a3b8' }}>
                Names:
              </div>
              <div style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700 }}>
                {fullName}
              </div>

              <div style={{ fontSize: '1.15rem', color: '#94a3b8' }}>
                Phone number:
              </div>
              <div style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700 }}>
                {phoneNumber}
              </div>

              <div style={{ fontSize: '1.15rem', color: '#94a3b8' }}>
                Number of exams:
              </div>
              <div style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700 }}>
                {safeCount}
              </div>

              <div style={{ fontSize: '1.15rem', color: '#94a3b8' }}>
                Amount:
              </div>
              <div style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700 }}>
                {calculatedTotal.toLocaleString()} RWF
              </div>

              <div style={{ fontSize: '1.15rem', color: '#94a3b8' }}>
                Number being used to pay:
              </div>
              <div>
                <input
                  type="tel"
                  value={payingNumber}
                  onChange={(e) => setPayingNumber(e.target.value)}
                  placeholder="e.g. 0780842458"
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: '#ffffff',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* MoMo Logo between details and Pay button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '28px',
                marginBottom: '8px',
              }}
            >
              <img
                src={momoLogo}
                alt="MTN MoMo"
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '20px',
                  objectFit: 'cover',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                }}
              />
            </div>

            {/* Action Buttons: Pay button 100% width */}
            <div style={{ marginTop: '16px', width: '100%' }}>
              <button
                type="submit"
                disabled={isProcessing}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  fontSize: '1.18rem',
                  fontWeight: 900,
                  padding: '18px 24px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <span>
                  {isProcessing
                    ? 'Processing Payment...'
                    : `Pay ${calculatedTotal.toLocaleString()} RWF`}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 4: Authorizing Payment (USSD Push Polling) ── */}
        {step === 'PROCESSING' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '22px', padding: '10px 0' }}>
            {/* MoMo Logo with gentle glow */}
            <div style={{ position: 'relative' }}>
              <img
                src={momoLogo}
                alt="MTN MoMo"
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '20px',
                  objectFit: 'cover',
                  boxShadow: '0 0 30px rgba(245, 158, 11, 0.35)',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Approve Payment of {calculatedTotal.toLocaleString()} RWF
              </h3>
              <p style={{ fontSize: '1.05rem', color: '#94a3b8', margin: 0, lineHeight: 1.5, maxWidth: '460px' }}>
                We have sent an MTN MoMo prompt to <strong style={{ color: '#ffffff' }}>{payingNumber || phoneNumber}</strong>. Please check your phone and enter your MoMo PIN to complete the purchase.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '12px 24px',
                borderRadius: '14px',
                color: '#38bdf8',
                fontWeight: 600,
                fontSize: '0.98rem',
              }}
            >
              <Loader2 size={18} className="animate-spin" />
              <span>Waiting for approval on your phone...</span>
            </div>

            <button
              type="button"
              onClick={() => setStep('PAYMENT')}
              className="btn btn-secondary"
              style={{
                marginTop: '10px',
                width: '100%',
                fontSize: '1.05rem',
                fontWeight: 700,
                padding: '14px 24px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              Change Phone Number or Retry
            </button>
          </div>
        )}

        {/* ── STEP 5: Payment Confirmed Success Screen ── */}
        {step === 'CONFIRMED' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px', padding: '10px 0' }}>
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.12)',
                border: '2px solid rgba(34, 197, 94, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22c55e',
                boxShadow: '0 0 35px rgba(34, 197, 94, 0.25)',
              }}
            >
              <CheckCircle2 size={48} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {confirmedResult?.credits_added || safeCount} Exam {safeCount === 1 ? 'Credit' : 'Credits'} Added!
              </h3>
              <p style={{ fontSize: '1.05rem', color: '#94a3b8', margin: 0, lineHeight: 1.5, maxWidth: '440px' }}>
                Your payment of <strong style={{ color: '#ffffff' }}>{calculatedTotal.toLocaleString()} RWF</strong> was successfully received. You are ready to start practicing immediately.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '12px 28px',
                color: '#f8fafc',
                fontSize: '1.1rem',
                fontWeight: 700,
              }}
            >
              <span>Current Available Balance:</span>
              <strong style={{ color: '#22c55e' }}>{confirmedResult?.current_balance ?? safeCount} Exams</strong>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary"
              style={{
                width: '100%',
                fontSize: '1.18rem',
                fontWeight: 900,
                padding: '18px 24px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginTop: '10px',
              }}
            >
              Done & Start Practice Exam
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyPracticeExamsModal;

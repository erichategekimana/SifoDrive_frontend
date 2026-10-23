import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Phone,
  Wallet,
  Minus,
  Plus,
  ShieldCheck,
  AlertCircle,
  X,
  ArrowRight,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import {
  AdminService,
  type ExamPackageItem,
  type ExamCreditBalance,
} from '../../core/services/AdminService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';
import { useTheme } from '../../context/ThemeContext';
import { BuyPracticeExamsModal } from '../../features/examinations/components/practice/BuyPracticeExamsModal';

const DEFAULT_VARIABLE_PLANS: ExamPackageItem[] = [
  {
    key: 'BASIC',
    name: 'Exam',
    credits: 1,
    min_exams: 1,
    max_exams: 5,
    default_exams: 1,
    price_per_exam_rwf: 1000,
    price_rwf: 1000,
    badge: 'Basic',
    description: '1 to 5 practice exam sittings with instant scoring and question rationale.',
  },
  {
    key: 'REGULAR',
    name: 'Exam',
    credits: 6,
    min_exams: 6,
    max_exams: 10,
    default_exams: 6,
    price_per_exam_rwf: 800,
    price_rwf: 4800,
    badge: 'Regular',
    description: '6 to 10 distinct randomly generated 20-question practice attempts across official domains.',
  },
  {
    key: 'PREMIUM',
    name: 'Exam',
    credits: 11,
    min_exams: 11,
    max_exams: 20,
    default_exams: 11,
    price_per_exam_rwf: 700,
    price_rwf: 7700,
    badge: 'Premium',
    description: '11 to 20 full mock exams pulling from all official Rwanda Traffic Police theory domains.',
  },
  {
    key: 'ENTERPRISE',
    name: 'Exam',
    credits: 9999,
    min_exams: 1,
    max_exams: 1,
    default_exams: 1,
    price_per_exam_rwf: 50000,
    price_rwf: 50000,
    badge: 'Enterprise',
    description: 'Unlimited practice exam attempts for driving schools, academies, and institutional cohorts.',
  },
];

export const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const { theme } = useTheme();
  const { error: toastError, success } = useToast();
  const navigate = useNavigate();
  const adminService = AdminService.getInstance();

  // Helper to get strictly disabled package keys from localStorage
  const getDisabledPackageKeys = (): Set<string> => {
    const disabled = new Set<string>();
    try {
      const stored = localStorage.getItem('sifo_admin_exam_packages');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item && (item.isActive === false || item.is_active === false)) {
              disabled.add(String(item.key).toUpperCase());
            }
          }
        }
      }
    } catch {}
    return disabled;
  };

  const [packages, setPackages] = useState<ExamPackageItem[]>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_exam_packages');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any) => ({
            ...p,
            isActive: p.isActive !== false && p.is_active !== false,
            is_active: p.isActive !== false && p.is_active !== false,
          }));
        }
      }
    } catch {}
    return [];
  });
  const [loadingPackages, setLoadingPackages] = useState<boolean>(true);

  // Guest configuration
  const [guestConfig, setGuestConfig] = useState(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_settings_guest_trials');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      freeTrialExamsOnSignup: 1,
      allowGuestPayAsYouGo: true,
      creditsNeverExpire: true,
    };
  });

  // Stepper state for each variable plan
  const [planCounts, setPlanCounts] = useState<Record<string, number>>({
    BASIC: 1,
    REGULAR: 6,
    PREMIUM: 11,
    ENTERPRISE: 1,
    SINGLE: 1,
    BUNDLE_5: 6,
    BUNDLE_10: 11,
  });

  // Modal state
  const [isBuyModalOpen, setIsBuyModalOpen] = useState<boolean>(false);
  const [selectedPackageKey, setSelectedPackageKey] = useState<string>('BASIC');
  const [selectedExamCount, setSelectedExamCount] = useState<number>(1);

  // Balance Lookup state & response
  const [lookupPhone, setLookupPhone] = useState<string>(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const p = sp.get('phone');
      if (p) return p.trim().replace(/\D/g, '');
    } catch {}
    return user?.phoneNumber || '';
  });
  const [balance, setBalance] = useState<ExamCreditBalance | null>(null);
  const [balanceStatus, setBalanceStatus] = useState<'IDLE' | 'NOT_REGISTERED'>('IDLE');
  const [isCheckingBalance, setIsCheckingBalance] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // White Mode Modal Dialog state for when remaining exams are found
  const [isAccessModalOpen, setIsAccessModalOpen] = useState<boolean>(false);
  const [accessModalStep, setAccessModalStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpTimeLeft, setOtpTimeLeft] = useState<number>(300);
  const [isOtpTimerRunning, setIsOtpTimerRunning] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [isResendingOtp, setIsResendingOtp] = useState<boolean>(false);

  // Countdown timer for 5-minute OTP validity
  useEffect(() => {
    let timer: any = null;
    if (isAccessModalOpen && accessModalStep === 'OTP' && isOtpTimerRunning && otpTimeLeft > 0) {
      timer = setInterval(() => {
        setOtpTimeLeft((prev) => {
          if (prev <= 1) {
            setIsOtpTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAccessModalOpen, accessModalStep, isOtpTimerRunning, otpTimeLeft]);

  // Load packages on mount and sync with admin plans toggle
  useEffect(() => {
    let mounted = true;

    const loadExamPackages = (overridePkgs?: ExamPackageItem[]) => {
      const currentDisabled = getDisabledPackageKeys();
      let localAdminPkgs: ExamPackageItem[] | null = overridePkgs || null;

      if (!localAdminPkgs) {
        try {
          const stored = localStorage.getItem('sifo_admin_exam_packages');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              localAdminPkgs = parsed.map((p: any) => {
                const isDis = currentDisabled.has(String(p.key).toUpperCase()) || p.isActive === false || p.is_active === false;
                return {
                  ...p,
                  isActive: !isDis,
                  is_active: !isDis,
                };
              });
            }
          }
        } catch {}
      }

      if (localAdminPkgs && mounted) {
        setPackages(localAdminPkgs);
        setLoadingPackages(false);
      }

      adminService
        .getPublicExamPackages()
        .then((remotePkgs) => {
          if (!mounted) return;
          const freshDisabled = getDisabledPackageKeys();

          if (localAdminPkgs && localAdminPkgs.length > 0) {
            const merged = localAdminPkgs.map((local) => {
              const remote = remotePkgs.find((r) => r.key === local.key);
              const isInactiveLocally = freshDisabled.has(local.key.toUpperCase()) || local.isActive === false || (local as any).is_active === false;
              // If remote is not found in remotePkgs and remotePkgs returned from server, server deactivated it
              const isInactiveRemotely = remotePkgs.length > 0 ? (!remote || remote.isActive === false || (remote as any).is_active === false) : false;
              const finalActive = !isInactiveLocally && !isInactiveRemotely;
              return {
                ...(remote || {}),
                ...local,
                isActive: finalActive,
                is_active: finalActive,
              };
            });
            setPackages(merged);
          } else {
            const activeOnly = remotePkgs
              .filter((r) => !freshDisabled.has(r.key.toUpperCase()))
              .map((r) => ({
                ...r,
                isActive: r.isActive !== false && (r as any).is_active !== false,
                is_active: r.isActive !== false && (r as any).is_active !== false,
              }));
            setPackages(activeOnly);
          }
          setLoadingPackages(false);
        })
        .catch((err) => {
          console.error('Failed to load exam packages:', err);
          if (mounted) {
            if (!localAdminPkgs) {
              const freshDisabled = getDisabledPackageKeys();
              setPackages(
                DEFAULT_VARIABLE_PLANS.map((p) => ({
                  ...p,
                  isActive: !freshDisabled.has(p.key.toUpperCase()),
                  is_active: !freshDisabled.has(p.key.toUpperCase()),
                }))
              );
            }
            setLoadingPackages(false);
          }
        });
    };

    loadExamPackages();

    const handleSync = (e?: any) => {
      if (mounted) {
        const pkgs = e?.detail;
        loadExamPackages(Array.isArray(pkgs) ? pkgs : undefined);
      }
    };

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('sifo_exam_packages_sync');
      channel.onmessage = (event) => {
        if (mounted && event.data?.packages) {
          loadExamPackages(event.data.packages);
        }
      };
    } catch {}

    const handleGuestConfigSync = (e?: any) => {
      if (mounted) {
        try {
          const detail = e?.detail;
          if (detail) {
            setGuestConfig(detail);
          } else {
            const stored = localStorage.getItem('sifo_admin_settings_guest_trials');
            if (stored) setGuestConfig(JSON.parse(stored));
          }
        } catch {}
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('sifo_exam_packages_updated', handleSync);
    window.addEventListener('storage', handleGuestConfigSync);
    window.addEventListener('sifo_guest_config_updated', handleGuestConfigSync);

    return () => {
      mounted = false;
      try {
        channel?.close();
      } catch {}
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('sifo_exam_packages_updated', handleSync);
      window.removeEventListener('storage', handleGuestConfigSync);
      window.removeEventListener('sifo_guest_config_updated', handleGuestConfigSync);
    };
  }, []);

  // Pre-fetch balance if user is logged in with a phone number or arrived with ?phone=
  useEffect(() => {
    let targetPhone = user?.phoneNumber || '';
    try {
      const sp = new URLSearchParams(window.location.search);
      const p = sp.get('phone');
      if (p) targetPhone = p;
    } catch {}

    if (targetPhone) {
      const clean = targetPhone.trim().replace(/\D/g, '');
      if (clean) {
        setLookupPhone(clean);
        adminService
          .getPublicExamCredits(clean)
          .then((res) => {
            setBalance(res);
          })
          .catch(() => {});
      }
    }
  }, [user]);

  // Handle checking balance with three-situation answers
  const handleCheckBalance = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPhoneError(null);
    const clean = lookupPhone.trim().replace(/\D/g, '');
    if (!clean) {
      setPhoneError(language === 'rw' ? 'Nyamuneka andika numero ya terefone.' : 'Please enter a phone number to check credits.');
      return;
    }

    if (clean.length !== 10) {
      setPhoneError(
        language === 'rw'
          ? 'Numero ya terefone igomba kuba igizwe n\'imibare 10 neza (urugero: 0788123456).'
          : 'Phone number must be exactly 10 digits (e.g. 0788123456).'
      );
      return;
    }

    try {
      setIsCheckingBalance(true);
      const res = await adminService.getPublicExamCredits(clean);
      setBalance(res);

      if (!res.is_registered) {
        // Situation 1: Number is not registered at all
        setBalanceStatus('NOT_REGISTERED');
        setIsAccessModalOpen(false);
      } else if (res.credits <= 0) {
        // Number has no remaining exams
        setBalanceStatus('IDLE');
        setIsAccessModalOpen(false);
        setPhoneError(
          language === 'rw'
            ? 'Kuri ubu nta bizamini byo kwitoza usigaranye kuri iyi nimero (0).'
            : 'You currently have no remaining practice exam attempts for this number (0).'
        );
      } else {
        // Situation 3: Number has remaining exams -> pop out white-mode modal dialog!
        setBalanceStatus('IDLE');
        setAccessModalStep('DETAILS');
        setIsAccessModalOpen(true);
      }
    } catch (err: any) {
      setPhoneError(err?.message || (language === 'rw' ? 'Kureba ibizamini byanze.' : 'Failed to retrieve balance.'));
    } finally {
      setIsCheckingBalance(false);
    }
  };

  // Helper to determine plan configuration
  const getPlanConfig = (pkg: ExamPackageItem, index: number) => {
    const k = (pkg.key || '').toUpperCase();
    const b = (pkg.badge || '').toLowerCase();
    if (k === 'ENTERPRISE' || b === 'enterprise') {
      return {
        badge: 'Enterprise',
        min: 1,
        max: 1,
        rate: pkg.price_per_exam_rwf ?? 50000,
        defaultCount: 1,
        isEnterprise: true,
      };
    }
    if (k === 'BASIC' || k === 'SINGLE' || b === 'basic' || index === 0) {
      const min = pkg.min_exams ?? 1;
      const max = pkg.max_exams ?? 5;
      return {
        badge: 'Basic',
        min,
        max,
        rate: pkg.price_per_exam_rwf ?? 1000,
        defaultCount: pkg.default_exams ?? min,
        isEnterprise: false,
      };
    }
    if (k === 'REGULAR' || k === 'BUNDLE_5' || k === 'BUNDLE_10' || b === 'regular' || index === 1) {
      const min = pkg.min_exams ?? 6;
      const max = pkg.max_exams ?? 10;
      return {
        badge: 'Regular',
        min,
        max,
        rate: pkg.price_per_exam_rwf ?? 800,
        defaultCount: pkg.default_exams ?? min,
        isEnterprise: false,
      };
    }
    const min = pkg.min_exams ?? 11;
    const max = pkg.max_exams ?? 20;
    return {
      badge: 'Premium',
      min,
      max,
      rate: pkg.price_per_exam_rwf ?? 700,
      defaultCount: pkg.default_exams ?? min,
      isEnterprise: false,
    };
  };

  const handleIncrement = (pkg: ExamPackageItem, index: number) => {
    const config = getPlanConfig(pkg, index);
    const raw = planCounts[pkg.key] ?? config.defaultCount;
    const current = Math.max(config.min, Math.min(config.max, raw));
    if (current < config.max) {
      setPlanCounts((prev) => ({ ...prev, [pkg.key]: current + 1 }));
    }
  };

  const handleDecrement = (pkg: ExamPackageItem, index: number) => {
    const config = getPlanConfig(pkg, index);
    const raw = planCounts[pkg.key] ?? config.defaultCount;
    const current = Math.max(config.min, Math.min(config.max, raw));
    if (current > config.min) {
      setPlanCounts((prev) => ({ ...prev, [pkg.key]: current - 1 }));
    }
  };

  // Open modal with specific package and count
  const handleOpenBuyModal = (pkgKey: string, count?: number) => {
    setSelectedPackageKey(pkgKey);
    setSelectedExamCount(count || planCounts[pkgKey] || 1);
    setIsBuyModalOpen(true);
  };

  // On successful purchase callback
  const handlePurchaseSuccess = (updatedBalance: ExamCreditBalance) => {
    setBalance(updatedBalance);
    if (updatedBalance.identifier) {
      setLookupPhone(updatedBalance.identifier);
    }
  };

  const formatOtpTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Step 1 -> Step 2: Request OTP and transition to OTP verification in white-mode modal
  const handleSendOtpAndShowVerify = async () => {
    const clean = lookupPhone.trim().replace(/\D/g, '');
    if (!clean) return;

    try {
      setIsSendingOtp(true);
      const res = await adminService.requestPublicExamOTP(clean, balance?.full_name);
      setOtpTimeLeft(res.expires_in_seconds || 300);
      setIsOtpTimerRunning(true);
      setOtpCode('');
      setAccessModalStep('OTP');
      success(
        language === 'rw'
          ? `Kode y'umutekano yoherejwe kuri ${clean}. Yinjize kugira ngo ukomeze mu cyumba cy'ikizamini.`
          : `Security verification code sent to ${clean}. Please enter it below to proceed to the Examination Ready Room.`
      );
    } catch (err: any) {
      toastError(err?.message || (language === 'rw' ? 'Gusaba kode byanze. Ongera ugerageze.' : 'Failed to send verification code. Please retry.'));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    const clean = lookupPhone.trim().replace(/\D/g, '');
    if (!clean) return;

    try {
      setIsResendingOtp(true);
      const res = await adminService.requestPublicExamOTP(clean, balance?.full_name);
      setOtpTimeLeft(res.expires_in_seconds || 300);
      setIsOtpTimerRunning(true);
      setOtpCode('');
      success(
        language === 'rw'
          ? `Kode nshya yoherejwe kuri ${clean}.`
          : `New verification code sent to ${clean}.`
      );
    } catch (err: any) {
      toastError(err?.message || (language === 'rw' ? 'Gusubiramo kode byanze.' : 'Failed to resend code.'));
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleVerifyOtpAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = lookupPhone.trim().replace(/\D/g, '');
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      toastError(language === 'rw' ? 'Nyamuneka andika kode y\'imibare 6 yoherejwe kuri terefone.' : 'Please enter the 6-digit verification code.');
      return;
    }
    if (otpTimeLeft <= 0) {
      toastError(language === 'rw' ? 'Igihe cya kode cyarangiye. Kanda \'Ongera wohereze\'.' : 'Verification code has expired. Please click Resend Code.');
      return;
    }

    try {
      setIsVerifyingOtp(true);
      await adminService.verifyPublicExamOTP(clean, otpCode.trim());
      success(
        language === 'rw'
          ? 'Nimero yemerewe neza! Ugiye kwinjira mu cyumba cy\'ikizamini...'
          : 'Identity verified successfully! Entering Examination Ready Room...'
      );
      localStorage.setItem('sifo_last_candidate_phone', clean);
      setIsAccessModalOpen(false);
      navigate(`/practice-exams?phone=${encodeURIComponent(clean)}&lang=${encodeURIComponent(language)}&theme=${encodeURIComponent(theme)}`);
    } catch (err: any) {
      toastError(err?.message || (language === 'rw' ? 'Kode si yo cyangwa yarengeje igihe.' : 'Invalid or expired verification code.'));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'radial-gradient(ellipse 100% 800px at 50% 0%, rgba(16, 185, 129, 0.22) 0%, rgba(14, 165, 233, 0.14) 45%, transparent 80%)',
      }}
    >
      <Navbar />

      <main style={{ flex: 1, padding: '48px 24px 80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header Title Section */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1
              style={{
                fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: '16px',
                lineHeight: 1.15,
                color: 'var(--text-primary)',
              }}
            >
              {t('pricing.title')}
            </h1>
            <p
              style={{
                fontSize: '1.12rem',
                color: 'var(--text-secondary)',
                maxWidth: '700px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              {t('pricing.subtitle')}
            </p>
          </div>

          {/* Quick Credit Lookup & Access Verification Box */}
          <div
            className="glass-panel"
            style={{
              borderRadius: '20px',
              padding: '24px 32px',
              marginBottom: '48px',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-surface-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                    flexShrink: 0,
                  }}
                >
                  <Wallet size={26} />
                </div>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {t('pricing.alreadyHaveCredits')}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {t('pricing.checkCreditsSubtitle')}
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleCheckBalance}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ position: 'relative', minWidth: '240px' }}>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={lookupPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setLookupPhone(val);
                        setBalanceStatus('IDLE');
                        if (phoneError) setPhoneError(null);
                      }}
                      placeholder="e.g. 0788123456"
                      style={{
                        background: 'var(--bg-surface-elevated)',
                        border: `1px solid ${phoneError ? '#ef4444' : 'var(--border-medium)'}`,
                        borderRadius: '12px',
                        padding: '10px 14px 10px 38px',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        width: '100%',
                        outline: 'none',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                        boxShadow: phoneError ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = phoneError ? '#ef4444' : 'var(--primary)';
                        e.currentTarget.style.boxShadow = phoneError
                          ? '0 0 0 3px rgba(239, 68, 68, 0.15)'
                          : '0 0 0 3px var(--primary-glow)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = phoneError ? '#ef4444' : 'var(--border-medium)';
                        e.currentTarget.style.boxShadow = phoneError ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none';
                      }}
                    />
                    <Phone
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: phoneError ? '#ef4444' : 'var(--text-muted)',
                      }}
                    />
                  </div>
                  {phoneError && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#ef4444',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        marginTop: '6px',
                        maxWidth: '280px',
                        lineHeight: 1.3,
                      }}
                    >
                      <AlertCircle size={14} style={{ flexShrink: 0 }} />
                      <span>{phoneError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isCheckingBalance}
                  className="btn btn-secondary btn-md"
                  style={{ borderRadius: '12px', padding: '10px 18px', fontWeight: 600 }}
                >
                  {isCheckingBalance ? t('pricing.checking') : t('pricing.checkBalance')}
                </button>
              </form>
            </div>

            {/* ── SITUATION 1: Number is not registered at all in the system ── */}
            {balanceStatus === 'NOT_REGISTERED' && (
              <div
                style={{
                  width: '100%',
                  padding: '18px 22px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '260px' }}>
                  <AlertCircle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.98rem' }}>
                      {language === 'rw' ? 'Nimero Ntabwo Yanditswe' : 'Number Not Registered'}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.5 }}>
                      {language === 'rw'
                        ? 'Iyi nimero ya terefone ntabwo irandikwa muri sisitemu yacu. Hitamo imwe muri gahunda zo kwitoza ziri hasi maze ugure ikizamini.'
                        : 'This phone number is not registered in our system yet. Please choose one of the examination plans below and purchase your exam.'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('pricing-packages');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: '10px', padding: '10px 20px', fontWeight: 700 }}
                >
                  {language === 'rw' ? 'Hitamo Gahunda Hasi' : 'Choose a Plan Below'}
                </button>
              </div>
            )}


          </div>

          {/* PRACTICE EXAM PACKAGES */}
          <div id="pricing-packages">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
                  gap: '24px',
                  marginBottom: '64px',
                }}
              >
                {loadingPackages ? (
                  <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '48px 0', color: 'var(--text-secondary)' }}>
                    Loading official exam packages...
                  </div>
                ) : (() => {
                  const currentDisabled = getDisabledPackageKeys();
                  const isPublicExamPublished = localStorage.getItem('sifo_public_exam_is_published') !== 'false';
                  const source = isPublicExamPublished && packages.length > 0 ? packages : [];
                  const visible = source.filter(
                    (p) =>
                      p.isActive !== false &&
                      (p as any).is_active !== false &&
                      !currentDisabled.has(String(p.key || '').toUpperCase()) &&
                      p.key !== 'UNLIMITED_PASS'
                  );

                  if (visible.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '64px 20px', color: 'var(--text-secondary)' }}>
                        <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                          {language === 'rw' ? 'Nta mapaki y\'ibizamini aboneka ubu.' : 'No practice exam packages are currently available.'}
                        </p>
                        <p style={{ fontSize: '0.88rem' }}>
                          {language === 'rw'
                            ? 'Nyamuneka ongera ugerageze mukanya cyangwa ubaze abashinzwe ubuyobozi.'
                            : 'Please check back shortly or contact administration.'}
                        </p>
                      </div>
                    );
                  }

                    return visible.map((pkg, index) => {
                      const config = getPlanConfig(pkg, index);
                      const rawCount = planCounts[pkg.key] ?? config.defaultCount;
                      const currentCount = config.isEnterprise
                        ? 1
                        : Math.max(config.min, Math.min(config.max, rawCount));
                      const totalPrice = config.isEnterprise ? config.rate : currentCount * config.rate;

                      return (
                        <div
                          key={pkg.key}
                          className="glass-panel"
                          style={{
                            borderRadius: '24px',
                            padding: '32px 28px',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            border: config.isEnterprise ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-medium)',
                            background: config.isEnterprise ? 'rgba(245, 158, 11, 0.04)' : 'rgba(255, 255, 255, 0.03)',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          }}
                        >
                          {/* Plan Badge */}
                          <div
                            style={{
                              position: 'absolute',
                              top: '-12px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              background: config.isEnterprise ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-surface-elevated)',
                              border: config.isEnterprise ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid var(--border-medium)',
                              color: config.isEnterprise ? '#fbbf24' : 'var(--text-primary)',
                              padding: '4px 14px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            }}
                          >
                            {config.badge}
                          </div>

                          {/* Title */}
                          <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                            <h3
                              style={{
                                fontSize: '1.4rem',
                                fontWeight: 800,
                                color: 'var(--text-primary)',
                                margin: 0,
                              }}
                            >
                              {config.isEnterprise ? 'Unlimited Exams' : `${currentCount} Exam`}
                            </h3>
                            {!config.isEnterprise && (
                              <div
                                style={{
                                  fontSize: '0.76rem',
                                  color: 'var(--text-secondary)',
                                  marginTop: '4px',
                                  fontWeight: 600,
                                }}
                              >
                                {config.min}–{config.max} Exams Range
                              </div>
                            )}
                          </div>

                          {/* Price */}
                          <div style={{ margin: '12px 0 24px 0', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  fontSize: '2.4rem',
                                  fontWeight: 800,
                                  color: 'var(--text-primary)',
                                  letterSpacing: '-0.02em',
                                }}
                              >
                                {totalPrice.toLocaleString()}
                              </span>
                              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                RWF
                              </span>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>
                              {config.isEnterprise ? 'Monthly Institutional Pass' : `${config.rate.toLocaleString()} RWF / Exam`}
                            </div>
                          </div>

                          {/* Key Features */}
                          <div style={{ flex: 1, marginBottom: '20px' }}>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {config.isEnterprise ? (
                                <>
                                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                                    <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                                    <span>Unlimited practice exam attempts</span>
                                  </li>
                                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                                    <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                                    <span>Driving schools &amp; academy cohorts</span>
                                  </li>
                                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                                    <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                                    <span>Student certification tracking</span>
                                  </li>
                                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                                    <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                                    <span>Dedicated institutional support</span>
                                  </li>
                                </>
                              ) : (
                                <>
                                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                                    <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                                    <span>20 Questions timed (20 mins)</span>
                                  </li>
                                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                                    <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                                    <span>Instant score &amp; legal rationale</span>
                                  </li>
                                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                                    <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                                    <span>Kinyarwanda, English &amp; French</span>
                                  </li>
                                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                                    <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                                    <span>{guestConfig.creditsNeverExpire !== false ? 'Credits never expire' : 'Credits valid for 30 days'}</span>
                                  </li>
                                </>
                              )}
                            </ul>
                          </div>

                          {/* Stepper or Access Pill centered directly above Buy button */}
                          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                            {config.isEnterprise ? (
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  background: 'rgba(245, 158, 11, 0.12)',
                                  border: '1px solid rgba(245, 158, 11, 0.3)',
                                  borderRadius: '999px',
                                  padding: '6px 16px',
                                  fontSize: '0.82rem',
                                  fontWeight: 800,
                                  color: '#fbbf24',
                                  letterSpacing: '0.02em',
                                  userSelect: 'none',
                                }}
                              >
                                Full Academy Access
                              </div>
                            ) : (
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid var(--border-medium)',
                                  borderRadius: '999px',
                                  padding: '4px 8px',
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleDecrement(pkg, index)}
                                  disabled={currentCount <= config.min}
                                  aria-label={`Decrease exam count for ${config.badge}`}
                                  style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '50%',
                                    border: '1px solid var(--border-medium)',
                                    background: currentCount <= config.min ? 'transparent' : 'rgba(255, 255, 255, 0.08)',
                                    color: currentCount <= config.min ? 'var(--text-muted)' : 'var(--text-primary)',
                                    cursor: currentCount <= config.min ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0,
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  <Minus size={13} />
                                </button>

                                <span
                                  style={{
                                    fontSize: '0.88rem',
                                    fontWeight: 800,
                                    color: 'var(--text-primary)',
                                    minWidth: '58px',
                                    textAlign: 'center',
                                    userSelect: 'none',
                                  }}
                                >
                                  {currentCount} Exam
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleIncrement(pkg, index)}
                                  disabled={currentCount >= config.max}
                                  aria-label={`Increase exam count for ${config.badge}`}
                                  style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '50%',
                                    border: '1px solid var(--border-medium)',
                                    background: currentCount >= config.max ? 'transparent' : 'rgba(255, 255, 255, 0.08)',
                                    color: currentCount >= config.max ? 'var(--text-muted)' : 'var(--text-primary)',
                                    cursor: currentCount >= config.max ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0,
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Buy Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenBuyModal(pkg.key, currentCount)}
                            className="btn btn-primary"
                            style={{
                              width: '100%',
                              padding: '14px',
                              borderRadius: '14px',
                              fontWeight: 700,
                              fontSize: '1rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <span>{t('pricing.buyWithMomo')}</span>
                          </button>
                        </div>
                      );
                    });
                })()}
            </div>
          </div>
        </div>
      </main>

      {/* Buy Exam Package Modal */}
      <BuyPracticeExamsModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        onSuccess={handlePurchaseSuccess}
        defaultPhone={lookupPhone}
        initialPackageKey={selectedPackageKey}
        initialExamCount={selectedExamCount}
      />

      {/* ── Fixed White Mode Modal Dialog for Exam Access & OTP Verification ── */}
      {isAccessModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAccessModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              color: '#111827',
              border: '1px solid #e5e7eb',
              borderRadius: '24px',
              maxWidth: '480px',
              width: '100%',
              padding: '36px 32px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              position: 'relative',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsAccessModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#111827';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              <X size={20} />
            </button>

            {/* ── STEP 1: Candidate Details & Proceed Confirmation ── */}
            {accessModalStep === 'DETAILS' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '18px',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto',
                      border: '1px solid #a7f3d0',
                    }}
                  >
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>
                    {language === 'rw' ? 'Ibizamini Byo Kwitoza Birahari' : 'Active Exam Attempts Found'}
                  </h3>
                </div>

                {/* Candidate Info Vertical List */}
                <div
                  style={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '18px 20px',
                    marginBottom: '26px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>
                      {language === 'rw' ? 'Nimero ya Terefone:' : 'Phone Number:'}
                    </span>
                    <span style={{ fontSize: '0.95rem', color: '#111827', fontWeight: 700, fontFamily: 'monospace' }}>
                      {lookupPhone.trim()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>
                      {language === 'rw' ? 'Ibizamini Bisigaye:' : 'Remaining Exams:'}
                    </span>
                    <span style={{ fontSize: '0.95rem', color: '#111827', fontWeight: 700 }}>
                      {balance?.credits ?? 0}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAccessModalOpen(false)}
                    style={{
                      flex: 1,
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #e5e7eb',
                      color: '#374151',
                      borderRadius: '12px',
                      padding: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    {language === 'rw' ? 'Hagarika' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtpAndShowVerify}
                    disabled={isSendingOtp}
                    style={{
                      flex: 2,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '12px',
                      padding: '12px 18px',
                      fontWeight: 800,
                      cursor: isSendingOtp ? 'not-allowed' : 'pointer',
                      fontSize: '0.92rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                    }}
                  >
                    <ShieldCheck size={18} />
                    <span>
                      {isSendingOtp
                        ? (language === 'rw' ? 'Kohereza Kode...' : 'Sending OTP...')
                        : (language === 'rw' ? 'Komeza' : 'Proceed')}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: OTP Verification ── */}
            {accessModalStep === 'OTP' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '18px',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto',
                      border: '1px solid #a7f3d0',
                    }}
                  >
                    <ShieldCheck size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
                    {language === 'rw' ? 'Emeza Umwirondoro wawe' : 'Security Verification'}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#4b5563', lineHeight: 1.5, margin: 0 }}>
                    {language === 'rw'
                      ? `Kode y'imibare 6 yoherejwe kuri ${lookupPhone.trim()}. Yinjize hano munsi kugira ngo winjire mu cyumba cy'ikizamini.`
                      : `A 6-digit verification code was sent to ${lookupPhone.trim()}. Enter it below to access your examination attempts.`}
                  </p>
                </div>

                <form onSubmit={handleVerifyOtpAndProceed}>
                  <div style={{ marginBottom: '20px' }}>
                    <input
                      type="text"
                      maxLength={6}
                      inputMode="numeric"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="• • • • • •"
                      autoFocus
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        fontSize: '1.85rem',
                        fontWeight: 800,
                        letterSpacing: '0.35em',
                        padding: '14px',
                        borderRadius: '14px',
                        backgroundColor: '#f9fafb',
                        border: '2px solid #e5e7eb',
                        color: '#111827',
                        outline: 'none',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#10b981';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Countdown Timer & Resend */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '26px',
                      fontSize: '0.86rem',
                    }}
                  >
                    <span style={{ color: otpTimeLeft < 60 ? '#dc2626' : '#4b5563', fontWeight: 600 }}>
                      {language === 'rw' ? 'Igihe gisigaye: ' : 'Code valid for: '}
                      {formatOtpTimer(otpTimeLeft)}
                    </span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isResendingOtp || otpTimeLeft > 240}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isResendingOtp || otpTimeLeft > 240 ? '#9ca3af' : '#059669',
                        fontWeight: 700,
                        cursor: isResendingOtp || otpTimeLeft > 240 ? 'not-allowed' : 'pointer',
                        fontSize: '0.86rem',
                      }}
                    >
                      {isResendingOtp
                        ? (language === 'rw' ? 'Kohereza...' : 'Sending...')
                        : (language === 'rw' ? 'Ongera wohereze' : 'Resend Code')}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setAccessModalStep('DETAILS')}
                      style={{
                        flex: 1,
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #e5e7eb',
                        color: '#374151',
                        borderRadius: '12px',
                        padding: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                      }}
                    >
                      {language === 'rw' ? 'Gusubira Inyuma' : 'Back'}
                    </button>
                    <button
                      type="submit"
                      disabled={isVerifyingOtp || otpCode.length < 4}
                      style={{
                        flex: 2,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        color: '#ffffff',
                        borderRadius: '12px',
                        padding: '12px',
                        fontWeight: 700,
                        cursor: isVerifyingOtp || otpCode.length < 4 ? 'not-allowed' : 'pointer',
                        fontSize: '0.92rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        opacity: isVerifyingOtp || otpCode.length < 4 ? 0.7 : 1,
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                      }}
                    >
                      <ArrowRight size={16} />
                      <span>
                        {isVerifyingOtp
                          ? (language === 'rw' ? 'Kwemeza...' : 'Verifying...')
                          : (language === 'rw' ? 'Emeza & Fungura' : 'Verify & Enter Exam Room')}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PricingPage;

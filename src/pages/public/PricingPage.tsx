import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Phone,
  Play,
  Wallet,
  Minus,
  Plus,
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

  // Balance Lookup state
  const [lookupPhone, setLookupPhone] = useState<string>(user?.phoneNumber || '');
  const [balance, setBalance] = useState<ExamCreditBalance | null>(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState<boolean>(false);
  const [isStartingExam, setIsStartingExam] = useState<boolean>(false);

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

  // Pre-fetch balance if user is logged in with a phone number
  useEffect(() => {
    if (user?.phoneNumber) {
      setLookupPhone(user.phoneNumber);
      adminService
        .getPublicExamCredits(user.phoneNumber)
        .then((res) => setBalance(res))
        .catch(() => {});
    }
  }, [user]);

  // Handle checking balance
  const handleCheckBalance = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = lookupPhone.trim();
    if (!clean) {
      toastError(language === 'rw' ? 'Nyamuneka andika numero ya terefone.' : 'Please enter a Rwandan phone number to check credits.');
      return;
    }

    try {
      setIsCheckingBalance(true);
      const res = await adminService.getPublicExamCredits(clean);
      setBalance(res);
      if (res.credits > 0) {
        success(language === 'rw' ? `Ufite ibizamini by'imyitozo ${res.credits} bishobora gukorwa.` : `Found ${res.credits} practice exam credit(s) available.`);
      } else {
        toastError(language === 'rw' ? 'Nta bizamini usigaranye kuri iyi numero. Hitamo package hasi maze ugure.' : 'No active exam credits found for this number. Choose a package below to buy.');
      }
    } catch (err: any) {
      toastError(err?.message || (language === 'rw' ? 'Kureba ibizamini byanze.' : 'Failed to retrieve balance.'));
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

  // Start Exam Immediately
  const handleStartExamNow = async () => {
    const phoneToUse = lookupPhone.trim() || user?.phoneNumber || '';
    if (!phoneToUse && !user) {
      toastError(language === 'rw' ? 'Numero ya terefone irakenewe kugira ngo utangire ikizamini.' : 'Phone number is required to start the exam.');
      return;
    }

    try {
      setIsStartingExam(true);
      const session = await adminService.startPublicPracticeExam(phoneToUse);
      success(language === 'rw' ? 'Ikizamini cyatangiye! Ukatishijwe mu cyumba cy\'ikizamini...' : 'Exam session created! Redirecting to official exam room...');
      navigate(`/examinations/session/${session.id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || (language === 'rw' ? 'Gufungura ikizamini byanze.' : 'Could not start practice exam.');
      toastError(msg);
      if (err?.response?.status === 402) {
        setIsBuyModalOpen(true);
      }
    } finally {
      setIsStartingExam(false);
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

          {/* Quick Credit Lookup & Exam Launch Box */}
          <div
            className="glass-panel"
            style={{
              borderRadius: '20px',
              padding: '24px 32px',
              marginBottom: '48px',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-surface-card)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              boxShadow: 'var(--shadow-md)',
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
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ position: 'relative', minWidth: '240px' }}>
                <input
                  type="tel"
                  value={lookupPhone}
                  onChange={(e) => setLookupPhone(e.target.value)}
                  placeholder="e.g. 0788123456"
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '12px',
                    padding: '10px 14px 10px 38px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    width: '100%',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-glow)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-medium)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <Phone
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isCheckingBalance}
                className="btn btn-secondary btn-md"
                style={{ borderRadius: '12px', padding: '10px 18px', fontWeight: 600 }}
              >
                {isCheckingBalance ? t('pricing.checking') : t('pricing.checkBalance')}
              </button>

              {balance && balance.credits > 0 && (
                <button
                  type="button"
                  onClick={handleStartExamNow}
                  disabled={isStartingExam}
                  className="btn btn-primary pulse-glow"
                  style={{
                    borderRadius: '12px',
                    padding: '10px 20px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  }}
                >
                  <Play size={16} />
                  <span>{isStartingExam ? (language === 'rw' ? 'Gufungura ikizamini...' : 'Launching Exam...') : `${t('pricing.startExam')} (${balance.credits} ${language === 'rw' ? 'bisigaye' : 'left'})`}</span>
                </button>
              )}
            </form>
          </div>

          {/* PRACTICE EXAM PACKAGES */}
          <div>
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

      <Footer />
    </div>
  );
};

export default PricingPage;

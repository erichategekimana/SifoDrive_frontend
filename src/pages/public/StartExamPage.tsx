import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Play,
  History,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import {
  AdminService,
  type ExamCreditBalance,
} from '../../core/services/AdminService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';
import { useTheme } from '../../context/ThemeContext';

interface PastAttempt {
  id: string;
  track?: string;
  status?: string;
  score?: number;
  total_questions?: number;
  passing_score?: number;
  passed?: boolean;
  started_at?: string;
  submitted_at?: string;
  duration_minutes?: number;
}

export const StartExamPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, setLanguage, t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { success, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  // Inherit language and theme from URL query params on initial mount
  useEffect(() => {
    const urlLang = searchParams.get('lang');
    if (urlLang && ['rw', 'en', 'fr'].includes(urlLang)) {
      setLanguage(urlLang as any);
    }
    const urlTheme = searchParams.get('theme');
    if (urlTheme && ['light', 'dark'].includes(urlTheme)) {
      setTheme(urlTheme as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLanguageChange = (newLang: 'rw' | 'en') => {
    setLanguage(newLang);
    try {
      const newParams = new URLSearchParams(window.location.search);
      newParams.set('lang', newLang);
      const cleanUrl = `${window.location.pathname}?${newParams.toString()}${window.location.hash}`;
      window.history.replaceState({}, '', cleanUrl);
    } catch {}
  };

  // Capture candidate token from URL search params synchronously on initialization
  const urlToken = searchParams.get('token');
  if (urlToken) {
    try {
      sessionStorage.setItem('sifo_candidate_access_token', urlToken);
    } catch {}
  }

  // Clean token from URL query string if present
  useEffect(() => {
    try {
      const token = searchParams.get('token');
      if (token) {
        sessionStorage.setItem('sifo_candidate_access_token', token);
        const newParams = new URLSearchParams(window.location.search);
        newParams.delete('token');
        const cleanSearch = newParams.toString();
        const cleanUrl = window.location.pathname + (cleanSearch ? `?${cleanSearch}` : '') + window.location.hash;
        window.history.replaceState({}, '', cleanUrl);
      }
    } catch {}
  }, [searchParams]);

  // Read phone from search params or authenticated user context
  const initialPhone =
    searchParams.get('phone') ||
    user?.phoneNumber ||
    '';

  const [activePhone] = useState<string>(initialPhone);
  const [balance, setBalance] = useState<ExamCreditBalance | null>(null);
  const [historyList, setHistoryList] = useState<PastAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const historySectionRef = useRef<HTMLDivElement>(null);

  const isCandidateAuthorized = Boolean(
    (user && (user.phoneNumber === activePhone || ['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(user.role || ''))) ||
    balance?.is_authorized
  );

  const handleGoToPricing = () => {
    const targetPhone = activePhone.trim() || user?.phoneNumber || '';
    const query = targetPhone
      ? `?phone=${encodeURIComponent(targetPhone)}&lang=${encodeURIComponent(language)}&theme=${encodeURIComponent(theme)}`
      : `?lang=${encodeURIComponent(language)}&theme=${encodeURIComponent(theme)}`;
    navigate(`/pricing${query}`);
  };

  const handleToggleHistory = () => {
    setShowHistory((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          historySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
      return next;
    });
  };

  // Load balance and past attempts for active phone
  const loadCandidateData = useCallback(async (phoneToQuery: string) => {
    const clean = phoneToQuery.trim();
    if (!clean) {
      setBalance(null);
      setHistoryList([]);
      setLoading(false);
      navigate(`/pricing?lang=${encodeURIComponent(language)}&theme=${encodeURIComponent(theme)}`, { replace: true });
      return;
    }

    try {
      setLoading(true);

      const [creditsRes, historyRes] = await Promise.allSettled([
        adminService.getPublicExamCredits(clean, urlToken || undefined),
        adminService.getPublicExamHistory(clean),
      ]);

      let isAuth = false;
      if (creditsRes.status === 'fulfilled') {
        const credData = creditsRes.value;
        setBalance(credData);
        isAuth = Boolean(
          (user && (user.phoneNumber === clean || ['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(user.role || ''))) ||
          credData?.is_authorized
        );
      }

      if (!isAuth) {
        toastError(
          language === 'rw'
            ? 'Uyu murongo ntiwemerewe. Nyamuneka banza winjirire ku rupapuro rw\'ibiciro.'
            : 'Unauthorized access link. Redirecting to pricing...'
        );
        navigate(`/pricing?lang=${encodeURIComponent(language)}&theme=${encodeURIComponent(theme)}`, { replace: true });
        return;
      }

      localStorage.setItem('sifo_last_candidate_phone', clean);
      if (historyRes.status === 'fulfilled') {
        setHistoryList(Array.isArray(historyRes.value) ? historyRes.value : []);
      }
    } catch (err: any) {
      console.warn('Could not load candidate exam data:', err);
      navigate(`/pricing?lang=${encodeURIComponent(language)}&theme=${encodeURIComponent(theme)}`, { replace: true });
    } finally {
      setLoading(false);
    }
  }, [adminService, language, theme, navigate, user, urlToken, toastError]);

  useEffect(() => {
    if (activePhone) {
      loadCandidateData(activePhone);
    } else {
      setLoading(false);
      navigate(`/pricing?lang=${encodeURIComponent(language)}&theme=${encodeURIComponent(theme)}`, { replace: true });
    }
  }, [activePhone, loadCandidateData, language, theme, navigate]);

  // Auto-refresh candidate data whenever user switches back to this tab (e.g. after finishing exam in the other tab)
  useEffect(() => {
    const handleFocus = () => {
      if (activePhone) {
        loadCandidateData(activePhone);
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [activePhone, loadCandidateData]);

  // Launch exam in new tab and auto deduct remaining attempts without overwriting current page
  const handleStartExam = async () => {
    const targetPhone = activePhone.trim() || user?.phoneNumber || '';
    if (!targetPhone) {
      toastError(language === 'rw' ? 'Nyamuneka andika numero yawe ya terefone mbere yo gutangira.' : 'Please enter your phone number to start the exam.');
      return;
    }

    const available = balance?.credits ?? 0;
    if (available <= 0) {
      toastError(language === 'rw' ? 'Nta bizamini byo kwitoza usigaranye. Gura ibindi kugira ngo utangire.' : 'You have 0 exam attempts remaining. Please purchase an exam package to continue.');
      handleGoToPricing();
      return;
    }

    try {
      setIsStarting(true);
      const session = await adminService.startPublicPracticeExam(targetPhone);
      
      // Auto deduct remaining attempts immediately locally & resync with backend
      setBalance((prev) => (prev ? { ...prev, credits: Math.max(0, prev.credits - 1) } : prev));
      loadCandidateData(targetPhone);

      success(
        language === 'rw'
          ? 'Ikizamini kiratangiye! Gikinguwe mu idirishya rishya...'
          : 'Exam session initialized! Launched in a new tab...'
      );

      if (session?.session_token) {
        try {
          sessionStorage.setItem('sifo_active_exam_token', session.session_token);
          sessionStorage.setItem('sifo_exam_session_token', session.session_token);
          sessionStorage.setItem(`sifo_exam_token_${session.id}`, session.session_token);
        } catch {}
      }

      // Launch exam on new tab with candidate language and session authorization token
      const sessionTokenParam = session.session_token ? `&token=${encodeURIComponent(session.session_token)}` : '';
      const examUrl = `/examinations/session/${session.id}?lang=${encodeURIComponent(language)}&theme=${encodeURIComponent(theme)}&phone=${encodeURIComponent(targetPhone)}${sessionTokenParam}`;
      window.open(examUrl, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || (language === 'rw' ? 'Gufungura ikizamini byanze.' : 'Could not start exam session.');
      toastError(msg);
      if (err?.response?.status === 402) {
        handleGoToPricing();
      }
    } finally {
      setIsStarting(false);
    }
  };

  const remainingCredits = balance?.credits ?? 0;
  const passedAttempts = historyList.filter((a) => a.passed || (a.score !== undefined && a.score >= 12)).length;
  const totalCompleted = historyList.length;
  const failedAttempts = totalCompleted - passedAttempts;

  // Calculate pass rate percentage
  const passRatePercent = totalCompleted > 0
    ? Math.round((passedAttempts / totalCompleted) * 100)
    : 100; // default 100% baseline when starting

  // Donut SVG parameters
  const radius = 65;
  const circumference = 2 * Math.PI * radius; // ~408.4
  const passedRatio = totalCompleted > 0 ? passedAttempts / totalCompleted : 1;
  const passedArcLength = passedRatio * circumference;
  const failedArcLength = circumference - passedArcLength;

  // Split divider line angle if both pass and fail exist
  const splitAngleDeg = totalCompleted > 0 && failedAttempts > 0
    ? -90 + (passedRatio * 360)
    : null;

  const splitRad = splitAngleDeg !== null ? (splitAngleDeg * Math.PI) / 180 : 0;
  const splitX1 = 100 + 46 * Math.cos(splitRad);
  const splitY1 = 100 + 46 * Math.sin(splitRad);
  const splitX2 = 100 + 84 * Math.cos(splitRad);
  const splitY2 = 100 + 84 * Math.sin(splitRad);
  const isLight = theme === 'light';
  const c = {
    bgPage: isLight ? '#f9fafb' : '#090d16',
    bgHeader: isLight ? '#ffffff' : '#0c1222',
    borderHeader: isLight ? '#e5e7eb' : '#1e293b',
    bgCard: isLight ? '#ffffff' : '#111827',
    borderCard: isLight ? '#e5e7eb' : '#1f2937',
    bgSubCard: isLight ? '#f9fafb' : '#1f2937',
    borderSubCard: isLight ? '#e5e7eb' : '#374151',
    textPrimary: isLight ? '#111827' : '#ffffff',
    textSecondary: isLight ? '#4b5563' : '#9ca3af',
    textMuted: isLight ? '#6b7280' : '#64748b',
    bgBadge: isLight ? '#f3f4f6' : '#1f2937',
    borderBadge: isLight ? '#e5e7eb' : '#374151',
    bgBtnSecondary: isLight ? '#f3f4f6' : '#1f2937',
    borderBtnSecondary: isLight ? '#e5e7eb' : '#374151',
    textBtnSecondary: isLight ? '#1f2937' : '#e5e7eb',
    divider: isLight ? '#e5e7eb' : '#1f2937',
    shadowCard: isLight ? '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)' : 'none',
    brandColor: isLight ? '#0284c7' : '#38bdf8',
    // Snapshot sidebar
    snapshotBg: isLight ? '#0f4d63' : '#093645',
    snapshotBorder: isLight ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.1)',
  };

  // Guard unauthorized visitors or loading state: Never render candidate info or ready room if not authorized
  if (loading || !isCandidateAuthorized) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isLight ? '#f8fafc' : '#030712',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <RefreshCw size={36} className="animate-spin" color={c.brandColor} />
          <p style={{ color: c.textSecondary, fontSize: '0.95rem' }}>
            {language === 'rw' ? 'Kugenzura uburenganzira bwo kwinjira...' : 'Verifying authorized access...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: c.bgPage,
        color: c.textPrimary,
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}
    >
      <style>{`
        @media (max-width: 960px) {
          .start-exam-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .start-exam-sidebar {
            order: -1;
            margin-bottom: 24px;
          }
        }
      `}</style>

      {/* Minimal Top Header with Language Dropdown & Exit Button */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          borderBottom: `1px solid ${c.borderHeader}`,
          backgroundColor: c.bgHeader,
          padding: '16px 24px',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: c.brandColor, letterSpacing: '-0.02em' }}>
              SIFO DRIVE
            </span>
            <span style={{ color: c.textMuted }}>/</span>
            <span style={{ fontSize: '0.9rem', color: c.textSecondary, fontWeight: 600 }}>
              {t('examLifecycle.readyRoom.breadcrumbCategory')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Language Selector Dropdown */}
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as any)}
              style={{
                backgroundColor: c.bgBadge,
                color: c.textPrimary,
                border: `1px solid ${c.borderBadge}`,
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="rw">Kinyarwanda</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>

            <button
              type="button"
              onClick={() => navigate('/pricing')}
              style={{
                background: 'transparent',
                border: 'none',
                color: c.textSecondary,
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ArrowLeft size={16} />
              <span>{t('examLifecycle.readyRoom.exitToPricing')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Examination Center: Split into 2 distinct parts */}
      <main style={{ position: 'relative', zIndex: 1, flex: 1, padding: '36px 0 60px 0' }}>
        <div
          className="start-exam-layout-grid"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 350px',
            gap: '32px',
            alignItems: 'start',
          }}
        >
          {/* ── LEFT COLUMN: Main Controls & Content ── */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Header Title */}
            <div style={{ marginBottom: '20px' }}>
              <h1
                style={{
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.3rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  margin: 0,
                  color: c.textPrimary,
                }}
              >
                {t('examLifecycle.readyRoom.pageTitle')}
              </h1>
            </div>

            {/* User Info (Candidate Name & Phone Number) */}
            <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {balance?.full_name && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                    {t('examLifecycle.readyRoom.candidateName')}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: c.textPrimary, marginTop: '2px' }}>
                    {balance.full_name}
                  </div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.8rem', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  {t('examLifecycle.readyRoom.userPhoneNumber')}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: c.textPrimary, marginTop: '2px' }}>
                  {activePhone || t('examLifecycle.readyRoom.noPhoneSelected')}
                </div>
              </div>
            </div>

            {/* Primary Action Card: Remaining Attempts & Start Exam */}
            <div
                style={{
                  backgroundColor: c.bgCard,
                  border: `1px solid ${c.borderCard}`,
                  borderRadius: '16px',
                  padding: '32px 28px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  gap: '18px',
                  boxShadow: c.shadowCard,
                }}
              >
                {/* Number of Remaining Attempts Badge */}
                <div
                  style={{
                    display: 'inline-block',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    backgroundColor: c.bgBadge,
                    border: `1px solid ${c.borderBadge}`,
                    color: c.textPrimary,
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    letterSpacing: '0.01em',
                  }}
                >
                  {loading
                    ? t('examLifecycle.readyRoom.checkingAttempts')
                    : (remainingCredits === 1
                      ? (language === 'rw' ? 'Ikizamini 1 Gisigaye' : '1 Attempt Remaining')
                      : (language === 'rw' ? `Ibizamini ${remainingCredits} Bisigaye` : `${remainingCredits} Attempts Remaining`))}
                </div>

                <div>
                  <p style={{ fontSize: '0.96rem', color: c.textSecondary, margin: 0, lineHeight: 1.6 }}>
                    {remainingCredits > 0
                      ? t('examLifecycle.readyRoom.activeInstructions')
                      : t('examLifecycle.readyRoom.zeroCreditsInstructions')}
                  </p>
                </div>

                {/* ACTION BUTTONS */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {remainingCredits > 0 ? (
                    <button
                      type="button"
                      onClick={handleStartExam}
                      disabled={isStarting}
                      style={{
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '15px 36px',
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        cursor: isStarting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                      }}
                    >
                      <Play size={20} fill="#ffffff" />
                      <span>{isStarting ? t('examLifecycle.readyRoom.launchingBtn') : t('examLifecycle.readyRoom.startExamBtn')}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGoToPricing}
                      style={{
                        backgroundColor: c.bgBtnSecondary,
                        color: c.textBtnSecondary,
                        border: `1px solid ${c.borderBtnSecondary}`,
                        borderRadius: '10px',
                        padding: '15px 30px',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {t('examLifecycle.readyRoom.buyExamCreditsBtn')}
                    </button>
                  )}

                  {/* History Button */}
                  <button
                    type="button"
                    onClick={handleToggleHistory}
                    style={{
                      backgroundColor: showHistory ? (isLight ? '#e5e7eb' : '#374151') : c.bgBtnSecondary,
                      color: c.textBtnSecondary,
                      border: `1px solid ${c.borderBtnSecondary}`,
                      borderRadius: '10px',
                      padding: '15px 22px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <History size={18} />
                    <span>{`${t('examLifecycle.readyRoom.historyBtn')} (${totalCompleted})`}</span>
                    {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {/* Buy More Attempts Button */}
                  <button
                    type="button"
                    onClick={handleGoToPricing}
                    style={{
                      backgroundColor: c.bgBtnSecondary,
                      color: c.textBtnSecondary,
                      border: `1px solid ${c.borderBtnSecondary}`,
                      borderRadius: '10px',
                      padding: '15px 22px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {t('examLifecycle.readyRoom.buyMoreAttemptsBtn')}
                  </button>
                </div>
              </div>

            {/* Other Details / Exam Specifications */}
            <div
              style={{
                backgroundColor: c.bgCard,
                border: `1px solid ${c.borderCard}`,
                borderRadius: '12px',
                padding: '24px',
                boxShadow: c.shadowCard,
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: c.textPrimary, margin: '0 0 16px 0' }}>
                {t('examLifecycle.readyRoom.detailsAndRulesTitle')}
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '12px',
                }}
              >
                <div style={{ backgroundColor: c.bgSubCard, border: `1px solid ${c.borderSubCard}`, padding: '12px 14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: c.textSecondary, textTransform: 'uppercase', fontWeight: 700 }}>
                    {t('examLifecycle.readyRoom.questionsLabel')}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: c.textPrimary, marginTop: '2px' }}>
                    {t('examLifecycle.readyRoom.questionsValue')}
                  </div>
                </div>

                <div style={{ backgroundColor: c.bgSubCard, border: `1px solid ${c.borderSubCard}`, padding: '12px 14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: c.textSecondary, textTransform: 'uppercase', fontWeight: 700 }}>
                    {t('examLifecycle.readyRoom.timeLimitLabel')}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: c.textPrimary, marginTop: '2px' }}>
                    {t('examLifecycle.readyRoom.timeLimitValue')}
                  </div>
                </div>

                <div style={{ backgroundColor: c.bgSubCard, border: `1px solid ${c.borderSubCard}`, padding: '12px 14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: c.textSecondary, textTransform: 'uppercase', fontWeight: 700 }}>
                    {t('examLifecycle.readyRoom.passMarkLabel')}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: c.textPrimary, marginTop: '2px' }}>
                    {t('examLifecycle.readyRoom.passMarkValue')}
                  </div>
                </div>

                <div style={{ backgroundColor: c.bgSubCard, border: `1px solid ${c.borderSubCard}`, padding: '12px 14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: c.textSecondary, textTransform: 'uppercase', fontWeight: 700 }}>
                    {t('examLifecycle.readyRoom.languagesLabel')}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: c.textPrimary, marginTop: '2px' }}>
                    RW / EN / FR
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: Pass vs Fail Performance Snapshot Card ── */}
          <div className="start-exam-sidebar" style={{ position: 'sticky', top: '24px' }}>
            <div
              style={{
                backgroundColor: c.snapshotBg,
                border: `1px solid ${c.snapshotBorder}`,
                borderRadius: '20px',
                padding: '24px 22px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              {/* Card Header */}
              <div>
                <div style={{ fontSize: '0.82rem', color: '#67e8f9', fontWeight: 600, marginBottom: '4px' }}>
                  {t('examLifecycle.readyRoom.performanceSnapshotTitle')}
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {t('examLifecycle.readyRoom.passVsFail')}
                </h2>
              </div>

                  {/* Legend Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '24px',
                      padding: '4px 0',
                    }}
                  >
                    {/* Passed Legend */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '14px',
                          borderRadius: '3px',
                          backgroundColor: '#5eead4',
                        }}
                      />
                      <span style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}>
                        {t('examLifecycle.readyRoom.passed')}
                      </span>
                    </div>

                    {/* Failed Legend */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '14px',
                          borderRadius: '3px',
                          backgroundColor: '#f87171',
                        }}
                      />
                      <span style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}>
                        {t('examLifecycle.readyRoom.failed')}
                      </span>
                    </div>
                  </div>

                  {/* Donut Chart Visual */}
                  <div style={{ position: 'relative', width: '220px', height: '220px', margin: '8px auto' }}>
                    <svg
                      viewBox="0 0 200 200"
                      style={{
                        width: '100%',
                        height: '100%',
                        transform: 'rotate(-90deg)',
                      }}
                    >
                      {/* Passed Arc */}
                      <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke="#5eead4"
                        strokeWidth="38"
                        strokeDasharray={`${passedArcLength} ${circumference}`}
                        strokeDashoffset="0"
                      />

                      {/* Failed Arc */}
                      {totalCompleted > 0 && failedAttempts > 0 && (
                        <circle
                          cx="100"
                          cy="100"
                          r={radius}
                          fill="none"
                          stroke="#f87171"
                          strokeWidth="38"
                          strokeDasharray={`${failedArcLength} ${circumference}`}
                          strokeDashoffset={`${-passedArcLength}`}
                        />
                      )}

                      {/* Outer White Contour */}
                      <circle
                        cx="100"
                        cy="100"
                        r="84"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                        opacity="0.9"
                      />

                      {/* Inner White Contour */}
                      <circle
                        cx="100"
                        cy="100"
                        r="46"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                        opacity="0.9"
                      />

                      {/* 12 o'clock radial white divider line */}
                      <line
                        x1="100"
                        y1="16"
                        x2="100"
                        y2="54"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />

                      {/* Split angle radial divider line if both passed and failed exist */}
                      {splitAngleDeg !== null && (
                        <line
                          x1={splitX1}
                          y1={splitY1}
                          x2={splitX2}
                          y2={splitY2}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      )}
                    </svg>
                  </div>

                  {/* Bottom Metrics Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      paddingTop: '6px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '3px' }}>
                        {t('examLifecycle.readyRoom.passRate')}
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
                        {passRatePercent}%
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '3px' }}>
                        {t('examLifecycle.readyRoom.passMark')}
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
                        12/20
                      </div>
                    </div>
                  </div>
            </div>

            {/* Quick summary below card */}
              <div
                style={{
                  marginTop: '14px',
                  backgroundColor: c.bgCard,
                  border: `1px solid ${c.borderCard}`,
                  borderRadius: '12px',
                  padding: '14px 18px',
                  fontSize: '0.85rem',
                  color: c.textSecondary,
                  display: 'flex',
                  justifyContent: 'space-between',
                  boxShadow: c.shadowCard,
                }}
              >
                <div>
                  <span>{`${t('examLifecycle.readyRoom.totalAttempts')}: `}</span>
                  <strong style={{ color: c.textPrimary }}>{totalCompleted}</strong>
                </div>
                <div>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>
                    {passedAttempts} {t('examLifecycle.readyRoom.passShort')}
                  </span>
                  <span> • </span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>
                    {failedAttempts} {t('examLifecycle.readyRoom.failShort')}
                  </span>
                </div>
              </div>
            </div>
          </div>

        {/* ── PART 2: Past Exam Attempts (Separated by a full-width line) ── */}
        {showHistory && (
          <div ref={historySectionRef}>
            {/* Small division line stretching all way to left and right side with space above and below */}
            <div
              style={{
                width: '100%',
                margin: '48px 0',
                borderTop: `1px solid ${c.divider}`,
              }}
            />

            {/* Part 2 Content Container */}
            <div
              style={{
                maxWidth: '1280px',
                margin: '0 auto',
                padding: '0 24px',
              }}
            >
              <div
                style={{
                  backgroundColor: c.bgCard,
                  border: `1px solid ${c.borderCard}`,
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: c.shadowCard,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '14px',
                    borderBottom: `1px solid ${c.borderCard}`,
                    marginBottom: '16px',
                  }}
                >
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: c.textPrimary }}>
                    {t('examLifecycle.readyRoom.pastAttemptsTitle')}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: c.textMuted }}>
                    {totalCompleted}{' '}
                    {totalCompleted === 1
                      ? t('examLifecycle.readyRoom.attemptRecorded')
                      : t('examLifecycle.readyRoom.attemptsRecorded')}
                  </span>
                </div>

                {historyList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 12px', color: c.textSecondary, fontSize: '0.92rem' }}>
                    {t('examLifecycle.readyRoom.noPastAttempts')}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {historyList.map((attempt, idx) => {
                      const score = attempt.score ?? 0;
                      const total = attempt.total_questions || 20;
                      const isPassed = attempt.passed ?? score >= 12;
                      const dateStr = attempt.submitted_at || attempt.started_at;
                      const formattedDate = dateStr
                        ? new Date(dateStr).toLocaleDateString(language === 'rw' ? 'rw-RW' : undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : t('examLifecycle.readyRoom.recentDate');

                      return (
                        <div
                          key={attempt.id || idx}
                          style={{
                            backgroundColor: c.bgSubCard,
                            border: isPassed ? '1px solid #10b981' : '1px solid #ef4444',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: c.textPrimary }}>
                                {`${t('examLifecycle.readyRoom.scoreLabel')}: ${score} / ${total}`}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: isPassed ? (isLight ? '#dcfce7' : '#064e3b') : (isLight ? '#fee2e2' : '#7f1d1d'),
                                  color: isPassed ? (isLight ? '#15803d' : '#34d399') : (isLight ? '#b91c1c' : '#f87171'),
                                }}
                              >
                                {isPassed
                                  ? t('examLifecycle.readyRoom.passedBadge')
                                  : t('examLifecycle.readyRoom.failedBadge')}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: c.textSecondary, marginTop: '2px' }}>
                              {`${t('examLifecycle.readyRoom.dateLabel')}: ${formattedDate}`}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const token = sessionStorage.getItem('sifo_candidate_access_token');
                              const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
                              const targetUrl = `/examinations/review/${attempt.id}?phone=${encodeURIComponent(activePhone)}${tokenParam}`;
                              window.open(targetUrl, '_blank', 'noopener,noreferrer');
                            }}
                            style={{
                              backgroundColor: isLight ? '#f3f4f6' : '#374151',
                              color: c.textPrimary,
                              border: isLight ? '1px solid #d1d5db' : 'none',
                              borderRadius: '6px',
                              padding: '7px 14px',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span>{t('examLifecycle.readyRoom.reviewAnswersBtn')}</span>
                            <ExternalLink size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StartExamPage;

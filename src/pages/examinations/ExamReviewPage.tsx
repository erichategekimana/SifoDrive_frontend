import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Printer,
  X,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  AdminService,
  type CandidateSessionItem,
  type CandidateExamQuestionItem,
} from '../../core/services/AdminService';
import { useTranslation } from '../../context/I18nContext';

export const ExamReviewPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';

  const { t } = useTranslation();
  const adminService = AdminService.getInstance();
  const [session, setSession] = useState<CandidateSessionItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [language, setLanguage] = useState<'RW' | 'EN' | 'FR'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang')?.toUpperCase();
      if (urlLang === 'EN' || urlLang === 'FR' || urlLang === 'RW') {
        return urlLang as 'RW' | 'EN' | 'FR';
      }
    } catch {}
    return 'RW';
  });
  const [verifiedName, setVerifiedName] = useState<string>('');

  useEffect(() => {
    document.title = 'Sifo Driving Academy';
    if (!sessionId) {
      setErrorMsg('No session ID provided.');
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      if (urlToken && sessionId) {
        sessionStorage.setItem(`sifo_exam_token_${sessionId}`, urlToken);
        sessionStorage.setItem('sifo_active_exam_token', urlToken);
        sessionStorage.setItem('sifo_candidate_access_token', urlToken);
        params.delete('token');
        const newSearch = params.toString();
        const cleanUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
        window.history.replaceState({}, '', cleanUrl);
      }
    } catch {}

    const loadSession = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        const res = await adminService.getCandidateSession(sessionId);
        setSession(res);

        // If session didn't return a verified candidate name, look up verified identity by phone
        const rawPhone = res?.candidate_phone || phoneParam || (res as any)?.student_id || '';
        const currentName = res?.candidate_name;
        if (rawPhone && (!currentName || currentName === 'Candidate' || currentName === rawPhone)) {
          try {
            const credits = await adminService.getPublicExamCredits(rawPhone);
            if (credits?.full_name) {
              setVerifiedName(credits.full_name);
            }
          } catch {}
        }
      } catch (err: any) {
        console.warn('Failed to load session review:', err);
        setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to load exam review.');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId, adminService, phoneParam]);

  const score = session?.score ?? 0;
  const totalQuestions = session?.total_questions || session?.questions?.length || 20;

  // Candidate Name & Phone
  const rawPhone = session?.candidate_phone || phoneParam || (session as any)?.student_id || '';
  const candidatePhone = rawPhone || 'Not registered';

  const rawName = session?.candidate_name || verifiedName;
  const candidateName =
    rawName && rawName !== 'Candidate' && rawName !== rawPhone
      ? rawName
      : verifiedName || 'Candidate';

  // Format Dates
  const submittedDate = session?.submitted_at
    ? new Date(session.submitted_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : session?.started_at
    ? new Date(session.started_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent Session';

  // Helper text resolution for multilingual questions
  const getQuestionText = (q: CandidateExamQuestionItem) => {
    if (language === 'RW' && q.question_text_kinyarwanda?.trim()) return q.question_text_kinyarwanda;
    if (language === 'FR' && q.question_text_french?.trim()) return q.question_text_french;
    return q.question_text || q.question_text_kinyarwanda || q.question_text_french || '';
  };

  const getOptionText = (q: CandidateExamQuestionItem, opt: 'a' | 'b' | 'c' | 'd') => {
    if (language === 'RW') {
      const val = (q as any)[`option_${opt}_kinyarwanda`];
      if (val?.trim()) return val;
    }
    if (language === 'FR') {
      const val = (q as any)[`option_${opt}_french`];
      if (val?.trim()) return val;
    }
    return (q as any)[`option_${opt}`] || '';
  };

  const getExplanation = (q: CandidateExamQuestionItem) => {
    if (language === 'RW' && q.explanation_kinyarwanda?.trim()) return q.explanation_kinyarwanda;
    if (language === 'FR' && q.explanation_french?.trim()) return q.explanation_french;
    return q.explanation || q.explanation_kinyarwanda || q.explanation_french || '';
  };

  const questions = session?.questions || [];

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          color: '#111827',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e5e7eb',
            borderTopColor: '#0284c7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <div style={{ color: '#4b5563', fontSize: '0.95rem', fontWeight: 600 }}>
          {t('examLifecycle.review.loadingResults')}
        </div>
      </div>
    );
  }

  if (errorMsg || !session) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          color: '#111827',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <AlertCircle size={44} color="#dc2626" />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '16px 0 8px 0', color: '#111827' }}>
          {t('examLifecycle.review.reviewNotFoundTitle')}
        </h2>
        <p style={{ color: '#4b5563', fontSize: '0.9rem', margin: '0 0 20px 0', maxWidth: '420px' }}>
          {errorMsg || t('examLifecycle.review.reviewNotFoundMessage')}
        </p>
        <button
          type="button"
          onClick={() => window.close()}
          style={{
            backgroundColor: '#f3f4f6',
            color: '#111827',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '9px 18px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {t('examLifecycle.review.closeBtn')}
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        color: '#111827',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background-color: #ffffff !important; }
        }
      `}</style>

      {/* ── TOPBAR: Brand, Language Dropdown, Print, Close ── */}
      <header
        className="no-print"
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '14px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7', letterSpacing: '-0.02em' }}>
              SIFO DRIVE
            </span>
            <span style={{ color: '#9ca3af' }}>/</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>
              {language === 'FR' ? 'Révision des Réponses' : t('examLifecycle.review.brandSubTitle')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Language Dropdown */}
            <select
              id="review-language-select"
              aria-label="Select Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'RW' | 'EN' | 'FR')}
              style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#111827',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="RW">Kinyarwanda</option>
              <option value="EN">English</option>
              <option value="FR">Français</option>
            </select>

            {/* Print Button */}
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                backgroundColor: '#ffffff',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Printer size={15} />
              <span>{language === 'FR' ? 'Imprimer / PDF' : t('examLifecycle.review.printPdfBtn')}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => window.close()}
              style={{
                backgroundColor: '#ffffff',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <X size={15} />
              <span>{language === 'FR' ? 'Fermer' : t('examLifecycle.review.closeBtn')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── BODY: Document Presentation (No Containers, Neat Alignment) ── */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '36px 24px 80px 24px' }}>
        {/* ── USER INFO: Names, Phone number, Score, Date (No bullets, only titles bolded) ── */}
        <div
          style={{
            margin: '0 0 32px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingBottom: '24px',
            borderBottom: '2px solid #64748b',
          }}
        >
          {/* 1. Names */}
          <div style={{ fontSize: '1rem', color: '#111827', lineHeight: 1.6 }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>{`${t('examLifecycle.review.namesLabel')}: `}</span>
            <span style={{ fontWeight: 400, color: '#374151' }}>{candidateName}</span>
          </div>

          {/* 2. Phone number */}
          <div style={{ fontSize: '1rem', color: '#111827', lineHeight: 1.6 }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>{`${t('examLifecycle.review.phoneLabel')}: `}</span>
            <span style={{ fontWeight: 400, color: '#374151' }}>{candidatePhone}</span>
          </div>

          {/* 3. Score */}
          <div style={{ fontSize: '1rem', color: '#111827', lineHeight: 1.6 }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>{`${t('examLifecycle.review.scoreLabel')}: `}</span>
            <span style={{ fontWeight: 400, color: '#374151' }}>
              {score} / {totalQuestions}
            </span>
          </div>

          {/* 4. Date */}
          <div style={{ fontSize: '1rem', color: '#111827', lineHeight: 1.6 }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>{`${t('examLifecycle.review.dateLabel')}: `}</span>
            <span style={{ fontWeight: 400, color: '#374151' }}>{submittedDate}</span>
          </div>
        </div>

        {/* ── QUESTIONS AND INDENTED ANSWERS (No Containers) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {questions.map((q) => {
            const selected = (q.selected_option || '').trim().toUpperCase();
            const correct = (q.correct_option || 'A').trim().toUpperCase();
            const isQuestionCorrect = selected === correct && Boolean(selected);

            return (
              <div
                key={q.sequence_number || q.id}
                style={{
                  paddingBottom: '28px',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* ── QUESTION HEADER (Bolded) ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 800, // Question is bolded!
                      color: '#111827',
                      lineHeight: 1.5,
                      flex: 1,
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>{q.sequence_number}.</span>
                    <span>{getQuestionText(q)}</span>
                  </div>

                  {/* Pass/Fail mark indicator */}
                  <div style={{ flexShrink: 0, marginTop: '2px' }}>
                    {isQuestionCorrect ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#15803d',
                          backgroundColor: '#dcfce7',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        <CheckCircle2 size={13} />
                        <span>{language === 'FR' ? 'Correct (+1)' : t('examLifecycle.review.correctPointBadge')}</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#b91c1c',
                          backgroundColor: '#fee2e2',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        <XCircle size={13} />
                        <span>{language === 'FR' ? 'Incorrect (0)' : t('examLifecycle.review.incorrectPointBadge')}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Image (Traffic Sign / Intersection Diagram if present) */}
                {q.image && (
                  <div style={{ marginLeft: '24px', marginTop: '4px', marginBottom: '4px' }}>
                    <img
                      src={q.image}
                      alt="Traffic sign diagram"
                      style={{
                        maxHeight: '180px',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#ffffff',
                      }}
                    />
                  </div>
                )}

                {/* ── ANSWERS (Indented under the question and unbolded) ── */}
                <div
                  style={{
                    marginLeft: '24px', // Indented under the question
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                    const optText = getOptionText(q, optKey.toLowerCase() as any);
                    if (!optText) return null;

                    const isThisSelected = selected === optKey;
                    const isThisCorrect = correct === optKey;

                    return (
                      <div
                        key={optKey}
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '10px',
                          fontSize: '0.95rem',
                          fontWeight: 400, // Answers are unbolded!
                          color: isThisCorrect
                            ? '#15803d'
                            : isThisSelected && !isThisCorrect
                            ? '#b91c1c'
                            : '#374151',
                          lineHeight: 1.45,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: isThisCorrect ? '#15803d' : isThisSelected ? '#b91c1c' : '#6b7280',
                            flexShrink: 0,
                          }}
                        >
                          {optKey}.
                        </span>

                        <span style={{ flex: 1 }}>{optText}</span>

                        {isThisCorrect && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#15803d',
                              backgroundColor: '#dcfce7',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              flexShrink: 0,
                            }}
                          >
                            ✓ {language === 'FR' ? 'Bonne Réponse' : t('examLifecycle.review.correctKeyBadge')}
                          </span>
                        )}

                        {isThisSelected && !isThisCorrect && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#b91c1c',
                              backgroundColor: '#fee2e2',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              flexShrink: 0,
                            }}
                          >
                            ✗ {language === 'FR' ? 'Votre Choix' : t('examLifecycle.review.yourChoiceBadge')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ── EXPLANATION (Indented & Unbolded) ── */}
                {getExplanation(q) && (
                  <div
                    style={{
                      marginLeft: '24px', // Indented under question & answers
                      marginTop: '6px',
                      padding: '8px 12px',
                      backgroundColor: '#f8fafc',
                      borderLeft: '3px solid #0284c7',
                      fontSize: '0.88rem',
                      fontWeight: 400, // Unbolded
                      color: '#334155',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong style={{ fontWeight: 700, color: '#0369a1' }}>
                      {`${t('examLifecycle.review.explanationPrefix')}: `}
                    </strong>
                    {getExplanation(q)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ExamReviewPage;

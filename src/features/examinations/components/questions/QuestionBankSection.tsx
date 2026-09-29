import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  HelpCircle,
  Edit3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  AdminService,
  type AdminQuizQuestionItem,
  type PaginatedResult,
} from '../../../../core/services/AdminService';
import { Spinner } from '../../../../components/common/Spinner';
import { useToast } from '../../../../context/ToastContext';
import { useTranslation } from '../../../../context/I18nContext';
import { DOMAIN_LABELS_KINYARWANDA, DIFFICULTY_LABELS_KINYARWANDA } from '../../constants/examConstants';
import { QuestionEditModal } from './QuestionEditModal';

export const QuestionBankSection: React.FC = () => {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const adminService = AdminService.getInstance();

  const [questionsData, setQuestionsData] = useState<PaginatedResult<AdminQuizQuestionItem>>({ count: 0, results: [] });
  const [isQuestionsLoading, setIsQuestionsLoading] = useState<boolean>(false);
  const [questionSearch, setQuestionSearch] = useState<string>('');
  const [domainFilter, setDomainFilter] = useState<string>('ALL');
  const [questionPage, setQuestionPage] = useState<number>(1);

  // Edit question modal state
  const [editQuestionModalOpen, setEditQuestionModalOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<AdminQuizQuestionItem | null>(null);

  const getDomainLabel = (domain: string) => {
    const key = `admin.examinations.domains.${domain}`;
    const translated = t(key);
    return translated !== key ? translated : (DOMAIN_LABELS_KINYARWANDA[domain] || domain);
  };

  const getDifficultyLabel = (diff: string) => {
    const key = `admin.examinations.difficulties.${diff}`;
    const translated = t(key);
    return translated !== key ? translated : (DIFFICULTY_LABELS_KINYARWANDA[diff] || diff);
  };

  const fetchQuestions = useCallback(async () => {
    try {
      setIsQuestionsLoading(true);
      const params: Record<string, any> = { page: questionPage, page_size: 20 };
      if (domainFilter !== 'ALL') params.domain = domainFilter;
      if (questionSearch.trim()) params.search = questionSearch.trim();

      const data = await adminService.getQuestionBank(params);
      setQuestionsData(data);
    } catch (err: any) {
      showToast(err?.message || 'Failed to load question bank', 'error');
    } finally {
      setIsQuestionsLoading(false);
    }
  }, [questionPage, domainFilter, questionSearch]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleOpenEditQuestion = (question: AdminQuizQuestionItem) => {
    setEditingQuestion(question);
    setEditQuestionModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Question Bank Header & Filter */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          border: '1px solid rgba(56, 189, 248, 0.2)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
            Ububiko bw'Ibibazo by'Amategeko y'Umuhanda (Ibibazo 400+)
          </h2>
          <p style={{ margin: '5px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Gukosora amakosa y'imyandikire, amahitamo y'ibisubizo, ibishushanyo by'ibyapa, n'ibisobanuro mu Kinyarwanda.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Questions in Kinyarwanda */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '8px',
              padding: '6px 12px',
              minWidth: '280px',
            }}
          >
            <Search size={16} color="#38bdf8" style={{ marginRight: '8px' }} />
            <input
              type="text"
              placeholder={t('admin.examinations.searchQuestionPlaceholder')}
              value={questionSearch}
              onChange={(e) => setQuestionSearch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          {/* Domain Filter */}
          <select
            value={domainFilter}
            onChange={(e) => {
              setDomainFilter(e.target.value);
              setQuestionPage(1);
            }}
            style={{
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: 'var(--text-primary)',
              padding: '7px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          >
            <option value="ALL">{getDomainLabel('ALL')}</option>
            <option value="ROAD_SIGNS">{getDomainLabel('ROAD_SIGNS')}</option>
            <option value="PRIORITY">{getDomainLabel('PRIORITY')}</option>
            <option value="SPEED">{getDomainLabel('SPEED')}</option>
            <option value="LIGHTS">{getDomainLabel('LIGHTS')}</option>
            <option value="OVERTAKING">{getDomainLabel('OVERTAKING')}</option>
            <option value="PARKING">{getDomainLabel('PARKING')}</option>
            <option value="CROSSINGS">{getDomainLabel('CROSSINGS')}</option>
            <option value="GENERAL_RULES">{getDomainLabel('GENERAL_RULES')}</option>
            <option value="ACCIDENTS">{getDomainLabel('ACCIDENTS')}</option>
          </select>
        </div>
      </div>

      {/* Question Cards Grid */}
      {isQuestionsLoading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Spinner size={36} />
          <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>{t('admin.examinations.loadingQuestions')}</p>
        </div>
      ) : questionsData.results.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <HelpCircle size={48} style={{ opacity: 0.3, marginBottom: '12px', color: '#38bdf8' }} />
          <p>{t('admin.examinations.noQuestionsFound')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '16px' }}>
          {questionsData.results.map((q) => (
            <div
              key={q.id}
              className="glass-panel"
              style={{
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: '4px solid #38bdf8',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div>
                {/* Header line */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: 'rgba(56, 189, 248, 0.12)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                      }}
                    >
                      {language === 'rw' ? `Ikibazo #${q.question_number}` : `Question #${q.question_number}`}
                    </span>
                    <span
                      style={{
                        background: 'rgba(248, 113, 113, 0.1)',
                        color: '#f87171',
                        border: '1px solid rgba(248, 113, 113, 0.25)',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                      }}
                    >
                      {getDomainLabel(q.domain)}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      &bull; {getDifficultyLabel(q.difficulty)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenEditQuestion(q)}
                    style={{
                      background: 'rgba(56, 189, 248, 0.08)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      borderRadius: '6px',
                      color: '#38bdf8',
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Edit3 size={13} /> {t('admin.examinations.editQuestion')}
                  </button>
                </div>

                {/* Question text */}
                <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#ffffff', lineHeight: '1.5' }}>
                  {language === 'rw' ? (q.question_text_kinyarwanda || q.question_text) : (q.question_text || q.question_text_kinyarwanda)}
                </div>

                {/* Diagram preview if present */}
                {q.image && (
                  <div style={{ margin: '12px 0', textAlign: 'center' }}>
                    <img
                      src={q.image}
                      alt="Diagram preview"
                      style={{ maxHeight: '110px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)', background: '#ffffff', padding: '2px' }}
                    />
                  </div>
                )}

                {/* Options A, B, C, D */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                  {[
                    { key: 'A', text: language === 'rw' ? (q.option_a_kinyarwanda || q.option_a) : (q.option_a || q.option_a_kinyarwanda), image: q.option_a_image },
                    { key: 'B', text: language === 'rw' ? (q.option_b_kinyarwanda || q.option_b) : (q.option_b || q.option_b_kinyarwanda), image: q.option_b_image },
                    { key: 'C', text: language === 'rw' ? (q.option_c_kinyarwanda || q.option_c) : (q.option_c || q.option_c_kinyarwanda), image: q.option_c_image },
                    { key: 'D', text: language === 'rw' ? (q.option_d_kinyarwanda || q.option_d) : (q.option_d || q.option_d_kinyarwanda), image: q.option_d_image },
                  ].map((opt) => {
                    const isCorrect = q.correct_option === opt.key;
                    return (
                      <div
                        key={opt.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          background: isCorrect ? 'rgba(56, 189, 248, 0.12)' : 'rgba(0,0,0,0.18)',
                          border: isCorrect ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid rgba(255,255,255,0.04)',
                          fontSize: '0.84rem',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 800,
                            color: isCorrect ? '#38bdf8' : 'var(--text-muted)',
                            width: '18px',
                          }}
                        >
                          {opt.key}.
                        </span>
                        {opt.image && (
                          <img
                            src={opt.image}
                            alt={`Option ${opt.key}`}
                            style={{
                              height: '32px',
                              borderRadius: '4px',
                              background: '#ffffff',
                              padding: '2px',
                              border: '1px solid var(--border-subtle)',
                            }}
                          />
                        )}
                        <span style={{ color: isCorrect ? '#ffffff' : 'var(--text-secondary)', flex: 1, fontWeight: isCorrect ? 600 : 400 }}>
                          {opt.text || (opt.image ? "Icyapa cy'amahitamo" : '')}
                        </span>
                        {isCorrect && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.03em' }}>
                            {t('admin.examinations.correctBadge')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation footer */}
              {(q.explanation_kinyarwanda || q.explanation) && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'rgba(56, 189, 248, 0.05)',
                    border: '1px solid rgba(56, 189, 248, 0.15)',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <strong style={{ color: '#38bdf8' }}>{language === 'rw' ? 'Ibisobanuro: ' : 'Explanation: '}</strong>
                  {language === 'rw' ? (q.explanation_kinyarwanda || q.explanation) : (q.explanation || q.explanation_kinyarwanda)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
        <button
          onClick={() => setQuestionPage((p) => Math.max(1, p - 1))}
          disabled={questionPage === 1}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            background: 'rgba(56, 189, 248, 0.06)',
            color: 'var(--text-primary)',
            cursor: questionPage === 1 ? 'not-allowed' : 'pointer',
            opacity: questionPage === 1 ? 0.4 : 1,
          }}
        >
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ipaji {questionPage}</span>
        <button
          onClick={() => setQuestionPage((p) => p + 1)}
          disabled={questionsData.results.length < 20}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            background: 'rgba(56, 189, 248, 0.06)',
            color: 'var(--text-primary)',
            cursor: questionsData.results.length < 20 ? 'not-allowed' : 'pointer',
            opacity: questionsData.results.length < 20 ? 0.4 : 1,
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <QuestionEditModal
        isOpen={editQuestionModalOpen}
        question={editingQuestion}
        onClose={() => {
          setEditQuestionModalOpen(false);
          setEditingQuestion(null);
        }}
        onSuccess={() => {
          setEditQuestionModalOpen(false);
          setEditingQuestion(null);
          fetchQuestions();
        }}
      />
    </div>
  );
};

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
import { Badge } from '../../../../components/common/Badge';
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
    <div
      style={{
        background: 'var(--bg-surface)',
        padding: '22px 24px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Header & Filter */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Question Bank
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Traffic rules questions, options, and road sign diagrams.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '5px 10px',
              minWidth: '240px',
            }}
          >
            <Search size={14} style={{ color: 'var(--text-muted)', marginRight: '6px' }} />
            <input
              type="text"
              placeholder={t('admin.examinations.searchQuestionPlaceholder')}
              value={questionSearch}
              onChange={(e) => setQuestionSearch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          <select
            value={domainFilter}
            onChange={(e) => {
              setDomainFilter(e.target.value);
              setQuestionPage(1);
            }}
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              padding: '5px 10px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
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
        <div style={{ padding: '48px 20px', textAlign: 'center' }}>
          <Spinner size={28} />
        </div>
      ) : questionsData.results.length === 0 ? (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          <HelpCircle size={22} style={{ opacity: 0.4, marginBottom: '6px' }} />
          <div>{t('admin.examinations.noQuestionsFound')}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '14px' }}>
          {questionsData.results.map((q) => (
            <div
              key={q.id}
              style={{
                padding: '16px 18px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      #{q.question_number}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {getDomainLabel(q.domain)}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      &bull; {getDifficultyLabel(q.difficulty)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenEditQuestion(q)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Edit3 size={12} /> {t('admin.examinations.editQuestion')}
                  </button>
                </div>

                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.45' }}>
                  {language === 'rw' ? (q.question_text_kinyarwanda || q.question_text) : (q.question_text || q.question_text_kinyarwanda)}
                </div>

                {q.image && (
                  <div style={{ margin: '10px 0', textAlign: 'center' }}>
                    <img
                      src={q.image}
                      alt="Diagram"
                      style={{ maxHeight: '100px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: '#ffffff', padding: '2px' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
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
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface)',
                          border: isCorrect ? '1px solid var(--text-muted)' : '1px solid var(--border-subtle)',
                          fontSize: '0.82rem',
                        }}
                      >
                        <span style={{ fontWeight: 700, color: 'var(--text-muted)', width: '16px' }}>
                          {opt.key}.
                        </span>
                        {opt.image && (
                          <img
                            src={opt.image}
                            alt={`Option ${opt.key}`}
                            style={{
                              height: '28px',
                              borderRadius: '4px',
                              background: '#ffffff',
                              padding: '2px',
                              border: '1px solid var(--border-subtle)',
                            }}
                          />
                        )}
                        <span style={{ color: isCorrect ? 'var(--text-primary)' : 'var(--text-secondary)', flex: 1, fontWeight: isCorrect ? 600 : 400 }}>
                          {opt.text || (opt.image ? 'Diagram option' : '')}
                        </span>
                        {isCorrect && <Badge variant="success">Correct</Badge>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {(q.explanation_kinyarwanda || q.explanation) && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.76rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <strong style={{ color: 'var(--text-primary)' }}>{language === 'rw' ? 'Ibisobanuro: ' : 'Note: '}</strong>
                  {language === 'rw' ? (q.explanation_kinyarwanda || q.explanation) : (q.explanation || q.explanation_kinyarwanda)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <button
          onClick={() => setQuestionPage((p) => Math.max(1, p - 1))}
          disabled={questionPage === 1}
          className="btn btn-secondary btn-sm"
          style={{ padding: '5px 10px' }}
        >
          <ChevronLeft size={15} />
        </button>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Page {questionPage}</span>
        <button
          onClick={() => setQuestionPage((p) => p + 1)}
          disabled={questionsData.results.length < 20}
          className="btn btn-secondary btn-sm"
          style={{ padding: '5px 10px' }}
        >
          <ChevronRight size={15} />
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


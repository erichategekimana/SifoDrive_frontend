import React, { useState, useMemo } from 'react';
import { X, Search, CheckSquare, Square, HelpCircle, RefreshCw } from 'lucide-react';
import { Spinner } from '../../../../components/common/Spinner';
import { useTranslation } from '../../../../context/I18nContext';

interface BankPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: any[];
  onAddQuestions: (selectedQuestions: any[]) => void;
  fetchBankQuestions: () => Promise<void>;
  isLoadingBankQuestions: boolean;
}

export const BankPickerModal: React.FC<BankPickerModalProps> = ({
  isOpen,
  onClose,
  questions,
  onAddQuestions,
  fetchBankQuestions,
  isLoadingBankQuestions,
}) => {
  const { t } = useTranslation();
  const [bankPickerSearch, setBankPickerSearch] = useState<string>('');
  const [bankPickerDomain, setBankPickerDomain] = useState<string>('ALL');
  const [selectedBankQuestionIds, setSelectedBankQuestionIds] = useState<string[]>([]);

  const filteredBankPickerQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (bankPickerDomain !== 'ALL' && q.domain !== bankPickerDomain) return false;
      if (!bankPickerSearch) return true;
      const search = bankPickerSearch.toLowerCase();
      return (
        q.question_text?.toLowerCase().includes(search) ||
        q.question_text_rw?.toLowerCase().includes(search) ||
        q.question_text_kinyarwanda?.toLowerCase().includes(search) ||
        String(q.question_number || '').includes(search)
      );
    });
  }, [questions, bankPickerDomain, bankPickerSearch]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '800px',
          maxHeight: '88vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-2xl)',
          padding: '24px',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '12px',
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
              {t('admin.courses.selectBankQuestions')}
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Choose 1, 5, 20, or any number of questions to link to this course quiz.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Filter bank items..."
              value={bankPickerSearch}
              onChange={(e) => setBankPickerSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px 8px 32px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.82rem',
              }}
            />
          </div>

          <select
            value={bankPickerDomain}
            onChange={(e) => setBankPickerDomain(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '0.82rem',
            }}
          >
            <option value="ALL">All Domains</option>
            <option value="PRIORITY">Priority Rules</option>
            <option value="SIGNAGE">Road Signs</option>
            <option value="SPEED">Speed Limits</option>
            <option value="LEGAL">Legal Framework</option>
            <option value="SAFETY">Vehicle Safety</option>
            <option value="PARKING">Parking & Stopping</option>
          </select>

          <button
            type="button"
            onClick={() => {
              const allVisibleIds = filteredBankPickerQuestions.map((q) => q.id);
              if (selectedBankQuestionIds.length === allVisibleIds.length) {
                setSelectedBankQuestionIds([]);
              } else {
                setSelectedBankQuestionIds(allVisibleIds);
              }
            }}
            className="btn btn-secondary btn-sm"
          >
            {selectedBankQuestionIds.length === filteredBankPickerQuestions.length && filteredBankPickerQuestions.length > 0
              ? 'Deselect All'
              : 'Select All Visible'}
          </button>
        </div>

        {/* Questions list with checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '440px', overflowY: 'auto' }}>
          {isLoadingBankQuestions ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-secondary)' }}>
              <Spinner size={24} />
              <p style={{ margin: '12px 0 0', fontSize: '0.85rem' }}>Loading questions from Question Bank...</p>
            </div>
          ) : filteredBankPickerQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-secondary)' }}>
              <HelpCircle size={36} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
              <p style={{ margin: '0 0 6px', fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>
                {questions.length === 0 ? 'No questions loaded from Question Bank' : 'No questions match the current filter or search'}
              </p>
              <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {questions.length === 0
                  ? 'Click below to fetch the Question Bank questions.'
                  : 'Try adjusting your search keywords or domain selection.'}
              </p>
              {questions.length === 0 && (
                <button
                  type="button"
                  onClick={fetchBankQuestions}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={14} />
                  <span>Fetch Question Bank</span>
                </button>
              )}
            </div>
          ) : (
            filteredBankPickerQuestions.slice(0, 300).map((q) => {
              const isSelected = selectedBankQuestionIds.includes(q.id);
              const qText = q.question_text || q.question_text_rw || q.question_text_kinyarwanda || '';
              const qRw = q.question_text_rw || q.question_text_kinyarwanda || '';
              return (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedBankQuestionIds((prev) =>
                      prev.includes(q.id) ? prev.filter((id) => id !== q.id) : [...prev, q.id]
                    );
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'var(--bg-surface-elevated)',
                    border: isSelected ? '1px solid var(--border-medium)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ paddingTop: '2px' }}>
                    {isSelected ? <CheckSquare size={16} color="#ffffff" /> : <Square size={16} color="var(--text-muted)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        #{q.question_number || 'Bank'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {q.domain || 'PRIORITY'} • {q.difficulty || 'MEDIUM'}
                      </span>
                      {q.correct_option && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)',
                            fontWeight: 600,
                          }}
                        >
                          Answer: Option {q.correct_option}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.4 }}>
                      {qText}
                    </div>
                    {qRw && qText !== qRw && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>
                        {qRw}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: q.correct_option === 'A' ? '#ffffff' : 'var(--text-muted)', fontWeight: q.correct_option === 'A' ? 600 : 400 }}>
                        A: {q.option_a || q.option_a_rw}
                      </span>
                      <span style={{ color: q.correct_option === 'B' ? '#ffffff' : 'var(--text-muted)', fontWeight: q.correct_option === 'B' ? 600 : 400 }}>
                        B: {q.option_b || q.option_b_rw}
                      </span>
                      {(q.option_c || q.option_c_rw) && (
                        <span style={{ color: q.correct_option === 'C' ? '#ffffff' : 'var(--text-muted)', fontWeight: q.correct_option === 'C' ? 600 : 400 }}>
                          C: {q.option_c || q.option_c_rw}
                        </span>
                      )}
                      {(q.option_d || q.option_d_rw) && (
                        <span style={{ color: q.correct_option === 'D' ? '#ffffff' : 'var(--text-muted)', fontWeight: q.correct_option === 'D' ? 600 : 400 }}>
                          D: {q.option_d || q.option_d_rw}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <strong>{selectedBankQuestionIds.length}</strong> question(s) selected
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedBankQuestionIds.length === 0}
              onClick={() => {
                const chosen = questions.filter((q) => selectedBankQuestionIds.includes(q.id));
                onAddQuestions(chosen);
                setSelectedBankQuestionIds([]);
              }}
              className="btn btn-primary btn-sm"
            >
              Add {selectedBankQuestionIds.length} to Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

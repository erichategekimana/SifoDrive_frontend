import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { QuizQuestionItem } from '../../../../core/services/AdminService';
import { useToast } from '../../../../context/ToastContext';
import { useTranslation } from '../../../../context/I18nContext';

interface ScratchQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestion: (item: QuizQuestionItem) => void;
}

export const ScratchQuestionModal: React.FC<ScratchQuestionModalProps> = ({
  isOpen,
  onClose,
  onAddQuestion,
}) => {
  const { t } = useTranslation();
  const { warning, success } = useToast();

  const [scratchQuestionText, setScratchQuestionText] = useState<string>('');
  const [scratchQuestionTextRw, setScratchQuestionTextRw] = useState<string>('');
  const [scratchOptionA, setScratchOptionA] = useState<string>('');
  const [scratchOptionB, setScratchOptionB] = useState<string>('');
  const [scratchOptionC, setScratchOptionC] = useState<string>('');
  const [scratchOptionD, setScratchOptionD] = useState<string>('');
  const [scratchOptionARw, setScratchOptionARw] = useState<string>('');
  const [scratchOptionBRw, setScratchOptionBRw] = useState<string>('');
  const [scratchOptionCRw, setScratchOptionCRw] = useState<string>('');
  const [scratchOptionDRw, setScratchOptionDRw] = useState<string>('');
  const [scratchCorrectOption, setScratchCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [scratchPoints, setScratchPoints] = useState<number>(1);
  const [scratchExplanation, setScratchExplanation] = useState<string>('');
  const [scratchExplanationRw, setScratchExplanationRw] = useState<string>('');
  const [scratchDomain, setScratchDomain] = useState<string>('PRIORITY');
  const [scratchDifficulty, setScratchDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!scratchQuestionText.trim()) {
      warning('Please enter question text.');
      return;
    }
    if (!scratchOptionA.trim() || !scratchOptionB.trim()) {
      warning('At least Options A and B must be provided.');
      return;
    }
    const newItem: QuizQuestionItem = {
      original_question: null,
      points: Number(scratchPoints) || 1,
      question_text: scratchQuestionText.trim(),
      question_text_kinyarwanda: scratchQuestionTextRw.trim(),
      option_a: scratchOptionA.trim(),
      option_b: scratchOptionB.trim(),
      option_c: scratchOptionC.trim(),
      option_d: scratchOptionD.trim(),
      option_a_kinyarwanda: scratchOptionARw.trim(),
      option_b_kinyarwanda: scratchOptionBRw.trim(),
      option_c_kinyarwanda: scratchOptionCRw.trim(),
      option_d_kinyarwanda: scratchOptionDRw.trim(),
      correct_option: scratchCorrectOption,
      explanation: scratchExplanation.trim(),
      explanation_kinyarwanda: scratchExplanationRw.trim(),
      domain: scratchDomain,
      difficulty: scratchDifficulty,
    };
    onAddQuestion(newItem);
    setScratchQuestionText('');
    setScratchQuestionTextRw('');
    setScratchOptionA('');
    setScratchOptionB('');
    setScratchOptionC('');
    setScratchOptionD('');
    setScratchOptionARw('');
    setScratchOptionBRw('');
    setScratchOptionCRw('');
    setScratchOptionDRw('');
    setScratchCorrectOption('A');
    setScratchPoints(1);
    setScratchExplanation('');
    setScratchExplanationRw('');
    success('Question authored and added to quiz.');
    onClose();
  };

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
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-2xl)',
          padding: '24px',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
              {t('admin.courses.scratchQuestion')}
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Compose custom question prompt, options, correct answers, and feedback explanation.
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Question Prompt (English) *
            </label>
            <textarea
              rows={2}
              required
              placeholder="Who has priority at an unmarked roundabout?"
              value={scratchQuestionText}
              onChange={(e) => setScratchQuestionText(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Question Prompt (Kinyarwanda)
            </label>
            <textarea
              rows={2}
              placeholder="Ni nde ufite uburenganzira bwo gutambuka muri rond-point itagira ibimenyetso?"
              value={scratchQuestionTextRw}
              onChange={(e) => setScratchQuestionTextRw(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem', resize: 'vertical' }}
            />
          </div>

          {/* Options grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {(['A', 'B', 'C', 'D'] as const).map((opt) => {
              const val = opt === 'A' ? scratchOptionA : opt === 'B' ? scratchOptionB : opt === 'C' ? scratchOptionC : scratchOptionD;
              const setVal = opt === 'A' ? setScratchOptionA : opt === 'B' ? setScratchOptionB : opt === 'C' ? setScratchOptionC : setScratchOptionD;
              const isCorrect = scratchCorrectOption === opt;
              return (
                <div key={opt} style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: isCorrect ? '1px solid var(--primary-color)' : '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>Option {opt} {opt === 'A' || opt === 'B' ? '*' : ''}</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.75rem', color: isCorrect ? 'var(--primary-color)' : 'var(--text-muted)' }}>
                      <input
                        type="radio"
                        name="scratchCorrect"
                        checked={isCorrect}
                        onChange={() => setScratchCorrectOption(opt)}
                      />
                      <span>Correct</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder={`Option ${opt} text`}
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem' }}
                  />
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Points
              </label>
              <input
                type="number"
                min={1}
                value={scratchPoints}
                onChange={(e) => setScratchPoints(parseInt(e.target.value) || 1)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Domain
              </label>
              <select
                value={scratchDomain}
                onChange={(e) => setScratchDomain(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem' }}
              >
                <option value="PRIORITY">Priority Rules</option>
                <option value="SIGNAGE">Road Signs</option>
                <option value="SPEED">Speed Limits</option>
                <option value="LEGAL">Legal Framework</option>
                <option value="SAFETY">Vehicle Safety</option>
                <option value="PARKING">Parking & Stopping</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Difficulty
              </label>
              <select
                value={scratchDifficulty}
                onChange={(e) => setScratchDifficulty(e.target.value as any)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem' }}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Answer Explanation & Pedagogical Feedback
            </label>
            <textarea
              rows={2}
              placeholder="Explain why the selected option is correct per Rwanda Highway Code..."
              value={scratchExplanation}
              onChange={(e) => setScratchExplanation(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem', resize: 'vertical' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} />
            <span>Add Question to Quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
};

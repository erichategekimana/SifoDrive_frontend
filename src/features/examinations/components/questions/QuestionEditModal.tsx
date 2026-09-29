import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import {
  AdminService,
  type AdminQuizQuestionItem,
} from '../../../../core/services/AdminService';
import { useToast } from '../../../../context/ToastContext';
import { useTranslation } from '../../../../context/I18nContext';
import { DOMAIN_LABELS_KINYARWANDA } from '../../constants/examConstants';

interface QuestionEditModalProps {
  isOpen: boolean;
  question: AdminQuizQuestionItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const QuestionEditModal: React.FC<QuestionEditModalProps> = ({
  isOpen,
  question,
  onClose,
  onSuccess,
}) => {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const adminService = AdminService.getInstance();

  const [editingQuestion, setEditingQuestion] = useState<AdminQuizQuestionItem | null>(null);
  const [isSavingQuestion, setIsSavingQuestion] = useState<boolean>(false);

  useEffect(() => {
    if (question) {
      setEditingQuestion({
        ...question,
        question_text_kinyarwanda: question.question_text_kinyarwanda || question.question_text || '',
        option_a_kinyarwanda: question.option_a_kinyarwanda || question.option_a || '',
        option_b_kinyarwanda: question.option_b_kinyarwanda || question.option_b || '',
        option_c_kinyarwanda: question.option_c_kinyarwanda || question.option_c || '',
        option_d_kinyarwanda: question.option_d_kinyarwanda || question.option_d || '',
        explanation_kinyarwanda: question.explanation_kinyarwanda || question.explanation || '',
      });
    } else {
      setEditingQuestion(null);
    }
  }, [question, isOpen]);

  if (!isOpen || !editingQuestion) return null;

  const getDomainLabel = (domain: string) => {
    const key = `admin.examinations.domains.${domain}`;
    const translated = t(key);
    return translated !== key ? translated : (DOMAIN_LABELS_KINYARWANDA[domain] || domain);
  };

  const handleSave = async () => {
    try {
      setIsSavingQuestion(true);
      const payload: Partial<AdminQuizQuestionItem> = {
        ...editingQuestion,
        question_text_kinyarwanda: editingQuestion.question_text_kinyarwanda,
        question_text: editingQuestion.question_text_kinyarwanda || editingQuestion.question_text,
        option_a_kinyarwanda: editingQuestion.option_a_kinyarwanda,
        option_b_kinyarwanda: editingQuestion.option_b_kinyarwanda,
        option_c_kinyarwanda: editingQuestion.option_c_kinyarwanda,
        option_d_kinyarwanda: editingQuestion.option_d_kinyarwanda,
        option_a: editingQuestion.option_a_kinyarwanda || editingQuestion.option_a,
        option_b: editingQuestion.option_b_kinyarwanda || editingQuestion.option_b,
        option_c: editingQuestion.option_c_kinyarwanda || editingQuestion.option_c,
        option_d: editingQuestion.option_d_kinyarwanda || editingQuestion.option_d,
        explanation_kinyarwanda: editingQuestion.explanation_kinyarwanda,
        explanation: editingQuestion.explanation_kinyarwanda || editingQuestion.explanation,
      };
      await adminService.updateQuizQuestion(editingQuestion.id, payload);
      showToast("Impinduka z'ikibazo zabitswe neza mu bubiko!", 'success');
      onSuccess();
    } catch (err: any) {
      showToast("Guhindura ikibazo byanze: " + (err.response?.data?.error || err.message), 'error');
    } finally {
      setIsSavingQuestion(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          borderRadius: '16px',
          background: '#0e1726',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                }}
              >
                {language === 'rw' ? `Ikibazo #${editingQuestion.question_number}` : `Question #${editingQuestion.question_number}`}
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
                {getDomainLabel(editingQuestion.domain)}
              </span>
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              {language === 'rw' ? `Kosora Ikibazo #${editingQuestion.question_number}` : `Edit Question #${editingQuestion.question_number}`}
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {t('admin.examinations.editQuestionSubtitle')}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Question Text in Kinyarwanda */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8' }}>
              {t('admin.examinations.questionTextLabel')}
            </label>
            <textarea
              rows={3}
              value={editingQuestion.question_text_kinyarwanda || ''}
              onChange={(e) =>
                setEditingQuestion({
                  ...editingQuestion,
                  question_text_kinyarwanda: e.target.value,
                })
              }
              placeholder={t('admin.examinations.questionTextPlaceholder')}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                color: '#ffffff',
                fontSize: '0.88rem',
                lineHeight: '1.5',
                marginTop: '6px',
                outline: 'none',
              }}
            />
          </div>

          {/* Options A, B, C, D Edit & Correct Answer Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {t('admin.examinations.optionsInstruction')}
            </label>
            {(['A', 'B', 'C', 'D'] as const).map((key) => {
              const prop = `option_${key.toLowerCase()}_kinyarwanda` as keyof AdminQuizQuestionItem;
              const imgProp = `option_${key.toLowerCase()}_image` as keyof AdminQuizQuestionItem;
              const isCorrect = editingQuestion.correct_option === key;
              return (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: isCorrect ? 'rgba(56, 189, 248, 0.12)' : 'rgba(0,0,0,0.25)',
                    border: isCorrect ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                >
                  <button
                    onClick={() => setEditingQuestion({ ...editingQuestion, correct_option: key })}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: isCorrect ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                      background: isCorrect ? '#38bdf8' : 'rgba(255, 255, 255, 0.05)',
                      color: isCorrect ? '#0f172a' : 'var(--text-secondary)',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                    title={`Select ${key} as correct answer`}
                  >
                    {key}
                  </button>
                  {editingQuestion[imgProp] && (
                    <img
                      src={editingQuestion[imgProp] as string}
                      alt={`Option ${key}`}
                      style={{
                        height: '32px',
                        background: '#ffffff',
                        borderRadius: '4px',
                        padding: '2px',
                        border: '1px solid var(--border-subtle)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <input
                    type="text"
                    value={String(editingQuestion[prop] || '')}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, [prop]: e.target.value })
                    }
                    placeholder={`Option ${key}...`}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                  {isCorrect && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.03em', flexShrink: 0 }}>
                      {t('admin.examinations.correctBadge')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Diagram / Image */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {t('admin.examinations.imageLabel')}
            </label>
            <input
              type="text"
              value={editingQuestion.image || ''}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, image: e.target.value })}
              placeholder="/media/lms/questions/... or https://..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                fontSize: '0.85rem',
                marginTop: '4px',
              }}
            />
            {editingQuestion.image && (
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <img
                  src={editingQuestion.image}
                  alt="Preview"
                  style={{ maxHeight: '90px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)', background: '#ffffff', padding: '2px' }}
                />
              </div>
            )}
          </div>

          {/* Explanation in Kinyarwanda */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {t('admin.examinations.explanationLabel')}
            </label>
            <textarea
              rows={2}
              value={editingQuestion.explanation_kinyarwanda || ''}
              onChange={(e) =>
                setEditingQuestion({ ...editingQuestion, explanation_kinyarwanda: e.target.value })
              }
              placeholder={t('admin.examinations.explanationPlaceholder')}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                fontSize: '0.85rem',
                marginTop: '4px',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              {t('admin.examinations.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={isSavingQuestion}
              style={{
                padding: '8px 22px',
                borderRadius: '6px',
                border: 'none',
                background: '#38bdf8',
                color: '#0f172a',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                boxShadow: '0 2px 8px rgba(56, 189, 248, 0.25)',
              }}
            >
              <Save size={16} /> {isSavingQuestion ? t('admin.examinations.saving') : t('admin.examinations.saveChanges')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

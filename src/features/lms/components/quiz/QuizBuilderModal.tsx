import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sliders,
  HelpCircle,
  FileCheck,
  Calendar,
  Plus,
  Trash2,
  Check,
  ListChecks,
  Sparkles,
} from 'lucide-react';
import { AdminService } from '../../../../core/services/AdminService';
import type { QuizQuestionItem, QuizPayload } from '../../../../core/services/AdminService';
import { Spinner } from '../../../../components/common/Spinner';
import { useToast } from '../../../../context/ToastContext';
import { useTranslation } from '../../../../context/I18nContext';
import { BankPickerModal } from './BankPickerModal';
import { ScratchQuestionModal } from './ScratchQuestionModal';

interface QuizBuilderModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  editingQuizId?: string;
  courses: any[];
  questions: any[];
  isSystemAdmin?: boolean;
  isTrainingAdmin?: boolean;
  onClose: () => void;
  onSuccess: () => void;
  fetchBankQuestions: () => Promise<void>;
  isLoadingBankQuestions: boolean;
}

export const QuizBuilderModal: React.FC<QuizBuilderModalProps> = ({
  isOpen,
  isEditMode,
  editingQuizId,
  courses,
  questions,
  isSystemAdmin,
  isTrainingAdmin,
  onClose,
  onSuccess,
  fetchBankQuestions,
  isLoadingBankQuestions,
}) => {
  const { t } = useTranslation();
  const { warning, success, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  const [quizActiveTab, setQuizActiveTab] = useState<'settings' | 'questions' | 'rubric'>('settings');
  const [quizCourseId, setQuizCourseId] = useState<string>('');
  const [quizModuleId, setQuizModuleId] = useState<string>('');
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [quizTitleRw, setQuizTitleRw] = useState<string>('');
  const [quizDescription, setQuizDescription] = useState<string>('');
  const [quizDescriptionRw, setQuizDescriptionRw] = useState<string>('');
  const [quizOpenDate, setQuizOpenDate] = useState<string>('');
  const [quizDeadline, setQuizDeadline] = useState<string>('');
  const [quizTimeLimit, setQuizTimeLimit] = useState<number>(30);
  const [quizTotalScore, setQuizTotalScore] = useState<number>(100);
  const [quizPassingScore, setQuizPassingScore] = useState<number>(70);
  const [quizMaxAttempts, setQuizMaxAttempts] = useState<number>(1);
  const [quizShuffle, setQuizShuffle] = useState<boolean>(false);
  const [quizRubric, setQuizRubric] = useState<string>('');
  const [quizRubricRw, setQuizRubricRw] = useState<string>('');
  const [quizItems, setQuizItems] = useState<QuizQuestionItem[]>([]);
  const [quizAvailableModules, setQuizAvailableModules] = useState<any[]>([]);
  const [isSavingQuiz, setIsSavingQuiz] = useState<boolean>(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);

  // Sub-modal states
  const [isBankPickerOpen, setIsBankPickerOpen] = useState<boolean>(false);
  const [isScratchQuestionOpen, setIsScratchQuestionOpen] = useState<boolean>(false);

  const calculatedTotalScore = useMemo(() => {
    return quizItems.reduce((acc, q) => acc + (Math.max(1, Number(q.points) || 1)), 0);
  }, [quizItems]);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && editingQuizId) {
      setIsLoadingDetails(true);
      adminService
        .getQuizDetail(editingQuizId)
        .then((detail) => {
          setQuizActiveTab('settings');
          setQuizCourseId(detail.course);
          setQuizModuleId(detail.module || '');
          setQuizTitle(detail.title || '');
          setQuizTitleRw(detail.title_kinyarwanda || '');
          setQuizDescription(detail.description || '');
          setQuizDescriptionRw(detail.description_kinyarwanda || '');
          setQuizOpenDate(detail.open_date ? detail.open_date.slice(0, 16) : '');
          setQuizDeadline(detail.deadline ? detail.deadline.slice(0, 16) : '');
          setQuizTimeLimit(detail.time_limit_minutes || 0);
          setQuizTotalScore(detail.total_score || 100);
          setQuizPassingScore(detail.passing_score || 70);
          setQuizMaxAttempts(detail.max_attempts || 1);
          setQuizShuffle(detail.shuffle_questions || false);
          setQuizRubric(detail.rubric || '');
          setQuizRubricRw(detail.rubric_kinyarwanda || '');
          setQuizItems(detail.items || []);

          if (detail.course) {
            adminService.getCourseModules(detail.course).then(setQuizAvailableModules).catch(() => setQuizAvailableModules([]));
          }
        })
        .catch((err) => {
          toastError(err?.message || 'Failed to load quiz details.');
        })
        .finally(() => setIsLoadingDetails(false));
    } else {
      setQuizActiveTab('settings');
      const defaultCourseId = courses[0]?.id || '';
      setQuizCourseId(defaultCourseId);
      setQuizModuleId('');
      setQuizTitle('');
      setQuizTitleRw('');
      setQuizDescription('');
      setQuizDescriptionRw('');
      setQuizOpenDate('');
      setQuizDeadline('');
      setQuizTimeLimit(30);
      setQuizTotalScore(100);
      setQuizPassingScore(70);
      setQuizMaxAttempts(1);
      setQuizShuffle(false);
      setQuizRubric(
        'Each question carries equal weight unless specified. Answer all questions within the allocated time limit. Passing threshold is 70%.'
      );
      setQuizRubricRw(
        'Buri kibazo gifite agaciro kangana. Subiza ibibazo byose mu gihe cyagenwe. Amanota yo gutsinda ni 70%.'
      );
      setQuizItems([]);
      if (defaultCourseId) {
        adminService.getCourseModules(defaultCourseId).then(setQuizAvailableModules).catch(() => setQuizAvailableModules([]));
      }
      if (questions.length === 0) {
        fetchBankQuestions();
      }
    }
  }, [isOpen, isEditMode, editingQuizId]);

  const handleCourseChange = async (cId: string) => {
    setQuizCourseId(cId);
    setQuizModuleId('');
    if (cId) {
      try {
        const mods = await adminService.getCourseModules(cId);
        setQuizAvailableModules(mods);
      } catch {
        setQuizAvailableModules([]);
      }
    } else {
      setQuizAvailableModules([]);
    }
  };

  const handleAddBankQuestions = (bankQuestions: any[]) => {
    const newItems: QuizQuestionItem[] = bankQuestions.map((bq) => ({
      original_question: bq.id,
      points: 1,
      question_text: bq.question_text || bq.question_text_rw || bq.question_text_kinyarwanda || '',
      question_text_kinyarwanda: bq.question_text_kinyarwanda || bq.question_text_rw || '',
      option_a: bq.option_a || bq.option_a_rw || '',
      option_b: bq.option_b || bq.option_b_rw || '',
      option_c: bq.option_c || bq.option_c_rw || '',
      option_d: bq.option_d || bq.option_d_rw || '',
      option_a_kinyarwanda: bq.option_a_kinyarwanda || bq.option_a_rw || '',
      option_b_kinyarwanda: bq.option_b_kinyarwanda || bq.option_b_rw || '',
      option_c_kinyarwanda: bq.option_c_kinyarwanda || bq.option_c_rw || '',
      option_d_kinyarwanda: bq.option_d_kinyarwanda || bq.option_d_rw || '',
      correct_option: bq.correct_option || 'A',
      explanation: bq.explanation || bq.explanation_kinyarwanda || bq.explanation_rw || '',
      explanation_kinyarwanda: bq.explanation_kinyarwanda || bq.explanation_rw || '',
      domain: bq.domain || 'PRIORITY',
      difficulty: bq.difficulty || 'MEDIUM',
    }));
    setQuizItems((prev) => [...prev, ...newItems]);
    setIsBankPickerOpen(false);
    success(`Added ${newItems.length} question(s) from Question Bank.`);
  };

  const handleSaveQuiz = async () => {
    if (!quizTitle.trim()) {
      warning('Please enter a quiz title.');
      return;
    }
    if (!quizCourseId) {
      warning('Please select a course for this quiz.');
      return;
    }
    if (quizItems.length === 0) {
      warning('A quiz must have at least 1 question. Author or pull questions from the bank.');
      return;
    }

    if (isSystemAdmin && !isTrainingAdmin) {
      const scratchCount = quizItems.filter((item) => !item.original_question).length;
      if (scratchCount > 0) {
        warning(
          'System Admin can only create/update quizzes by pulling and customizing items from the Question Bank. Scratch authoring is reserved for Training Admin.'
        );
        return;
      }
    }

    setIsSavingQuiz(true);
    try {
      const payload: QuizPayload = {
        course: quizCourseId,
        module: quizModuleId || null,
        title: quizTitle.trim(),
        title_kinyarwanda: quizTitleRw.trim(),
        description: quizDescription.trim(),
        description_kinyarwanda: quizDescriptionRw.trim(),
        open_date: quizOpenDate ? new Date(quizOpenDate).toISOString() : null,
        deadline: quizDeadline ? new Date(quizDeadline).toISOString() : null,
        time_limit_minutes: Number(quizTimeLimit) || 0,
        total_score: quizItems.length > 0 ? calculatedTotalScore : Number(quizTotalScore) || 100,
        passing_score: Number(quizPassingScore) || 70,
        max_attempts: Number(quizMaxAttempts) || 1,
        shuffle_questions: quizShuffle,
        rubric: quizRubric.trim(),
        rubric_kinyarwanda: quizRubricRw.trim(),
        items: quizItems.map((item, idx) => ({
          ...item,
          sort_order: idx + 1,
        })),
      };

      if (isEditMode && editingQuizId) {
        const updated = await adminService.updateQuiz(editingQuizId, payload);
        success(`Quiz "${updated.title}" updated successfully.`);
      } else {
        const created = await adminService.createQuiz(payload);
        success(`Quiz "${created.title}" created successfully with ${created.question_count} questions.`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Failed to save quiz.');
    } finally {
      setIsSavingQuiz(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
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
          maxWidth: '860px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-2xl)',
          padding: '28px',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
              <ListChecks size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {isEditMode ? t('admin.courses.editQuiz') : t('admin.courses.createQuiz')}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {isLoadingDetails ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Spinner size={32} />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setQuizActiveTab('settings')}
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: quizActiveTab === 'settings' ? '2px solid var(--primary-color)' : '2px solid transparent',
                  color: quizActiveTab === 'settings' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Sliders size={15} />
                <span>{t('admin.courses.tabSettings')}</span>
              </button>

              <button
                type="button"
                onClick={() => setQuizActiveTab('questions')}
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: quizActiveTab === 'questions' ? '2px solid var(--primary-color)' : '2px solid transparent',
                  color: quizActiveTab === 'questions' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <HelpCircle size={15} />
                <span>{t('admin.courses.tabQuestions')}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                  }}
                >
                  {quizItems.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setQuizActiveTab('rubric')}
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: quizActiveTab === 'rubric' ? '2px solid var(--primary-color)' : '2px solid transparent',
                  color: quizActiveTab === 'rubric' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <FileCheck size={15} />
                <span>{t('admin.courses.tabRubric')}</span>
              </button>
            </div>

            {/* TAB 1: SETTINGS & SCHEDULE */}
            {quizActiveTab === 'settings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Target Course *
                    </label>
                    <select
                      value={quizCourseId}
                      onChange={(e) => handleCourseChange(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                    >
                      <option value="">-- Choose Course --</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Target Module (Optional)
                    </label>
                    <select
                      value={quizModuleId}
                      onChange={(e) => setQuizModuleId(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                    >
                      <option value="">-- Course-wide (No specific module) --</option>
                      {quizAvailableModules.map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('admin.courses.quizTitle')} *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Priority Rules & Intersection Knowledge Check"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('admin.courses.quizTitleRw')}
                    </label>
                    <input
                      type="text"
                      placeholder="Umutwe w'isuzuma mu Kinyarwanda..."
                      value={quizTitleRw}
                      onChange={(e) => setQuizTitleRw(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('admin.courses.quizDescription')}
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Summary and goals of this quiz assessment..."
                      value={quizDescription}
                      onChange={(e) => setQuizDescription(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('admin.courses.quizDescriptionRw')}
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ibisobanuro by'isuzuma mu Kinyarwanda..."
                      value={quizDescriptionRw}
                      onChange={(e) => setQuizDescriptionRw(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical' }}
                    />
                  </div>
                </div>

                {/* Scheduling */}
                <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={15} style={{ color: '#60a5fa' }} />
                    <span>Availability Window & Deadlines</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        {t('admin.courses.openDate')}
                      </label>
                      <input
                        type="datetime-local"
                        value={quizOpenDate}
                        onChange={(e) => setQuizOpenDate(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        If left blank, quiz opens immediately upon publishing.
                      </span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        {t('admin.courses.deadline')}
                      </label>
                      <input
                        type="datetime-local"
                        value={quizDeadline}
                        onChange={(e) => setQuizDeadline(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        Optional: submissions after this timestamp are blocked.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantitative Rules */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {t('admin.courses.timeLimit')}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={quizTimeLimit}
                      onChange={(e) => setQuizTimeLimit(parseInt(e.target.value) || 0)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>0 = unlimited</span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {t('admin.courses.totalScore')}
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`${calculatedTotalScore} pts`}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        cursor: 'not-allowed',
                        opacity: 0.9,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {t('admin.courses.passingScore')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={quizPassingScore}
                      onChange={(e) => setQuizPassingScore(parseInt(e.target.value) || 70)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {t('admin.courses.maxAttempts')}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={quizMaxAttempts}
                      onChange={(e) => setQuizMaxAttempts(parseInt(e.target.value) || 1)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>0 = unlimited</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="quizShuffleCheckbox"
                    checked={quizShuffle}
                    onChange={(e) => setQuizShuffle(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="quizShuffleCheckbox" style={{ fontSize: '0.84rem', color: '#ffffff', cursor: 'pointer' }}>
                    {t('admin.courses.shuffleQuestions')}
                  </label>
                </div>
              </div>
            )}

            {/* TAB 2: QUESTION COMPOSER */}
            {quizActiveTab === 'questions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Control bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '14px 18px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{quizItems.length} Question{quizItems.length === 1 ? '' : 's'} Configured</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                        Total Score: {calculatedTotalScore} pts
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setIsBankPickerOpen(true)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={14} />
                      <span>{t('admin.courses.fromBank')}</span>
                    </button>

                    {isTrainingAdmin && (
                      <button
                        type="button"
                        onClick={() => setIsScratchQuestionOpen(true)}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Sparkles size={14} />
                        <span>{t('admin.courses.scratchQuestion')}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Items List */}
                {quizItems.length === 0 ? (
                  <div style={{ padding: '48px 24px', textAlign: 'center', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-medium)', background: 'rgba(255,255,255,0.01)' }}>
                    <HelpCircle size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
                    <h5 style={{ margin: '0 0 6px 0', fontSize: '0.96rem', fontWeight: 700, color: '#ffffff' }}>
                      No questions attached yet
                    </h5>
                    <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Assemble this quiz by pulling questions from the bank{isTrainingAdmin ? ' or authoring custom ones from scratch' : ''}.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setIsBankPickerOpen(true)}
                        className="btn btn-secondary btn-sm"
                      >
                        Select from Bank
                      </button>
                      {isTrainingAdmin && (
                        <button
                          type="button"
                          onClick={() => setIsScratchQuestionOpen(true)}
                          className="btn btn-primary btn-sm"
                        >
                          Author from Scratch
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                    {quizItems.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '16px',
                          borderRadius: 'var(--radius-lg)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                              #{idx + 1}
                            </span>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-subtle)',
                              }}
                            >
                              {item.original_question ? 'From Bank' : 'Custom Question'}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Domain: {item.domain || 'PRIORITY'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Points:</label>
                              <input
                                type="number"
                                min={1}
                                max={1000}
                                value={item.points || 1}
                                onChange={(e) => {
                                  const val = Math.max(1, parseInt(e.target.value) || 1);
                                  setQuizItems((prev) => prev.map((q, qIdx) => (qIdx === idx ? { ...q, points: val } : q)));
                                }}
                                style={{ width: '56px', padding: '3px 6px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontWeight: 700, fontSize: '0.84rem', textAlign: 'center' }}
                              />
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>pts</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setQuizItems((prev) => prev.filter((_, qIdx) => qIdx !== idx))}
                              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                              title="Remove Question"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff' }}>
                          {item.question_text}
                        </div>
                        {item.question_text_kinyarwanda && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {item.question_text_kinyarwanda}
                          </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.78rem' }}>
                          {['A', 'B', 'C', 'D'].map((optKey) => {
                            const optText = (item as any)[`option_${optKey.toLowerCase()}`];
                            if (!optText) return null;
                            const isCorrect = item.correct_option === optKey;
                            return (
                              <div
                                key={optKey}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  background: isCorrect ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.02)',
                                  border: isCorrect ? '1px solid var(--border-medium)' : '1px solid var(--border-subtle)',
                                  color: isCorrect ? '#ffffff' : 'var(--text-secondary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontWeight: isCorrect ? 600 : 400,
                                }}
                              >
                                <span style={{ fontWeight: 700 }}>{optKey}.</span>
                                <span style={{ flex: 1 }}>{optText}</span>
                                {isCorrect && <Check size={12} style={{ color: 'var(--text-secondary)' }} />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: RUBRIC */}
            {quizActiveTab === 'rubric' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('admin.courses.rubric')}
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Comprehensive grading rubric, evaluation criteria, time allocation advice, and guidelines..."
                    value={quizRubric}
                    onChange={(e) => setQuizRubric(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('admin.courses.rubricRw')}
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Amabwiriza n'ibipimo by'amanota mu Kinyarwanda..."
                    value={quizRubricRw}
                    onChange={(e) => setQuizRubricRw(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical' }}
                  />
                </div>

                <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.88rem', marginBottom: '10px' }}>
                    Quiz Summary Review
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.8rem' }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>Questions:</span> <strong style={{ color: '#ffffff' }}>{quizItems.length} items</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Total Score:</span> <strong style={{ color: '#ffffff' }}>{calculatedTotalScore} pts</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Passing:</span> <strong style={{ color: '#ffffff' }}>{quizPassingScore}%</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Time Limit:</span> <strong style={{ color: '#ffffff' }}>{quizTimeLimit > 0 ? `${quizTimeLimit} mins` : 'Unlimited'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Open Date:</span> <strong style={{ color: '#ffffff' }}>{quizOpenDate ? new Date(quizOpenDate).toLocaleDateString() : 'Immediate'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Deadline:</span> <strong style={{ color: '#ffffff' }}>{quizDeadline ? new Date(quizDeadline).toLocaleDateString() : 'None'}</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                {t('admin.courses.cancelBtn')}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {quizActiveTab !== 'settings' && (
                  <button
                    type="button"
                    onClick={() => setQuizActiveTab(quizActiveTab === 'rubric' ? 'questions' : 'settings')}
                    className="btn btn-secondary"
                  >
                    Previous
                  </button>
                )}

                {quizActiveTab !== 'rubric' ? (
                  <button
                    type="button"
                    onClick={() => setQuizActiveTab(quizActiveTab === 'settings' ? 'questions' : 'rubric')}
                    className="btn btn-primary"
                  >
                    Next Tab
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSavingQuiz}
                    onClick={handleSaveQuiz}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontWeight: 800 }}
                  >
                    {isSavingQuiz ? (
                      <>
                        <Spinner size={16} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>{isEditMode ? 'Update Quiz' : 'Finalize & Save Quiz'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <BankPickerModal
        isOpen={isBankPickerOpen}
        onClose={() => setIsBankPickerOpen(false)}
        questions={questions}
        onAddQuestions={handleAddBankQuestions}
        fetchBankQuestions={fetchBankQuestions}
        isLoadingBankQuestions={isLoadingBankQuestions}
      />

      <ScratchQuestionModal
        isOpen={isScratchQuestionOpen}
        onClose={() => setIsScratchQuestionOpen(false)}
        onAddQuestion={(item) => setQuizItems((prev) => [...prev, item])}
      />
    </div>
  );
};

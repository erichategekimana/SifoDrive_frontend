import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Image as ImageIcon,
  HelpCircle,
  Sparkles,
  Save,
  Globe,
  Layers,
  FileText,
  Clock,
} from 'lucide-react';
import {
  AdminService,
  type AdminQuizQuestionItem,
} from '../../../core/services/AdminService';
import { Spinner } from '../../../components/common/Spinner';
import { useToast } from '../../../context/ToastContext';

interface ManageQuestionModalProps {
  isOpen: boolean;
  questionToEdit?: any | null;
  onClose: () => void;
  onSuccess: () => void;
  editAccessEnabled?: boolean;
}

const DOMAIN_OPTIONS = [
  { value: 'PRIORITY', label: 'Priority Rules & Intersections' },
  { value: 'SIGNAGE', label: 'Road Signs & Signals' },
  { value: 'SPEED', label: 'Speed Limits & Braking' },
  { value: 'LEGAL', label: 'Legal Framework & Penalties' },
  { value: 'SAFETY', label: 'Road Safety & Regulations' },
  { value: 'PARKING', label: 'Parking & Stopping Rules' },
  { value: 'VEHICLE', label: 'Vehicle Mechanics & Lights' },
  { value: 'GENERAL', label: 'General Driving Rules' },
];

export const ManageQuestionModal: React.FC<ManageQuestionModalProps> = ({
  isOpen,
  questionToEdit,
  onClose,
  onSuccess,
  editAccessEnabled = true,
}) => {
  const { success, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  const isEditing = Boolean(questionToEdit?.id);

  // Form State
  const [questionNumber, setQuestionNumber] = useState<number | string>('');
  const [domain, setDomain] = useState<string>('SIGNAGE');
  const [isActive, setIsActive] = useState<boolean>(true);

  // Language Active Tab for text inputs: 'RW' | 'EN' | 'FR'
  const [activeLangTab, setActiveLangTab] = useState<'RW' | 'EN' | 'FR'>('RW');

  // Question Prompts
  const [questionRw, setQuestionRw] = useState('');
  const [questionEn, setQuestionEn] = useState('');
  const [questionFr, setQuestionFr] = useState('');

  // Diagram Image
  const [imageUrl, setImageUrl] = useState('');

  // Correct Option
  const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');

  // Options A, B, C, D
  const [optARw, setOptARw] = useState('');
  const [optAEn, setOptAEn] = useState('');
  const [optAFr, setOptAFr] = useState('');
  const [optAImg, setOptAImg] = useState('');

  const [optBRw, setOptBRw] = useState('');
  const [optBEn, setOptBEn] = useState('');
  const [optBFr, setOptBFr] = useState('');
  const [optBImg, setOptBImg] = useState('');

  const [optCRw, setOptCRw] = useState('');
  const [optCEn, setOptCEn] = useState('');
  const [optCFr, setOptCFr] = useState('');
  const [optCImg, setOptCImg] = useState('');

  const [optDRw, setOptDRw] = useState('');
  const [optDEn, setOptDEn] = useState('');
  const [optDFr, setOptDFr] = useState('');
  const [optDImg, setOptDImg] = useState('');

  // Explanations
  const [explanationRw, setExplanationRw] = useState('');
  const [explanationEn, setExplanationEn] = useState('');
  const [explanationFr, setExplanationFr] = useState('');

  // Reason for Edit (Why question was changed)
  const [editReason, setEditReason] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (questionToEdit) {
      setQuestionNumber(questionToEdit.question_number || '');
      setDomain(questionToEdit.domain || 'SIGNAGE');
      setIsActive(questionToEdit.is_active ?? true);

      setQuestionRw(questionToEdit.question_text_kinyarwanda || '');
      setQuestionEn(questionToEdit.question_text || '');
      setQuestionFr(questionToEdit.question_text_french || '');

      setImageUrl(questionToEdit.image || '');
      setCorrectOption(
        (['A', 'B', 'C', 'D'].includes(questionToEdit.correct_option)
          ? questionToEdit.correct_option
          : 'A') as 'A' | 'B' | 'C' | 'D'
      );

      setOptARw(questionToEdit.option_a_kinyarwanda || '');
      setOptAEn(questionToEdit.option_a || '');
      setOptAFr(questionToEdit.option_a_french || '');
      setOptAImg(questionToEdit.option_a_image || '');

      setOptBRw(questionToEdit.option_b_kinyarwanda || '');
      setOptBEn(questionToEdit.option_b || '');
      setOptBFr(questionToEdit.option_b_french || '');
      setOptBImg(questionToEdit.option_b_image || '');

      setOptCRw(questionToEdit.option_c_kinyarwanda || '');
      setOptCEn(questionToEdit.option_c || '');
      setOptCFr(questionToEdit.option_c_french || '');
      setOptCImg(questionToEdit.option_c_image || '');

      setOptDRw(questionToEdit.option_d_kinyarwanda || '');
      setOptDEn(questionToEdit.option_d || '');
      setOptDFr(questionToEdit.option_d_french || '');
      setOptDImg(questionToEdit.option_d_image || '');

      setExplanationRw(questionToEdit.explanation_kinyarwanda || '');
      setExplanationEn(questionToEdit.explanation || '');
      setExplanationFr(questionToEdit.explanation_french || '');
      setEditReason(questionToEdit.edit_reason || '');
    } else {
      setQuestionNumber('');
      setDomain('SIGNAGE');
      setIsActive(true);
      setEditReason('');
      setQuestionRw('');
      setQuestionEn('');
      setQuestionFr('');
      setImageUrl('');
      setCorrectOption('A');

      setOptARw('');
      setOptAEn('');
      setOptAFr('');
      setOptAImg('');

      setOptBRw('');
      setOptBEn('');
      setOptBFr('');
      setOptBImg('');

      setOptCRw('');
      setOptCEn('');
      setOptCFr('');
      setOptCImg('');

      setOptDRw('');
      setOptDEn('');
      setOptDFr('');
      setOptDImg('');

      setExplanationRw('');
      setExplanationEn('');
      setExplanationFr('');
    }
  }, [questionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionRw.trim() && !questionEn.trim()) {
      toastError('Please provide the question prompt in either Kinyarwanda or English.');
      return;
    }

    if (!optARw.trim() && !optAEn.trim()) {
      toastError('Option A text is required.');
      return;
    }
    if (!optBRw.trim() && !optBEn.trim()) {
      toastError('Option B text is required.');
      return;
    }

    if (!explanationRw.trim() && !explanationEn.trim()) {
      toastError('Explanations are required for both Kinyarwanda and English.');
      return;
    }
    if (!explanationRw.trim()) {
      toastError('Kinyarwanda explanation is required.');
      return;
    }
    if (!explanationEn.trim()) {
      toastError('English explanation is required.');
      return;
    }

    if (isEditing && !editReason.trim()) {
      toastError('Please explain why you edited this question (Reason for change).');
      return;
    }

    const payload: Partial<AdminQuizQuestionItem> & { edit_reason?: string } = {
      question_number: isEditing ? questionToEdit?.question_number : (questionNumber ? Number(questionNumber) : undefined),
      domain,
      is_active: isActive,
      correct_option: correctOption,
      edit_reason: editReason.trim(),

      question_text_kinyarwanda: questionRw.trim(),
      question_text: questionEn.trim(),
      question_text_french: questionFr.trim(),

      image: imageUrl.trim() || null,

      option_a_kinyarwanda: optARw.trim(),
      option_a: optAEn.trim(),
      option_a_french: optAFr.trim(),
      option_a_image: optAImg.trim() || null,

      option_b_kinyarwanda: optBRw.trim(),
      option_b: optBEn.trim(),
      option_b_french: optBFr.trim(),
      option_b_image: optBImg.trim() || null,

      option_c_kinyarwanda: optCRw.trim(),
      option_c: optCEn.trim(),
      option_c_french: optCFr.trim(),
      option_c_image: optCImg.trim() || null,

      option_d_kinyarwanda: optDRw.trim(),
      option_d: optDEn.trim(),
      option_d_french: optDFr.trim(),
      option_d_image: optDImg.trim() || null,

      explanation_kinyarwanda: explanationRw.trim(),
      explanation: explanationEn.trim(),
      explanation_french: explanationFr.trim(),
    };

    if (editAccessEnabled === false) {
      toastError('Central Question Bank edit access is currently locked by the System Administrator.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && questionToEdit?.id) {
        await adminService.updateQuizQuestion(questionToEdit.id, payload);
        success(`Question #${questionNumber || ''} updated successfully!`);
      } else {
        await adminService.createQuizQuestion(payload);
        success('Question updated successfully!');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(
        err?.response?.data?.error?.message ||
          err?.response?.data?.error ||
          err?.response?.data?.detail ||
          err?.message ||
          'Failed to save question'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          backgroundColor: '#0F172A',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.16)',
            background: 'linear-gradient(135deg, #1e3a5f 0%, #155e75 45%, #2e2870 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.16)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {isEditing ? `Edit Question #${questionNumber || 'Q'}` : 'Manage Question'}
                </h3>
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.14)',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    color: '#FFFFFF',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {domain}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.75)' }}>
                Update restricted question prompts, multilingual translations, diagram, and answer key.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '22px 24px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {/* Previous Revision Banner if question was previously edited */}
          {questionToEdit?.last_edited_at && (
            <div
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                backgroundColor: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.8rem',
                color: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              <Clock size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#7DD3FC' }}>Last Modified:</strong>{' '}
                {questionToEdit.last_edited_by_name || 'Admin'}{' '}
                <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                  ({questionToEdit.last_edited_by_role === 'SYSTEM_ADMIN' ? 'System Admin' : 'Training Admin'})
                </span>{' '}
                on{' '}
                {new Date(questionToEdit.last_edited_at).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {questionToEdit.edit_reason && (
                  <div style={{ marginTop: '2px', color: 'rgba(255, 255, 255, 0.8)' }}>
                    <strong style={{ color: '#93C5FD' }}>Reason / Why:</strong> {questionToEdit.edit_reason}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Metadata Row: Number, Domain, Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 140px', gap: '14px', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.75)', marginBottom: '5px' }}>
                Question # {isEditing && <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.45)', fontWeight: 500 }}>(Fixed)</span>}
              </label>
              <input
                type="number"
                value={questionNumber}
                onChange={(e) => {
                  if (!isEditing) setQuestionNumber(e.target.value);
                }}
                disabled={isEditing}
                readOnly={isEditing}
                placeholder="e.g. 101"
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '9999px',
                  border: isEditing ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.16)',
                  backgroundColor: isEditing ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.06)',
                  color: isEditing ? 'rgba(255, 255, 255, 0.65)' : '#FFFFFF',
                  fontSize: '0.88rem',
                  outline: 'none',
                  cursor: isEditing ? 'not-allowed' : 'text',
                }}
                title={isEditing ? 'Question reference number cannot be changed' : undefined}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.75)', marginBottom: '5px' }}>
                Curriculum Domain <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>*</span>
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  color: '#FFFFFF',
                  fontSize: '0.88rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {DOMAIN_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value} style={{ background: '#1E293B', color: '#FFFFFF' }}>
                    {d.label} ({d.value})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ paddingTop: '18px' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                }}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ accentColor: '#38bdf8', width: '16px', height: '16px' }}
                />
                <span>Active in Pool</span>
              </label>
            </div>
          </div>

          {/* Question Prompt Section with Language Switcher */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={15} color="rgba(255, 255, 255, 0.85)" />
                <span>Question Prompt</span>
              </label>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '3px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                }}
              >
                {(
                  [
                    { key: 'RW', label: '🇷🇼 Kinyarwanda', hasVal: Boolean(questionRw) },
                    { key: 'EN', label: '🇬🇧 English', hasVal: Boolean(questionEn) },
                    { key: 'FR', label: '🇫🇷 Français', hasVal: Boolean(questionFr) },
                  ] as const
                ).map((tab) => {
                  const isActive = activeLangTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveLangTab(tab.key)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.74rem',
                        fontWeight: isActive ? 700 : 500,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: isActive ? '#1E293B' : 'transparent',
                        color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)',
                        boxShadow: isActive ? '0 2px 6px rgba(0, 0, 0, 0.25)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>{tab.label}</span>
                      {tab.hasVal && (
                        <span
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: '#FFFFFF',
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {activeLangTab === 'RW' && (
              <div>
                <textarea
                  rows={3}
                  value={questionRw}
                  onChange={(e) => setQuestionRw(e.target.value)}
                  placeholder="Andika ikibazo mu Kinyarwanda..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {activeLangTab === 'EN' && (
              <div>
                <textarea
                  rows={3}
                  value={questionEn}
                  onChange={(e) => setQuestionEn(e.target.value)}
                  placeholder="Write the question prompt in English..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {activeLangTab === 'FR' && (
              <div>
                <textarea
                  rows={3}
                  value={questionFr}
                  onChange={(e) => setQuestionFr(e.target.value)}
                  placeholder="Écrivez la question en français..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              </div>
            )}
          </div>

          {/* Diagram / Image URL */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Traffic Diagram / Road Sign Image (Optional)
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <ImageIcon
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/media/lms/questions/q12.png or https://..."
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>
              {imageUrl && (
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: '#ffffff',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <img src={imageUrl} alt="Diagram" style={{ maxHeight: '100%', maxWidth: '100%' }} />
                </div>
              )}
            </div>
          </div>

          {/* Options Section (A, B, C, D) with Correct Answer Selector */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={15} color="#38bdf8" />
                <span>Options & Verified Answer (Click letter to set as Correct)</span>
              </label>
              <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700 }}>
                Correct: Option {correctOption}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(
                [
                  {
                    key: 'A',
                    rw: optARw,
                    setRw: setOptARw,
                    en: optAEn,
                    setEn: setOptAEn,
                    fr: optAFr,
                    setFr: setOptAFr,
                    img: optAImg,
                    setImg: setOptAImg,
                  },
                  {
                    key: 'B',
                    rw: optBRw,
                    setRw: setOptBRw,
                    en: optBEn,
                    setEn: setOptBEn,
                    fr: optBFr,
                    setFr: setOptBFr,
                    img: optBImg,
                    setImg: setOptBImg,
                  },
                  {
                    key: 'C',
                    rw: optCRw,
                    setRw: setOptCRw,
                    en: optCEn,
                    setEn: setOptCEn,
                    fr: optCFr,
                    setFr: setOptCFr,
                    img: optCImg,
                    setImg: setOptCImg,
                  },
                  {
                    key: 'D',
                    rw: optDRw,
                    setRw: setOptDRw,
                    en: optDEn,
                    setEn: setOptDEn,
                    fr: optDFr,
                    setFr: setOptDFr,
                    img: optDImg,
                    setImg: setOptDImg,
                  },
                ] as const
              ).map((opt) => {
                const isCorrect = correctOption === opt.key;
                return (
                  <div
                    key={opt.key}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: isCorrect
                        ? '1.5px solid #10b981'
                        : '1px solid var(--border-subtle)',
                      backgroundColor: isCorrect
                        ? 'rgba(16, 185, 129, 0.08)'
                        : 'var(--bg-surface-elevated)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <button
                        type="button"
                        onClick={() => setCorrectOption(opt.key)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: isCorrect ? '#10b981' : 'var(--bg-surface)',
                          color: isCorrect ? '#ffffff' : 'var(--text-secondary)',
                          border: isCorrect ? 'none' : '1px solid var(--border-medium)',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        {isCorrect && <Check size={14} />}
                        <span>Option {opt.key} {isCorrect ? '(Correct Answer)' : ''}</span>
                      </button>

                      {isCorrect ? (
                        <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700 }}>
                          ✓ Will award points to student
                        </span>
                      ) : (
                        <span
                          onClick={() => setCorrectOption(opt.key)}
                          style={{ fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          Click to mark as correct
                        </span>
                      )}
                    </div>

                    {/* Option Text Input for Active Language */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                          Kinyarwanda [RW]
                        </span>
                        <input
                          type="text"
                          value={opt.rw}
                          onChange={(e) => opt.setRw(e.target.value)}
                          placeholder={`Igisubizo ${opt.key}...`}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '5px',
                            border: '1px solid var(--border-medium)',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-primary)',
                            fontSize: '0.84rem',
                            outline: 'none',
                          }}
                        />
                      </div>

                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                          English [EN]
                        </span>
                        <input
                          type="text"
                          value={opt.en}
                          onChange={(e) => opt.setEn(e.target.value)}
                          placeholder={`Option ${opt.key} in English...`}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '5px',
                            border: '1px solid var(--border-medium)',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-primary)',
                            fontSize: '0.84rem',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation Section */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
            }}
          >
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <HelpCircle size={15} color="#fbbf24" />
              <span>Explanation</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)', display: 'block', marginBottom: '5px' }}>
                  Kinyarwanda Explanation <span style={{ color: '#F87171' }}>*</span>
                </span>
                <textarea
                  rows={3}
                  value={explanationRw}
                  onChange={(e) => setExplanationRw(e.target.value)}
                  placeholder="Sobanura impamvu iki gisubizo ari cyo cy'ukuri..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#FFFFFF',
                    fontSize: '0.84rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)', display: 'block', marginBottom: '5px' }}>
                  English Explanation <span style={{ color: '#F87171' }}>*</span>
                </span>
                <textarea
                  rows={3}
                  value={explanationEn}
                  onChange={(e) => setExplanationEn(e.target.value)}
                  placeholder="Explain why this option is correct based on Highway Code..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#FFFFFF',
                    fontSize: '0.84rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Reason for Edit Section (Why is this question being changed?) */}
          {isEditing && (
            <div
              style={{
                padding: '14px 16px',
                backgroundColor: 'rgba(56, 189, 248, 0.06)',
                borderRadius: '12px',
                border: '1px solid rgba(56, 189, 248, 0.22)',
              }}
            >
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <FileText size={15} color="#38bdf8" />
                <span>Reason for Edit (Why are you editing this question?) <span style={{ color: '#F87171' }}>*</span></span>
              </label>
              <input
                type="text"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="e.g. Corrected typo in Option B, updated explanation to align with official code..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: !editReason.trim() ? '1px solid rgba(248, 113, 113, 0.4)' : '1px solid rgba(255, 255, 255, 0.16)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#FFFFFF',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.6)', display: 'block', marginTop: '5px' }}>
                This audit log will be visible to administrators alongside your name and timestamp.
              </span>
            </div>
          )}

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '8px 20px',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || editAccessEnabled === false}
              style={{
                padding: '8px 24px',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                background: editAccessEnabled === false
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'linear-gradient(135deg, #1e3a5f 0%, #155e75 45%, #2e2870 100%)',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: isSubmitting || editAccessEnabled === false ? 'not-allowed' : 'pointer',
                opacity: editAccessEnabled === false ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
              }}
            >
              {isSubmitting ? <Spinner size={15} /> : <Save size={15} />}
              <span>{isSubmitting ? 'Saving...' : editAccessEnabled === false ? 'Editing Locked' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

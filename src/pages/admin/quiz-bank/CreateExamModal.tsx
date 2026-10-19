import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  Calendar,
  Clock,
  ShieldCheck,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { AdminService, type AdminExamItem, type AdminExamPayload } from '../../../core/services/AdminService';

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  examToEdit?: AdminExamItem | null;
  cohorts: Array<{ id: string | number; name: string; code?: string }>;
}

export const CreateExamModal: React.FC<CreateExamModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  examToEdit,
  cohorts,
}) => {
  const { success, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  const isEditing = Boolean(examToEdit);

  // Form State
  const [title, setTitle] = useState('');
  const [titleRw, setTitleRw] = useState('');
  const [titleFr, setTitleFr] = useState('');
  const [cohortId, setCohortId] = useState('');
  const [openDate, setOpenDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [instructionsRw, setInstructionsRw] = useState('');
  const [instructionsFr, setInstructionsFr] = useState('');
  const [rubric, setRubric] = useState('');
  const [rubricRw, setRubricRw] = useState('');
  const [rubricFr, setRubricFr] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState<'EN' | 'RW' | 'FR'>('EN');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (examToEdit) {
      setTitle(examToEdit.title || '');
      setTitleRw(examToEdit.title_kinyarwanda || '');
      setTitleFr(examToEdit.title_french || '');
      setCohortId(examToEdit.cohort_id ? String(examToEdit.cohort_id) : '');
      setOpenDate(examToEdit.open_date ? examToEdit.open_date.slice(0, 16) : '');
      setDueDate(examToEdit.due_date ? examToEdit.due_date.slice(0, 16) : '');
      setClosingDate(examToEdit.closing_date ? examToEdit.closing_date.slice(0, 16) : '');
      setInstructions(examToEdit.instructions || '');
      setInstructionsRw(examToEdit.instructions_kinyarwanda || '');
      setInstructionsFr(examToEdit.instructions_french || '');
      setRubric(examToEdit.rubric || '');
      setRubricRw(examToEdit.rubric_kinyarwanda || '');
      setRubricFr(examToEdit.rubric_french || '');
      setIsPublished(Boolean(examToEdit.is_published));
    } else {
      // Defaults for new official exam
      setTitle('Sifo Driving School Examination');
      setTitleRw("Ikizamini cy'Amategeko y'Umuhanda — Sifo Driving School");
      setTitleFr('Examen Théorique de Conduite — Sifo Driving School');
      setCohortId(cohorts[0]?.id ? String(cohorts[0].id) : '');
      setOpenDate('');
      setDueDate('');
      setClosingDate('');
      setInstructions(
        'Official Sifo Driving School theory examination attached to the driver training curriculum. Full proctoring mandatory: camera on, mic on, pre-flight selfie identity check, and tab-switch departure detection. Exactly 1 attempt per student.'
      );
      setInstructionsRw(
        "Iki ni ikizamini cy'amategeko y'umuhanda cy'ishuri ryo gutwara ibinyabiziga rya Sifo gishamikiye ku nteganyanyigisho y'abanyeshuri (curriculum). Kamera na mikoro bigomba kuba bikora, kandi kwambuka amadirishya y'imbuga bizandikwa nk'amakosa. Ufite uburenganzira bwo gukora inshuro 1 gusa."
      );
      setInstructionsFr(
        "Examen théorique de conduite officiel de Sifo Driving School rattaché au cursus de formation. Surveillance obligatoire: caméra, micro, selfie d'identité et détection de changement d'onglet. Une seule tentative autorisée."
      );
      setRubric(
        'Total of 20 randomly drawn questions across official domains (Priority: 4, Signage: 4, Speed: 4, Legal: 3, Safety: 3, Parking: 2). Each correct answer awards 1 point. Minimum passing score is 12 points (60%). Auto-graded upon submission and forwarded for Board and Administration integrity review.'
      );
      setRubricRw(
        "Ibibazo 20 byatoranyijwe mu byiciro byose by'amategeko y'umuhanda. Buri gisubizo cy'ukuri gihesha inota 1. Amanota yo gutsinda ni 12 kuri 20 (60%). Ikizamini gikosorwa ako kanya kikanasuzumwa n'akanama gashinzwe ubudakemwa."
      );
      setRubricFr(
        '20 questions sélectionnées aléatoirement. Chaque bonne réponse vaut 1 point. Note de passage: 12/20 (60%).'
      );
      setIsPublished(false);
    }
  }, [examToEdit, cohorts, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toastError('Please enter an exam title.');
      return;
    }

    if (openDate && dueDate && new Date(openDate) > new Date(dueDate)) {
      toastError('Open date must be earlier than or equal to due date.');
      return;
    }

    if (dueDate && closingDate && new Date(dueDate) > new Date(closingDate)) {
      toastError('Due date must be earlier than or equal to closing cutoff date.');
      return;
    }

    const selectedCohort = cohorts.find((c) => String(c.id) === String(cohortId));

    const payload: AdminExamPayload = {
      title: title.trim(),
      title_kinyarwanda: titleRw.trim(),
      title_french: titleFr.trim(),
      exam_type: 'STUDENT',
      cohort_id: cohortId || null,
      cohort_name: selectedCohort?.name || (cohortId ? 'Assigned Cohort' : 'All Cohorts'),
      open_date: openDate ? new Date(openDate).toISOString() : null,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      closing_date: closingDate ? new Date(closingDate).toISOString() : null,
      instructions: instructions.trim(),
      instructions_kinyarwanda: instructionsRw.trim(),
      instructions_french: instructionsFr.trim(),
      rubric: rubric.trim(),
      rubric_kinyarwanda: rubricRw.trim(),
      rubric_french: rubricFr.trim(),
      is_published: isPublished,
    };

    setIsSubmitting(true);
    try {
      if (isEditing && examToEdit) {
        await adminService.updateOfficialExam(examToEdit.id, payload);
        success('Official examination window updated successfully.');
      } else {
        await adminService.createOfficialExam(payload);
        success('Official examination window scheduled successfully.');
      }
      onSuccess();
    } catch (err: any) {
      toastError(
        err?.response?.data?.message ||
          err?.response?.data?.error?.message ||
          'Failed to save examination window.'
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
        zIndex: 9999,
        backgroundColor: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #101c2e 0%, #0d2238 50%, #15182e 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
          color: '#FFFFFF',
          fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(30, 58, 95, 0.5) 0%, rgba(21, 94, 117, 0.4) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
              }}
            >
              <Award size={22} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
                {isEditing ? 'Edit Official Exam Window' : 'Schedule Official Driving Theory Exam'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Training Administrator Exam Dispatch • Enforces automated question pulling & proctoring
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '9999px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Engine Rules Guarantee Banner */}
        <div
          style={{
            padding: '12px 28px',
            background: 'rgba(14, 165, 233, 0.09)',
            borderBottom: '1px solid rgba(14, 165, 233, 0.22)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <ShieldCheck size={20} color="#38BDF8" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.9)' }}>
            <strong style={{ color: '#38BDF8' }}>Automated Exam Engine Guarantee: </strong>
            No questions are manually picked. The system automatically pulls <strong>20 random questions</strong> across official domains (Priority: 4, Signage: 4, Speed: 4, Legal: 3, Safety: 3, Parking: 2), enforces an <strong>exact 20-minute timer</strong>, awards <strong>1 point per question</strong>, and grades automatically at <strong>12/20 passing threshold</strong> with full proctoring audit.
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section: Title & Language Tabs */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                Exam Title <span style={{ color: '#F87171' }}>*</span>
              </label>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '2px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                }}
              >
                {(['EN', 'RW', 'FR'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveLangTab(lang)}
                    style={{
                      padding: '3px 12px',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: activeLangTab === lang ? 700 : 500,
                      border: 'none',
                      cursor: 'pointer',
                      background: activeLangTab === lang ? '#0284C7' : 'transparent',
                      color: '#FFFFFF',
                    }}
                  >
                    {lang === 'EN' ? '🇬🇧 English' : lang === 'RW' ? '🇷🇼 Kinyarwanda' : '🇫🇷 Français'}
                  </button>
                ))}
              </div>
            </div>

            {activeLangTab === 'EN' && (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sifo Driving School Examination"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            )}
            {activeLangTab === 'RW' && (
              <input
                type="text"
                value={titleRw}
                onChange={(e) => setTitleRw(e.target.value)}
                placeholder="Umutwe w'ikizamini mu Kinyarwanda..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            )}
            {activeLangTab === 'FR' && (
              <input
                type="text"
                value={titleFr}
                onChange={(e) => setTitleFr(e.target.value)}
                placeholder="Titre de l'examen en français..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            )}
          </div>

          {/* Section: Cohort Assignment */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              Target Cohort <span style={{ color: '#F87171' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={cohortId}
                onChange={(e) => setCohortId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: '#132135',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  fontSize: '0.86rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">-- All Active Cohorts --</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name} {c.code ? `(${c.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Enrolled students in this cohort will have access to sit for this official exam within the scheduled dates.
            </p>
          </div>

          {/* Section: Schedule Window (Open Date, Due Date, Closing Cutoff) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
              padding: '16px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#38BDF8', marginBottom: '6px' }}>
                <Calendar size={14} /> Open Date & Time
              </label>
              <input
                type="datetime-local"
                value={openDate}
                onChange={(e) => setOpenDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: '#0d1929',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.55)', display: 'block', marginTop: '3px' }}>
                When test window opens
              </span>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#FBBF24', marginBottom: '6px' }}>
                <Clock size={14} /> Due Date & Time
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: '#0d1929',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.55)', display: 'block', marginTop: '3px' }}>
                Official expected completion
              </span>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#F87171', marginBottom: '6px' }}>
                <AlertCircle size={14} /> Closing Date & Cutoff
              </label>
              <input
                type="datetime-local"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: '#0d1929',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.55)', display: 'block', marginTop: '3px' }}>
                Strict cutoff; no attempts after
              </span>
            </div>
          </div>

          {/* Section: Candidate Instructions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                Candidate Instructions ({activeLangTab})
              </label>
            </div>
            {activeLangTab === 'EN' && (
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Instructions provided to candidates before beginning the examination..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  fontSize: '0.84rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            )}
            {activeLangTab === 'RW' && (
              <textarea
                rows={3}
                value={instructionsRw}
                onChange={(e) => setInstructionsRw(e.target.value)}
                placeholder="Amabwiriza ahabwa umunyeshuri mbere yo gutangira..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  fontSize: '0.84rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            )}
            {activeLangTab === 'FR' && (
              <textarea
                rows={3}
                value={instructionsFr}
                onChange={(e) => setInstructionsFr(e.target.value)}
                placeholder="Instructions fournies aux candidats avant de commencer..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  fontSize: '0.84rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            )}
          </div>

          {/* Section: Evaluation Rubric */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                Grading Rubric & Theory Rules ({activeLangTab})
              </label>
            </div>
            {activeLangTab === 'EN' && (
              <textarea
                rows={3}
                value={rubric}
                onChange={(e) => setRubric(e.target.value)}
                placeholder="Evaluation criteria, domain weighting, and theory passing rules..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  fontSize: '0.84rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            )}
            {activeLangTab === 'RW' && (
              <textarea
                rows={3}
                value={rubricRw}
                onChange={(e) => setRubricRw(e.target.value)}
                placeholder="Uburyo amanota abarwa n'amategeko yo gutsinda..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  fontSize: '0.84rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            )}
            {activeLangTab === 'FR' && (
              <textarea
                rows={3}
                value={rubricFr}
                onChange={(e) => setRubricFr(e.target.value)}
                placeholder="Critères d'évaluation et règles de passage..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  fontSize: '0.84rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            )}
          </div>

          {/* Section: Publication Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#FFFFFF' }}>Publish Exam Window</div>
              <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                {isPublished ? 'Exam is active and visible to enrolled students.' : 'Exam remains in draft status.'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPublished((p) => !p)}
              style={{
                width: '46px',
                height: '24px',
                borderRadius: '9999px',
                background: isPublished ? '#10B981' : 'rgba(255, 255, 255, 0.25)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  position: 'absolute',
                  top: '3px',
                  left: isPublished ? '24px' : '3px',
                  transition: 'left 0.2s ease',
                }}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '10px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '9px 20px',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '9px 24px',
                borderRadius: '9999px',
                border: 'none',
                background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>{isEditing ? 'Save Changes' : 'Schedule Official Exam'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

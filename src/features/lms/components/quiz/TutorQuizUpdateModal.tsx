import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Clock,
  Calendar,
  FileText,
  RotateCcw,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { type CourseAssignmentItem, parseRubrics } from '../course/CanvasCourseWorkspace';
import { AdminService, type QuizPayload } from '../../../../core/services/AdminService';
import { useToast } from '../../../../context/ToastContext';

interface TutorQuizUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: CourseAssignmentItem | null;
  onSuccess: (updated: Partial<CourseAssignmentItem>) => void;
}

const toDateTimeLocal = (iso?: string | null): string => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
};

const formatDisplayDate = (val?: string | null): string => {
  if (!val) return 'None set';
  try {
    const d = new Date(val);
    return (
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' at ' +
      d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    );
  } catch {
    return val;
  }
};

export const TutorQuizUpdateModal: React.FC<TutorQuizUpdateModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onSuccess,
}) => {
  const { success, error: toastError, warning } = useToast();

  const [instructions, setInstructions] = useState('');
  const [rubricText, setRubricText] = useState('');
  const [openDate, setOpenDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [allowLateSubmission, setAllowLateSubmission] = useState(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(20);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (assignment) {
      setInstructions(assignment.instructions || '');
      setRubricText(
        assignment.rubricText ||
        assignment.rubrics?.map((r) => `${r.criteria}: ${r.points}`).join('\n') ||
        ''
      );
      setOpenDate(toDateTimeLocal(assignment.rawOpenDate));
      setDueDate(toDateTimeLocal(assignment.rawDueDate));
      setClosingDate(toDateTimeLocal(assignment.rawClosingDate));
      setAllowLateSubmission(Boolean(assignment.allowLateSubmission));
      setTimeLimitMinutes(assignment.timeLimitMinutes || 20);
      setMaxAttempts(assignment.attemptsAllowed || 1);
    }
  }, [assignment]);

  if (!isOpen || !assignment) return null;

  const canEditInstructions = Boolean(assignment.allowTutorEditInstructions);
  const canSchedule = Boolean(assignment.allowTutorScheduling);
  const canEditDuration = Boolean(assignment.allowTutorEditDuration);
  const canEditAttempts = Boolean(assignment.allowTutorEditAttempts);

  const hasAnyPermission =
    canEditInstructions || canSchedule || canEditDuration || canEditAttempts;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAnyPermission) {
      warning('You have not been granted permission to update any rules for this quiz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<QuizPayload> = {};

      if (canEditInstructions) {
        payload.description = instructions;
        payload.rubric = rubricText;
      }

      if (canSchedule) {
        payload.open_date = openDate ? new Date(openDate).toISOString() : (null as any);
        payload.deadline = dueDate ? new Date(dueDate).toISOString() : (null as any);
        payload.closing_date = closingDate ? new Date(closingDate).toISOString() : (null as any);
        payload.allow_late_submission = allowLateSubmission;
      }

      if (canEditDuration) {
        payload.time_limit_minutes = Number(timeLimitMinutes);
      }

      if (canEditAttempts) {
        payload.max_attempts = Number(maxAttempts);
      }

      await AdminService.getInstance().updateQuiz(assignment.id, payload);

      // Construct partial update for local parent view
      const updatedFields: Partial<CourseAssignmentItem> = {};
      if (canEditInstructions) {
        updatedFields.instructions = instructions;
        updatedFields.rubricText = rubricText;
        updatedFields.rubrics = parseRubrics(rubricText, assignment.points);
      }
      if (canSchedule) {
        updatedFields.rawOpenDate = payload.open_date;
        updatedFields.rawDueDate = payload.deadline;
        updatedFields.rawClosingDate = payload.closing_date;
        updatedFields.openDate = formatDisplayDate(payload.open_date);
        updatedFields.dueDate = formatDisplayDate(payload.deadline);
        updatedFields.closingDate = formatDisplayDate(payload.closing_date);
        updatedFields.allowLateSubmission = allowLateSubmission;
      }
      if (canEditDuration) {
        updatedFields.timeLimitMinutes = Number(timeLimitMinutes);
        updatedFields.timeLimit = `${timeLimitMinutes} Minutes`;
      }
      if (canEditAttempts) {
        updatedFields.attemptsAllowed = Number(maxAttempts);
      }

      onSuccess(updatedFields);
      success('Quiz rules updated successfully.');
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update quiz rules.');
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
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#0055A5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #DBEAFE',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1E293B' }}>
                  Update Quiz Rules & Settings
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#E0F2FE',
                    color: '#0369A1',
                    border: '1px solid #BAE6FD',
                  }}
                >
                  Tutor Access
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#64748B' }}>
                {assignment.title} • Customize cohort parameters authorized by the Training Administrator.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Permissions Overview Banner */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#334155',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ShieldCheck size={15} color="#0055A5" />
              <span>Training Admin Access Grants for this Quiz</span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: '10px',
              }}
            >
              {/* Permission Item 1 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: canEditInstructions ? '#F0FDF4' : '#F1F5F9',
                  border: `1px solid ${canEditInstructions ? '#DCFCE7' : '#E2E8F0'}`,
                }}
              >
                {canEditInstructions ? (
                  <CheckCircle2 size={16} color="#166534" />
                ) : (
                  <Lock size={15} color="#64748B" />
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: canEditInstructions ? '#166534' : '#64748B' }}>
                    Instructions & Rubric
                  </span>
                  <span style={{ fontSize: '0.7rem', color: canEditInstructions ? '#15803D' : '#94A3B8' }}>
                    {canEditInstructions ? 'Granted' : 'Admin Locked'}
                  </span>
                </div>
              </div>

              {/* Permission Item 2 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: canSchedule ? '#F0FDF4' : '#F1F5F9',
                  border: `1px solid ${canSchedule ? '#DCFCE7' : '#E2E8F0'}`,
                }}
              >
                {canSchedule ? (
                  <CheckCircle2 size={16} color="#166534" />
                ) : (
                  <Lock size={15} color="#64748B" />
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: canSchedule ? '#166534' : '#64748B' }}>
                    Schedules & Deadlines
                  </span>
                  <span style={{ fontSize: '0.7rem', color: canSchedule ? '#15803D' : '#94A3B8' }}>
                    {canSchedule ? 'Granted' : 'Admin Locked'}
                  </span>
                </div>
              </div>

              {/* Permission Item 3 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: canEditDuration ? '#F0FDF4' : '#F1F5F9',
                  border: `1px solid ${canEditDuration ? '#DCFCE7' : '#E2E8F0'}`,
                }}
              >
                {canEditDuration ? (
                  <CheckCircle2 size={16} color="#166534" />
                ) : (
                  <Lock size={15} color="#64748B" />
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: canEditDuration ? '#166534' : '#64748B' }}>
                    Quiz Duration
                  </span>
                  <span style={{ fontSize: '0.7rem', color: canEditDuration ? '#15803D' : '#94A3B8' }}>
                    {canEditDuration ? 'Granted' : 'Admin Locked'}
                  </span>
                </div>
              </div>

              {/* Permission Item 4 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: canEditAttempts ? '#F0FDF4' : '#F1F5F9',
                  border: `1px solid ${canEditAttempts ? '#DCFCE7' : '#E2E8F0'}`,
                }}
              >
                {canEditAttempts ? (
                  <CheckCircle2 size={16} color="#166534" />
                ) : (
                  <Lock size={15} color="#64748B" />
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: canEditAttempts ? '#166534' : '#64748B' }}>
                    Max Attempts
                  </span>
                  <span style={{ fontSize: '0.7rem', color: canEditAttempts ? '#15803D' : '#94A3B8' }}>
                    {canEditAttempts ? 'Granted' : 'Admin Locked'}
                  </span>
                </div>
              </div>
            </div>

            {!hasAnyPermission && (
              <div
                style={{
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FEE2E2',
                  borderRadius: '6px',
                  color: '#991B1B',
                  fontSize: '0.8rem',
                }}
              >
                <AlertCircle size={16} />
                <span>
                  The Training Administrator has not granted customizable permissions for this quiz. All rules are managed centrally.
                </span>
              </div>
            )}
          </div>

          {/* Section 1: Instructions & Rubric */}
          <div
            style={{
              padding: '18px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: `1px solid ${canEditInstructions ? '#CBD5E1' : '#E2E8F0'}`,
              opacity: canEditInstructions ? 1 : 0.85,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={17} color={canEditInstructions ? '#0055A5' : '#64748B'} />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>
                  1. Instructions & Grading Rubric
                </h4>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: canEditInstructions ? '#F0FDF4' : '#F1F5F9',
                  color: canEditInstructions ? '#166534' : '#64748B',
                  border: `1px solid ${canEditInstructions ? '#DCFCE7' : '#E2E8F0'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {canEditInstructions ? <CheckCircle2 size={12} /> : <Lock size={12} />}
                <span>{canEditInstructions ? 'Permission Granted' : 'Locked by Training Admin'}</span>
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Instructions for Students
                </label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  disabled={!canEditInstructions}
                  placeholder="Enter instructions, guidance, and preparation advice for students..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    color: '#1E293B',
                    backgroundColor: canEditInstructions ? '#FFFFFF' : '#F8FAFC',
                    cursor: canEditInstructions ? 'text' : 'not-allowed',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Grading Rubric & Evaluation Breakdown
                </label>
                <textarea
                  rows={2}
                  value={rubricText}
                  onChange={(e) => setRubricText(e.target.value)}
                  disabled={!canEditInstructions}
                  placeholder="e.g. Traffic Signs: 8 pts, Right of Way: 6 pts, Road Safety: 6 pts"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    color: '#1E293B',
                    backgroundColor: canEditInstructions ? '#FFFFFF' : '#F8FAFC',
                    cursor: canEditInstructions ? 'text' : 'not-allowed',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Schedules & Availability */}
          <div
            style={{
              padding: '18px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: `1px solid ${canSchedule ? '#CBD5E1' : '#E2E8F0'}`,
              opacity: canSchedule ? 1 : 0.85,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={17} color={canSchedule ? '#0055A5' : '#64748B'} />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>
                  2. Cohort Schedules & Deadlines
                </h4>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: canSchedule ? '#F0FDF4' : '#F1F5F9',
                  color: canSchedule ? '#166534' : '#64748B',
                  border: `1px solid ${canSchedule ? '#DCFCE7' : '#E2E8F0'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {canSchedule ? <CheckCircle2 size={12} /> : <Lock size={12} />}
                <span>{canSchedule ? 'Permission Granted' : 'Locked by Training Admin'}</span>
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '14px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Available From (Open Date)
                </label>
                <input
                  type="datetime-local"
                  value={openDate}
                  onChange={(e) => setOpenDate(e.target.value)}
                  disabled={!canSchedule}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    backgroundColor: canSchedule ? '#FFFFFF' : '#F8FAFC',
                    cursor: canSchedule ? 'pointer' : 'not-allowed',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Due Date (Deadline)
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={!canSchedule}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    backgroundColor: canSchedule ? '#FFFFFF' : '#F8FAFC',
                    cursor: canSchedule ? 'pointer' : 'not-allowed',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Closing Cutoff Date
                </label>
                <input
                  type="datetime-local"
                  value={closingDate}
                  onChange={(e) => setClosingDate(e.target.value)}
                  disabled={!canSchedule}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    backgroundColor: canSchedule ? '#FFFFFF' : '#F8FAFC',
                    cursor: canSchedule ? 'pointer' : 'not-allowed',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: canSchedule ? 'pointer' : 'not-allowed',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#334155',
                }}
              >
                <input
                  type="checkbox"
                  checked={allowLateSubmission}
                  onChange={(e) => setAllowLateSubmission(e.target.checked)}
                  disabled={!canSchedule}
                  style={{ width: '16px', height: '16px', cursor: canSchedule ? 'pointer' : 'not-allowed' }}
                />
                <span>Allow Late Submissions after Due Date</span>
              </label>
            </div>
          </div>

          {/* Section 3 & 4: Duration & Attempts Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Section 3: Duration */}
            <div
              style={{
                padding: '18px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: `1px solid ${canEditDuration ? '#CBD5E1' : '#E2E8F0'}`,
                opacity: canEditDuration ? 1 : 0.85,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={17} color={canEditDuration ? '#0055A5' : '#64748B'} />
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>
                    3. Duration & Time Limit
                  </h4>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: canEditDuration ? '#F0FDF4' : '#F1F5F9',
                    color: canEditDuration ? '#166534' : '#64748B',
                    border: `1px solid ${canEditDuration ? '#DCFCE7' : '#E2E8F0'}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {canEditDuration ? <CheckCircle2 size={12} /> : <Lock size={12} />}
                  <span>{canEditDuration ? 'Granted' : 'Admin Locked'}</span>
                </span>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Time Limit (Minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                  disabled={!canEditDuration}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    backgroundColor: canEditDuration ? '#FFFFFF' : '#F8FAFC',
                    cursor: canEditDuration ? 'text' : 'not-allowed',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  {canEditDuration
                    ? 'Adjust the test duration for students in your assigned cohorts.'
                    : 'Time limit is controlled exclusively by Training Administrator.'}
                </span>
              </div>
            </div>

            {/* Section 4: Attempts */}
            <div
              style={{
                padding: '18px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: `1px solid ${canEditAttempts ? '#CBD5E1' : '#E2E8F0'}`,
                opacity: canEditAttempts ? 1 : 0.85,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RotateCcw size={17} color={canEditAttempts ? '#0055A5' : '#64748B'} />
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>
                    4. Max Retake Attempts
                  </h4>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: canEditAttempts ? '#F0FDF4' : '#F1F5F9',
                    color: canEditAttempts ? '#166534' : '#64748B',
                    border: `1px solid ${canEditAttempts ? '#DCFCE7' : '#E2E8F0'}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {canEditAttempts ? <CheckCircle2 size={12} /> : <Lock size={12} />}
                  <span>{canEditAttempts ? 'Granted' : 'Admin Locked'}</span>
                </span>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Allowed Attempts (0 for unlimited)
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(Number(e.target.value))}
                  disabled={!canEditAttempts}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    backgroundColor: canEditAttempts ? '#FFFFFF' : '#F8FAFC',
                    cursor: canEditAttempts ? 'text' : 'not-allowed',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  {canEditAttempts
                    ? 'Specify how many times students may take this assessment.'
                    : 'Attempt limit is controlled exclusively by Training Administrator.'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.78rem' }}>
              <Info size={15} />
              <span>Only administrator-granted rules are submitted to the server.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !hasAnyPermission}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 20px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  backgroundColor: hasAnyPermission ? '#0055A5' : '#94A3B8',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: hasAnyPermission ? 'pointer' : 'not-allowed',
                  boxShadow: hasAnyPermission ? '0 1px 3px rgba(0, 85, 165, 0.3)' : 'none',
                }}
              >
                <Save size={16} />
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

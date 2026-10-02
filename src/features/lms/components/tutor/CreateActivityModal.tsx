import React, { useState, useEffect } from 'react';
import { X, Check, FileText } from 'lucide-react';
import {
  TutorLmsService,
  type CohortActivityItem,
  type ActivityType,
  type SubmissionType,
} from '../../../../core/services/TutorLmsService';
import { Spinner } from '../../../../components/common/Spinner';
import { useToast } from '../../../../context/ToastContext';

interface CreateActivityModalProps {
  isOpen: boolean;
  cohortId: string;
  courseId: string;
  activityToEdit?: CohortActivityItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
  isOpen,
  cohortId,
  courseId,
  activityToEdit,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('PRACTICAL_DRILL');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [submissionType, setSubmissionType] = useState<SubmissionType>('BOTH');
  const [maxScore, setMaxScore] = useState<number>(100);
  const [passScore, setPassScore] = useState<number>(75);
  const [openDate, setOpenDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [allowLateSubmissions, setAllowLateSubmissions] = useState<boolean>(true);
  const [latePenaltyPercent, setLatePenaltyPercent] = useState<number>(10);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { success, error: toastError } = useToast();

  useEffect(() => {
    if (activityToEdit) {
      setTitle(activityToEdit.title);
      setActivityType(activityToEdit.activity_type);
      setDescription(activityToEdit.description || '');
      setInstructions(activityToEdit.instructions || '');
      setSubmissionType(activityToEdit.submission_type);
      setMaxScore(activityToEdit.max_score);
      setPassScore(activityToEdit.pass_score);
      setOpenDate(activityToEdit.open_date ? activityToEdit.open_date.slice(0, 16) : '');
      setDueDate(activityToEdit.due_date ? activityToEdit.due_date.slice(0, 16) : '');
      setAllowLateSubmissions(activityToEdit.allow_late_submissions);
      setLatePenaltyPercent(activityToEdit.late_penalty_percent);
      setIsPublished(activityToEdit.is_published);
    } else {
      setTitle('');
      setActivityType('PRACTICAL_DRILL');
      setDescription('');
      setInstructions('');
      setSubmissionType('BOTH');
      setMaxScore(100);
      setPassScore(75);
      setOpenDate('');
      setDueDate('');
      setAllowLateSubmissions(true);
      setLatePenaltyPercent(10);
      setIsPublished(true);
    }
  }, [activityToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toastError('Activity title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<CohortActivityItem> = {
        title: title.trim(),
        course: courseId,
        activity_type: activityType,
        description: description.trim(),
        instructions: instructions.trim(),
        submission_type: submissionType,
        max_score: Number(maxScore),
        pass_score: Number(passScore),
        open_date: openDate ? openDate : null,
        due_date: dueDate ? dueDate : null,
        allow_late_submissions: allowLateSubmissions,
        late_penalty_percent: Number(latePenaltyPercent),
        is_published: isPublished,
      };

      if (activityToEdit) {
        await TutorLmsService.getInstance().updateCohortActivity(cohortId, activityToEdit.id, payload);
        success('Activity updated successfully.');
      } else {
        await TutorLmsService.getInstance().createCohortActivity(cohortId, payload);
        success('Activity created and assigned to cohort.');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Failed to save activity.';
      toastError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

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
          maxWidth: '680px',
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="#0055A5" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                {activityToEdit ? 'Edit Cohort Activity' : 'Create Cohort Activity'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Design practical drills, driving scenarios, or written case studies for this cohort
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Activity Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Parallel Parking Drill & Hill Start Checklist"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-elevated)',
                color: '#ffffff',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Activity Type
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as ActivityType)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                }}
              >
                <option value="PRACTICAL_DRILL">Practical Driving Drill</option>
                <option value="ASSIGNMENT">Written Assignment</option>
                <option value="CASE_STUDY">Traffic Case Study</option>
                <option value="OBSERVATION">Instructor In-Vehicle Observation</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Submission Type
              </label>
              <select
                value={submissionType}
                onChange={(e) => setSubmissionType(e.target.value as SubmissionType)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                }}
              >
                <option value="BOTH">Text & File Upload</option>
                <option value="ONLINE_TEXT">Online Text Answer</option>
                <option value="FILE_UPLOAD">File / Photo Upload Only</option>
                <option value="PRACTICAL_CHECKLIST">In-Person Checklist Only</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Brief Overview / Objective
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Master clutch biting point and 3-point turning maneuvers on slight incline."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-elevated)',
                color: '#ffffff',
                fontSize: '0.88rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Detailed Instructions for Learners
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Provide step-by-step guidance on what students should perform, photograph, or explain..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-elevated)',
                color: '#ffffff',
                fontSize: '0.88rem',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Max Points
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Passing Score
              </label>
              <input
                type="number"
                min={1}
                max={maxScore}
                value={passScore}
                onChange={(e) => setPassScore(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Available From (Open Date)
              </label>
              <input
                type="datetime-local"
                value={openDate}
                onChange={(e) => setOpenDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Due Date (Deadline)
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={allowLateSubmissions}
                onChange={(e) => setAllowLateSubmissions(e.target.checked)}
                style={{ accentColor: '#0055A5', width: '16px', height: '16px' }}
              />
              <span>Allow Late Submissions</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                style={{ accentColor: '#058728', width: '16px', height: '16px' }}
              />
              <span style={{ color: '#4ade80', fontWeight: 600 }}>Publish to Cohort immediately</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} disabled={isSubmitting} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isSubmitting ? <Spinner size={16} /> : <Check size={16} />}
              <span>{activityToEdit ? 'Save Changes' : 'Create Activity'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

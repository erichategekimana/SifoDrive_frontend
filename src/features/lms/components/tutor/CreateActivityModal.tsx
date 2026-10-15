import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Presentation,
  File as FileIcon,
  Lock,
  Unlock,
} from 'lucide-react';
import {
  TutorLmsService,
  type CohortActivityItem,
  type ActivityResourceType,
} from '../../../../core/services/TutorLmsService';
import { Spinner } from '../../../../components/common/Spinner';
import { useToast } from '../../../../context/ToastContext';

interface CreateActivityModalProps {
  isOpen: boolean;
  cohortId: string;
  courseId: string;
  activityToEdit?: CohortActivityItem | null;
  availableCohorts?: { id: string; name?: string; code?: string }[];
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
  isOpen,
  cohortId,
  courseId,
  activityToEdit,
  availableCohorts = [],
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');

  // Targeting: One, Multiple, or All Cohorts
  const [targetType, setTargetType] = useState<'SINGLE_COHORT' | 'MULTIPLE_COHORTS' | 'ALL_COHORTS'>('SINGLE_COHORT');
  const [selectedCohortIds, setSelectedCohortIds] = useState<string[]>([cohortId]);

  // Media / Content Type: Images, Text, Google Slides, PDF, Link
  const [resourceType, setResourceType] = useState<ActivityResourceType>('TEXT');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  // Allowed Submission Methods
  const [allowedSubmissionMethods, setAllowedSubmissionMethods] = useState<string[]>([
    'pdf_upload',
    'link',
    'image_upload',
    'online_text',
  ]);

  // Scoring & Scheduling
  const [maxScore, setMaxScore] = useState<number>(100);
  const [passScore, setPassScore] = useState<number>(75);
  const [openDate, setOpenDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [allowLateSubmissions, setAllowLateSubmissions] = useState<boolean>(true);
  const [latePenaltyPercent, setLatePenaltyPercent] = useState<number>(10);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [releaseGradesImmediately, setReleaseGradesImmediately] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { success, error: toastError } = useToast();

  useEffect(() => {
    if (activityToEdit) {
      setTitle(activityToEdit.title || '');
      setInstructions(activityToEdit.instructions || activityToEdit.description || '');
      setMaxScore(activityToEdit.max_score ?? activityToEdit.total_points ?? 100);
      setPassScore(activityToEdit.pass_score ?? activityToEdit.passing_points ?? 75);
      setOpenDate(activityToEdit.open_date ? activityToEdit.open_date.slice(0, 16) : '');
      setDueDate(activityToEdit.due_date ? activityToEdit.due_date.slice(0, 16) : '');
      setAllowLateSubmissions(activityToEdit.allow_late_submissions ?? true);
      setLatePenaltyPercent(activityToEdit.late_penalty_percent ?? 10);
      setIsLocked(activityToEdit.is_locked ?? false);
      setIsPublished(activityToEdit.is_published ?? true);
      setReleaseGradesImmediately(activityToEdit.release_grades_immediately ?? false);

      setResourceType(activityToEdit.resource_type || 'TEXT');
      setAttachmentUrl(activityToEdit.attachment_url || '');
      setAttachmentFile(null);
      if (Array.isArray(activityToEdit.allowed_submission_methods) && activityToEdit.allowed_submission_methods.length > 0) {
        setAllowedSubmissionMethods(activityToEdit.allowed_submission_methods);
      } else {
        setAllowedSubmissionMethods(['pdf_upload', 'link', 'image_upload', 'online_text']);
      }
      setTargetType('SINGLE_COHORT');
      setSelectedCohortIds([activityToEdit.cohort || cohortId]);
    } else {
      setTitle('');
      setInstructions('');
      setMaxScore(100);
      setPassScore(75);
      setOpenDate('');
      setDueDate('');
      setAllowLateSubmissions(true);
      setLatePenaltyPercent(10);
      setIsLocked(false);
      setIsPublished(true);
      setReleaseGradesImmediately(false);

      setResourceType('TEXT');
      setAttachmentUrl('');
      setAttachmentFile(null);
      setAllowedSubmissionMethods(['pdf_upload', 'link', 'image_upload', 'online_text']);
      setTargetType('SINGLE_COHORT');
      setSelectedCohortIds(cohortId ? [cohortId] : (availableCohorts[0]?.id ? [availableCohorts[0].id] : []));
    }
  }, [activityToEdit, isOpen, cohortId, availableCohorts]);

  if (!isOpen) return null;

  const toggleSubmissionMethod = (method: string) => {
    setAllowedSubmissionMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const toggleCohortSelection = (cId: string) => {
    setSelectedCohortIds((prev) =>
      prev.includes(cId) ? prev.filter((id) => id !== cId) : [...prev, cId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toastError('Activity title is required.');
      return;
    }

    if (allowedSubmissionMethods.length === 0) {
      toastError('Please select at least one allowed submission method.');
      return;
    }

    if (targetType === 'MULTIPLE_COHORTS' && selectedCohortIds.length === 0) {
      toastError('Please select at least one target cohort.');
      return;
    }

    setIsSubmitting(true);
    try {
      const targetCohortToCall =
        (targetType === 'SINGLE_COHORT' && selectedCohortIds[0])
          ? selectedCohortIds[0]
          : cohortId || selectedCohortIds[0] || (availableCohorts[0]?.id ?? '');

      const effectiveDescription = instructions.trim() || title.trim();

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('course', courseId);
      formData.append('cohort', targetCohortToCall);
      formData.append('activity_type', 'ASSIGNMENT');
      formData.append('description', effectiveDescription);
      formData.append('instructions', effectiveDescription);

      const hasFileUpload = allowedSubmissionMethods.includes('pdf_upload') || allowedSubmissionMethods.includes('image_upload');
      const hasText = allowedSubmissionMethods.includes('online_text');
      const resolvedSubmissionType = hasFileUpload ? 'FILE_UPLOAD' : hasText ? 'TEXT_RESPONSE' : 'TEXT_RESPONSE';
      formData.append('submission_type', resolvedSubmissionType);

      formData.append('max_score', String(maxScore || 100));
      formData.append('pass_score', String(passScore || 70));
      formData.append('total_points', String(maxScore || 100));
      formData.append('passing_points', String(passScore || 70));

      if (openDate) formData.append('open_date', openDate);
      if (dueDate) formData.append('due_date', dueDate);
      formData.append('allow_late_submission', String(allowLateSubmissions));
      formData.append('allow_late_submissions', String(allowLateSubmissions));
      formData.append('late_penalty_percent', String(latePenaltyPercent));
      formData.append('is_published', String(isPublished));
      formData.append('is_locked', String(isLocked));
      formData.append('release_grades_immediately', String(releaseGradesImmediately));

      formData.append('resource_type', resourceType);
      formData.append('attachment_url', attachmentUrl.trim());
      if (attachmentFile) {
        formData.append('attachment', attachmentFile);
      }

      formData.append('allowed_submission_methods', JSON.stringify(allowedSubmissionMethods));
      formData.append('target_type', targetType);
      formData.append('target_cohort_ids', JSON.stringify(selectedCohortIds));

      if (activityToEdit) {
        await TutorLmsService.getInstance().updateCohortActivity(
          activityToEdit.cohort || targetCohortToCall,
          activityToEdit.id,
          formData
        );
        success('Activity updated successfully.');
      } else {
        await TutorLmsService.getInstance().createCohortActivity(targetCohortToCall, formData);
        success(
          targetType === 'ALL_COHORTS'
            ? 'Activity created and published across all active cohorts!'
            : targetType === 'MULTIPLE_COHORTS'
            ? `Activity created for ${selectedCohortIds.length} cohorts!`
            : 'Activity created and assigned to cohort.'
        );
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
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        className="canvas-card"
        style={{
          width: '100%',
          maxWidth: '740px',
          borderRadius: '12px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: '#EFF6FF',
                color: '#0055A5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1E293B' }}>
                {activityToEdit ? 'Edit Activity' : 'Create Activity'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                Design drills, slides tasks, or assignments with rich media & targeted cohorts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {/* 1. Targeting Section (Dropdown) */}
          {!activityToEdit && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Target Cohorts <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                value={
                  targetType === 'ALL_COHORTS'
                    ? 'ALL_COHORTS'
                    : targetType === 'MULTIPLE_COHORTS'
                    ? 'MULTIPLE_COHORTS'
                    : selectedCohortIds[0] || cohortId || (availableCohorts[0]?.id ?? 'ALL_COHORTS')
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'ALL_COHORTS') {
                    setTargetType('ALL_COHORTS');
                    setSelectedCohortIds(availableCohorts.map((c) => c.id));
                  } else if (val === 'MULTIPLE_COHORTS') {
                    setTargetType('MULTIPLE_COHORTS');
                    if (selectedCohortIds.length === 0 && cohortId) {
                      setSelectedCohortIds([cohortId]);
                    }
                  } else {
                    setTargetType('SINGLE_COHORT');
                    setSelectedCohortIds([val]);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B',
                  fontSize: '0.88rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL_COHORTS">All Active Cohorts</option>
                {availableCohorts.length > 0 ? (
                  <optgroup label="Specific Cohort">
                    {availableCohorts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name || c.code || 'Cohort'}
                      </option>
                    ))}
                  </optgroup>
                ) : cohortId ? (
                  <option value={cohortId}>Current Cohort</option>
                ) : null}
                {availableCohorts.length > 1 && (
                  <option value="MULTIPLE_COHORTS">Multiple Cohorts (Custom Selection)...</option>
                )}
              </select>

              {/* Multiple Cohorts checklist if custom selection chosen */}
              {targetType === 'MULTIPLE_COHORTS' && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '12px 14px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                    Select which cohorts receive this activity:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {availableCohorts.map((c) => {
                      const selected = selectedCohortIds.includes(c.id);
                      return (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => toggleCohortSelection(c.id)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: selected ? 700 : 500,
                            border: selected ? '1px solid #10B981' : '1px solid #CBD5E1',
                            backgroundColor: selected ? '#ECFDF5' : '#FFFFFF',
                            color: selected ? '#047857' : '#475569',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          {selected ? <Check size={13} color="#047857" /> : null}
                          <span>{c.name || c.code || 'Cohort'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activity Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Activity Title <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hill Start Technique & Three-Point Turn Drill"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#1E293B',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* 2. Media Resource Section (Images, Text, Google Slides, PDF) */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Activity Media & Materials</span>
              </label>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Attach text, images, Google Slides, or PDF
              </span>
            </div>

            {/* Resource Type Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {(
                [
                  { type: 'TEXT', label: 'Text Instructions', icon: FileText },
                  { type: 'IMAGE', label: 'Image / Diagram', icon: ImageIcon },
                  { type: 'GOOGLE_SLIDES', label: 'Google Slides', icon: Presentation },
                  { type: 'PDF', label: 'PDF Document', icon: FileIcon },
                ] as const
              ).map((item) => {
                const active = resourceType === item.type;
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => setResourceType(item.type)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: active ? 700 : 500,
                      border: active ? '1px solid #0055A5' : '1px solid #CBD5E1',
                      backgroundColor: active ? '#EFF6FF' : '#FFFFFF',
                      color: active ? '#0055A5' : '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Google Slides input */}
            {resourceType === 'GOOGLE_SLIDES' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                  Google Slides Link or Embed URL
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Presentation
                      size={16}
                      color="#D97706"
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                      type="url"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      placeholder="https://docs.google.com/presentation/d/e/.../pub or presentation link"
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#1E293B',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.4 }}>
                  Students will be able to review these slides directly within their activity window or open them in Google Slides.
                </div>
              </div>
            )}

            {/* Image attachment */}
            {resourceType === 'IMAGE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#334155', fontWeight: 600, marginBottom: '4px' }}>
                      Image File Upload
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAttachmentFile(e.target.files[0]);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#1E293B',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#334155', fontWeight: 600, marginBottom: '4px' }}>
                      Or Image URL
                    </label>
                    <input
                      type="url"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      placeholder="https://.../diagram.png"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#1E293B',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
                {(attachmentFile || attachmentUrl) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#0284C7', fontWeight: 600 }}>
                    <ImageIcon size={14} />
                    <span>Attached image ready for preview</span>
                  </div>
                )}
              </div>
            )}

            {/* PDF attachment */}
            {resourceType === 'PDF' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#334155', fontWeight: 600, marginBottom: '4px' }}>
                      PDF File Upload
                    </label>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAttachmentFile(e.target.files[0]);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#1E293B',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#334155', fontWeight: 600, marginBottom: '4px' }}>
                      Or PDF Web Link
                    </label>
                    <input
                      type="url"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      placeholder="https://.../guideline.pdf"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#1E293B',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions & Guidelines for Learners */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Instructions & Description for Learners
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Provide step-by-step guidance on what students should perform, study, or submit..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#1E293B',
                fontSize: '0.88rem',
                resize: 'vertical',
                outline: 'none',
              }}
            />
          </div>

          {/* 3. Allowed Submission Methods */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
            }}
          >
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
              Allowed Submission Methods
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
              {(
                [
                  { key: 'pdf_upload', label: 'PDF Upload', icon: FileIcon },
                  { key: 'link', label: 'Link / Google Drive', icon: LinkIcon },
                  { key: 'image_upload', label: 'Image Upload', icon: ImageIcon },
                  { key: 'online_text', label: 'Online Text', icon: FileText },
                ] as const
              ).map((method) => {
                const isSelected = allowedSubmissionMethods.includes(method.key);
                const Icon = method.icon;
                return (
                  <button
                    type="button"
                    key={method.key}
                    onClick={() => toggleSubmissionMethod(method.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid #10B981' : '1px solid #CBD5E1',
                      backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                      color: isSelected ? '#047857' : '#475569',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 700 : 500,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Icon size={14} />
                    <span>{method.label}</span>
                    {isSelected && <Check size={13} color="#047857" style={{ marginLeft: 'auto' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Points & Schedule */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
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
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
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
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Available From (Schedule Open)
              </label>
              <input
                type="datetime-local"
                value={openDate}
                onChange={(e) => setOpenDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Due Date (Deadline)
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Lock / Unlock Toggle & Publishing */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderRadius: '8px',
              backgroundColor: isLocked ? '#FEF2F2' : '#F0FDF4',
              border: isLocked ? '1px solid #FECACA' : '1px solid #BBF7D0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isLocked ? <Lock size={18} color="#DC2626" /> : <Unlock size={18} color="#16A34A" />}
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: isLocked ? '#DC2626' : '#16A34A' }}>
                  {isLocked ? 'Activity Locked (Hidden from Students)' : 'Activity Unlocked (Visible to Students)'}
                </div>
                <div style={{ fontSize: '0.74rem', color: isLocked ? '#991B1B' : '#166534', marginTop: '2px' }}>
                  {isLocked
                    ? 'Learners cannot see or work on this activity until you unlock it.'
                    : 'Targeted learners will immediately see this activity in their assignments.'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsLocked(!isLocked)}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: 'none',
                backgroundColor: isLocked ? '#DC2626' : '#16A34A',
                color: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              {isLocked ? 'Unlock Now' : 'Lock Activity'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingTop: '4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={allowLateSubmissions}
                onChange={(e) => setAllowLateSubmissions(e.target.checked)}
                style={{ accentColor: '#0055A5', width: '16px', height: '16px' }}
              />
              <span>Allow Late Submissions</span>
            </label>
          </div>

          {/* Grade Release Policy */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
            }}
          >
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
              Grade Release Policy
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: `1.5px solid ${!releaseGradesImmediately ? '#0055A5' : '#E2E8F0'}`,
                  backgroundColor: !releaseGradesImmediately ? '#F0F7FF' : '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="activityGradeReleasePolicy"
                  checked={!releaseGradesImmediately}
                  onChange={() => setReleaseGradesImmediately(false)}
                  style={{ marginTop: '2px', accentColor: '#0055A5', width: '15px', height: '15px' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1E293B' }}>
                    Manual Release by Tutor (Recommended / Default)
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                    Grades and feedback stay hidden from students until you click "Publish Grades".
                  </span>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: `1.5px solid ${releaseGradesImmediately ? '#0055A5' : '#E2E8F0'}`,
                  backgroundColor: releaseGradesImmediately ? '#F0F7FF' : '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="activityGradeReleasePolicy"
                  checked={releaseGradesImmediately}
                  onChange={() => setReleaseGradesImmediately(true)}
                  style={{ marginTop: '2px', accentColor: '#0055A5', width: '15px', height: '15px' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1E293B' }}>
                    Immediate Grade Release
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                    Release scores and results directly to students upon evaluation.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Footer buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '9px 18px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '9px 20px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#0055A5',
                color: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
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

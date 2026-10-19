import React, { useState, useEffect } from 'react';
import {
  Award,
  ExternalLink,
  Check,
  User,
  Calendar,
  FileText,
  Download,
  Image as ImageIcon,
  File,
  Lock,
  Clock,
} from 'lucide-react';
import {
  TutorLmsService,
  type CohortActivityItem,
  type StudentActivitySubmissionItem,
} from '../../../../core/services/TutorLmsService';
import { Badge } from '../../../../components/common/Badge';
import { Spinner } from '../../../../components/common/Spinner';
import { useToast } from '../../../../context/ToastContext';
import { PdfViewer } from '../common/PdfViewer';

export interface ReviewSubmissionsModalProps {
  isOpen?: boolean;
  cohortId: string;
  activity: CohortActivityItem | null;
  onClose: () => void;
  onSuccess: () => void;
  backLabel?: string;
}

export const ReviewSubmissionsModal: React.FC<ReviewSubmissionsModalProps> = ({
  isOpen = true,
  cohortId,
  activity,
  onClose: _onClose,
  onSuccess,
  backLabel: _backLabel,
}) => {
  const [submissions, setSubmissions] = useState<StudentActivitySubmissionItem[]>([]);
  const [selectedSub, setSelectedSub] = useState<StudentActivitySubmissionItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [scoreInput, setScoreInput] = useState<string>('');
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [isPublishingGrades, setIsPublishingGrades] = useState<boolean>(false);
  const [isGradesPublished, setIsGradesPublished] = useState<boolean>(Boolean(activity?.grades_published));

  const { success, error: toastError } = useToast();

  const fetchSubmissions = async () => {
    if (!activity) return;
    const effectiveCohortId = activity.cohort || cohortId;
    if (!effectiveCohortId) return;
    setIsLoading(true);
    try {
      const data = await TutorLmsService.getInstance().getActivitySubmissions(effectiveCohortId, activity.id);
      setSubmissions(data);
      if (data.length > 0) {
        setSelectedSub(data[0]);
        setScoreInput(data[0].score !== null ? String(data[0].score) : '');
        setFeedbackInput(data[0].tutor_feedback || data[0].feedback || '');
      } else {
        setSelectedSub(null);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to load activity submissions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && activity) {
      setIsGradesPublished(Boolean(activity.grades_published));
      fetchSubmissions();
    }
  }, [isOpen, activity]);

  const isBeforeOpenDate = React.useMemo(() => {
    if (!activity?.open_date) return false;
    const openDate = new Date(activity.open_date);
    return !isNaN(openDate.getTime()) && openDate.getTime() > Date.now();
  }, [activity?.open_date]);

  const isBeforeDueDate = React.useMemo(() => {
    if (!activity?.due_date) return false;
    const dueDate = new Date(activity.due_date);
    return !isNaN(dueDate.getTime()) && dueDate.getTime() > Date.now();
  }, [activity?.due_date]);

  const isBeforeDates = isBeforeOpenDate || isBeforeDueDate;

  const formattedOpenDate = React.useMemo(() => {
    if (!activity?.open_date) return null;
    const d = new Date(activity.open_date);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [activity?.open_date]);

  const formattedDueDate = React.useMemo(() => {
    if (!activity?.due_date) return null;
    const d = new Date(activity.due_date);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [activity?.due_date]);

  const handlePublishGrades = async () => {
    if (!activity) return;
    if (isBeforeOpenDate) {
      toastError(
        `Cannot publish activity grades before the activity open date (${formattedOpenDate || 'scheduled start'}). The activity has not opened yet.`
      );
      return;
    }
    if (isBeforeDueDate) {
      toastError(
        `Cannot publish activity grades before the activity deadline (${formattedDueDate || 'set deadline'}). Students may still be submitting work.`
      );
      return;
    }
    const effectiveCohortId = activity.cohort || cohortId;
    if (!effectiveCohortId) return;
    setIsPublishingGrades(true);
    try {
      await TutorLmsService.getInstance().publishActivityGrades(effectiveCohortId, activity.id);
      success(`Grades for "${activity.title}" published successfully to students.`);
      setIsGradesPublished(true);
      activity.grades_published = true;
      onSuccess();
    } catch (err: any) {
      toastError(err?.message || 'Failed to publish grades.');
    } finally {
      setIsPublishingGrades(false);
    }
  };

  const handleSelectSubmission = (sub: StudentActivitySubmissionItem) => {
    setSelectedSub(sub);
    setScoreInput(sub.score !== null ? String(sub.score) : '');
    setFeedbackInput(sub.tutor_feedback || sub.feedback || '');
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !activity) return;

    const numScore = parseFloat(scoreInput);
    const maxScore = activity.max_score ?? activity.total_points ?? 100;
    if (isNaN(numScore) || numScore < 0 || numScore > maxScore) {
      toastError(`Score must be a number between 0 and ${maxScore}.`);
      return;
    }

    const effectiveCohortId = activity.cohort || cohortId;
    if (!effectiveCohortId) return;
    setIsGrading(true);
    try {
      const updated = await TutorLmsService.getInstance().gradeActivitySubmission(
        effectiveCohortId,
        activity.id,
        selectedSub.id,
        {
          score: numScore,
          feedback: feedbackInput.trim(),
        }
      );
      success(`Grade awarded to ${selectedSub.student_name || 'student'}.`);
      setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setSelectedSub(updated);
      onSuccess();
    } catch (err: any) {
      toastError(err?.message || 'Failed to submit grade.');
    } finally {
      setIsGrading(false);
    }
  };

  if (isOpen !== undefined && !isOpen) return null;
  if (!activity) return null;

  return (
    <div
      className="canvas-card"
      style={{
        width: '100%',
        minHeight: '82vh',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '8px',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface-elevated)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  color: 'var(--primary-400)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Submissions: {activity.title}
              </h3>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Max Points: <strong style={{ color: 'var(--text-primary)' }}>{activity.max_score}</strong> • Passing: <strong style={{ color: 'var(--text-primary)' }}>{activity.pass_score}</strong> • Total Submissions: <strong style={{ color: 'var(--primary-400)' }}>{submissions.length}</strong>
            </p>
          </div>
        </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isGradesPublished ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#15803D',
                  backgroundColor: '#DCFCE7',
                  border: '1px solid #BBF7D0',
                }}
              >
                <Check size={14} />
                <span>Published</span>
              </span>
            ) : isBeforeDates ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#B45309',
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FDE68A',
                  }}
                  title={
                    isBeforeOpenDate
                      ? `Activity opens on ${formattedOpenDate}. Grades can only be published once open date arrives and deadline passes.`
                      : `Submissions remain open until ${formattedDueDate}. Grades can only be published once the deadline has passed.`
                  }
                >
                  <Clock size={13} />
                  <span>{isBeforeOpenDate ? `Opens: ${formattedOpenDate}` : `Deadline: ${formattedDueDate}`}</span>
                </span>
                <button
                  type="button"
                  disabled
                  className="canvas-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    backgroundColor: '#F3F4F6',
                    color: '#9CA3AF',
                    border: '1px solid #E5E7EB',
                    cursor: 'not-allowed',
                    opacity: 0.9,
                  }}
                  title={
                    isBeforeOpenDate
                      ? `Cannot publish grades before the activity open date (${formattedOpenDate}).`
                      : `Cannot publish grades before the activity deadline (${formattedDueDate}).`
                  }
                >
                  <Lock size={14} />
                  <span>{isBeforeOpenDate ? 'Grades Locked (Open Date Pending)' : 'Grades Locked (Due Date Pending)'}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePublishGrades}
                disabled={isPublishingGrades}
                className="canvas-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  backgroundColor: '#15803D',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: isPublishingGrades ? 'wait' : 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                }}
                title="Publish and make points visible to cohort students"
              >
                {isPublishingGrades ? <Spinner size={14} /> : <Award size={15} />}
                <span>Publish Grades to Students</span>
              </button>
            )}
          </div>
        </div>

        {/* Body Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', flex: 1, minHeight: '75vh' }}>
          {/* Left Student List */}
          <div
            style={{
              borderRight: '1px solid var(--border-subtle)',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-surface-elevated)',
              maxHeight: 'calc(100vh - 200px)',
            }}
          >
            {isLoading ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <Spinner size={24} message="Loading submissions..." />
              </div>
            ) : submissions.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                No submissions recorded yet for this activity.
              </div>
            ) : (
              submissions.map((sub) => {
                const isSelected = selectedSub?.id === sub.id;
                const isGraded = sub.status === 'GRADED';
                const subAttachment = sub.attachment || sub.attachment_file || (sub as any).attachment_url;
                const hasImg = Boolean(
                  (subAttachment && /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(subAttachment)) ||
                  sub.submission_method === 'image_upload'
                );
                const hasPdf = Boolean(
                  (subAttachment && (/\.pdf(\?.*)?$/i.test(subAttachment) || subAttachment.toLowerCase().includes('.pdf'))) ||
                  sub.submission_method === 'pdf_upload' ||
                  (sub as any).submission_type === 'FILE_UPLOAD' ||
                  (sub as any).submission_type === 'PDF' ||
                  (activity.submission_type === 'FILE_UPLOAD' && subAttachment && !hasImg) ||
                  (Array.isArray(activity.allowed_submission_methods) && activity.allowed_submission_methods.includes('pdf_upload') && subAttachment && !hasImg)
                );
                const hasLink = Boolean(sub.submission_link);
                const hasText = Boolean(sub.submission_text || sub.text_content);

                return (
                  <div
                    key={sub.id}
                    onClick={() => handleSelectSubmission(sub)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--primary-400)' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                        {sub.student_name || 'Student'}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: isGraded ? '#DCFCE7' : '#FEF3C7',
                          color: isGraded ? '#15803D' : '#B45309',
                          border: isGraded ? '1px solid #BBF7D0' : '1px solid #FDE68A',
                        }}
                      >
                        {isGraded ? `${sub.score}/${activity.max_score}` : 'Pending'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {hasPdf && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', backgroundColor: '#FEE2E2', color: '#DC2626', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <FileText size={10} /> PDF
                        </span>
                      )}
                      {hasImg && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', backgroundColor: '#DBEAFE', color: '#1D4ED8', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <ImageIcon size={10} /> Photo
                        </span>
                      )}
                      {subAttachment && !hasPdf && !hasImg && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', backgroundColor: '#E0E7FF', color: '#4338CA', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <File size={10} /> File
                        </span>
                      )}
                      {hasLink && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', backgroundColor: '#FEF3C7', color: '#B45309', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <ExternalLink size={10} /> Link
                        </span>
                      )}
                      {hasText && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '1px 5px', borderRadius: '3px', backgroundColor: '#F1F5F9', color: '#475569' }}>
                          Written
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={12} />
                      {new Date(sub.submitted_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Detail & Grading Pane */}
          <div style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: 'var(--bg-surface)', maxHeight: 'calc(100vh - 200px)' }}>
            {!selectedSub ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                Select a student submission from the left list to review and grade.
              </div>
            ) : (
              <>
                {/* Student Info Card */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(56, 189, 248, 0.12)',
                        color: 'var(--primary-400)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <User size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {selectedSub.student_name || 'Enrolled Student'}
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {selectedSub.student_phone || 'Learner in cohort'}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={selectedSub.status === 'GRADED' ? 'success' : 'neutral'}
                    style={
                      selectedSub.status === 'GRADED'
                        ? undefined
                        : {
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)',
                            fontWeight: 700,
                          }
                    }
                  >
                    {selectedSub.status}
                  </Badge>
                </div>

                {/* Submitted Content Display */}
                <div>
                  <h5 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Submitted Materials
                  </h5>

                  {(() => {
                    const attachmentUrl = selectedSub.attachment_file || selectedSub.attachment || (selectedSub as any).attachment_url;
                    const subText = selectedSub.submission_text || selectedSub.text_content;
                    const subLink = selectedSub.submission_link;

                    const isImage = Boolean(
                      (attachmentUrl && /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(attachmentUrl)) ||
                      selectedSub.submission_method === 'image_upload'
                    );

                    const isPdf = Boolean(
                      (attachmentUrl && (/\.pdf(\?.*)?$/i.test(attachmentUrl) || attachmentUrl.toLowerCase().includes('.pdf'))) ||
                      selectedSub.submission_method === 'pdf_upload' ||
                      (selectedSub as any).submission_type === 'FILE_UPLOAD' ||
                      (selectedSub as any).submission_type === 'PDF' ||
                      (activity.submission_type === 'FILE_UPLOAD' && attachmentUrl && !isImage) ||
                      (Array.isArray(activity.allowed_submission_methods) && activity.allowed_submission_methods.includes('pdf_upload') && attachmentUrl && !isImage)
                    );

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {/* Written response if provided */}
                        {subText && (
                          <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                              Written Response / Notes:
                            </div>
                            <div
                              style={{
                                padding: '14px 16px',
                                borderRadius: '6px',
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                fontSize: '0.88rem',
                                lineHeight: 1.6,
                                color: '#1E293B',
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {subText}
                            </div>
                          </div>
                        )}

                        {/* Submission Link if provided */}
                        {subLink && (
                          <div
                            style={{
                              padding: '12px 16px',
                              borderRadius: '6px',
                              backgroundColor: '#F0F9FF',
                              border: '1px solid #BAE6FD',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '10px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <ExternalLink size={16} color="#0284C7" />
                              <span style={{ fontSize: '0.84rem', color: '#0369A1', fontWeight: 600 }}>
                                Shared URL / Google Drive Link
                              </span>
                            </div>
                            <a
                              href={subLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="canvas-btn"
                              style={{
                                padding: '6px 14px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: '#FFFFFF',
                                backgroundColor: '#0055A5',
                                borderRadius: '4px',
                                textDecoration: 'none',
                              }}
                            >
                              <ExternalLink size={13} />
                              <span>Open Student Link</span>
                            </a>
                          </div>
                        )}

                        {/* Attachment Document (PDF, Image, or other file) */}
                        {attachmentUrl ? (
                          isPdf ? (
                            <PdfViewer
                              url={attachmentUrl}
                              title={`${selectedSub.student_name || 'Student'}'s PDF Submission`}
                              minHeight="680px"
                            />
                          ) : isImage ? (
                            /* Image Review Block with Preview */
                            <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '10px 16px',
                                  backgroundColor: '#EFF6FF',
                                  borderBottom: '1px solid #BFDBFE',
                                  flexWrap: 'wrap',
                                  gap: '10px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <ImageIcon size={18} color="#2563EB" />
                                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1E40AF' }}>
                                    Submitted Photo / Diagram Evidence
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <a
                                    href={attachmentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="canvas-btn"
                                    style={{
                                      padding: '5px 12px',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      color: '#0055A5',
                                      backgroundColor: '#FFFFFF',
                                      border: '1px solid #BFDBFE',
                                      borderRadius: '4px',
                                      textDecoration: 'none',
                                    }}
                                  >
                                    <ExternalLink size={13} />
                                    <span>Full Size</span>
                                  </a>
                                  <a
                                    href={attachmentUrl}
                                    download
                                    className="canvas-btn"
                                    style={{
                                      padding: '5px 12px',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      color: '#FFFFFF',
                                      backgroundColor: '#2563EB',
                                      borderRadius: '4px',
                                      textDecoration: 'none',
                                    }}
                                  >
                                    <Download size={13} />
                                    <span>Download</span>
                                  </a>
                                </div>
                              </div>
                              <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
                                <img
                                  src={attachmentUrl}
                                  alt="Student Submission"
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '400px',
                                    objectFit: 'contain',
                                    borderRadius: '4px',
                                    border: '1px solid #E2E8F0',
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            /* Other File Types (Word, Excel, Zip, etc.) */
                            <div
                              style={{
                                padding: '16px 20px',
                                borderRadius: '8px',
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #CBD5E1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '12px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div
                                  style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '8px',
                                    backgroundColor: '#EFF6FF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#0055A5',
                                  }}
                                >
                                  <FileText size={22} />
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1E293B' }}>
                                    Attached File Submission
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                                    Learner uploaded document evidence for tutor evaluation.
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <a
                                  href={attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="canvas-btn"
                                  style={{
                                    padding: '6px 14px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#0055A5',
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #BFDBFE',
                                    borderRadius: '4px',
                                    textDecoration: 'none',
                                  }}
                                >
                                  <ExternalLink size={13} />
                                  <span>Open in Browser</span>
                                </a>
                                <a
                                  href={attachmentUrl}
                                  download
                                  className="canvas-btn"
                                  style={{
                                    padding: '6px 14px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#FFFFFF',
                                    backgroundColor: '#0055A5',
                                    borderRadius: '4px',
                                    textDecoration: 'none',
                                  }}
                                >
                                  <Download size={13} />
                                  <span>Download File</span>
                                </a>
                              </div>
                            </div>
                          )
                        ) : !subText && !subLink ? (
                          <div
                            style={{
                              padding: '16px',
                              borderRadius: '6px',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              color: '#64748B',
                              fontSize: '0.84rem',
                            }}
                          >
                            No written response or file uploaded online. Practical observation recorded directly in vehicle.
                          </div>
                        ) : null}
                      </div>
                    );
                  })()}
                </div>

                {/* Grading Form */}
                <form
                  onSubmit={handleSaveGrade}
                  style={{
                    padding: '20px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    marginTop: 'auto',
                  }}
                >
                  <h5 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Instructor Evaluation & Grade
                  </h5>

                  <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Awarded Score (Max {activity.max_score})
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min={0}
                        max={activity.max_score}
                        value={scoreInput}
                        onChange={(e) => setScoreInput(e.target.value)}
                        required
                        placeholder={`0 - ${activity.max_score}`}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-medium)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Instructor Feedback & Corrections
                      </label>
                      <textarea
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        placeholder="Provide actionable driving tips, commendations, or areas to improve..."
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-medium)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          resize: 'vertical',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <button
                      type="submit"
                      disabled={isGrading}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#0055A5',
                        color: '#FFFFFF',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {isGrading ? <Spinner size={16} /> : <Check size={16} />}
                      <span>Save & Award Grade</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
  );
};

export const ReviewSubmissionsPage = ReviewSubmissionsModal;

import React, { useState } from 'react';
import {
  X,
  Upload,
  Check,
  FileText,
  ExternalLink,
  Presentation,
  Image as ImageIcon,
  File as FileIcon,
  Link as LinkIcon,
  Clock,
} from 'lucide-react';
import { TutorLmsService, type CohortActivityItem } from '../../../../core/services/TutorLmsService';
import { Spinner } from '../../../../components/common/Spinner';
import { useToast } from '../../../../context/ToastContext';
import { PdfViewer } from '../common/PdfViewer';

interface StudentSubmitActivityModalProps {
  isOpen: boolean;
  activity: CohortActivityItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const StudentSubmitActivityModal: React.FC<StudentSubmitActivityModalProps> = ({
  isOpen,
  activity,
  onClose,
  onSuccess,
}) => {
  const [activeMethod, setActiveMethod] = useState<'online_text' | 'pdf_upload' | 'image_upload' | 'link'>('online_text');
  const [textContent, setTextContent] = useState<string>('');
  const [submissionLink, setSubmissionLink] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { success, error: toastError } = useToast();

  // Reset or configure active method when activity changes
  React.useEffect(() => {
    if (activity) {
      const allowed = Array.isArray(activity.allowed_submission_methods) && activity.allowed_submission_methods.length > 0
        ? activity.allowed_submission_methods
        : ['online_text', 'pdf_upload', 'image_upload', 'link'];

      if (allowed.includes('online_text')) {
        setActiveMethod('online_text');
      } else if (allowed.includes('pdf_upload')) {
        setActiveMethod('pdf_upload');
      } else if (allowed.includes('link')) {
        setActiveMethod('link');
      } else if (allowed.includes('image_upload')) {
        setActiveMethod('image_upload');
      }

      setTextContent('');
      setSubmissionLink('');
      setSelectedFile(null);
    }
  }, [activity]);

  if (!isOpen || !activity) return null;

  const allowedMethods = Array.isArray(activity.allowed_submission_methods) && activity.allowed_submission_methods.length > 0
    ? activity.allowed_submission_methods
    : ['online_text', 'pdf_upload', 'image_upload', 'link'];

  // Google slides embed helper
  const getGoogleSlidesEmbedUrl = (url?: string) => {
    if (!url) return null;
    try {
      if (url.includes('/pub?')) return url;
      if (url.includes('/embed')) return url;
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://docs.google.com/presentation/d/${match[1]}/embed?start=false&loop=false&delayms=3000`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const resourceUrl = activity.attachment_url || activity.attachment;
  const isGoogleSlides = activity.resource_type === 'GOOGLE_SLIDES' || (resourceUrl && resourceUrl.includes('docs.google.com/presentation'));
  const isPdf = activity.resource_type === 'PDF' || Boolean(resourceUrl && (/\.pdf(\?.*)?$/i.test(resourceUrl) || resourceUrl.toLowerCase().includes('.pdf')));
  const isImage = activity.resource_type === 'IMAGE' || (resourceUrl && /\.(png|jpe?g|webp|gif|svg)$/i.test(resourceUrl));
  const isBeforeOpenDate = Boolean(activity.open_date && new Date(activity.open_date) > new Date());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBeforeOpenDate) {
      toastError(
        `This activity is scheduled to open on ${new Date(activity.open_date!).toLocaleString()}. Submissions cannot be made before the open date.`
      );
      return;
    }

    if (activeMethod === 'online_text' && !textContent.trim()) {
      toastError('Please enter your written response.');
      return;
    }
    if ((activeMethod === 'pdf_upload' || activeMethod === 'image_upload') && !selectedFile) {
      toastError(`Please select a ${activeMethod === 'pdf_upload' ? 'PDF' : 'image'} file to upload.`);
      return;
    }
    if (activeMethod === 'link' && !submissionLink.trim()) {
      toastError('Please provide your submission URL or Google Drive link.');
      return;
    }

    const formData = new FormData();
    formData.append('submission_method', activeMethod);
    formData.append('submission_type', activity.submission_type || 'BOTH');

    if (textContent.trim()) {
      formData.append('submission_text', textContent.trim());
      formData.append('text_content', textContent.trim());
    }
    if (submissionLink.trim()) {
      formData.append('submission_link', submissionLink.trim());
    }
    if (selectedFile) {
      formData.append('attachment', selectedFile);
      formData.append('attachment_file', selectedFile);
    }

    setIsSubmitting(true);
    try {
      await TutorLmsService.getInstance().submitStudentActivity(activity.cohort, activity.id, formData);
      success('Activity submitted successfully to your instructor!');
      setTextContent('');
      setSubmissionLink('');
      setSelectedFile(null);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Failed to submit activity.';
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
          maxWidth: '700px',
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
            padding: '20px 24px',
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
                backgroundColor: '#EFF6FF',
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
                {activity.title}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                {activity.max_score || activity.total_points || 100} pts • Due:{' '}
                {activity.due_date ? new Date(activity.due_date).toLocaleDateString() : 'No deadline'}
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
          {/* Scheduled open date notice if not yet open */}
          {isBeforeOpenDate && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#FEF3C7',
                border: '1px solid #FDE68A',
                borderRadius: '8px',
                color: '#92400E',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Clock size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Activity Scheduled:</strong> This activity opens on{' '}
                <strong>{new Date(activity.open_date!).toLocaleString()}</strong>. You can review instructions, materials, and rubrics, but submissions cannot be submitted until its open date.
              </div>
            </div>
          )}

          {/* Instructions Box */}
          {(activity.instructions || activity.description) && (
            <div
              style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                fontSize: '0.86rem',
                color: '#1E293B',
                lineHeight: 1.6,
              }}
            >
              <div style={{ fontWeight: 800, color: '#0055A5', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={15} />
                <span>Instructor Guidelines & Instructions:</span>
              </div>
              {activity.description && (
                <p style={{ margin: '0 0 8px', color: '#475569', fontStyle: 'italic' }}>
                  {activity.description}
                </p>
              )}
              {activity.instructions && <div style={{ color: '#1E293B' }}>{activity.instructions}</div>}
            </div>
          )}

          {/* Media / Materials Viewer (Google Slides, PDF, Image) */}
          {isGoogleSlides && resourceUrl && (
            <div
              style={{
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#FEF3C7',
                  borderBottom: '1px solid #FDE68A',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#B45309' }}>
                  <Presentation size={16} />
                  <span>Interactive Google Slides Presentation</span>
                </div>
                <a
                  href={resourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: '#0055A5',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  <span>Open Full Screen</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <iframe
                src={getGoogleSlidesEmbedUrl(resourceUrl) || resourceUrl}
                title="Google Slides Presentation"
                width="100%"
                height="320"
                style={{ border: 'none', display: 'block' }}
                allowFullScreen
              />
            </div>
          )}

          {isImage && resourceUrl && (
            <div
              style={{
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                padding: '12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '8px', textAlign: 'left' }}>
                Activity Diagram / Reference Image:
              </div>
              <img
                src={resourceUrl}
                alt={activity.title}
                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '6px', objectFit: 'contain' }}
              />
            </div>
          )}

          {isPdf && resourceUrl && (
            <div style={{ marginTop: '4px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Activity Reference Document (PDF):
              </div>
              <PdfViewer url={resourceUrl} title="Activity Reference PDF" minHeight="360px" />
            </div>
          )}

          {/* Submission Method Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
              Select Your Submission Method
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {allowedMethods.includes('online_text') && (
                <button
                  type="button"
                  onClick={() => setActiveMethod('online_text')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: activeMethod === 'online_text' ? 700 : 500,
                    border: activeMethod === 'online_text' ? '1px solid #0055A5' : '1px solid #CBD5E1',
                    backgroundColor: activeMethod === 'online_text' ? '#EFF6FF' : '#FFFFFF',
                    color: activeMethod === 'online_text' ? '#0055A5' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  <FileText size={14} />
                  <span>Online Text</span>
                </button>
              )}

              {allowedMethods.includes('pdf_upload') && (
                <button
                  type="button"
                  onClick={() => setActiveMethod('pdf_upload')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: activeMethod === 'pdf_upload' ? 700 : 500,
                    border: activeMethod === 'pdf_upload' ? '1px solid #0055A5' : '1px solid #CBD5E1',
                    backgroundColor: activeMethod === 'pdf_upload' ? '#EFF6FF' : '#FFFFFF',
                    color: activeMethod === 'pdf_upload' ? '#0055A5' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  <FileIcon size={14} />
                  <span>PDF Upload</span>
                </button>
              )}

              {allowedMethods.includes('image_upload') && (
                <button
                  type="button"
                  onClick={() => setActiveMethod('image_upload')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: activeMethod === 'image_upload' ? 700 : 500,
                    border: activeMethod === 'image_upload' ? '1px solid #0055A5' : '1px solid #CBD5E1',
                    backgroundColor: activeMethod === 'image_upload' ? '#EFF6FF' : '#FFFFFF',
                    color: activeMethod === 'image_upload' ? '#0055A5' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  <ImageIcon size={14} />
                  <span>Image Upload</span>
                </button>
              )}

              {allowedMethods.includes('link') && (
                <button
                  type="button"
                  onClick={() => setActiveMethod('link')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: activeMethod === 'link' ? 700 : 500,
                    border: activeMethod === 'link' ? '1px solid #0055A5' : '1px solid #CBD5E1',
                    backgroundColor: activeMethod === 'link' ? '#EFF6FF' : '#FFFFFF',
                    color: activeMethod === 'link' ? '#0055A5' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  <LinkIcon size={14} />
                  <span>Link / Google Drive</span>
                </button>
              )}
            </div>
          </div>

          {/* Dynamic input according to activeMethod */}
          {activeMethod === 'online_text' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Your Answer / Notes
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Type your response, reflection, or procedure explanations here..."
                rows={5}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
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
          )}

          {activeMethod === 'link' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Submission Link or Google Drive File URL
              </label>
              <div style={{ position: 'relative' }}>
                <LinkIcon
                  size={16}
                  color="#0055A5"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="url"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  placeholder="https://drive.google.com/file/d/... or web link"
                  required
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
              <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '6px' }}>
                Tip: For Google Drive links, make sure sharing is set to "Anyone with the link can view".
              </div>
            </div>
          )}

          {(activeMethod === 'pdf_upload' || activeMethod === 'image_upload') && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                {activeMethod === 'pdf_upload' ? 'Upload PDF Document' : 'Upload Image / Photo Evidence'}
              </label>
              <div
                style={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: '8px',
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: '#F8FAFC',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
                onClick={() => document.getElementById('student-activity-file-input')?.click()}
              >
                <Upload size={28} color="#0055A5" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '0.86rem', color: '#1E293B', fontWeight: 600 }}>
                  {selectedFile
                    ? selectedFile.name
                    : activeMethod === 'pdf_upload'
                    ? 'Click to select PDF document (.pdf)'
                    : 'Click to select image file (PNG, JPG, WEBP)'}
                </div>
                {selectedFile && (
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                )}
                <input
                  id="student-activity-file-input"
                  type="file"
                  accept={activeMethod === 'pdf_upload' ? '.pdf,application/pdf' : 'image/*'}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          )}

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
              disabled={isSubmitting || isBeforeOpenDate}
              style={{
                padding: '9px 20px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: isBeforeOpenDate ? '#94A3B8' : '#0055A5',
                color: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: isBeforeOpenDate ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {isSubmitting ? <Spinner size={16} /> : <Check size={16} />}
              <span>{isBeforeOpenDate ? `Opens on ${new Date(activity.open_date!).toLocaleDateString()}` : 'Submit Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

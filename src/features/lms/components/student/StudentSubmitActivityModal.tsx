import React, { useState } from 'react';
import { X, Upload, Check, FileText } from 'lucide-react';
import { TutorLmsService, type CohortActivityItem } from '../../../../core/services/TutorLmsService';
import { Spinner } from '../../../../components/common/Spinner';
import { useToast } from '../../../../context/ToastContext';

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
  const [textContent, setTextContent] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { success, error: toastError } = useToast();

  if (!isOpen || !activity) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiresText = activity.submission_type === 'ONLINE_TEXT' || activity.submission_type === 'BOTH';
    const requiresFile = activity.submission_type === 'FILE_UPLOAD';

    if (requiresText && !textContent.trim() && !selectedFile) {
      toastError('Please enter a response or upload a file.');
      return;
    }
    if (requiresFile && !selectedFile) {
      toastError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    if (textContent.trim()) {
      formData.append('text_content', textContent.trim());
    }
    if (selectedFile) {
      formData.append('attachment_file', selectedFile);
    }
    formData.append('submission_type', activity.submission_type);

    setIsSubmitting(true);
    try {
      await TutorLmsService.getInstance().submitStudentActivity(activity.cohort, activity.id, formData);
      success('Activity submitted successfully to your instructor!');
      setTextContent('');
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

  const isTextAllowed = activity.submission_type === 'ONLINE_TEXT' || activity.submission_type === 'BOTH';
  const isFileAllowed = activity.submission_type === 'FILE_UPLOAD' || activity.submission_type === 'BOTH';

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
          maxWidth: '580px',
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
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
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                Submit Activity
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {activity.title} ({activity.max_score} pts)
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
          {activity.instructions && (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 85, 165, 0.08)',
                border: '1px solid rgba(0, 85, 165, 0.2)',
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>Instructor Instructions:</div>
              {activity.instructions}
            </div>
          )}

          {isTextAllowed && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Your Answer / Notes
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Type your response, reflection, or procedure explanations here..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  resize: 'vertical',
                }}
              />
            </div>
          )}

          {isFileAllowed && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Upload Evidence / Document / Photo
              </label>
              <div
                style={{
                  border: '2px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  textAlign: 'center',
                  background: 'var(--bg-surface-elevated)',
                  cursor: 'pointer',
                }}
                onClick={() => document.getElementById('student-activity-file-input')?.click()}
              >
                <Upload size={24} color="#0055A5" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '0.84rem', color: '#ffffff', fontWeight: 600 }}>
                  {selectedFile ? selectedFile.name : 'Click to select file (PDF, PNG, JPG, DOC)'}
                </div>
                {selectedFile && (
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                )}
                <input
                  id="student-activity-file-input"
                  type="file"
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
              <span>Submit Assignment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

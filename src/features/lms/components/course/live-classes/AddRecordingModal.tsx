import React, { useState, useEffect } from 'react';
import { X, Video, Loader2, Link2, Calendar } from 'lucide-react';

export interface AddRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    date: string;
    googleLink: string;
  }) => Promise<void>;
  saving: boolean;
}

export const AddRecordingModal: React.FC<AddRecordingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  saving,
}) => {
  const [date, setDate] = useState('');
  const [googleLink, setGoogleLink] = useState('');
  const [validationError, setValidationError] = useState('');

  // Reset or initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setGoogleLink('');
      setValidationError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const cleanLink = googleLink.trim();
    if (!cleanLink) {
      setValidationError('Please provide a Google recording link.');
      return;
    }
    if (!/^https?:\/\//i.test(cleanLink)) {
      setValidationError('Enter a valid link starting with http:// or https://');
      return;
    }
    if (!date) {
      setValidationError('Date is required.');
      return;
    }

    await onSave({
      date,
      googleLink: cleanLink,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={() => !saving && onClose()}
    >
      <div
        className="canvas-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '24px',
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#EFF6FF',
                color: '#0055A5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Video size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>
                Add Recording
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                Publish a Google Meet or Drive recording link for your students.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              color: '#94A3B8',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {validationError && (
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '6px',
              color: '#991B1B',
              fontSize: '0.8rem',
              marginBottom: '14px',
            }}
          >
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Date */}
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '4px',
              }}
            >
              <Calendar size={13} color="#64748B" />
              Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #CBD5E1',
                borderRadius: '4px',
                fontSize: '0.84rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Google Link */}
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '4px',
              }}
            >
              <Link2 size={13} color="#0055A5" />
              Recording Link *
            </label>
            <input
              type="url"
              required
              placeholder="https://drive.google.com/file/d/... or https://meet.google.com/..."
              value={googleLink}
              onChange={(e) => setGoogleLink(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #CBD5E1',
                borderRadius: '4px',
                fontSize: '0.84rem',
                outline: 'none',
              }}
            />
            <span style={{ fontSize: '0.73rem', color: '#64748B', display: 'block', marginTop: '3px' }}>
              Paste your Google Drive, YouTube, or Google Meet cloud recording URL.
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="canvas-btn"
              style={{
                padding: '7px 16px',
                fontSize: '0.82rem',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                border: '1px solid #D0D5DD',
                borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="canvas-btn canvas-btn-primary"
              style={{
                padding: '7px 20px',
                fontSize: '0.82rem',
                fontWeight: 700,
                backgroundColor: '#0055A5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Video size={14} />}
              <span>{saving ? 'Publishing...' : 'Publish Recording'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

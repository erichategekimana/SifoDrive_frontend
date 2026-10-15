import React from 'react';
import { LifeBuoy, X, Send } from 'lucide-react';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newRecipient: 'TUTOR' | 'TECH_SUPPORT' | 'TRAINING_ADMIN';
  setNewRecipient: (val: 'TUTOR' | 'TECH_SUPPORT' | 'TRAINING_ADMIN') => void;
  newCategory: 'CONTENT_INQUIRY' | 'TECHNICAL_ISSUE' | 'EXAM_DISPUTE' | 'ACCOUNT_BILLING' | 'ADMINISTRATIVE' | 'OTHER';
  setNewCategory: (val: 'CONTENT_INQUIRY' | 'TECHNICAL_ISSUE' | 'EXAM_DISPUTE' | 'ACCOUNT_BILLING' | 'ADMINISTRATIVE' | 'OTHER') => void;
  newPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  setNewPriority: (val: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') => void;
  newSubject: string;
  setNewSubject: (val: string) => void;
  newMessage: string;
  setNewMessage: (val: string) => void;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newRecipient,
  setNewRecipient,
  newCategory,
  setNewCategory,
  newPriority,
  setNewPriority,
  newSubject,
  setNewSubject,
  newMessage,
  setNewMessage,
  isSubmitting,
  error,
  success,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '24px',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LifeBuoy size={18} color="#0284c7" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Submit Ticket / Inquiry
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {success && (
          <div style={{ padding: '10px 14px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '4px', fontSize: '0.84rem', marginBottom: '14px' }}>
            ✓ Ticket submitted successfully and collected in the desk!
          </div>
        )}

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '4px', fontSize: '0.84rem', marginBottom: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Direct Inquiry To:
              </label>
              <select
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value as any)}
                className="canvas-input"
                style={{ width: '100%', fontSize: '0.84rem' }}
              >
                <option value="TRAINING_ADMIN">Training Admin / Operations</option>
                <option value="TUTOR">Tutor / Instructor Team</option>
                <option value="TECH_SUPPORT">Technical Platform Team</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Category:
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="canvas-input"
                style={{ width: '100%', fontSize: '0.84rem' }}
              >
                <option value="ADMINISTRATIVE">Administrative & Operations</option>
                <option value="CONTENT_INQUIRY">Course & Lesson Inquiry</option>
                <option value="TECHNICAL_ISSUE">Technical Issue</option>
                <option value="EXAM_DISPUTE">Examination Dispute</option>
                <option value="ACCOUNT_BILLING">Account & Billing</option>
                <option value="OTHER">Other Inquiry</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Priority Level:
            </label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="canvas-input"
              style={{ width: '100%', fontSize: '0.84rem' }}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent (Immediate Attention)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Subject / Summary:
            </label>
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="e.g., Question about schedule adjustment for Cohort B..."
              className="canvas-input"
              style={{ width: '100%', fontSize: '0.84rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Inquiry Details:
            </label>
            <textarea
              rows={4}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Provide all context and details..."
              className="canvas-input"
              style={{ width: '100%', fontSize: '0.84rem', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={13} />
              <span>{isSubmitting ? 'Submitting...' : 'Send Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

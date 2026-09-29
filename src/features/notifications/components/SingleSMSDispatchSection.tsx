import React from 'react';
import { Send, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import { PRESET_SNIPPETS } from '../types';

interface SingleSMSDispatchSectionProps {
  singlePhone: string;
  setSinglePhone: (val: string) => void;
  singleMessage: string;
  setSingleMessage: (val: string) => void;
  singleType: string;
  setSingleType: (val: string) => void;
  isSendingSingle: boolean;
  senderId?: string;
  lastSingleResult: any | null;
  charCount: number;
  segments: number;
  onSubmit: (e: React.FormEvent) => void;
}

export const SingleSMSDispatchSection: React.FC<SingleSMSDispatchSectionProps> = ({
  singlePhone,
  setSinglePhone,
  singleMessage,
  setSingleMessage,
  singleType,
  setSingleType,
  isSendingSingle,
  senderId = 'PindoTest',
  lastSingleResult,
  charCount,
  segments,
  onSubmit,
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 580px) 1fr', gap: '24px', alignItems: 'start' }}>
      {/* Dispatch Form */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-2xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={16} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Dispatch Single SMS
          </h3>
        </div>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Directly dispatches a single SMS through the Pindo gateway endpoint:
          <br />
          <code style={{ fontSize: '0.78rem', color: 'var(--primary-light)' }}>https://api.pindo.io/v1/sms/</code>
        </p>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Recipient Phone Number (Rwanda) *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                required
                placeholder="+250 788 123 456"
                value={singlePhone}
                onChange={(e) => setSinglePhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                  fontSize: '0.92rem',
                }}
              />
              <Phone
                size={15}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Supports MTN Rwanda, Airtel Rwanda (+250 78/79/72/73...)
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Message Type Classification
            </label>
            <select
              value={singleType}
              onChange={(e) => setSingleType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
              }}
            >
              <option value="GENERAL">General Operational Notice</option>
              <option value="OTP">OTP Verification Code</option>
              <option value="LIVE_CLASS_REMINDER">Live Class Reminder</option>
              <option value="BOOKING_REMINDER">Exam Booking Reminder</option>
              <option value="BOOKING_CONFIRMED">Exam Slot Confirmed</option>
              <option value="EXAM_RESULT">Practice Exam Result</option>
              <option value="PAYMENT_SUCCESS">Payment Confirmation</option>
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Message Body *
              </label>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  color: charCount > 160 ? 'var(--warning)' : 'var(--text-muted)',
                }}
              >
                {charCount} / 160 chars ({segments} SMS segment{segments > 1 ? 's' : ''})
              </span>
            </div>
            <textarea
              rows={4}
              required
              placeholder="Type Rwanda SMS message body here..."
              value={singleMessage}
              onChange={(e) => setSingleMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Sender: <strong style={{ color: 'var(--text-secondary)' }}>{senderId}</strong>
            </span>
            <button
              type="submit"
              disabled={isSendingSingle || !singlePhone.trim() || !singleMessage.trim()}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px', justifyContent: 'center' }}
            >
              <Send size={15} />
              <span>{isSendingSingle ? 'Dispatching...' : 'Dispatch Single SMS'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Quick Preset Snippets & Live Result Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Live Result receipt */}
        {lastSingleResult && (
          <div
            className="glass-panel"
            style={{
              padding: '20px',
              borderRadius: 'var(--radius-xl)',
              border: lastSingleResult.success
                ? '1px solid rgba(16, 185, 129, 0.4)'
                : '1px solid rgba(239, 68, 68, 0.4)',
              background: lastSingleResult.success
                ? 'rgba(16, 185, 129, 0.05)'
                : 'rgba(239, 68, 68, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {lastSingleResult.success ? (
                <CheckCircle2 size={18} color="var(--success)" />
              ) : (
                <AlertCircle size={18} color="var(--danger)" />
              )}
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                {lastSingleResult.success ? 'SMS Dispatched Successfully' : 'SMS Transmission Rejected'}
              </strong>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {lastSingleResult.message_id && (
                <div>
                  Pindo Message ID: <code style={{ color: 'var(--primary-light)' }}>{lastSingleResult.message_id}</code>
                </div>
              )}
              {lastSingleResult.status && (
                <div>
                  Gateway Status: <Badge variant={lastSingleResult.success ? 'success' : 'danger'}>{lastSingleResult.status}</Badge>
                </div>
              )}
              {lastSingleResult.error_message && (
                <div style={{ color: 'var(--danger)', marginTop: '4px' }}>
                  Error: {lastSingleResult.error_message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Templates Picker */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Quick Preset Templates
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
            Click any snippet to automatically populate the message box with Rwanda standard text:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {PRESET_SNIPPETS.map((snippet, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSingleMessage(snippet.text);
                  setSingleType(snippet.type);
                }}
                style={{
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {snippet.label}
                  </span>
                  <Badge variant="neutral" style={{ fontSize: '0.68rem' }}>{snippet.type}</Badge>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {snippet.text}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

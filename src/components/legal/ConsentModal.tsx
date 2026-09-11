import React, { useState } from 'react';
import { ShieldCheck, FileText, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/I18nContext';
import { Button } from '../common/Button';

export const ConsentModal: React.FC = () => {
  const { user, acceptConsent, needsLegalConsent } = useAuth();
  const { success, error } = useToast();
  const { t } = useTranslation();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!needsLegalConsent || !user) return null;

  const requiresTerms = !user.termsAccepted;
  const requiresPrivacy = user.isStudent() && !user.privacyAccepted;

  const handleConfirm = async () => {
    if (requiresTerms && !agreeTerms) {
      error(t('auth.termsRequired'));
      return;
    }
    if (requiresPrivacy && !agreePrivacy) {
      error(t('auth.privacyRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (requiresTerms) {
        await acceptConsent('terms');
      }
      if (requiresPrivacy) {
        await acceptConsent('privacy');
      }
      success(t('common.completed'));
    } catch (e: any) {
      error(e.message || t('common.errorOccurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '560px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--primary-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={26} color="var(--primary)" />
          </div>
          <div>
            <h3>{t('legal.modalTitle')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {t('legal.lawNotice')}
            </p>
          </div>
        </div>

        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
          {t('legal.modalDesc')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          {requiresTerms && (
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px',
                background: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                border: agreeTerms ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
              }}
            >
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ marginTop: '3px', accentColor: 'var(--primary)', width: '16px', height: '16px' }}
              />
              <div style={{ fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} /> {t('legal.termsTitle')}
                </span>
                <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                  {t('legal.termsSub')}
                </p>
              </div>
            </label>
          )}

          {requiresPrivacy && (
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px',
                background: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                border: agreePrivacy ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
              }}
            >
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                style={{ marginTop: '3px', accentColor: 'var(--primary)', width: '16px', height: '16px' }}
              />
              <div style={{ fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} /> {t('legal.privacyTitle')}
                </span>
                <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                  {t('legal.privacySub')}
                </p>
              </div>
            </label>
          )}
        </div>

        <Button
          variant="primary"
          onClick={handleConfirm}
          isLoading={isSubmitting}
          icon={<Check size={18} />}
          style={{ width: '100%' }}
        >
          {t('legal.confirmBtn')}
        </Button>
      </div>
    </div>
  );
};

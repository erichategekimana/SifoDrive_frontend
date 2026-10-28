import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Shield, FileText, Cookie, X } from 'lucide-react';
import { useTranslation } from '../../context/I18nContext';
import { usePublicFooter } from '../../hooks/usePublicFooter';

export const Footer: React.FC = () => {
  const { t, language } = useTranslation();
  const isRw = language === 'rw';
  const { contact, legal } = usePublicFooter();
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };
    if (activeModal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activeModal]);

  return (
    <footer
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '48px 24px 24px 24px',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '40px',
          marginBottom: '40px',
        }}
      >
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '4px 10px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '38px',
              }}
            >
              <img
                src="/sifo-group-logo.png"
                alt="Sifo Group Ltd"
                style={{
                  height: '30px',
                  width: 'auto',
                  maxWidth: '130px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {contact.description || t('footer.desc')}
          </p>
        </div>


        {/* Legal & Regulatory */}
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
            {t('footer.legalRegulatory')}
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <li>
              <button
                type="button"
                onClick={() => setActiveModal('privacy')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  transition: 'color 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <Shield size={14} color="var(--primary)" />
                <span>{legal.privacyPolicy}</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveModal('terms')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  transition: 'color 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <FileText size={14} color="var(--primary)" />
                <span>{legal.termsAndConditions}</span>
              </button>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Cookie size={14} color="var(--primary)" />
              <span>{legal.cookies}</span>
            </li>
          </ul>
        </div>

        {/* Contact & Support */}
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
            {t('footer.contactSupport')}
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="var(--primary)" />
              <span>{contact.address}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="var(--primary)" />
              <span>{contact.phone}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="var(--primary)" />
              <span>{contact.email}</span>
            </li>
          </ul>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}
      >
        <div>© {new Date().getFullYear()} Sifo Drive Ltd. {t('footer.copyright')}</div>
      </div>

      {/* ── LEGAL DOCUMENT MODAL ── */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '720px',
              width: '100%',
              maxHeight: '85vh',
              background: 'var(--bg-surface, #0f172a)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.15))',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(56, 189, 248, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                  }}
                >
                  {activeModal === 'privacy' ? (
                    <Shield size={20} color="#38bdf8" />
                  ) : (
                    <FileText size={20} color="#38bdf8" />
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary, #ffffff)' }}>
                    {activeModal === 'privacy' ? legal.privacyPolicy : legal.termsAndConditions}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    {isRw
                      ? 'Inyandiko yemewe y’amategeko agenga Sifo Drive'
                      : 'Official legal documentation of Sifo Drive'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Close dialog"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Document Body */}
            <div
              style={{
                padding: '24px',
                overflowY: 'auto',
                flex: 1,
                fontSize: '0.9rem',
                lineHeight: 1.75,
                color: 'var(--text-secondary, #cbd5e1)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
              }}
            >
              {activeModal === 'privacy'
                ? legal.privacyPolicyContent
                : legal.termsAndConditionsContent}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'flex-end',
                background: 'rgba(0, 0, 0, 0.2)',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="btn btn-primary btn-sm"
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isRw ? 'Funga' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

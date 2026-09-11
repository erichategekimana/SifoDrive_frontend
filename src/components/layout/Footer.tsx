import React from 'react';
import { Compass, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

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
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
          marginBottom: '40px',
        }}
      >
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-500) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Compass size={20} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>SIFO DRIVE</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {t('footer.desc')}
          </p>
        </div>

        {/* Academics */}
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
            {t('footer.learningHub')}
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <li><Link to="/courses">{t('footer.universalTheory')}</Link></li>
            <li><Link to="/road-signs">{t('footer.roadSignsCatalog')}</Link></li>
            <li><Link to="/live-classes">{t('footer.liveClassesLink')}</Link></li>
            <li><Link to="/booking">{t('footer.iremboBookingLink')}</Link></li>
          </ul>
        </div>

        {/* Legal & Regulatory */}
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
            {t('footer.legalRegulatory')}
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Shield size={14} color="var(--primary)" /> {t('footer.privacyPolicy')}
            </li>
            <li><span style={{ color: 'var(--text-secondary)' }}>{t('profile.policeStandard')}</span></li>
            <li><span style={{ color: 'var(--text-secondary)' }}>{t('roadSigns.badge')}</span></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
            {t('footer.contactSupport')}
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="var(--primary)" />
              <span>{t('footer.kigaliAddress')}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="var(--primary)" />
              <span>{t('footer.supportPhone')}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="var(--primary)" />
              <span>{t('footer.supportEmail')}</span>
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
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        <div>© {new Date().getFullYear()} Sifo Drive Ltd. {t('footer.copyright')}</div>
        <div>{t('footer.disclaimer')}</div>
      </div>
    </footer>
  );
};

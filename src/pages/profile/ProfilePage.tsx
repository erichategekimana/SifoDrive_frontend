import React from 'react';
import { Award, Phone, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Formatter } from '../../core/utils/Formatter';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Badge variant="success">{t('profile.verifiedLearner')}</Badge>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t('nav.brandSub')}
          </span>
        </div>
        <h1>{t('profile.title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '6px' }}>
          {t('profile.subtitle')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Personal Details */}
        <Card>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>{t('profile.personalInfo')}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('profile.legalName')}</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user.fullName}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('profile.phone')}</span>
              <div style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="var(--primary)" />
                <span>{Formatter.phoneNumber(user.phoneNumber)}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('profile.role')}</span>
              <div style={{ marginTop: '4px' }}>
                <Badge variant={user.isStudent() ? 'success' : 'neutral'}>
                  {user.getRoleDisplay()}
                </Badge>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('profile.consentStatus')}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--success)' }}>
                  <CheckCircle2 size={16} />
                  <span>{t('profile.termsAccepted')}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    color: user.privacyAccepted ? 'var(--success)' : 'var(--text-muted)',
                  }}
                >
                  <CheckCircle2 size={16} color={user.privacyAccepted ? 'var(--success)' : 'var(--text-muted)'} />
                  <span>
                    {user.privacyAccepted ? t('profile.privacyAccepted') : t('profile.privacyPending')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Digital Student ID Badge Mockup */}
        <Card
          className="glass-panel"
          style={{
            background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.95) 0%, rgba(5, 150, 105, 0.2) 100%)',
            border: '1px solid var(--primary-glow)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '280px',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                  SIFO <span style={{ color: 'var(--primary-light)' }}>DRIVE</span>
                </span>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t('profile.kigaliLocation')}
                </div>
              </div>
              <Award size={28} color="var(--accent-400)" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                {user.getInitials()}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#ffffff' }}>{user.fullName}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                  {user.studentId || 'SD-STUDENT-PREVIEW'}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            <span>{t('profile.verifiedLearner')}</span>
            <span>{t('profile.policeStandard')}</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

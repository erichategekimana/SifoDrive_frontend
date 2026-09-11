import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Video,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { useTranslation } from '../../context/I18nContext';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '80px 24px 100px 24px',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse at 50% 10%, rgba(16, 185, 129, 0.15), transparent 70%)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          {/* Badge */}
          <div
            className="glass-panel"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              marginBottom: '24px',
              border: '1px solid var(--border-medium)',
            }}
          >
            <Sparkles size={16} color="var(--accent-400)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {t('landing.badge')}
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '24px', fontWeight: 800 }}>
            {t('landing.heroTitle1')} <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #F59E0B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('landing.heroHighlight')}
            </span>{' '}
            {t('landing.heroTitle2')}
          </h1>

          <p
            style={{
              fontSize: '1.2rem',
              color: 'var(--text-secondary)',
              maxWidth: '740px',
              margin: '0 auto 40px auto',
              lineHeight: 1.6,
            }}
          >
            {t('landing.heroSubtitle')}
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg pulse-glow">
              <span>{t('landing.startFree')}</span>
              <ArrowRight size={20} />
            </Link>
            <Link to="/booking" className="btn btn-secondary btn-lg">
              <Calendar size={20} color="var(--accent-400)" />
              <span>{t('landing.bookIrembo')}</span>
            </Link>
          </div>

          {/* Trust badges */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '32px',
              marginTop: '48px',
              flexWrap: 'wrap',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="var(--primary)" />
              <span>{t('landing.universalCurriculum')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--primary)" />
              <span>{t('landing.lawCompliant')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="var(--accent-400)" />
              <span>{t('landing.momoSupported')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section
        style={{
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '36px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-light)' }}>98.4%</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('landing.passRate')}</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-500)' }}>15,000+</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('landing.activeLearners')}</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary-400)' }}>100+</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('landing.liveSessions')}</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ec4899' }}>24/7</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('landing.conciergeService')}</div>
          </div>
        </div>
      </section>

      {/* Core Solutions Grid */}
      <section style={{ padding: '80px 24px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '14px' }}>{t('landing.solutionsTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            {t('landing.solutionsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-3">
          {/* Card 1 */}
          <div className="card">
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--primary-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <BookOpen size={26} color="var(--primary-light)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>{t('landing.theoryCardTitle')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
              {t('landing.theoryCardDesc')}
            </p>
            <Link to="/courses" style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {t('landing.theoryCardLink')} <ArrowRight size={16} />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="card">
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-xl)',
                background: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <Video size={26} color="var(--secondary-400)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>{t('landing.liveCardTitle')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
              {t('landing.liveCardDesc')}
            </p>
            <Link to="/live-classes" style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {t('landing.liveCardLink')} <ArrowRight size={16} />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="card">
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-xl)',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <Calendar size={26} color="var(--accent-400)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>{t('landing.conciergeCardTitle')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
              {t('landing.conciergeCardDesc')}
            </p>
            <Link to="/booking" style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {t('landing.conciergeCardLink')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="glass-panel"
        style={{
          maxWidth: '1100px',
          margin: '0 auto 80px auto',
          padding: '60px 32px',
          textAlign: 'center',
          border: '1px solid var(--primary-glow)',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(5, 150, 105, 0.15) 100%)',
        }}
      >
        <h2 style={{ fontSize: '2.2rem', marginBottom: '16px' }}>{t('landing.ctaTitle')}</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 32px auto', fontSize: '1.05rem' }}>
          {t('landing.ctaSubtitle')}
        </p>
        <Link to="/register" className="btn btn-primary btn-lg">
          <span>{t('landing.ctaButton')}</span>
          <ArrowRight size={20} />
        </Link>
      </section>

      <Footer />
    </div>
  );
};

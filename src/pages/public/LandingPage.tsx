import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Video,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Wallet,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { PublicPageBackground } from '../../components/layout/PublicPageBackground';
import { useTranslation } from '../../context/I18nContext';
import { useTheme } from '../../context/ThemeContext';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <PublicPageBackground />
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '80px 24px 100px 24px',
          overflow: 'hidden',
          background: 'transparent',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            textAlign: 'center',
            padding: isDark ? '0' : '36px 24px',
            borderRadius: '32px',
            background: isDark
              ? 'transparent'
              : 'radial-gradient(ellipse 95% 85% at 50% 50%, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.75) 60%, transparent 100%)',
            backdropFilter: isDark ? 'none' : 'blur(8px)',
            WebkitBackdropFilter: isDark ? 'none' : 'blur(8px)',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              marginBottom: '24px',
              fontWeight: 800,
              color: isDark ? '#ffffff' : '#0f172a',
              textShadow: isDark
                ? '0 2px 10px rgba(0, 0, 0, 0.4)'
                : '0 1px 4px #ffffff, 0 0 16px #ffffff',
            }}
          >
            {t('landing.heroTitle1')} <br />
            <span
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #10B981 0%, #F59E0B 100%)'
                  : 'linear-gradient(135deg, #059669 0%, #b45309 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900,
              }}
            >
              {t('landing.heroHighlight')}
            </span>{' '}
            {t('landing.heroTitle2')}
          </h1>

          <p
            style={{
              fontSize: '1.24rem',
              color: isDark ? '#e2e8f0' : '#0f172a',
              fontWeight: isDark ? 400 : 700,
              maxWidth: '740px',
              margin: '0 auto 40px auto',
              lineHeight: 1.6,
              textShadow: isDark
                ? '0 2px 6px rgba(0, 0, 0, 0.6)'
                : '0 1px 4px #ffffff, 0 0 14px #ffffff',
            }}
          >
            {t('landing.heroSubtitle')}
          </p>

          {/* Action Buttons & Callout */}
          <div style={{ marginBottom: '20px', marginTop: '20px' }}>
            <h2
              style={{
                fontSize: 'clamp(36px, 5vw, 56px)',
                fontWeight: 800,
                color: isDark ? '#ffffff' : '#0f172a',
                marginBottom: '12px',
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
                textShadow: isDark
                  ? '0 2px 10px rgba(0, 0, 0, 0.4)'
                  : '0 1px 3px #ffffff',
              }}
            >
              {t('landing.buyExamTitle')}
            </h2>
            <p
              style={{
                fontSize: '1.18rem',
                color: isDark ? '#e2e8f0' : '#0f172a',
                fontWeight: isDark ? 400 : 700,
                maxWidth: '680px',
                margin: '0 auto 24px auto',
                lineHeight: 1.5,
                textShadow: isDark
                  ? '0 2px 6px rgba(0, 0, 0, 0.6)'
                  : '0 1px 4px #ffffff, 0 0 14px #ffffff',
              }}
            >
              {t('landing.buyExamSubtitle')}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Link
                to="/pricing"
                className="btn btn-primary pulse-glow"
                style={{
                  padding: '18px 44px',
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-xl)',
                  gap: '12px',
                  boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.45)',
                }}
              >
                <span>{t('landing.buyExam')}</span>
                <ArrowRight size={26} />
              </Link>
            </div>
          </div>

          {/* Trust badges */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '48px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '999px',
                background: isDark ? 'rgba(17, 24, 39, 0.75)' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
                color: isDark ? '#f8fafc' : '#0f172a',
                fontSize: '0.88rem',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={18} color="#059669" />
              <span>{t('landing.universalCurriculum')}</span>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '999px',
                background: isDark ? 'rgba(17, 24, 39, 0.75)' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
                color: isDark ? '#f8fafc' : '#0f172a',
                fontSize: '0.88rem',
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={18} color="#0284c7" />
              <span>{t('landing.lawCompliant')}</span>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '999px',
                background: isDark ? 'rgba(17, 24, 39, 0.75)' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
                color: isDark ? '#f8fafc' : '#0f172a',
                fontSize: '0.88rem',
                fontWeight: 700,
              }}
            >
              <Wallet size={18} color="#d97706" />
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
          border: isDark ? '1px solid var(--primary-glow)' : '1px solid #bbf7d0',
          background: isDark
            ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(5, 150, 105, 0.15) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
          boxShadow: isDark ? 'var(--shadow-lg)' : '0 15px 35px -5px rgba(0, 0, 0, 0.06)',
        }}
      >
        <h2 style={{ fontSize: '2.2rem', marginBottom: '16px', color: isDark ? '#ffffff' : '#0f172a', fontWeight: 800 }}>
          {t('landing.ctaTitle')}
        </h2>
        <p style={{ color: isDark ? '#9ca3af' : '#1e293b', maxWidth: '600px', margin: '0 auto 32px auto', fontSize: '1.05rem', fontWeight: isDark ? 400 : 500 }}>
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

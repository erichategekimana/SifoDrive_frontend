import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Wallet,
  Sparkles,
  GraduationCap,
  Newspaper,
  Handshake,
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
            maxWidth: '1120px',
            margin: '0 auto',
            textAlign: 'center',
            padding: '48px 28px',
            borderRadius: '32px',
            background: isDark
              ? 'rgba(15, 23, 42, 0.78)'
              : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(226, 232, 240, 0.85)',
            boxShadow: isDark
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.65)'
              : '0 20px 40px -10px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 4.8vw, 3.8rem)',
              marginBottom: '20px',
              fontWeight: 800,
              color: isDark ? '#ffffff' : '#0f172a',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
            }}
          >
            {t('landing.heroTitle1')} <br />
            <span
              style={{
                display: 'inline-block',
                background: isDark
                  ? 'linear-gradient(135deg, #38bdf8 0%, #34d399 100%)'
                  : 'linear-gradient(135deg, #0284c7 0%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900,
                textShadow: 'none',
                filter: isDark ? 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.35))' : 'none',
              }}
            >
              {t('landing.heroHighlight')}
            </span>{' '}
            {t('landing.heroTitle2')}
          </h1>

          <p
            style={{
              fontSize: '1.2rem',
              color: isDark ? '#cbd5e1' : '#334155',
              fontWeight: 450,
              maxWidth: '760px',
              margin: '0 auto 36px auto',
              lineHeight: 1.7,
              textShadow: 'none',
            }}
          >
            {t('landing.heroSubtitle')}
          </p>

          {/* Action Buttons & Callout */}
          <div style={{ marginBottom: '20px', marginTop: '20px' }}>
            <h2
              style={{
                fontSize: 'clamp(28px, 3.6vw, 42px)',
                fontWeight: 800,
                color: isDark ? '#ffffff' : '#0f172a',
                marginBottom: '12px',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                textShadow: 'none',
              }}
            >
              {t('landing.buyExamTitle')}
            </h2>
            <p
              style={{
                fontSize: '1.14rem',
                color: isDark ? '#94a3b8' : '#475569',
                fontWeight: 400,
                maxWidth: '680px',
                margin: '0 auto 24px auto',
                lineHeight: 1.6,
                textShadow: 'none',
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

      {/* Public Solutions & Pillars Grid */}
      <section style={{ padding: '80px 24px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '14px', color: isDark ? '#ffffff' : '#0f172a', fontWeight: 800 }}>
            {t('landing.solutionsTitle')}
          </h2>
          <p style={{ color: isDark ? '#cbd5e1' : '#475569', maxWidth: '620px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
            {t('landing.solutionsSubtitle')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '24px' }}>
          {/* Card 1: Service Concierge */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-xl)',
                  background: 'rgba(2, 132, 199, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <Sparkles size={26} color="#0284c7" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                {t('nav.serviceConcierge') || 'Service Concierge'}
              </h3>
              <p style={{ color: isDark ? '#94a3b8' : '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
                {t('landing.conciergeCardDesc')}
              </p>
            </div>
            <Link
              to="/services"
              style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0284c7', textDecoration: 'none' }}
            >
              <span>{t('landing.conciergeCardLink') || 'Explore Concierge'}</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Card 2: School Program */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-xl)',
                  background: 'rgba(5, 150, 105, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <GraduationCap size={26} color="#059669" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                {t('nav.schoolProgram') || 'School Program'}
              </h3>
              <p style={{ color: isDark ? '#94a3b8' : '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
                {t('landing.theoryCardDesc')}
              </p>
            </div>
            <Link
              to="/school-program"
              style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', textDecoration: 'none' }}
            >
              <span>{t('landing.theoryCardLink') || 'Academic Solutions'}</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Card 3: Newsroom & Regulatory Bulletins */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-xl)',
                  background: 'rgba(217, 119, 6, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <Newspaper size={26} color="#d97706" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                {t('nav.newsroom') || 'Newsroom'}
              </h3>
              <p style={{ color: isDark ? '#94a3b8' : '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
                {t('landing.liveCardDesc')}
              </p>
            </div>
            <Link
              to="/newsroom"
              style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#d97706', textDecoration: 'none' }}
            >
              <span>{t('landing.liveCardLink') || 'Read Announcements'}</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Card 4: Partner With Us */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-xl)',
                  background: 'rgba(124, 58, 237, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <Handshake size={26} color="#7c3aed" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                {t('nav.partnerWithUs') || 'Partner with us'}
              </h3>
              <p style={{ color: isDark ? '#94a3b8' : '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
                {t('footer.desc') || 'Partner with Rwanda’s premier driving academy ecosystem.'}
              </p>
            </div>
            <Link
              to="/partner"
              style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#7c3aed', textDecoration: 'none' }}
            >
              <span>{t('landing.partnerLink') || 'Partner Today'}</span>
              <ArrowRight size={16} />
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

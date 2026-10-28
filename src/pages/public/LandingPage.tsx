import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Users,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { PublicPageBackground } from '../../components/layout/PublicPageBackground';
import { useTranslation } from '../../context/I18nContext';
import { useTheme } from '../../context/ThemeContext';
import { usePublicAboutUs } from '../../hooks/usePublicAboutUs';
import { usePublicStats } from '../../hooks/usePublicStats';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { title: aboutTitle, subtitle: aboutSubtitle, whoWeAreTitle, whoWeAreDesc } = usePublicAboutUs();
  const stats = usePublicStats();

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
              <span>{t('landing.universalCurriculum')}</span>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
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
              <span>{t('landing.lawCompliant')}</span>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
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
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-light)' }}>
              {stats.passRate}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('landing.passRate')}</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-500)' }}>
              {stats.activeLearners}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('landing.activeLearners')}</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary-400)' }}>
              {stats.totalExams}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('landing.liveSessions')}</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ec4899' }}>
              {stats.serviceConcierge}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('landing.conciergeService')}</div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section style={{ padding: '80px 24px 100px 24px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'center',
          }}
        >
          {/* Left Column: About Us Header */}
          <div>
            <h2
              style={{
                fontSize: 'clamp(2.2rem, 3.5vw, 2.8rem)',
                marginBottom: '16px',
                color: isDark ? '#ffffff' : '#0f172a',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
              }}
            >
              {aboutTitle}
            </h2>
            <p
              style={{
                color: isDark ? '#cbd5e1' : '#475569',
                fontSize: '1.08rem',
                lineHeight: 1.7,
                maxWidth: '520px',
                margin: 0,
              }}
            >
              {aboutSubtitle}
            </p>
          </div>

          {/* Right Column: Who We Are Card */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <div
              className="card"
              style={{
                width: '100%',
                maxWidth: '560px',
                padding: '36px',
                borderRadius: 'var(--radius-xl)',
                background: isDark ? 'rgba(15, 23, 42, 0.65)' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.85)',
                boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.35)' : '0 10px 25px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <Users size={26} color={isDark ? '#38bdf8' : '#0284c7'} />
              </div>
              <h3
                style={{
                  fontSize: '1.35rem',
                  marginBottom: '12px',
                  fontWeight: 800,
                  color: isDark ? '#ffffff' : '#0f172a',
                  letterSpacing: '-0.015em',
                }}
              >
                {whoWeAreTitle}
              </h3>
              <p
                style={{
                  color: isDark ? '#94a3b8' : '#475569',
                  fontSize: '0.98rem',
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                {whoWeAreDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

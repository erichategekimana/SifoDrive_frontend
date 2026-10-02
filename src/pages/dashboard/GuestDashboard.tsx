import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Compass,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';

export const GuestDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [isUpgrading, setIsUpgrading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleUpgradePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpgrading(true);
    setTimeout(() => {
      setIsUpgrading(false);
      setShowUpgradeModal(false);
      alert(t('dashboard.guest.momoSuccess'));
    }, 1500);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome & Trial Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'radial-gradient(ellipse at 80% 50%, rgba(3, 116, 181, 0.15), transparent 70%)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span
              style={{
                background: 'rgba(234, 88, 12, 0.12)',
                color: '#ea580c',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: '1px solid rgba(234, 88, 12, 0.25)',
              }}
            >
              {t('dashboard.guest.trialBadge')}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '6px 0' }}>
            {t('dashboard.guest.welcome', { name: user?.fullName || '' })}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, maxWidth: '600px' }}>
            {t('dashboard.guest.welcomeSub')}
          </p>
        </div>

        <button
          onClick={() => setShowUpgradeModal(true)}
          className="btn btn-primary btn-lg"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#058728', borderColor: '#058728' }}
        >
          <Sparkles size={18} />
          <span>{t('dashboard.guest.upgradeToStudent')}</span>
        </button>
      </div>

      {/* Comparison Grid: Guest vs Enrolled Student */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Guest Features */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
            {t('dashboard.guest.currentTrialFeatures')}
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} color="#058728" />
              <span>{t('dashboard.guest.introLessons')}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} color="#058728" />
              <span>{t('dashboard.guest.roadSignsGuide')}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <Lock size={16} />
              <span>{t('dashboard.guest.noLiveClasses')}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <Lock size={16} />
              <span>{t('dashboard.guest.noStudentId')}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <Lock size={16} />
              <span>{t('dashboard.guest.noPoliceEligibility')}</span>
            </li>
          </ul>
        </div>

        {/* Student Upgrade Value Proposition */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0, 51, 102, 0.05) 0%, rgba(3, 116, 181, 0.1) 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            border: '2px solid #0374b5',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-12px',
              right: '24px',
              background: '#0374b5',
              color: '#ffffff',
              padding: '2px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 800,
            }}
          >
            {t('dashboard.guest.recommended')}
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px 0', color: '#003366' }}>
            {t('dashboard.guest.fullStudent')}
          </h3>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
            {t('dashboard.guest.fullStudentPrice')}{' '}
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              {t('dashboard.guest.perMonth')}
            </span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} color="#058728" />
              <span>{t('dashboard.guest.dailyLiveClasses')}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} color="#058728" />
              <span>{t('dashboard.guest.unlimitedMockExams')}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} color="#058728" />
              <span>{t('dashboard.guest.studentIdClearance')}</span>
            </li>
          </ul>

          <button
            onClick={() => setShowUpgradeModal(true)}
            className="btn btn-primary btn-md"
            style={{ width: '100%', marginTop: '24px', justifyContent: 'center', background: '#003366', borderColor: '#003366' }}
          >
            <span>{t('dashboard.guest.payWithMoMo')}</span>
          </button>
        </div>
      </div>

      {/* Free Trial Learning Cards */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
          {t('dashboard.guest.freeLessonsTitle')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <Link
            to="/courses"
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '20px',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={20} color="#0374b5" />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                {t('dashboard.guest.generalRulesTitle')}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t('dashboard.guest.generalRulesDesc')}
            </p>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0374b5', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {t('dashboard.guest.openLesson')} <ArrowRight size={14} />
            </span>
          </Link>

          <Link
            to="/road-signs"
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '20px',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Compass size={20} color="#058728" />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                {t('dashboard.guest.dangerSignsTitle')}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t('dashboard.guest.dangerSignsDesc')}
            </p>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#058728', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {t('dashboard.guest.exploreSigns')} <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px 0' }}>
              {t('dashboard.guest.confirmPaymentTitle')}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {t('dashboard.guest.confirmPaymentDesc')}
            </p>

            <form onSubmit={handleUpgradePayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                  {t('dashboard.guest.phoneNumber')}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(5, 135, 40, 0.08)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  color: '#058728',
                  fontWeight: 600,
                }}
              >
                {t('dashboard.guest.paymentAmount')}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  className="btn btn-secondary btn-md"
                >
                  {t('dashboard.guest.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isUpgrading}
                  className="btn btn-primary btn-md"
                  style={{ background: '#058728', borderColor: '#058728' }}
                >
                  {isUpgrading ? t('dashboard.guest.sendingPrompt') : t('dashboard.guest.sendPaymentPrompt')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

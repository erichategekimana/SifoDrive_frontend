import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, KeyRound, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/I18nContext';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { AppError } from '../../core/errors/AppError';

export const LoginPage: React.FC = () => {
  const { requestOtp, verifyOtp, loginDemoUser } = useAuth();
  const { success, error } = useToast();
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let cleanPhone = phoneNumber.trim();
    if (!cleanPhone) {
      setErrorMessage(t('auth.phoneNumber') + ' ' + t('common.required'));
      return;
    }

    if (cleanPhone.startsWith('07')) {
      cleanPhone = `+250${cleanPhone.slice(1)}`;
    } else if (cleanPhone.startsWith('7')) {
      cleanPhone = `+250${cleanPhone}`;
    }

    setIsLoading(true);
    try {
      await requestOtp(cleanPhone, 'LOGIN');
      setPhoneNumber(cleanPhone);
      setStep('OTP');
      success(`OTP SMS -> ${cleanPhone}`);
    } catch (err: any) {
      const msg = err instanceof AppError ? err.getFriendlyMessage() : err.message || t('common.errorOccurred');
      setErrorMessage(msg);
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (otpCode.trim().length !== 6) {
      setErrorMessage(t('auth.otpLabel'));
      return;
    }

    setIsLoading(true);
    try {
      const user = await verifyOtp(phoneNumber, otpCode.trim(), 'LOGIN');
      success(`${t('dashboard.greeting')} ${user.fullName}!`);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err instanceof AppError ? err.getFriendlyMessage() : err.message || t('common.errorOccurred');
      setErrorMessage(msg);
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <Navbar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        <div
          className="card glass-panel"
          style={{
            width: '100%',
            maxWidth: '440px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-medium)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--primary-glow)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <ShieldCheck size={28} color="var(--primary)" />
            </div>
            <h2>{t('auth.loginTitle')}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
              {step === 'PHONE'
                ? t('auth.loginSubtitlePhone')
                : `${t('auth.loginSubtitleOtp')}: ${phoneNumber}`}
            </p>
          </div>

          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                background: 'var(--danger-bg)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger)',
                fontSize: '0.85rem',
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 'PHONE' ? (
            <form onSubmit={handleRequestOtp}>
              <Input
                label={t('auth.phoneNumber')}
                type="tel"
                placeholder={t('auth.phonePlaceholder')}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                icon={<Phone size={18} />}
                required
                hint={t('auth.phoneHint')}
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                icon={<ArrowRight size={18} />}
                style={{ width: '100%', marginTop: '12px' }}
              >
                {t('auth.sendOtp')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <Input
                label={t('auth.otpLabel')}
                type="text"
                placeholder="123456"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                icon={<KeyRound size={18} />}
                required
                autoFocus
                style={{ letterSpacing: '0.25em', fontSize: '1.2rem', textAlign: 'center' }}
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                style={{ width: '100%', marginTop: '12px' }}
              >
                {t('auth.verifyAndLogin')}
              </Button>

              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setStep('PHONE')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {t('auth.changePhone')}
                </button>
              </div>
            </form>
          )}

          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px dashed var(--border-medium)',
              textAlign: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => {
                loginDemoUser('STUDENT');
                success(`${t('dashboard.greeting')} Jean Mugisha!`);
                navigate('/dashboard');
              }}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              🚀 {language === 'rw' ? 'Injira mu buryo bw’Icyitegererezo (Demo Student)' : 'Quick Demo Student Login (Preview)'}
            </button>
          </div>

          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            {t('auth.noAccount')}{' '}
            <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary-light)' }}>
              {t('auth.registerFree')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

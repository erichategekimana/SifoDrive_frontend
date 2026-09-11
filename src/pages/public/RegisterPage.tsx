import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Phone, Lock, User as UserIcon, KeyRound, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/I18nContext';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { AppError } from '../../core/errors/AppError';

export const RegisterPage: React.FC = () => {
  const { registerGuest, registerStudent, verifyOtp } = useAuth();
  const { success, error } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState<'GUEST' | 'STUDENT'>('STUDENT');
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!termsAccepted) {
      setErrorMessage(t('auth.termsRequired'));
      return;
    }

    if (accountType === 'STUDENT' && !privacyAccepted) {
      setErrorMessage(t('auth.privacyRequired'));
      return;
    }

    let cleanPhone = phoneNumber.trim();
    if (cleanPhone.startsWith('07')) {
      cleanPhone = `+250${cleanPhone.slice(1)}`;
    } else if (cleanPhone.startsWith('7')) {
      cleanPhone = `+250${cleanPhone}`;
    }

    setIsLoading(true);
    try {
      if (accountType === 'GUEST') {
        await registerGuest({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone_number: cleanPhone,
          password: password || undefined,
          terms_of_service_accepted: true,
        });
      } else {
        await registerStudent({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone_number: cleanPhone,
          password: password || undefined,
          terms_of_service_accepted: true,
          privacy_policy_accepted: true,
          national_id: nationalId.trim() || undefined,
        });
      }

      setPhoneNumber(cleanPhone);
      setStep('OTP');
      success(t('auth.loginSubtitleOtp'));
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
      const user = await verifyOtp(phoneNumber, otpCode.trim(), 'REGISTRATION');
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
            maxWidth: '520px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-medium)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
              <UserPlus size={28} color="var(--primary)" />
            </div>
            <h2>{t('auth.registerTitle')}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
              {step === 'FORM'
                ? t('auth.registerSubtitle')
                : `${t('auth.loginSubtitleOtp')}: ${phoneNumber}`}
            </p>
          </div>

          {step === 'FORM' && (
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-lg)',
                padding: '4px',
                marginBottom: '24px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <button
                type="button"
                onClick={() => setAccountType('STUDENT')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  background: accountType === 'STUDENT' ? 'var(--primary)' : 'transparent',
                  color: accountType === 'STUDENT' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {t('auth.fullStudentTab')}
              </button>
              <button
                type="button"
                onClick={() => setAccountType('GUEST')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  background: accountType === 'GUEST' ? 'var(--primary)' : 'transparent',
                  color: accountType === 'GUEST' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {t('auth.guestTab')}
              </button>
            </div>
          )}

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

          {step === 'FORM' ? (
            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input
                  label={t('auth.firstName')}
                  placeholder="Jean"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  icon={<UserIcon size={16} />}
                  required
                />
                <Input
                  label={t('auth.lastName')}
                  placeholder="Mugisha"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  icon={<UserIcon size={16} />}
                  required
                />
              </div>

              <Input
                label={t('auth.phoneNumber')}
                type="tel"
                placeholder={t('auth.phonePlaceholder')}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                icon={<Phone size={16} />}
                required
                hint={t('auth.phoneHint')}
              />

              {accountType === 'STUDENT' && (
                <Input
                  label={t('auth.nationalId')}
                  placeholder="1 199X 8 0000000 0 00"
                  maxLength={16}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                  hint={t('auth.nationalIdHint')}
                />
              )}

              <Input
                label={t('auth.password')}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={16} />}
                minLength={8}
                required
              />

              {/* Legal Consents */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    style={{ marginTop: '3px', accentColor: 'var(--primary)' }}
                    required
                  />
                  <span>{t('auth.acceptTerms')}</span>
                </label>

                {accountType === 'STUDENT' && (
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <input
                      type="checkbox"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      style={{ marginTop: '3px', accentColor: 'var(--primary)' }}
                      required
                    />
                    <span>{t('auth.acceptPrivacy')}</span>
                  </label>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                icon={<ArrowRight size={18} />}
                style={{ width: '100%' }}
              >
                {t('auth.createAccount')}
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
                {t('auth.verifyAndActivate')}
              </Button>
            </form>
          )}

          <div
            style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            {t('auth.haveAccount')}{' '}
            <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary-light)' }}>
              {t('nav.login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

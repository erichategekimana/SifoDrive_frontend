import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Lock, Eye, EyeOff, LogIn, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/I18nContext';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { AppError } from '../../core/errors/AppError';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let cleanPhone = phoneNumber.trim();
    if (!cleanPhone) {
      setErrorMessage(t('auth.phoneNumber') + ' ' + t('common.required'));
      return;
    }

    if (!password) {
      setErrorMessage(t('auth.passwordRequired'));
      return;
    }

    if (cleanPhone.startsWith('07')) {
      cleanPhone = `+250${cleanPhone.slice(1)}`;
    } else if (cleanPhone.startsWith('7')) {
      cleanPhone = `+250${cleanPhone}`;
    }

    setIsLoading(true);
    try {
      const user = await login(cleanPhone, password);
      success(`${t('dashboard.greeting')} ${user.fullName}!`);
      if (user.isSystemAdmin() || user.isTrainingAdmin()) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
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
              {t('auth.loginSubtitle')}
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label={t('auth.phoneNumber')}
              type="tel"
              placeholder={t('auth.phonePlaceholder')}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              icon={<Phone size={18} />}
              required
              hint={t('auth.phoneHint')}
              autoFocus
            />

            <div style={{ position: 'relative' }}>
              <Input
                label={t('auth.passwordLabel')}
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '38px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              icon={<LogIn size={18} />}
              style={{ width: '100%', marginTop: '8px' }}
            >
              {t('auth.loginButton')}
            </Button>
          </form>

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

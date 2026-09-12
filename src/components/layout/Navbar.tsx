import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, BookOpen, Video, Calendar, Sun, Moon, LogIn, LogOut, Globe, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/I18nContext';
import { Badge } from '../common/Badge';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'rw' ? 'en' : 'rw');
  };

  return (
    <header
      className="glass-panel"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        padding: '12px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-500) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px var(--primary-glow)',
            }}
          >
            <Compass size={24} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              SIFO <span style={{ color: 'var(--primary-light)' }}>DRIVE</span>
            </span>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '-3px' }}>
              {t('nav.brandSub')}
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link
            to="/courses"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}
          >
            <BookOpen size={16} />
            <span>{t('nav.courses')}</span>
          </Link>
          <Link
            to="/road-signs"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}
          >
            <Compass size={16} />
            <span>{t('nav.roadSigns')}</span>
          </Link>
          <Link
            to="/live-classes"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}
          >
            <Video size={16} />
            <span>{t('nav.liveClasses')}</span>
          </Link>
          <Link
            to="/booking"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}
          >
            <Calendar size={16} />
            <span>{t('nav.booking')}</span>
          </Link>
        </nav>

        {/* Actions, Language Selector & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language Switcher Pill */}
          <button
            onClick={toggleLanguage}
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 12px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 700,
              transition: 'all var(--transition-fast)',
            }}
            title={language === 'rw' ? 'Switch to English' : 'Hindura mu Kinyarwanda'}
          >
            <Globe size={15} color="var(--primary-light)" />
            <span>{language === 'rw' ? '🇷🇼 KIN' : '🇬🇧 ENG'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '8px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {user.isSystemAdmin() && (
                <Link
                  to="/admin"
                  className="btn btn-secondary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    color: '#ef4444',
                    background: 'rgba(239, 68, 68, 0.08)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  <Shield size={14} />
                  <span>Admin Console</span>
                </Link>
              )}
              <Link
                to="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-surface-elevated)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--primary-glow)',
                    color: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                >
                  {user.getInitials()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.fullName}
                  </span>
                  <Badge variant={user.isStudent() ? 'success' : 'neutral'} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                    {user.isStudent() ? t('roles.student') : user.isGuest() ? t('roles.guest') : user.getRoleDisplay()}
                  </Badge>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  padding: '6px',
                }}
                title={t('nav.logout')}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                <LogIn size={16} />
                <span>{t('nav.login')}</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <span>{t('nav.joinFree')}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Sun,
  Moon,
  LogIn,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/I18nContext';
import { Badge } from '../common/Badge';
import { usePublicNavigation } from '../../hooks/usePublicNavigation';
import type { PublicNavTabConfig } from '../../features/settings/types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { visibleTabs } = usePublicNavigation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'rw' ? 'en' : 'rw');
  };

  const isNavActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const isTabActive = (tab: PublicNavTabConfig) => {
    if (tab.path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(tab.path);
  };

  const getTabLabel = (tab: PublicNavTabConfig) => {
    if (tab.id === 'home') return t('nav.home');
    if (tab.id === 'service_concierge') return t('nav.serviceConcierge');
    if (tab.id === 'school_program') return t('nav.schoolProgram');
    if (tab.id === 'newsroom') return t('nav.newsroom');
    if (tab.id === 'partner') return t('nav.partnerWithUs');
    if (tab.id === 'contact') return t('nav.contact');
    return language === 'rw' ? tab.labelKinyarwanda || tab.label : tab.label;
  };

  const getTabIcon = (tabId: string) => {
    if (tabId === 'home') {
      return <Home size={15} style={{ flexShrink: 0 }} />;
    }
    return null;
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        height: '68px',
        minHeight: '68px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        background: theme === 'light' ? 'rgba(255, 255, 255, 0.94)' : 'rgba(11, 15, 23, 0.60)',
        borderBottom: theme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: theme === 'light' ? '0 1px 4px rgba(0, 0, 0, 0.04)' : '0 1px 4px rgba(0, 0, 0, 0.3)',
        transition: 'background var(--transition-normal), border-color var(--transition-normal)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}
          title="Sifo Drive - Sifo Group Ltd"
        >
          <div
            style={{
              background: '#ffffff',
              padding: '3px 8px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '38px',
            }}
          >
            <img
              src="/sifo-group-logo.png"
              alt="Sifo Group Ltd"
              style={{
                height: '30px',
                width: 'auto',
                maxWidth: '130px',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        </Link>

        {/* Dynamic Public Navigation Links (Can be toggled On/Off by Admin) */}
        <nav className="nav-track">
          {visibleTabs.map((tab) => {
            const active = isTabActive(tab);
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`nav-btn ${active ? 'active' : ''}`}
                title={tab.description}
              >
                {getTabIcon(tab.id)}
                <span>{getTabLabel(tab)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions, Language Selector & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {/* Language Switcher Pill */}
          <button
            onClick={toggleLanguage}
            style={{
              background: theme === 'light' ? '#ffffff' : 'var(--bg-surface-elevated)',
              border: theme === 'light' ? '1px solid rgba(226, 232, 240, 0.95)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 12px',
              minWidth: '78px',
              justifyContent: 'center',
              cursor: 'pointer',
              color: theme === 'light' ? '#000000' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 500,
              flexShrink: 0,
              whiteSpace: 'nowrap',
              boxShadow: theme === 'light' ? '0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
            title={language === 'rw' ? 'Switch to English' : 'Hindura mu Kinyarwanda'}
          >
            <span style={{ whiteSpace: 'nowrap' }}>{language === 'rw' ? '🇷🇼 RW' : '🇬🇧 ENG'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: theme === 'light' ? '#ffffff' : 'var(--bg-surface-elevated)',
              border: theme === 'light' ? '1px solid rgba(226, 232, 240, 0.95)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '8px',
              cursor: 'pointer',
              color: theme === 'light' ? '#000000' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: theme === 'light' ? '0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} style={{ flexShrink: 0 }} /> : <Moon size={18} style={{ flexShrink: 0 }} />}
          </button>

          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
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
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <Shield size={14} style={{ flexShrink: 0 }} />
                  <span>Admin Console</span>
                </Link>
              )}
              {user.isTrainingAdmin() && (
                <Link
                  to="/admin"
                  className="btn btn-secondary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderColor: 'rgba(245, 158, 11, 0.4)',
                    color: '#f59e0b',
                    background: 'rgba(245, 158, 11, 0.08)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <Shield size={14} style={{ flexShrink: 0 }} />
                  <span>Training Console</span>
                </Link>
              )}
              <Link
                to="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: isNavActive('/dashboard')
                    ? theme === 'light'
                      ? '#0284c7'
                      : 'rgba(255, 255, 255, 0.15)'
                    : theme === 'light'
                    ? '#ffffff'
                    : 'var(--bg-surface-elevated)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-lg)',
                  border: isNavActive('/dashboard')
                    ? theme === 'light'
                      ? '1px solid #0284c7'
                      : '1px solid rgba(255, 255, 255, 0.25)'
                    : theme === 'light'
                    ? '1px solid rgba(226, 232, 240, 0.95)'
                    : '1px solid var(--border-subtle)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: isNavActive('/dashboard')
                    ? theme === 'light'
                      ? '0 2px 6px rgba(2, 132, 199, 0.25)'
                      : '0 3px 8px rgba(0, 0, 0, 0.28)'
                    : theme === 'light'
                    ? '0 1px 2px rgba(0, 0, 0, 0.04)'
                    : 'none',
                  transition: 'all var(--transition-fast)',
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
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.fullName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    user.getInitials()
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isNavActive('/dashboard') ? '#ffffff' : 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {user.fullName}
                  </span>
                  <Badge variant={user.isStudent() ? 'success' : 'neutral'} style={{ fontSize: '0.65rem', padding: '1px 6px', whiteSpace: 'nowrap' }}>
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
                  flexShrink: 0,
                }}
                title={t('nav.logout')}
              >
                <LogOut size={18} style={{ flexShrink: 0 }} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <Link
                to="/login"
                className={`nav-btn ${location.pathname === '/login' ? 'active' : ''}`}
                style={{ fontSize: '0.82rem', padding: '6px 12px' }}
              >
                <LogIn size={15} />
                <span>{t('nav.login')}</span>
              </Link>
              <Link
                to="/register"
                className={`btn ${location.pathname === '/register' ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                style={{
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  ...(location.pathname === '/register'
                    ? {
                        background: 'var(--primary-700)',
                        color: '#ffffff',
                        borderColor: 'var(--primary-800)',
                        boxShadow: '0 2px 8px var(--primary-glow)',
                      }
                    : {}),
                }}
              >
                <span>{t('nav.joinFree')}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

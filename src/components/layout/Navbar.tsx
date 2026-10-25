import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Home,
  Sparkles,
  GraduationCap,
  Newspaper,
  Handshake,
  PhoneCall,
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
    switch (tabId) {
      case 'home':
        return <Home size={15} style={{ flexShrink: 0 }} />;
      case 'service_concierge':
        return <Sparkles size={15} style={{ flexShrink: 0 }} />;
      case 'school_program':
        return <GraduationCap size={15} style={{ flexShrink: 0 }} />;
      case 'newsroom':
        return <Newspaper size={15} style={{ flexShrink: 0 }} />;
      case 'partner':
        return <Handshake size={15} style={{ flexShrink: 0 }} />;
      case 'contact':
        return <PhoneCall size={15} style={{ flexShrink: 0 }} />;
      default:
        return <Compass size={15} style={{ flexShrink: 0 }} />;
    }
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
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              flexShrink: 0,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-500) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px var(--primary-glow)',
            }}
          >
            <Compass size={24} color="#ffffff" style={{ flexShrink: 0 }} />
          </div>
          <div style={{ flexShrink: 0 }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', whiteSpace: 'nowrap', display: 'block' }}>
              SIFO <span style={{ color: 'var(--primary-light)' }}>DRIVE</span>
            </span>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '-3px', whiteSpace: 'nowrap' }}>
              {t('nav.brandSub')}
            </div>
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
              background: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'var(--bg-surface-elevated)',
              border: theme === 'light' ? '1px solid rgba(203, 213, 225, 0.95)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 12px',
              minWidth: '78px',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 700,
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
              background: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'var(--bg-surface-elevated)',
              border: theme === 'light' ? '1px solid rgba(203, 213, 225, 0.95)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '8px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
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
                  background: isNavActive('/dashboard') ? '#18181b' : theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'var(--bg-surface-elevated)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-lg)',
                  border: isNavActive('/dashboard') ? '1px solid #27272a' : theme === 'light' ? '1px solid rgba(203, 213, 225, 0.95)' : '1px solid var(--border-subtle)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: isNavActive('/dashboard') ? '0 3px 8px rgba(0, 0, 0, 0.28)' : theme === 'light' ? '0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
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
                  ...(location.pathname === '/register' ? { background: '#18181b', color: '#ffffff', borderColor: '#27272a', boxShadow: '0 3px 8px rgba(0, 0, 0, 0.28)' } : {}),
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

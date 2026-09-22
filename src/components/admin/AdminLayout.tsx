import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Compass, Sun, Moon, LogOut, Clock, Activity, Shield, GraduationCap, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/I18nContext';
import { AdminSidebar } from './AdminSidebar';
import { Badge } from '../common/Badge';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useTranslation();
  const navigate = useNavigate();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Africa/Kigali',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* Admin Top Header */}
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Compass size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  SIFO DRIVE
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: user?.isTrainingAdmin() ? 'rgba(2, 132, 199, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: user?.isTrainingAdmin() ? '1px solid rgba(2, 132, 199, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                    color: user?.isTrainingAdmin() ? '#0284c7' : '#ef4444',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  {user?.isTrainingAdmin() ? "INDIRERWE Y'AMASOMO" : 'ADMIN CONSOLE'}
                </span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Rwanda Digital Driving Academy
              </div>
            </div>
          </Link>
        </div>

        {/* Status Center & User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Live Clock (Kigali CAT) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
            title="Kigali Time (CAT UTC+2)"
          >
            <Clock size={14} color="var(--primary-light)" />
            <span>{timeStr || 'Loading...'} CAT</span>
          </div>

          {/* Backend API Status Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
            }}
          >
            <Activity size={14} color="var(--success)" />
            <span>Backend: <strong style={{ color: 'var(--text-primary)' }}>/api/v1</strong></span>
          </div>

          {/* Language Toggle: Visible ONLY for Training Admin (System Admin has NO toggle) */}
          {user?.isTrainingAdmin() && (
            <button
              onClick={() => setLanguage(language === 'rw' ? 'en' : 'rw')}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 10px',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
              title={language === 'rw' ? 'Hindura mu Cyongereza (Switch to English)' : 'Hindura mu Kinyarwanda (Switch to Kinyarwanda)'}
            >
              <Globe size={14} color="#0284c7" />
              <span>{language === 'rw' ? 'RW' : 'EN'}</span>
            </button>
          )}

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

          {/* Admin User Profile */}
          {user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: user?.isTrainingAdmin()
                    ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                    : 'linear-gradient(135deg, var(--danger) 0%, #b91c1c 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                }}
              >
                {user?.isTrainingAdmin() ? <GraduationCap size={16} /> : <Shield size={16} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user.fullName}
                </span>
                <Badge
                  variant={user?.isTrainingAdmin() ? 'warning' : 'danger'}
                  style={{ fontSize: '0.65rem', padding: '1px 6px' }}
                >
                  {user?.isTrainingAdmin() ? "UMUYOBOZI W'AMASOMO" : 'SYSTEM ADMIN'}
                </Badge>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  padding: '4px',
                  marginLeft: '4px',
                }}
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Body */}
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 64px)' }}>
        <AdminSidebar />
        <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', background: 'var(--bg-base)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

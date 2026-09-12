import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Compass, Video, Calendar, UserCheck, Award, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { to: '/dashboard', label: t('nav.overview'), icon: <LayoutDashboard size={18} /> },
    { to: '/courses', label: t('nav.courses'), icon: <BookOpen size={18} /> },
    { to: '/road-signs', label: t('nav.roadSigns'), icon: <Compass size={18} /> },
    { to: '/live-classes', label: t('nav.liveClasses'), icon: <Video size={18} /> },
    { to: '/booking', label: t('nav.booking'), icon: <Calendar size={18} /> },
    { to: '/profile', label: t('nav.myProfile'), icon: <UserCheck size={18} /> },
    ...(user?.isSystemAdmin()
      ? [{ to: '/admin', label: 'Admin Console', icon: <Shield size={18} color="#ef4444" /> }]
      : []),
  ];

  return (
    <aside
      className="glass-panel"
      style={{
        width: '260px',
        minHeight: 'calc(100vh - 65px)',
        borderTop: 'none',
        borderBottom: 'none',
        borderLeft: 'none',
        borderRadius: 0,
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ padding: '0 12px 12px 12px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Sifo Drive Learning
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.9rem',
              fontWeight: 500,
              textDecoration: 'none',
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              background: isActive ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)' : 'transparent',
              boxShadow: isActive ? '0 4px 12px var(--primary-glow)' : 'none',
              transition: 'all var(--transition-fast)',
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Cohort / Student Card */}
      {user && (
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            padding: '16px',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Award size={18} color="var(--accent-500)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {t('profile.policeStandard')}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {user.studentId ? `ID: ${user.studentId}` : user.getRoleDisplay()}
          </div>
          <div
            style={{
              marginTop: '10px',
              height: '4px',
              background: 'var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div style={{ width: '45%', height: '100%', background: 'var(--primary)' }} />
          </div>
        </div>
      )}
    </aside>
  );
};

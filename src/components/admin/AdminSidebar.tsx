import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  MessageSquare,
  Award,
  ShieldCheck,
  ExternalLink,
  Shield,
  TrendingUp,
  Settings,
  UserCheck,
  Video,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';

export const AdminSidebar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isTrainingAdmin = user?.isTrainingAdmin();

  const systemAdminNavItems = [
    { to: '/admin', label: t('admin.sidebar.commandCenter'), icon: <LayoutDashboard size={18} />, end: true },
    { to: '/admin/analytics', label: t('admin.sidebar.analytics'), icon: <TrendingUp size={18} /> },
    { to: '/admin/users', label: t('admin.sidebar.users'), icon: <Users size={18} /> },
    { to: '/admin/agents-staff', label: t('admin.sidebar.agentsStaff'), icon: <UserCheck size={18} /> },
    { to: '/admin/courses', label: t('admin.sidebar.lmsStudio'), icon: <BookOpen size={18} /> },
    { to: '/admin/examinations', label: t('admin.sidebar.examinations'), icon: <Award size={18} /> },
    { to: '/admin/schedules', label: t('admin.sidebar.schedules'), icon: <CalendarDays size={18} /> },
    { to: '/admin/sms', label: t('admin.sidebar.sms'), icon: <MessageSquare size={18} /> },
    { to: '/admin/audit', label: t('admin.sidebar.audit'), icon: <ShieldCheck size={18} /> },
    { to: '/admin/settings', label: t('admin.sidebar.settings'), icon: <Settings size={18} /> },
  ];

  const trainingAdminNavItems = [
    { to: '/admin', label: t('admin.sidebar.commandCenter'), icon: <LayoutDashboard size={18} />, end: true },
    { to: '/admin/courses', label: t('admin.sidebar.lmsStudio'), icon: <BookOpen size={18} /> },
    { to: '/admin/examinations', label: t('admin.sidebar.examinations'), icon: <Award size={18} /> },
    { to: '/admin/schedules', label: t('admin.sidebar.schedules'), icon: <CalendarDays size={18} /> },
    { to: '/admin/live-classes', label: t('admin.sidebar.liveClasses'), icon: <Video size={18} /> },
    { to: '/admin/analytics', label: t('admin.sidebar.analytics'), icon: <TrendingUp size={18} /> },
  ];

  const navItems = isTrainingAdmin ? trainingAdminNavItems : systemAdminNavItems;

  return (
    <aside
      style={{
        width: '260px',
        minHeight: 'calc(100vh - 64px)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        padding: '20px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Canvas LMS style role header */}
        <div
          style={{
            padding: '4px 10px 14px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              background: isTrainingAdmin ? '#0284c7' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            {isTrainingAdmin ? <GraduationCap size={18} /> : <Shield size={18} />}
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isTrainingAdmin ? t('admin.roles.trainingAdminBadge') : t('admin.roles.systemAdminBadge')}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {isTrainingAdmin ? t('admin.roles.trainingAdminSub') : t('admin.roles.systemAdminSub')}
            </div>
          </div>
        </div>

        {/* Navigation list in Canvas LMS style: clean, high contrast, functional */}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.86rem',
              fontWeight: isActive ? 700 : 500,
              textDecoration: 'none',
              background: isActive
                ? isTrainingAdmin
                  ? '#0284c7'
                  : 'var(--primary)'
                : 'transparent',
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            textDecoration: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
        >
          <span>{isTrainingAdmin ? "Ahabanza h'Umunyeshuri" : 'Learner Portal'}</span>
          <ExternalLink size={14} color="#0284c7" />
        </Link>

        {user && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: isTrainingAdmin ? 'rgba(2, 132, 199, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: isTrainingAdmin ? '1px solid rgba(2, 132, 199, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: isTrainingAdmin ? '#0284c7' : '#ef4444',
                  display: 'inline-block',
                }}
              />
              <strong style={{ color: 'var(--text-primary)' }}>
                {isTrainingAdmin ? t('admin.sidebar.footerBadge') : 'System Admin Mode'}
              </strong>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.fullName}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{user.phoneNumber}</div>
          </div>
        )}
      </div>
    </aside>
  );
};

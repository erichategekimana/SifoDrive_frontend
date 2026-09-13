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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/admin', label: 'Command Center', icon: <LayoutDashboard size={18} />, end: true },
    { to: '/admin/users', label: 'User Directory', icon: <Users size={18} /> },
    { to: '/admin/courses', label: 'LMS Curriculum Studio', icon: <BookOpen size={18} /> },
    { to: '/admin/examinations', label: 'Examinations & Certs', icon: <Award size={18} /> },
    { to: '/admin/schedules', label: 'Schedules & Events', icon: <CalendarDays size={18} /> },
    { to: '/admin/sms', label: 'SMS Communication', icon: <MessageSquare size={18} /> },
    { to: '/admin/audit', label: 'Security & Audit Logs', icon: <ShieldCheck size={18} /> },
  ];

  return (
    <aside
      className="glass-panel"
      style={{
        width: '270px',
        minHeight: 'calc(100vh - 64px)',
        borderTop: 'none',
        borderBottom: 'none',
        borderLeft: 'none',
        borderRadius: 0,
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div
          style={{
            padding: '0 12px 14px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--danger) 0%, #dc2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Shield size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
              SYSTEM ADMIN
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Platform Governance
            </div>
          </div>
        </div>

        <div style={{ padding: '0 12px 8px 12px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Navigation
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.88rem',
              fontWeight: 500,
              textDecoration: 'none',
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              background: isActive
                ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)'
                : 'transparent',
              boxShadow: isActive ? '0 4px 12px var(--primary-glow)' : 'none',
              transition: 'all var(--transition-fast)',
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Bottom Switcher & Status Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            textDecoration: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all var(--transition-fast)',
          }}
        >
          <span>Learner Portal</span>
          <ExternalLink size={15} color="var(--primary-light)" />
        </Link>

        {user && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--success)',
                  display: 'inline-block',
                }}
              />
              <strong style={{ color: 'var(--text-primary)' }}>System Admin Mode</strong>
            </div>
            <div>{user.fullName}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{user.phoneNumber}</div>
          </div>
        )}
      </div>
    </aside>
  );
};

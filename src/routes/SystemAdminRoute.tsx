import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/common/Spinner';

export const SystemAdminRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner message="Verifying administrative privileges..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Verify administrative role (System Admin or Training Admin)
  if (!user.isSystemAdmin() && !user.isTrainingAdmin()) {
    const currentUser = user;
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'radial-gradient(ellipse at top, rgba(239, 68, 68, 0.15) 0%, var(--bg-base) 70%)',
        }}
      >
        <div
          className="glass-panel"
          style={{
            maxWidth: '520px',
            width: '100%',
            padding: '36px',
            textAlign: 'center',
            borderRadius: 'var(--radius-2xl)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <ShieldAlert size={32} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Administrative Access Required
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
            Your account (<strong style={{ color: 'var(--text-primary)' }}>{currentUser.fullName}</strong>) has the role{' '}
            <span
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              {currentUser.getRoleDisplay()}
            </span>
            . Access to this management console requires administrative privileges.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/dashboard" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowLeft size={16} />
              <span>Return to Dashboard</span>
            </Link>
            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // System Admin exclusive sections (Agents, Audits, System Settings)
  const systemAdminOnlyPaths = ['/admin/agents-staff', '/admin/audit', '/admin/settings'];
  const isRestrictedPath = systemAdminOnlyPaths.some((p) => location.pathname.startsWith(p));
  if (user.isTrainingAdmin() && isRestrictedPath) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

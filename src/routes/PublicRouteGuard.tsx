import React from 'react';
import { Wrench } from 'lucide-react';
import { usePublicNavigation } from '../hooks/usePublicNavigation';
import { useTranslation } from '../context/I18nContext';

interface PublicRouteGuardProps {
  tabId: string;
  children: React.ReactNode;
}

export const PublicRouteGuard: React.FC<PublicRouteGuardProps> = ({ tabId, children }) => {
  const { isTabVisible } = usePublicNavigation();
  const { language } = useTranslation();
  const isRw = language === 'rw';

  if (!isTabVisible(tabId)) {
    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          backgroundColor: 'var(--bg-base, #0b0f17)',
          color: 'var(--text-primary, #f8fafc)',
          padding: '24px',
          boxSizing: 'border-box',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(1.15rem, 2.5vw, 1.6rem)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {isRw ? 'Iyi Paji Iri mu Mirimo yo Kuvugurura' : 'This Page Is Under Maintenance'}
        </h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted, #94a3b8)',
          }}
        >
          <Wrench size={30} strokeWidth={1.8} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PublicRouteGuard;

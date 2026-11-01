import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const RouteLoadingFallback: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        width: '100%',
        padding: '32px',
        color: isDark ? '#94a3b8' : '#64748b',
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          border: `3px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
          borderTopColor: '#059669',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '14px',
        }}
      />
      <span
        style={{
          fontSize: '0.84rem',
          fontWeight: 600,
          letterSpacing: '0.02em',
          opacity: 0.8,
        }}
      >
        Loading...
      </span>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

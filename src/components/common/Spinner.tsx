import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: number;
  message?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 32, message }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-md)',
        padding: 'var(--space-2xl)',
      }}
    >
      <Loader2
        size={size}
        color="var(--primary)"
        style={{ animation: 'spin 1s linear infinite' }}
      />
      {message && <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{message}</span>}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

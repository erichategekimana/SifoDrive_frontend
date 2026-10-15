import React from 'react';
import { Loader2 } from 'lucide-react';

export const CourseTabLoadingFallback: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '360px',
        width: '100%',
        padding: '48px 24px',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
      }}
    >
      <Loader2
        size={36}
        color="#0055A5"
        className="animate-spin"
        style={{
          animation: 'spin 1s linear infinite',
          marginBottom: '16px',
        }}
      />
      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
        Loading section...
      </div>
      <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px' }}>
        Preparing course materials
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CourseTabLoadingFallback;

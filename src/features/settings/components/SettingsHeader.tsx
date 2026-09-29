import React from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

interface SettingsHeaderProps {
  isSaving: boolean;
  onSave: () => void;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({ isSaving, onSave }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Settings size={26} color="var(--primary)" />
          Settings
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#94a3b8' }}>
          Manage school tuition, practical lesson fees, subscription passes, booking rules, and academy policies.
        </p>
      </div>

      <button
        onClick={onSave}
        disabled={isSaving}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '9px 20px',
          borderRadius: '8px',
          border: 'none',
          background: 'var(--primary)',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.86rem',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        }}
      >
        {isSaving ? <CheckCircle2 size={16} /> : <Save size={16} />}
        {isSaving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
};

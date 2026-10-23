import React from 'react';
import { Settings } from 'lucide-react';

interface SettingsHeaderProps {
  onSave?: () => void;
  isSaving?: boolean;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({ onSave, isSaving }) => {
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
      </div>

      {onSave && (
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          style={{
            padding: '10px 22px',
            borderRadius: '10px',
            backgroundColor: '#0284c7',
            border: 'none',
            color: '#ffffff',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.7 : 1,
            transition: 'background-color 0.15s ease',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
          }}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      )}
    </div>
  );
};


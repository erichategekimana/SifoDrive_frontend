import React from 'react';
import { RefreshCw, UserPlus } from 'lucide-react';

interface UsersHeaderProps {
  onRefresh: () => void;
  onCreateAccount: () => void;
  isLoading: boolean;
}

export const UsersHeader: React.FC<UsersHeaderProps> = ({
  onRefresh,
  onCreateAccount,
  isLoading,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          User Directory
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          System-wide user registry, role governance, account lifecycle, and audit compliance.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          title="Refresh user directory"
        >
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>

        <button
          onClick={onCreateAccount}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <UserPlus size={14} />
          <span>Create Account</span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { RefreshCw, Lock } from 'lucide-react';

interface AuditHeaderProps {
  isLoading: boolean;
  isVerifying: boolean;
  onRefresh: () => void;
  onVerifyIntegrity: () => void;
}

export const AuditHeader: React.FC<AuditHeaderProps> = ({
  isLoading,
  isVerifying,
  onRefresh,
  onVerifyIntegrity,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Security & Cryptographic Audit
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Immutable SHA-256 audit ledger, critical compliance events, and security access timelines.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
        <button
          onClick={onVerifyIntegrity}
          disabled={isVerifying}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Lock size={15} />
          <span>{isVerifying ? 'Verifying Chain...' : 'Verify Cryptographic Integrity'}</span>
        </button>
      </div>
    </div>
  );
};

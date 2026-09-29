import React from 'react';
import { RefreshCw } from 'lucide-react';

interface BookingsHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export const BookingsHeader: React.FC<BookingsHeaderProps> = ({
  isLoading,
  onRefresh,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Irembo Booking Operations
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Concierge pipeline for provisional and definitive driving test registration with Rwanda National Police.
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
      </div>
    </div>
  );
};

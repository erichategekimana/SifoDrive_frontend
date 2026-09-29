import React from 'react';
import { Search, Filter } from 'lucide-react';

interface AuditFiltersBarProps {
  actionSearch: string;
  setActionSearch: (val: string) => void;
  severityFilter: string;
  setSeverityFilter: (val: string) => void;
  onSearchEnter: () => void;
  onSeverityChange: (val: string) => void;
}

export const AuditFiltersBar: React.FC<AuditFiltersBarProps> = ({
  actionSearch,
  setActionSearch,
  severityFilter,
  onSearchEnter,
  onSeverityChange,
}) => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '16px 20px',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 300px' }}>
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Filter by action (e.g. AUTH_LOGIN, EXAM_SUBMIT, BOOKING_UPDATE)..."
          value={actionSearch}
          onChange={(e) => setActionSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearchEnter()}
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Filter size={14} color="var(--text-muted)" />
        <select
          value={severityFilter}
          onChange={(e) => onSeverityChange(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
        >
          <option value="ALL">All Severities</option>
          <option value="INFO">INFO</option>
          <option value="WARNING">WARNING</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
      </div>
    </div>
  );
};

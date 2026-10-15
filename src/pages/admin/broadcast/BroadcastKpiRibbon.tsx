import React from 'react';

interface BroadcastKpiRibbonProps {
  totalCount: number;
  updatesCount: number;
  supportCount: number;
  pinnedCount: number;
}

export const BroadcastKpiRibbon: React.FC<BroadcastKpiRibbonProps> = ({
  totalCount,
  updatesCount,
  supportCount,
  pinnedCount,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '12px',
      }}
    >
      <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #7C3AED' }}>
        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL BROADCASTS</div>
        <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#7C3AED', marginTop: '2px' }}>{totalCount}</div>
      </div>
      <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #8B5CF6' }}>
        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 600 }}>PLATFORM UPDATES</div>
        <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#8B5CF6', marginTop: '2px' }}>{updatesCount}</div>
      </div>
      <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #0284C7' }}>
        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 600 }}>SUPPORT MESSAGES</div>
        <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0284C7', marginTop: '2px' }}>{supportCount}</div>
      </div>
      <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #F59E0B' }}>
        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 600 }}>PINNED TO TOP</div>
        <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#D97706', marginTop: '2px' }}>{pinnedCount}</div>
      </div>
      <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #10B981' }}>
        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 600 }}>TARGET AUDIENCE</div>
        <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#059669', marginTop: '6px' }}>100% PLATFORM-WIDE</div>
      </div>
    </div>
  );
};

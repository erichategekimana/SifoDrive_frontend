import React from 'react';

interface TicketsKpiCardsProps {
  totalCount: number;
  openCount: number;
  resolvedCount: number;
  reopenedCount: number;
  satisfactionRate: number;
  feedbackLikesCount: number;
}

export const TicketsKpiCards: React.FC<TicketsKpiCardsProps> = ({
  totalCount,
  openCount,
  resolvedCount,
  reopenedCount,
  satisfactionRate,
  feedbackLikesCount,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '14px',
      }}
    >
      <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL COLLECTED</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{totalCount}</div>
      </div>
      <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #f59e0b' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OPEN & IN PROGRESS</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>{openCount}</div>
      </div>
      <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #10b981' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>RESOLVED / CLOSED</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>{resolvedCount}</div>
      </div>
      <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #ef4444' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>REOPENED / UNSOLVED</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>{reopenedCount}</div>
      </div>
      <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #8b5cf6' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SATISFACTION RATE</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed', marginTop: '2px' }}>
          {satisfactionRate}% <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>({feedbackLikesCount} 👍)</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

const badgeBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.02em',
  lineHeight: '1.4',
};

export function getExamStatusBadge(status: string): React.ReactElement {
  switch (status) {
    case 'SUBMITTED':
    case 'BOARD_REVIEW':
      return (
        <span
          style={{
            ...badgeBase,
            background: '#27272a',
            color: '#f4f4f5',
            border: '1px solid #52525b',
          }}
        >
          Stage 1: Board Review
        </span>
      );
    case 'TRAINING_REVIEW':
      return (
        <span
          style={{
            ...badgeBase,
            background: '#27272a',
            color: '#f4f4f5',
            border: '1px solid #52525b',
          }}
        >
          Stage 2: Training Audit
        </span>
      );
    case 'SYSTEM_REVIEW':
      return (
        <span
          style={{
            ...badgeBase,
            background: '#27272a',
            color: '#f4f4f5',
            border: '1px solid #52525b',
          }}
        >
          Stage 3: System Approval
        </span>
      );
    case 'APPROVED':
      return (
        <span
          style={{
            ...badgeBase,
            background: '#ffffff',
            color: '#000000',
            border: '1px solid #ffffff',
          }}
        >
          Approved
        </span>
      );
    case 'PUBLISHED':
      return (
        <span
          style={{
            ...badgeBase,
            background: '#18181b',
            color: '#a1a1aa',
            border: '1px solid #3f3f46',
          }}
        >
          Published
        </span>
      );
    case 'REJECTED':
      return (
        <span
          style={{
            ...badgeBase,
            background: '#18181b',
            color: '#d4d4d8',
            border: '1px solid #52525b',
          }}
        >
          Rejected
        </span>
      );
    case 'FLAGGED':
      return (
        <span
          style={{
            ...badgeBase,
            background: '#18181b',
            color: '#f4f4f5',
            border: '1px solid #71717a',
          }}
        >
          Flagged
        </span>
      );
    default:
      return (
        <span
          style={{
            ...badgeBase,
            background: '#18181b',
            color: '#a1a1aa',
            border: '1px solid #3f3f46',
          }}
        >
          {status}
        </span>
      );
  }
}

import React from 'react';
import { RefreshCw, Plus } from 'lucide-react';

interface QuizBankHeaderProps {
  onRefresh: () => void;
  onCreateQuiz: () => void;
  isLoading: boolean;
  isRefetching: boolean;
  refreshText: string;
  createButtonText?: string;
}

export const QuizBankHeader: React.FC<QuizBankHeaderProps> = ({
  onRefresh,
  onCreateQuiz,
  isLoading,
  isRefetching,
  refreshText,
  createButtonText = 'Create New Quiz',
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Quiz Bank & Assessments
          </h1>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: 'var(--text-secondary)',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            Engine v2
          </span>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
          Manage and schedule assessments.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onRefresh}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 16px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            color: 'var(--text-primary)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.15s ease',
          }}
        >
          <RefreshCw size={13} className={isLoading || isRefetching ? 'spin' : ''} />
          <span>{refreshText}</span>
        </button>

        {createButtonText && onCreateQuiz && (
          <button
            type="button"
            onClick={onCreateQuiz}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 18px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              color: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.18)',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={14} />
            <span>{createButtonText}</span>
          </button>
        )}
      </div>
    </div>
  );
};

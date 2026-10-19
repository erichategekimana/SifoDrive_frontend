import React from 'react';
import { Layers, Award, Settings } from 'lucide-react';

interface ExaminationsHeaderProps {
  isBoardReviewer: boolean;
  isSystemAdmin: boolean;
  activeTab: 'pipeline' | 'exams' | 'certificates' | 'settings';
  onTabChange: (tab: 'pipeline' | 'exams' | 'certificates' | 'settings') => void;
}

export const ExaminationsHeader: React.FC<ExaminationsHeaderProps> = ({
  isBoardReviewer,
  isSystemAdmin,
  activeTab,
  onTabChange,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '16px',
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
          Examinations
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '3px', marginBottom: 0 }}>
          Candidate evaluation and certification pipeline.
        </p>
      </div>

      {!isBoardReviewer && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onTabChange('pipeline')}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              padding: '6px 12px',
              background: activeTab === 'pipeline' ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
              color: activeTab === 'pipeline' ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderColor: activeTab === 'pipeline' ? 'var(--text-muted)' : 'var(--border-subtle)',
            }}
          >
            <Layers size={13} />
            <span>Pipeline</span>
          </button>
          <button
            onClick={() => onTabChange('exams')}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              padding: '6px 12px',
              background: activeTab === 'exams' ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
              color: activeTab === 'exams' ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderColor: activeTab === 'exams' ? 'var(--text-muted)' : 'var(--border-subtle)',
            }}
          >
            <Award size={13} />
            <span>Exam</span>
          </button>
          <button
            onClick={() => onTabChange('certificates')}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              padding: '6px 12px',
              background: activeTab === 'certificates' ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
              color: activeTab === 'certificates' ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderColor: activeTab === 'certificates' ? 'var(--text-muted)' : 'var(--border-subtle)',
            }}
          >
            <Award size={13} />
            <span>Certificates</span>
          </button>
          {isSystemAdmin && (
            <button
              onClick={() => onTabChange('settings')}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                padding: '6px 12px',
                background: activeTab === 'settings' ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                color: activeTab === 'settings' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderColor: activeTab === 'settings' ? 'var(--text-muted)' : 'var(--border-subtle)',
              }}
            >
              <Settings size={13} />
              <span>Settings</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import type { CohortItem } from '../../../core/services/AdminService';
import { useTranslation } from '../../../context/I18nContext';

interface CohortsStripProps {
  cohorts: CohortItem[];
}

export const CohortsStrip: React.FC<CohortsStripProps> = ({ cohorts }) => {
  const { t, language } = useTranslation();

  return (
    <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {`${t('admin.liveClasses.studentCohorts')} (${cohorts.length})`}
        </h3>
      </div>

      {cohorts.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          {t('admin.dashboard.noCohorts')}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {cohorts.map((c) => (
            <div
              key={c.id}
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  {c.name}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {c.student_count ?? 0} {t('admin.liveClasses.students')}
                </span>
              </div>

              {c.description && (
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {c.description}
                </p>
              )}

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {c.start_date ? new Date(c.start_date).toLocaleDateString(language === 'rw' ? 'en-RW' : 'en-US') : 'TBD'}
                {' → '}
                {c.end_date ? new Date(c.end_date).toLocaleDateString(language === 'rw' ? 'en-RW' : 'en-US') : t('admin.liveClasses.open')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

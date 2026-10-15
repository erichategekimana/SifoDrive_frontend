import React from 'react';
import { RefreshCw } from 'lucide-react';

interface CoursesHeaderProps {
  isTrainingAdmin?: boolean;
  t: (key: string) => string;
  onRefresh: () => void;
  isLoading: boolean;
  isRefetching: boolean;
}

export const CoursesHeader: React.FC<CoursesHeaderProps> = ({
  isTrainingAdmin,
  t,
  onRefresh,
  isLoading,
  isRefetching,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          {isTrainingAdmin ? t('admin.courses.trainingAdminTitle') : t('admin.courses.systemAdminTitle')}
        </h1>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {isTrainingAdmin
            ? t('admin.courses.trainingAdminSubtitle')
            : t('admin.courses.systemAdminSubtitle')}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={isLoading || isRefetching ? 'spin' : ''} />
          <span>{t('admin.dashboard.refresh')}</span>
        </button>
      </div>
    </div>
  );
};

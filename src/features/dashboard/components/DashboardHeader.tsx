import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, BookOpen } from 'lucide-react';
import { useTranslation } from '../../../context/I18nContext';

interface DashboardHeaderProps {
  isTrainingAdmin: boolean | undefined;
  isLoading: boolean;
  onRefresh: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isTrainingAdmin,
  isLoading,
  onRefresh,
}) => {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
          {isTrainingAdmin ? t('admin.dashboard.title') : t('admin.dashboard.systemTitle')}
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '3px', marginBottom: 0 }}>
          {isTrainingAdmin
            ? t('admin.dashboard.subtitle')
            : t('admin.dashboard.systemSubtitle')}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px' }}
          title={t('admin.dashboard.refreshTitle')}
        >
          <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
          <span>{t('admin.dashboard.refresh')}</span>
        </button>
        {isTrainingAdmin && (
          <Link
            to="/admin/courses"
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px', background: '#0284c7' }}
          >
            <BookOpen size={13} />
            <span>{t('admin.dashboard.lmsStudioBtn')}</span>
          </Link>
        )}
      </div>
    </div>
  );
};

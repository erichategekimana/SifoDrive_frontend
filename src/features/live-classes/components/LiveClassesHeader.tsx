import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  List,
  RefreshCw,
  Users,
  Plus,
} from 'lucide-react';
import { useTranslation } from '../../../context/I18nContext';

interface LiveClassesHeaderProps {
  viewMode: 'CALENDAR' | 'TABLE';
  setViewMode: (mode: 'CALENDAR' | 'TABLE') => void;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenCohortModal: () => void;
  onOpenClassModal: () => void;
}

export const LiveClassesHeader: React.FC<LiveClassesHeaderProps> = ({
  viewMode,
  setViewMode,
  isLoading,
  onRefresh,
  onOpenCohortModal,
  onOpenClassModal,
}) => {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
      <div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          {t('admin.liveClasses.classesAndCohorts')}
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {t('admin.liveClasses.subtitle')}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link
          to="/admin/schedules"
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <CalendarIcon size={14} />
          <span>{t('admin.liveClasses.schedulesAndEvents')}</span>
        </Link>

        <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
          <button
            onClick={() => setViewMode('CALENDAR')}
            style={{
              background: viewMode === 'CALENDAR' ? 'var(--bg-surface)' : 'transparent',
              color: viewMode === 'CALENDAR' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '5px 10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <CalendarIcon size={13} />
            <span>{t('admin.liveClasses.calendar')}</span>
          </button>
          <button
            onClick={() => setViewMode('TABLE')}
            style={{
              background: viewMode === 'TABLE' ? 'var(--bg-surface)' : 'transparent',
              color: viewMode === 'TABLE' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '5px 10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <List size={13} />
            <span>{t('admin.liveClasses.table')}</span>
          </button>
        </div>

        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
          <span>{t('admin.liveClasses.refresh')}</span>
        </button>
        <button
          onClick={onOpenCohortModal}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Users size={14} />
          <span>{t('admin.liveClasses.newCohort')}</span>
        </button>
        <button
          onClick={onOpenClassModal}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} />
          <span>{t('admin.liveClasses.scheduleClass')}</span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { ExternalLink, Play, Square, Ban } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import type { LiveClassAdminItem } from '../../../core/services/AdminService';
import { useTranslation } from '../../../context/I18nContext';

interface LiveClassesTableViewProps {
  classes: LiveClassAdminItem[];
  onClassAction: (classId: string, action: 'START' | 'END' | 'CANCEL') => void;
}

export const LiveClassesTableView: React.FC<LiveClassesTableViewProps> = ({
  classes,
  onClassAction,
}) => {
  const { t } = useTranslation();

  return (
    <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {`${t('admin.liveClasses.allScheduledClasses')} (${classes.length})`}
        </h3>
      </div>

      {classes.length === 0 ? (
        <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          {t('admin.liveClasses.noClassesScheduled')}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {t('admin.liveClasses.topic')}
                </th>
                <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {t('admin.liveClasses.cohort')}
                </th>
                <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {t('admin.liveClasses.time')}
                </th>
                <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {t('admin.liveClasses.scheduledBy')}
                </th>
                <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {t('admin.liveClasses.status')}
                </th>
                <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>
                  {t('admin.liveClasses.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => {
                const dateDisplay = cls.scheduled_date
                  ? `${cls.scheduled_date} ${cls.start_time ? cls.start_time.slice(0, 5) : ''}`
                  : cls.scheduled_at
                  ? new Date(cls.scheduled_at).toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' })
                  : t('admin.liveClasses.scheduled');

                return (
                  <tr key={cls.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div>{cls.title}</div>
                      {cls.topic && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cls.topic}</div>}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                      {cls.cohort_name || t('admin.liveClasses.generalCohort')}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                      {dateDisplay}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {cls.created_by_name ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {cls.created_by_name}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {cls.created_by_role === 'TRAINING_ADMIN'
                              ? t('admin.liveClasses.roleTrainingAdmin')
                              : cls.created_by_role === 'SYSTEM_ADMIN'
                              ? t('admin.liveClasses.roleSystemAdmin')
                              : cls.created_by_role || t('admin.liveClasses.roleStaff')}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>System</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={cls.status === 'IN_PROGRESS' ? 'success' : cls.status === 'COMPLETED' ? 'neutral' : 'info'}>
                        {cls.status === 'IN_PROGRESS'
                          ? t('admin.liveClasses.inProgress')
                          : cls.status === 'COMPLETED'
                          ? t('admin.liveClasses.completed')
                          : t('admin.liveClasses.scheduled')}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {cls.meeting_link && (
                          <a
                            href={cls.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          >
                            <span>{t('admin.liveClasses.join')}</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                        {cls.status === 'SCHEDULED' && (
                          <button
                            onClick={() => onClassAction(cls.id, 'START')}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            title={t('admin.liveClasses.startSession')}
                          >
                            <Play size={12} />
                          </button>
                        )}
                        {cls.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => onClassAction(cls.id, 'END')}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            title={t('admin.liveClasses.endSession')}
                          >
                            <Square size={12} />
                          </button>
                        )}
                        {cls.status !== 'COMPLETED' && cls.status !== 'CANCELLED' && (
                          <button
                            onClick={() => onClassAction(cls.id, 'CANCEL')}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            title="Cancel session"
                          >
                            <Ban size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

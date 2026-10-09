import { X, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import type { LiveClassAdminItem } from '../../../core/services/AdminService';
import { useTranslation } from '../../../context/I18nContext';

interface ClassDetailModalProps {
  selectedClass: LiveClassAdminItem | null;
  onClose: () => void;
  onAction: (classId: string, action: 'START' | 'END' | 'CANCEL') => void;
  onEdit?: (cls: LiveClassAdminItem) => void;
  onDelete?: (classId: string) => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  selectedClass,
  onClose,
  onAction,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  if (!selectedClass) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        padding: '16px',
      }}
    >
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {t('admin.liveClasses.classDetailsModalTitle')}
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>{t('admin.liveClasses.topic')}</span>
            <strong style={{ color: 'var(--text-primary)' }}>{selectedClass.title}</strong>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>{t('admin.liveClasses.cohort')}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{selectedClass.cohort_name || t('admin.liveClasses.generalCohort')}</span>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>{t('admin.liveClasses.time')}</span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {selectedClass.scheduled_date} ({selectedClass.start_time?.slice(0, 5)} - {selectedClass.end_time?.slice(0, 5)})
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>{t('admin.liveClasses.scheduledBy')}</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {selectedClass.created_by_name || 'System Administrator'}
            </span>
            {selectedClass.created_by_role && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                Role: {selectedClass.created_by_role === 'TRAINING_ADMIN' ? t('admin.liveClasses.roleTrainingAdmin') : selectedClass.created_by_role}
              </span>
            )}
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>{t('admin.liveClasses.status')}</span>
            <Badge variant={selectedClass.status === 'IN_PROGRESS' ? 'success' : 'info'}>
              {selectedClass.status === 'IN_PROGRESS'
                ? t('admin.liveClasses.inProgress')
                : selectedClass.status === 'COMPLETED'
                ? t('admin.liveClasses.completed')
                : t('admin.liveClasses.scheduled')}
            </Badge>
          </div>

          {selectedClass.meeting_link && (
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>Meeting Link</span>
              <a
                href={selectedClass.meeting_link}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--primary-light)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
              >
                <span>{t('admin.liveClasses.openGoogleMeet')}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(selectedClass)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Edit2 size={13} />
                  <span>{t('admin.liveClasses.editClass')}</span>
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(selectedClass.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#DC2626', borderColor: 'rgba(220, 38, 38, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Trash2 size={13} />
                  <span>{t('admin.liveClasses.deleteClass')}</span>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {selectedClass.status === 'SCHEDULED' && (
                <button
                  onClick={() => onAction(selectedClass.id, 'START')}
                  className="btn btn-secondary btn-sm"
                >
                  {t('admin.liveClasses.startClass')}
                </button>
              )}
              {selectedClass.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => onAction(selectedClass.id, 'END')}
                  className="btn btn-secondary btn-sm"
                >
                  {t('admin.liveClasses.endClass')}
                </button>
              )}
              {selectedClass.status !== 'COMPLETED' && selectedClass.status !== 'CANCELLED' && (
                <button
                  onClick={() => onAction(selectedClass.id, 'CANCEL')}
                  className="btn btn-secondary btn-sm"
                >
                  {t('admin.liveClasses.cancelClass')}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary btn-sm"
              >
                {t('admin.liveClasses.close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

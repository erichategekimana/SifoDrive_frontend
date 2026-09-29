import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '../../../context/I18nContext';

interface CreateCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  cohortName: string;
  setCohortName: (v: string) => void;
  cohortStartDate: string;
  setCohortStartDate: (v: string) => void;
  cohortEndDate: string;
  setCohortEndDate: (v: string) => void;
  cohortDescription: string;
  setCohortDescription: (v: string) => void;
  isSubmitting: boolean;
}

export const CreateCohortModal: React.FC<CreateCohortModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  cohortName,
  setCohortName,
  cohortStartDate,
  setCohortStartDate,
  cohortEndDate,
  setCohortEndDate,
  cohortDescription,
  setCohortDescription,
  isSubmitting,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

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
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {t('admin.liveClasses.cohortModalTitle')}
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {t('admin.liveClasses.cohortNameLabel')}
            </label>
            <input
              type="text"
              required
              placeholder={t('admin.liveClasses.cohortNamePlaceholder')}
              value={cohortName}
              onChange={(e) => setCohortName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {t('admin.liveClasses.startDateLabel')}
              </label>
              <input
                type="date"
                required
                value={cohortStartDate}
                onChange={(e) => setCohortStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {t('admin.liveClasses.endDateLabel')}
              </label>
              <input
                type="date"
                required
                value={cohortEndDate}
                onChange={(e) => setCohortEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {t('admin.liveClasses.cohortDescLabel')}
              </label>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: cohortDescription.length > 165 ? 'var(--danger)' : 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                {cohortDescription.length} / 165
              </span>
            </div>
            <textarea
              maxLength={165}
              rows={3}
              placeholder={t('admin.liveClasses.cohortDescPlaceholder')}
              value={cohortDescription}
              onChange={(e) => setCohortDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              {t('admin.liveClasses.cancel')}
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-secondary btn-sm">
              {isSubmitting ? t('admin.liveClasses.creating') : t('admin.liveClasses.createCohort')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Lock, Unlock, Eye, EyeOff, Calendar, AlertCircle } from 'lucide-react';
import { TutorLmsService, type CohortModuleItem } from '../../../../core/services/TutorLmsService';
import { Badge } from '../../../../components/common/Badge';
import { useToast } from '../../../../context/ToastContext';

interface CohortModuleReleasePanelProps {
  cohortId: string;
  courseId: string;
  modules: CohortModuleItem[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export const CohortModuleReleasePanel: React.FC<CohortModuleReleasePanelProps> = ({
  cohortId,
  courseId: _courseId,
  modules,
  isLoading,
  onRefresh,
}) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const handleTogglePublish = async (mod: CohortModuleItem) => {
    setUpdatingId(mod.id);
    try {
      const nextPublished = !mod.is_published;
      await TutorLmsService.getInstance().updateCohortModuleRelease(cohortId, mod.id, {
        is_published: nextPublished,
      });
      success(`Module "${mod.title}" is now ${nextPublished ? 'released' : 'hidden'} for this cohort.`);
      await onRefresh();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update module release.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleLock = async (mod: CohortModuleItem) => {
    setUpdatingId(mod.id);
    try {
      const nextLocked = !mod.is_locked;
      await TutorLmsService.getInstance().updateCohortModuleRelease(cohortId, mod.id, {
        is_locked: nextLocked,
      });
      success(`Module "${mod.title}" is now ${nextLocked ? 'locked' : 'unlocked'} for this cohort.`);
      await onRefresh();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update module lock status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading cohort modules...
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No modules found in this course. Modules are defined under the curriculum course.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          padding: '14px 18px',
          background: 'rgba(0, 85, 165, 0.08)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(0, 85, 165, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.84rem',
          color: 'var(--text-secondary)',
        }}
      >
        <AlertCircle size={16} color="#38bdf8" />
        <span>
          As an accredited facilitator, you control learning pace for this specific cohort. Release modules when students are ready, or lock upcoming material until in-person review is completed.
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
              <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600, width: '70px' }}>Order</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Module Title</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Course Default</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Cohort Visibility</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Access Lock</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((mod) => {
              const isBusy = updatingId === mod.id;

              return (
                <tr key={mod.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>
                    #{mod.order}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{mod.title}</div>
                    {mod.unlock_date && (
                      <div style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                        <Calendar size={12} />
                        Auto-unlocks: {new Date(mod.unlock_date).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant={mod.is_default_published ? 'neutral' : 'neutral'}>
                      {mod.is_default_published ? 'Default Visible' : 'Default Hidden'}
                    </Badge>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        background: mod.is_published ? 'rgba(5, 135, 40, 0.12)' : 'rgba(209, 56, 56, 0.12)',
                        color: mod.is_published ? '#058728' : '#d13838',
                        border: `1px solid ${mod.is_published ? 'rgba(5, 135, 40, 0.3)' : 'rgba(209, 56, 56, 0.3)'}`,
                      }}
                    >
                      {mod.is_published ? 'Released to Cohort' : 'Hidden for Cohort'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        background: mod.is_locked ? 'rgba(245, 158, 11, 0.12)' : 'rgba(3, 116, 181, 0.12)',
                        color: mod.is_locked ? '#f59e0b' : '#38bdf8',
                        border: `1px solid ${mod.is_locked ? 'rgba(245, 158, 11, 0.3)' : 'rgba(3, 116, 181, 0.3)'}`,
                      }}
                    >
                      {mod.is_locked ? 'Locked' : 'Unlocked'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => handleTogglePublish(mod)}
                        disabled={isBusy}
                        className={`btn btn-sm ${mod.is_published ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}
                      >
                        {mod.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                        <span>{mod.is_published ? 'Hide' : 'Release'}</span>
                      </button>

                      <button
                        onClick={() => handleToggleLock(mod)}
                        disabled={isBusy}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}
                      >
                        {mod.is_locked ? <Unlock size={14} color="#38bdf8" /> : <Lock size={14} color="#f59e0b" />}
                        <span>{mod.is_locked ? 'Unlock' : 'Lock'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

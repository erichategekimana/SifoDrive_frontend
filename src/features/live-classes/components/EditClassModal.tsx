import React, { useState } from 'react';
import { X, Trash2, Video, Calendar, Clock } from 'lucide-react';
import type { CohortItem } from '../../../core/services/AdminService';
import { useTranslation } from '../../../context/I18nContext';

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (classId: string) => void;
  cohorts: CohortItem[];
  classId: string;
  classTitle: string;
  setClassTitle: (v: string) => void;
  classTopic: string;
  setClassTopic: (v: string) => void;
  classCohortId: string;
  setClassCohortId: (v: string) => void;
  classScheduledDate: string;
  setClassScheduledDate: (v: string) => void;
  classStartTime: string;
  setClassStartTime: (v: string) => void;
  classEndTime: string;
  setClassEndTime: (v: string) => void;
  classMeetLink: string;
  setClassMeetLink: (v: string) => void;
  classStatus: string;
  setClassStatus: (v: string) => void;
  isSubmitting: boolean;
}

export const EditClassModal: React.FC<EditClassModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  cohorts,
  classId,
  classTitle,
  setClassTitle,
  classTopic,
  setClassTopic,
  classCohortId,
  setClassCohortId,
  classScheduledDate,
  setClassScheduledDate,
  classStartTime,
  setClassStartTime,
  classEndTime,
  setClassEndTime,
  classMeetLink,
  setClassMeetLink,
  classStatus,
  setClassStatus,
  isSubmitting,
}) => {
  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState(false);

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
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {t('admin.liveClasses.editClassModalTitle')}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Update schedule timing, cohort allocation, Google Meet conference link, and session status.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {t('admin.liveClasses.classTitleLabel')} *
            </label>
            <input
              type="text"
              required
              value={classTitle}
              onChange={(e) => setClassTitle(e.target.value)}
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

          {/* Topic / Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {t('admin.liveClasses.topic')} (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Priority Rules at Intersections & Roundabouts"
              value={classTopic}
              onChange={(e) => setClassTopic(e.target.value)}
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

          {/* Cohort selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {t('admin.liveClasses.assignedCohortLabel')}
            </label>
            <select
              value={classCohortId}
              onChange={(e) => setClassCohortId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
            >
              <option value="">{t('admin.liveClasses.openToAllEnrolled')}</option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.student_count ?? 0} {t('admin.liveClasses.students')})
                  {c.primary_tutor ? ` • Tutor: ${c.primary_tutor.full_name}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Session Date */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} /> {t('admin.liveClasses.sessionDateLabel')} *
              </span>
            </label>
            <input
              type="date"
              required
              value={classScheduledDate}
              onChange={(e) => setClassScheduledDate(e.target.value)}
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

          {/* Time Range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> {t('admin.liveClasses.startTimeLabel')} *
                </span>
              </label>
              <input
                type="time"
                required
                value={classStartTime}
                onChange={(e) => setClassStartTime(e.target.value)}
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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> {t('admin.liveClasses.endTimeLabel')} *
                </span>
              </label>
              <input
                type="time"
                required
                value={classEndTime}
                onChange={(e) => setClassEndTime(e.target.value)}
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

          {/* Google Meet Link */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Video size={13} /> Google Meet URL *
              </span>
            </label>
            <input
              type="url"
              required
              placeholder="https://meet.google.com/xxx-yyyy-zzz"
              value={classMeetLink}
              onChange={(e) => setClassMeetLink(e.target.value)}
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
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
              Training admin creates the Google Meet link and grants hosting access to the assigned tutor.
            </span>
          </div>

          {/* Status */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {t('admin.liveClasses.status')}
            </label>
            <select
              value={classStatus}
              onChange={(e) => setClassStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
            >
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Delete confirmation or Action Buttons */}
          {confirmDelete ? (
            <div
              style={{
                marginTop: '12px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: '#EF4444', fontWeight: 600 }}>
                {t('admin.liveClasses.deleteConfirm')}
              </span>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem' }}
                >
                  {t('admin.liveClasses.cancel')}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onDelete(classId)}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={13} style={{ marginRight: '4px' }} />
                  Confirm Delete
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="btn btn-secondary btn-sm"
                style={{
                  color: '#DC2626',
                  borderColor: 'rgba(220, 38, 38, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Trash2 size={13} />
                <span>{t('admin.liveClasses.deleteClass')}</span>
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
                  {t('admin.liveClasses.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-secondary btn-sm"
                  style={{ fontWeight: 600 }}
                >
                  {isSubmitting ? t('admin.liveClasses.saving') : t('admin.liveClasses.saveChanges')}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

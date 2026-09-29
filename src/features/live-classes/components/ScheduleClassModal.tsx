import React from 'react';
import { X } from 'lucide-react';
import type { CohortItem } from '../../../core/services/AdminService';
import { useTranslation } from '../../../context/I18nContext';

interface ScheduleClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  cohorts: CohortItem[];
  scheduleMode: 'SINGLE' | 'RECURRING';
  setScheduleMode: (m: 'SINGLE' | 'RECURRING') => void;
  classTitle: string;
  setClassTitle: (v: string) => void;
  classCohortId: string;
  setClassCohortId: (v: string) => void;
  recurringDay: number;
  setRecurringDay: (d: number) => void;
  recurringPeriodMonths: number;
  setRecurringPeriodMonths: (m: number) => void;
  recurringStartDate: string;
  setRecurringStartDate: (v: string) => void;
  singleDate: string;
  setSingleDate: (v: string) => void;
  classStartTime: string;
  setClassStartTime: (v: string) => void;
  classEndTime: string;
  setClassEndTime: (v: string) => void;
  classMeetLink: string;
  setClassMeetLink: (v: string) => void;
  isSubmitting: boolean;
  dayOptions: { value: number; label: string }[];
  periodOptions: { value: number; label: string }[];
}

export const ScheduleClassModal: React.FC<ScheduleClassModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  cohorts,
  scheduleMode,
  setScheduleMode,
  classTitle,
  setClassTitle,
  classCohortId,
  setClassCohortId,
  recurringDay,
  setRecurringDay,
  recurringPeriodMonths,
  setRecurringPeriodMonths,
  recurringStartDate,
  setRecurringStartDate,
  singleDate,
  setSingleDate,
  classStartTime,
  setClassStartTime,
  classEndTime,
  setClassEndTime,
  classMeetLink,
  setClassMeetLink,
  isSubmitting,
  dayOptions,
  periodOptions,
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
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {t('admin.liveClasses.scheduleClassModalTitle')}
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Mode Switcher: Recurring vs Single */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            padding: '3px',
            background: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
          }}
        >
          <button
            type="button"
            onClick={() => setScheduleMode('RECURRING')}
            style={{
              background: scheduleMode === 'RECURRING' ? 'var(--bg-surface)' : 'transparent',
              color: scheduleMode === 'RECURRING' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('admin.liveClasses.recurringSeries')}
          </button>
          <button
            type="button"
            onClick={() => setScheduleMode('SINGLE')}
            style={{
              background: scheduleMode === 'SINGLE' ? 'var(--bg-surface)' : 'transparent',
              color: scheduleMode === 'SINGLE' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('admin.liveClasses.singleSession')}
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {t('admin.liveClasses.classTitleLabel')}
            </label>
            <input
              type="text"
              required
              placeholder={t('admin.liveClasses.classTitlePlaceholder')}
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
                </option>
              ))}
            </select>
          </div>

          {scheduleMode === 'RECURRING' ? (
            <>
              {/* Day of Week & Period Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {t('admin.liveClasses.weeklyCadenceLabel')}
                  </label>
                  <select
                    value={recurringDay}
                    onChange={(e) => setRecurringDay(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                    }}
                  >
                    {dayOptions.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {t('admin.liveClasses.recurrencePeriodLabel')}
                  </label>
                  <select
                    value={recurringPeriodMonths}
                    onChange={(e) => setRecurringPeriodMonths(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                    }}
                  >
                    {periodOptions.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  {t('admin.liveClasses.startRecurrenceFromLabel')}
                </label>
                <input
                  type="date"
                  required
                  value={recurringStartDate}
                  onChange={(e) => setRecurringStartDate(e.target.value)}
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
            </>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {t('admin.liveClasses.sessionDateLabel')}
              </label>
              <input
                type="date"
                required
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
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
          )}

          {/* Time Range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {t('admin.liveClasses.startTimeLabel')}
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
                {t('admin.liveClasses.endTimeLabel')}
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
              {t('admin.liveClasses.googleMeetLinkLabel')}
            </label>
            <input
              type="url"
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
          </div>

          {/* Summary note for recurring */}
          {scheduleMode === 'RECURRING' && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
              }}
            >
              {t('admin.liveClasses.cadence')}{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {dayOptions.find((d) => d.value === recurringDay)?.label} at {classStartTime}
              </strong>{' '}
              {t('admin.liveClasses.forMonths')} <strong style={{ color: 'var(--text-primary)' }}>{recurringPeriodMonths} {t('admin.liveClasses.months')}</strong>.{' '}
              {t('admin.liveClasses.sessionsAutoPopulate')}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              {t('admin.liveClasses.cancel')}
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-secondary btn-sm">
              {isSubmitting ? t('admin.liveClasses.scheduling') : t('admin.liveClasses.scheduleClass')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

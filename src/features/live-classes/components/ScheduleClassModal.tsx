import React, { useMemo } from 'react';
import { X, Calendar, Video, Clock } from 'lucide-react';
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

  // Multiple days in a week
  recurringDays?: number[];
  setRecurringDays?: (days: number[]) => void;
  recurringDay?: number;
  setRecurringDay?: (d: number) => void;

  // Recurrence Period 1 - 12 and Unit (Months / Years)
  recurringPeriodValue?: number;
  setRecurringPeriodValue?: (v: number) => void;
  recurringPeriodUnit?: 'months' | 'years';
  setRecurringPeriodUnit?: (u: 'months' | 'years') => void;
  recurringPeriodMonths?: number;

  // Dates
  recurringStartDate: string;
  setRecurringStartDate: (v: string) => void;
  recurringEndDate?: string;
  setRecurringEndDate?: (v: string) => void;
  onStartDateChange?: (v: string) => void;
  onPeriodValueChange?: (v: number) => void;
  onPeriodUnitChange?: (u: 'months' | 'years') => void;

  // Single Session
  singleDate: string;
  setSingleDate: (v: string) => void;
  classStartTime: string;
  setClassStartTime: (v: string) => void;
  classEndTime: string;
  setClassEndTime: (v: string) => void;
  classMeetLink: string;
  setClassMeetLink: (v: string) => void;
  isSubmitting: boolean;
  dayOptions?: { value: number; label: string }[];
  periodOptions?: { value: number; label: string }[];
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
  recurringDays,
  setRecurringDays,
  recurringDay = 1,
  setRecurringDay,
  recurringPeriodValue = 3,
  setRecurringPeriodValue,
  recurringPeriodUnit = 'months',
  setRecurringPeriodUnit,
  recurringPeriodMonths = 3,
  recurringStartDate,
  setRecurringStartDate,
  recurringEndDate,
  setRecurringEndDate,
  onStartDateChange,
  onPeriodValueChange,
  onPeriodUnitChange,
  singleDate,
  setSingleDate,
  classStartTime,
  setClassStartTime,
  classEndTime,
  setClassEndTime,
  classMeetLink,
  setClassMeetLink,
  isSubmitting,
  dayOptions: _dayOptions,
}) => {
  const { t } = useTranslation();

  const defaultDayList = useMemo(() => [
    { value: 0, short: t('admin.liveClasses.weekdays.mon') || 'Mon', label: t('admin.liveClasses.dayNames.mon') || 'Monday' },
    { value: 1, short: t('admin.liveClasses.weekdays.tue') || 'Tue', label: t('admin.liveClasses.dayNames.tue') || 'Tuesday' },
    { value: 2, short: t('admin.liveClasses.weekdays.wed') || 'Wed', label: t('admin.liveClasses.dayNames.wed') || 'Wednesday' },
    { value: 3, short: t('admin.liveClasses.weekdays.thu') || 'Thu', label: t('admin.liveClasses.dayNames.thu') || 'Thursday' },
    { value: 4, short: t('admin.liveClasses.weekdays.fri') || 'Fri', label: t('admin.liveClasses.dayNames.fri') || 'Friday' },
    { value: 5, short: t('admin.liveClasses.weekdays.sat') || 'Sat', label: t('admin.liveClasses.dayNames.sat') || 'Saturday' },
    { value: 6, short: t('admin.liveClasses.weekdays.sun') || 'Sun', label: t('admin.liveClasses.dayNames.sun') || 'Sunday' },
  ], [t]);

  // Active days state normalization
  const activeDays: number[] = useMemo(() => {
    if (recurringDays && recurringDays.length > 0) return recurringDays;
    return typeof recurringDay === 'number' ? [recurringDay] : [1];
  }, [recurringDays, recurringDay]);

  const handleToggleDay = (dayValue: number) => {
    if (!setRecurringDays) {
      if (setRecurringDay) setRecurringDay(dayValue);
      return;
    }
    if (activeDays.includes(dayValue)) {
      setRecurringDays(activeDays.filter((d) => d !== dayValue));
    } else {
      setRecurringDays([...activeDays, dayValue].sort((a, b) => a - b));
    }
  };

  if (!isOpen) return null;

  const currentPeriodVal = recurringPeriodValue ?? recurringPeriodMonths ?? 3;
  const currentPeriodUnit = recurringPeriodUnit ?? 'months';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(6px)',
        padding: '24px 16px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '820px',
          padding: '30px 36px',
          borderRadius: 'var(--radius-xl)',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border-subtle)',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-primary-500, #3b82f6)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Video size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {t('admin.liveClasses.scheduleClassModalTitle')}
              </h3>
            </div>
            <p style={{ margin: '4px 0 0 46px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Configure cohort study schedules, recurring weekly sessions, and meeting credentials.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Switcher: Recurring vs Single */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            padding: '4px',
            background: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '20px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => setScheduleMode('RECURRING')}
            style={{
              background: scheduleMode === 'RECURRING' ? 'var(--bg-surface)' : 'transparent',
              color: scheduleMode === 'RECURRING' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              fontWeight: scheduleMode === 'RECURRING' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: scheduleMode === 'RECURRING' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Calendar size={16} />
            <span>{t('admin.liveClasses.recurringSeries')}</span>
          </button>
          <button
            type="button"
            onClick={() => setScheduleMode('SINGLE')}
            style={{
              background: scheduleMode === 'SINGLE' ? 'var(--bg-surface)' : 'transparent',
              color: scheduleMode === 'SINGLE' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              fontWeight: scheduleMode === 'SINGLE' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: scheduleMode === 'SINGLE' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Clock size={16} />
            <span>{t('admin.liveClasses.singleSession')}</span>
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Row 1: Class Title & Assigned Cohort */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
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
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {t('admin.liveClasses.assignedCohortLabel')}
              </label>
              <select
                value={classCohortId}
                onChange={(e) => setClassCohortId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
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
          </div>

          {scheduleMode === 'RECURRING' ? (
            <>
              {/* Weekly Cadence Section: Multi-Day Selector */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {t('admin.liveClasses.weeklyCadenceLabel')}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setRecurringDays?.([0, 1, 2, 3, 4])}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '2px 6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--color-primary-500, #3b82f6)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                        textDecoration: 'underline',
                      }}
                    >
                      {t('admin.liveClasses.allWeekdays')}
                    </button>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
                    <button
                      type="button"
                      onClick={() => setRecurringDays?.([0, 1, 2, 3, 4, 5, 6])}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '2px 6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--color-primary-500, #3b82f6)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                        textDecoration: 'underline',
                      }}
                    >
                      {t('admin.liveClasses.daily')}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '8px',
                  }}
                >
                  {defaultDayList.map((d) => {
                    const isSelected = activeDays.includes(d.value);
                    return (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => handleToggleDay(d.value)}
                        title={d.label}
                        style={{
                          padding: '10px 4px',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '1.5px solid var(--color-primary-500, #3b82f6)' : '1px solid var(--border-subtle)',
                          background: isSelected ? 'var(--color-primary-500, #3b82f6)' : 'var(--bg-surface)',
                          color: isSelected ? '#ffffff' : 'var(--text-primary)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.25)' : 'none',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '52px',
                        }}
                      >
                        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{d.short}</span>
                        <span
                          style={{
                            fontSize: '0.66rem',
                            opacity: isSelected ? 0.95 : 0.65,
                            marginTop: '2px',
                            lineHeight: 1.1,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%',
                          }}
                        >
                          {d.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {activeDays.length === 0 && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-danger-500, #ef4444)', marginTop: '8px', fontWeight: 600 }}>
                    {t('admin.liveClasses.selectDaysRequired')}
                  </div>
                )}
              </div>

              {/* Recurrence Period & Recurrence Dates Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
                {/* Recurrence Period: 1 - 12 & Months/Years */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('admin.liveClasses.recurrencePeriodLabel')}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <select
                      value={currentPeriodVal}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (onPeriodValueChange) onPeriodValueChange(val);
                        else setRecurringPeriodValue?.(val);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>

                    <select
                      value={currentPeriodUnit}
                      onChange={(e) => {
                        const unit = e.target.value as 'months' | 'years';
                        if (onPeriodUnitChange) onPeriodUnitChange(unit);
                        else setRecurringPeriodUnit?.(unit);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                      }}
                    >
                      <option value="months">
                        {currentPeriodVal === 1 ? t('admin.liveClasses.month') : t('admin.liveClasses.periodUnitMonths')}
                      </option>
                      <option value="years">
                        {currentPeriodVal === 1 ? t('admin.liveClasses.year') : t('admin.liveClasses.years')}
                      </option>
                    </select>
                  </div>
                </div>

                {/* Start Recurrence Date & End Recurrence Date */}
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        {t('admin.liveClasses.startRecurrenceFromLabel')}
                      </label>
                      <input
                        type="date"
                        required
                        value={recurringStartDate}
                        onChange={(e) => {
                          if (onStartDateChange) onStartDateChange(e.target.value);
                          else setRecurringStartDate(e.target.value);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          fontSize: '0.88rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        {t('admin.liveClasses.endRecurrenceDateLabel')}
                      </label>
                      <input
                        type="date"
                        required
                        min={recurringStartDate}
                        value={recurringEndDate || ''}
                        onChange={(e) => setRecurringEndDate?.(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          fontSize: '0.88rem',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {t('admin.liveClasses.sessionDateLabel')}
              </label>
              <input
                type="date"
                required
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '380px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                }}
              />
            </div>
          )}

          {/* Time Range & Google Meet Link Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('admin.liveClasses.startTimeLabel')}
                  </label>
                  <input
                    type="time"
                    required
                    value={classStartTime}
                    onChange={(e) => setClassStartTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('admin.liveClasses.endTimeLabel')}
                  </label>
                  <input
                    type="time"
                    required
                    value={classEndTime}
                    onChange={(e) => setClassEndTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {t('admin.liveClasses.googleMeetLinkLabel')}
              </label>
              <input
                type="url"
                placeholder="https://meet.google.com/xxx-yyyy-zzz"
                value={classMeetLink}
                onChange={(e) => setClassMeetLink(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                }}
              />
            </div>
          </div>

          {/* Summary note for recurring */}
          {scheduleMode === 'RECURRING' && (
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={15} style={{ color: 'var(--color-primary-500, #3b82f6)' }} />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t('admin.liveClasses.cadence')}</span>
                <strong style={{ color: 'var(--color-primary-500, #3b82f6)' }}>
                  {activeDays
                    .map((d) => defaultDayList.find((opt) => opt.value === d)?.short || `Day ${d}`)
                    .join(', ')}{' '}
                  at {classStartTime} – {classEndTime}
                </strong>
              </div>
              <div style={{ fontSize: '0.8rem' }}>
                From <strong style={{ color: 'var(--text-primary)' }}>{recurringStartDate || '...'}</strong> to{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{recurringEndDate || '...'}</strong>{' '}
                ({currentPeriodVal}{' '}
                {currentPeriodUnit === 'years'
                  ? currentPeriodVal > 1
                    ? t('admin.liveClasses.years')
                    : t('admin.liveClasses.year')
                  : t('admin.liveClasses.months')}
                ).
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('admin.liveClasses.sessionsAutoPopulate')}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '10px 20px', fontSize: '0.88rem' }}
            >
              {t('admin.liveClasses.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (scheduleMode === 'RECURRING' && activeDays.length === 0)}
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.88rem', fontWeight: 700 }}
            >
              {isSubmitting ? t('admin.liveClasses.scheduling') : t('admin.liveClasses.scheduleClass')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Play,
  Square,
  Ban,
  RefreshCw,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Video,
} from 'lucide-react';
import {
  AdminService,
  type CohortItem,
  type LiveClassAdminItem,
} from '../../core/services/AdminService';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/I18nContext';

export const AdminSchedulesPage: React.FC = () => {
  const { t } = useTranslation();

  const dayOptions = useMemo(() => [
    { value: 0, label: t('admin.liveClasses.dayOptions.monday') },
    { value: 1, label: t('admin.liveClasses.dayOptions.tuesday') },
    { value: 2, label: t('admin.liveClasses.dayOptions.wednesday') },
    { value: 3, label: t('admin.liveClasses.dayOptions.thursday') },
    { value: 4, label: t('admin.liveClasses.dayOptions.friday') },
    { value: 5, label: t('admin.liveClasses.dayOptions.saturday') },
    { value: 6, label: t('admin.liveClasses.dayOptions.sunday') },
  ], [t]);

  const periodOptions = useMemo(() => [
    { value: 1, label: t('admin.liveClasses.periodOptions.oneMonth') },
    { value: 2, label: t('admin.liveClasses.periodOptions.twoMonths') },
    { value: 3, label: t('admin.liveClasses.periodOptions.threeMonths') },
    { value: 6, label: t('admin.liveClasses.periodOptions.sixMonths') },
  ], [t]);

  const weekdaysList = useMemo(() => [
    { key: 'mon', label: t('admin.liveClasses.weekdays.mon') },
    { key: 'tue', label: t('admin.liveClasses.weekdays.tue') },
    { key: 'wed', label: t('admin.liveClasses.weekdays.wed') },
    { key: 'thu', label: t('admin.liveClasses.weekdays.thu') },
    { key: 'fri', label: t('admin.liveClasses.weekdays.fri') },
    { key: 'sat', label: t('admin.liveClasses.weekdays.sat') },
    { key: 'sun', label: t('admin.liveClasses.weekdays.sun') },
  ], [t]);

  const [classes, setClasses] = useState<LiveClassAdminItem[]>([]);
  const [cohorts, setCohorts] = useState<CohortItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Calendar State
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<LiveClassAdminItem | null>(null);

  // Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState<boolean>(false);

  // Class Scheduling State
  const [scheduleMode, setScheduleMode] = useState<'SINGLE' | 'RECURRING'>('RECURRING');
  const [classTitle, setClassTitle] = useState<string>('');
  const [classCohortId, setClassCohortId] = useState<string>('');
  const [classStartTime, setClassStartTime] = useState<string>('14:00');
  const [classEndTime, setClassEndTime] = useState<string>('15:30');
  const [classMeetLink, setClassMeetLink] = useState<string>('');
  const [classTopic, setClassTopic] = useState<string>('');

  // Single Session Specific
  const [singleDate, setSingleDate] = useState<string>('');

  // Recurring Schedule Specific (e.g. Each Tuesday 2pm for 3 months)
  const [recurringDay, setRecurringDay] = useState<number>(1); // Tuesday
  const [recurringStartDate, setRecurringStartDate] = useState<string>('');
  const [recurringPeriodMonths, setRecurringPeriodMonths] = useState<number>(3);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminService = AdminService.getInstance();
  const { success, warning, error: toastError } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [classesRes, cohortsRes] = await Promise.allSettled([
        adminService.getLiveClasses(),
        adminService.getCohorts(),
      ]);

      if (classesRes.status === 'fulfilled') setClasses(classesRes.value);
      if (cohortsRes.status === 'fulfilled') setCohorts(cohortsRes.value);
    } catch (err) {
      console.error('Failed loading schedules and events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const todayStr = new Date().toISOString().split('T')[0];
    setSingleDate(todayStr);
    setRecurringStartDate(todayStr);
  }, []);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classTitle.trim()) {
      warning('Class title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (scheduleMode === 'SINGLE') {
        if (!singleDate) {
          warning('Please select a scheduled date.');
          setIsSubmitting(false);
          return;
        }

        const scheduledAt = `${singleDate}T${classStartTime}:00`;
        const [sh, sm] = classStartTime.split(':').map(Number);
        const [eh, em] = classEndTime.split(':').map(Number);
        const durationMin = (eh * 60 + em) - (sh * 60 + sm) || 60;

        await adminService.createLiveClass({
          title: classTitle.trim(),
          cohort_id: classCohortId || undefined,
          scheduled_at: scheduledAt,
          duration_minutes: durationMin > 0 ? durationMin : 60,
          meeting_link: classMeetLink.trim() || undefined,
        });

        success(`Scheduled session "${classTitle}".`);
      } else {
        if (!recurringStartDate) {
          warning('Please pick a start date for the recurring series.');
          setIsSubmitting(false);
          return;
        }

        const res = await adminService.scheduleRecurringClasses({
          title: classTitle.trim(),
          cohort: classCohortId || undefined,
          day_of_week: recurringDay,
          start_time: classStartTime,
          end_time: classEndTime,
          start_date: recurringStartDate,
          period_months: recurringPeriodMonths,
          google_meet_url: classMeetLink.trim() || undefined,
          topic: classTopic.trim() || classTitle.trim(),
        });

        success(res.message || `Scheduled ${res.created_classes_count} recurring classes over ${recurringPeriodMonths} months.`);
      }

      setIsClassModalOpen(false);
      setClassTitle('');
      setClassTopic('');
      setClassCohortId('');
      setClassMeetLink('');
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Could not schedule live class series.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartClass = async (classId: string) => {
    try {
      await adminService.startLiveClass(classId);
      success('Class marked IN_PROGRESS.');
      loadData();
      if (selectedClass?.id === classId) {
        setSelectedClass((prev) => (prev ? { ...prev, status: 'IN_PROGRESS' } : null));
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed starting class.');
    }
  };

  const handleEndClass = async (classId: string) => {
    try {
      await adminService.endLiveClass(classId);
      success('Class completed.');
      loadData();
      if (selectedClass?.id === classId) {
        setSelectedClass((prev) => (prev ? { ...prev, status: 'COMPLETED' } : null));
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed ending class.');
    }
  };

  const handleCancelClass = async (classId: string) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled session?')) return;
    try {
      await adminService.cancelLiveClass(classId);
      success('Class cancelled.');
      loadData();
      if (selectedClass?.id === classId) {
        setSelectedClass((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed cancelling class.');
    }
  };

  // Calendar calculations
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday -> 6

    const daysInMonth = lastDay.getDate();

    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        dateString: new Date(year, month - 1, prevMonthLastDay - i).toISOString().split('T')[0],
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        dateString: dateStr,
      });
    }

    const remaining = (7 - (days.length % 7)) % 7;
    for (let j = 1; j <= remaining; j++) {
      days.push({
        day: j,
        isCurrentMonth: false,
        dateString: new Date(year, month + 1, j).toISOString().split('T')[0],
      });
    }

    return days;
  }, [year, month]);

  const classesByDate = useMemo(() => {
    const map = new Map<string, LiveClassAdminItem[]>();
    for (const c of classes) {
      let dateKey = c.scheduled_date;
      if (!dateKey && c.scheduled_at) {
        dateKey = c.scheduled_at.split('T')[0];
      }
      if (dateKey) {
        const existing = map.get(dateKey) || [];
        existing.push(c);
        map.set(dateKey, existing);
      }
    }
    return map;
  }, [classes]);

  const handleDayClick = (dateString: string) => {
    setSingleDate(dateString);
    setRecurringStartDate(dateString);
    const dayOfWeek = (new Date(dateString).getDay() + 6) % 7;
    setRecurringDay(dayOfWeek);
    setIsClassModalOpen(true);
  };

  const nextMonth = () => setCalendarDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const todayMonth = () => setCalendarDate(new Date());

  const monthName = calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            {t('admin.liveClasses.schedulesAndEvents')}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t('admin.liveClasses.subtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Button directing to where we manage live classes too */}
          <Link
            to="/admin/live-classes"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Video size={14} />
            <span>{t('admin.liveClasses.classesAndCohorts')}</span>
          </Link>

          <button
            onClick={loadData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Refresh schedules"
          >
            <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
            <span>{t('admin.liveClasses.refresh')}</span>
          </button>

          <button
            onClick={() => setIsClassModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} />
            <span>{t('admin.liveClasses.scheduleClass')}</span>
          </button>
        </div>
      </div>

      {/* Interactive Platform Calendar View */}
      <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
        {/* Calendar Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {monthName}
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>
              Kigali CAT (UTC+2)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={prevMonth}
              className="btn btn-secondary btn-sm"
              style={{ padding: '5px 8px' }}
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={todayMonth}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem', padding: '5px 10px' }}
            >
              {t('admin.liveClasses.today')}
            </button>
            <button
              onClick={nextMonth}
              className="btn btn-secondary btn-sm"
              style={{ padding: '5px 8px' }}
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Spinner message="Loading timetable & sessions..." />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* Weekday Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '4px' }}>
              {weekdaysList.map((w) => (
                <div key={w.key} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '6px 0' }}>
                  {w.label}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              {calendarDays.map((dayObj, idx) => {
                const dayClasses = classesByDate.get(dayObj.dateString) || [];
                return (
                  <div
                    key={`${dayObj.dateString}-${idx}`}
                    style={{
                      minHeight: '115px',
                      background: dayObj.isToday
                        ? 'rgba(59, 130, 246, 0.05)'
                        : dayObj.isCurrentMonth
                        ? 'var(--bg-surface)'
                        : 'rgba(0, 0, 0, 0.02)',
                      border: dayObj.isToday
                        ? '2px solid var(--primary)'
                        : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      opacity: dayObj.isCurrentMonth ? 1 : 0.45,
                      transition: 'border-color var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: dayObj.isToday ? 800 : 600,
                          color: dayObj.isToday ? 'var(--primary)' : 'var(--text-primary)',
                        }}
                      >
                        {dayObj.day}
                      </span>

                      {dayObj.isCurrentMonth && (
                        <button
                          onClick={() => handleDayClick(dayObj.dateString)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '2px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title={`Schedule class on ${dayObj.dateString}`}
                        >
                          <Plus size={12} />
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', maxHeight: '90px' }}>
                      {dayClasses.map((cls) => {
                        const isLive = cls.status === 'IN_PROGRESS';
                        return (
                          <div
                            key={cls.id}
                            onClick={() => setSelectedClass(cls)}
                            style={{
                              padding: '4px 6px',
                              borderRadius: 'var(--radius-sm)',
                              background: isLive
                                ? 'rgba(34, 197, 94, 0.15)'
                                : cls.status === 'COMPLETED'
                                ? 'rgba(156, 163, 175, 0.12)'
                                : 'rgba(59, 130, 246, 0.1)',
                              borderLeft: `3px solid ${
                                isLive ? 'var(--success)' : cls.status === 'COMPLETED' ? 'var(--text-muted)' : 'var(--primary)'
                              }`,
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '1px',
                            }}
                            title={`${cls.title} (${cls.start_time || ''}) - Click for details`}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2px' }}>
                              <span style={{ fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {cls.start_time ? cls.start_time.slice(0, 5) : 'Class'}
                              </span>
                              {isLive && (
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
                              )}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {cls.title}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Class Details Modal */}
      {selectedClass && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={() => setSelectedClass(null)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedClass.title}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Session details and lifecycle controls.
                </p>
              </div>
              <button
                onClick={() => setSelectedClass(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <Badge
                  variant={
                    selectedClass.status === 'IN_PROGRESS'
                      ? 'success'
                      : selectedClass.status === 'COMPLETED'
                      ? 'neutral'
                      : selectedClass.status === 'CANCELLED'
                      ? 'danger'
                      : 'info'
                  }
                >
                  {selectedClass.status}
                </Badge>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cohort:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedClass.cohort_name || 'General Cohort'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Instructor:</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {selectedClass.tutor_name || 'Assigned Instructor'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Scheduled Time:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {selectedClass.scheduled_date || selectedClass.scheduled_at?.split('T')[0]} &bull; {selectedClass.start_time || '14:00'} - {selectedClass.end_time || '15:30'} CAT
                </span>
              </div>

              {selectedClass.meeting_link && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Google Meet:</span>
                  <a
                    href={selectedClass.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', padding: '3px 8px' }}
                  >
                    <span>Launch Meet</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                {selectedClass.status === 'SCHEDULED' && (
                  <button
                    onClick={() => handleStartClass(selectedClass.id)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Play size={13} />
                    <span>Start Session</span>
                  </button>
                )}

                {selectedClass.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleEndClass(selectedClass.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--success)' }}
                  >
                    <Square size={13} />
                    <span>End Session</span>
                  </button>
                )}

                {selectedClass.status !== 'COMPLETED' && selectedClass.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleCancelClass(selectedClass.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--danger)' }}
                  >
                    <Ban size={13} />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Scheduling Modal (Single & Recurring with Period) */}
      {isClassModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={() => setIsClassModalOpen(false)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '540px',
              padding: '24px',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Schedule Live Class
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Configure single session or automated recurring cadence with period.
                </p>
              </div>
              <button
                onClick={() => setIsClassModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode Switcher */}
            <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '3px', marginBottom: '16px', border: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => setScheduleMode('RECURRING')}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: scheduleMode === 'RECURRING' ? 'var(--bg-surface)' : 'transparent',
                  color: scheduleMode === 'RECURRING' ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                Recurring Series (with Period)
              </button>
              <button
                type="button"
                onClick={() => setScheduleMode('SINGLE')}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: scheduleMode === 'SINGLE' ? 'var(--bg-surface)' : 'transparent',
                  color: scheduleMode === 'SINGLE' ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                Single Session
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Class Title *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Road Signs & Priority Rules"
                  value={classTitle}
                  onChange={(e) => setClassTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">Cohort</label>
                <select
                  className="input"
                  value={classCohortId}
                  onChange={(e) => setClassCohortId(e.target.value)}
                >
                  <option value="">General Cohort / All Enrolled</option>
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {scheduleMode === 'RECURRING' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="label">Day of the Week *</label>
                      <select
                        className="input"
                        value={recurringDay}
                        onChange={(e) => setRecurringDay(Number(e.target.value))}
                      >
                        {dayOptions.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label">Period (Duration) *</label>
                      <select
                        className="input"
                        value={recurringPeriodMonths}
                        onChange={(e) => setRecurringPeriodMonths(Number(e.target.value))}
                      >
                        {periodOptions.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Series Start Date *</label>
                    <input
                      type="date"
                      className="input"
                      value={recurringStartDate}
                      onChange={(e) => setRecurringStartDate(e.target.value)}
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="label">Scheduled Date *</label>
                  <input
                    type="date"
                    className="input"
                    value={singleDate}
                    onChange={(e) => setSingleDate(e.target.value)}
                    required
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label">Start Time (CAT) *</label>
                  <input
                    type="time"
                    className="input"
                    value={classStartTime}
                    onChange={(e) => setClassStartTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">End Time (CAT) *</label>
                  <input
                    type="time"
                    className="input"
                    value={classEndTime}
                    onChange={(e) => setClassEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Google Meet URL</label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  value={classMeetLink}
                  onChange={(e) => setClassMeetLink(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Scheduling...' : scheduleMode === 'RECURRING' ? `Schedule Series for ${recurringPeriodMonths} Months` : 'Schedule Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Play,
  Square,
  Ban,
  RefreshCw,
  X,
  Users,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
} from 'lucide-react';
import {
  AdminService,
  type CohortItem,
  type LiveClassAdminItem,
} from '../../core/services/AdminService';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_OPTIONS = [
  { value: 0, label: 'Each Monday' },
  { value: 1, label: 'Each Tuesday' },
  { value: 2, label: 'Each Wednesday' },
  { value: 3, label: 'Each Thursday' },
  { value: 4, label: 'Each Friday' },
  { value: 5, label: 'Each Saturday' },
  { value: 6, label: 'Each Sunday' },
];

const PERIOD_OPTIONS = [
  { value: 1, label: '1 Month (~4 weeks)' },
  { value: 2, label: '2 Months (~8 weeks)' },
  { value: 3, label: '3 Months (~12 weeks)' },
  { value: 6, label: '6 Months (~24 weeks)' },
];

export const AdminLiveClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<LiveClassAdminItem[]>([]);
  const [cohorts, setCohorts] = useState<CohortItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'CALENDAR' | 'TABLE'>('TABLE');

  // Calendar State
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<LiveClassAdminItem | null>(null);

  // Modals
  const [isCohortModalOpen, setIsCohortModalOpen] = useState<boolean>(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState<boolean>(false);

  // Cohort Form State (name, start date, end date, description <= 165 chars)
  const [cohortName, setCohortName] = useState<string>('');
  const [cohortStartDate, setCohortStartDate] = useState<string>('');
  const [cohortEndDate, setCohortEndDate] = useState<string>('');
  const [cohortDescription, setCohortDescription] = useState<string>('');

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
      console.error('Failed loading live classes and cohorts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Default start dates to today
    const todayStr = new Date().toISOString().split('T')[0];
    setSingleDate(todayStr);
    setRecurringStartDate(todayStr);
  }, []);

  // Cohort Creation
  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cohortName.trim()) {
      warning('Cohort name is required.');
      return;
    }
    if (!cohortStartDate || !cohortEndDate) {
      warning('Both Start Date and End Date are required.');
      return;
    }
    if (cohortEndDate < cohortStartDate) {
      warning('End Date cannot precede Start Date.');
      return;
    }
    if (cohortDescription.length > 165) {
      warning('Description cannot exceed 165 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createCohort({
        name: cohortName.trim(),
        start_date: cohortStartDate,
        end_date: cohortEndDate,
        description: cohortDescription.trim(),
      });
      success(`Created cohort ${cohortName}.`);
      setIsCohortModalOpen(false);
      setCohortName('');
      setCohortStartDate('');
      setCohortEndDate('');
      setCohortDescription('');
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Could not create cohort.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Class Scheduling (Single or Recurring)
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classTitle.trim()) {
      warning('Class title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (scheduleMode === 'RECURRING') {
        await adminService.scheduleRecurringClasses({
          title: classTitle.trim(),
          cohort: classCohortId || undefined,
          day_of_week: Number(recurringDay),
          start_time: classStartTime,
          end_time: classEndTime,
          start_date: recurringStartDate,
          period_months: Number(recurringPeriodMonths),
          google_meet_url: classMeetLink.trim() || undefined,
          topic: classTopic.trim() || undefined,
        });
        success(`Scheduled recurring classes for ${recurringPeriodMonths} months.`);
      } else {
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
        success(`Scheduled live class ${classTitle}.`);
      }

      setIsClassModalOpen(false);
      setClassTitle('');
      setClassTopic('');
      setClassMeetLink('');
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to schedule class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClassAction = async (classId: string, action: 'START' | 'END' | 'CANCEL') => {
    try {
      if (action === 'START') await adminService.startLiveClass(classId);
      if (action === 'END') await adminService.endLiveClass(classId);
      if (action === 'CANCEL') await adminService.cancelLiveClass(classId, 'Cancelled by administrator');

      success(`Class ${action.toLowerCase()}ed.`);
      if (selectedClass?.id === classId) {
        setSelectedClass(null);
      }
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Operation failed.');
    }
  };

  // Calendar Calculation Helpers
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const calendarDays = useMemo(() => {
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

    const days: { date: Date | null; dayNumber: number | null; dateString: string | null }[] = [];

    // Preceding empty slots
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ date: null, dayNumber: null, dateString: null });
    }

    // Days in current month
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(year, month, day);
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ date: d, dayNumber: day, dateString });
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
            Classes & Cohorts
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage student cohorts, schedule recurring curriculum sessions, and conduct live Google Meet classes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            to="/admin/schedules"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <CalendarIcon size={14} />
            <span>Schedules & Events</span>
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
              <span>Calendar</span>
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
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={loadData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsCohortModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Users size={14} />
            <span>New Cohort</span>
          </button>
          <button
            onClick={() => setIsClassModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} />
            <span>Schedule Class</span>
          </button>
        </div>
      </div>

      {/* Cohorts Strip */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Student Cohorts ({cohorts.length})
          </h3>
        </div>

        {cohorts.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            No cohorts registered yet. Create a cohort with start date, end date, and description.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {cohorts.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {c.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {c.student_count ?? 0} students
                  </span>
                </div>

                {c.description && (
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {c.description}
                  </p>
                )}

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {c.start_date ? new Date(c.start_date).toLocaleDateString('en-RW') : 'TBD'}
                  {' → '}
                  {c.end_date ? new Date(c.end_date).toLocaleDateString('en-RW') : 'Open'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Spinner message="Loading live classes..." />
        </div>
      ) : viewMode === 'CALENDAR' ? (
        /* Calendar View */
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
          {/* Calendar Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {monthName}
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                ({classes.length} total scheduled classes)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={prevMonth}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 8px' }}
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={todayMonth}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 8px' }}
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '6px',
              marginBottom: '6px',
              textAlign: 'center',
            }}
          >
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  padding: '6px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '6px',
            }}
          >
            {calendarDays.map((item, index) => {
              if (!item.date || !item.dateString) {
                return (
                  <div
                    key={`empty-${index}`}
                    style={{
                      minHeight: '90px',
                      background: 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 'var(--radius-md)',
                      opacity: 0.3,
                    }}
                  />
                );
              }

              const dayClasses = classesByDate.get(item.dateString) || [];
              const isToday = new Date().toDateString() === item.date.toDateString();

              return (
                <div
                  key={item.dateString}
                  onClick={() => handleDayClick(item.dateString!)}
                  style={{
                    minHeight: '95px',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: isToday ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'border-color var(--transition-fast)',
                  }}
                  title={`Click to schedule a class on ${item.dateString}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: isToday ? 700 : 500,
                        color: isToday ? 'var(--primary-light)' : 'var(--text-secondary)',
                      }}
                    >
                      {item.dayNumber}
                    </span>
                    {dayClasses.length > 0 && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                      </span>
                    )}
                  </div>

                  {/* Class chips */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                    {dayClasses.slice(0, 3).map((cls) => {
                      const timeStr = cls.start_time
                        ? cls.start_time.slice(0, 5)
                        : cls.scheduled_at
                        ? new Date(cls.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '14:00';

                      return (
                        <div
                          key={cls.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClass(cls);
                          }}
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 5px',
                            borderRadius: 'var(--radius-sm)',
                            background: cls.status === 'IN_PROGRESS' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            color: cls.status === 'IN_PROGRESS' ? 'var(--success)' : 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title={`${cls.title} (${timeStr})`}
                        >
                          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{timeStr}</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{cls.title}</span>
                        </div>
                      );
                    })}

                    {dayClasses.length > 3 && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        +{dayClasses.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              All Scheduled Classes ({classes.length})
            </h3>
          </div>

          {classes.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No classes scheduled yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Topic / Title</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Cohort</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Scheduled Date & Time</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls) => {
                    const dateDisplay = cls.scheduled_date
                      ? `${cls.scheduled_date} ${cls.start_time ? cls.start_time.slice(0, 5) : ''}`
                      : cls.scheduled_at
                      ? new Date(cls.scheduled_at).toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' })
                      : 'Scheduled';

                    return (
                      <tr key={cls.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          <div>{cls.title}</div>
                          {cls.topic && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cls.topic}</div>}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                          {cls.cohort_name || 'General Cohort'}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                          {dateDisplay}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <Badge variant={cls.status === 'IN_PROGRESS' ? 'success' : cls.status === 'COMPLETED' ? 'neutral' : 'info'}>
                            {cls.status}
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
                                <span>Join</span>
                                <ExternalLink size={12} />
                              </a>
                            )}
                            {cls.status === 'SCHEDULED' && (
                              <button
                                onClick={() => handleClassAction(cls.id, 'START')}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                                title="Start session"
                              >
                                <Play size={12} />
                              </button>
                            )}
                            {cls.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => handleClassAction(cls.id, 'END')}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                                title="End session"
                              >
                                <Square size={12} />
                              </button>
                            )}
                            {cls.status !== 'COMPLETED' && cls.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleClassAction(cls.id, 'CANCEL')}
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
      )}

      {/* Cohort Modal (Name, Start Date, End Date, Description max 165 chars) */}
      {isCohortModalOpen && (
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
                New Cohort
              </h3>
              <button onClick={() => setIsCohortModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCohort} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Cohort Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kigali Morning Cohort Q4"
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
                    Start Date *
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
                    End Date *
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
                    Description (max 165 characters)
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
                  placeholder="Brief summary of syllabus focus, schedule rhythm, or target learners..."
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
                <button type="button" onClick={() => setIsCohortModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-secondary btn-sm">
                  {isSubmitting ? 'Creating...' : 'Create Cohort'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Live Class Modal (Single Session or Recurring with Period) */}
      {isClassModalOpen && (
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
                Schedule Live Class
              </h3>
              <button onClick={() => setIsClassModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
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
                Recurring Series (Period)
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
                Single Session
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Class Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priority Rules & Roundabout Navigation"
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
                  Assigned Cohort (Optional)
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
                  <option value="">Platform-Wide (Open to all enrolled students)</option>
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.student_count ?? 0} students)
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
                        Weekly Cadence *
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
                        {DAY_OPTIONS.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Recurrence Period *
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
                        {PERIOD_OPTIONS.map((p) => (
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
                      Start Recurrence From Date *
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
                    Session Date *
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
                    Start Time *
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
                    End Time *
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
                  Google Meet Link (Optional)
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
                  Cadence:{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {DAY_OPTIONS.find((d) => d.value === recurringDay)?.label} at {classStartTime}
                  </strong>{' '}
                  for <strong style={{ color: 'var(--text-primary)' }}>{recurringPeriodMonths} months</strong>.
                  Sessions will automatically populate on the academy calendar.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsClassModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-secondary btn-sm">
                  {isSubmitting ? 'Scheduling...' : 'Schedule Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Details Drawer / Modal */}
      {selectedClass && (
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
                Class Details
              </h3>
              <button onClick={() => setSelectedClass(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>Topic</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedClass.title}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>Cohort</span>
                <span style={{ color: 'var(--text-secondary)' }}>{selectedClass.cohort_name || 'General Cohort'}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>Time</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {selectedClass.scheduled_date} ({selectedClass.start_time?.slice(0, 5)} - {selectedClass.end_time?.slice(0, 5)})
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>Status</span>
                <Badge variant={selectedClass.status === 'IN_PROGRESS' ? 'success' : 'info'}>
                  {selectedClass.status}
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
                    <span>Open Google Meet</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                {selectedClass.status === 'SCHEDULED' && (
                  <button
                    onClick={() => handleClassAction(selectedClass.id, 'START')}
                    className="btn btn-secondary btn-sm"
                  >
                    Start Class
                  </button>
                )}
                {selectedClass.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleClassAction(selectedClass.id, 'END')}
                    className="btn btn-secondary btn-sm"
                  >
                    End Class
                  </button>
                )}
                {selectedClass.status !== 'COMPLETED' && selectedClass.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleClassAction(selectedClass.id, 'CANCEL')}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel Class
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedClass(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

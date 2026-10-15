import React, { useEffect, useState, useMemo } from 'react';
import {
  Video,
  Calendar as CalendarIcon,
  Clock,
  UserCheck,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Layers,
  Calendar,
} from 'lucide-react';
import { LiveClassService } from '../../core/services/LiveClassService';
import { LiveClass } from '../../core/models/LiveClass';
import type { LiveClassScheduleItem } from '../../core/services/AdminService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { useTranslation } from '../../context/I18nContext';

export const LiveClassesPage: React.FC = () => {
  const { t, language } = useTranslation();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [schedules, setSchedules] = useState<LiveClassScheduleItem[]>([]);
  const [attendance, setAttendance] = useState<{ attendance_rate: number; total_sessions: number; attended: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'SCHEDULES' | 'CALENDAR'>('SCHEDULES');

  // Calendar State
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const shortDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const formatDays = (days: number[] | undefined, short = false): string => {
    if (!days || days.length === 0) return '';
    const names = short ? shortDayNames : dayNames;
    return days.map((d) => names[d] ?? d).join(', ');
  };

  useEffect(() => {
    const fetchClasses = async () => {
      const isRw = language === 'rw';
      try {
        const liveService = LiveClassService.getInstance();
        const [classList, scheduleList, attSummary] = await Promise.all([
          liveService.getClasses(),
          liveService.getSchedules(),
          liveService.getAttendanceSummary(),
        ]);

        if (classList.length === 0 && scheduleList.length === 0) {
          // Demo fallback
          setClasses([
            new LiveClass({
              id: 'cls-demo-1',
              title: isRw
                ? 'Gusubiramo Ibibazo By’Ingenzi by’Ikizamini cy’Agateganyo'
                : 'Intensive Provisional Exam Q&A & Scenario Simulation',
              topic: isRw
                ? 'Gusesengura ibimenyetso by’abapolisi, amategeko yo gutanga inzira muri Karitsiye (Roundabout) no kwirinda amande.'
                : 'Deep dive into police hand signals, complex roundabout priority, and pedestrian right of way.',
              cohort_name: isRw ? 'Itsinda rya Mutarama — Kigali' : 'Cohort A — Kigali Central',
              tutor_name: 'Jean-Paul Mugisha (Senior Instructor)',
              scheduled_date: '2026-09-12',
              start_time: '18:00',
              end_time: '19:30',
              google_meet_url: 'https://meet.google.com/abc-sifo-drive',
              status: 'SCHEDULED',
            }),
          ]);
        } else {
          setClasses(classList);
          setSchedules(scheduleList);
        }
        setAttendance(attSummary);
      } catch {
        // Fallback demo classes
        setClasses([]);
        setAttendance({ attendance_rate: 80, total_sessions: 5, attended: 4 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [language]);

  // Calendar Calculation Helpers
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const calendarDays = useMemo(() => {
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
    const days: { date: Date | null; dayNumber: number | null; dateString: string | null }[] = [];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ date: null, dayNumber: null, dateString: null });
    }
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(year, month, day);
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ date: d, dayNumber: day, dateString });
    }
    return days;
  }, [year, month]);

  const classesByDate = useMemo(() => {
    const map = new Map<string, LiveClass[]>();
    for (const c of classes) {
      const dateKey = c.scheduledDate;
      if (dateKey) {
        const existing = map.get(dateKey) || [];
        existing.push(c);
        map.set(dateKey, existing);
      }
    }
    return map;
  }, [classes]);

  const nextMonth = () => setCalendarDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const todayMonth = () => setCalendarDate(new Date());

  const monthName = calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (isLoading) {
    return <Spinner message={t('common.loading')} />;
  }

  const isEligible = (attendance?.attendance_rate ?? 80) >= 75;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header with Mode Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Badge variant="info">{t('liveClasses.badge')}</Badge>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t('liveClasses.interactiveTitle')}
            </span>
          </div>
          <h1 style={{ margin: 0 }}>{t('liveClasses.title')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '6px' }}>
            {t('liveClasses.subtitle')}
          </p>
        </div>

        {/* View mode toggle: Class Schedules (Master) vs Calendar View */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
          }}
        >
          <button
            onClick={() => setViewMode('SCHEDULES')}
            style={{
              background: viewMode === 'SCHEDULES' ? 'var(--bg-surface)' : 'transparent',
              color: viewMode === 'SCHEDULES' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Layers size={14} />
            <span>Class Schedules ({schedules.length > 0 ? schedules.length : classes.length})</span>
          </button>
          <button
            onClick={() => setViewMode('CALENDAR')}
            style={{
              background: viewMode === 'CALENDAR' ? 'var(--bg-surface)' : 'transparent',
              color: viewMode === 'CALENDAR' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CalendarIcon size={14} />
            <span>Calendar View</span>
          </button>
        </div>
      </div>

      {/* Attendance Criteria Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--primary-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserCheck size={26} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{t('liveClasses.attendanceTitle')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', margin: 0 }}>
              {t('liveClasses.attendanceSub')}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-light)' }}>
              {attendance?.attendance_rate ?? 80}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {t('liveClasses.sessionsAttendedCount', {
                attended: attendance?.attended ?? 4,
                total: attendance?.total_sessions ?? 5,
              })}
            </div>
          </div>
          <Badge variant={isEligible ? 'success' : 'warning'}>
            {isEligible ? t('liveClasses.eligible') : t('liveClasses.attendanceLow')}
          </Badge>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. MASTER CLASS SCHEDULES VIEW (1 SINGLE CARD PER SERIES)      */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'SCHEDULES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Class Schedules & Lecture Series</h2>

          {schedules.length === 0 ? (
            classes.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No live classes have been scheduled yet.
              </div>
            ) : (
              // Fallback to classes if no master schedules exist
              classes.map((cls) => (
                <Card key={cls.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ maxWidth: '700px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <Badge variant={cls.getStatusBadge().variant}>
                          {cls.status === 'SCHEDULED' ? t('liveClasses.scheduled') : cls.status}
                        </Badge>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cls.cohortName}</span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>{cls.title}</h3>
                      {cls.topic && <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '14px' }}>{cls.topic}</p>}
                      <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={15} color="var(--primary)" />
                          <span>{cls.scheduledDate}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={15} color="var(--accent-500)" />
                          <span>{cls.getFormattedTimeRange()}</span>
                        </div>
                        <div>Instructor: <strong style={{ color: 'var(--text-primary)' }}>{cls.tutorName}</strong></div>
                      </div>
                    </div>
                    {cls.googleMeetUrl && (
                      <a href={cls.googleMeetUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <Video size={16} />
                        <span>{t('liveClasses.launchMeet')}</span>
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </Card>
              ))
            )
          ) : (
            schedules.map((sch) => {
              const isRecurring = sch.schedule_mode === 'RECURRING';
              const formattedDays = formatDays(sch.days_of_week);
              const childSessions = classes.filter(
                (c) => (c as any).schedule === sch.id || (c as any).schedule_id === sch.id
              );

              return (
                <div key={sch.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ maxWidth: '720px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <Badge variant="info">
                            {`${sch.total_sessions_count ?? childSessions.length} Sessions`}
                          </Badge>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {sch.cohort_name || 'All Enrolled Students'}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.25rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                          {sch.title}
                        </h3>
                        {sch.topic && (
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '14px', lineHeight: 1.5 }}>
                            {sch.topic}
                          </p>
                        )}

                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 600 }}>
                            <Clock size={15} color="var(--primary)" />
                            <span>
                              {isRecurring && formattedDays ? `Every ${formattedDays} • ` : ''}
                              {sch.start_time?.slice(0, 5)} - {sch.end_time?.slice(0, 5)}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={15} color="#058728" />
                            <span>
                              {sch.start_date}
                              {sch.end_date ? ` → ${sch.end_date}` : ''}
                              {sch.period_months ? ` (${sch.period_months} ${sch.period_unit || 'months'})` : ''}
                            </span>
                          </div>

                          <div>
                            Instructor:{' '}
                            <strong style={{ color: 'var(--text-primary)' }}>
                              {sch.tutor_name || 'Assigned Facilitator'}
                            </strong>
                          </div>
                        </div>

                        {sch.next_upcoming_session && (
                          <div
                            style={{
                              marginTop: '12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(5, 135, 40, 0.08)',
                              border: '1px solid rgba(5, 135, 40, 0.25)',
                              fontSize: '0.8rem',
                              color: '#058728',
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#058728' }} />
                            <span>
                              Next Live Session: {sch.next_upcoming_session.scheduled_date} at {sch.next_upcoming_session.start_time?.slice(0, 5)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        {sch.google_meet_url && (
                          <a
                            href={sch.google_meet_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                          >
                            <Video size={16} />
                            <span>{t('liveClasses.launchMeet')}</span>
                            <ExternalLink size={14} />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setViewMode('CALENDAR')}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
                        >
                          <Calendar size={14} />
                          <span>View Dates</span>
                        </button>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. CALENDAR VIEW (SHOWS ALL INDIVIDUAL CLASS DAYS ON CALENDAR) */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'CALENDAR' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
          {/* Calendar Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {monthName}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Showing all scheduled class dates ({classes.length} class days)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={prevMonth} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={todayMonth} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                Today
              </button>
              <button onClick={nextMonth} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} style={{ textAlign: 'center', padding: '6px 0', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {day}
              </div>
            ))}

            {calendarDays.map((slot, index) => {
              if (!slot.dateString) {
                return <div key={`empty-${index}`} style={{ minHeight: '85px', background: 'transparent' }} />;
              }

              const dayClasses = classesByDate.get(slot.dateString) || [];
              const isToday = new Date().toISOString().split('T')[0] === slot.dateString;

              return (
                <div
                  key={slot.dateString}
                  style={{
                    minHeight: '85px',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    background: isToday ? 'rgba(0, 85, 165, 0.08)' : 'var(--bg-surface-elevated)',
                    border: `1px solid ${isToday ? 'rgba(0, 85, 165, 0.35)' : 'var(--border-subtle)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: isToday ? 800 : 500, color: isToday ? '#0055A5' : 'var(--text-primary)' }}>
                      {slot.dayNumber}
                    </span>
                    {dayClasses.length > 0 && (
                      <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '4px', background: '#058728', color: '#fff', fontWeight: 700 }}>
                        {dayClasses.length}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px', overflowY: 'auto', maxHeight: '55px' }}>
                    {dayClasses.map((c) => (
                      <div
                        key={c.id}
                        style={{
                          padding: '3px 6px',
                          borderRadius: '3px',
                          fontSize: '0.72rem',
                          background: 'rgba(0, 85, 165, 0.12)',
                          color: '#0055A5',
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={`${c.title} • ${c.getFormattedTimeRange()}`}
                      >
                        {c.startTime ? c.startTime.slice(0, 5) : ''} {c.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveClassesPage;

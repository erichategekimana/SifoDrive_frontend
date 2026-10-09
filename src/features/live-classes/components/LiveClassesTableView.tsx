import React, { useState } from 'react';
import {
  ExternalLink,
  Play,
  Square,
  Ban,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  Layers,
  List,
} from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import type { LiveClassAdminItem, LiveClassScheduleItem } from '../../../core/services/AdminService';
import { useTranslation } from '../../../context/I18nContext';

interface LiveClassesTableViewProps {
  classes: LiveClassAdminItem[];
  schedules?: LiveClassScheduleItem[];
  onClassAction: (classId: string, action: 'START' | 'END' | 'CANCEL') => void;
  onEditClass?: (cls: LiveClassAdminItem) => void;
  onDeleteClass?: (classId: string) => void;
  onEditSchedule?: (schedule: LiveClassScheduleItem) => void;
  onDeleteSchedule?: (scheduleId: string) => void;
}

export const LiveClassesTableView: React.FC<LiveClassesTableViewProps> = ({
  classes,
  schedules = [],
  onClassAction,
  onEditClass,
  onDeleteClass,
  onEditSchedule,
  onDeleteSchedule,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'SCHEDULES' | 'ALL_SESSIONS'>('SCHEDULES');
  const [expandedScheduleIds, setExpandedScheduleIds] = useState<Set<string>>(new Set());

  const toggleExpandSchedule = (scheduleId: string) => {
    setExpandedScheduleIds((prev) => {
      const next = new Set(prev);
      if (next.has(scheduleId)) {
        next.delete(scheduleId);
      } else {
        next.add(scheduleId);
      }
      return next;
    });
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const formatDays = (days: number[] | undefined): string => {
    if (!days || days.length === 0) return '';
    return days.map((d) => dayNames[d] ?? d).join(', ');
  };

  const getSessionsForSchedule = (scheduleId: string): LiveClassAdminItem[] => {
    return classes.filter(
      (c) => (c as any).schedule === scheduleId || (c as any).schedule_id === scheduleId
    );
  };

  // If there are no master schedules, fallback directly to showing sessions
  const effectiveTab = schedules.length === 0 && classes.length > 0 ? 'ALL_SESSIONS' : activeTab;

  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Table Header with Mode Tabs */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            {effectiveTab === 'SCHEDULES'
              ? `${t('admin.liveClasses.masterSchedulesTab')} (${schedules.length})`
              : `${t('admin.liveClasses.allSessionsTab')} (${classes.length})`}
          </h3>
        </div>

        {/* View Selection Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '2px',
          }}
        >
          <button
            onClick={() => setActiveTab('SCHEDULES')}
            style={{
              background: effectiveTab === 'SCHEDULES' ? 'var(--bg-surface)' : 'transparent',
              color: effectiveTab === 'SCHEDULES' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '5px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Layers size={13} />
            <span>
              {t('admin.liveClasses.masterSchedulesTab')} ({schedules.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('ALL_SESSIONS')}
            style={{
              background: effectiveTab === 'ALL_SESSIONS' ? 'var(--bg-surface)' : 'transparent',
              color: effectiveTab === 'ALL_SESSIONS' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '5px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <List size={13} />
            <span>
              {t('admin.liveClasses.allSessionsTab')} ({classes.length})
            </span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. MASTER SCHEDULES VIEW (1 ROW PER SCHEDULE OFFERING)         */}
      {/* ------------------------------------------------------------- */}
      {effectiveTab === 'SCHEDULES' && (
        <>
          {schedules.length === 0 ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.88rem',
              }}
            >
              {t('admin.liveClasses.noClassesScheduled')}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', width: '36px' }}></th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {t('admin.liveClasses.topic')}
                    </th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {t('admin.liveClasses.cohort')}
                    </th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Cadence & Timetable
                    </th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Next Session & Count
                    </th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Tutor
                    </th>
                    <th
                      style={{
                        padding: '10px 14px',
                        color: 'var(--text-muted)',
                        fontWeight: 600,
                        textAlign: 'right',
                      }}
                    >
                      {t('admin.liveClasses.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((sch) => {
                    const isExpanded = expandedScheduleIds.has(sch.id);
                    const childSessions = getSessionsForSchedule(sch.id);
                    const formattedDaysList = formatDays(sch.days_of_week);
                    const isRecurring = sch.schedule_mode === 'RECURRING';

                    return (
                      <React.Fragment key={sch.id}>
                        <tr
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                          }}
                        >
                          {/* Expand chevron */}
                          <td style={{ padding: '10px 8px 10px 14px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => toggleExpandSchedule(sch.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                padding: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              title={isExpanded ? t('admin.liveClasses.hideSessions') : t('admin.liveClasses.viewSessions')}
                            >
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                          </td>

                          {/* Title & Topic & Badge */}
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {sch.title}
                              </span>
                              <Badge variant={isRecurring ? 'success' : 'neutral'}>
                                {isRecurring
                                  ? t('admin.liveClasses.recurringScheduleBadge')
                                  : t('admin.liveClasses.singleScheduleBadge')}
                              </Badge>
                            </div>
                            {sch.topic && (
                              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {sch.topic}
                              </div>
                            )}
                          </td>

                          {/* Cohort */}
                          <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                            {sch.cohort_name || t('admin.liveClasses.openToAllEnrolled')}
                          </td>

                          {/* Cadence & Timetable */}
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-primary)', fontWeight: 500 }}>
                                <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                                <span>
                                  {isRecurring && formattedDaysList ? `Every ${formattedDaysList} • ` : ''}
                                  {sch.start_time ? sch.start_time.slice(0, 5) : ''} - {sch.end_time ? sch.end_time.slice(0, 5) : ''}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                <Calendar size={11} />
                                <span>
                                  {sch.start_date}
                                  {sch.end_date ? ` → ${sch.end_date}` : ''}
                                  {sch.period_months ? ` (${sch.period_months} ${sch.period_unit || 'months'})` : ''}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Next Session & Total Count */}
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <Badge variant="info">
                                {`${sch.total_sessions_count ?? childSessions.length} ${t('admin.liveClasses.totalSessions')}`}
                              </Badge>
                              {sch.next_upcoming_session ? (
                                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  Next: {sch.next_upcoming_session.scheduled_date} • {sch.next_upcoming_session.start_time.slice(0, 5)}
                                </span>
                              ) : null}
                            </div>
                          </td>

                          {/* Tutor */}
                          <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                            {sch.tutor_name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              {sch.google_meet_url && (
                                <a
                                  href={sch.google_meet_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                                  title="Open Google Meet link"
                                >
                                  <span>{t('admin.liveClasses.join')}</span>
                                  <ExternalLink size={12} />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => toggleExpandSchedule(sch.id)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                                title={isExpanded ? t('admin.liveClasses.hideSessions') : t('admin.liveClasses.viewSessions')}
                              >
                                <span>{isExpanded ? t('admin.liveClasses.hideSessions') : t('admin.liveClasses.viewSessions')}</span>
                              </button>
                              {onEditSchedule && (
                                <button
                                  type="button"
                                  onClick={() => onEditSchedule(sch)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                                  title={t('admin.liveClasses.editSchedule')}
                                >
                                  <Edit2 size={12} />
                                </button>
                              )}
                              {onDeleteSchedule && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(t('admin.liveClasses.deleteScheduleConfirm'))) {
                                      onDeleteSchedule(sch.id);
                                    }
                                  }}
                                  className="btn btn-secondary btn-sm"
                                  style={{
                                    padding: '3px 8px',
                                    fontSize: '0.75rem',
                                    color: '#DC2626',
                                    borderColor: 'rgba(220, 38, 38, 0.3)',
                                  }}
                                  title={t('admin.liveClasses.deleteSchedule')}
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded sub-table showing child sessions for this schedule */}
                        {isExpanded && (
                          <tr style={{ background: 'rgba(0, 0, 0, 0.15)' }}>
                            <td colSpan={7} style={{ padding: '12px 20px 16px 44px' }}>
                              <div
                                style={{
                                  background: 'var(--bg-surface-elevated)',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px solid var(--border-subtle)',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    padding: '8px 14px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderBottom: '1px solid var(--border-subtle)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    Scheduled Session Occurrences ({childSessions.length})
                                  </span>
                                </div>
                                {childSessions.length === 0 ? (
                                  <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    No session instances found.
                                  </div>
                                ) : (
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                    <thead>
                                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                                        <th style={{ padding: '6px 12px' }}>Date</th>
                                        <th style={{ padding: '6px 12px' }}>Time</th>
                                        <th style={{ padding: '6px 12px' }}>Status</th>
                                        <th style={{ padding: '6px 12px', textAlign: 'right' }}>Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {childSessions.map((session, idx) => (
                                        <tr key={session.id} style={{ borderBottom: idx === childSessions.length - 1 ? 'none' : '1px solid var(--border-subtle)' }}>
                                          <td style={{ padding: '6px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                                            {session.scheduled_date || (session.scheduled_at ? session.scheduled_at.split('T')[0] : '')}
                                          </td>
                                          <td style={{ padding: '6px 12px', color: 'var(--text-muted)' }}>
                                            {session.start_time ? session.start_time.slice(0, 5) : ''} - {session.end_time ? session.end_time.slice(0, 5) : ''}
                                          </td>
                                          <td style={{ padding: '6px 12px' }}>
                                            <Badge
                                              variant={
                                                session.status === 'IN_PROGRESS'
                                                  ? 'success'
                                                  : session.status === 'COMPLETED'
                                                  ? 'neutral'
                                                  : session.status === 'CANCELLED'
                                                  ? 'danger'
                                                  : 'info'
                                              }
                                            >
                                              {session.status}
                                            </Badge>
                                          </td>
                                          <td style={{ padding: '6px 12px', textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                              {(session.google_meet_url || session.meeting_link) && (
                                                <a
                                                  href={session.google_meet_url || session.meeting_link}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="btn btn-secondary btn-sm"
                                                  style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                                                >
                                                  Join
                                                </a>
                                              )}
                                              {session.status === 'SCHEDULED' && (
                                                <button
                                                  type="button"
                                                  onClick={() => onClassAction(session.id, 'START')}
                                                  className="btn btn-secondary btn-sm"
                                                  style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                                                  title="Start session"
                                                >
                                                  <Play size={11} />
                                                </button>
                                              )}
                                              {session.status === 'IN_PROGRESS' && (
                                                <button
                                                  type="button"
                                                  onClick={() => onClassAction(session.id, 'END')}
                                                  className="btn btn-secondary btn-sm"
                                                  style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                                                  title="End session"
                                                >
                                                  <Square size={11} />
                                                </button>
                                              )}
                                              {session.status !== 'COMPLETED' && session.status !== 'CANCELLED' && (
                                                <button
                                                  type="button"
                                                  onClick={() => onClassAction(session.id, 'CANCEL')}
                                                  className="btn btn-secondary btn-sm"
                                                  style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                                                  title="Cancel session"
                                                >
                                                  <Ban size={11} />
                                                </button>
                                              )}
                                              {onEditClass && (
                                                <button
                                                  type="button"
                                                  onClick={() => onEditClass(session)}
                                                  className="btn btn-secondary btn-sm"
                                                  style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                                                  title="Edit session"
                                                >
                                                  <Edit2 size={11} />
                                                </button>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. FLAT ALL SESSIONS VIEW                                      */}
      {/* ------------------------------------------------------------- */}
      {effectiveTab === 'ALL_SESSIONS' && (
        <>
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
                            {(cls.google_meet_url || cls.meeting_link) && (
                              <a
                                href={cls.google_meet_url || cls.meeting_link}
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
                                type="button"
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
                                type="button"
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
                                type="button"
                                onClick={() => onClassAction(cls.id, 'CANCEL')}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                                title="Cancel session"
                              >
                                <Ban size={12} />
                              </button>
                            )}
                            {onEditClass && (
                              <button
                                type="button"
                                onClick={() => onEditClass(cls)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                                title={t('admin.liveClasses.editClass')}
                              >
                                <Edit2 size={12} />
                              </button>
                            )}
                            {onDeleteClass && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(t('admin.liveClasses.deleteConfirm'))) {
                                    onDeleteClass(cls.id);
                                  }
                                }}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '3px 8px', fontSize: '0.75rem', color: '#DC2626', borderColor: 'rgba(220, 38, 38, 0.3)' }}
                                title={t('admin.liveClasses.deleteClass')}
                              >
                                <Trash2 size={12} />
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
        </>
      )}
    </div>
  );
};

import React from 'react';
import { Video, ExternalLink, Calendar, Clock, Trash2 } from 'lucide-react';
import type { LiveClassScheduleItem } from '../../../../../core/services/AdminService';
import type { LiveClass } from '../../../../../core/models/LiveClass';

interface ScheduleCardProps {
  schedule: LiveClassScheduleItem;
  classes: LiveClass[];
  isTutor: boolean;
  isTrainingAdmin: boolean;
  onNavigateCalendar: () => void;
  onDeleteSchedule: (scheduleId: string) => void;
}

const cardStyle: React.CSSProperties = {
  padding: '16px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '14px',
  backgroundColor: '#FFFFFF',
};

const badgeStyle = (bg: string, fg: string): React.CSSProperties => ({
  fontSize: '0.68rem',
  fontWeight: 700,
  backgroundColor: bg,
  color: fg,
  padding: '2px 8px',
  borderRadius: '2px',
});

const linkBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 16px',
  fontSize: '0.82rem',
  textDecoration: 'none',
};

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const formatDays = (days: number[] | undefined): string => {
  if (!days || days.length === 0) return '';
  return days.map((d) => dayNames[d] ?? d).join(', ');
};

const formatDate = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule: sch,
  classes,
  isTutor,
  isTrainingAdmin,
  onNavigateCalendar,
  onDeleteSchedule,
}) => {
  const childSessions = classes.filter(
    (c) => (c as any).schedule === sch.id || (c as any).schedule_id === sch.id
  );
  const formattedDays = formatDays(sch.days_of_week);
  const isRecurring = sch.schedule_mode === 'RECURRING';

  return (
    <div className="canvas-card" style={cardStyle}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <span style={badgeStyle('#F1F5F9', '#475569')}>
            {sch.total_sessions_count ?? childSessions.length} SESSIONS
          </span>
          <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
            {sch.title}
          </h4>
        </div>

        {sch.topic && <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '6px' }}>{sch.topic}</div>}

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: '#1E293B' }}>
            <Clock size={13} color="#0055A5" />
            <span>
              {isRecurring && formattedDays ? `Every ${formattedDays} • ` : ''}
              {sch.start_time?.slice(0, 5)} - {sch.end_time?.slice(0, 5)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Calendar size={13} color="#058728" />
            <span>
              {sch.start_date}
              {sch.end_date ? ` → ${sch.end_date}` : ''}
              {sch.period_months ? ` (${sch.period_months} ${sch.period_unit || 'months'})` : ''}
            </span>
          </div>
          {sch.cohort_name && <span>Cohort: <strong>{sch.cohort_name}</strong></span>}
          {sch.tutor_name && <span>Instructor: <strong>{sch.tutor_name}</strong></span>}
        </div>

        {sch.next_upcoming_session && (
          <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#0055A5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#058728' }} />
            <span>Next Session: {formatDate(sch.next_upcoming_session.scheduled_date)} at {sch.next_upcoming_session.start_time?.slice(0, 5)}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {sch.google_meet_url ? (
          <a
            href={sch.google_meet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="canvas-btn canvas-btn-primary"
            style={linkBtnStyle}
          >
            <Video size={15} />
            <span>{isTutor || isTrainingAdmin ? 'Host / Join Meet' : 'Join Google Meet'}</span>
            <ExternalLink size={12} />
          </a>
        ) : (
          <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Meet link not set</span>
        )}

        <button
          className="canvas-btn"
          onClick={onNavigateCalendar}
          style={{
            ...linkBtnStyle,
            cursor: 'pointer',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Calendar size={14} color="#0055A5" />
          <span>View Dates</span>
        </button>

        {isTrainingAdmin && (
          <button
            className="canvas-btn"
            onClick={() => onDeleteSchedule(sch.id)}
            style={{ ...linkBtnStyle, cursor: 'pointer', color: '#DC2626' }}
            title="Delete Schedule & Sessions"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ScheduleCard;

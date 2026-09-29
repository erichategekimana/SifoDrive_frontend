import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LiveClassAdminItem } from '../../../core/services/AdminService';
import { useTranslation } from '../../../context/I18nContext';

interface LiveClassesCalendarViewProps {
  monthName: string;
  totalClassesCount: number;
  calendarDays: { date: Date | null; dayNumber: number | null; dateString: string | null }[];
  classesByDate: Map<string, LiveClassAdminItem[]>;
  weekdaysList: { key: string; label: string }[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onTodayMonth: () => void;
  onDayClick: (dateString: string) => void;
  onSelectClass: (cls: LiveClassAdminItem) => void;
}

export const LiveClassesCalendarView: React.FC<LiveClassesCalendarViewProps> = ({
  monthName,
  totalClassesCount,
  calendarDays,
  classesByDate,
  weekdaysList,
  onPrevMonth,
  onNextMonth,
  onTodayMonth,
  onDayClick,
  onSelectClass,
}) => {
  const { t } = useTranslation();

  return (
    <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
      {/* Calendar Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {monthName}
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            ({totalClassesCount} total scheduled classes)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={onPrevMonth}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 8px' }}
            title="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={onTodayMonth}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
          >
            {t('admin.liveClasses.today')}
          </button>
          <button
            onClick={onNextMonth}
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
        {weekdaysList.map((day) => (
          <div
            key={day.key}
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              padding: '6px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {day.label}
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
              onClick={() => onDayClick(item.dateString!)}
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
                        onSelectClass(cls);
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
  );
};

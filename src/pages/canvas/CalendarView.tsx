import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, Video, Filter } from 'lucide-react';
import { useTranslation } from '../../context/I18nContext';

interface CalendarEvent {
  id: string;
  day: number;
  time: string;
  title: string;
  category: 'QUIZ' | 'LIVE_CLASS' | 'EXAM' | 'BOOKING';
  courseCode?: string;
  meetLink?: string;
}

export const CalendarView: React.FC = () => {
  const { t } = useTranslation();
  const currentMonth = t('canvasCalendar.currentMonth');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Filters
  const [showQuizzes, setShowQuizzes] = useState(true);
  const [showLiveClasses, setShowLiveClasses] = useState(true);
  const [showExams, setShowExams] = useState(true);

  const events: CalendarEvent[] = [
    {
      id: 'ev-1',
      day: 3,
      time: '18:00 - 19:30',
      title: "Live Class: Ibyapa by'Impuruza (Google Meet)",
      category: 'LIVE_CLASS',
      courseCode: 'TRAF-101',
      meetLink: 'https://meet.google.com/new',
    },
    {
      id: 'ev-2',
      day: 7,
      time: '23:59',
      title: "Quiz 2 Deadline: Amategeko yo Kunyuranaho",
      category: 'QUIZ',
      courseCode: 'TRAF-101',
    },
    {
      id: 'ev-3',
      day: 12,
      time: '19:00 - 20:30',
      title: "Live Class: Gusuzuma Feri n'Amatara",
      category: 'LIVE_CLASS',
      courseCode: 'MECH-102',
      meetLink: 'https://meet.google.com/new',
    },
    {
      id: 'ev-4',
      day: 18,
      time: '14:00',
      title: "Ikizamini cy'Igerageza cya Polisi (National Mock Exam 1)",
      category: 'EXAM',
      courseCode: 'POLICE-MOCK',
    },
    {
      id: 'ev-5',
      day: 24,
      time: '23:59',
      title: "Quiz 3 Deadline: Ibyapa Bibuza",
      category: 'QUIZ',
      courseCode: 'TRAF-101',
    },
  ];

  const filteredEvents = events.filter((ev) => {
    if (ev.category === 'QUIZ' && !showQuizzes) return false;
    if (ev.category === 'LIVE_CLASS' && !showLiveClasses) return false;
    if (ev.category === 'EXAM' && !showExams) return false;
    return true;
  });

  const getEventBadgeColor = (cat: CalendarEvent['category']) => {
    switch (cat) {
      case 'LIVE_CLASS':
        return { bg: '#EBF8FF', color: '#0055A5', border: '#BEE3F8' };
      case 'QUIZ':
        return { bg: '#FFF5F5', color: '#C53030', border: '#FEB2B2' };
      case 'EXAM':
        return { bg: '#F0FFF4', color: '#22543D', border: '#C6F6D5' };
      default:
        return { bg: '#FAF5FF', color: '#6B46C1', border: '#E9D8FD' };
    }
  };

  // Calendar month days 1 to 31
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0055A5', margin: 0 }}>
            {t('canvasCalendar.title')}
          </h1>
          <p style={{ color: '#666666', fontSize: '0.9rem', marginTop: '4px' }}>
            {t('canvasCalendar.subtitle')}
          </p>
        </div>

        {/* Month Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="canvas-btn" style={{ padding: '6px 10px' }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0055A5', minWidth: '180px', textAlign: 'center' }}>
            {currentMonth}
          </span>
          <button className="canvas-btn" style={{ padding: '6px 10px' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '20px' }}>
        {/* Main Calendar Grid */}
        <div className="canvas-card" style={{ padding: 0 }}>
          {/* Days of week header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              backgroundColor: '#F8FAFC',
              borderBottom: '2px solid #E0E0E0',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: '#0055A5',
              padding: '10px 0',
            }}
          >
            <div>{t('canvasCalendar.mon')}</div>
            <div>{t('canvasCalendar.tue')}</div>
            <div>{t('canvasCalendar.wed')}</div>
            <div>{t('canvasCalendar.thu')}</div>
            <div>{t('canvasCalendar.fri')}</div>
            <div>{t('canvasCalendar.sat')}</div>
            <div>{t('canvasCalendar.sun')}</div>
          </div>

          {/* Days Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gridAutoRows: 'minmax(100px, auto)',
              backgroundColor: '#E0E0E0',
              gap: '1px',
            }}
          >
            {daysInMonth.map((day) => {
              const dayEvents = filteredEvents.filter((ev) => ev.day === day);
              const isToday = day === 15;

              return (
                <div
                  key={day}
                  style={{
                    backgroundColor: isToday ? '#F0F7FA' : '#FFFFFF',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: isToday ? 800 : 600,
                        color: isToday ? '#0055A5' : '#444444',
                      }}
                    >
                      {day}
                    </span>
                    {isToday && (
                      <span className="canvas-badge canvas-badge-open" style={{ fontSize: '0.6rem' }}>
                        {t('canvasCalendar.today')}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
                    {dayEvents.map((ev) => {
                      const badgeStyle = getEventBadgeColor(ev.category);
                      return (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          style={{
                            backgroundColor: badgeStyle.bg,
                            border: `1px solid ${badgeStyle.border}`,
                            color: badgeStyle.color,
                            padding: '3px 6px',
                            borderRadius: '2px',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            lineHeight: 1.2,
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ev.title}
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

        {/* Sidebar: Filters & Selected Event Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Filters */}
          <div className="canvas-card">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0055A5', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={16} />
              <span>{t('canvasCalendar.filters')}</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showLiveClasses}
                  onChange={(e) => setShowLiveClasses(e.target.checked)}
                />
                <span style={{ color: '#0055A5', fontWeight: 600 }}>{t('canvasCalendar.filterLive')}</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showQuizzes}
                  onChange={(e) => setShowQuizzes(e.target.checked)}
                />
                <span style={{ color: '#C53030', fontWeight: 600 }}>{t('canvasCalendar.filterQuizzes')}</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showExams}
                  onChange={(e) => setShowExams(e.target.checked)}
                />
                <span style={{ color: '#22543D', fontWeight: 600 }}>{t('canvasCalendar.filterExams')}</span>
              </label>
            </div>
          </div>

          {/* Selected Event Details Modal/Card */}
          {selectedEvent ? (
            <div className="canvas-card" style={{ borderLeft: '4px solid #0055A5 !important' }}>
              <span className="canvas-badge canvas-badge-open" style={{ marginBottom: '8px' }}>
                {t('canvasCalendar.dayOf', { day: selectedEvent.day })}
              </span>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2D3B45', margin: '6px 0' }}>
                {selectedEvent.title}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#666666', marginBottom: '12px' }}>
                <Clock size={14} />
                <span>{selectedEvent.time}</span>
              </div>

              {selectedEvent.meetLink && (
                <a
                  href={selectedEvent.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="canvas-btn canvas-btn-accent"
                  style={{ width: '100%', textDecoration: 'none', justifyContent: 'center', fontSize: '0.78rem' }}
                >
                  <Video size={14} />
                  <span>{t('canvasCalendar.joinClass')}</span>
                </a>
              )}
            </div>
          ) : (
            <div className="canvas-card" style={{ textAlign: 'center', color: '#888888', fontSize: '0.8rem', padding: '24px 16px' }}>
              <CalIcon size={24} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
              {t('canvasCalendar.selectEventNotice')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

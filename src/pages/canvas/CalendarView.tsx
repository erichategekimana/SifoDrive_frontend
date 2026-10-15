import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalIcon,
  Clock,
  Video,
  Filter,
  CheckCircle2,
  FileText,
  Award,
  ShieldCheck,
  RotateCcw,
  ListFilter,
  CalendarDays,
  X,
} from 'lucide-react';
import { useTranslation } from '../../context/I18nContext';
import { useTheme } from '../../context/ThemeContext';
import { LiveClassService } from '../../core/services/LiveClassService';
import { HttpClient } from '../../core/api/HttpClient';

interface CalendarEvent {
  id: string;
  dateStr: string; // YYYY-MM-DD
  day: number;
  time: string;
  title: string;
  category: 'QUIZ' | 'LIVE_CLASS' | 'EXAM' | 'ACTIVITY';
  courseCode?: string;
  meetLink?: string;
  description?: string;
}

export const CalendarView: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // 1. Date State
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  // 2. Filters
  const [showLiveClasses, setShowLiveClasses] = useState<boolean>(true);
  const [showQuizzes, setShowQuizzes] = useState<boolean>(true);
  const [showActivities, setShowActivities] = useState<boolean>(true);
  const [showExams, setShowExams] = useState<boolean>(true);

  // 3. Dynamic Events from Backend
  const [dynamicEvents, setDynamicEvents] = useState<CalendarEvent[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Format month and year title
  const currentMonthTitle = useMemo(() => {
    return currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }, [currentDate]);

  // Fetch real events from Backend (Live Classes & Activities)
  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      try {
        const eventsList: CalendarEvent[] = [];

        // 1. Fetch live classes
        const classes = await LiveClassService.getInstance().getClasses().catch(() => []);
        if (classes && classes.length > 0) {
          classes.forEach((c) => {
            if (c.scheduledDate) {
              const parts = c.scheduledDate.split('-');
              const dayNum = parseInt(parts[2], 10);
              eventsList.push({
                id: `live-${c.id}`,
                dateStr: c.scheduledDate,
                day: isNaN(dayNum) ? 1 : dayNum,
                time: c.getFormattedTimeRange() || `${c.startTime?.slice(0, 5)} - ${c.endTime?.slice(0, 5)}`,
                title: c.title,
                category: 'LIVE_CLASS',
                courseCode: c.cohortName || 'Live Class',
                meetLink: c.googleMeetUrl,
                description: 'Interactive session with your certified instructor on Google Meet.',
              });
            }
          });
        }

        // 2. Fetch cohort activities
        const http = HttpClient.getInstance();
        const actRes: any = await http.get('/api/v1/lms/cohorts/activities/').catch(() => null);
        const activities = Array.isArray(actRes?.data) ? actRes.data : Array.isArray(actRes) ? actRes : [];
        if (activities.length > 0) {
          activities.forEach((act: any) => {
            if (act.due_date) {
              const d = new Date(act.due_date);
              const dateStr = act.due_date.split('T')[0];
              eventsList.push({
                id: `act-${act.id}`,
                dateStr,
                day: d.getDate(),
                time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                title: act.title,
                category: 'ACTIVITY',
                courseCode: act.course_title || 'Cohort Activity',
                description: act.description || 'Submission due date for graded assignment.',
              });
            }
          });
        }

        if (isMounted && eventsList.length > 0) {
          setDynamicEvents(eventsList);
        }
      } catch (err) {
        console.warn('Could not load dynamic calendar events:', err);
      }
    };

    fetchEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  // Standard foundational events for the current active month
  const defaultEvents: CalendarEvent[] = useMemo(() => {
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    return [
      {
        id: 'ev-1',
        dateStr: `${y}-${m}-03`,
        day: 3,
        time: '18:00 - 19:30',
        title: "Live Class: Ibyapa by'Impuruza (Google Meet)",
        category: 'LIVE_CLASS',
        courseCode: 'TRAF-101',
        meetLink: 'https://meet.google.com/new',
        description: 'Interactive lecture covering road danger warning signs.',
      },
      {
        id: 'ev-2',
        dateStr: `${y}-${m}-07`,
        day: 7,
        time: '23:59',
        title: 'Quiz 2 Deadline: Amategeko yo Kunyuranaho',
        category: 'QUIZ',
        courseCode: 'TRAF-101',
        description: 'Multiple choice quiz on overtaking regulations and lane priority.',
      },
      {
        id: 'ev-3',
        dateStr: `${y}-${m}-12`,
        day: 12,
        time: '19:00 - 20:30',
        title: "Live Class: Gusuzuma Feri n'Amatara",
        category: 'LIVE_CLASS',
        courseCode: 'MECH-102',
        meetLink: 'https://meet.google.com/new',
        description: 'Vehicle mechanics practical drill on brake system inspections.',
      },
      {
        id: 'ev-4',
        dateStr: `${y}-${m}-15`,
        day: 15,
        time: '23:59',
        title: 'Activity: Pre-Drive Inspection Checklist (PDF / Upload)',
        category: 'ACTIVITY',
        courseCode: 'MECH-102',
        description: 'Tutor-graded homework assignment. Submit checklist notes or PDF.',
      },
      {
        id: 'ev-5',
        dateStr: `${y}-${m}-18`,
        day: 18,
        time: '14:00 - 15:30',
        title: "Ikizamini cy'Igerageza cya Polisi (National Mock Exam 1)",
        category: 'EXAM',
        courseCode: 'POLICE-MOCK',
        description: 'Full 20-question timed mock provisional driving license examination.',
      },
      {
        id: 'ev-6',
        dateStr: `${y}-${m}-24`,
        day: 24,
        time: '23:59',
        title: 'Quiz 3 Deadline: Ibyapa Bibuza (Prohibitory Signs)',
        category: 'QUIZ',
        courseCode: 'TRAF-101',
        description: 'Online evaluation on priority and restriction road signs.',
      },
      {
        id: 'ev-7',
        dateStr: `${y}-${m}-28`,
        day: 28,
        time: '18:30 - 20:00',
        title: 'Live Review: Highway Code Q&A with Senior Tutor',
        category: 'LIVE_CLASS',
        courseCode: 'TRAF-101',
        meetLink: 'https://meet.google.com/new',
        description: 'Open consultation and revision session ahead of final examination.',
      },
    ];
  }, [year, month]);

  // Combine dynamic and default events
  const allEvents = useMemo(() => {
    if (dynamicEvents.length > 0) {
      // Merge dynamic events with default events that do not conflict
      const dynamicIds = new Set(dynamicEvents.map((e) => e.title));
      const filteredDefaults = defaultEvents.filter((d) => !dynamicIds.has(d.title));
      return [...dynamicEvents, ...filteredDefaults];
    }
    return defaultEvents;
  }, [dynamicEvents, defaultEvents]);

  // Filter events based on active checkboxes
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      if (ev.category === 'QUIZ' && !showQuizzes) return false;
      if (ev.category === 'LIVE_CLASS' && !showLiveClasses) return false;
      if (ev.category === 'ACTIVITY' && !showActivities) return false;
      if (ev.category === 'EXAM' && !showExams) return false;
      return true;
    });
  }, [allEvents, showQuizzes, showLiveClasses, showActivities, showExams]);

  // Calendar math: calculate accurate calendar grid for current year and month
  const calendarGrid = useMemo(() => {
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
    const startDayIndex = (firstDayOfWeek + 6) % 7; // Convert to Mon = 0 ... Sun = 6

    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const cells = [];

    // Previous month padding
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      cells.push({
        day: d,
        isCurrentMonth: false,
        dateKey: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      cells.push({
        day: d,
        isCurrentMonth: true,
        dateKey: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }

    // Next month padding (standard 35 or 42 cells total)
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const nextDaysCount = totalCells - cells.length;
    for (let d = 1; d <= nextDaysCount; d++) {
      cells.push({
        day: d,
        isCurrentMonth: false,
        dateKey: `${year}-${String(month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }

    return cells;
  }, [year, month]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedEvent(null);
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedEvent(null);
    setSelectedDay(null);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today.getDate());
    setSelectedEvent(null);
  };

  // Event Category Visual Tokens (calm, elegant, blends cleanly in both modes)
  const getEventBadge = (cat: CalendarEvent['category']) => {
    switch (cat) {
      case 'LIVE_CLASS':
        return {
          bg: isDark ? 'rgba(37, 99, 235, 0.20)' : '#EFF6FF',
          border: isDark ? 'rgba(59, 130, 246, 0.40)' : '#BFDBFE',
          color: isDark ? '#93C5FD' : '#1E40AF',
          dot: isDark ? '#3B82F6' : '#2563EB',
          label: 'Live Class',
          icon: <Video size={13} color={isDark ? '#93C5FD' : '#2563EB'} />,
        };
      case 'QUIZ':
        return {
          bg: isDark ? 'rgba(217, 119, 6, 0.20)' : '#FFFBEB',
          border: isDark ? 'rgba(245, 158, 11, 0.40)' : '#FDE68A',
          color: isDark ? '#FCD34D' : '#92400E',
          dot: isDark ? '#F59E0B' : '#D97706',
          label: 'Quiz Deadline',
          icon: <FileText size={13} color={isDark ? '#FCD34D' : '#D97706'} />,
        };
      case 'ACTIVITY':
        return {
          bg: isDark ? 'rgba(99, 102, 241, 0.20)' : '#EEF2FF',
          border: isDark ? 'rgba(99, 102, 241, 0.40)' : '#C7D2FE',
          color: isDark ? '#C7D2FE' : '#3730A3',
          dot: isDark ? '#8B5CF6' : '#6366F1',
          label: 'Activity',
          icon: <Award size={13} color={isDark ? '#C7D2FE' : '#6366F1'} />,
        };
      case 'EXAM':
        return {
          bg: isDark ? 'rgba(16, 185, 129, 0.20)' : '#F0FDF4',
          border: isDark ? 'rgba(16, 185, 129, 0.40)' : '#BBF7D0',
          color: isDark ? '#6EE7B7' : '#166534',
          dot: isDark ? '#10B981' : '#059669',
          label: 'Mock Exam',
          icon: <ShieldCheck size={13} color={isDark ? '#6EE7B7' : '#059669'} />,
        };
    }
  };

  // Check if cell is today
  const todayDate = new Date();
  const isActualToday = (dayNum: number, isCurrMonth: boolean) => {
    return (
      isCurrMonth &&
      dayNum === todayDate.getDate() &&
      month === todayDate.getMonth() &&
      year === todayDate.getFullYear()
    );
  };

  // Upcoming items this month sorted
  const upcomingEvents = useMemo(() => {
    return [...filteredEvents]
      .sort((a, b) => a.day - b.day)
      .slice(0, 6);
  }, [filteredEvents]);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        paddingBottom: '30px',
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        .calendar-day-events::-webkit-scrollbar {
          width: 4px;
        }
        .calendar-day-events::-webkit-scrollbar-track {
          background: transparent;
        }
        .calendar-day-events::-webkit-scrollbar-thumb {
          background: ${isDark ? '#475569' : '#CBD5E1'};
          border-radius: 4px;
        }
        .calendar-day-events::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? '#64748B' : '#94A3B8'};
        }
      `}</style>
      {/* ─────────────────────────────────────────────────────────────
          1. TOP BAR: Title, Navigation, View Switcher
         ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          paddingBottom: '18px',
          borderBottom: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
          marginBottom: '22px',
        }}
      >
        {/* Left: Page Title */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#0055A5',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalIcon size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', margin: 0 }}>
                {t('canvasCalendar.title')}
              </h1>
              <p style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '0.85rem', marginTop: '2px', margin: 0 }}>
                {t('canvasCalendar.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Controls & Month Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Today Button */}
          <button
            type="button"
            onClick={handleToday}
            className="canvas-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: isDark ? '#F8FAFC' : '#0F172A',
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <RotateCcw size={14} color="#0055A5" />
            <span>Today</span>
          </button>

          {/* Month Stepper */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
              borderRadius: '6px',
              overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              style={{
                border: 'none',
                background: 'transparent',
                padding: '7px 11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: isDark ? '#CBD5E1' : '#334155',
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <span
              style={{
                fontSize: '0.9rem',
                fontWeight: 800,
                color: '#0055A5',
                padding: '0 14px',
                minWidth: '150px',
                textAlign: 'center',
              }}
            >
              {currentMonthTitle}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              style={{
                border: 'none',
                background: 'transparent',
                padding: '7px 11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: isDark ? '#CBD5E1' : '#334155',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* View Mode Toggle: Month vs Agenda */}
          <div
            style={{
              display: 'inline-flex',
              padding: '3px',
              backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
              borderRadius: '6px',
              border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('month')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: viewMode === 'month' ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'month' ? (isDark ? '#0F172A' : '#FFFFFF') : 'transparent',
                color: viewMode === 'month' ? '#0055A5' : isDark ? '#94A3B8' : '#64748B',
                boxShadow: viewMode === 'month' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <CalendarDays size={14} />
              <span>Month</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('agenda')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: viewMode === 'agenda' ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'agenda' ? (isDark ? '#0F172A' : '#FFFFFF') : 'transparent',
                color: viewMode === 'agenda' ? '#0055A5' : isDark ? '#94A3B8' : '#64748B',
                boxShadow: viewMode === 'agenda' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <ListFilter size={14} />
              <span>Agenda</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA: CALENDAR GRID & SIDEBAR FILTERS
         ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 275px',
          gap: '20px',
          alignItems: 'start',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* ─── LEFT: CALENDAR WORKSPACE (MONTH OR AGENDA) ─── */}
        <div style={{ minWidth: 0, width: '100%' }}>
          {viewMode === 'month' ? (
            /* Month Calendar Card: fits available width without horizontal scroll, allows vertical scroll */
            <div
              className="canvas-card"
              style={{
                padding: 0,
                borderRadius: '8px',
                border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                width: '100%',
                boxSizing: 'border-box',
                overflowX: 'hidden',
              }}
            >
              {/* Day of Week Header Row (Sticky at top of calendar card) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderBottom: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                  textAlign: 'center',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  color: isDark ? '#CBD5E1' : '#334155',
                  padding: '12px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  boxSizing: 'border-box',
                  width: '100%',
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

              {/* 7-Column Day Cells Grid (Spacious 170px vertical rows, fits width horizontally with 0 horizontal scroll) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  gridAutoRows: '170px',
                  backgroundColor: isDark ? '#334155' : '#CBD5E1',
                  gap: '1px',
                  boxSizing: 'border-box',
                  width: '100%',
                }}
              >
                {calendarGrid.map((cell, idx) => {
                  const dayEvents = cell.isCurrentMonth
                    ? filteredEvents.filter((ev) => ev.day === cell.day)
                    : [];
                  const isToday = isActualToday(cell.day, cell.isCurrentMonth);
                  const isSelected = selectedDay === cell.day && cell.isCurrentMonth;

                  return (
                    <div
                      key={`${cell.dateKey}-${idx}`}
                      onClick={() => {
                        if (cell.isCurrentMonth) {
                          setSelectedDay(cell.day);
                          if (dayEvents.length > 0) {
                            setSelectedEvent(dayEvents[0]);
                          } else {
                            setSelectedEvent(null);
                          }
                        }
                      }}
                      style={{
                        backgroundColor: isToday
                          ? isDark
                            ? '#1E3A8A26'
                            : '#FFFFFF'
                          : isSelected
                          ? isDark
                            ? '#334155'
                            : '#F1F5F9'
                          : cell.isCurrentMonth
                          ? isDark
                            ? '#1E293B'
                            : '#FFFFFF'
                          : isDark
                          ? '#0F172A'
                          : '#F8FAFC',
                        height: '170px',
                        minHeight: '170px',
                        boxSizing: 'border-box',
                        padding: '8px 7px 6px 7px',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: cell.isCurrentMonth ? 'pointer' : 'default',
                        transition: 'background-color 0.1s ease',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Top Row: Date Number & Badges */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '6px',
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: isToday ? 800 : cell.isCurrentMonth ? 700 : 500,
                            color: isToday
                              ? '#FFFFFF'
                              : cell.isCurrentMonth
                              ? isDark
                                ? '#F8FAFC'
                                : '#0F172A'
                              : isDark
                              ? '#64748B'
                              : '#94A3B8',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: isToday ? '26px' : 'auto',
                            height: isToday ? '26px' : 'auto',
                            borderRadius: isToday ? '50%' : '0',
                            backgroundColor: isToday
                              ? isDark
                                ? '#3B82F6'
                                : '#0055A5'
                              : 'transparent',
                          }}
                        >
                          {cell.day}
                        </span>

                        {isToday ? (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: isDark ? '#93C5FD' : '#0055A5',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                              border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #BFDBFE',
                            }}
                          >
                            Today
                          </span>
                        ) : dayEvents.length > 2 ? (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: isDark ? '#94A3B8' : '#64748B',
                              backgroundColor: isDark ? '#334155' : '#F1F5F9',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {dayEvents.length} events
                          </span>
                        ) : null}
                      </div>

                      {/* Event Chips List: Increased size with clean vertical scrolling */}
                      <div
                        className="calendar-day-events"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '5px',
                          flex: 1,
                          minHeight: 0,
                          overflowY: 'auto',
                          overflowX: 'hidden',
                          paddingRight: '2px',
                          scrollbarWidth: 'thin',
                          scrollbarColor: isDark ? '#475569 transparent' : '#CBD5E1 transparent',
                        }}
                      >
                        {dayEvents.map((ev) => {
                          const badge = getEventBadge(ev.category);
                          const isEvSelected = selectedEvent?.id === ev.id;

                          return (
                            <div
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(ev);
                                setSelectedDay(ev.day);
                              }}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                                padding: '4px 7px',
                                borderRadius: '5px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                backgroundColor: isEvSelected
                                  ? isDark
                                    ? 'rgba(59, 130, 246, 0.28)'
                                    : '#EFF6FF'
                                  : badge.bg,
                                color: isEvSelected
                                  ? isDark
                                    ? '#FFFFFF'
                                    : '#0F172A'
                                  : badge.color,
                                border: isEvSelected
                                  ? isDark
                                    ? '1px solid #60A5FA'
                                    : '1px solid #93C5FD'
                                  : `1px solid ${badge.border}`,
                                borderLeft: `3px solid ${isEvSelected && isDark ? '#60A5FA' : badge.dot}`,
                                cursor: 'pointer',
                                transition: 'all 0.12s ease',
                                boxShadow: isEvSelected ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                flexShrink: 0,
                              }}
                              title={`${ev.time} • ${ev.title}`}
                            >
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span
                                  style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: 1,
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                  }}
                                >
                                  {ev.title}
                                </span>
                              </div>
                              {ev.time && (
                                <div
                                  style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    color: isDark ? '#94A3B8' : '#64748B',
                                    lineHeight: 1.2,
                                    marginTop: '1px',
                                  }}
                                >
                                  {ev.time}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Agenda / List Mode */
            <div
              className="canvas-card"
              style={{
                padding: '20px',
                borderRadius: '8px',
                border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', marginBottom: '14px' }}>
                Schedule Agenda for {currentMonthTitle}
              </h3>

              {filteredEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                  <CalIcon size={40} style={{ opacity: 0.35, margin: '0 auto 10px auto' }} />
                  <p style={{ fontWeight: 600, margin: 0 }}>No scheduled events match your current filters.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[...filteredEvents]
                    .sort((a, b) => a.day - b.day)
                    .map((ev) => {
                      const badge = getEventBadge(ev.category);
                      return (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            borderRadius: '6px',
                            border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`,
                            borderLeft: `4px solid ${badge.dot}`,
                            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '6px',
                                backgroundColor: badge.bg,
                                color: isDark ? badge.color : badge.dot,
                                border: `1px solid ${badge.border}`,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                              }}
                            >
                              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Day</span>
                              <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{ev.day}</span>
                            </div>

                            <div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#1E293B' }}>
                                {ev.title}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#64748B', marginTop: '2px' }}>
                                <span>{ev.courseCode}</span>
                                <span>•</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <Clock size={12} />
                                  <span>{ev.time}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: badge.bg,
                                color: isDark ? badge.color : badge.dot,
                                border: `1px solid ${badge.border}`,
                              }}
                            >
                              {badge.label}
                            </span>
                            {ev.meetLink && (
                              <a
                                href={ev.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="canvas-btn"
                                style={{
                                  padding: '5px 10px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  backgroundColor: '#0055A5',
                                  color: '#FFFFFF',
                                  borderRadius: '4px',
                                  textDecoration: 'none',
                                }}
                              >
                                Join
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── RIGHT: SIDEBAR (FILTERS, SELECTED EVENT, UPCOMING AGENDA) ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* 1. FILTER CARD */}
          <div
            className="canvas-card"
            style={{
              padding: '18px',
              borderRadius: '8px',
              border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                paddingBottom: '10px',
                borderBottom: isDark ? '1px solid #334155' : '1px solid #F1F5F9',
              }}
            >
              <h3
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Filter size={15} color="#0055A5" />
                <span>Filter Calendar</span>
              </h3>

              <button
                type="button"
                onClick={() => {
                  const allOn = showLiveClasses && showQuizzes && showActivities && showExams;
                  setShowLiveClasses(!allOn);
                  setShowQuizzes(!allOn);
                  setShowActivities(!allOn);
                  setShowExams(!allOn);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#0055A5',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {showLiveClasses && showQuizzes && showActivities && showExams ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Filter Toggle Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Live Classes */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 9px',
                  borderRadius: '6px',
                  backgroundColor: showLiveClasses ? (isDark ? '#1E3A8A26' : '#EFF6FF') : 'transparent',
                  border: `1px solid ${showLiveClasses ? '#BFDBFE' : isDark ? '#334155' : '#CBD5E1'}`,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: isDark ? '#F8FAFC' : '#1E293B',
                  transition: 'background-color 0.12s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={showLiveClasses}
                    onChange={(e) => setShowLiveClasses(e.target.checked)}
                    style={{ accentColor: '#0055A5', width: '15px', height: '15px' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6' }} />
                    <span>Live Classes</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#1D4ED8', fontWeight: 700 }}>
                  {allEvents.filter((e) => e.category === 'LIVE_CLASS').length}
                </span>
              </label>

              {/* Quiz Deadlines */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 9px',
                  borderRadius: '6px',
                  backgroundColor: showQuizzes ? (isDark ? '#78350F26' : '#FFFBEB') : 'transparent',
                  border: `1px solid ${showQuizzes ? '#FDE68A' : isDark ? '#334155' : '#CBD5E1'}`,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: isDark ? '#F8FAFC' : '#1E293B',
                  transition: 'background-color 0.12s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={showQuizzes}
                    onChange={(e) => setShowQuizzes(e.target.checked)}
                    style={{ accentColor: '#B45309', width: '15px', height: '15px' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                    <span>Quizzes</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 700 }}>
                  {allEvents.filter((e) => e.category === 'QUIZ').length}
                </span>
              </label>

              {/* Activities & Homework */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 9px',
                  borderRadius: '6px',
                  backgroundColor: showActivities ? (isDark ? '#312E8126' : '#EEF2FF') : 'transparent',
                  border: `1px solid ${showActivities ? '#C7D2FE' : isDark ? '#334155' : '#CBD5E1'}`,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: isDark ? '#F8FAFC' : '#1E293B',
                  transition: 'background-color 0.12s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={showActivities}
                    onChange={(e) => setShowActivities(e.target.checked)}
                    style={{ accentColor: '#4338CA', width: '15px', height: '15px' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366F1' }} />
                    <span>Activities</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#4338CA', fontWeight: 700 }}>
                  {allEvents.filter((e) => e.category === 'ACTIVITY').length}
                </span>
              </label>

              {/* Mock Police Exams */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 9px',
                  borderRadius: '6px',
                  backgroundColor: showExams ? (isDark ? '#064E3B26' : '#F0FDF4') : 'transparent',
                  border: `1px solid ${showExams ? '#BBF7D0' : isDark ? '#334155' : '#CBD5E1'}`,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: isDark ? '#F8FAFC' : '#1E293B',
                  transition: 'background-color 0.12s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={showExams}
                    onChange={(e) => setShowExams(e.target.checked)}
                    style={{ accentColor: '#15803D', width: '15px', height: '15px' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    <span>Mock Exams</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 700 }}>
                  {allEvents.filter((e) => e.category === 'EXAM').length}
                </span>
              </label>
            </div>
          </div>

          {/* 2. SELECTED EVENT INSPECTOR CARD */}
          {selectedEvent ? (
            <div
              className="canvas-card"
              style={{
                padding: '18px',
                borderRadius: '8px',
                border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                position: 'relative',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#94A3B8' : '#94A3B8',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                <X size={16} />
              </button>

              {/* Category Pill */}
              <div style={{ marginBottom: '8px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: getEventBadge(selectedEvent.category).bg,
                    color: isDark ? getEventBadge(selectedEvent.category).color : getEventBadge(selectedEvent.category).dot,
                    border: `1px solid ${getEventBadge(selectedEvent.category).border}`,
                  }}
                >
                  {getEventBadge(selectedEvent.category).icon}
                  <span>{getEventBadge(selectedEvent.category).label}</span>
                </span>
              </div>

              {/* Title & Course */}
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', margin: '4px 0 6px 0' }}>
                {selectedEvent.title}
              </h4>
              <div style={{ fontSize: '0.78rem', color: isDark ? '#94A3B8' : '#64748B', marginBottom: '10px' }}>
                {selectedEvent.courseCode}
              </div>

              {/* Time & Date */}
              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: isDark ? '#CBD5E1' : '#334155',
                  marginBottom: '12px',
                }}
              >
                <Clock size={14} color="#0055A5" />
                <span>
                  Day {selectedEvent.day} • {selectedEvent.time}
                </span>
              </div>

              {/* Description */}
              {selectedEvent.description && (
                <p style={{ fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#64748B', lineHeight: 1.45, marginBottom: '14px' }}>
                  {selectedEvent.description}
                </p>
              )}

              {/* Action Button */}
              {selectedEvent.meetLink ? (
                <a
                  href={selectedEvent.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="canvas-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    backgroundColor: '#0055A5',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    boxShadow: '0 1px 3px rgba(0, 85, 165, 0.25)',
                  }}
                >
                  <Video size={15} />
                  <span>Join Live Class (Google Meet)</span>
                </a>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.76rem',
                    color: '#15803D',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>Scheduled on course syllabus</span>
                </div>
              )}
            </div>
          ) : (
            /* 3. UPCOMING SESSIONS / DEADLINES PREVIEW */
            <div
              className="canvas-card"
              style={{
                padding: '18px',
                borderRadius: '8px',
                border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              }}
            >
              <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', marginBottom: '12px' }}>
                Upcoming this Month
              </h3>

              {upcomingEvents.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0 }}>No upcoming events for active filters.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  {upcomingEvents.map((ev) => {
                    const badge = getEventBadge(ev.category);
                    return (
                      <div
                        key={ev.id}
                        onClick={() => {
                          setSelectedEvent(ev);
                          setSelectedDay(ev.day);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '7px 9px',
                          borderRadius: '6px',
                          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                          border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`,
                          borderLeft: `3px solid ${badge.dot}`,
                          cursor: 'pointer',
                          transition: 'background-color 0.1s ease',
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '5px',
                            backgroundColor: badge.bg,
                            color: isDark ? badge.color : badge.dot,
                            border: `1px solid ${badge.border}`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ fontSize: '0.58rem', textTransform: 'uppercase' }}>Day</span>
                          <span style={{ fontSize: '0.88rem', lineHeight: 1 }}>{ev.day}</span>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: isDark ? '#F8FAFC' : '#1E293B',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {ev.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                            {ev.time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

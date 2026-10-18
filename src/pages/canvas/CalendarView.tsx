import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Video,
  CheckCircle2,
  RotateCcw,
  X,
  Filter,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { LiveClassService } from '../../core/services/LiveClassService';
import { HttpClient } from '../../core/api/HttpClient';

export interface CalendarEvent {
  id: string;
  dateStr: string; // YYYY-MM-DD
  day: number;
  time: string;
  title: string;
  category: 'LIVE_CLASS' | 'QUIZ' | 'ACTIVITY' | 'EXAM';
  courseCode?: string;
  courseTag?: string;
  meetLink?: string;
  description?: string;
}

export const CalendarView: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // 1. Date & View State
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'agenda'>('month');
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');

  // Event category filters (Live Classes, Quizzes, Activities, Exams)
  const [showLiveClasses, setShowLiveClasses] = useState<boolean>(true);
  const [showQuizzes, setShowQuizzes] = useState<boolean>(true);
  const [showActivities, setShowActivities] = useState<boolean>(true);
  const [showExams, setShowExams] = useState<boolean>(true);

  // 2. Dynamic Backend Events
  const [dynamicEvents, setDynamicEvents] = useState<CalendarEvent[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Format month and year title (e.g., "October 2026")
  const currentMonthTitle = useMemo(() => {
    return currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }, [currentDate]);

  const currentMonthShort = useMemo(() => {
    return currentDate.toLocaleDateString(undefined, { month: 'short' });
  }, [currentDate]);

  // Fetch real events from Backend (Classes, Quizzes, Activities, Exams)
  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      try {
        const eventsList: CalendarEvent[] = [];
        const http = HttpClient.getInstance();

        // 1. Fetch live classes
        const classes = await LiveClassService.getInstance().getClasses().catch(() => []);
        if (classes && classes.length > 0) {
          classes.forEach((c) => {
            const rawDate = c.scheduledDate || (c as any).scheduled_date || (c as any).scheduled_at;
            if (rawDate) {
              const dateStr = rawDate.split('T')[0];
              const parts = dateStr.split('-');
              const dayNum = parseInt(parts[2], 10);
              eventsList.push({
                id: `live-${c.id}`,
                dateStr,
                day: isNaN(dayNum) ? 1 : dayNum,
                time: c.getFormattedTimeRange() || `${c.startTime?.slice(0, 5)} - ${c.endTime?.slice(0, 5)}`,
                title: c.title,
                category: 'LIVE_CLASS',
                courseCode: c.cohortName || 'Live Class',
                courseTag: 'Live Class',
                meetLink: c.googleMeetUrl || 'https://meet.google.com/new',
                description: 'Interactive session with your certified instructor on Google Meet.',
              });
            }
          });
        }

        // 2. Fetch cohort activities / assignments
        const actRes: any = await http.get('/api/v1/lms/cohorts/activities/').catch(() => null);
        const activities = Array.isArray(actRes?.data) ? actRes.data : Array.isArray(actRes) ? actRes : [];
        if (activities.length > 0) {
          activities.forEach((act: any) => {
            const targetDate = act.due_date || act.open_date;
            if (targetDate) {
              const d = new Date(targetDate);
              const dateStr = targetDate.split('T')[0];
              eventsList.push({
                id: `act-${act.id}`,
                dateStr,
                day: d.getDate(),
                time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                title: act.title,
                category: 'ACTIVITY',
                courseCode: act.course_title || act.cohort_name || 'Cohort Activity',
                courseTag: 'Activity',
                description: act.description || 'Submission due date for graded assignment.',
              });
            }
          });
        }

        // 3. Fetch cohort quizzes & tutor deadlines
        const quizRes: any = await http.get('/api/v1/lms/quizzes/').catch(() => null);
        const quizzes = Array.isArray(quizRes?.data) ? quizRes.data : Array.isArray(quizRes) ? quizRes : [];
        if (quizzes.length > 0) {
          quizzes.forEach((q: any) => {
            const targetDate = q.deadline || q.closing_date || q.open_date;
            if (targetDate) {
              const d = new Date(targetDate);
              const dateStr = targetDate.split('T')[0];
              eventsList.push({
                id: `quiz-${q.id}`,
                dateStr,
                day: d.getDate(),
                time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                title: q.title,
                category: q.is_final_exam ? 'EXAM' : 'QUIZ',
                courseCode: q.course_title || 'Quiz Assessment',
                courseTag: q.is_final_exam ? 'Exam' : 'Quiz',
                description: q.description || 'Cohort assessment and knowledge evaluation.',
              });
            }
          });
        }

        // 4. Fetch scheduled exam sessions (from examinations hub)
        const examRes: any = await http.get('/api/v1/examinations/admin/sessions/').catch(() => null);
        const examsData = examRes?.data?.results || (Array.isArray(examRes?.data) ? examRes.data : Array.isArray(examRes) ? examRes : []);
        if (examsData.length > 0) {
          examsData.forEach((ex: any) => {
            const targetDate = ex.started_at || ex.submitted_at || ex.created_at;
            if (targetDate) {
              const d = new Date(targetDate);
              const dateStr = targetDate.split('T')[0];
              eventsList.push({
                id: `exam-${ex.id}`,
                dateStr,
                day: d.getDate(),
                time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                title: ex.cohort?.name ? `${ex.cohort.name} Examination` : 'Official Examination Session',
                category: 'EXAM',
                courseCode: ex.cohort?.name || 'Examination',
                courseTag: 'Exam',
                description: 'Official proctored examination session.',
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

  // Real backend events from LiveClassService and Cohort Activities
  const allEvents = useMemo(() => {
    return dynamicEvents;
  }, [dynamicEvents]);

  // Available courses list for "Filter by Course" dropdown
  const availableCourses = useMemo(() => {
    const list = new Set<string>();
    allEvents.forEach((ev) => {
      if (ev.courseCode) list.add(ev.courseCode);
    });
    return Array.from(list);
  }, [allEvents]);

  // Filter events based on selected course and event category toggles
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      // Course filter
      if (selectedCourse !== 'ALL' && ev.courseCode !== selectedCourse) {
        return false;
      }
      // Category toggles
      if (ev.category === 'LIVE_CLASS' && !showLiveClasses) return false;
      if (ev.category === 'QUIZ' && !showQuizzes) return false;
      if (ev.category === 'ACTIVITY' && !showActivities) return false;
      if (ev.category === 'EXAM' && !showExams) return false;

      return true;
    });
  }, [allEvents, selectedCourse, showLiveClasses, showQuizzes, showActivities, showExams]);

  // Calendar math: Sunday is column 0 (Sun, Mon, Tue, Wed, Thu, Fri, Sat) matching reference
  const calendarGrid = useMemo(() => {
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
    const startDayIndex = firstDayOfWeek; // Direct Sunday alignment

    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const cells = [];

    // Previous month padding
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, d);
      const prevY = prevDate.getFullYear();
      const prevM = String(prevDate.getMonth() + 1).padStart(2, '0');
      cells.push({
        day: d,
        isCurrentMonth: false,
        dateKey: `${prevY}-${prevM}-${String(d).padStart(2, '0')}`,
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

    // Next month padding (standard 35/42 cells grid)
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const nextDaysCount = Math.max(0, totalCells - cells.length);
    for (let d = 1; d <= nextDaysCount; d++) {
      const nextDate = new Date(year, month + 1, d);
      const nextY = nextDate.getFullYear();
      const nextM = String(nextDate.getMonth() + 1).padStart(2, '0');
      cells.push({
        day: d,
        isCurrentMonth: false,
        dateKey: `${nextY}-${nextM}-${String(d).padStart(2, '0')}`,
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

  // Color tokens with dimmed backgrounds and crisp readable text
  const getEventVisuals = (category: CalendarEvent['category']) => {
    switch (category) {
      case 'LIVE_CLASS':
        return {
          chipBg: isDark ? 'rgba(99, 102, 241, 0.16)' : '#EEF2FF', // Dimmed soft indigo
          chipBorder: isDark ? 'rgba(99, 102, 241, 0.45)' : '#C7D2FE',
          chipText: isDark ? '#E0E7FF' : '#312E81', // Crisp high contrast text
          accent: '#4338CA',
          tagBg: '#4338CA',
          btnBorder: '#2563EB',
          btnText: '#2563EB',
          label: 'Live Class',
          actionText: 'Join Class',
        };
      case 'QUIZ':
        return {
          chipBg: isDark ? 'rgba(239, 68, 68, 0.16)' : '#FEF2F2', // Dimmed soft rose
          chipBorder: isDark ? 'rgba(239, 68, 68, 0.45)' : '#FECACA',
          chipText: isDark ? '#FEE2E2' : '#991B1B', // Crisp high contrast red text
          accent: '#EF4444',
          tagBg: '#EF4444',
          btnBorder: '#DC2626',
          btnText: '#DC2626',
          label: 'Quiz',
          actionText: 'Take Quiz',
        };
      case 'ACTIVITY':
        return {
          chipBg: isDark ? 'rgba(16, 185, 129, 0.16)' : '#ECFDF5', // Dimmed soft emerald
          chipBorder: isDark ? 'rgba(16, 185, 129, 0.45)' : '#A7F3D0',
          chipText: isDark ? '#D1FAE5' : '#065F46', // Crisp high contrast green text
          accent: '#10B981',
          tagBg: '#10B981',
          btnBorder: '#059669',
          btnText: '#059669',
          label: 'Activity',
          actionText: 'View Activity',
        };
      case 'EXAM':
      default:
        return {
          chipBg: isDark ? 'rgba(245, 158, 11, 0.16)' : '#FFFBEB', // Dimmed soft amber
          chipBorder: isDark ? 'rgba(245, 158, 11, 0.45)' : '#FDE68A',
          chipText: isDark ? '#FEF3C7' : '#92400E', // Crisp high contrast amber text
          accent: '#F59E0B',
          tagBg: '#F59E0B',
          btnBorder: '#D97706',
          btnText: '#D97706',
          label: 'Examination',
          actionText: 'View Exam',
        };
    }
  };

  // Top 5 upcoming events: prioritizes other events (quizzes, activities, exams)
  // and backfills with live classes only if fewer than 5 other events are available.
  const upcomingEvents = useMemo(() => {
    const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

    // Filter events that occur today or in the future
    const futureEvents = filteredEvents.filter((ev) => {
      if (ev.dateStr) {
        return ev.dateStr >= todayStr;
      }
      return ev.day >= todayDate.getDate();
    });

    // Chronological comparator helper
    const sortChronological = (a: CalendarEvent, b: CalendarEvent) => {
      if (a.dateStr && b.dateStr && a.dateStr !== b.dateStr) {
        return a.dateStr.localeCompare(b.dateStr);
      }
      return a.day - b.day;
    };

    // Separate other events (quizzes, activities, exams) from classes
    const nonClassEvents = futureEvents
      .filter((ev) => ev.category !== 'LIVE_CLASS')
      .sort(sortChronological);

    const classEvents = futureEvents
      .filter((ev) => ev.category === 'LIVE_CLASS')
      .sort(sortChronological);

    // Prioritize non-classes, and backfill with classes up to 5 total
    const result: CalendarEvent[] = [...nonClassEvents.slice(0, 5)];
    const needed = 5 - result.length;
    if (needed > 0) {
      result.push(...classEvents.slice(0, needed));
    }

    // Sort final 5 events chronologically for clean presentation
    return result.sort(sortChronological);
  }, [filteredEvents, todayDate]);

  return (
    <div
      style={{
        width: '100%',
        paddingBottom: '40px',
        boxSizing: 'border-box',
        fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TOP BAR: Segmented Capsule & Month Stepper on Rich Gradient
         ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #155e75 45%, #2e2870 100%)',
          padding: '16px 24px',
          borderRadius: '18px',
          marginBottom: '22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Left: View Switcher Capsule (Day, Week, Month, Agenda) */}
        <div
          style={{
            display: 'inline-flex',
            padding: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.16)',
            backdropFilter: 'blur(10px)',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.22)',
          }}
        >
          {(['day', 'week', 'month', 'agenda'] as const).map((mode) => {
            const isActive = viewMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '7px 22px',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 700 : 500,
                  fontFamily: "'Outfit', sans-serif",
                  backgroundColor: isActive ? '#1E293B' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.92)',
                  boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.22)' : 'none',
                  transition: 'all 0.15s ease',
                  textTransform: 'capitalize',
                }}
              >
                {mode}
              </button>
            );
          })}
        </div>

        {/* Right: Controls (No Add Event button as requested) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Today Button */}
          <button
            type="button"
            onClick={handleToday}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              fontSize: '0.84rem',
              fontWeight: 600,
              fontFamily: "'Outfit', sans-serif",
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.15s ease',
            }}
          >
            <RotateCcw size={14} />
            <span>Today</span>
          </button>

          {/* Month Stepper Capsule */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '9999px',
              padding: '2px 4px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                padding: '6px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span
              style={{
                color: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: 700,
                padding: '0 10px',
                minWidth: '120px',
                textAlign: 'center',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {currentMonthTitle}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                padding: '6px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT: 2-COLUMN LAYOUT (CALENDAR + UPCOMING EVENTS)
         ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 330px',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* ─── LEFT: CALENDAR VIEW CONTAINER ─── */}
        <div style={{ minWidth: 0, width: '100%' }}>
          {viewMode === 'month' ? (
            /* Month Calendar Card matching screenshot */
            <div
              style={{
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderRadius: '20px',
                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                padding: '24px',
                boxSizing: 'border-box',
              }}
            >
              {/* Header inside Card: Month Title on Left, Filter by Course on Right */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '1.72rem',
                      fontWeight: 700,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontFamily: "'Outfit', sans-serif",
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {currentMonthTitle}
                  </h2>
                </div>

                {/* Filter by Course Dropdown */}
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    style={{
                      appearance: 'none',
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      borderRadius: '10px',
                      padding: '9px 38px 9px 16px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: isDark ? '#F8FAFC' : '#334155',
                      cursor: 'pointer',
                      outline: 'none',
                      fontFamily: "'Outfit', sans-serif",
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    <option value="ALL">Filter by Course</option>
                    {availableCourses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: isDark ? '#94A3B8' : '#64748B',
                    }}
                  />
                </div>
              </div>

              {/* Day of Week Row: Sun, Mon, Tue, Wed, Thu, Fri, Sat */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  textAlign: 'center',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: isDark ? '#CBD5E1' : '#334155',
                  paddingBottom: '14px',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                <div style={{ minWidth: 0, overflow: 'hidden' }}>Sun</div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>Mon</div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>Tue</div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>Wed</div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>Thu</div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>Fri</div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>Sat</div>
              </div>

              {/* Clear Visible Lines Separating Day Grids */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  gridAutoRows: 'minmax(195px, auto)',
                  backgroundColor: isDark ? '#334155' : '#CBD5E1', // Visible grid lines separating every cell!
                  gap: '1px',
                  border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {calendarGrid.map((cell, idx) => {
                  const dayEvents = filteredEvents.filter((ev) => {
                    if (ev.dateStr) {
                      return ev.dateStr === cell.dateKey;
                    }
                    return cell.isCurrentMonth && ev.day === cell.day;
                  });
                  const isToday = isActualToday(cell.day, cell.isCurrentMonth);

                  return (
                    <div
                      key={`${cell.dateKey}-${idx}`}
                      onClick={() => {
                        setSelectedDay(cell.day);
                        if (dayEvents.length > 0) {
                          setSelectedEvent(dayEvents[0]);
                        }
                      }}
                      style={{
                        backgroundColor: isToday
                          ? isDark
                            ? '#1E293B'
                            : '#FFFFFF'
                          : cell.isCurrentMonth
                          ? isDark
                            ? '#1E293B'
                            : '#FFFFFF'
                          : isDark
                          ? '#0F172A'
                          : '#FFFFFF',
                        minHeight: '195px',
                        padding: '10px 10px 12px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                        width: '100%',
                        position: 'relative',
                        cursor: cell.isCurrentMonth ? 'pointer' : 'default',
                        transition: 'background-color 0.12s ease',
                        boxSizing: 'border-box',
                      }}
                    >
                      {/* Highlighted Today outline frame matching reference */}
                      {isToday && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: '3px',
                            border: '1.5px solid #64748B',
                            borderRadius: '10px',
                            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : '#F1F5F9',
                            pointerEvents: 'none',
                            zIndex: 0,
                          }}
                        />
                      )}

                      {/* Top Row: Date Number */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '4px',
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        {isToday ? (
                          <div
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: '#1E293B',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.84rem',
                              fontWeight: 700,
                              fontFamily: "'Outfit', sans-serif",
                            }}
                          >
                            {cell.day}
                          </div>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.88rem',
                              fontWeight: cell.isCurrentMonth ? 600 : 500,
                              color: cell.isCurrentMonth
                                ? isDark
                                  ? '#F8FAFC'
                                  : '#1E293B'
                                : isDark
                                ? '#64748B'
                                : '#94A3B8',
                              fontFamily: "'Outfit', sans-serif",
                              paddingLeft: '3px',
                            }}
                          >
                            {cell.isCurrentMonth && cell.day === 1
                              ? `${currentMonthShort} 1`
                              : cell.day}
                          </span>
                        )}
                      </div>

                      {/* Event Chips List inside cell */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          flex: 1,
                          minWidth: 0,
                          width: '100%',
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        {dayEvents.map((ev) => {
                          const visuals = getEventVisuals(ev.category);
                          return (
                            <div
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(ev);
                              }}
                              style={{
                                backgroundColor: visuals.chipBg,
                                color: visuals.chipText,
                                border: `1px solid ${visuals.chipBorder}`,
                                borderLeft: `3.5px solid ${visuals.accent}`,
                                borderRadius: '7px',
                                padding: '6px 9px',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                fontFamily: "'Outfit', sans-serif",
                                lineHeight: 1.3,
                                minWidth: 0,
                                width: '100%',
                                boxSizing: 'border-box',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                boxShadow: isDark
                                  ? '0 1px 3px rgba(0, 0, 0, 0.25)'
                                  : '0 1px 2px rgba(15, 23, 42, 0.04)',
                                transition: 'all 0.12s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.filter = isDark ? 'brightness(1.15)' : 'brightness(0.96)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.filter = 'none';
                                e.currentTarget.style.transform = 'none';
                              }}
                              title={`${ev.time} • ${ev.title}`}
                            >
                              {ev.title}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : viewMode === 'week' ? (
            /* Week View: 7 columns for active week */
            <div
              style={{
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderRadius: '20px',
                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px 0', color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Week Overview
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '1px',
                  backgroundColor: isDark ? '#334155' : '#CBD5E1',
                  border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, index) => {
                  const dayEvents = filteredEvents.filter((ev) => (ev.day % 7) === index);
                  return (
                    <div
                      key={d}
                      style={{
                        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                        minHeight: '220px',
                        padding: '12px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A', marginBottom: '8px', textAlign: 'center' }}>
                        {d}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {dayEvents.map((ev) => {
                          const visuals = getEventVisuals(ev.category);
                          return (
                            <div
                              key={ev.id}
                              onClick={() => setSelectedEvent(ev)}
                              style={{
                                backgroundColor: visuals.chipBg,
                                color: visuals.chipText,
                                border: `1px solid ${visuals.chipBorder}`,
                                borderLeft: `3px solid ${visuals.accent}`,
                                borderRadius: '6px',
                                padding: '4px 8px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                fontFamily: "'Outfit', sans-serif",
                                cursor: 'pointer',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {ev.title}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : viewMode === 'day' ? (
            /* Day View: Today or selected day timeline */
            <div
              style={{
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderRadius: '20px',
                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px 0', color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Day Schedule: {currentMonthShort} {selectedDay || todayDate.getDate()}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredEvents
                  .filter((ev) => ev.day === (selectedDay || todayDate.getDate()))
                  .map((ev) => {
                    const visuals = getEventVisuals(ev.category);
                    return (
                      <div
                        key={ev.id}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          borderLeft: `5px solid ${visuals.chipBg}`,
                          backgroundColor: '#FFFFFF',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>{ev.time}</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>{ev.title}</div>
                        </div>
                        {ev.meetLink && (
                          <a
                            href={ev.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              border: '1.5px solid #2563EB',
                              borderRadius: '9999px',
                              color: '#2563EB',
                              backgroundColor: '#FFFFFF',
                              padding: '6px 18px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                            }}
                          >
                            Join Meet
                          </a>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            /* Agenda View */
            <div
              style={{
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderRadius: '20px',
                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px 0', color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Schedule Agenda for {currentMonthTitle}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[...filteredEvents]
                  .sort((a, b) => a.day - b.day)
                  .map((ev) => {
                    const visuals = getEventVisuals(ev.category);
                    return (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 18px',
                          borderRadius: '12px',
                          border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                          borderLeft: `4px solid ${visuals.chipBg}`,
                          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '8px',
                              backgroundColor: visuals.chipBg,
                              color: '#FFFFFF',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            <span style={{ fontSize: '0.62rem', textTransform: 'uppercase' }}>Day</span>
                            <span style={{ fontSize: '1.08rem', lineHeight: 1 }}>{ev.day}</span>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.94rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                              {ev.title}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                              <span>{ev.courseCode}</span> • <span>{ev.time}</span>
                            </div>
                          </div>
                        </div>

                        {ev.meetLink && (
                          <a
                            href={ev.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              border: '1.5px solid #2563EB',
                              borderRadius: '9999px',
                              color: '#2563EB',
                              backgroundColor: '#FFFFFF',
                              padding: '5px 16px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                            }}
                          >
                            Join Meet
                          </a>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT: SIDEBAR (FILTERS & UPCOMING EVENTS) ─── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
            position: 'sticky',
            top: '20px',
          }}
        >
          {/* 1. EVENT FILTERS CARD (ON TOP OF UPCOMING EVENTS) */}
          <div
            style={{
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderRadius: '20px',
              border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: isDark ? '1px solid #334155' : '1px solid #F1F5F9',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  fontFamily: "'Outfit', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Filter size={17} color="#2563EB" />
                <span>Event Filters</span>
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
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#2563EB',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {showLiveClasses && showQuizzes && showActivities && showExams ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Filter Toggle List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* 1. Classes */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  backgroundColor: showLiveClasses
                    ? (isDark ? 'rgba(67, 56, 202, 0.15)' : '#EEF2FF')
                    : (isDark ? '#0F172A' : '#F8FAFC'),
                  border: `1px solid ${
                    showLiveClasses
                      ? (isDark ? 'rgba(99, 102, 241, 0.4)' : '#C7D2FE')
                      : (isDark ? '#334155' : '#E2E8F0')
                  }`,
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: isDark ? '#F8FAFC' : '#1E293B',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={showLiveClasses}
                    onChange={(e) => setShowLiveClasses(e.target.checked)}
                    style={{ accentColor: '#4338CA', width: '15px', height: '15px', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#4338CA' }} />
                    <span>Classes</span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: '#4338CA',
                    fontWeight: 700,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}
                >
                  {allEvents.filter((e) => e.category === 'LIVE_CLASS').length}
                </span>
              </label>

              {/* 2. Quizzes */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  backgroundColor: showQuizzes
                    ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2')
                    : (isDark ? '#0F172A' : '#F8FAFC'),
                  border: `1px solid ${
                    showQuizzes
                      ? (isDark ? 'rgba(239, 68, 68, 0.4)' : '#FECACA')
                      : (isDark ? '#334155' : '#E2E8F0')
                  }`,
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: isDark ? '#F8FAFC' : '#1E293B',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={showQuizzes}
                    onChange={(e) => setShowQuizzes(e.target.checked)}
                    style={{ accentColor: '#EF4444', width: '15px', height: '15px', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                    <span>Quizzes</span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: '#DC2626',
                    fontWeight: 700,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}
                >
                  {allEvents.filter((e) => e.category === 'QUIZ').length}
                </span>
              </label>

              {/* 3. Activities */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  backgroundColor: showActivities
                    ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5')
                    : (isDark ? '#0F172A' : '#F8FAFC'),
                  border: `1px solid ${
                    showActivities
                      ? (isDark ? 'rgba(16, 185, 129, 0.4)' : '#A7F3D0')
                      : (isDark ? '#334155' : '#E2E8F0')
                  }`,
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: isDark ? '#F8FAFC' : '#1E293B',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={showActivities}
                    onChange={(e) => setShowActivities(e.target.checked)}
                    style={{ accentColor: '#10B981', width: '15px', height: '15px', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    <span>Activities</span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: '#059669',
                    fontWeight: 700,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}
                >
                  {allEvents.filter((e) => e.category === 'ACTIVITY').length}
                </span>
              </label>

              {/* 4. Virtual Office Hours */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  backgroundColor: showExams
                    ? (isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB')
                    : (isDark ? '#0F172A' : '#F8FAFC'),
                  border: `1px solid ${
                    showExams
                      ? (isDark ? 'rgba(245, 158, 11, 0.4)' : '#FDE68A')
                      : (isDark ? '#334155' : '#E2E8F0')
                  }`,
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: isDark ? '#F8FAFC' : '#1E293B',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={showExams}
                    onChange={(e) => setShowExams(e.target.checked)}
                    style={{ accentColor: '#F59E0B', width: '15px', height: '15px', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                    <span>Office Hours & Exams</span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: '#D97706',
                    fontWeight: 700,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}
                >
                  {allEvents.filter((e) => e.category === 'EXAM').length}
                </span>
              </label>
            </div>
          </div>

          {/* 2. "UPCOMING EVENTS" CARD */}
          <div
            style={{
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderRadius: '20px',
              border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Upcoming Events
              </h3>
              <span
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: isDark ? '#94A3B8' : '#64748B',
                  backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                }}
              >
                {upcomingEvents.length} upcoming
              </span>
            </div>

            {upcomingEvents.length === 0 ? (
              <div
                style={{
                  padding: '16px 14px',
                  borderRadius: '12px',
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  border: isDark ? '1px dashed #334155' : '1px dashed #CBD5E1',
                  fontSize: '0.84rem',
                  color: isDark ? '#94A3B8' : '#64748B',
                  textAlign: 'center',
                }}
              >
                No upcoming events scheduled
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upcomingEvents.map((ev) => {
                  const visuals = getEventVisuals(ev.category);
                  const linkUrl = ev.meetLink || (ev.category === 'LIVE_CLASS' ? 'https://meet.google.com/new' : undefined);

                  return linkUrl ? (
                    <a
                      key={ev.id}
                      href={linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Open link for ${ev.title}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                        border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                        borderLeft: `4px solid ${visuals.chipBg}`,
                        textDecoration: 'none',
                        color: isDark ? '#F8FAFC' : '#0F172A',
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? '#1E293B' : '#F8FAFC';
                        e.currentTarget.style.borderColor = visuals.chipBg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? '#0F172A' : '#FFFFFF';
                        e.currentTarget.style.borderColor = isDark ? '#334155' : '#E2E8F0';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: '0.92rem',
                            fontWeight: 600,
                            fontFamily: "'Outfit', sans-serif",
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {ev.title}
                        </span>
                      </div>
                      <ExternalLink size={15} color={visuals.chipBg} style={{ flexShrink: 0 }} />
                    </a>
                  ) : (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      title={`View ${ev.title}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                        border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                        borderLeft: `4px solid ${visuals.chipBg}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? '#1E293B' : '#F8FAFC';
                        e.currentTarget.style.borderColor = visuals.chipBg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? '#0F172A' : '#FFFFFF';
                        e.currentTarget.style.borderColor = isDark ? '#334155' : '#E2E8F0';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: '0.92rem',
                            fontWeight: 600,
                            fontFamily: "'Outfit', sans-serif",
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {ev.title}
                        </span>
                      </div>
                      <Calendar size={15} color={visuals.chipBg} style={{ flexShrink: 0 }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. EVENT INSPECTOR MODAL DIALOG
         ───────────────────────────────────────────────────────────── */}
      {selectedEvent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setSelectedEvent(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderRadius: '20px',
              border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.16)',
              padding: '28px',
              maxWidth: '480px',
              width: '100%',
              position: 'relative',
              animation: 'fadeIn 0.15s ease',
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>

            {/* Category tag */}
            <div style={{ marginBottom: '12px' }}>
              <span
                style={{
                  backgroundColor: getEventVisuals(selectedEvent.category).tagBg,
                  color: '#FFFFFF',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {selectedEvent.courseCode || getEventVisuals(selectedEvent.category).label}
              </span>
            </div>

            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: isDark ? '#F8FAFC' : '#0F172A',
                margin: '0 0 10px 0',
                fontFamily: "'Outfit', sans-serif",
                lineHeight: 1.3,
              }}
            >
              {selectedEvent.title}
            </h3>

            {/* Time badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: isDark ? '#CBD5E1' : '#334155',
                marginBottom: '16px',
              }}
            >
              <Clock size={15} color="#0055A5" />
              <span>
                Day {selectedEvent.day} • {selectedEvent.time}
              </span>
            </div>

            {/* Description */}
            {selectedEvent.description && (
              <p
                style={{
                  fontSize: '0.88rem',
                  color: isDark ? '#94A3B8' : '#475569',
                  lineHeight: 1.55,
                  margin: '0 0 24px 0',
                }}
              >
                {selectedEvent.description}
              </p>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '9999px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Close
              </button>

              {selectedEvent.meetLink ? (
                <a
                  href={selectedEvent.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 22px',
                    borderRadius: '9999px',
                    backgroundColor: '#0055A5',
                    color: '#FFFFFF',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontFamily: "'Outfit', sans-serif",
                    boxShadow: '0 2px 6px rgba(0, 85, 165, 0.25)',
                  }}
                >
                  <Video size={16} />
                  <span>Join Session</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 22px',
                    borderRadius: '9999px',
                    backgroundColor: '#D97706',
                    color: '#FFFFFF',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Mark as Viewed</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

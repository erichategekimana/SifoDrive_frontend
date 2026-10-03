import React, { useEffect, useState } from 'react';
import {
  Clock,
  MessageSquare,
  Video,
  Users,
  Search,
  ExternalLink,
  Send,
  X,
  AlertCircle,
  GraduationCap,
  Bell,
  Calendar,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { useTranslation } from '../../context/I18nContext';
import { TutorService, type TutorAssignedStudentDTO } from '../../core/services/TutorService';
import {
  TutorLmsService,
  type CohortSelectorItem,
  type CohortDeadlineItem,
} from '../../core/services/TutorLmsService';
import { LiveClassService } from '../../core/services/LiveClassService';
import { LiveClass } from '../../core/models/LiveClass';
import {
  SupportTicketService,
  type HelpTicketDTO,
  type SupportAnnouncementDTO,
} from '../../core/services/SupportTicketService';
import { Spinner } from '../../components/common/Spinner';

export const TutorDashboard: React.FC = () => {
  const { t } = useTranslation();

  // Operational Database State
  const [cohorts, setCohorts] = useState<CohortSelectorItem[]>([]);
  const [students, setStudents] = useState<TutorAssignedStudentDTO[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<LiveClass[]>([]);
  const [deadlines, setDeadlines] = useState<CohortDeadlineItem[]>([]);
  const [announcements, setAnnouncements] = useState<SupportAnnouncementDTO[]>([]);
  const [tickets, setTickets] = useState<HelpTicketDTO[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected ticket for modal / resolving
  const [selectedTicket, setSelectedTicket] = useState<HelpTicketDTO | null>(null);
  const [ticketResponse, setTicketResponse] = useState('');
  const [isSubmittingTicketResponse, setIsSubmittingTicketResponse] = useState(false);

  const loadAllOperationalData = async () => {
    setIsLoading(true);
    try {
      const [
        cohortsRes,
        studentsRes,
        classesRes,
        deadlinesRes,
        announcementsRes,
        ticketsRes,
      ] = await Promise.allSettled([
        TutorLmsService.getInstance().getTutorCohorts(),
        TutorService.getInstance().getAssignedStudents(),
        LiveClassService.getInstance().getClasses({ upcoming: true }),
        TutorLmsService.getInstance().getTutorDeadlines(),
        SupportTicketService.getInstance().getAnnouncements(),
        SupportTicketService.getInstance().getTickets(),
      ]);

      if (cohortsRes.status === 'fulfilled') setCohorts(cohortsRes.value || []);
      if (studentsRes.status === 'fulfilled') setStudents(studentsRes.value || []);
      if (classesRes.status === 'fulfilled') setUpcomingClasses(classesRes.value || []);
      if (deadlinesRes.status === 'fulfilled') setDeadlines(deadlinesRes.value || []);
      if (announcementsRes.status === 'fulfilled') setAnnouncements(announcementsRes.value || []);
      if (ticketsRes.status === 'fulfilled') setTickets(ticketsRes.value || []);
    } catch (err) {
      console.error('Failed to load tutor dashboard operational data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllOperationalData();
  }, []);

  const handleResolveTicket = async (ticketId: string) => {
    if (!ticketResponse.trim()) return;
    setIsSubmittingTicketResponse(true);
    try {
      const updated = await SupportTicketService.getInstance().resolveTicket(
        ticketId,
        ticketResponse.trim(),
        'RESOLVED'
      );
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, ...updated, status: 'RESOLVED' } : t)));
      setSelectedTicket(null);
      setTicketResponse('');
    } catch (err) {
      console.error('Failed to resolve ticket:', err);
    } finally {
      setIsSubmittingTicketResponse(false);
    }
  };

  if (isLoading) {
    return <Spinner message={t('dashboard.tutor.loadingConsole')} />;
  }

  const filteredStudents = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone_number?.includes(searchTerm) ||
      (s.student_id && s.student_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.cohort_name && s.cohort_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* ━━━━━━━━ TOP BLOCK: Upcoming Live Classes ━━━━━━━━ */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <Video size={18} style={{ color: 'var(--text-primary)' }} />
            <h2 style={{ fontSize: '1.04rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              {t('dashboard.tutor.upcomingClassesTitle')}
            </h2>
          </div>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            {upcomingClasses.length} {upcomingClasses.length === 1 ? 'session' : 'sessions'}
          </span>
        </div>

        <div style={{ padding: '18px 22px' }}>
          {upcomingClasses.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '14px',
              }}
            >
              {upcomingClasses.map((cls) => (
                <div
                  key={cls.id}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.02rem', color: 'var(--text-primary)' }}>
                        {cls.title}
                      </div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                        {cls.cohortName}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cls.status}
                    </span>
                  </div>

                  {cls.topic && (
                    <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                      {cls.topic}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '4px',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
                      <span>{cls.scheduledDate} • {cls.getFormattedTimeRange()}</span>
                    </div>

                    {cls.googleMeetUrl && (
                      <a
                        href={cls.googleMeetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.84rem',
                          padding: '6px 16px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#058728',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <Video size={14} />
                        <span>Launch Classroom</span>
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              No upcoming live classes scheduled.
            </div>
          )}
        </div>
      </div>

      {/* Pure Dashboard Contents (Canvas Professional 2-Column Grid, Zero Sections) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.7fr) minmax(0, 1fr)',
          gap: '22px',
          alignItems: 'start',
        }}
      >
        {/* ━━━━━━━━ LEFT COLUMN: Cohorts, Learner Progresses & Tickets ━━━━━━━━ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* 1. Assigned Cohorts & Schedules */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div
              style={{
                padding: '16px 22px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-elevated)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Users size={18} style={{ color: 'var(--text-primary)' }} />
                <h2 style={{ fontSize: '1.04rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {t('dashboard.tutor.assignedCohortsTitle')}
                </h2>
              </div>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                {cohorts.length} assigned
              </span>
            </div>

            {/* Elevated Cohort Items */}
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cohorts.length > 0 ? (
                cohorts.map((c) => {
                  const enrolled = c.student_count || 0;
                  const capacity = c.max_capacity || 60;
                  const occupancyPercent = Math.min(100, Math.round((enrolled / capacity) * 100));

                  return (
                    <div
                      key={c.id}
                      style={{
                        padding: '16px 18px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface-elevated)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '11px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '1.02rem', color: 'var(--text-primary)' }}>
                              {c.name}
                            </span>
                            {c.identifier && (
                              <span
                                style={{
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  fontFamily: 'monospace',
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  background: 'var(--bg-surface)',
                                  border: '1px solid var(--border-subtle)',
                                  color: 'var(--text-primary)',
                                }}
                              >
                                ID: {c.identifier}
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', color: 'var(--text-primary)', marginTop: '5px' }}>
                            <Calendar size={15} style={{ color: '#0284c7' }} />
                            <span style={{ fontWeight: 500 }}>{c.schedule_description || `${c.start_date || '—'} to ${c.end_date || '—'}`}</span>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-sm)',
                            background: c.is_active ? 'rgba(5, 135, 40, 0.08)' : 'var(--bg-surface)',
                            border: c.is_active ? '1px solid rgba(5, 135, 40, 0.25)' : '1px solid var(--border-subtle)',
                            color: c.is_active ? '#047857' : 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            textTransform: 'capitalize',
                          }}
                        >
                          {c.status || (c.is_active ? 'Active' : 'Inactive')}
                        </span>
                      </div>

                      {/* Enrollment Capacity & Direct Studio Action */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          paddingTop: '10px',
                          borderTop: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 auto' }}>
                          <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                            Enrolled: <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{enrolled} / {capacity}</strong> ({occupancyPercent}%)
                          </span>
                          <div
                            style={{
                              flex: '0 1 140px',
                              height: '7px',
                              background: 'var(--border-subtle)',
                              borderRadius: '4px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${occupancyPercent}%`,
                                background: '#0284c7',
                                borderRadius: '4px',
                              }}
                            />
                          </div>
                        </div>

                        <a
                          href="/tutor"
                          className="btn btn-secondary btn-sm"
                          style={{
                            fontSize: '0.80rem',
                            padding: '5px 14px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <BookOpen size={13} />
                          <span>Cohort Studio</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  No assigned cohorts found in database.
                </div>
              )}
            </div>
          </div>

          {/* 2. Learner Progresses & Exam Readiness */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div
              style={{
                padding: '16px 22px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-elevated)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <GraduationCap size={18} style={{ color: 'var(--text-primary)' }} />
                <h2 style={{ fontSize: '1.04rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {t('dashboard.tutor.learnerProgressTitle')}
                </h2>
              </div>

              {/* Filter Search */}
              <div style={{ position: 'relative', width: '290px' }}>
                <Search
                  size={15}
                  style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-secondary)' }}
                />
                <input
                  type="text"
                  placeholder="Search students by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    fontSize: '0.86rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: '2px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)',
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <th style={{ padding: '12px 20px', fontWeight: 800 }}>{t('dashboard.tutor.colStudent')}</th>
                    <th style={{ padding: '12px 16px', fontWeight: 800 }}>ID</th>
                    <th style={{ padding: '12px 16px', fontWeight: 800 }}>Cohort</th>
                    <th style={{ padding: '12px 16px', fontWeight: 800 }}>{t('dashboard.student.liveAttendance')}</th>
                    <th style={{ padding: '12px 16px', fontWeight: 800 }}>{t('dashboard.tutor.colProgress')}</th>
                    <th style={{ padding: '12px 20px', fontWeight: 800 }}>Readiness</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => {
                      const attRate = s.attendance_rate || 0;
                      const initials = s.full_name
                        ? s.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                        : 'ST';

                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: 'var(--radius-full)',
                                  background: 'var(--bg-surface)',
                                  border: '1px solid var(--border-subtle)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                  color: 'var(--text-primary)',
                                  flexShrink: 0,
                                }}
                              >
                                {initials}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.94rem' }}>
                                  {s.full_name}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                  {s.phone_number}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {s.student_id ? (
                              <span
                                style={{
                                  fontFamily: 'monospace',
                                  fontSize: '0.80rem',
                                  fontWeight: 700,
                                  color: 'var(--text-primary)',
                                  background: 'var(--bg-surface-elevated)',
                                  border: '1px solid var(--border-subtle)',
                                  padding: '3px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                }}
                              >
                                {s.student_id}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontSize: '0.86rem' }}>
                            {s.cohort_identifier ? `${s.cohort_identifier} • ` : ''}{s.cohort_name || '—'}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.94rem' }}>
                              {Math.round(attRate * 100)}%
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                              <div
                                style={{
                                  flex: '1 1 80px',
                                  height: '7px',
                                  background: 'var(--border-subtle)',
                                  borderRadius: '4px',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${Math.min(100, Math.round((s.module_completion || 0) * 100))}%`,
                                    background: '#0284c7',
                                    borderRadius: '4px',
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {Math.round((s.module_completion || 0) * 100)}%
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            {s.exam_eligible ? (
                              <span
                                style={{
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  padding: '4px 10px',
                                  borderRadius: 'var(--radius-sm)',
                                  background: 'rgba(5, 135, 40, 0.08)',
                                  border: '1px solid rgba(5, 135, 40, 0.25)',
                                  color: '#047857',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <CheckCircle2 size={13} />
                                <span>Eligible</span>
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  padding: '4px 10px',
                                  borderRadius: 'var(--radius-sm)',
                                  background: 'var(--bg-surface-elevated)',
                                  border: '1px solid var(--border-subtle)',
                                  color: 'var(--text-secondary)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <Clock size={13} />
                                <span>In Progress</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {searchTerm ? t('dashboard.canvas.noResults') : 'No assigned learners enrolled yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ━━━━━━━━ RIGHT COLUMN: Student Inquiries, Deadlines, Announcements ━━━━━━━━ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* 1. Student Inquiries & Support Tickets */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div
              style={{
                padding: '16px 22px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-elevated)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <MessageSquare size={18} style={{ color: 'var(--text-primary)' }} />
                <h2 style={{ fontSize: '1.04rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {t('dashboard.tutor.ticketsTitle')}
                </h2>
              </div>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                {tickets.length} total
              </span>
            </div>

            {/* Elevated Ticket Cards */}
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {tickets.length > 0 ? (
                tickets.map((tkt) => {
                  const isUrgent = tkt.priority === 'HIGH' || tkt.priority === 'URGENT';
                  const isResolved = tkt.status === 'RESOLVED';

                  return (
                    <div
                      key={tkt.id}
                      style={{
                        padding: '16px 18px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface-elevated)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1.0rem', color: 'var(--text-primary)' }}>
                            {tkt.subject}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                            From: <strong style={{ color: 'var(--text-primary)' }}>{tkt.user_name || 'Student'}</strong> • Priority:{' '}
                            <span
                              style={{
                                fontWeight: 700,
                                color: isUrgent ? '#dc2626' : 'var(--text-primary)',
                              }}
                            >
                              {tkt.priority}
                            </span>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background: isResolved ? 'rgba(5, 135, 40, 0.1)' : 'var(--bg-surface)',
                            border: isResolved ? '1px solid rgba(5, 135, 40, 0.25)' : '1px solid var(--border-subtle)',
                            color: isResolved ? '#047857' : 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            textTransform: 'uppercase',
                          }}
                        >
                          {tkt.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                        {tkt.message}
                      </div>

                      {tkt.response && (
                        <div
                          style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '10px 12px',
                            fontSize: '0.82rem',
                            color: 'var(--text-primary)',
                            borderLeft: '3px solid #058728',
                          }}
                        >
                          <strong style={{ color: '#047857' }}>Instructor Reply:</strong> {tkt.response}
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '4px',
                          paddingTop: '10px',
                          borderTop: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', color: 'var(--text-secondary)' }}>
                          <Clock size={13} />
                          <span>{tkt.created_at ? new Date(tkt.created_at).toLocaleDateString() : '—'}</span>
                        </div>

                        {!isResolved ? (
                          <button
                            onClick={() => {
                              setSelectedTicket(tkt);
                              setTicketResponse('');
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.80rem',
                              padding: '4px 12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontWeight: 600,
                            }}
                          >
                            <MessageSquare size={13} />
                            <span>Reply to Student</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedTicket(tkt)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.78rem',
                              padding: '3px 10px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            <span>View Thread</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  No student inquiry tickets in database.
                </div>
              )}
            </div>
          </div>

          {/* 2. Approaching Deadlines */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div
              style={{
                padding: '16px 22px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-elevated)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <AlertCircle size={18} style={{ color: 'var(--text-primary)' }} />
                <h2 style={{ fontSize: '1.04rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {t('dashboard.tutor.approachingDeadlinesTitle')}
                </h2>
              </div>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                {deadlines.length} due
              </span>
            </div>

            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {deadlines.length > 0 ? (
                deadlines.map((dl) => (
                  <div
                    key={dl.id}
                    style={{
                      padding: '16px 18px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.02rem', color: 'var(--text-primary)' }}>
                          {dl.title}
                        </div>
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                          {dl.cohort_identifier ? `${dl.cohort_identifier} • ` : ''}{dl.cohort_name}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {dl.type}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '4px',
                        paddingTop: '10px',
                        borderTop: '1px solid var(--border-subtle)',
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
                        <span>Due: <strong style={{ color: 'var(--text-primary)' }}>{dl.due_date ? new Date(dl.due_date).toLocaleDateString() : '—'}</strong></span>
                      </div>

                      <a
                        href="/tutor"
                        className="btn btn-secondary btn-sm"
                        style={{
                          fontSize: '0.80rem',
                          padding: '4px 12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontWeight: 600,
                          textDecoration: 'none',
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <BookOpen size={12} />
                        <span>Review</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: '28px 24px',
                    textAlign: 'center',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(5, 135, 40, 0.1)',
                      border: '1px solid rgba(5, 135, 40, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#058728',
                    }}
                  >
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      All Deadlines Clear
                    </div>
                    <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '280px', marginTop: '5px', lineHeight: '1.45' }}>
                      No approaching activity or quiz deadlines across your assigned cohorts.
                    </div>
                  </div>
                  <a
                    href="/tutor"
                    style={{
                      fontSize: '0.82rem',
                      color: '#0284c7',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      marginTop: '4px',
                    }}
                  >
                    <span>View Cohort Curriculum</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 3. Announcements & Bulletins */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div
              style={{
                padding: '16px 22px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-elevated)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Bell size={18} style={{ color: 'var(--text-primary)' }} />
                <h2 style={{ fontSize: '1.04rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {t('dashboard.tutor.announcementsTitle')}
                </h2>
              </div>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                {announcements.length}
              </span>
            </div>

            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {announcements.length > 0 ? (
                announcements.map((ann) => (
                  <div
                    key={ann.id}
                    style={{
                      padding: '16px 18px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ fontWeight: 700, fontSize: '1.0rem', color: 'var(--text-primary)' }}>
                        {ann.title}
                      </div>
                      <span
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          textTransform: 'uppercase',
                        }}
                      >
                        {ann.category}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', opacity: 0.9, lineHeight: '1.55' }}>
                      {ann.content}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '4px',
                        paddingTop: '10px',
                        borderTop: '1px solid var(--border-subtle)',
                        fontSize: '0.80rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} />
                        <span>{ann.author}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} />
                        <span>{ann.date}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  No announcements available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ticket View & Response Modal */}
      {selectedTicket && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              width: '100%',
              maxWidth: '560px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} style={{ color: 'var(--text-primary)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Student Inquiry
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {selectedTicket.subject}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                From: <strong style={{ color: 'var(--text-primary)' }}>{selectedTicket.user_name || 'Student'}</strong> ({selectedTicket.user_phone || '—'}) • Priority:{' '}
                <span
                  style={{
                    fontWeight: 600,
                    color: selectedTicket.priority === 'HIGH' || selectedTicket.priority === 'URGENT' ? '#dc2626' : 'inherit',
                  }}
                >
                  {selectedTicket.priority}
                </span>
              </div>
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  fontSize: '0.86rem',
                  color: 'var(--text-primary)',
                  lineHeight: '1.45',
                }}
              >
                {selectedTicket.message}
              </div>
            </div>

            {selectedTicket.status === 'RESOLVED' && selectedTicket.response ? (
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Your Resolution Response:
                </label>
                <div
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                    fontSize: '0.86rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  {selectedTicket.response}
                </div>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Write Response to Student:
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide clarification, guidance, or reference to regulations..."
                  value={ticketResponse}
                  onChange={(e) => setTicketResponse(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={() => setSelectedTicket(null)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.82rem' }}
              >
                Close
              </button>

              {selectedTicket.status !== 'RESOLVED' && (
                <button
                  onClick={() => handleResolveTicket(selectedTicket.id)}
                  disabled={isSubmittingTicketResponse || !ticketResponse.trim()}
                  className="btn btn-primary btn-sm"
                  style={{
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Send size={14} />
                  <span>{isSubmittingTicketResponse ? 'Sending...' : 'Send & Resolve'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

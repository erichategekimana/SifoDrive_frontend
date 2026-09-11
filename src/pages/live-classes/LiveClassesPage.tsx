import React, { useEffect, useState } from 'react';
import { Video, Calendar, Clock, UserCheck, ExternalLink } from 'lucide-react';
import { LiveClassService } from '../../core/services/LiveClassService';
import { LiveClass } from '../../core/models/LiveClass';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { useTranslation } from '../../context/I18nContext';

export const LiveClassesPage: React.FC = () => {
  const { t, language } = useTranslation();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [attendance, setAttendance] = useState<{ attendance_rate: number; total_sessions: number; attended: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      const isRw = language === 'rw';
      try {
        const liveService = LiveClassService.getInstance();
        const [classList, attSummary] = await Promise.all([
          liveService.getClasses(),
          liveService.getAttendanceSummary(),
        ]);
        if (classList.length === 0) {
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
            new LiveClass({
              id: 'cls-demo-2',
              title: isRw
                ? 'Ubukanishi bw’Ikinyabiziga n’Umutekano mu Muhanda'
                : 'Vehicle Mechanics & Emergency Highway Safety',
              topic: isRw
                ? 'Ibizamini by’amatara, feri, amapine, n’ubutabazi bw’ibanze mu gihe cy’impanuka.'
                : 'Braking distance calculations, tire tread safety limits, and emergency accident reporting.',
              cohort_name: isRw ? 'Itsinda rya Mutarama — Kigali' : 'Cohort A — Kigali Central',
              tutor_name: 'Alice Mukamana (Certified Inspector)',
              scheduled_date: '2026-09-14',
              start_time: '19:00',
              end_time: '20:15',
              google_meet_url: 'https://meet.google.com/xyz-sifo-drive',
              status: 'SCHEDULED',
            }),
          ]);
        } else {
          setClasses(classList);
        }
        setAttendance(attSummary);
      } catch {
        // Fallback demo classes
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
        setAttendance({ attendance_rate: 80, total_sessions: 5, attended: 4 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [language]);

  if (isLoading) {
    return <Spinner message={t('common.loading')} />;
  }

  const isEligible = (attendance?.attendance_rate ?? 80) >= 75;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Badge variant="info">{t('liveClasses.badge')}</Badge>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t('liveClasses.interactiveTitle')}
          </span>
        </div>
        <h1>{t('liveClasses.title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '6px' }}>
          {t('liveClasses.subtitle')}
        </p>
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
            <h3 style={{ fontSize: '1.15rem' }}>{t('liveClasses.attendanceTitle')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
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

      {/* Classes Timetable */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.3rem' }}>{t('liveClasses.upcomingClasses')}</h2>

        {classes.map((cls) => {
          const badge = cls.getStatusBadge();

          return (
            <Card key={cls.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div style={{ maxWidth: '700px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Badge variant={badge.variant}>
                      {cls.status === 'SCHEDULED'
                        ? t('liveClasses.scheduled')
                        : cls.isLiveNow()
                        ? t('liveClasses.liveNow')
                        : t('liveClasses.completed')}
                    </Badge>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {cls.cohortName}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>{cls.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                    {cls.topic}
                  </p>

                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={16} color="var(--primary)" />
                      <span>{cls.scheduledDate}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={16} color="var(--accent-500)" />
                      <span>{cls.getFormattedTimeRange()}</span>
                    </div>
                    <div>
                      {t('liveClasses.tutorLabel')}{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{cls.tutorName}</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <a
                    href={cls.googleMeetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Video size={18} />
                    <span>{t('liveClasses.launchMeet')}</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Video,
  Calendar,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';
import { LmsService, type ProgressSummaryDTO } from '../../core/services/LmsService';
import { LiveClassService } from '../../core/services/LiveClassService';
import { BookingService } from '../../core/services/BookingService';
import { LiveClass } from '../../core/models/LiveClass';
import { Booking } from '../../core/models/Booking';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Spinner } from '../../components/common/Spinner';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [progress, setProgress] = useState<ProgressSummaryDTO | null>(null);
  const [upcomingClasses, setUpcomingClasses] = useState<LiveClass[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [progData, classesData, bookingsData] = await Promise.all([
          LmsService.getInstance().getProgressSummary(),
          LiveClassService.getInstance().getClasses(),
          BookingService.getInstance().getMyBookings(),
        ]);
        setProgress(progData);
        setUpcomingClasses(classesData);
        setMyBookings(bookingsData);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const nextClass = upcomingClasses.find((c) => c.isJoinable()) || upcomingClasses[0];
  const activeBooking = myBookings[0];

  if (isLoading) {
    return <Spinner message={t('common.loading')} />;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'radial-gradient(ellipse at 80% 50%, rgba(16, 185, 129, 0.12), transparent 70%)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-light)' }}>
              {t('dashboard.greeting')}
            </span>
            <Badge variant={user?.isStudent() ? 'success' : 'neutral'}>
              {user?.isStudent() ? t('roles.student') : user?.isGuest() ? t('roles.guest') : user?.getRoleDisplay()}
            </Badge>
          </div>
          <h1>{user?.fullName}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '6px' }}>
            {user?.isStudent()
              ? t('dashboard.welcomeSubStudent')
              : t('dashboard.welcomeSubGuest')}
          </p>
        </div>

        {user?.isGuest() && (
          <Link to="/register" className="btn btn-accent btn-md">
            <Sparkles size={18} />
            <span>{t('dashboard.upgradeToStudent')}</span>
          </Link>
        )}
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-4">
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {t('dashboard.theoryProgress')}
            </span>
            <BookOpen size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {progress?.progress_percentage ?? 28}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {progress?.completed_lessons ?? 4} / {progress?.total_lessons ?? 15} {t('dashboard.lessonsCompleted')}
          </div>
          <div
            style={{
              marginTop: '12px',
              height: '6px',
              background: 'var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress?.progress_percentage ?? 28}%`,
                height: '100%',
                background: 'var(--primary)',
                borderRadius: 'var(--radius-full)',
              }}
            />
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {t('dashboard.quizAverage')}
            </span>
            <TrendingUp size={20} color="var(--accent-500)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {progress?.average_quiz_score ?? 85}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {progress?.quizzes_taken ?? 3} {t('dashboard.quizzesTaken')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '8px', fontWeight: 600 }}>
            {t('dashboard.abovePassMark')}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {t('dashboard.liveAttendance')}
            </span>
            <Video size={20} color="var(--secondary-500)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>80%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            4 / 5 {t('dashboard.sessionsAttended')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary-light)', marginTop: '8px', fontWeight: 600 }}>
            {t('dashboard.meetsExamCriteria')}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {t('dashboard.iremboStatus')}
            </span>
            <Calendar size={20} color="var(--warning)" />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {activeBooking ? activeBooking.getStatusBadge().label : t('dashboard.noActiveBooking')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {activeBooking ? activeBooking.ticketNumber : t('booking.badge')}
          </div>
          <Link
            to="/booking"
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--primary-light)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '10px',
            }}
          >
            {activeBooking ? t('dashboard.trackStatus') : t('dashboard.bookTestSlot')} <ArrowRight size={14} />
          </Link>
        </Card>
      </div>

      {/* Main Content Split: Next Live Class & Resume Learning */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Next Live Class Banner */}
        <Card style={{ border: '1px solid var(--border-medium)', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: 'var(--danger)',
                boxShadow: '0 0 8px var(--danger)',
              }}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--danger)' }}>
              {t('dashboard.nextLiveClass')}
            </span>
          </div>

          {nextClass ? (
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>{nextClass.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '18px' }}>
                {nextClass.topic}
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  background: 'var(--bg-surface-elevated)',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('dashboard.dateTime')}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {nextClass.scheduledDate} • {nextClass.getFormattedTimeRange()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('dashboard.instructor')}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {nextClass.tutorName}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <a
                  href={nextClass.googleMeetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <Video size={18} />
                  <span>{t('dashboard.joinGoogleMeet')}</span>
                </a>
                <Link to="/live-classes" className="btn btn-secondary">
                  <span>{t('dashboard.viewSchedule')}</span>
                </Link>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>{t('liveClasses.upcomingClasses')}</p>
          )}
        </Card>

        {/* Quick Tools & Shortcuts */}
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>{t('dashboard.quickShortcuts')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link
                to="/road-signs"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Compass size={20} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {t('nav.roadSigns')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t('dashboard.roadSignsDesc')}
                    </div>
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </Link>

              <Link
                to="/courses"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <BookOpen size={20} color="var(--accent-500)" />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {t('dashboard.universalTheory')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t('dashboard.universalTheoryDesc')}
                    </div>
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </Link>
            </div>
          </div>

          <div
            style={{
              marginTop: '20px',
              padding: '14px',
              background: 'var(--primary-glow)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Award size={24} color="var(--primary-light)" />
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{t('dashboard.examReady')}</span>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                {t('dashboard.examReadySub')}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

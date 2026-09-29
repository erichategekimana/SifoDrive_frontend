import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarCheck2,
  GraduationCap,
  Award,
  BookOpen,
  ArrowRight,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import type { AdminDashboardStats, BookingOrderItem, LiveClassAdminItem } from '../../../core/services/AdminService';
import { useTranslation } from '../../../context/I18nContext';

interface SystemAdminViewProps {
  stats: AdminDashboardStats;
  liveClasses: LiveClassAdminItem[];
  bookings: BookingOrderItem[];
}

export const SystemAdminView: React.FC<SystemAdminViewProps> = ({
  stats,
  liveClasses,
  bookings,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* 5 Core Basic Info KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
        }}
      >
        {/* 1. Total Registered Users */}
        <div
          style={{
            background: 'var(--bg-surface)',
            padding: '18px 20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Registered Users
            </span>
            <Users size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {stats.total_registered_users}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            All platform accounts
          </div>
        </div>

        {/* 2. Total Booking Orders */}
        <div
          style={{
            background: 'var(--bg-surface)',
            padding: '18px 20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Booking Orders
            </span>
            <CalendarCheck2 size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {stats.total_booking_orders}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Driving test applications
          </div>
        </div>

        {/* 3. Enrolled Students */}
        <div
          style={{
            background: 'var(--bg-surface)',
            padding: '18px 20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Enrolled Students
            </span>
            <GraduationCap size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {stats.enrolled_students}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Active full students
          </div>
        </div>

        {/* 4. Total Graduated Students */}
        <div
          style={{
            background: 'var(--bg-surface)',
            padding: '18px 20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Graduated Students
            </span>
            <Award size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {stats.total_graduated_students}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Completed & certified
          </div>
        </div>

        {/* 5. LMS Courses */}
        <div
          style={{
            background: 'var(--bg-surface)',
            padding: '18px 20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('admin.dashboard.lmsCourses')}
            </span>
            <BookOpen size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {stats.lms_courses}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t('admin.dashboard.curriculumCourses')}
          </div>
        </div>
      </div>

      {/* Ongoing & Scheduled Classes Section */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '22px 24px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Classes
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
              Ongoing and scheduled live classes.
            </p>
          </div>

          <Link
            to="/admin/live-classes"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Manage Live Classes</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {liveClasses.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            <Clock size={22} style={{ opacity: 0.4, marginBottom: '6px' }} />
            <div>No live classes currently ongoing or scheduled.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Topic</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Cohort</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Instructor</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Schedule (CAT)</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {liveClasses.map((cls) => (
                  <tr key={cls.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{cls.title}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{cls.cohort_name || 'General Cohort'}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{cls.tutor_name || 'Assigned Instructor'}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {cls.scheduled_at || cls.scheduled_date
                        ? new Date(cls.scheduled_at || cls.scheduled_date || '').toLocaleString('en-RW', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : 'Scheduled'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge variant={cls.status === 'IN_PROGRESS' ? 'success' : 'info'}>
                        {cls.status === 'IN_PROGRESS' ? 'In Progress' : 'Scheduled'}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      {cls.meeting_link ? (
                        <a
                          href={cls.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '3px 8px' }}
                        >
                          <span>Join Meet</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <Link to="/admin/live-classes" style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', textDecoration: 'none' }}>
                          Details
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Booking Applications Section */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '22px 24px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Recent Booking Applications
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
              Driving test applications submitted through the concierge.
            </p>
          </div>

          <Link
            to="/admin/bookings"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>View Full Queue</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No active booking applications in queue.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Applicant</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>District</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Assigned Agent</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div>{b.applicant_name || 'Learner Applicant'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.applicant_phone}</div>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      Category {b.category}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{b.district}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge
                        variant={
                          b.status === 'COMPLETED'
                            ? 'success'
                            : b.status === 'PAID' || b.status === 'CODE_GENERATED'
                            ? 'info'
                            : b.status === 'PENDING' || b.status === 'SUBMITTED'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {b.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                      {b.assigned_agent?.full_name || (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'right' }}>
                      {new Date(b.created_at).toLocaleDateString('en-RW')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

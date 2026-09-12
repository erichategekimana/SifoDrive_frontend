import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarCheck2,
  BookOpen,
  GraduationCap,
  Award,
  Send,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Clock,
  UserCheck,
  ShieldCheck,
  Video,
} from 'lucide-react';
import {
  AdminService,
  type AdminDashboardStats,
  type BookingOrderItem,
  type LiveClassAdminItem,
} from '../../core/services/AdminService';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { BroadcastModal } from '../../components/admin/BroadcastModal';

export const AdminDashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<AdminDashboardStats>({
    total_registered_users: 0,
    total_booking_orders: 0,
    enrolled_students: 0,
    total_graduated_students: 0,
    lms_courses: 0,
  });
  const [bookings, setBookings] = useState<BookingOrderItem[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClassAdminItem[]>([]);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState<boolean>(false);

  const adminService = AdminService.getInstance();

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, bookingsRes, classesRes] = await Promise.allSettled([
        adminService.getDashboardStats(),
        adminService.getBookingOrders(),
        adminService.getLiveClasses(),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }

      if (bookingsRes.status === 'fulfilled') {
        setBookings(bookingsRes.value.results.slice(0, 5));
      }

      if (classesRes.status === 'fulfilled') {
        const relevant = classesRes.value
          .filter((c) => c.status === 'IN_PROGRESS' || c.status === 'SCHEDULED')
          .sort((a, b) => {
            if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1;
            if (b.status === 'IN_PROGRESS' && a.status !== 'IN_PROGRESS') return 1;
            return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
          });
        setLiveClasses(relevant.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed loading Command Center metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            System Command Center
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Platform overview of users, driving test bookings, curriculum courses, and live classes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={loadDashboardData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Refresh metrics"
          >
            <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsBroadcastOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Send size={13} />
            <span>Broadcast SMS</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Spinner message="Loading platform metrics..." />
        </div>
      ) : (
        <>
          {/* 5 Core Basic Info KPI Cards (Clean, Professional & Restrained) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
            }}
          >
            {/* 1. Total Registered Users */}
            <div
              className="glass-panel"
              style={{
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
              className="glass-panel"
              style={{
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
              className="glass-panel"
              style={{
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
              className="glass-panel"
              style={{
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
              className="glass-panel"
              style={{
                padding: '18px 20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  LMS Courses
                </span>
                <BookOpen size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {stats.lms_courses}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Curriculum courses
              </div>
            </div>
          </div>

          {/* Ongoing & Scheduled Classes Section */}
          <div
            className="glass-panel"
            style={{
              padding: '22px 24px',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Ongoing & Scheduled Classes
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
                  Live Google Meet tutoring sessions and upcoming cohort classes.
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
              <div
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.88rem',
                }}
              >
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
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {cls.title}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                          {cls.cohort_name || 'General Cohort'}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                          {cls.tutor_name || 'Assigned Instructor'}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {new Date(cls.scheduled_at).toLocaleString('en-RW', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
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
                            <Link
                              to="/admin/live-classes"
                              style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', textDecoration: 'none' }}
                            >
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
            className="glass-panel"
            style={{
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

              {/* "View Full Queue" button matches "Manage Live Classes" button style exactly */}
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
              <div
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.88rem',
                }}
              >
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
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
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

          {/* Quick Shortcuts Grid (Clean & Subdued) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <Link
              to="/admin/users"
              className="glass-panel"
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all var(--transition-fast)',
              }}
            >
              <UserCheck size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  User Management
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Accounts & roles
                </p>
              </div>
            </Link>

            <Link
              to="/admin/courses"
              className="glass-panel"
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all var(--transition-fast)',
              }}
            >
              <BookOpen size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  LMS Studio
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Curriculum & signs
                </p>
              </div>
            </Link>

            <Link
              to="/admin/live-classes"
              className="glass-panel"
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Video size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Live Classes
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Google Meet sessions
                </p>
              </div>
            </Link>

            <Link
              to="/admin/audit"
              className="glass-panel"
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all var(--transition-fast)',
              }}
            >
              <ShieldCheck size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Security & Audit
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Cryptographic verification
                </p>
              </div>
            </Link>
          </div>
        </>
      )}

      {/* Broadcast Modal */}
      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        onSuccess={() => loadDashboardData()}
      />
    </div>
  );
};

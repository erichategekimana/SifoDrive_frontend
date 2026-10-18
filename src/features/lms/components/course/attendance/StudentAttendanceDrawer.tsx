import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
} from 'lucide-react';
import {
  LiveClassService,
  type StudentAttendanceDetailDTO,
  type ClassAttendanceItem,
} from '../../../../../core/services/LiveClassService';
import { Spinner } from '../../../../../components/common/Spinner';

interface StudentAttendanceDrawerProps {
  studentId: string | null;
  onClose: () => void;
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'PRESENT':
      return { label: 'Present', bg: '#DCFCE7', fg: '#15803D', border: '#86EFAC' };
    case 'LATE':
      return { label: 'Late', bg: '#FEF3C7', fg: '#B45309', border: '#FDE68A' };
    case 'ABSENT':
      return { label: 'Absent', bg: '#FEE2E2', fg: '#B91C1C', border: '#FECACA' };
    case 'EXCUSED':
      return { label: 'Excused', bg: '#E0F2FE', fg: '#0369A1', border: '#BAE6FD' };
    default:
      return { label: status || 'Unrecorded', bg: '#F1F5F9', fg: '#475569', border: '#E2E8F0' };
  }
};

export const StudentAttendanceDrawer: React.FC<StudentAttendanceDrawerProps> = ({
  studentId,
  onClose,
}) => {
  const [data, setData] = useState<StudentAttendanceDetailDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!studentId) return;
    let isMounted = true;
    setLoading(true);

    LiveClassService.getInstance()
      .getStudentAttendanceDetail(studentId)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        console.error('Failed to load student attendance:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  if (!studentId) return null;

  const summary = data?.summary;
  const rate = summary?.percentage !== undefined
    ? Math.round(summary.percentage)
    : summary?.rate !== undefined
      ? Math.round(summary.rate * 100)
      : 0;
  const isEligible = rate >= 75;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideInRight 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0055A5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Roll Call Attendance Audit
            </div>
            <h3 style={{ margin: '4px 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#1E293B' }}>
              {data?.student_name || 'Student Attendance Details'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: '#F1F5F9',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <Spinner message="Loading attendance history..." />
            </div>
          ) : !data ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
              Unable to load student attendance records.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Student Metadata Card */}
              <div
                style={{
                  padding: '16px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: '#E0F2FE',
                      color: '#0055A5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1rem',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {data.profile_photo ? (
                      <img
                        src={data.profile_photo}
                        alt={data.student_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.02rem', color: '#1E293B' }}>
                      {data.student_name}
                    </div>
                    {data.phone_number && (
                      <div style={{ fontSize: '0.84rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                        <Phone size={13} />
                        <span>{data.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: isEligible ? '#DCFCE7' : '#FEE2E2',
                    border: `1px solid ${isEligible ? '#86EFAC' : '#FECACA'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {isEligible ? (
                    <>
                      <CheckCircle2 size={15} color="#15803D" />
                      <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#15803D' }}>
                        Exam Eligible ({rate}%)
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={15} color="#B91C1C" />
                      <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#B91C1C' }}>
                        At Risk ({rate}% / 75%)
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Attendance Statistics Grid: 4 categories for Tutors/Admins */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#166534' }}>Present</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>
                    {summary?.present_count ?? 0}
                  </div>
                </div>
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#92400E' }}>Late</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#B45309', marginTop: '2px' }}>
                    {summary?.late_count ?? 0}
                  </div>
                </div>
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#991B1B' }}>Absent</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#B91C1C', marginTop: '2px' }}>
                    {summary?.absent_count ?? 0}
                  </div>
                </div>
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0369A1' }}>Excused</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284C7', marginTop: '2px' }}>
                    {summary?.excused_count ?? 0}
                  </div>
                </div>
              </div>

              {/* Attendance Sessions Log */}
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.94rem', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} color="#0055A5" />
                  <span>Session History ({data.attendances?.length || 0})</span>
                </h4>

                {data.attendances && data.attendances.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.attendances.map((att: ClassAttendanceItem) => {
                      const badge = statusBadge(att.status);
                      const dateDisplay = att.scheduled_at
                        ? new Date(att.scheduled_at).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Unscheduled Session';

                      return (
                        <div
                          key={att.id}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '10px',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.90rem', color: '#1E293B' }}>
                              {att.class_title || 'Live Instruction Session'}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Clock size={12} />
                              <span>{dateDisplay}</span>
                              {att.minutes_attended ? (
                                <span>• {att.minutes_attended} mins</span>
                              ) : null}
                            </div>
                            {att.notes && (
                              <div style={{ fontSize: '0.76rem', color: '#475569', fontStyle: 'italic', marginTop: '4px' }}>
                                "{att.notes}"
                              </div>
                            )}
                          </div>

                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '4px',
                              backgroundColor: badge.bg,
                              color: badge.fg,
                              border: `1px solid ${badge.border}`,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {badge.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#64748B', fontSize: '0.86rem' }}>
                    No session attendance recorded for this student yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

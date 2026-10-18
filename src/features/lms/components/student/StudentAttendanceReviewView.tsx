import React, { useEffect, useState, useMemo } from 'react';
import { HttpClient } from '../../../../core/api/HttpClient';
import { Spinner } from '../../../../components/common/Spinner';
import { AlertCircle, ChevronRight } from 'lucide-react';

export interface AttendanceRecordItem {
  id: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | string;
  class_title?: string;
  scheduled_at?: string;
  joined_at?: string;
  created_at?: string;
  notes?: string;
}

export interface AttendanceSummaryData {
  rate?: number;
  percentage?: number;
  present_count?: number;
  late_count?: number;
  absent_count?: number;
  excused_count?: number;
  total_attended?: number;
  total_classes?: number;
}

export interface StudentAttendanceReviewViewProps {
  courseId?: string;
  courseTitle?: string;
  studentName?: string;
  onBackToGrades?: () => void;
  hideBreadcrumbs?: boolean;
}

export const StudentAttendanceReviewView: React.FC<StudentAttendanceReviewViewProps> = ({
  courseId,
  courseTitle: initialCourseTitle,
  studentName: propStudentName,
  onBackToGrades,
  hideBreadcrumbs = false,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AttendanceSummaryData | null>(null);
  const [attendances, setAttendances] = useState<AttendanceRecordItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'absent_late' | 'all'>('absent_late');

  const [studentName, setStudentName] = useState<string>(propStudentName || 'Student');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    HttpClient.getInstance()
      .get<any>('/api/v1/live-classes/my-attendance/')
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data || res;
        if (data?.summary) {
          setSummary(data.summary);
        }
        if (Array.isArray(data?.attendances)) {
          setAttendances(data.attendances);
          if (!propStudentName && data.attendances[0]?.student_name) {
            setStudentName(data.attendances[0].student_name);
          }
        }
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setError(err?.response?.data?.error || err?.message || 'Failed to load attendance records.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [courseId, propStudentName]);

  const presentCount = summary?.present_count ?? 0;
  const absentCount = summary?.absent_count ?? 0;
  const lateCount = summary?.late_count ?? 0;

  const totalDays = useMemo(() => {
    if (summary?.total_classes && summary.total_classes > 0) {
      return summary.total_classes;
    }
    const sum = presentCount + absentCount + lateCount;
    return sum > 0 ? sum : attendances.length;
  }, [summary, presentCount, absentCount, lateCount, attendances.length]);

  const currentScorePercentage = useMemo(() => {
    // If student has no absence and no late, they have 100%
    if (absentCount === 0 && lateCount === 0) {
      return 100;
    }
    if (summary?.percentage !== undefined) {
      return Math.round(summary.percentage);
    }
    if (summary?.rate !== undefined) {
      return Math.round(summary.rate <= 1 ? summary.rate * 100 : summary.rate);
    }
    if (totalDays > 0) {
      const earned = presentCount + lateCount * 0.8;
      return Math.round((earned / totalDays) * 100);
    }
    return 100;
  }, [absentCount, lateCount, summary, totalDays, presentCount]);

  // Last submission / evaluation timestamp
  const latestSubmissionText = useMemo(() => {
    const latestRecord = [...attendances].sort((a, b) => {
      const timeA = new Date(a.created_at || a.scheduled_at || 0).getTime();
      const timeB = new Date(b.created_at || b.scheduled_at || 0).getTime();
      return timeB - timeA;
    })[0];

    const targetDate = latestRecord?.created_at || latestRecord?.scheduled_at;
    if (targetDate) {
      const d = new Date(targetDate);
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const day = d.getDate();
      const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      return `${studentName} submitted ${month} ${day} at ${time}`;
    }
    return `${studentName} submitted attendance report`;
  }, [attendances, studentName]);

  // Donut SVG Calculations
  const radius = 56;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  const effectiveTotal = totalDays > 0 ? totalDays : 1;
  const presentFraction = presentCount / effectiveTotal;
  const absentFraction = absentCount / effectiveTotal;
  const lateFraction = lateCount / effectiveTotal;

  const presentLength = presentFraction * circumference;
  const absentLength = absentFraction * circumference;
  const lateLength = lateFraction * circumference;

  const absentOffset = -presentLength;
  const lateOffset = -(presentLength + absentLength);

  // Filtered rows for the table
  const displayedRecords = useMemo(() => {
    if (activeFilter === 'absent_late') {
      const filtered = attendances.filter(
        (r) => r.status === 'ABSENT' || r.status === 'LATE'
      );
      // If there are absent/late records, show them; otherwise fallback to all so table isn't unexpectedly blank
      return filtered.length > 0 ? filtered : attendances;
    }
    return attendances;
  }, [attendances, activeFilter]);

  const hasIssues = attendances.some((r) => r.status === 'ABSENT' || r.status === 'LATE');

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '360px',
          gap: '12px',
          color: '#64748B',
        }}
      >
        <Spinner size={32} />
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Loading attendance records...</span>
      </div>
    );
  }

  if (error && attendances.length === 0 && !summary) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#991B1B',
          }}
        >
          <AlertCircle size={20} />
          <span style={{ fontWeight: 600 }}>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Optional Breadcrumb trail (only rendered if outside full course workspace header) */}
      {!hideBreadcrumbs && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748B' }}>
          {initialCourseTitle && (
            <>
              <span>{initialCourseTitle}</span>
              <ChevronRight size={14} />
            </>
          )}
          {onBackToGrades ? (
            <span
              onClick={onBackToGrades}
              style={{ color: '#0055A5', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
            >
              Grades
            </span>
          ) : (
            <span>Grades</span>
          )}
          <ChevronRight size={14} />
          <strong style={{ color: '#111827' }}>Roll Call Attendance</strong>
        </div>
      )}

      {/* Canvas Submission Details Page Header */}
      <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#003D73',
            margin: '0 0 6px 0',
            letterSpacing: '-0.01em',
          }}
        >
          Submission Details
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#C00' }}>
            Roll Call Attendance
          </div>
          <div style={{ fontSize: '0.86rem', color: '#334155' }}>
            {latestSubmissionText}
          </div>
        </div>
      </div>

      {/* Main Roll Call Attendance Card */}
      <div
        className="canvas-card"
        style={{
          padding: '28px 32px',
          backgroundColor: '#FFFFFF',
          borderRadius: '6px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <h2
          style={{
            fontSize: '1.35rem',
            fontWeight: 600,
            color: '#1E293B',
            margin: '0 0 28px 0',
          }}
        >
          Roll Call Attendance
        </h2>

        {/* Top Summary: Donut Chart, Legend, and Current Score */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '40px',
            rowGap: '24px',
          }}
        >
          {/* Donut Chart */}
          <div
            style={{
              position: 'relative',
              width: '144px',
              height: '144px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="144"
              height="144"
              viewBox="0 0 144 144"
              style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
            >
              {/* Background ring */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                fill="transparent"
                stroke="#E2E8F0"
                strokeWidth={strokeWidth}
              />

              {/* Present days segment (Green) */}
              {presentLength > 0 && (
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  fill="transparent"
                  stroke="#65B32E"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${presentLength} ${circumference}`}
                  strokeDashoffset={0}
                />
              )}

              {/* Absent days segment (Red) */}
              {absentLength > 0 && (
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  fill="transparent"
                  stroke="#CC0000"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${absentLength} ${circumference}`}
                  strokeDashoffset={absentOffset}
                />
              )}

              {/* Late days segment (Orange) */}
              {lateLength > 0 && (
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${lateLength} ${circumference}`}
                  strokeDashoffset={lateOffset}
                />
              )}
            </svg>

            {/* Center Text inside Donut */}
            <div
              style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  fontSize: '1.85rem',
                  fontWeight: 800,
                  color: '#1E293B',
                  lineHeight: 1.1,
                }}
              >
                {totalDays}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#64748B',
                  marginTop: '1px',
                }}
              >
                Days Total
              </span>
            </div>
          </div>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '0.92rem',
              color: '#334155',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '11px',
                  height: '11px',
                  borderRadius: '50%',
                  backgroundColor: '#F59E0B',
                  display: 'inline-block',
                }}
              />
              <span>
                <strong style={{ fontWeight: 700, color: '#1E293B' }}>{lateCount}</strong> Late Days
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '11px',
                  height: '11px',
                  borderRadius: '50%',
                  backgroundColor: '#CC0000',
                  display: 'inline-block',
                }}
              />
              <span>
                <strong style={{ fontWeight: 700, color: '#1E293B' }}>{absentCount}</strong> Absent Days
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '11px',
                  height: '11px',
                  borderRadius: '50%',
                  backgroundColor: '#65B32E',
                  display: 'inline-block',
                }}
              />
              <span>
                <strong style={{ fontWeight: 700, color: '#1E293B' }}>{presentCount}</strong> Present Days
              </span>
            </div>
          </div>

          {/* Current Score */}
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              paddingLeft: '24px',
            }}
          >
            <div
              style={{
                fontSize: '2.8rem',
                fontWeight: 800,
                color: '#2D3B45',
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {currentScorePercentage}%
            </div>
            <div
              style={{
                fontSize: '0.86rem',
                color: '#64748B',
                fontWeight: 500,
                marginTop: '6px',
              }}
            >
              Current Score
            </div>
          </div>
        </div>

        {/* Records Table Section */}
        <div style={{ marginTop: '36px' }}>
          {/* Subtle View Toggle if both absent and present records exist */}
          {hasIssues && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '12px', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveFilter('absent_late')}
                style={{
                  background: activeFilter === 'absent_late' ? '#F1F5F9' : 'transparent',
                  border: '1px solid #CBD5E1',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: activeFilter === 'absent_late' ? '#0F172A' : '#64748B',
                  cursor: 'pointer',
                }}
              >
                Absent & Late ({absentCount + lateCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                style={{
                  background: activeFilter === 'all' ? '#F1F5F9' : 'transparent',
                  border: '1px solid #CBD5E1',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: activeFilter === 'all' ? '#0F172A' : '#64748B',
                  cursor: 'pointer',
                }}
              >
                All Days ({attendances.length})
              </button>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '2px solid #334155',
                    textAlign: 'left',
                  }}
                >
                  <th style={{ width: '28px', padding: '10px 8px' }}></th>
                  <th style={{ padding: '10px 14px', fontWeight: 600, color: '#1E293B' }}>Date</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600, color: '#1E293B' }}>Day</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600, color: '#1E293B' }}>Status</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600, color: '#1E293B' }}>% Points</th>
                </tr>
              </thead>
              <tbody>
                {displayedRecords.length > 0 ? (
                  displayedRecords.map((record) => {
                    const recordDate = record.scheduled_at || record.created_at || record.joined_at;
                    const dateObj = recordDate ? new Date(recordDate) : null;
                    const dateStr = dateObj
                      ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : '-';
                    const dayStr = dateObj
                      ? dateObj.toLocaleDateString('en-US', { weekday: 'long' })
                      : '-';

                    const isAbsent = record.status === 'ABSENT';
                    const isLate = record.status === 'LATE';
                    // EXCUSED weighs the same as PRESENT, so student sees Present
                    const isPresent = record.status === 'PRESENT' || record.status === 'EXCUSED';

                    const dotColor = isAbsent
                      ? '#CC0000'
                      : isLate
                      ? '#F59E0B'
                      : isPresent
                      ? '#65B32E'
                      : '#94A3B8';

                    const statusLabel = isAbsent
                      ? 'Absent'
                      : isLate
                      ? 'Late'
                      : isPresent
                      ? 'Present'
                      : record.status;

                    const pointsLabel = isAbsent
                      ? '0%'
                      : isLate
                      ? '80%'
                      : isPresent
                      ? '100%'
                      : '-';

                    return (
                      <tr
                        key={record.id}
                        style={{
                          borderBottom: '1px solid #E2E8F0',
                          backgroundColor: '#FFFFFF',
                        }}
                      >
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <span
                            style={{
                              width: '9px',
                              height: '9px',
                              borderRadius: '50%',
                              backgroundColor: dotColor,
                              display: 'inline-block',
                            }}
                          />
                        </td>
                        <td style={{ padding: '12px 14px', color: '#1E293B', fontWeight: 500 }}>
                          {dateStr}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>
                          {dayStr}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#1E293B' }}>
                          {statusLabel}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#1E293B', fontWeight: 500 }}>
                          {pointsLabel}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: '32px 14px',
                        textAlign: 'center',
                        color: '#64748B',
                        fontStyle: 'italic',
                      }}
                    >
                      {activeFilter === 'absent_late'
                        ? 'No absences or late arrivals recorded. Perfect attendance!'
                        : 'No attendance records logged for this course cohort yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

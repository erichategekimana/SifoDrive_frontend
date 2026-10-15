import React from 'react';

interface AttendanceGradeRowProps {
  studentAttendanceRate: number;
  onOpenAttendanceReview: () => void;
}

export const AttendanceGradeRow: React.FC<AttendanceGradeRowProps> = ({
  studentAttendanceRate,
  onOpenAttendanceReview,
}) => {
  return (
    <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
      <td style={{ padding: '14px 14px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <button
            type="button"
            onClick={onOpenAttendanceReview}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              margin: 0,
              font: 'inherit',
              fontSize: '0.92rem',
              fontWeight: 700,
              color: '#008EE2',
              cursor: 'pointer',
              textAlign: 'left',
              textDecoration: 'none',
              outline: 'none',
              lineHeight: 1.35,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.textDecoration = 'none';
            }}
            title="Click to view Roll Call Attendance details"
          >
            Roll Call Attendance
          </button>
          <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Attendance</span>
        </div>
      </td>
      <td style={{ padding: '14px 14px', color: '#2D3B45', fontSize: '0.86rem', verticalAlign: 'middle' }}>
        -
      </td>
      <td style={{ padding: '14px 14px', color: '#2D3B45', fontSize: '0.86rem', verticalAlign: 'middle' }}>
        -
      </td>
      <td style={{ padding: '14px 14px', textAlign: 'center', verticalAlign: 'middle' }}></td>
      <td
        style={{
          padding: '14px 14px',
          textAlign: 'right',
          fontWeight: 700,
          color: '#2D3B45',
          fontSize: '0.92rem',
          verticalAlign: 'middle',
        }}
      >
        {studentAttendanceRate} / 100
      </td>
      <td style={{ padding: '14px 14px', textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onOpenAttendanceReview}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              color: '#94A3B8',
              display: 'inline-flex',
              alignItems: 'center',
            }}
            title="View Roll Call Attendance details"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="m8 10 4 4 4-4" />
              <path d="M12 4v10" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AttendanceGradeRow;

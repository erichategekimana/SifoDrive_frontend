import React from 'react';
import type { CourseAssignmentItem } from '../types/courseWorkspace.types';
import { formatCanvasDue, formatCanvasSubmitted } from '../utils/dateUtils';

interface GradeItemRowProps {
  asg: CourseAssignmentItem;
  onOpenGradeReview: (asg: CourseAssignmentItem) => void;
}

export const GradeItemRow: React.FC<GradeItemRowProps> = ({ asg, onOpenGradeReview }) => {
  const rawScoreVal = asg.score ? asg.score.split('/')[0].trim() : null;
  const scoreDisplay =
    rawScoreVal !== null && rawScoreVal !== undefined && rawScoreVal !== ''
      ? `${rawScoreVal} / ${asg.points}`
      : asg.studentSubmitted || asg.isSubmitted
      ? `- / ${asg.points}`
      : '-';

  const subInfo = formatCanvasSubmitted(asg.studentSubmittedAt);
  const dueStr = formatCanvasDue(asg.rawDueDate || asg.dueDate);

  // Canvas Status calculation (late / missing)
  const isSubmitted = Boolean(asg.studentSubmitted || asg.isSubmitted);
  const subTime = asg.studentSubmittedAt ? new Date(asg.studentSubmittedAt).getTime() : 0;
  const dueTime = asg.rawDueDate || asg.dueDate ? new Date(asg.rawDueDate || asg.dueDate).getTime() : 0;

  let canvasStatus: 'late' | 'missing' | null = null;
  if (isSubmitted && subTime > 0 && dueTime > 0 && subTime > dueTime) {
    canvasStatus = 'late';
  } else if (!isSubmitted && dueTime > 0 && Date.now() > dueTime) {
    canvasStatus = 'missing';
  }

  const subCategory = asg.isCohortActivity
    ? asg.activityRaw?.activity_type || 'Assignments'
    : asg.isFinalExam
    ? 'Final Exam'
    : 'Quizzes';

  return (
    <tr
      style={{
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        transition: 'background-color 0.1s ease',
      }}
    >
      {/* Name & Subcategory */}
      <td style={{ padding: '14px 14px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <button
            type="button"
            onClick={() => onOpenGradeReview(asg)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              margin: 0,
              font: 'inherit',
              fontSize: '0.92rem',
              fontWeight: 500,
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
            title={`Click to view details for ${asg.title}`}
          >
            {asg.title}
          </button>
          <span style={{ fontSize: '0.78rem', color: '#64748B' }}>{subCategory}</span>
        </div>
      </td>

      {/* Due Date */}
      <td
        style={{
          padding: '14px 14px',
          color: '#2D3B45',
          fontSize: '0.86rem',
          verticalAlign: 'middle',
          whiteSpace: 'nowrap',
        }}
      >
        {dueStr}
      </td>

      {/* Submitted Date */}
      <td
        style={{
          padding: '14px 14px',
          color: '#2D3B45',
          fontSize: '0.86rem',
          verticalAlign: 'middle',
          whiteSpace: 'nowrap',
        }}
      >
        {subInfo ? (
          <div style={{ lineHeight: 1.35 }}>
            <div>{subInfo.dateStr} at</div>
            <div>{subInfo.timeStr.replace('at ', '')}</div>
          </div>
        ) : (
          '-'
        )}
      </td>

      {/* Status (late / missing) */}
      <td style={{ padding: '14px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
        {canvasStatus === 'late' && (
          <span
            style={{
              display: 'inline-block',
              padding: '2px 12px',
              borderRadius: '9999px',
              border: '1px solid #008EE2',
              color: '#008EE2',
              backgroundColor: '#FFFFFF',
              fontSize: '0.74rem',
              fontWeight: 600,
              textTransform: 'lowercase',
            }}
          >
            late
          </span>
        )}
        {canvasStatus === 'missing' && (
          <span
            style={{
              display: 'inline-block',
              padding: '2px 12px',
              borderRadius: '9999px',
              border: '1px solid #EE3C3C',
              color: '#EE3C3C',
              backgroundColor: '#FFFFFF',
              fontSize: '0.74rem',
              fontWeight: 600,
              textTransform: 'lowercase',
            }}
          >
            missing
          </span>
        )}
      </td>

      {/* Score */}
      <td
        style={{
          padding: '14px 14px',
          textAlign: 'right',
          fontWeight: 600,
          color: '#2D3B45',
          fontSize: '0.92rem',
          verticalAlign: 'middle',
          whiteSpace: 'nowrap',
        }}
      >
        {scoreDisplay}
      </td>

      {/* Action Icons */}
      <td style={{ padding: '14px 14px', textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          {/* Canvas Submission Details Tray Icon */}
          <button
            type="button"
            onClick={() => onOpenGradeReview(asg)}
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
            title="View submission details"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="m8 10 4 4 4-4" />
              <path d="M12 4v10" />
            </svg>
          </button>

          {/* Rubric icon if available */}
          {Boolean(asg.rubricText || (asg.rubrics && asg.rubrics.length > 0)) && (
            <button
              type="button"
              onClick={() => onOpenGradeReview(asg)}
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
              title="View rubric assessment"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" />
                <path d="M9 12h6" />
                <path d="M9 16h6" />
              </svg>
            </button>
          )}

          {/* Comments icon if feedback available */}
          {Boolean(asg.studentFeedback) && (
            <button
              type="button"
              onClick={() => onOpenGradeReview(asg)}
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
              title="View tutor comments"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default GradeItemRow;

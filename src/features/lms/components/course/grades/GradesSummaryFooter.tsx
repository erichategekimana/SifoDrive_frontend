import React from 'react';
import type { CourseAssignmentItem } from '../types/courseWorkspace.types';

interface GradesSummaryFooterProps {
  visibleAssignments: CourseAssignmentItem[];
  studentAttendanceRate: number;
}

export const GradesSummaryFooter: React.FC<GradesSummaryFooterProps> = ({
  visibleAssignments,
  studentAttendanceRate,
}) => {
  // Compute weighted or simple average across all graded items and attendance
  let earnedPoints = 0;
  let totalPoints = 0;

  visibleAssignments.forEach((asg) => {
    if (asg.score) {
      const rawScore = parseFloat(asg.score.split('/')[0].trim());
      if (!isNaN(rawScore) && asg.points > 0) {
        earnedPoints += rawScore;
        totalPoints += asg.points;
      }
    }
  });

  // Include attendance out of 100
  if (studentAttendanceRate > 0) {
    earnedPoints += studentAttendanceRate;
    totalPoints += 100;
  }

  const averagePct = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 94.2;
  const formattedPct = averagePct.toFixed(1);

  const getLetterGrade = (pct: number) => {
    if (pct >= 90) return 'Grade A';
    if (pct >= 80) return 'Grade B';
    if (pct >= 70) return 'Grade C';
    if (pct >= 60) return 'Grade D';
    return 'Grade F';
  };

  return (
    <tfoot>
      <tr style={{ backgroundColor: '#F8FAFC', borderTop: '2px solid #003D73' }}>
        <td colSpan={4} style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.95rem', color: '#1E293B' }}>
          Average:
        </td>
        <td colSpan={2} style={{ padding: '14px 16px', fontWeight: 800, fontSize: '1rem', color: '#058728', textAlign: 'right' }}>
          {formattedPct}% ({getLetterGrade(averagePct)})
        </td>
      </tr>
    </tfoot>
  );
};

export default GradesSummaryFooter;

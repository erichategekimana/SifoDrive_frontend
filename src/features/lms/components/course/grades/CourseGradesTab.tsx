import React from 'react';
import type { Course } from '../../../../../core/models/Course';
import type { CourseAssignmentItem } from '../types/courseWorkspace.types';
import { StudentAssessmentReviewView } from '../../student/StudentAssessmentReviewView';
import { StudentAttendanceReviewView } from '../../student/StudentAttendanceReviewView';
import { GradeItemRow } from './GradeItemRow';
import { AttendanceGradeRow } from './AttendanceGradeRow';
import { GradesSummaryFooter } from './GradesSummaryFooter';

export interface CourseGradesTabProps {
  course: Course;
  user: any;
  visibleAssignments: CourseAssignmentItem[];
  studentAttendanceRate: number;
  reviewParam?: string | null;
  reviewTypeParam?: string | null;
  onOpenGradeReview: (asg: CourseAssignmentItem) => void;
  onOpenAttendanceReview: () => void;
  onCloseGradeReview: () => void;
}

export const CourseGradesTab: React.FC<CourseGradesTabProps> = ({
  course,
  user,
  visibleAssignments,
  studentAttendanceRate,
  reviewParam,
  reviewTypeParam,
  onOpenGradeReview,
  onOpenAttendanceReview,
  onCloseGradeReview,
}) => {
  if (reviewParam) {
    if (reviewParam === 'attendance') {
      return (
        <StudentAttendanceReviewView
          courseId={course.id}
          courseTitle={course.title}
          studentName={
            user?.fullName ||
            (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '') ||
            user?.email ||
            'Student'
          }
          onBackToGrades={onCloseGradeReview}
          hideBreadcrumbs
        />
      );
    }

    return (
      <StudentAssessmentReviewView
        assessmentId={reviewParam}
        isActivity={reviewTypeParam === 'activity'}
        courseId={course.id}
        courseTitle={course.title}
        onBackToGrades={onCloseGradeReview}
        hideBreadcrumbs
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div
        className="canvas-card"
        style={{
          padding: '24px 28px',
          backgroundColor: '#FFFFFF',
          borderRadius: '6px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #003D73', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: '#1E293B', fontSize: '0.92rem' }}>
                  Name
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: '#1E293B', fontSize: '0.92rem' }}>
                  Due
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: '#1E293B', fontSize: '0.92rem' }}>
                  Submitted
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: '#1E293B', fontSize: '0.92rem', textAlign: 'center' }}>
                  Status
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: '#1E293B', fontSize: '0.92rem', textAlign: 'right' }}>
                  Score
                </th>
                <th style={{ padding: '12px 14px', width: '90px' }}></th>
              </tr>
            </thead>
            <tbody>
              {visibleAssignments.map((asg) => (
                <GradeItemRow
                  key={asg.id}
                  asg={asg}
                  onOpenGradeReview={onOpenGradeReview}
                />
              ))}

              {/* Attendance Row (Always the last on the list, kept bold and clickable) */}
              <AttendanceGradeRow
                studentAttendanceRate={studentAttendanceRate}
                onOpenAttendanceReview={onOpenAttendanceReview}
              />
            </tbody>
            <GradesSummaryFooter
              visibleAssignments={visibleAssignments}
              studentAttendanceRate={studentAttendanceRate}
            />
          </table>
        </div>
      </div>
    </div>
  );
};

export default CourseGradesTab;

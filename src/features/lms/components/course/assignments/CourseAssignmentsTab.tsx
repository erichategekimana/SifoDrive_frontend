import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import type { CourseAssignmentItem } from '../types/courseWorkspace.types';
import { AssignmentList } from './AssignmentList';
import { AssignmentDetailView } from './AssignmentDetailView';
import { TutorGradingView } from './TutorGradingView';

export interface CourseAssignmentsTabProps {
  isTutor: boolean;
  visibleAssignments: CourseAssignmentItem[];
  cohortStudents: any[];
  activeCohortName: string;
  activeCohortId?: string | null;
  selectedAssignmentId: string | null;
  onSelectAssignment: (id: string | null) => void;
  isGradingView: boolean;
  setIsGradingView: (val: boolean) => void;
  assignmentFilter: 'all' | 'completed' | 'pending';
  setAssignmentFilter: (filter: 'all' | 'completed' | 'pending') => void;
  togglingLockActivityId?: string | null;
  togglingQuizLockId?: string | null;
  publishingGradesActivityId?: string | null;
  deletingActivityId?: string | null;
  onCreateActivity: () => void;
  onEditActivity: (act: any) => void;
  onDeleteActivity: (act: any) => void;
  onToggleActivityLock: (act: any) => void;
  onToggleQuizLock: (quizId: string) => void;
  onReviewSubmissions: (act: any) => void;
  onPublishGradesDirect: (act: any) => void;
  onAutoGradeCompleted: (asgId: string) => void;
  onPublishGrades: (asgId: string) => void;
  onSelectStudentForGrading: (student: any) => void;
  onUpdateQuiz: (asg: CourseAssignmentItem) => void;
  onWorkOnActivity: (actRaw: any) => void;
  onTakeQuiz: (quizId: string) => void;
}

export const CourseAssignmentsTab: React.FC<CourseAssignmentsTabProps> = ({
  isTutor,
  visibleAssignments,
  cohortStudents,
  activeCohortName,
  selectedAssignmentId,
  onSelectAssignment,
  isGradingView,
  setIsGradingView,
  assignmentFilter,
  setAssignmentFilter,
  togglingLockActivityId,
  togglingQuizLockId,
  publishingGradesActivityId,
  deletingActivityId,
  onCreateActivity,
  onEditActivity,
  onDeleteActivity,
  onToggleActivityLock,
  onToggleQuizLock,
  onReviewSubmissions,
  onPublishGradesDirect,
  onAutoGradeCompleted,
  onPublishGrades,
  onSelectStudentForGrading,
  onUpdateQuiz,
  onWorkOnActivity,
  onTakeQuiz,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* If an assignment is selected (for Student OR Tutor) */}
      {selectedAssignmentId ? (
        (() => {
          const currentAsg = visibleAssignments.find((a) => a.id === selectedAssignmentId);
          if (!currentAsg) {
            return (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Lock size={32} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                  Assessment Unavailable
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '420px', margin: '0 auto 16px auto' }}>
                  This assessment is not visible or has been locked for your cohort by the instructor.
                </p>
                <button
                  onClick={() => {
                    onSelectAssignment(null);
                    setAssignmentFilter('all');
                  }}
                  className="canvas-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    fontSize: '0.84rem',
                    backgroundColor: '#FFFFFF',
                    color: '#1E293B',
                    border: '1px solid #CBD5E1',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Back to Assignments</span>
                </button>
              </div>
            );
          }

          // TUTOR GRADING VIEW (Quiz submissions grading screen)
          if (isGradingView && isTutor) {
            const submissionsWithStudent = currentAsg.submissions.map((sub) => {
              const studentInfo = cohortStudents.find((s) => s.id === sub.studentId);
              return {
                ...sub,
                name: (sub as any).studentName || studentInfo?.name || 'Unknown Student',
                studentRollNo: (sub as any).studentRollNo || studentInfo?.student_id || studentInfo?.email || 'N/A',
                category: (sub as any).category || studentInfo?.category || 'Enrolled Student',
              };
            });

            return (
              <TutorGradingView
                currentAsg={currentAsg}
                activeCohortName={activeCohortName}
                submissionsWithStudent={submissionsWithStudent}
                assignmentFilter={assignmentFilter}
                setAssignmentFilter={setAssignmentFilter}
                onExitGradingView={() => setIsGradingView(false)}
                onAutoGradeCompleted={onAutoGradeCompleted}
                onPublishGrades={onPublishGrades}
                onSelectStudentForGrading={onSelectStudentForGrading}
              />
            );
          }

          // ASSIGNMENT / ACTIVITY DETAIL VIEW
          return (
            <AssignmentDetailView
              currentAsg={currentAsg}
              isTutor={isTutor}
              activeCohortName={activeCohortName}
              togglingLockActivityId={togglingLockActivityId}
              publishingGradesActivityId={publishingGradesActivityId}
              togglingQuizLockId={togglingQuizLockId}
              onCloseAssignment={() => {
                onSelectAssignment(null);
                setAssignmentFilter('all');
              }}
              onToggleActivityLock={onToggleActivityLock}
              onEditActivity={onEditActivity}
              onReviewSubmissions={onReviewSubmissions}
              onPublishGradesDirect={onPublishGradesDirect}
              onToggleQuizLock={onToggleQuizLock}
              onUpdateQuiz={onUpdateQuiz}
              onOpenGradingView={() => setIsGradingView(true)}
              onWorkOnActivity={onWorkOnActivity}
              onTakeQuiz={onTakeQuiz}
            />
          );
        })()
      ) : (
        // DEFAULT ASSIGNMENT LIST
        <AssignmentList
          isTutor={isTutor}
          visibleAssignments={visibleAssignments}
          cohortStudents={cohortStudents}
          activeCohortName={activeCohortName}
          togglingLockActivityId={togglingLockActivityId ?? null}
          togglingQuizLockId={togglingQuizLockId ?? null}
          deletingActivityId={deletingActivityId ?? null}
          onOpenAssignment={(id) => {
            onSelectAssignment(id);
            setAssignmentFilter('all');
          }}
          onCreateActivity={onCreateActivity}
          onEditActivity={onEditActivity}
          onDeleteActivity={onDeleteActivity}
          onToggleActivityLock={onToggleActivityLock}
          onToggleQuizLock={onToggleQuizLock}
          onReviewSubmissions={onReviewSubmissions}
        />
      )}
    </div>
  );
};

export default CourseAssignmentsTab;

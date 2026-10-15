import React, { Suspense, lazy } from 'react';
import type { Course } from '../../../../../core/models/Course';
import type { CohortSelectorItem, CohortActivityItem } from '../../../../../core/services/TutorLmsService';
import type { CourseAssignmentItem } from '../types';
import { TutorQuizUpdateModal } from '../../quiz/TutorQuizUpdateModal';
import { CreateActivityModal } from '../../tutor/CreateActivityModal';
import { StudentSubmitActivityModal } from '../../student/StudentSubmitActivityModal';
import { StudentQuizRunner } from '../../quiz/StudentQuizRunner';

const PostAnnouncementModal = lazy(() => import('../announcements/modals/PostAnnouncementModal'));
const TutorStudentGradingModal = lazy(() => import('../assignments/modals/TutorStudentGradingModal'));

export interface CourseWorkspaceModalsProps {
  course: Course;
  user: any;
  activeCohortId: string | null;
  tutorCohorts: CohortSelectorItem[];
  // Announcement modal
  showPostAnnouncementModal: boolean;
  setShowPostAnnouncementModal: (val: boolean) => void;
  submittingAnnouncement: boolean;
  announcementTitle: string;
  setAnnouncementTitle: (val: string) => void;
  announcementContent: string;
  setAnnouncementContent: (val: string) => void;
  announcementTargetType: 'SINGLE_COHORT' | 'ALL_ASSIGNED_COHORTS';
  setAnnouncementTargetType: (val: 'SINGLE_COHORT' | 'ALL_ASSIGNED_COHORTS') => void;
  announcementCohortId: string;
  setAnnouncementCohortId: (val: string) => void;
  handleCreateAnnouncement: (e: React.FormEvent) => void;
  // Tutor Quiz Update
  updatingAssignment: CourseAssignmentItem | null;
  setUpdatingAssignment: (val: CourseAssignmentItem | null) => void;
  handleQuizUpdatedByTutor: (updated: Partial<CourseAssignmentItem>) => void;
  // Tutor Student Grading
  gradingStudentModal: {
    studentId: string;
    name: string;
    studentRollNo: string;
    category: string;
    score: string;
    feedback: string;
    completed: boolean;
    submissionId?: string | null;
    rawSubmission?: any | null;
  } | null;
  setGradingStudentModal: (val: any) => void;
  selectedAssignmentId: string | null;
  visibleAssignments: CourseAssignmentItem[];
  assignmentsData: CourseAssignmentItem[];
  handleSaveStudentGrade: (
    assignmentId: string,
    studentId: string,
    score: string,
    feedback: string,
    submissionId?: string | null
  ) => void;
  // Cohort Activity
  showCreateActivityModal: boolean;
  setShowCreateActivityModal: (val: boolean) => void;
  editingCohortActivity: CohortActivityItem | null;
  setEditingCohortActivity: (val: CohortActivityItem | null) => void;
  fetchCohortActivities: () => void;
  studentSubmitActivity: CohortActivityItem | null;
  setStudentSubmitActivity: (val: CohortActivityItem | null) => void;
  // Student Quiz Runner
  takingQuizId: string | null;
  setTakingQuizId: (val: string | null) => void;
  fetchQuizzes: () => void;
  setAssignmentsData: React.Dispatch<React.SetStateAction<CourseAssignmentItem[]>>;
}

export const CourseWorkspaceModals: React.FC<CourseWorkspaceModalsProps> = ({
  course,
  user,
  activeCohortId,
  tutorCohorts,
  showPostAnnouncementModal,
  setShowPostAnnouncementModal,
  submittingAnnouncement,
  announcementTitle,
  setAnnouncementTitle,
  announcementContent,
  setAnnouncementContent,
  announcementTargetType,
  setAnnouncementTargetType,
  announcementCohortId,
  setAnnouncementCohortId,
  handleCreateAnnouncement,
  updatingAssignment,
  setUpdatingAssignment,
  handleQuizUpdatedByTutor,
  gradingStudentModal,
  setGradingStudentModal,
  selectedAssignmentId,
  visibleAssignments,
  assignmentsData,
  handleSaveStudentGrade,
  showCreateActivityModal,
  setShowCreateActivityModal,
  editingCohortActivity,
  setEditingCohortActivity,
  fetchCohortActivities,
  studentSubmitActivity,
  setStudentSubmitActivity,
  takingQuizId,
  setTakingQuizId,
  fetchQuizzes,
  setAssignmentsData,
}) => {
  return (
    <>
      {/* Post Announcement Modal (for Tutors) */}
      {showPostAnnouncementModal && (
        <Suspense fallback={null}>
          <PostAnnouncementModal
            isOpen={showPostAnnouncementModal}
            submitting={submittingAnnouncement}
            announcementTitle={announcementTitle}
            setAnnouncementTitle={setAnnouncementTitle}
            announcementContent={announcementContent}
            setAnnouncementContent={setAnnouncementContent}
            announcementTargetType={announcementTargetType}
            setAnnouncementTargetType={setAnnouncementTargetType}
            announcementCohortId={announcementCohortId}
            setAnnouncementCohortId={setAnnouncementCohortId}
            activeCohortId={activeCohortId}
            tutorCohorts={tutorCohorts}
            onClose={() => setShowPostAnnouncementModal(false)}
            onSubmit={handleCreateAnnouncement}
          />
        </Suspense>
      )}

      {/* Tutor Quiz Update Modal */}
      {updatingAssignment && (
        <TutorQuizUpdateModal
          isOpen={Boolean(updatingAssignment)}
          assignment={updatingAssignment}
          onClose={() => setUpdatingAssignment(null)}
          onSuccess={handleQuizUpdatedByTutor}
        />
      )}

      {/* Tutor Student Grading Modal */}
      {gradingStudentModal && (() => {
        const activeAsgForModal =
          (selectedAssignmentId &&
            (visibleAssignments.find((a) => a.id === selectedAssignmentId) ||
              assignmentsData.find((a) => a.id === selectedAssignmentId))) || {
            id: selectedAssignmentId || '',
            title: (gradingStudentModal as any).rawSubmission?.quiz_title || 'Assessment',
            points: 100,
          };
        return (
          <Suspense fallback={null}>
            <TutorStudentGradingModal
              isOpen={Boolean(gradingStudentModal)}
              assignment={activeAsgForModal as any}
              student={gradingStudentModal}
              maxPoints={activeAsgForModal.points || 100}
              currentTutorName={
                (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '') ||
                (user as any)?.name ||
                'Tutor'
              }
              onClose={() => setGradingStudentModal(null)}
              onSaveGrade={(studentId, score, feedback, submissionId) =>
                handleSaveStudentGrade(
                  activeAsgForModal.id,
                  studentId,
                  score,
                  feedback,
                  submissionId || gradingStudentModal.submissionId
                )
              }
            />
          </Suspense>
        );
      })()}

      {/* Create / Edit Cohort Activity Modal */}
      {showCreateActivityModal && (
        <CreateActivityModal
          isOpen={showCreateActivityModal}
          cohortId={activeCohortId || tutorCohorts[0]?.id || ''}
          courseId={course.id}
          activityToEdit={editingCohortActivity}
          availableCohorts={tutorCohorts.map((c) => ({ id: c.id, name: c.name, code: c.code }))}
          onClose={() => {
            setShowCreateActivityModal(false);
            setEditingCohortActivity(null);
          }}
          onSuccess={fetchCohortActivities}
        />
      )}

      {/* Student Submit Activity Modal */}
      {studentSubmitActivity && (
        <StudentSubmitActivityModal
          isOpen={Boolean(studentSubmitActivity)}
          activity={studentSubmitActivity}
          onClose={() => setStudentSubmitActivity(null)}
          onSuccess={fetchCohortActivities}
        />
      )}

      {/* Student Quiz Runner (Pre-flight diagnostics + Live Timed Proctoring) */}
      {takingQuizId && (
        <StudentQuizRunner
          quizId={takingQuizId}
          courseId={course.id}
          courseTitle={course.title}
          cohortId={activeCohortId || undefined}
          onClose={() => {
            setTakingQuizId(null);
            fetchQuizzes();
          }}
          onCompleted={(sub) => {
            setAssignmentsData((prev) =>
              prev.map((item) =>
                item.id === takingQuizId
                  ? {
                      ...item,
                      status: 'Graded',
                      score: `${sub.score} / ${sub.total_score}`,
                    }
                  : item
              )
            );
            fetchQuizzes();
          }}
        />
      )}
    </>
  );
};

export default CourseWorkspaceModals;

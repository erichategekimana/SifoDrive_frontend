import type { CohortActivityItem } from '../../../../../core/services/TutorLmsService';
import type { CourseWorkspaceTab } from '../CourseSecondaryNav';

export type { CourseWorkspaceTab };

export interface RubricItem {
  criteria: string;
  points: string;
}

export interface AssignmentSubmissionItem {
  studentId: string;
  studentName?: string;
  studentRollNo?: string;
  category?: string;
  completed: boolean;
  submissionId?: string | null;
  score: string | null;
  submittedAt: string | null;
  isLate: boolean;
  daysLate: number;
  feedback?: string;
  rawSubmission?: any;
}

export interface CourseAssignmentItem {
  id: string;
  title: string;
  points: number;
  timeLimit: string;
  timeLimitMinutes?: number;
  attemptsAllowed: number;
  isLocked: boolean;
  gradesPublished: boolean;
  openDate: string;
  dueDate: string;
  closingDate: string;
  rawOpenDate?: string | null;
  rawDueDate?: string | null;
  rawClosingDate?: string | null;
  allowLateSubmission: boolean;
  isFinalExam: boolean;
  status: string;
  score: string | null;
  type: string;
  instructions: string;
  rubricText?: string;
  rubrics: RubricItem[];
  allowTutorScheduling?: boolean;
  allowTutorEditInstructions?: boolean;
  allowTutorEditDuration?: boolean;
  allowTutorEditAttempts?: boolean;
  submissions: AssignmentSubmissionItem[];
  isCohortActivity?: boolean;
  activityRaw?: CohortActivityItem;
  quizRaw?: any;
  studentSubmitted?: boolean;
  studentSubmittedAt?: string | null;
  studentFeedback?: string | null;
  releaseGradesImmediately?: boolean;
  isSubmitted?: boolean;
}

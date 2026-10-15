import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { StudentAssessmentReviewView } from '../../features/lms/components/student/StudentAssessmentReviewView';

export const StudentQuizReviewPage: React.FC = () => {
  const { quizId, activityId, courseId } = useParams<{
    quizId?: string;
    activityId?: string;
    courseId?: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const effectiveCourseId = courseId || searchParams.get('courseId') || undefined;
  const isActivity = Boolean(activityId);
  const targetId = quizId || activityId || '';

  const handleBackToGrades = () => {
    if (effectiveCourseId && effectiveCourseId !== 'all') {
      navigate(`/courses/${effectiveCourseId}?tab=grades`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
      <StudentAssessmentReviewView
        assessmentId={targetId}
        isActivity={isActivity}
        courseId={effectiveCourseId}
        onBackToGrades={handleBackToGrades}
      />
    </div>
  );
};

import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { StudentQuizRunner } from '../../features/lms/components/quiz/StudentQuizRunner';

export const StudentQuizPage: React.FC = () => {
  const { quizId, courseId } = useParams<{ quizId: string; courseId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const effectiveCourseId = courseId || searchParams.get('courseId') || undefined;

  const handleClose = () => {
    if (effectiveCourseId) {
      navigate(`/courses/${effectiveCourseId}`);
    } else {
      navigate('/courses');
    }
  };

  if (!quizId) {
    navigate('/courses');
    return null;
  }

  return (
    <StudentQuizRunner
      quizId={quizId}
      courseId={effectiveCourseId}
      onClose={handleClose}
      onCompleted={() => {
        // Will show results inside runner; when user clicks Return to Course, handleClose is triggered
      }}
    />
  );
};

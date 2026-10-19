import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CandidateExamRunner } from '../../features/examinations/components/runner/CandidateExamRunner';

export const CandidateExamPage: React.FC = () => {
  const { examId, sessionId } = useParams<{ examId?: string; sessionId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isStudent = user?.role === 'STUDENT';

  const handleClose = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <CandidateExamRunner
      examId={examId}
      sessionId={sessionId}
      isStudentProctored={isStudent}
      onClose={handleClose}
      onCompleted={() => {
        // Runner transitions to RESULTS step internally
      }}
    />
  );
};

export default CandidateExamPage;

import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CandidateExamRunner } from '../../features/examinations/components/runner/CandidateExamRunner';
import { type CandidateSessionItem } from '../../core/services/AdminService';

export const CandidateExamPage: React.FC = () => {
  const { examId, sessionId } = useParams<{ examId?: string; sessionId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isStudent = user?.role === 'STUDENT';

  const handleClose = (sessionItem?: CandidateSessionItem | null) => {
    const candidatePhone =
      sessionItem?.candidate_phone ||
      searchParams.get('phone') ||
      localStorage.getItem('sifo_last_candidate_phone') ||
      user?.phoneNumber ||
      '';
    const lang = searchParams.get('lang') || 'rw';
    const theme = searchParams.get('theme') || 'light';

    const params = new URLSearchParams();
    if (candidatePhone) params.set('phone', candidatePhone);
    if (lang) params.set('lang', lang);
    if (theme) params.set('theme', theme);

    const queryString = params.toString();
    const readyRoomUrl = `/practice-exams${queryString ? `?${queryString}` : ''}`;

    navigate(readyRoomUrl);
  };

  return (
    <CandidateExamRunner
      examId={examId}
      sessionId={sessionId}
      isStudentProctored={isStudent}
      onClose={handleClose}
      onCompleted={(_gradedSession) => {
        // The modal with score and confetti is displayed directly inside CandidateExamRunner
      }}
    />
  );
};

export default CandidateExamPage;

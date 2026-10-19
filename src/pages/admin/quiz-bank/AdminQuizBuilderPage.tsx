import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLmsStudioData } from '../../../features/lms/hooks/useLmsStudioData';
import { QuizBuilderModal } from '../../../features/lms/components/quiz/QuizBuilderModal';
import { AdminService } from '../../../core/services/AdminService';

export const AdminQuizBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isFinalExamParam = searchParams.get('exam') === 'true';

  const { user } = useAuth();
  const isTrainingAdmin = user?.isTrainingAdmin();
  const isSystemAdmin = user?.isSystemAdmin();

  const { courses, questions, refetch } = useLmsStudioData();
  const adminService = AdminService.getInstance();

  const isEditMode = Boolean(id);

  return (
    <div style={{ padding: '8px 0 32px 0' }}>
      <QuizBuilderModal
        isOpen={true}
        asPage={true}
        isEditMode={isEditMode}
        editingQuizId={id}
        courses={courses}
        questions={questions}
        isSystemAdmin={isSystemAdmin}
        isTrainingAdmin={isTrainingAdmin}
        initialIsFinalExam={isFinalExamParam}
        onClose={() => navigate('/admin/quizzes')}
        onSuccess={() => {
          refetch();
          navigate('/admin/quizzes');
        }}
        fetchBankQuestions={async () => {
          await adminService.getQuestions();
          refetch();
        }}
        isLoadingBankQuestions={false}
      />
    </div>
  );
};

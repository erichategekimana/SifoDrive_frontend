import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ExamPipelineSection } from '../../../features/examinations/components/pipeline/ExamPipelineSection';
import { QuestionBankSection } from '../../../features/examinations/components/questions/QuestionBankSection';
import { CertificatesSection } from '../../../features/examinations/components/certificates/CertificatesSection';
import { ExamSettingsSection } from '../../../features/examinations/components/settings/ExamSettingsSection';
import { ExaminationsHeader } from './ExaminationsHeader';

export const AdminExaminationsPage: React.FC = () => {
  const { user } = useAuth();

  const isSystemAdmin = user?.role === 'SYSTEM_ADMIN' || Boolean(user?.isSystemAdmin?.());
  const isTrainingAdmin = user?.role === 'TRAINING_ADMIN' || Boolean(user?.isTrainingAdmin?.());
  const isBoardReviewer = user?.role === 'BOARD_REVIEWER' || Boolean(user?.isBoardReviewer?.());

  const [activeTab, setActiveTab] = useState<'pipeline' | 'questions' | 'certificates' | 'settings'>('pipeline');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header matching Command Center DashboardHeader */}
      <ExaminationsHeader
        isBoardReviewer={isBoardReviewer}
        isSystemAdmin={isSystemAdmin}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Panels */}
      {(isBoardReviewer || activeTab === 'pipeline') && (
        <ExamPipelineSection
          isSystemAdmin={isSystemAdmin}
          isTrainingAdmin={isTrainingAdmin}
          isBoardReviewer={isBoardReviewer}
        />
      )}

      {!isBoardReviewer && activeTab === 'questions' && <QuestionBankSection />}

      {!isBoardReviewer && activeTab === 'certificates' && (
        <CertificatesSection isSystemAdmin={isSystemAdmin} />
      )}

      {!isBoardReviewer && activeTab === 'settings' && isSystemAdmin && <ExamSettingsSection />}
    </div>
  );
};

export default AdminExaminationsPage;

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ExamPipelineSection } from '../../../features/examinations/components/pipeline/ExamPipelineSection';
import { ExamsDirectoryTab } from '../quiz-bank/ExamsDirectoryTab';
import { CertificatesSection } from '../../../features/examinations/components/certificates/CertificatesSection';
import { ExamSettingsSection } from '../../../features/examinations/components/settings/ExamSettingsSection';
import { ExaminationsHeader } from './ExaminationsHeader';

export const AdminExaminationsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const isSystemAdmin = user?.role === 'SYSTEM_ADMIN' || Boolean(user?.isSystemAdmin?.());
  const isTrainingAdmin = user?.role === 'TRAINING_ADMIN' || Boolean(user?.isTrainingAdmin?.());
  const isBoardReviewer = user?.role === 'BOARD_REVIEWER' || Boolean(user?.isBoardReviewer?.());

  const initialTab = (searchParams.get('tab') as any) || 'pipeline';
  const validTabs: Array<'pipeline' | 'exams' | 'certificates' | 'settings'> = ['pipeline', 'exams', 'certificates', 'settings'];
  const [activeTab, setActiveTabState] = useState<'pipeline' | 'exams' | 'certificates' | 'settings'>(
    validTabs.includes(initialTab) ? initialTab : 'pipeline'
  );

  const handleTabChange = (tab: 'pipeline' | 'exams' | 'certificates' | 'settings') => {
    setActiveTabState(tab);
    setSearchParams(tab === 'pipeline' ? {} : { tab });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header matching Command Center DashboardHeader */}
      <ExaminationsHeader
        isBoardReviewer={isBoardReviewer}
        isSystemAdmin={isSystemAdmin}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Tab Panels */}
      {(isBoardReviewer || activeTab === 'pipeline') && (
        <ExamPipelineSection
          isSystemAdmin={isSystemAdmin}
          isTrainingAdmin={isTrainingAdmin}
          isBoardReviewer={isBoardReviewer}
        />
      )}

      {!isBoardReviewer && activeTab === 'exams' && (
        <ExamsDirectoryTab />
      )}

      {!isBoardReviewer && activeTab === 'certificates' && (
        <CertificatesSection isSystemAdmin={isSystemAdmin} />
      )}

      {!isBoardReviewer && activeTab === 'settings' && isSystemAdmin && <ExamSettingsSection />}
    </div>
  );
};

export default AdminExaminationsPage;

import React, { useState } from 'react';
import { Award, Layers, HelpCircle, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ExamPipelineSection } from '../../features/examinations/components/pipeline/ExamPipelineSection';
import { QuestionBankSection } from '../../features/examinations/components/questions/QuestionBankSection';
import { CertificatesSection } from '../../features/examinations/components/certificates/CertificatesSection';
import { ExamSettingsSection } from '../../features/examinations/components/settings/ExamSettingsSection';

export const AdminExaminationsPage: React.FC = () => {
  const { user } = useAuth();

  const isSystemAdmin = user?.role === 'SYSTEM_ADMIN' || Boolean(user?.isSystemAdmin?.());
  const isTrainingAdmin = user?.role === 'TRAINING_ADMIN' || Boolean(user?.isTrainingAdmin?.());
  const isBoardReviewer = user?.role === 'BOARD_REVIEWER' || Boolean(user?.isBoardReviewer?.());

  const [activeTab, setActiveTab] = useState<'pipeline' | 'questions' | 'certificates' | 'settings'>('pipeline');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header matching Command Center DashboardHeader */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
            Examinations
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '3px', marginBottom: 0 }}>
            Candidate evaluation and certification pipeline.
          </p>
        </div>

        {!isBoardReviewer && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('pipeline')}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                padding: '6px 12px',
                background: activeTab === 'pipeline' ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                color: activeTab === 'pipeline' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderColor: activeTab === 'pipeline' ? 'var(--text-muted)' : 'var(--border-subtle)',
              }}
            >
              <Layers size={13} />
              <span>Pipeline</span>
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                padding: '6px 12px',
                background: activeTab === 'questions' ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                color: activeTab === 'questions' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderColor: activeTab === 'questions' ? 'var(--text-muted)' : 'var(--border-subtle)',
              }}
            >
              <HelpCircle size={13} />
              <span>Question Bank</span>
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                padding: '6px 12px',
                background: activeTab === 'certificates' ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                color: activeTab === 'certificates' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderColor: activeTab === 'certificates' ? 'var(--text-muted)' : 'var(--border-subtle)',
              }}
            >
              <Award size={13} />
              <span>Certificates</span>
            </button>
            {isSystemAdmin && (
              <button
                onClick={() => setActiveTab('settings')}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  padding: '6px 12px',
                  background: activeTab === 'settings' ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  color: activeTab === 'settings' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderColor: activeTab === 'settings' ? 'var(--text-muted)' : 'var(--border-subtle)',
                }}
              >
                <Settings size={13} />
                <span>Settings</span>
              </button>
            )}
          </div>
        )}
      </div>

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


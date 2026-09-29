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

  // Primary navigation tabs
  const [activeTab, setActiveTab] = useState<'pipeline' | 'questions' | 'certificates' | 'settings'>('pipeline');

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--bg-surface-elevated, #1e293b)',
              border: '1px solid var(--border-subtle, #334155)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
          >
            <Award size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Examinations
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Candidate evaluation and certification governance
            </p>
          </div>
        </div>

        {/* Global Hub Navigation Tabs - only for System Admin and Training Admin */}
        {!isBoardReviewer && (
          <div
            style={{
              display: 'flex',
              padding: '3px',
              borderRadius: '8px',
              gap: '4px',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setActiveTab('pipeline')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'pipeline' ? 'var(--bg-surface-elevated, #334155)' : 'transparent',
                color: activeTab === 'pipeline' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeTab === 'pipeline' ? 600 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Layers size={14} /> Pipeline
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'questions' ? 'var(--bg-surface-elevated, #334155)' : 'transparent',
                color: activeTab === 'questions' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeTab === 'questions' ? 600 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <HelpCircle size={14} /> Question Bank
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'certificates' ? 'var(--bg-surface-elevated, #334155)' : 'transparent',
                color: activeTab === 'certificates' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeTab === 'certificates' ? 600 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Award size={14} /> Certificates
            </button>
            {isSystemAdmin && (
              <button
                onClick={() => setActiveTab('settings')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === 'settings' ? 'var(--bg-surface-elevated, #334155)' : 'transparent',
                  color: activeTab === 'settings' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'settings' ? 600 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Settings size={14} /> Settings
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

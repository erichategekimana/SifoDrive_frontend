import React, { useState } from 'react';
import {
  Layers,
  GraduationCap,
  Users,
  HelpCircle,
  Video,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';
import { Spinner } from '../../components/common/Spinner';
import { useLmsStudioData } from '../../features/lms/hooks/useLmsStudioData';
import { CurriculaSection } from '../../features/lms/components/CurriculaSection';
import { CohortsSection } from '../../features/lms/components/CohortsSection';
import { LearnersSection } from '../../features/lms/components/LearnersSection';
import { QuizzesSection } from '../../features/lms/components/QuizzesSection';
import { TutorsSection } from '../../features/lms/components/TutorsSection';

type LMSStudioSection = 'curricula' | 'cohorts' | 'learners' | 'quizzes' | 'tutors';

export const AdminCoursesPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isTrainingAdmin = user?.isTrainingAdmin();
  const isSystemAdmin = user?.isSystemAdmin();

  const [activeSection, setActiveSection] = useState<LMSStudioSection>('curricula');

  const {
    curricula,
    courses,
    cohorts,
    tutors,
    students,
    guests,
    questions,
    liveClasses,
    quizzes,
    isLoading,
    refetch,
  } = useLmsStudioData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            {isTrainingAdmin ? t('admin.courses.trainingAdminTitle') : t('admin.courses.systemAdminTitle')}
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isTrainingAdmin
              ? t('admin.courses.trainingAdminSubtitle')
              : t('admin.courses.systemAdminSubtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => refetch()}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            <span>{t('admin.dashboard.refresh')}</span>
          </button>
        </div>
      </div>

      {/* Functional Section Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '12px',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setActiveSection('curricula')}
          className={`btn btn-sm ${activeSection === 'curricula' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
        >
          <Layers size={15} />
          <span>{t('admin.courses.tabCurricula')} ({curricula.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('cohorts')}
          className={`btn btn-sm ${activeSection === 'cohorts' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
        >
          <GraduationCap size={15} />
          <span>{t('admin.courses.tabCohorts')} ({cohorts.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('learners')}
          className={`btn btn-sm ${activeSection === 'learners' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
        >
          <Users size={15} />
          <span>{t('admin.courses.tabLearners')} ({students.length + guests.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('quizzes')}
          className={`btn btn-sm ${activeSection === 'quizzes' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
        >
          <HelpCircle size={15} />
          <span>{t('admin.courses.tabQuizzes')} ({quizzes.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('tutors')}
          className={`btn btn-sm ${activeSection === 'tutors' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
        >
          <Video size={15} />
          <span>{t('admin.courses.tabTutors')} ({tutors.length})</span>
        </button>
      </div>

      {/* Main Studio View Body */}
      {isLoading ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <Spinner message="Loading LMS Studio data..." />
        </div>
      ) : (
        <>
          {activeSection === 'curricula' && (
            <CurriculaSection
              curricula={curricula}
              courses={courses}
              isSystemAdmin={isSystemAdmin}
              isTrainingAdmin={isTrainingAdmin}
              refetch={refetch}
            />
          )}

          {activeSection === 'cohorts' && (
            <CohortsSection
              cohorts={cohorts}
              tutors={tutors}
              refetch={refetch}
            />
          )}

          {activeSection === 'learners' && (
            <LearnersSection
              students={students}
              guests={guests}
              cohorts={cohorts}
              tutors={tutors}
              refetch={refetch}
            />
          )}

          {activeSection === 'quizzes' && (
            <QuizzesSection
              quizzes={quizzes}
              courses={courses}
              questions={questions}
              refetch={refetch}
              isSystemAdmin={isSystemAdmin}
              isTrainingAdmin={isTrainingAdmin}
            />
          )}

          {activeSection === 'tutors' && (
            <TutorsSection
              tutors={tutors}
              liveClasses={liveClasses}
              cohorts={cohorts}
              refetch={refetch}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AdminCoursesPage;

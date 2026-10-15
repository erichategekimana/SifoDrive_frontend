import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../context/I18nContext';
import { Spinner } from '../../../components/common/Spinner';
import { useLmsStudioData } from '../../../features/lms/hooks/useLmsStudioData';
import { CurriculaSection } from '../../../features/lms/components/CurriculaSection';
import { CohortsSection } from '../../../features/lms/components/CohortsSection';
import { LearnersSection } from '../../../features/lms/components/LearnersSection';
import { TutorsSection } from '../../../features/lms/components/TutorsSection';
import { CoursesHeader } from './CoursesHeader';
import { CoursesTabsNav, type LMSStudioSection } from './CoursesTabsNav';

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
    isLoading,
    isRefetching,
    refetch,
  } = useLmsStudioData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <CoursesHeader
        isTrainingAdmin={isTrainingAdmin}
        t={t}
        onRefresh={() => refetch()}
        isLoading={isLoading}
        isRefetching={isRefetching}
      />

      {/* Functional Section Navigation Tabs */}
      <CoursesTabsNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        curriculaCount={curricula.length}
        cohortsCount={cohorts.length}
        learnersCount={students.length + guests.length}
        tutorsCount={tutors.length}
        t={t}
      />

      {/* Main Studio View Body */}
      {isLoading && courses.length === 0 && curricula.length === 0 ? (
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

          {activeSection === 'tutors' && (
            <TutorsSection
              tutors={tutors}
              cohorts={cohorts}
              curricula={curricula}
              courses={courses}
              refetch={refetch}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AdminCoursesPage;

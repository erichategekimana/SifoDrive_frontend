import React from 'react';
import { Layers, GraduationCap, Users, UserCheck } from 'lucide-react';

export type LMSStudioSection = 'curricula' | 'cohorts' | 'learners' | 'tutors';

interface CoursesTabsNavProps {
  activeSection: LMSStudioSection;
  onSectionChange: (section: LMSStudioSection) => void;
  curriculaCount: number;
  cohortsCount: number;
  learnersCount: number;
  tutorsCount: number;
  t: (key: string) => string;
}

export const CoursesTabsNav: React.FC<CoursesTabsNavProps> = ({
  activeSection,
  onSectionChange,
  curriculaCount,
  cohortsCount,
  learnersCount,
  tutorsCount,
  t,
}) => {
  return (
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
        onClick={() => onSectionChange('curricula')}
        className={`btn btn-sm ${activeSection === 'curricula' ? 'btn-primary' : 'btn-secondary'}`}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
      >
        <Layers size={15} />
        <span>{t('admin.courses.tabCurricula')} ({curriculaCount})</span>
      </button>

      <button
        onClick={() => onSectionChange('cohorts')}
        className={`btn btn-sm ${activeSection === 'cohorts' ? 'btn-primary' : 'btn-secondary'}`}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
      >
        <GraduationCap size={15} />
        <span>{t('admin.courses.tabCohorts')} ({cohortsCount})</span>
      </button>

      <button
        onClick={() => onSectionChange('learners')}
        className={`btn btn-sm ${activeSection === 'learners' ? 'btn-primary' : 'btn-secondary'}`}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
      >
        <Users size={15} />
        <span>{t('admin.courses.tabLearners')} ({learnersCount})</span>
      </button>

      <button
        onClick={() => onSectionChange('tutors')}
        className={`btn btn-sm ${activeSection === 'tutors' ? 'btn-primary' : 'btn-secondary'}`}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
      >
        <UserCheck size={15} />
        <span>{t('admin.courses.tabTutors')} ({tutorsCount})</span>
      </button>
    </div>
  );
};

import React from 'react';
import { BookOpen } from 'lucide-react';
import type { Course } from '../../../../../core/models/Course';
import type { CohortModuleItem } from '../../../../../core/services/TutorLmsService';
import { LessonViewPage } from '../../../../../pages/lms/LessonViewPage';
import { ModuleCard } from './ModuleCard';

export interface CourseModulesTabProps {
  course: Course;
  modules: any[];
  selectedLessonId: string | null;
  isTutor: boolean;
  isGuest: boolean;
  activeCohortName: string;
  activeCohortId: string | null;
  cohortModulesMap: Record<string, CohortModuleItem>;
  completedLessons: number;
  totalLessons: number;
  courseProgress: number;
  collapsedModules: Record<string, boolean>;
  onToggleModule: (modId: string) => void;
  onToggleModuleLock: (modId: string, lock: boolean) => void;
  onOpenLesson: (lessonId: string) => void;
  onCloseLesson: () => void;
}

export const CourseModulesTab: React.FC<CourseModulesTabProps> = ({
  course,
  modules,
  selectedLessonId,
  isTutor,
  isGuest,
  activeCohortName,
  activeCohortId,
  cohortModulesMap,
  completedLessons,
  totalLessons,
  courseProgress,
  collapsedModules,
  onToggleModule,
  onToggleModuleLock,
  onOpenLesson,
  onCloseLesson,
}) => {
  if (selectedLessonId) {
    return (
      <div style={{ width: '100%', padding: '0 0 32px 0' }}>
        <LessonViewPage
          lessonId={selectedLessonId}
          courseId={course.id}
          onBack={onCloseLesson}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2D3B45', margin: 0 }}>
            Course Modules & Lessons
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: '3px 0 0 0' }}>
            {isTutor
              ? `Target Cohort: ${activeCohortName} — Release modules one-by-one to this cohort.`
              : `${completedLessons} of ${totalLessons} lessons completed (${courseProgress}%)`}
          </p>
        </div>
      </div>

      {modules.length === 0 ? (
        <div
          className="canvas-card"
          style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#FFFFFF' }}
        >
          <BookOpen size={36} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155', margin: 0 }}>
            No Modules in This Course
          </h3>
        </div>
      ) : (
        modules.map((mod, modIdx) => (
          <ModuleCard
            key={mod.id}
            module={mod}
            modIdx={modIdx}
            isTutor={isTutor}
            isGuest={isGuest}
            activeCohortName={activeCohortName}
            activeCohortId={activeCohortId}
            cohortModulesMap={cohortModulesMap}
            isModuleCollapsed={Boolean(collapsedModules[mod.id])}
            onToggleModule={onToggleModule}
            onToggleModuleLock={onToggleModuleLock}
            onOpenLesson={onOpenLesson}
          />
        ))
      )}
    </div>
  );
};

export default CourseModulesTab;

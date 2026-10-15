import React from 'react';
import { ChevronRight, ChevronDown, Lock, Unlock } from 'lucide-react';
import type { CohortModuleItem } from '../../../../../core/services/TutorLmsService';
import { useTranslation } from '../../../../../context/I18nContext';
import { LessonRow } from './LessonRow';

interface ModuleCardProps {
  module: any;
  modIdx: number;
  isTutor: boolean;
  isGuest: boolean;
  activeCohortName: string;
  activeCohortId: string | null;
  cohortModulesMap: Record<string, CohortModuleItem>;
  isModuleCollapsed: boolean;
  onToggleModule: (modId: string) => void;
  onToggleModuleLock: (modId: string, lock: boolean) => void;
  onOpenLesson: (lessonId: string) => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module: mod,
  modIdx,
  isTutor,
  isGuest,
  activeCohortName,
  activeCohortId,
  cohortModulesMap,
  isModuleCollapsed,
  onToggleModule,
  onToggleModuleLock,
  onOpenLesson,
}) => {
  const { t } = useTranslation();
  const isModuleOutside = mod.isOutsideResource;

  return (
    <div
      id={`module-${mod.id}`}
      className="canvas-card"
      style={{
        padding: 0,
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        borderRadius: '6px',
        backgroundColor: '#FFFFFF',
      }}
    >
      <div
        onClick={() => onToggleModule(mod.id)}
        style={{
          padding: '14px 20px',
          backgroundColor: '#F8FAFC',
          borderBottom: isModuleCollapsed ? 'none' : '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isModuleCollapsed ? (
            <ChevronRight size={18} color="#64748B" />
          ) : (
            <ChevronDown size={18} color="#64748B" />
          )}
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#475569',
              backgroundColor: '#F1F5F9',
              border: '1px solid #E2E8F0',
              padding: '2px 8px',
              borderRadius: '3px',
            }}
          >
            Module {modIdx + 1}
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.98rem',
              color: isModuleOutside ? '#0055A5' : '#1E293B',
            }}
          >
            {mod.title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isTutor && activeCohortId && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: (cohortModulesMap[mod.id]?.is_locked ?? true) ? '#FEF2F2' : '#F0FDF4',
                  color: (cohortModulesMap[mod.id]?.is_locked ?? true) ? '#991B1B' : '#166534',
                  border: (cohortModulesMap[mod.id]?.is_locked ?? true) ? '1px solid #FECACA' : '1px solid #BBF7D0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {(cohortModulesMap[mod.id]?.is_locked ?? true) ? <Lock size={12} /> : <Unlock size={12} />}
                {(cohortModulesMap[mod.id]?.is_locked ?? true)
                  ? `Locked for ${activeCohortName}`
                  : `Released to ${activeCohortName}`}
              </span>
              <button
                onClick={() => {
                  const currentlyLocked = cohortModulesMap[mod.id]?.is_locked ?? true;
                  onToggleModuleLock(mod.id, !currentlyLocked);
                }}
                className="canvas-btn"
                style={{
                  fontSize: '0.74rem',
                  padding: '4px 10px',
                  fontWeight: 600,
                  backgroundColor: (cohortModulesMap[mod.id]?.is_locked ?? true) ? '#0055A5' : '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {(cohortModulesMap[mod.id]?.is_locked ?? true) ? 'Unlock' : 'Lock'}
              </button>
            </div>
          )}
          {!isTutor && (
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>
              {t('canvasCourses.lessonsCount', { count: mod.lessons?.length || 0 })}
            </div>
          )}
        </div>
      </div>

      {/* Lessons list */}
      {!isModuleCollapsed && (
        <div>
          {!mod.lessons || mod.lessons.length === 0 ? (
            <div
              style={{
                padding: '16px 22px',
                fontSize: '0.82rem',
                color: '#94A3B8',
                fontStyle: 'italic',
              }}
            >
              No lessons available in this module yet.
            </div>
          ) : (
            mod.lessons.map((les: any) => (
              <LessonRow
                key={les.id}
                lesson={les}
                isModuleStudentOnly={mod.isStudentOnly}
                isGuest={isGuest}
                onOpenLesson={onOpenLesson}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleCard;

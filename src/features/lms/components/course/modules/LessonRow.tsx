import React from 'react';
import { Lock, FileText, CheckCircle, ChevronRight } from 'lucide-react';

interface LessonRowProps {
  lesson: any;
  isModuleStudentOnly?: boolean;
  isGuest: boolean;
  onOpenLesson: (lessonId: string) => void;
}

export const LessonRow: React.FC<LessonRowProps> = ({
  lesson,
  isModuleStudentOnly,
  isGuest,
  onOpenLesson,
}) => {
  const isLessonStudentOnly = lesson.isStudentOnly || isModuleStudentOnly;
  const isLessonLockedForGuest = isGuest && isLessonStudentOnly && !lesson.isFreePreview;
  const isLessonOutside = lesson.isOutsideResource;

  return (
    <div
      onClick={() => onOpenLesson(lesson.id)}
      style={{
        padding: '14px 20px',
        borderBottom: '1px solid #F1F5F9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#F8FAFC';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#FFFFFF';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
        <div style={{ flexShrink: 0 }}>
          {isLessonLockedForGuest ? (
            <Lock size={17} color="#94A3B8" />
          ) : (
            <FileText size={17} color="#64748B" />
          )}
        </div>
        <div>
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 600,
              color: isLessonOutside ? '#0055A5' : '#1E293B',
            }}
          >
            {lesson.title}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
            {lesson.getFormattedDuration?.() || lesson.duration || ''}
          </div>
        </div>
      </div>

      <div>
        {lesson.isCompleted ? (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.75rem',
              color: '#64748B',
              fontWeight: 600,
            }}
          >
            <CheckCircle size={15} color="#64748B" />
            <span>Completed</span>
          </span>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenLesson(lesson.id);
            }}
            className="canvas-btn canvas-btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
          >
            <span>Start Lesson</span>
            <ChevronRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonRow;

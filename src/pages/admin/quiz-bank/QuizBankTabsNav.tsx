import React from 'react';
import { FileText, Layers, BookOpen } from 'lucide-react';

export type QuizBankSection = 'quizzesAssignments' | 'activities' | 'questionBank';

interface QuizBankTabsNavProps {
  activeSection: QuizBankSection;
  onSectionChange: (section: QuizBankSection) => void;
  quizzesCount?: number;
  activitiesCount?: number;
  questionsCount?: number;
}

export const QuizBankTabsNav: React.FC<QuizBankTabsNavProps> = ({
  activeSection,
  onSectionChange,
}) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        padding: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(10px)',
        borderRadius: '9999px',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        gap: '4px',
        width: 'fit-content',
      }}
    >
      <button
        type="button"
        onClick={() => onSectionChange('quizzesAssignments')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 20px',
          borderRadius: '9999px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.84rem',
          fontWeight: activeSection === 'quizzesAssignments' ? 700 : 500,
          backgroundColor: activeSection === 'quizzesAssignments' ? '#1E293B' : 'transparent',
          color: activeSection === 'quizzesAssignments' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)',
          boxShadow: activeSection === 'quizzesAssignments' ? '0 2px 8px rgba(0, 0, 0, 0.25)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <FileText size={15} />
        <span>Quizzes & Assignments</span>
      </button>

      <button
        type="button"
        onClick={() => onSectionChange('activities')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 20px',
          borderRadius: '9999px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.84rem',
          fontWeight: activeSection === 'activities' ? 700 : 500,
          backgroundColor: activeSection === 'activities' ? '#1E293B' : 'transparent',
          color: activeSection === 'activities' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)',
          boxShadow: activeSection === 'activities' ? '0 2px 8px rgba(0, 0, 0, 0.25)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <Layers size={15} />
        <span>Activities</span>
      </button>

      <button
        type="button"
        onClick={() => onSectionChange('questionBank')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 20px',
          borderRadius: '9999px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.84rem',
          fontWeight: activeSection === 'questionBank' ? 700 : 500,
          backgroundColor: activeSection === 'questionBank' ? '#1E293B' : 'transparent',
          color: activeSection === 'questionBank' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)',
          boxShadow: activeSection === 'questionBank' ? '0 2px 8px rgba(0, 0, 0, 0.25)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <BookOpen size={15} />
        <span>Question Bank</span>
      </button>
    </div>
  );
};

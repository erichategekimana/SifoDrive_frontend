import React from 'react';
import { HelpCircle, Play, BookOpen } from 'lucide-react';

interface QuizBankTabsNavProps {
  activeTab: 'quizzes' | 'simulator' | 'questionBank';
  onTabChange: (tab: 'quizzes' | 'simulator' | 'questionBank') => void;
  quizzesCount: number;
  questionsCount: number;
}

export const QuizBankTabsNav: React.FC<QuizBankTabsNavProps> = ({
  activeTab,
  onTabChange,
  quizzesCount,
  questionsCount,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '10px',
      }}
    >
      <button
        onClick={() => onTabChange('quizzes')}
        className={`btn btn-sm ${activeTab === 'quizzes' ? 'btn-primary' : 'btn-secondary'}`}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
      >
        <HelpCircle size={15} />
        <span>Quizzes & Assessments ({quizzesCount})</span>
      </button>

      <button
        onClick={() => onTabChange('simulator')}
        className={`btn btn-sm ${activeTab === 'simulator' ? 'btn-primary' : 'btn-secondary'}`}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
      >
        <Play size={15} />
        <span>Live Proctoring Simulator</span>
      </button>

      <button
        onClick={() => onTabChange('questionBank')}
        className={`btn btn-sm ${activeTab === 'questionBank' ? 'btn-primary' : 'btn-secondary'}`}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
      >
        <BookOpen size={15} />
        <span>Central Question Bank ({questionsCount})</span>
      </button>
    </div>
  );
};

import React from 'react';
import { HelpCircle, Clock, FileCheck, BookOpen } from 'lucide-react';

interface QuizBankKpiRibbonProps {
  totalQuizzes: number;
  liveCount: number;
  proctoredCount: number;
  workSubmissionCount: number;
  totalQuestions: number;
}

export const QuizBankKpiRibbon: React.FC<QuizBankKpiRibbonProps> = ({
  totalQuizzes,
  liveCount,
  proctoredCount,
  workSubmissionCount,
  totalQuestions,
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
      <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-lg)', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HelpCircle size={22} />
        </div>
        <div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>{totalQuizzes}</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Total Quizzes in Bank</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-lg)', background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Clock size={22} />
        </div>
        <div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>{liveCount}</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Live Timed ({proctoredCount} Proctored)</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-lg)', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileCheck size={22} />
        </div>
        <div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>{workSubmissionCount}</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Work Submissions (Take-Home)</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-lg)', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BookOpen size={22} />
        </div>
        <div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>{totalQuestions}</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Central Highway Code Questions</div>
        </div>
      </div>
    </div>
  );
};

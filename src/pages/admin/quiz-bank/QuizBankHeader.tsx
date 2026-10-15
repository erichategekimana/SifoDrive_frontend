import React from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';

interface QuizBankHeaderProps {
  onRefresh: () => void;
  onCreateQuiz: () => void;
  isLoading: boolean;
  isRefetching: boolean;
  refreshText: string;
}

export const QuizBankHeader: React.FC<QuizBankHeaderProps> = ({
  onRefresh,
  onCreateQuiz,
  isLoading,
  isRefetching,
  refreshText,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Quiz Bank & Assessment Lifecycle
          </h1>
          <Badge variant="neutral">Engine v2</Badge>
        </div>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Manage and schedule theoretical assessments. Supports Live Timed quizzes with active tab-switching proctoring and self-paced Work Submissions.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={isLoading || isRefetching ? 'spin' : ''} />
          <span>{refreshText}</span>
        </button>

        <button
          onClick={onCreateQuiz}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: 'var(--radius-lg)', fontWeight: 700 }}
        >
          <Plus size={16} />
          <span>Create New Quiz</span>
        </button>
      </div>
    </div>
  );
};

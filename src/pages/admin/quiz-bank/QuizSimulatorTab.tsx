import React from 'react';
import { Sparkles } from 'lucide-react';
import { LiveQuizSimulator } from '../../../features/lms/components/quiz/LiveQuizSimulator';
import type { QuizItem } from '../../../core/services/AdminService';

interface QuizSimulatorTabProps {
  quizzes: QuizItem[];
  simulatorQuiz: QuizItem | null;
  onSelectQuiz: (q: QuizItem) => void;
  onClose: () => void;
  onSubmitted: () => void;
}

export const QuizSimulatorTab: React.FC<QuizSimulatorTabProps> = ({
  quizzes,
  simulatorQuiz,
  onSelectQuiz,
  onClose,
  onSubmitted,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Target Quiz Selector */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={18} style={{ color: '#38bdf8' }} />
          <div>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
              Interactive Quiz Test Runner
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
              Select any quiz to test live timer, question selection, and tab-switching proctoring violation detection.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Quiz:</span>
          <select
            value={simulatorQuiz?.id || ''}
            onChange={(e) => {
              const target = quizzes.find((q) => q.id === e.target.value);
              if (target) onSelectQuiz(target);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '0.84rem',
              minWidth: '240px',
            }}
          >
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title} ({(q.quiz_type || 'LIVE_TIMED') === 'LIVE_TIMED' ? 'Live' : 'Take-Home'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {simulatorQuiz ? (
        <LiveQuizSimulator
          key={simulatorQuiz.id}
          quiz={simulatorQuiz}
          onClose={onClose}
          onSubmitted={onSubmitted}
        />
      ) : (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          No quiz selected for simulation.
        </div>
      )}
    </div>
  );
};

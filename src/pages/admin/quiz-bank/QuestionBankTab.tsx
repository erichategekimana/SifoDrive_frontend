import React from 'react';
import { Search } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';

interface QuestionBankTabProps {
  questions: any[];
  filteredQuestions: any[];
  qbSearch: string;
  setQbSearch: (val: string) => void;
  qbDomainFilter: string;
  setQbDomainFilter: (val: string) => void;
  qbDifficultyFilter: string;
  setQbDifficultyFilter: (val: string) => void;
}

export const QuestionBankTab: React.FC<QuestionBankTabProps> = ({
  questions,
  filteredQuestions,
  qbSearch,
  setQbSearch,
  qbDomainFilter,
  setQbDomainFilter,
  qbDifficultyFilter,
  setQbDifficultyFilter,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Filter Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search question bank by English or Kinyarwanda..."
              value={qbSearch}
              onChange={(e) => setQbSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.84rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Domain:</span>
            <select
              value={qbDomainFilter}
              onChange={(e) => setQbDomainFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.84rem',
              }}
            >
              <option value="ALL">All Domains</option>
              <option value="PRIORITY">Priority & Right-of-Way</option>
              <option value="ROAD_SIGNS">Road Signs</option>
              <option value="SPEED">Speed Limits</option>
              <option value="TECHNICAL">Technical Rules</option>
              <option value="SIGNALS">Traffic Signals</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Difficulty:</span>
            <select
              value={qbDifficultyFilter}
              onChange={(e) => setQbDifficultyFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.84rem',
              }}
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing {filteredQuestions.length} of {questions.length} questions
        </div>
      </div>

      {/* Question Bank Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredQuestions.slice(0, 50).map((q: any) => (
          <div
            key={q.id}
            className="glass-panel"
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8' }}>
                  #{q.question_number || 'Q'}
                </span>
                <Badge variant="neutral">{q.domain}</Badge>
                <Badge
                  variant={q.difficulty === 'EASY' ? 'success' : q.difficulty === 'HARD' ? 'danger' : 'warning'}
                >
                  {q.difficulty}
                </Badge>
              </div>
            </div>

            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
              {q.question_text}
            </div>

            {q.question_text_kinyarwanda && (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                {q.question_text_kinyarwanda}
              </div>
            )}

            {/* Option summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div>A: {q.option_a}</div>
              <div>B: {q.option_b}</div>
              {q.option_c && <div>C: {q.option_c}</div>}
              {q.option_d && <div>D: {q.option_d}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

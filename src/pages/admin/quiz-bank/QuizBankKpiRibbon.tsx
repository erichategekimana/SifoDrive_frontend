import React from 'react';
import { HelpCircle, Clock, FileCheck, Car, Layers, CheckCircle2 } from 'lucide-react';
import type { QuizBankSection } from './QuizBankTabsNav';

interface QuizBankKpiRibbonProps {
  section: QuizBankSection;
  // Quizzes & Assignments metrics
  totalQuizzes: number;
  liveCount: number;
  proctoredCount: number;
  workSubmissionCount: number;
  // Activities metrics
  totalActivities?: number;
  practicalDrillsCount?: number;
  otherActivitiesCount?: number;
  // Question Bank metrics
  totalQuestions?: number;
  activeDomainsCount?: number;
}

export const QuizBankKpiRibbon: React.FC<QuizBankKpiRibbonProps> = ({
  section,
  totalQuizzes,
  liveCount,
  proctoredCount,
  workSubmissionCount,
  totalActivities = 0,
  practicalDrillsCount = 0,
  otherActivitiesCount = 0,
  totalQuestions = 0,
  activeDomainsCount = 6,
}) => {
  if (section === 'activities') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
        <div className="glass-panel" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Layers size={14} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>{totalActivities}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Total Cohort Activities</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Car size={14} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>{practicalDrillsCount}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Practical Driving Drills</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileCheck size={14} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>{otherActivitiesCount}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Assignments & Case Studies</div>
          </div>
        </div>
      </div>
    );
  }

  if (section === 'questionBank') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
        <div className="glass-panel" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <HelpCircle size={14} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>{totalQuestions || 500}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Total Question Bank Items</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Layers size={14} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>{activeDomainsCount || 6}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Official Traffic Domains</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCircle2 size={14} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>Trilingual</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Kinyarwanda, English & French</div>
          </div>
        </div>
      </div>
    );
  }

  // Default: quizzesAssignments
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
      <div className="glass-panel" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '9px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <HelpCircle size={14} />
        </div>
        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>{totalQuizzes}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Total Quizzes & Assignments</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '9px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Clock size={14} />
        </div>
        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>{liveCount}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Live Timed ({proctoredCount} Proctored)</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '9px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FileCheck size={14} />
        </div>
        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>{workSubmissionCount}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Work Submissions</div>
        </div>
      </div>
    </div>
  );
};

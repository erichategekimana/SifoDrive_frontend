import React from 'react';
import type { PlatformAnalyticsData } from '../types';

interface StudentsAnalyticsTabProps {
  stu?: PlatformAnalyticsData['students'];
}

export const StudentsAnalyticsTab: React.FC<StudentsAnalyticsTabProps> = ({ stu }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Student Overview Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
        }}
      >
        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
            Enrolled Students
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {stu?.total_enrolled || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
            {stu?.active_students || 0} actively studying
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
            Average Curriculum Progress
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {stu?.avg_course_progress || 0}%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
            Across highway code & theory modules
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
            Certification Rate
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {stu?.completion_rate || 0}%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
            {stu?.certificates_issued || 0} verified certificates issued
          </div>
        </div>
      </div>

      {/* Curriculum Progression Roadmap */}
      <div className="glass-panel" style={{ padding: '22px', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 16px', color: '#ffffff' }}>
          Academy Progression Milestone Funnel
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { stage: 'Theory Enrollment', count: stu?.total_enrolled || 0, percent: 100, color: '#38bdf8' },
            { stage: 'Traffic Law Practice', count: Math.round((stu?.total_enrolled || 0) * 0.85), percent: 85, color: '#60a5fa' },
            { stage: 'Mock Exam Clearance', count: Math.round((stu?.total_enrolled || 0) * 0.68), percent: 68, color: '#818cf8' },
            { stage: 'Certified Graduate', count: stu?.certificates_issued || 0, percent: stu?.completion_rate || 35, color: '#34d399' },
          ].map((m, i) => (
            <div
              key={m.stage}
              style={{
                padding: '14px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#94a3b8' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.color }} />
                Stage {i + 1}
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                {m.stage}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
                {m.count}
              </div>
              {/* Colored progress bar */}
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${m.percent}%`, background: m.color, borderRadius: '2px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cohorts Table */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 16px', color: '#ffffff' }}>
          Training Cohorts
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: '#64748b' }}>
                <th style={{ padding: '10px 12px' }}>Cohort</th>
                <th style={{ padding: '10px 12px' }}>Start Date</th>
                <th style={{ padding: '10px 12px' }}>Students</th>
                <th style={{ padding: '10px 12px' }}>Progress</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stu?.cohorts.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#ffffff' }}>{c.name}</td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{c.start_date}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#ffffff' }}>
                    {c.students_count}
                  </td>
                  <td style={{ padding: '10px 12px', minWidth: '160px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          flex: 1,
                          height: '6px',
                          background: 'rgba(255,255,255,0.06)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${c.avg_progress}%`,
                            background: 'linear-gradient(90deg, #38bdf8, #60a5fa)',
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.76rem', color: '#ffffff', fontWeight: 700 }}>
                        {c.avg_progress}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#ffffff',
                      }}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

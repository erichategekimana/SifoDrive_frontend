import React from 'react';
import {
  RadarSpiderChart,
  SemiCircleGauge,
  GroupedBarChart,
} from '../../../components/admin/analytics/AnalyticsCharts';
import type { PlatformAnalyticsData } from '../types';

interface ActivitiesAnalyticsTabProps {
  act?: PlatformAnalyticsData['activities'];
  domainRadarData: Array<{ name: string; score: number; questions: number }>;
  bookingBarsData: Array<{ label: string; value: number; color: string }>;
  formatNumber: (val: number) => string;
}

export const ActivitiesAnalyticsTab: React.FC<ActivitiesAnalyticsTabProps> = ({
  act,
  domainRadarData,
  bookingBarsData,
  formatNumber,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Main Visualizations Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Graph 1: Radar / Spider Chart for Domain Mastery */}
        <div className="glass-panel" style={{ padding: '22px', borderRadius: '12px' }}>
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              Rwanda Highway Code Competency (Radar Chart)
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#94a3b8' }}>
              Candidate pass rate across 6 official traffic police domains
            </p>
          </div>

          <RadarSpiderChart
            categories={domainRadarData}
            size={300}
            polygonColor="#38bdf8"
            fillColor="rgba(56, 189, 248, 0.22)"
          />
        </div>

        {/* Graph 2 & 3: Radial Pass Rate Gauge + Practical Driving Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Radial Pass Rate Gauge */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            <SemiCircleGauge
              value={act?.pass_rate || 84.5}
              label="Exam Pass Rate"
              sublabel="National standard benchmark"
              color="#38bdf8"
              size={190}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Total Exams</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  {formatNumber(act?.total_exams || 0)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Average Score</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  {act?.avg_score || 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Grouped Column Bar Chart: Practical Driving Bookings */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
            <div style={{ marginBottom: '10px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                Practical Driving Bookings
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#94a3b8' }}>
                Status distribution across practical field appointments
              </p>
            </div>

            <GroupedBarChart bars={bookingBarsData} height={150} />
          </div>
        </div>
      </div>

      {/* Domain Breakdown Detailed List */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 16px', color: '#ffffff' }}>
          Domain Breakdown Summary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {act?.domain_performance.map((d) => (
            <div
              key={d.domain}
              style={{
                padding: '14px 16px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.84rem', color: '#ffffff' }}>{d.name}</span>
                <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#ffffff' }}>
                  {d.avg_pass_rate}%
                </span>
              </div>
              {/* Colored progress line */}
              <div
                style={{
                  height: '6px',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${d.avg_pass_rate}%`,
                    background: d.avg_pass_rate >= 80 ? '#38bdf8' : '#f87171',
                    borderRadius: '3px',
                  }}
                />
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {d.questions} active questions in bank
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

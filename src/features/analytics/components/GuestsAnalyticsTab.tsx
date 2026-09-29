import React from 'react';
import { FunnelFlowChart } from '../../../components/admin/analytics/AnalyticsCharts';
import type { PlatformAnalyticsData } from '../types';

interface GuestsAnalyticsTabProps {
  gst?: PlatformAnalyticsData['guests'];
  guestFunnelStages: Array<{
    stage: string;
    count: number;
    rate: number;
    description: string;
    color: string;
  }>;
  formatNumber: (val: number) => string;
}

export const GuestsAnalyticsTab: React.FC<GuestsAnalyticsTabProps> = ({
  gst,
  guestFunnelStages,
  formatNumber,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Guest KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
        }}
      >
        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
            Registered Guests
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {formatNumber(gst?.total_registered || 0)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
            {gst?.mock_exam_attempts || 0} trial test attempts
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
            Guest Pass Rate
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {gst?.guest_pass_rate || 0}%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
            Mock trial exam performance
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
            Guest-to-Academy Conversions
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {gst?.conversions || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
            {gst?.conversion_rate}% conversion rate to full tuition
          </div>
        </div>
      </div>

      {/* Graph: Connected Funnel Flow Visualization */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
            Guest Conversion Funnel
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#94a3b8' }}>
            Stage-by-stage throughput from free signup to paid academy student
          </p>
        </div>

        <FunnelFlowChart stages={guestFunnelStages} />
      </div>
    </div>
  );
};

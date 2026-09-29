import React from 'react';
import {
  AreaSplineChart,
  DonutChart,
} from '../../../components/admin/analytics/AnalyticsCharts';
import type { PlatformAnalyticsData } from '../types';

interface FinanceAnalyticsTabProps {
  fin?: PlatformAnalyticsData['finance'];
  revenueChartData: Array<{ label: string; value: number; secondaryValue: number }>;
  feeStreamSegments: Array<{ label: string; value: number; percentage: number; color: string }>;
  formatCurrency: (val: number) => string;
}

export const FinanceAnalyticsTab: React.FC<FinanceAnalyticsTabProps> = ({
  fin,
  revenueChartData,
  feeStreamSegments,
  formatCurrency,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Revenue Trajectory & Fee Streams Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Graph 1: Area Spline Chart (Revenue Trajectory) */}
        <div className="glass-panel" style={{ padding: '22px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                Revenue Trajectory
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#94a3b8' }}>
                Gross revenue volume (cyan) vs. MTN MoMo collection (coral)
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.72rem', color: '#94a3b8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
                Gross Revenue
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171' }} />
                MTN MoMo
              </span>
            </div>
          </div>

          {/* Area Spline Visualization */}
          <AreaSplineChart
            data={revenueChartData}
            height={220}
            formatValue={(v) => formatCurrency(v)}
            primaryColor="#38bdf8"
            secondaryColor="#f87171"
            primaryName="Gross Total"
            secondaryName="MTN MoMo"
            showSecondary={true}
          />
        </div>

        {/* Graph 2: Donut Chart (Fee Streams Breakdown) */}
        <div className="glass-panel" style={{ padding: '22px', borderRadius: '12px' }}>
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              Revenue by Stream
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#94a3b8' }}>
              Tuition, single passes, corporate licenses, and concierge
            </p>
          </div>

          <DonutChart
            segments={feeStreamSegments}
            size={180}
            centerLabel="Total Gross"
            centerValue={formatCurrency(fin?.gross_revenue || 0)}
          />
        </div>
      </div>

      {/* Provider Split & Transaction Status Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        {/* MoMo Provider Comparison Bars */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 16px', color: '#ffffff' }}>
            Payment Gateways Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {fin?.providers.map((p) => (
              <div key={p.provider} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ fontWeight: 600, color: '#ffffff' }}>{p.name}</span>
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>
                    {formatCurrency(p.amount)} <span style={{ color: '#94a3b8', fontWeight: 500 }}>({p.percentage}%)</span>
                  </span>
                </div>
                {/* Visual Progress Bar with vibrant fill */}
                <div
                  style={{
                    height: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${p.percentage}%`,
                      background:
                        p.provider === 'MTN'
                          ? 'linear-gradient(90deg, #38bdf8, #60a5fa)'
                          : 'linear-gradient(90deg, #f87171, #fb7185)',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {p.count} transactions completed
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Health Indicators */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 16px', color: '#ffffff' }}>
            Transaction Settlement Health
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Successful</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                {fin?.successful_transactions || 0}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>settled</div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Pending</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                {fin?.pending_transactions || 0}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>processing</div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Failed</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                {fin?.failed_transactions || 0}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>timeout/insufficient</div>
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.76rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Average Revenue Per Student (ARPU)</span>
            <span style={{ fontWeight: 800, color: '#ffffff' }}>{formatCurrency(fin?.arpu || 0)}</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions Ledger */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 14px', color: '#ffffff' }}>
          Recent Transactions
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: '#64748b' }}>
                <th style={{ padding: '10px 12px' }}>Payer</th>
                <th style={{ padding: '10px 12px' }}>Provider</th>
                <th style={{ padding: '10px 12px' }}>Stream</th>
                <th style={{ padding: '10px 12px' }}>Amount</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {fin?.recent_transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#ffffff' }}>
                    {t.payer_name}
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>
                      {t.phone}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#ffffff',
                      }}
                    >
                      {t.provider}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{t.fee_type}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#ffffff' }}>
                    {formatCurrency(t.amount)}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#ffffff',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background:
                            t.status === 'SUCCESSFUL'
                              ? '#34d399'
                              : t.status === 'PENDING'
                              ? '#fbbf24'
                              : '#f87171',
                        }}
                      />
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#64748b' }}>{t.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

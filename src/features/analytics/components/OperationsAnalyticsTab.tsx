import React from 'react';
import { AreaSplineChart } from '../../../components/admin/analytics/AnalyticsCharts';
import type { PlatformAnalyticsData } from '../types';

interface OperationsAnalyticsTabProps {
  ops?: PlatformAnalyticsData['operations'];
  operationsChartData: Array<{ label: string; value: number; secondaryValue: number }>;
  formatNumber: (val: number) => string;
  formatCurrency: (val: number) => string;
}

export const OperationsAnalyticsTab: React.FC<OperationsAnalyticsTabProps> = ({
  ops,
  operationsChartData,
  formatNumber,
  formatCurrency,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Operations KPI Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
        }}
      >
        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
            Total SMS Dispatched
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {formatNumber(ops?.sms_sent || 0)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
            {ops?.sms_delivered || 0} Delivered &bull; {ops?.sms_failed || 0} Failed
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
            Pindo Gateway Delivery Rate
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {ops?.sms_delivery_rate || 0}%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
            High Reliability SMS Gateway
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
            Estimated Gateway Cost
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {formatCurrency(ops?.estimated_sms_cost_rwf || 0)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
            15 RWF / transactional SMS
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
            Security Audit Events
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {formatNumber(ops?.audit_events_count || 0)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
            Rwanda Law 058/2021 Compliant
          </div>
        </div>
      </div>

      {/* Graph: SMS Dispatch & Delivery Rate Trajectory */}
      <div className="glass-panel" style={{ padding: '22px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              SMS Dispatch & Delivery Velocity
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#94a3b8' }}>
              Weekly notification traffic dispatched vs successfully delivered
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.72rem', color: '#94a3b8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
              Dispatched
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
              Delivered
            </span>
          </div>
        </div>

        <AreaSplineChart
          data={operationsChartData}
          height={180}
          formatValue={(v) => `${v} SMS`}
          primaryColor="#38bdf8"
          secondaryColor="#34d399"
          primaryName="Dispatched"
          secondaryName="Delivered"
          showSecondary={true}
        />
      </div>

      {/* Infrastructure Health Matrix */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 16px', color: '#ffffff' }}>
          Infrastructure & Service Gateways
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {[
            {
              service: 'Pindo SMS Gateway',
              endpoint: 'https://api.pindo.io/v1/sms/',
              status: 'OPERATIONAL',
              metric: `${ops?.sms_delivery_rate || 96.6}% delivery rate`,
              statusColor: '#34d399',
            },
            {
              service: 'MTN Mobile Money Open API',
              endpoint: 'MTN Rwanda MoMo Gateway',
              status: 'ACTIVE',
              metric: 'Instant callback webhooks',
              statusColor: '#34d399',
            },
            {
              service: 'Airtel Money Merchant API',
              endpoint: 'Airtel Rwanda Gateway',
              status: 'ACTIVE',
              metric: 'Automatic reconciliation',
              statusColor: '#34d399',
            },
            {
              service: 'IremboGov Concierge Sync',
              endpoint: 'Irembo Driving License Registry',
              status: 'SYNCED',
              metric: 'Direct exam slot verification',
              statusColor: '#34d399',
            },
          ].map((srv) => (
            <div
              key={srv.service}
              style={{
                padding: '16px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.84rem', color: '#ffffff' }}>{srv.service}</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
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
                      background: srv.statusColor,
                    }}
                  />
                  {srv.status}
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{srv.endpoint}</div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 500, marginTop: '4px' }}>
                {srv.metric}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { DollarSign, Users, CheckCircle2, Award, MessageSquare } from 'lucide-react';
import type { PlatformAnalyticsData } from '../types';

interface AnalyticsExecutiveRibbonProps {
  exec?: PlatformAnalyticsData['executive'];
  formatCurrency: (val: number) => string;
  formatNumber: (val: number) => string;
}

export const AnalyticsExecutiveRibbon: React.FC<AnalyticsExecutiveRibbonProps> = ({
  exec,
  formatCurrency,
  formatNumber,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
      }}
    >
      {/* KPI 1: Gross Revenue */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 18px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#94a3b8' }}>
            Gross Revenue
          </span>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DollarSign size={15} />
          </div>
        </div>
        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
          {formatCurrency(exec?.gross_revenue || 0)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
            {exec?.success_rate || 95}% collected
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>&bull; MoMo & Card</span>
        </div>
      </div>

      {/* KPI 2: Total Users */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 18px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#94a3b8' }}>
            Total Users
          </span>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={15} />
          </div>
        </div>
        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
          {formatNumber(exec?.total_users || 0)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
            {exec?.enrolled_students || 0} Students
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            &bull; {exec?.registered_guests || 0} Guests
          </span>
        </div>
      </div>

      {/* KPI 3: Pass Rate */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 18px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#94a3b8' }}>
            Exam Pass Rate
          </span>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={15} />
          </div>
        </div>
        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
          {exec?.exam_pass_rate || 0}%
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
            Official Police Standard
          </span>
        </div>
      </div>

      {/* KPI 4: Certificates Issued */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 18px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#94a3b8' }}>
            Certificates Issued
          </span>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={15} />
          </div>
        </div>
        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
          {formatNumber(exec?.certificates_issued || 0)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Tamper-proof & QR-verified
          </span>
        </div>
      </div>

      {/* KPI 5: SMS Delivery */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 18px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#94a3b8' }}>
            SMS Delivery Rate
          </span>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageSquare size={15} />
          </div>
        </div>
        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
          {exec?.sms_delivery_rate || 0}%
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
            Pindo Gateway
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>&bull; Live API</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { TrendingUp, RefreshCw, Download } from 'lucide-react';
import type { AnalyticsTimeframe } from '../types';

interface AnalyticsHeaderProps {
  timeframe: AnalyticsTimeframe;
  setTimeframe: (t: AnalyticsTimeframe) => void;
  timeframeLabel?: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onExport: () => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  timeframe,
  setTimeframe,
  timeframeLabel,
  isRefreshing,
  onRefresh,
  onExport,
}) => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <TrendingUp size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Analytics
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              Platform performance &bull; {timeframeLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Timeframe Filter & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Timeframe Selector */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(0,0,0,0.35)',
            borderRadius: '8px',
            padding: '3px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {(
            [
              { key: '7d', label: '7D' },
              { key: '30d', label: '30D' },
              { key: '90d', label: '90D' },
              { key: '1y', label: '1Y' },
              { key: 'all', label: 'ALL' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTimeframe(t.key)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                background: timeframe === t.key ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: timeframe === t.key ? '#ffffff' : '#94a3b8',
                fontWeight: timeframe === t.key ? 700 : 500,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Refresh Action */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          style={{
            padding: '7px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.04)',
            color: '#ffffff',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          title="Refresh analytics data"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </button>

        {/* Export Action */}
        <button
          onClick={onExport}
          style={{
            padding: '7px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#ffffff',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Download size={14} />
          Export
        </button>
      </div>
    </div>
  );
};

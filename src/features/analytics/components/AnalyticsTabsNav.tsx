import React from 'react';
import { DollarSign, BarChart2, BookOpen, Users, Smartphone } from 'lucide-react';
import type { AnalyticsTab } from '../types';

interface AnalyticsTabsNavProps {
  activeTab: AnalyticsTab;
  setActiveTab: (tab: AnalyticsTab) => void;
}

export const AnalyticsTabsNav: React.FC<AnalyticsTabsNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { key: 'finance' as const, label: 'Finance', icon: <DollarSign size={16} /> },
    { key: 'activities' as const, label: 'Activities', icon: <BarChart2 size={16} /> },
    { key: 'students' as const, label: 'Students', icon: <BookOpen size={16} /> },
    { key: 'guests' as const, label: 'Guests', icon: <Users size={16} /> },
    { key: 'operations' as const, label: 'Operations', icon: <Smartphone size={16} /> },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '2px',
        overflowX: 'auto',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '9px 18px',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: isActive ? '#ffffff' : '#94a3b8',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: isActive ? '2px solid #ffffff' : '2px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

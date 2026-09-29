import React from 'react';
import { DollarSign, Layers, CalendarClock, Bell, Building2 } from 'lucide-react';
import type { SettingsTab } from '../types';

interface SettingsTabsNavProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export const SettingsTabsNav: React.FC<SettingsTabsNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: 'finance' as const, label: 'Finance', icon: <DollarSign size={16} /> },
    { key: 'plans' as const, label: 'Plans', icon: <Layers size={16} /> },
    { key: 'rules' as const, label: 'Rules', icon: <CalendarClock size={16} /> },
    { key: 'notifications' as const, label: 'Notifications', icon: <Bell size={16} /> },
    { key: 'academy' as const, label: 'Academy', icon: <Building2 size={16} /> },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '2px',
        marginBottom: '24px',
        overflowX: 'auto',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              padding: '9px 18px',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: isActive ? '#ffffff' : '#94a3b8',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'inline-flex',
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

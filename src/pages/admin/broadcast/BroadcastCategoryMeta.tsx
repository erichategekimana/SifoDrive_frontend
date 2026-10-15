import React from 'react';
import { Sparkles, Wrench, HelpCircle, Megaphone } from 'lucide-react';

export interface CategoryMeta {
  label: string;
  icon: React.ReactNode;
  badgeBg: string;
  badgeColor: string;
  border: string;
  gradient: string;
}

export const getCategoryMeta = (cat: string): CategoryMeta => {
  switch (cat) {
    case 'PLATFORM_UPDATE':
      return {
        label: 'Platform Update',
        icon: <Sparkles size={13} />,
        badgeBg: '#EDE9FE',
        badgeColor: '#6D28D9',
        border: '#DDD6FE',
        gradient: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
      };
    case 'MAINTENANCE':
      return {
        label: 'Maintenance Notice',
        icon: <Wrench size={13} />,
        badgeBg: '#FEF3C7',
        badgeColor: '#B45309',
        border: '#FDE68A',
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      };
    case 'HELP_SUPPORT':
      return {
        label: 'Help & Support',
        icon: <HelpCircle size={13} />,
        badgeBg: '#DBEAFE',
        badgeColor: '#1D4ED8',
        border: '#BFDBFE',
        gradient: 'linear-gradient(135deg, #2563EB 0%, #0284C7 100%)',
      };
    case 'SYSTEM_ANNOUNCEMENT':
    default:
      return {
        label: 'Official Announcement',
        icon: <Megaphone size={13} />,
        badgeBg: '#D1FAE5',
        badgeColor: '#047857',
        border: '#A7F3D0',
        gradient: 'linear-gradient(135deg, #059669 0%, #0D9488 100%)',
      };
  }
};

import type { PlatformAnalyticsData } from '../../core/services/AdminService';

export type AnalyticsTimeframe = '7d' | '30d' | '90d' | '1y' | 'all';
export type AnalyticsTab = 'finance' | 'activities' | 'students' | 'guests' | 'operations';

export type { PlatformAnalyticsData };

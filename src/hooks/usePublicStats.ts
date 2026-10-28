import { useState, useEffect } from 'react';
import type { PublicStatsConfig, PlatformEnvironmentConfig } from '../features/settings/types';
import { DEFAULT_PUBLIC_STATS } from '../features/settings/hooks/useAdminSettingsData';

const STORAGE_KEY = 'sifo_admin_settings_platform_config';

/**
 * Hook to retrieve and subscribe to real-time Homepage Stats & Metrics
 * configured by the System Administrator in Platform Settings.
 */
export function usePublicStats(): PublicStatsConfig {
  const [statsConfig, setStatsConfig] = useState<PublicStatsConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: PlatformEnvironmentConfig = JSON.parse(stored);
        if (parsed.publicStats) {
          return { ...DEFAULT_PUBLIC_STATS, ...parsed.publicStats };
        }
      }
    } catch {}
    return DEFAULT_PUBLIC_STATS;
  });

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch live shared platform configuration from the server on mount
    const fetchLiveConfig = async () => {
      try {
        const res = await fetch(`/platform-settings-sync?t=${Date.now()}`);
        if (res.ok && isMounted) {
          const data: PlatformEnvironmentConfig = await res.json();
          if (data && data.publicStats) {
            setStatsConfig({ ...DEFAULT_PUBLIC_STATS, ...data.publicStats });
          }
        }
      } catch {}
    };
    fetchLiveConfig();

    // 2. Listen to custom event for immediate same-tab updates
    const handleConfigChange = (e: Event) => {
      try {
        const customEv = e as CustomEvent<PlatformEnvironmentConfig>;
        if (customEv?.detail?.publicStats) {
          setStatsConfig({ ...DEFAULT_PUBLIC_STATS, ...customEv.detail.publicStats });
        }
      } catch {}
    };

    // 3. Listen to localStorage storage events across browser tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed: PlatformEnvironmentConfig = JSON.parse(e.newValue);
          if (parsed.publicStats) {
            setStatsConfig({ ...DEFAULT_PUBLIC_STATS, ...parsed.publicStats });
          }
        } catch {}
      }
    };

    // 4. Cross-tab BroadcastChannel
    let broadcast: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        broadcast = new BroadcastChannel('sifo_platform_sync');
        broadcast.onmessage = (event) => {
          if (event.data?.publicStats) {
            setStatsConfig({ ...DEFAULT_PUBLIC_STATS, ...event.data.publicStats });
          }
        };
      }
    } catch {}

    window.addEventListener('sifo_platform_config_updated', handleConfigChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener('sifo_platform_config_updated', handleConfigChange);
      window.removeEventListener('storage', handleStorageChange);
      if (broadcast) {
        broadcast.close();
      }
    };
  }, []);

  return statsConfig;
}

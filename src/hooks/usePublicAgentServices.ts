import { useState, useEffect } from 'react';
import type { PublicAgentServicesConfig, PlatformEnvironmentConfig } from '../features/settings/types';
import {
  DEFAULT_PUBLIC_AGENT_SERVICES,
  DEFAULT_AGENT_SERVICES_BOOKING_FORM,
} from '../features/settings/hooks/useAdminSettingsData';
import { useTranslation } from '../context/I18nContext';

const STORAGE_KEY = 'sifo_admin_settings_platform_config';

const mergeAgentServicesConfig = (incoming?: Partial<PublicAgentServicesConfig>): PublicAgentServicesConfig => {
  if (!incoming) return DEFAULT_PUBLIC_AGENT_SERVICES;
  return {
    ...DEFAULT_PUBLIC_AGENT_SERVICES,
    ...incoming,
    bookingForm: {
      ...DEFAULT_AGENT_SERVICES_BOOKING_FORM,
      ...(incoming.bookingForm || {}),
    },
  };
};

/**
 * Hook to retrieve and subscribe to real-time Agent Services settings
 * and 'How It Works & Booking Steps' configured by the System Administrator in Platform Settings.
 */
export function usePublicAgentServices() {
  const { language } = useTranslation();
  const isRw = language === 'rw';

  const [agentServicesConfig, setAgentServicesConfig] = useState<PublicAgentServicesConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: PlatformEnvironmentConfig = JSON.parse(stored);
        if (parsed.publicAgentServices) {
          return mergeAgentServicesConfig(parsed.publicAgentServices);
        }
      }
    } catch {}
    return DEFAULT_PUBLIC_AGENT_SERVICES;
  });

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch live shared platform configuration on mount
    const fetchLiveConfig = async () => {
      try {
        const res = await fetch(`/platform-settings-sync?t=${Date.now()}`);
        if (res.ok && isMounted) {
          const data: PlatformEnvironmentConfig = await res.json();
          if (data && data.publicAgentServices) {
            setAgentServicesConfig(mergeAgentServicesConfig(data.publicAgentServices));
          }
        }
      } catch {}
    };
    fetchLiveConfig();

    // 2. Listen to custom event for immediate same-tab updates
    const handleConfigChange = (e: Event) => {
      try {
        const customEv = e as CustomEvent<PlatformEnvironmentConfig>;
        if (customEv?.detail?.publicAgentServices) {
          setAgentServicesConfig(mergeAgentServicesConfig(customEv.detail.publicAgentServices));
        }
      } catch {}
    };

    // 3. Listen to localStorage storage events across browser tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed: PlatformEnvironmentConfig = JSON.parse(e.newValue);
          if (parsed.publicAgentServices) {
            setAgentServicesConfig(mergeAgentServicesConfig(parsed.publicAgentServices));
          }
        } catch {}
      }
    };

    // 4. Cross-tab BroadcastChannel listener
    let broadcastChannel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        broadcastChannel = new BroadcastChannel('sifo_platform_sync');
        broadcastChannel.onmessage = (event) => {
          if (event?.data?.publicAgentServices && isMounted) {
            setAgentServicesConfig(mergeAgentServicesConfig(event.data.publicAgentServices));
          }
        };
      } catch {}
    }

    window.addEventListener('sifo_platform_config_updated', handleConfigChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener('sifo_platform_config_updated', handleConfigChange);
      window.removeEventListener('storage', handleStorageChange);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, []);

  return { agentServicesConfig, isRw };
}

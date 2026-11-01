import { useState, useEffect } from 'react';
import type { PublicSchoolProgramConfig, PlatformEnvironmentConfig } from '../features/settings/types';
import { DEFAULT_PUBLIC_SCHOOL_PROGRAM } from '../features/settings/hooks/useAdminSettingsData';
import { useTranslation } from '../context/I18nContext';

const STORAGE_KEY = 'sifo_admin_settings_platform_config';

const mergeSchoolProgramConfig = (incoming?: Partial<PublicSchoolProgramConfig>): PublicSchoolProgramConfig => {
  if (!incoming) return DEFAULT_PUBLIC_SCHOOL_PROGRAM;
  return {
    ...DEFAULT_PUBLIC_SCHOOL_PROGRAM,
    ...incoming,
    slides: (incoming.slides && incoming.slides.length > 0)
      ? incoming.slides
      : DEFAULT_PUBLIC_SCHOOL_PROGRAM.slides,
  };
};

/**
 * Hook to retrieve and subscribe in real-time to School Program page settings,
 * independent background controls, and looping hero video/slideshow configured by Admin.
 */
export function usePublicSchoolProgram() {
  const { language } = useTranslation();
  const isRw = language === 'rw';

  const [schoolProgramConfig, setSchoolProgramConfig] = useState<PublicSchoolProgramConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: PlatformEnvironmentConfig = JSON.parse(stored);
        if (parsed.publicSchoolProgram) {
          return mergeSchoolProgramConfig(parsed.publicSchoolProgram);
        }
      }
    } catch {}
    return DEFAULT_PUBLIC_SCHOOL_PROGRAM;
  });

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch live shared platform configuration on mount
    const fetchLiveConfig = async () => {
      try {
        const res = await fetch(`/platform-settings-sync?t=${Date.now()}`);
        if (res.ok && isMounted) {
          const data: PlatformEnvironmentConfig = await res.json();
          if (data && data.publicSchoolProgram) {
            setSchoolProgramConfig(mergeSchoolProgramConfig(data.publicSchoolProgram));
          }
        }
      } catch {}
    };
    fetchLiveConfig();

    // 2. Listen to custom event for immediate same-tab updates
    const handleConfigChange = (e: Event) => {
      try {
        const customEv = e as CustomEvent<PlatformEnvironmentConfig>;
        if (customEv?.detail?.publicSchoolProgram) {
          setSchoolProgramConfig(mergeSchoolProgramConfig(customEv.detail.publicSchoolProgram));
        }
      } catch {}
    };

    // 3. Listen to localStorage storage events across browser tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed: PlatformEnvironmentConfig = JSON.parse(e.newValue);
          if (parsed.publicSchoolProgram) {
            setSchoolProgramConfig(mergeSchoolProgramConfig(parsed.publicSchoolProgram));
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
          if (event?.data?.publicSchoolProgram && isMounted) {
            setSchoolProgramConfig(mergeSchoolProgramConfig(event.data.publicSchoolProgram));
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

  return { schoolProgramConfig, isRw };
}

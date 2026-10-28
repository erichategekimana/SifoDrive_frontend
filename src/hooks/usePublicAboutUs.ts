import { useState, useEffect } from 'react';
import type { PublicAboutUsConfig, PlatformEnvironmentConfig } from '../features/settings/types';
import { DEFAULT_PUBLIC_ABOUT_US } from '../features/settings/hooks/useAdminSettingsData';
import { useTranslation } from '../context/I18nContext';

const STORAGE_KEY = 'sifo_admin_settings_platform_config';

/**
 * Hook to retrieve and subscribe to real-time About Us and Who We Are copy
 * configured by the System Administrator in Platform Settings.
 */
export function usePublicAboutUs() {
  const { language, t } = useTranslation();
  const isRw = language === 'rw';

  const [aboutUsConfig, setAboutUsConfig] = useState<PublicAboutUsConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: PlatformEnvironmentConfig = JSON.parse(stored);
        if (parsed.publicAboutUs) {
          return { ...DEFAULT_PUBLIC_ABOUT_US, ...parsed.publicAboutUs };
        }
      }
    } catch {}
    return DEFAULT_PUBLIC_ABOUT_US;
  });

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch live shared platform configuration from the server on mount
    const fetchLiveConfig = async () => {
      try {
        const res = await fetch(`/platform-settings-sync?t=${Date.now()}`);
        if (res.ok && isMounted) {
          const data: PlatformEnvironmentConfig = await res.json();
          if (data && data.publicAboutUs) {
            setAboutUsConfig({ ...DEFAULT_PUBLIC_ABOUT_US, ...data.publicAboutUs });
          }
        }
      } catch {}
    };
    fetchLiveConfig();

    // 2. Listen to custom event for immediate same-tab updates
    const handleConfigChange = (e: Event) => {
      try {
        const customEv = e as CustomEvent<PlatformEnvironmentConfig>;
        if (customEv?.detail?.publicAboutUs) {
          setAboutUsConfig({ ...DEFAULT_PUBLIC_ABOUT_US, ...customEv.detail.publicAboutUs });
        }
      } catch {}
    };

    // 3. Listen to localStorage storage events across browser tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed: PlatformEnvironmentConfig = JSON.parse(e.newValue);
          if (parsed.publicAboutUs) {
            setAboutUsConfig({ ...DEFAULT_PUBLIC_ABOUT_US, ...parsed.publicAboutUs });
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
          if (event.data?.publicAboutUs) {
            setAboutUsConfig({ ...DEFAULT_PUBLIC_ABOUT_US, ...event.data.publicAboutUs });
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

  const title = isRw
    ? (aboutUsConfig.aboutUsTitleRw || t('landing.aboutUsTitle'))
    : (aboutUsConfig.aboutUsTitle || t('landing.aboutUsTitle'));

  const subtitle = isRw
    ? (aboutUsConfig.aboutUsSubtitleRw || t('landing.aboutUsSubtitle'))
    : (aboutUsConfig.aboutUsSubtitle || t('landing.aboutUsSubtitle'));

  const whoWeAreTitle = isRw
    ? (aboutUsConfig.whoWeAreTitleRw || t('landing.whoWeAreTitle'))
    : (aboutUsConfig.whoWeAreTitle || t('landing.whoWeAreTitle'));

  const whoWeAreDesc = isRw
    ? (aboutUsConfig.whoWeAreDescRw || t('landing.whoWeAreDesc'))
    : (aboutUsConfig.whoWeAreDesc || t('landing.whoWeAreDesc'));

  return {
    aboutUsConfig,
    title,
    subtitle,
    whoWeAreTitle,
    whoWeAreDesc,
  };
}

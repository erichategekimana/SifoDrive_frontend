import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PublicNavTabConfig, PlatformEnvironmentConfig } from '../features/settings/types';
import { DEFAULT_PUBLIC_NAV_TABS } from '../features/settings/hooks/useAdminSettingsData';

const STORAGE_KEY = 'sifo_admin_settings_platform_config';

/**
 * Reconciles stored tab settings with default tabs, ensuring all required tabs exist
 * and preserving configured visibility and order.
 */
function resolveNavTabs(storedConfigStr: string | null): PublicNavTabConfig[] {
  if (!storedConfigStr) {
    return DEFAULT_PUBLIC_NAV_TABS;
  }
  try {
    const parsed: PlatformEnvironmentConfig = JSON.parse(storedConfigStr);
    if (parsed && Array.isArray(parsed.publicNavTabs) && parsed.publicNavTabs.length > 0) {
      return DEFAULT_PUBLIC_NAV_TABS.map((def) => {
        const custom = parsed.publicNavTabs?.find((t) => t.id === def.id);
        return custom ? { ...def, ...custom } : def;
      });
    }
  } catch (err) {
    console.warn('Failed to parse stored platform config for nav tabs:', err);
  }
  return DEFAULT_PUBLIC_NAV_TABS;
}

/**
 * Hook to manage public navigation tabs visibility and state.
 * Supports real-time updates when system administrators toggle visibility.
 */
export function usePublicNavigation() {
  const [tabs, setTabs] = useState<PublicNavTabConfig[]>(() => {
    return resolveNavTabs(localStorage.getItem(STORAGE_KEY));
  });

  useEffect(() => {
    const handleConfigChange = (e?: Event) => {
      try {
        const customEv = e as CustomEvent<PlatformEnvironmentConfig>;
        if (customEv?.detail && Array.isArray(customEv.detail.publicNavTabs)) {
          const merged = DEFAULT_PUBLIC_NAV_TABS.map((def) => {
            const custom = customEv.detail.publicNavTabs?.find((t) => t.id === def.id);
            return custom ? { ...def, ...custom } : def;
          });
          setTabs(merged);
          return;
        }

        const freshTabs = resolveNavTabs(localStorage.getItem(STORAGE_KEY));
        setTabs(freshTabs);
      } catch (err) {
        console.warn('Error handling nav tabs config sync:', err);
      }
    };

    window.addEventListener('sifo_platform_config_updated', handleConfigChange);
    window.addEventListener('storage', handleConfigChange);

    return () => {
      window.removeEventListener('sifo_platform_config_updated', handleConfigChange);
      window.removeEventListener('storage', handleConfigChange);
    };
  }, []);

  const visibleTabs = useMemo(() => {
    return tabs
      .filter((tab) => tab.isEnabled !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [tabs]);

  const isTabVisible = useCallback(
    (tabId: string) => {
      const target = tabs.find((t) => t.id === tabId);
      return target ? target.isEnabled !== false : false;
    },
    [tabs]
  );

  const toggleTab = useCallback(
    (tabId: string, isEnabled: boolean) => {
      setTabs((prev) => {
        const updated = prev.map((t) => (t.id === tabId ? { ...t, isEnabled } : t));
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          const currentConfig: PlatformEnvironmentConfig = stored ? JSON.parse(stored) : {};
          const nextConfig: PlatformEnvironmentConfig = {
            ...currentConfig,
            publicNavTabs: updated,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig));
          window.dispatchEvent(
            new CustomEvent('sifo_platform_config_updated', { detail: nextConfig })
          );
        } catch (err) {
          console.error('Failed to persist nav tab toggle:', err);
        }
        return updated;
      });
    },
    []
  );

  return {
    tabs,
    visibleTabs,
    isTabVisible,
    toggleTab,
  };
}

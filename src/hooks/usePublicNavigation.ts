import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PublicNavTabConfig, PlatformEnvironmentConfig } from '../features/settings/types';
import { DEFAULT_PUBLIC_NAV_TABS } from '../features/settings/hooks/useAdminSettingsData';

const STORAGE_KEY = 'sifo_admin_settings_platform_config';

/**
 * Robustly reconciles configured tabs with default definitions.
 * Preserves custom isEnabled (whether true or false) and custom ordering.
 */
function reconcileTabs(configuredTabs?: PublicNavTabConfig[] | null): PublicNavTabConfig[] {
  if (!Array.isArray(configuredTabs) || configuredTabs.length === 0) {
    return DEFAULT_PUBLIC_NAV_TABS;
  }

  const result: PublicNavTabConfig[] = [];

  // 1. First add all configured tabs that exist in defaults, preserving admin order and flags
  configuredTabs.forEach((custom) => {
    const def = DEFAULT_PUBLIC_NAV_TABS.find((d) => d.id === custom.id);
    if (def) {
      result.push({
        ...def,
        ...custom,
        isEnabled: custom.isEnabled !== false, // Explicitly boolean
      });
    }
  });

  // 2. Ensure any missing default tabs are appended
  DEFAULT_PUBLIC_NAV_TABS.forEach((def) => {
    if (!result.some((t) => t.id === def.id)) {
      result.push({ ...def });
    }
  });

  return result.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Resolves tabs from a serialized JSON string in localStorage.
 */
function resolveStoredTabs(storedConfigStr: string | null): PublicNavTabConfig[] {
  if (!storedConfigStr) {
    return DEFAULT_PUBLIC_NAV_TABS;
  }
  try {
    const parsed: PlatformEnvironmentConfig = JSON.parse(storedConfigStr);
    if (parsed && Array.isArray(parsed.publicNavTabs) && parsed.publicNavTabs.length > 0) {
      return reconcileTabs(parsed.publicNavTabs);
    }
  } catch (err) {
    console.warn('Failed to parse stored platform config for nav tabs:', err);
  }
  return DEFAULT_PUBLIC_NAV_TABS;
}

/**
 * Hook to manage public navigation tabs visibility and route access.
 * Synchronizes in real time across components, browser tabs, and server state.
 */
export function usePublicNavigation() {
  const [tabs, setTabs] = useState<PublicNavTabConfig[]>(() => {
    return resolveStoredTabs(localStorage.getItem(STORAGE_KEY));
  });

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch live shared platform configuration from the server on mount
    const fetchServerConfig = async () => {
      try {
        const res = await fetch(`/platform-settings-sync?t=${Date.now()}`);
        if (res.ok) {
          const data: PlatformEnvironmentConfig = await res.json();
          if (data && Array.isArray(data.publicNavTabs) && data.publicNavTabs.length > 0) {
            const serverReconciled = reconcileTabs(data.publicNavTabs);
            if (isMounted) {
              setTabs(serverReconciled);
            }
            try {
              const currentStored: PlatformEnvironmentConfig = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || '{}'
              );
              localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                  ...currentStored,
                  ...data,
                  publicNavTabs: serverReconciled,
                })
              );
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Failed to fetch server platform config for navigation:', err);
      }
    };

    fetchServerConfig();

    // 2. Listen to custom DOM events (in same window)
    const handleConfigChange = (e?: Event) => {
      try {
        const customEv = e as CustomEvent<PlatformEnvironmentConfig>;
        if (customEv?.detail && Array.isArray(customEv.detail.publicNavTabs)) {
          const updated = reconcileTabs(customEv.detail.publicNavTabs);
          setTabs(updated);
          return;
        }

        const freshTabs = resolveStoredTabs(localStorage.getItem(STORAGE_KEY));
        setTabs(freshTabs);
      } catch (err) {
        console.warn('Error handling nav tabs config sync:', err);
      }
    };

    window.addEventListener('sifo_platform_config_updated', handleConfigChange);
    window.addEventListener('storage', handleConfigChange);

    // 3. Listen to cross-tab updates via BroadcastChannel
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      broadcastChannel = new BroadcastChannel('sifo_platform_sync');
      broadcastChannel.onmessage = (event) => {
        if (event.data && Array.isArray(event.data.publicNavTabs)) {
          setTabs(reconcileTabs(event.data.publicNavTabs));
        }
      };
    } catch {
      // BroadcastChannel not available in environment
    }

    return () => {
      isMounted = false;
      window.removeEventListener('sifo_platform_config_updated', handleConfigChange);
      window.removeEventListener('storage', handleConfigChange);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, []);

  const visibleTabs = useMemo(() => {
    return tabs
      .filter((tab) => tab.isEnabled !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [tabs]);

  const isTabVisible = useCallback(
    (tabId: string) => {
      const target = tabs.find((t) => t.id === tabId || t.path === tabId);
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

          // Broadcast to other tabs
          try {
            const ch = new BroadcastChannel('sifo_platform_sync');
            ch.postMessage({ publicNavTabs: updated });
            ch.close();
          } catch {}

          // Post directly to server
          fetch('/platform-settings-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nextConfig),
          }).catch(console.error);
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

export default usePublicNavigation;

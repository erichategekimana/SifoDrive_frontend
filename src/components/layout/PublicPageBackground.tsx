import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import type { PublicBackgroundConfig, PlatformEnvironmentConfig } from '../../features/settings/types';
import { DEFAULT_PUBLIC_BACKGROUND, DEFAULT_PUBLIC_BG_URL } from '../../features/settings/hooks/useAdminSettingsData';

export const PublicPageBackground: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [bgConfig, setBgConfig] = useState<PublicBackgroundConfig>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_settings_platform_config');
      if (stored) {
        const parsed: PlatformEnvironmentConfig = JSON.parse(stored);
        if (parsed.publicBackground) {
          return {
            ...DEFAULT_PUBLIC_BACKGROUND,
            ...parsed.publicBackground,
            imageDataUrl: (parsed.publicBackground.imageDataUrl && parsed.publicBackground.imageDataUrl.trim() !== '')
              ? parsed.publicBackground.imageDataUrl
              : DEFAULT_PUBLIC_BG_URL,
          };
        }
      }
    } catch {}
    return DEFAULT_PUBLIC_BACKGROUND;
  });

  useEffect(() => {
    const handleSync = (e?: Event) => {
      try {
        const customEv = e as CustomEvent<PlatformEnvironmentConfig>;
        let nextConfig: PublicBackgroundConfig | undefined;
        if (customEv?.detail && 'publicBackground' in customEv.detail) {
          nextConfig = customEv.detail.publicBackground;
        } else {
          const stored = localStorage.getItem('sifo_admin_settings_platform_config');
          if (stored) {
            const parsed: PlatformEnvironmentConfig = JSON.parse(stored);
            nextConfig = parsed.publicBackground;
          }
        }

        if (nextConfig) {
          setBgConfig({
            ...DEFAULT_PUBLIC_BACKGROUND,
            ...nextConfig,
            imageDataUrl: (nextConfig.imageDataUrl && nextConfig.imageDataUrl.trim() !== '')
              ? nextConfig.imageDataUrl
              : DEFAULT_PUBLIC_BG_URL,
          });
          return;
        }
        setBgConfig(DEFAULT_PUBLIC_BACKGROUND);
      } catch {
        setBgConfig(DEFAULT_PUBLIC_BACKGROUND);
      }
    };

    window.addEventListener('sifo_platform_config_updated', handleSync);
    window.addEventListener('storage', handleSync);

    // Fetch shared platform configuration from server so guests, students, and other browser sessions automatically receive admin settings
    const fetchSharedConfig = async () => {
      try {
        const res = await fetch('/platform-settings-sync');
        if (res.ok) {
          const data: PlatformEnvironmentConfig = await res.json();
          if (data && data.publicBackground) {
            const merged: PublicBackgroundConfig = {
              ...DEFAULT_PUBLIC_BACKGROUND,
              ...data.publicBackground,
              imageDataUrl: (data.publicBackground.imageDataUrl && data.publicBackground.imageDataUrl.trim() !== '')
                ? data.publicBackground.imageDataUrl
                : DEFAULT_PUBLIC_BG_URL,
            };
            setBgConfig(merged);
            try {
              localStorage.setItem('sifo_admin_settings_platform_config', JSON.stringify({
                ...data,
                publicBackground: merged,
              }));
            } catch {}
          }
        }
      } catch {}
    };

    fetchSharedConfig();

    return () => {
      window.removeEventListener('sifo_platform_config_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);


  // When disabled/OFF, render nothing so the page remains in its exact default state
  if (!bgConfig.enabled) {
    return null;
  }

  const imageOpacity = isDark
    ? bgConfig.darkImageOpacity ?? 0.15
    : bgConfig.lightImageOpacity ?? 0.20;

  const gradientOpacity = isDark
    ? bgConfig.darkGradientOpacity ?? 0.70
    : bgConfig.lightGradientOpacity ?? 0.85;

  const resolvedImageSrc = bgConfig.imageDataUrl || DEFAULT_PUBLIC_BG_URL;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100vh',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        backgroundColor: isDark ? '#0b0f17' : '#ffffff',
      }}
    >
      {/* Layer 1: Background Image (Straight cut at 100vh screen height, white visible underneath) */}
      {resolvedImageSrc ? (
        <img
          src={resolvedImageSrc}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            filter: isDark ? 'none' : 'brightness(1.08) contrast(0.96)',
            opacity: imageOpacity,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none',
          }}
        />
      ) : null}

      {/* Layer 1.5: Ambient Luminosity & Contrast Shield in Light Mode */}
      {!isDark && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0.65) 35%, rgba(255, 255, 255, 0.90) 80%, #ffffff 100%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Layer 2: Gradient Color Overlay (Straight cut at 100vh screen height) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: isDark
            ? 'radial-gradient(ellipse 100% 800px at 50% 0%, rgba(16, 185, 129, 0.18) 0%, rgba(14, 165, 233, 0.10) 45%, transparent 80%)'
            : 'radial-gradient(ellipse 100% 800px at 50% 0%, rgba(16, 185, 129, 0.24) 0%, rgba(14, 165, 233, 0.16) 45%, transparent 80%)',
          opacity: gradientOpacity,
          transition: 'opacity 0.2s ease',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

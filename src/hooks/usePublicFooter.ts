import { useState, useEffect } from 'react';
import type { PublicContactConfig, PublicLegalConfig, PlatformEnvironmentConfig } from '../features/settings/types';
import { DEFAULT_PUBLIC_CONTACT, DEFAULT_PUBLIC_LEGAL } from '../features/settings/hooks/useAdminSettingsData';
import { useTranslation } from '../context/I18nContext';

const STORAGE_KEY = 'sifo_admin_settings_platform_config';

/**
 * Hook to retrieve and subscribe to real-time Contact & Support and Legal & Regulatory details
 * configured by the System Administrator in Platform Settings.
 */
export function usePublicFooter() {
  const { language, t } = useTranslation();
  const isRw = language === 'rw';

  const [contactConfig, setContactConfig] = useState<PublicContactConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: PlatformEnvironmentConfig = JSON.parse(stored);
        if (parsed.publicContact) {
          return { ...DEFAULT_PUBLIC_CONTACT, ...parsed.publicContact };
        }
      }
    } catch {}
    return DEFAULT_PUBLIC_CONTACT;
  });

  const [legalConfig, setLegalConfig] = useState<PublicLegalConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: PlatformEnvironmentConfig = JSON.parse(stored);
        if (parsed.publicLegal) {
          return { ...DEFAULT_PUBLIC_LEGAL, ...parsed.publicLegal };
        }
      }
    } catch {}
    return DEFAULT_PUBLIC_LEGAL;
  });

  useEffect(() => {
    let isMounted = true;

    const fetchLiveConfig = async () => {
      try {
        const res = await fetch(`/platform-settings-sync?t=${Date.now()}`);
        if (res.ok && isMounted) {
          const data: PlatformEnvironmentConfig = await res.json();
          if (data) {
            if (data.publicContact) setContactConfig({ ...DEFAULT_PUBLIC_CONTACT, ...data.publicContact });
            if (data.publicLegal) setLegalConfig({ ...DEFAULT_PUBLIC_LEGAL, ...data.publicLegal });
          }
        }
      } catch {}
    };
    fetchLiveConfig();

    const handleConfigChange = (e: Event) => {
      try {
        const customEv = e as CustomEvent<PlatformEnvironmentConfig>;
        if (customEv?.detail) {
          if (customEv.detail.publicContact) setContactConfig({ ...DEFAULT_PUBLIC_CONTACT, ...customEv.detail.publicContact });
          if (customEv.detail.publicLegal) setLegalConfig({ ...DEFAULT_PUBLIC_LEGAL, ...customEv.detail.publicLegal });
        }
      } catch {}
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed: PlatformEnvironmentConfig = JSON.parse(e.newValue);
          if (parsed.publicContact) setContactConfig({ ...DEFAULT_PUBLIC_CONTACT, ...parsed.publicContact });
          if (parsed.publicLegal) setLegalConfig({ ...DEFAULT_PUBLIC_LEGAL, ...parsed.publicLegal });
        } catch {}
      }
    };

    let broadcast: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        broadcast = new BroadcastChannel('sifo_platform_sync');
        broadcast.onmessage = (event) => {
          if (event.data?.publicContact) setContactConfig({ ...DEFAULT_PUBLIC_CONTACT, ...event.data.publicContact });
          if (event.data?.publicLegal) setLegalConfig({ ...DEFAULT_PUBLIC_LEGAL, ...event.data.publicLegal });
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

  const contact = {
    address: isRw
      ? (contactConfig.addressRw || contactConfig.address || t('footer.kigaliAddress'))
      : (contactConfig.address || t('footer.kigaliAddress')),
    phone: contactConfig.phone || t('footer.supportPhone'),
    email: contactConfig.email || t('footer.supportEmail'),
    description: isRw
      ? (contactConfig.brandDescriptionRw || contactConfig.brandDescription || t('footer.desc'))
      : (contactConfig.brandDescription || t('footer.desc')),
  };

  const legal = {
    privacyPolicy: isRw
      ? (legalConfig.privacyPolicyRw || legalConfig.privacyPolicy || t('footer.privacyPolicy'))
      : (legalConfig.privacyPolicy || t('footer.privacyPolicy')),
    termsAndConditions: isRw
      ? (legalConfig.termsAndConditionsRw || legalConfig.termsAndConditions || t('footer.termsAndConditions'))
      : (legalConfig.termsAndConditions || t('footer.termsAndConditions')),
    cookies: isRw
      ? (legalConfig.cookiesRw || legalConfig.cookies || t('footer.cookies'))
      : (legalConfig.cookies || t('footer.cookies')),
    privacyPolicyContent: isRw
      ? (legalConfig.privacyPolicyContentRw || DEFAULT_PUBLIC_LEGAL.privacyPolicyContentRw)
      : (legalConfig.privacyPolicyContent || DEFAULT_PUBLIC_LEGAL.privacyPolicyContent),
    termsAndConditionsContent: isRw
      ? (legalConfig.termsAndConditionsContentRw || DEFAULT_PUBLIC_LEGAL.termsAndConditionsContentRw)
      : (legalConfig.termsAndConditionsContent || DEFAULT_PUBLIC_LEGAL.termsAndConditionsContent),
  };

  return { contact, legal, contactConfig, legalConfig };
}

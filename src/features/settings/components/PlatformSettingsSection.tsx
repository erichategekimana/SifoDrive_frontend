import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Globe,
  GraduationCap,
  Users,
  ShieldCheck,
  Settings2,
  FlaskConical,
  Activity,
  Play,
  RotateCcw,
  Search,
  Download,
  Terminal,
  Upload,
  X,
  AlertCircle,
  Navigation,
  ToggleLeft,
  ToggleRight,
  ChevronUp,
  ChevronDown,
  PhoneCall,
  Shield,
  TrendingUp,
  Briefcase,
  Plus,
  Trash2,
  ListOrdered,
  ClipboardList,
  SlidersHorizontal,
} from 'lucide-react';
import type {
  PlatformFeatureFlag,
  PlatformEnvironmentConfig,
  PlatformSubSection,
  PublicBackgroundConfig,
  PublicNavTabConfig,
  PublicAboutUsConfig,
  PublicContactConfig,
  PublicLegalConfig,
  PublicStatsConfig,
  PublicAgentServicesConfig,
  AgentServiceStep,
  AgentServicesBookingFormConfig,
  AgentServiceOption,
  BookingFormFieldKey,
} from '../types';
import {
  DEFAULT_PUBLIC_BACKGROUND,
  DEFAULT_PUBLIC_BG_URL,
  DEFAULT_PUBLIC_NAV_TABS,
  DEFAULT_PUBLIC_ABOUT_US,
  DEFAULT_PUBLIC_CONTACT,
  DEFAULT_PUBLIC_LEGAL,
  DEFAULT_PUBLIC_STATS,
  DEFAULT_PUBLIC_AGENT_SERVICES,
  DEFAULT_AGENT_SERVICE_STEPS,
  DEFAULT_AGENT_SERVICES_BOOKING_FORM,
  DEFAULT_AGENT_SERVICE_OPTIONS,
  DEFAULT_DISTRICT_OPTIONS,
  DEFAULT_TESTING_CENTER_OPTIONS,
  DEFAULT_WORKING_SITE_OPTIONS,
  DEFAULT_TEACHER_OPTIONS,
  ALL_BOOKING_FIELD_KEYS,
  DEFAULT_SERVICE_FIELDS,
} from '../hooks/useAdminSettingsData';
import { useToast } from '../../../context/ToastContext';
import { useTranslation } from '../../../context/I18nContext';
import { useTheme } from '../../../context/ThemeContext';

interface PlatformSettingsSectionProps {
  platformConfig: PlatformEnvironmentConfig;
  setPlatformConfig: React.Dispatch<React.SetStateAction<PlatformEnvironmentConfig>>;
  featureFlags: PlatformFeatureFlag[];
  setFeatureFlags: React.Dispatch<React.SetStateAction<PlatformFeatureFlag[]>>;
  onResetDefaults: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

export const PlatformSettingsSection: React.FC<PlatformSettingsSectionProps> = ({
  platformConfig,
  setPlatformConfig,
  featureFlags,
  setFeatureFlags,
  onResetDefaults,
  onSave,
  isSaving,
}) => {
  const { showToast } = useToast();
  const { language } = useTranslation();
  const isRw = language === 'rw';
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Active Sub-Section: Public | Student | Tutors | Admins | General
  const [activeSubSection, setActiveSubSection] = useState<PlatformSubSection>('public');

  // Search & Filters for Feature Flags
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Interactive Feature Simulation Modal
  const [simulatingFlag, setSimulatingFlag] = useState<PlatformFeatureFlag | null>(null);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Public Background Image Studio State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');

  // Pop-out Alert Warning for Toggling Background Feature
  const [pendingToggleState, setPendingToggleState] = useState<boolean | null>(null);

  // ── Public Navigation Tabs State & Helpers ──
  const navTabs: PublicNavTabConfig[] = useMemo(() => {
    if (Array.isArray(platformConfig.publicNavTabs) && platformConfig.publicNavTabs.length > 0) {
      const existing = [...platformConfig.publicNavTabs];
      DEFAULT_PUBLIC_NAV_TABS.forEach((def) => {
        if (!existing.some((t) => t.id === def.id)) {
          existing.push(def);
        }
      });
      return existing.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return DEFAULT_PUBLIC_NAV_TABS;
  }, [platformConfig.publicNavTabs]);

  // Special confirmation & 1-minute countdown state for disabling Home tab
  const [isHomeAlertOpen, setIsHomeAlertOpen] = useState<boolean>(false);
  const [homeCountdown, setHomeCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (homeCountdown === null) return;

    if (homeCountdown <= 0) {
      const updated = navTabs.map((t) => (t.id === 'home' ? { ...t, isEnabled: false } : t));
      const nextConfig: PlatformEnvironmentConfig = {
        ...platformConfig,
        publicNavTabs: updated,
      };
      saveAndBroadcastNavTabs(
        nextConfig,
        isRw
          ? "Intangiriro yahagaritswe. Urubuga ruri mu mirimo yo kuvugurura."
          : "Home landing page disabled. Website is under maintenance.",
        'info'
      );
      setHomeCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setHomeCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [homeCountdown, navTabs, platformConfig, isRw, showToast]);

  const saveAndBroadcastNavTabs = (
    nextConfig: PlatformEnvironmentConfig,
    toastMsg?: string,
    toastType: 'success' | 'info' = 'info'
  ) => {
    setPlatformConfig(nextConfig);
    try {
      localStorage.setItem('sifo_admin_settings_platform_config', JSON.stringify(nextConfig));
      window.dispatchEvent(new CustomEvent('sifo_platform_config_updated', { detail: nextConfig }));
      try {
        const ch = new BroadcastChannel('sifo_platform_sync');
        ch.postMessage({ publicNavTabs: nextConfig.publicNavTabs });
        ch.close();
      } catch {}
      fetch('/platform-settings-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextConfig),
      }).catch(console.error);
      if (toastMsg) {
        showToast(toastMsg, toastType);
      }
    } catch (err) {
      console.error('Failed to save nav tabs', err);
    }
  };

  const handleConfirmHomeDisable = () => {
    setIsHomeAlertOpen(false);
    setHomeCountdown(60);
  };

  const handleCancelHomeDisable = () => {
    setHomeCountdown(null);
    showToast(
      isRw ? "Gufunga Intangiriro byahagaritswe" : "Home disable action cancelled",
      'info'
    );
  };

  const handleToggleNavTab = (tabId: string) => {
    const targetTab = navTabs.find((t) => t.id === tabId);
    if (!targetTab) return;

    // Disabling Home tab requires maintenance confirmation & 1-minute countdown
    if (tabId === 'home' && targetTab.isEnabled) {
      if (homeCountdown !== null) return;
      setIsHomeAlertOpen(true);
      return;
    }

    const updated = navTabs.map((tab) => {
      if (tab.id === tabId) {
        return { ...tab, isEnabled: !tab.isEnabled };
      }
      return tab;
    });

    const nextState = !targetTab.isEnabled;
    const msg = isRw
      ? `Ifishi ya "${targetTab.labelKinyarwanda || targetTab.label}" ubu ${nextState ? 'IRAGARAGARA' : 'YAHISHWE'} ku murongo w'ibanze`
      : `"${targetTab.label}" tab is now ${nextState ? 'VISIBLE' : 'HIDDEN'} on public topbar`;

    const nextConfig: PlatformEnvironmentConfig = {
      ...platformConfig,
      publicNavTabs: updated,
    };
    saveAndBroadcastNavTabs(nextConfig, msg, nextState ? 'success' : 'info');
  };

  const handleMoveNavTab = (tabIndex: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && tabIndex === 0) ||
      (direction === 'down' && tabIndex === navTabs.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? tabIndex - 1 : tabIndex + 1;
    const newTabs = [...navTabs];
    const [movedTab] = newTabs.splice(tabIndex, 1);
    newTabs.splice(targetIndex, 0, movedTab);

    const reordered = newTabs.map((tab, idx) => ({
      ...tab,
      order: idx + 1,
    }));

    const nextConfig: PlatformEnvironmentConfig = {
      ...platformConfig,
      publicNavTabs: reordered,
    };
    const msg = isRw
      ? `Guhindura umwanya: "${movedTab.labelKinyarwanda || movedTab.label}"`
      : `Moved "${movedTab.label}" tab ${direction}`;
    saveAndBroadcastNavTabs(nextConfig, msg, 'info');
  };

  const handleResetNavTabs = () => {
    const nextConfig: PlatformEnvironmentConfig = {
      ...platformConfig,
      publicNavTabs: DEFAULT_PUBLIC_NAV_TABS,
    };
    const msg = isRw
      ? 'Amafishi yo hejuru yasubijwe ku miterere yayo y\'ibanze'
      : 'Public navigation tabs reset to default configuration';
    saveAndBroadcastNavTabs(nextConfig, msg, 'info');
  };

  // ── About Us & Who We Are Content Manager ──
  const [aboutUsLangTab, setAboutUsLangTab] = useState<'en' | 'rw'>('en');

  const currentAboutUs: PublicAboutUsConfig = useMemo(() => {
    return {
      ...DEFAULT_PUBLIC_ABOUT_US,
      ...(platformConfig.publicAboutUs || {}),
    };
  }, [platformConfig.publicAboutUs]);

  const handleAboutUsFieldChange = (field: keyof PublicAboutUsConfig, value: string) => {
    const updatedAboutUs: PublicAboutUsConfig = {
      ...currentAboutUs,
      [field]: value,
    };
    const nextConfig: PlatformEnvironmentConfig = {
      ...platformConfig,
      publicAboutUs: updatedAboutUs,
    };
    setPlatformConfig(nextConfig);
    try {
      localStorage.setItem('sifo_admin_settings_platform_config', JSON.stringify(nextConfig));
      window.dispatchEvent(new CustomEvent('sifo_platform_config_updated', { detail: nextConfig }));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('sifo_platform_sync');
        ch.postMessage({ publicAboutUs: updatedAboutUs });
        ch.close();
      }
      fetch('/platform-settings-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextConfig),
      }).catch(() => {});
    } catch {}
  };

  const handleResetAboutUs = () => {
    const nextConfig: PlatformEnvironmentConfig = {
      ...platformConfig,
      publicAboutUs: DEFAULT_PUBLIC_ABOUT_US,
    };
    setPlatformConfig(nextConfig);
    try {
      localStorage.setItem('sifo_admin_settings_platform_config', JSON.stringify(nextConfig));
      window.dispatchEvent(new CustomEvent('sifo_platform_config_updated', { detail: nextConfig }));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('sifo_platform_sync');
        ch.postMessage({ publicAboutUs: DEFAULT_PUBLIC_ABOUT_US });
        ch.close();
      }
      fetch('/platform-settings-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextConfig),
      }).catch(() => {});
    } catch {}
    showToast(isRw ? 'Inyandiko zasubijwe ku miterere yazo y\'ibanze' : 'About Us copy reset to defaults', 'info');
  };

  // ── Contact & Support Details ──
  const currentContact: PublicContactConfig = useMemo(() => {
    return {
      ...DEFAULT_PUBLIC_CONTACT,
      ...(platformConfig.publicContact || {}),
    };
  }, [platformConfig.publicContact]);

  const handleContactFieldChange = (field: keyof PublicContactConfig, value: string) => {
    const updatedContact: PublicContactConfig = {
      ...currentContact,
      [field]: value,
    };
    const nextConfig: PlatformEnvironmentConfig = {
      ...platformConfig,
      publicContact: updatedContact,
    };
    setPlatformConfig(nextConfig);
    try {
      localStorage.setItem('sifo_admin_settings_platform_config', JSON.stringify(nextConfig));
      window.dispatchEvent(new CustomEvent('sifo_platform_config_updated', { detail: nextConfig }));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('sifo_platform_sync');
        ch.postMessage({ publicContact: updatedContact });
        ch.close();
      }
      fetch('/platform-settings-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextConfig),
      }).catch(() => {});
    } catch {}
  };

  const handleResetContact = () => {
    const nextConfig: PlatformEnvironmentConfig = {
      ...platformConfig,
      publicContact: DEFAULT_PUBLIC_CONTACT,
    };
    setPlatformConfig(nextConfig);
    try {
      localStorage.setItem('sifo_admin_settings_platform_config', JSON.stringify(nextConfig));
      window.dispatchEvent(new CustomEvent('sifo_platform_config_updated', { detail: nextConfig }));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('sifo_platform_sync');
        ch.postMessage({ publicContact: DEFAULT_PUBLIC_CONTACT });
        ch.close();
      }
      fetch('/platform-settings-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextConfig),
      }).catch(() => {});
    } catch {}
    showToast(isRw ? 'Amakuru yo kutwandikira yasubijwe ku miterere y\'ibanze' : 'Contact details reset to defaults', 'info');
  };

  // ── Homepage Statistics / Numbers ──
  const currentStats: PublicStatsConfig = useMemo(() => {
    return {
      ...DEFAULT_PUBLIC_STATS,
      ...(platformConfig.publicStats || {}),
    };
  }, [platformConfig.publicStats]);

  const handleStatsFieldChange = (field: keyof PublicStatsConfig, value: string) => {
    const updatedStats: PublicStatsConfig = {
      ...currentStats,
      [field]: value,
    };
    const nextConfig: PlatformEnvironmentConfig = {
      ...platformConfig,
      publicStats: updatedStats,
    };
    setPlatformConfig(nextConfig);
    try {
      localStorage.setItem('sifo_admin_settings_platform_config', JSON.stringify(nextConfig));
      window.dispatchEvent(new CustomEvent('sifo_platform_config_updated', { detail: nextConfig }));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('sifo_platform_sync');
        ch.postMessage({ publicStats: updatedStats });
        ch.close();
      }
      fetch('/platform-settings-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextConfig),
      }).catch(() => {});
    } catch {}
  };

  const handleResetStats = () => {
    const nextConfig: PlatformEnvironmentConfig = {
      ...platformConfig,
      publicStats: DEFAULT_PUBLIC_STATS,
    };
    setPlatformConfig(nextConfig);
    try {
      localStorage.setItem('sifo_admin_settings_platform_config', JSON.stringify(nextConfig));
      window.dispatchEvent(new CustomEvent('sifo_platform_config_updated', { detail: nextConfig }));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('sifo_platform_sync');
        ch.postMessage({ publicStats: DEFAULT_PUBLIC_STATS });
        ch.close();
      }
      fetch('/platform-settings-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextConfig),
      }).catch(() => {});
    } catch {}
    showToast(isRw ? 'Imibare y\'ahabanza yasubijwe ku miterere y\'ibanze' : 'Homepage numbers reset to defaults', 'info');
  };

  // ── Legal & Regulatory Manager ──
  const [legalLangTab, setLegalLangTab] = useState<'en' | 'rw'>('en');

  const currentLegal: PublicLegalConfig = useMemo(() => {
    return {
      ...DEFAULT_PUBLIC_LEGAL,
      ...(platformConfig.publicLegal || {}),
    };
  }, [platformConfig.publicLegal]);

  const handleLegalFieldChange = (field: keyof PublicLegalConfig, value: string) => {
    const updatedLegal: PublicLegalConfig = {
      ...currentLegal,
      [field]: value,
    };
    const nextConfig: PlatformEnvironmentConfig = {
      ...platformConfig,
      publicLegal: updatedLegal,
    };
    setPlatformConfig(nextConfig);
    try {
      localStorage.setItem('sifo_admin_settings_platform_config', JSON.stringify(nextConfig));
      window.dispatchEvent(new CustomEvent('sifo_platform_config_updated', { detail: nextConfig }));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('sifo_platform_sync');
        ch.postMessage({ publicLegal: updatedLegal });
        ch.close();
      }
      fetch('/platform-settings-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextConfig),
      }).catch(() => {});
    } catch {}
  };

  const handleResetLegal = () => {
    const nextConfig: PlatformEnvironmentConfig = {
      ...platformConfig,
      publicLegal: DEFAULT_PUBLIC_LEGAL,
    };
    setPlatformConfig(nextConfig);
    try {
      localStorage.setItem('sifo_admin_settings_platform_config', JSON.stringify(nextConfig));
      window.dispatchEvent(new CustomEvent('sifo_platform_config_updated', { detail: nextConfig }));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('sifo_platform_sync');
        ch.postMessage({ publicLegal: DEFAULT_PUBLIC_LEGAL });
        ch.close();
      }
      fetch('/platform-settings-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextConfig),
      }).catch(() => {});
    } catch {}
    showToast(isRw ? 'Amategeko n\'amabwiriza byasubijwe ku miterere y\'ibanze' : 'Legal & regulatory titles reset to defaults', 'info');
  };

  // ── Agent Services Tab Manager ──
  const currentAgentServices: PublicAgentServicesConfig = useMemo(() => {
    return {
      ...DEFAULT_PUBLIC_AGENT_SERVICES,
      ...(platformConfig.publicAgentServices || {}),
    };
  }, [platformConfig.publicAgentServices]);

  const handleAgentServicesFieldChange = <K extends keyof PublicAgentServicesConfig>(
    field: K,
    value: PublicAgentServicesConfig[K]
  ) => {
    const updatedAgentServices: PublicAgentServicesConfig = {
      ...currentAgentServices,
      [field]: value,
    };
    const nextConfig: PlatformEnvironmentConfig = {
      ...platformConfig,
      publicAgentServices: updatedAgentServices,
    };
    setPlatformConfig(nextConfig);
    try {
      localStorage.setItem('sifo_admin_settings_platform_config', JSON.stringify(nextConfig));
      window.dispatchEvent(new CustomEvent('sifo_platform_config_updated', { detail: nextConfig }));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('sifo_platform_sync');
        ch.postMessage({ publicAgentServices: updatedAgentServices });
        ch.close();
      }
      fetch('/platform-settings-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextConfig),
      }).catch(() => {});
    } catch {}
  };

  const handleResetAgentServices = () => {
    const nextConfig: PlatformEnvironmentConfig = {
      ...platformConfig,
      publicAgentServices: DEFAULT_PUBLIC_AGENT_SERVICES,
    };
    setPlatformConfig(nextConfig);
    try {
      localStorage.setItem('sifo_admin_settings_platform_config', JSON.stringify(nextConfig));
      window.dispatchEvent(new CustomEvent('sifo_platform_config_updated', { detail: nextConfig }));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('sifo_platform_sync');
        ch.postMessage({ publicAgentServices: DEFAULT_PUBLIC_AGENT_SERVICES });
        ch.close();
      }
      fetch('/platform-settings-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextConfig),
      }).catch(() => {});
    } catch {}
    showToast(isRw ? 'Igenamiterere rya Agent Services ryasubijwe ku miterere y\'ibanze' : 'Agent Services settings reset to defaults', 'info');
  };

  // ── Agent Services Steps State & Handlers ──
  const [stepsLangTab, setStepsLangTab] = useState<'en' | 'rw'>('en');

  const currentSteps: AgentServiceStep[] = useMemo(() => {
    if (Array.isArray(currentAgentServices.steps) && currentAgentServices.steps.length > 0) {
      return currentAgentServices.steps;
    }
    return DEFAULT_AGENT_SERVICE_STEPS;
  }, [currentAgentServices.steps]);

  const handleUpdateStep = (id: string, patch: Partial<AgentServiceStep>) => {
    const updated = currentSteps.map((s) => (s.id === id ? { ...s, ...patch } : s));
    handleAgentServicesFieldChange('steps', updated);
  };

  const handleAddStep = () => {
    const nextNumber = currentSteps.length + 1;
    const newStep: AgentServiceStep = {
      id: `step-${Date.now()}`,
      stepNumber: nextNumber,
      title: `Step ${nextNumber}`,
      titleRw: `Intambwe ya ${nextNumber}`,
      description: '',
      descriptionRw: '',
    };
    const updated = [...currentSteps, newStep];
    handleAgentServicesFieldChange('steps', updated);
    showToast(isRw ? 'Intambwe nshya yongeyeho' : 'New step added', 'success');
  };

  const handleRemoveStep = (id: string) => {
    if (currentSteps.length <= 1) {
      showToast(isRw ? 'Ntushobora gusiba intambwe yonyine isigaye' : 'Cannot delete the only remaining step', 'warning');
      return;
    }
    const filtered = currentSteps.filter((s) => s.id !== id);
    const resequenced = filtered.map((s, idx) => ({
      ...s,
      stepNumber: idx + 1,
    }));
    handleAgentServicesFieldChange('steps', resequenced);
    showToast(isRw ? 'Intambwe yasibwe' : 'Step removed', 'info');
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === currentSteps.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...currentSteps];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const resequenced = reordered.map((s, idx) => ({
      ...s,
      stepNumber: idx + 1,
    }));
    handleAgentServicesFieldChange('steps', resequenced);
  };

  const handleResetSteps = () => {
    handleAgentServicesFieldChange('steps', DEFAULT_AGENT_SERVICE_STEPS);
    handleAgentServicesFieldChange('howItWorksTitle', 'How It Works & Booking Steps');
    handleAgentServicesFieldChange('howItWorksTitleRw', 'Uko Bikora & Ibyiza');
    showToast(isRw ? 'Intambwe zasubijwe ku miterere y\'ibanze' : 'Steps reset to defaults', 'info');
  };

  // ── Agent Services Booking Form State & Handlers ──
  const [bookingFormLangTab, setBookingFormLangTab] = useState<'en' | 'rw'>('en');
  const [isManageFieldsModalOpen, setIsManageFieldsModalOpen] = useState(false);
  const [activeManageServiceKey, setActiveManageServiceKey] = useState<string>('irembo_provisional');

  const BOOKING_FIELD_DEFINITIONS: Record<BookingFormFieldKey, { labelEn: string; labelRw: string }> = {
    fullName: { labelEn: 'Full Legal Name', labelRw: 'Amazina Yombi' },
    phoneNumber: { labelEn: 'Phone Number', labelRw: 'Nimero ya Telefone' },
    nationalId: { labelEn: 'National ID Number', labelRw: 'Numero y\'Indangamuntu' },
    dateOfBirth: { labelEn: 'Date of Birth', labelRw: 'Itariki y\'Amavuko' },
    licenseCategory: { labelEn: 'License Category', labelRw: 'Icyiciro cy\'Uruhushya' },
    provisionalLicenseNumber: { labelEn: 'Provisional License Number', labelRw: 'Numero y\'Uruhushya rw\'Agateganyo' },
    preferredDistrict: { labelEn: 'Preferred District', labelRw: 'Akarere Wifuza' },
    testingCenter: { labelEn: 'Testing Center', labelRw: 'Ikigo cy\'Ikizamini' },
    workingSite: { labelEn: 'Working Site', labelRw: 'Site yo Gukoreraho' },
    teacher: { labelEn: 'Driving Teacher / Instructor', labelRw: 'Umwarimu Wakwigishije' },
    preferredDate: { labelEn: 'Preferred Date', labelRw: 'Itariki Yitezwe y\'Ikizamini' },
    notes: { labelEn: 'Additional Requests / Notes', labelRw: 'Ibisobanuro Byiyongereyeho' },
  };

  const currentBookingForm: AgentServicesBookingFormConfig = useMemo(() => {
    return {
      ...DEFAULT_AGENT_SERVICES_BOOKING_FORM,
      ...(currentAgentServices.bookingForm || {}),
    };
  }, [currentAgentServices.bookingForm]);

  const handleUpdateBookingForm = (patch: Partial<AgentServicesBookingFormConfig>) => {
    const updatedForm: AgentServicesBookingFormConfig = {
      ...currentBookingForm,
      ...patch,
    };
    handleAgentServicesFieldChange('bookingForm', updatedForm);
  };

  const handleResetBookingForm = () => {
    handleAgentServicesFieldChange('bookingForm', DEFAULT_AGENT_SERVICES_BOOKING_FORM);
    showToast(isRw ? 'Fomu yo kwiyandikisha yasubijwe ku miterere y\'ibanze' : 'Booking form reset to default configuration', 'info');
  };

  type BookingOptionCategory = 'services' | 'districts' | 'centers' | 'sites' | 'teachers';
  const [bookingOptionCategory, setBookingOptionCategory] = useState<BookingOptionCategory>('services');

  const currentServiceOptions: AgentServiceOption[] = useMemo(() => {
    if (Array.isArray(currentBookingForm.serviceOptions) && currentBookingForm.serviceOptions.length > 0) {
      return currentBookingForm.serviceOptions;
    }
    return DEFAULT_AGENT_SERVICE_OPTIONS;
  }, [currentBookingForm.serviceOptions]);

  const selectedManageService = useMemo(() => {
    return (
      currentServiceOptions.find(
        (s) => (s.key || s.id) === activeManageServiceKey
      ) || currentServiceOptions[0]
    );
  }, [currentServiceOptions, activeManageServiceKey]);

  const selectedManageServiceKey = selectedManageService
    ? (selectedManageService.key || selectedManageService.id)
    : 'irembo_provisional';

  // Active fields for the selected service in order
  const activeServiceFields: BookingFormFieldKey[] = useMemo(() => {
    if (selectedManageService?.fields && Array.isArray(selectedManageService.fields)) {
      return selectedManageService.fields;
    }
    if (currentBookingForm.serviceFieldsMap?.[selectedManageServiceKey]) {
      return currentBookingForm.serviceFieldsMap[selectedManageServiceKey];
    }
    return DEFAULT_SERVICE_FIELDS[selectedManageServiceKey] || ALL_BOOKING_FIELD_KEYS;
  }, [selectedManageService, currentBookingForm.serviceFieldsMap, selectedManageServiceKey]);

  // Inactive fields for the selected service
  const inactiveServiceFields: BookingFormFieldKey[] = useMemo(() => {
    const activeSet = new Set(activeServiceFields);
    return ALL_BOOKING_FIELD_KEYS.filter((k) => !activeSet.has(k));
  }, [activeServiceFields]);

  const saveServiceFields = (serviceKey: string, newFields: BookingFormFieldKey[]) => {
    const updatedServices = currentServiceOptions.map((s) => {
      if ((s.key || s.id) === serviceKey) {
        return { ...s, fields: newFields };
      }
      return s;
    });
    const updatedMap = {
      ...(currentBookingForm.serviceFieldsMap || {}),
      [serviceKey]: newFields,
    };
    handleUpdateBookingForm({
      serviceOptions: updatedServices,
      serviceFieldsMap: updatedMap,
    });
  };

  const handleMoveServiceField = (serviceKey: string, index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeServiceFields.length) return;
    const newFields = [...activeServiceFields];
    const [moved] = newFields.splice(index, 1);
    newFields.splice(targetIndex, 0, moved);
    saveServiceFields(serviceKey, newFields);
  };

  const handleToggleServiceField = (serviceKey: string, fieldKey: BookingFormFieldKey) => {
    const isCurrentlyActive = activeServiceFields.includes(fieldKey);
    let newFields: BookingFormFieldKey[];
    if (isCurrentlyActive) {
      newFields = activeServiceFields.filter((f) => f !== fieldKey);
    } else {
      newFields = [...activeServiceFields, fieldKey];
    }
    saveServiceFields(serviceKey, newFields);
  };

  const handleSetAllServiceFields = (serviceKey: string, enableAll: boolean) => {
    const newFields: BookingFormFieldKey[] = enableAll ? [...ALL_BOOKING_FIELD_KEYS] : [];
    saveServiceFields(serviceKey, newFields);
    showToast(
      enableAll
        ? (isRw ? 'Imyanya yose yemejwe kuri iyi serivisi' : 'All fields enabled for this service')
        : (isRw ? 'Imyanya yose yarahagaritswe kuri iyi serivisi' : 'All fields disabled for this service'),
      'info'
    );
  };

  const handleResetServiceFields = (serviceKey: string) => {
    const defaultFields = DEFAULT_SERVICE_FIELDS[serviceKey] || ALL_BOOKING_FIELD_KEYS;
    saveServiceFields(serviceKey, defaultFields);
    showToast(isRw ? 'Imyanya yasubijwe ku miterere y\'ibanze' : 'Service fields reset to default order', 'info');
  };

  const currentDistrictOptions: AgentServiceOption[] = useMemo(() => {
    if (Array.isArray(currentBookingForm.districtOptions) && currentBookingForm.districtOptions.length > 0) {
      return currentBookingForm.districtOptions;
    }
    return DEFAULT_DISTRICT_OPTIONS;
  }, [currentBookingForm.districtOptions]);

  const currentTestingCenterOptions: AgentServiceOption[] = useMemo(() => {
    if (Array.isArray(currentBookingForm.testingCenterOptions) && currentBookingForm.testingCenterOptions.length > 0) {
      return currentBookingForm.testingCenterOptions;
    }
    return DEFAULT_TESTING_CENTER_OPTIONS;
  }, [currentBookingForm.testingCenterOptions]);

  const currentWorkingSiteOptions: AgentServiceOption[] = useMemo(() => {
    if (Array.isArray(currentBookingForm.workingSiteOptions) && currentBookingForm.workingSiteOptions.length > 0) {
      return currentBookingForm.workingSiteOptions;
    }
    return DEFAULT_WORKING_SITE_OPTIONS;
  }, [currentBookingForm.workingSiteOptions]);

  const currentTeacherOptions: AgentServiceOption[] = useMemo(() => {
    if (Array.isArray(currentBookingForm.teacherOptions) && currentBookingForm.teacherOptions.length > 0) {
      return currentBookingForm.teacherOptions;
    }
    return DEFAULT_TEACHER_OPTIONS;
  }, [currentBookingForm.teacherOptions]);

  const getOptionCategoryConfig = (cat: BookingOptionCategory) => {
    switch (cat) {
      case 'districts':
        return {
          title: isRw ? 'Akarere Wifuza (Preferred District)' : 'Preferred District Dropdown',
          field: 'districtOptions' as const,
          options: currentDistrictOptions,
          addLabel: isRw ? 'Ongeraho Akarere' : 'Add District',
          placeholder: isRw ? 'Urugero: Gasabo' : 'e.g. Gasabo',
          placeholderEn: 'e.g. Gasabo',
          placeholderRw: 'e.g. Gasabo',
          defaultKey: 'district',
          isTranslatable: false,
        };
      case 'centers':
        return {
          title: isRw ? 'Ikigo cy\'Ikizamini (Testing Center)' : 'Testing Center Dropdown',
          field: 'testingCenterOptions' as const,
          options: currentTestingCenterOptions,
          addLabel: isRw ? 'Ongeraho Ikigo' : 'Add Testing Center',
          placeholder: isRw ? 'Urugero: Remera - Amahoro Police Test Center' : 'e.g. Remera - Amahoro Police Test Center',
          placeholderEn: 'e.g. Remera - Amahoro Police Test Center',
          placeholderRw: 'e.g. Remera - Amahoro Police Test Center',
          defaultKey: 'center',
          isTranslatable: false,
        };
      case 'sites':
        return {
          title: isRw ? 'Site yo Gukoreraho (Working Site)' : 'Working Site Dropdown',
          field: 'workingSiteOptions' as const,
          options: currentWorkingSiteOptions,
          addLabel: isRw ? 'Ongeraho Site' : 'Add Working Site',
          placeholder: isRw ? 'Urugero: BUSANZA AUTOMATED CENTER' : 'e.g. BUSANZA AUTOMATED CENTER',
          placeholderEn: 'e.g. BUSANZA AUTOMATED CENTER',
          placeholderRw: 'e.g. BUSANZA AUTOMATED CENTER',
          defaultKey: 'site',
          isTranslatable: false,
        };
      case 'teachers':
        return {
          title: isRw ? 'Umwarimu (Partner Driving Teacher)' : 'Teacher / Instructor Dropdown',
          field: 'teacherOptions' as const,
          options: currentTeacherOptions,
          addLabel: isRw ? 'Ongeraho Umwarimu' : 'Add Teacher',
          placeholder: isRw ? 'Urugero: Jean Damascene Habimana' : 'e.g. Jean Damascene Habimana',
          placeholderEn: 'e.g. Jean Damascene Habimana',
          placeholderRw: 'e.g. Jean Damascene Habimana',
          defaultKey: 'teacher',
          isTranslatable: false,
        };
      default:
        return {
          title: isRw ? 'Serivisi Zemewe Muri Fomu' : 'Active Service Dropdown',
          field: 'serviceOptions' as const,
          options: currentServiceOptions,
          addLabel: isRw ? 'Ongeraho Serivisi' : 'Add Option',
          placeholder: 'e.g. Provisional Exam Booking',
          placeholderEn: 'e.g. Provisional Exam Booking',
          placeholderRw: 'Urugero: Kwandikisha Ikizamini cy\'Agateganyo',
          defaultKey: 'service',
          isTranslatable: true,
        };
    }
  };

  const handleUpdateDropdownOption = (field: keyof AgentServicesBookingFormConfig, id: string, patch: Partial<AgentServiceOption>) => {
    const list = ((currentBookingForm[field] as AgentServiceOption[]) || getOptionCategoryConfig(bookingOptionCategory).options);
    const updated = list.map((opt) => (opt.id === id ? { ...opt, ...patch } : opt));
    handleUpdateBookingForm({ [field]: updated });
  };

  const handleAddDropdownOption = (field: keyof AgentServicesBookingFormConfig, defaultKey: string, isTranslatable: boolean = true) => {
    const list = ((currentBookingForm[field] as AgentServiceOption[]) || getOptionCategoryConfig(bookingOptionCategory).options);
    const nextNum = list.length + 1;
    const defaultName = isTranslatable ? `Option ${nextNum}` : `New ${defaultKey.charAt(0).toUpperCase() + defaultKey.slice(1)} ${nextNum}`;
    const newOption: AgentServiceOption = {
      id: `opt-${Date.now()}`,
      key: `${defaultKey}_${Date.now()}`,
      label: defaultName,
      labelRw: defaultName,
      enabled: true,
    };
    handleUpdateBookingForm({ [field]: [...list, newOption] });
    showToast(isRw ? 'Ihitamo rishya ryongereweho' : 'New option added', 'success');
  };

  const handleRemoveDropdownOption = (field: keyof AgentServicesBookingFormConfig, id: string) => {
    const list = ((currentBookingForm[field] as AgentServiceOption[]) || getOptionCategoryConfig(bookingOptionCategory).options);
    if (list.length <= 1) {
      showToast(isRw ? 'Ntushobora gusiba ihitamo ryonyine risigaye' : 'Cannot delete the only remaining option', 'warning');
      return;
    }
    const filtered = list.filter((opt) => opt.id !== id);
    handleUpdateBookingForm({ [field]: filtered });
    showToast(isRw ? 'Ihitamo ryasibwe' : 'Option removed', 'info');
  };

  const handleMoveDropdownOption = (field: keyof AgentServicesBookingFormConfig, index: number, direction: 'up' | 'down') => {
    const list = ((currentBookingForm[field] as AgentServiceOption[]) || getOptionCategoryConfig(bookingOptionCategory).options);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === list.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...list];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    handleUpdateBookingForm({ [field]: reordered });
  };

  const publicBg = platformConfig.publicBackground || DEFAULT_PUBLIC_BACKGROUND;

  const updatePublicBg = (patch: Partial<PublicBackgroundConfig>) => {
    setPlatformConfig((prev) => ({
      ...prev,
      publicBackground: {
        ...(prev.publicBackground || DEFAULT_PUBLIC_BACKGROUND),
        ...patch,
      },
    }));
  };

  const handleConfirmToggle = () => {
    if (pendingToggleState !== null) {
      updatePublicBg({ enabled: pendingToggleState });
      showToast(
        isRw
          ? `Ifoto y'inyuma ${pendingToggleState ? 'IRAFUNGUWE' : 'IRAFUNZWE'}`
          : `Background image ${pendingToggleState ? 'ENABLED' : 'DISABLED'}`,
        'info'
      );
      setPendingToggleState(null);
    }
  };

  const handleCancelToggle = () => {
    setPendingToggleState(null);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';
    setUploadError(null);

    // 1. Validate File Format
    const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      setUploadError('Only PNG, JPG, or WebP images are supported.');
      showToast('Invalid format. Use PNG, JPG, or WebP.', 'error');
      return;
    }

    // 2. Validate File Size (Max 5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError('Image size exceeds 5MB limit.');
      showToast('Image size must be 5MB or less.', 'error');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onerror = () => {
      setIsUploading(false);
      setUploadError('Failed to read image file.');
      showToast('Error reading image file.', 'error');
    };

    reader.onload = () => {
      const img = new Image();
      img.onerror = () => {
        setIsUploading(false);
        setUploadError('Corrupted image file.');
        showToast('Corrupted image file.', 'error');
      };

      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        // 3. Validate Dimensions (Min 1280x720)
        if (width < 1280 || height < 720) {
          setIsUploading(false);
          setUploadError(`Resolution must be at least 1280 × 720 px (selected: ${width} × ${height} px).`);
          showToast('Image resolution is too low. Min 1280 × 720.', 'error');
          return;
        }

        // 4. Validate Landscape Orientation
        if (width < height) {
          setIsUploading(false);
          setUploadError('Image must be in landscape format (width greater than height).');
          showToast('Image must be in landscape format.', 'error');
          return;
        }

        // 5. Optimize via Canvas to max width 1280 to keep performance snappy and well within storage limits
        try {
          const maxTargetW = 1280;
          const scale = width > maxTargetW ? maxTargetW / width : 1;
          const targetW = Math.round(width * scale);
          const targetH = Math.round(height * scale);

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, targetW, targetH);
            const optimized = canvas.toDataURL('image/jpeg', 0.65);

            updatePublicBg({
              enabled: true,
              imageDataUrl: optimized,
              imageFileName: file.name,
              imageDimensions: { width, height },
            });
            setUploadError(null);
            showToast('Background image uploaded successfully.', 'success');
          }
        } catch {
          setUploadError('Failed to process image.');
          showToast('Failed to optimize image.', 'error');
        } finally {
          setIsUploading(false);
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    updatePublicBg({
      imageDataUrl: DEFAULT_PUBLIC_BG_URL,
      imageFileName: 'Highway Landscape (Default)',
      imageDimensions: undefined,
    });
    showToast('Reverted to default background image.', 'info');
  };

  // Toggle single flag
  const toggleFlag = (id: string) => {
    setFeatureFlags((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const nextState = !f.isEnabled;
          showToast(
            `${f.name} is now ${nextState ? 'ENABLED' : 'DISABLED'}`,
            nextState ? 'success' : 'info'
          );
          return {
            ...f,
            isEnabled: nextState,
            lastToggledAt: new Date().toISOString(),
            toggledBy: 'System Administrator',
          };
        }
        return f;
      })
    );
  };

  // Change audience rollout
  const updateAudience = (id: string, targetAudience: PlatformFeatureFlag['targetAudience']) => {
    setFeatureFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, targetAudience } : f))
    );
    showToast(`Rollout audience updated to ${targetAudience}`, 'info');
  };

  // Filter flags based on active sub-section, search, and category
  const filteredFlags = useMemo(() => {
    return featureFlags.filter((f) => {
      // In specific sub-sections, default filter by scope unless in General
      const matchesScope =
        activeSubSection === 'general' ? true : f.scope === activeSubSection;

      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.nameKinyarwanda && f.nameKinyarwanda.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' ||
        (selectedCategory === 'beta' && (f.status === 'BETA' || f.status === 'ALPHA' || f.status === 'EXPERIMENTAL')) ||
        f.category === selectedCategory;

      return matchesScope && matchesSearch && matchesCat;
    });
  }, [featureFlags, activeSubSection, searchQuery, selectedCategory]);

  // Run Interactive Feature Simulation
  const handleStartSimulation = (flag: PlatformFeatureFlag) => {
    setSimulatingFlag(flag);
    setSimulationLogs([
      `[INIT] Initializing sandboxed test harness for: ${flag.id}`,
      `[SCOPE] Target domain: ${flag.scope?.toUpperCase() || 'GENERAL'}`,
      `[VERSION] Runtime release payload: ${flag.version} (${flag.status})`,
      `[TARGET] Audience policy: ${flag.targetAudience} | Risk: ${flag.riskLevel}`,
    ]);
    setIsSimulating(true);

    setTimeout(() => {
      setSimulationLogs((prev) => [
        ...prev,
        `[HEALTH] Service dependency check: OK (Latency: 12ms)`,
        `[SECURITY] Policy verification & signature: VALID`,
        `[RUNNING] Executing feature lifecycle test hook...`,
      ]);
    }, 700);

    setTimeout(() => {
      setSimulationLogs((prev) => [
        ...prev,
        `[SUCCESS] Simulation completed successfully! 0 errors detected.`,
        `[RESULT] Feature "${flag.name}" is verified and safe for candidate traffic.`,
      ]);
      setIsSimulating(false);
    }, 1600);
  };

  const handleExportJson = () => {
    const payload = {
      exportTimestamp: new Date().toISOString(),
      platformConfig,
      featureFlags,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `sifo_platform_settings_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchor.click();
    showToast('Platform configuration exported as JSON', 'success');
  };

  const getStatusBadgeColor = (status: PlatformFeatureFlag['status']) => {
    switch (status) {
      case 'STABLE':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'BETA':
        return { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' };
      case 'ALPHA':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      case 'EXPERIMENTAL':
        return { bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.3)' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  const getRiskBadgeColor = (risk: PlatformFeatureFlag['riskLevel']) => {
    switch (risk) {
      case 'HIGH':
        return { bg: 'rgba(239, 68, 68, 0.12)', text: '#f87171' };
      case 'MEDIUM':
        return { bg: 'rgba(245, 158, 11, 0.12)', text: '#fcd34d' };
      case 'LOW':
      default:
        return { bg: 'rgba(148, 163, 184, 0.12)', text: '#cbd5e1' };
    }
  };

  const subSections: {
    key: PlatformSubSection;
    label: string;
    labelRw: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'public',
      label: 'Public',
      labelRw: 'Abashyitsi (Public)',
      icon: <Globe size={16} />,
    },
    {
      key: 'student',
      label: 'Student',
      labelRw: 'Abanyeshuri (Student)',
      icon: <GraduationCap size={16} />,
    },
    {
      key: 'tutors',
      label: 'Tutors',
      labelRw: 'Abarimu (Tutors)',
      icon: <Users size={16} />,
    },
    {
      key: 'admins',
      label: 'Admins',
      labelRw: 'Abayobozi (Admins)',
      icon: <ShieldCheck size={16} />,
    },
    {
      key: 'general',
      label: 'General',
      labelRw: 'Rusange (General)',
      icon: <Settings2 size={16} />,
    },
  ];

  const currentSection = subSections.find((s) => s.key === activeSubSection)!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* ── SUB-SECTIONS NAVIGATION BAR ── */}
      <div
        className="glass-panel"
        style={{
          padding: '8px 12px',
          borderRadius: '14px',
          border: '1px solid var(--border-subtle)',
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {subSections.map((sec) => {
            const isActive = activeSubSection === sec.key;
            const flagCount =
              sec.key === 'general'
                ? featureFlags.length
                : featureFlags.filter((f) => f.scope === sec.key).length;

            return (
              <button
                key={sec.key}
                type="button"
                onClick={() => {
                  setActiveSubSection(sec.key);
                  setSelectedCategory('all');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: isActive ? '1px solid #0284c7' : '1px solid transparent',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(2, 132, 199, 0.1) 100%)'
                    : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? '#38bdf8' : '#cbd5e1',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 8px rgba(2, 132, 199, 0.2)' : 'none',
                }}
              >
                {sec.icon}
                <span>{isRw ? sec.labelRw : sec.label}</span>
                {flagCount > 0 && (
                  <span
                    style={{
                      padding: '1px 6px',
                      borderRadius: '999px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: isActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                      color: isActive ? '#38bdf8' : '#94a3b8',
                    }}
                  >
                    {flagCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                backgroundColor: '#0284c7',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
              }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
          <button
            type="button"
            onClick={handleExportJson}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: '#cbd5e1',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Download size={14} />
            Export Config
          </button>
          <button
            type="button"
            onClick={onResetDefaults}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: '#cbd5e1',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RotateCcw size={14} />
            Factory Reset
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-SECTION 1: PUBLIC ── */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeSubSection === 'public' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* ── BACKGROUND IMAGE ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header with Title and Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                  {isRw ? 'Ifoto y’Inyuma' : 'Background Image'}
                </h3>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px' }}>
                  {isRw
                    ? 'Ifoto igaragara inyuma ku mpande za ecran (100vh).'
                    : 'Displays behind public pages covering screen height (100vh).'}
                </div>
              </div>

              {/* On / Off Switch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: publicBg.enabled ? '#34d399' : '#64748b' }}>
                  {publicBg.enabled ? 'ENABLED' : 'OFF'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPendingToggleState(!publicBg.enabled);
                  }}
                  aria-label="Toggle background image"
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: publicBg.enabled ? '#0284c7' : '#334155',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      position: 'absolute',
                      top: '3px',
                      left: publicBg.enabled ? '23px' : '3px',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageFileChange}
              style={{ display: 'none' }}
            />

            {/* 2-Column Layout: Left (Vertical Settings: Image, Light, Dark) | Right (Live Preview) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
                alignItems: 'stretch',
              }}
            >
              {/* LEFT COLUMN: Vertically Stacked Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 1. Upload Area / Selected Image */}
                {!publicBg.imageDataUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '1px dashed rgba(56, 189, 248, 0.4)',
                      borderRadius: '10px',
                      padding: '20px',
                      textAlign: 'center',
                      backgroundColor: 'rgba(2, 132, 199, 0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Upload size={22} color="#38bdf8" style={{ margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                      {isUploading ? 'Validating...' : (isRw ? 'Kanda hano uhitemo ifoto muri mudasobwa' : 'Upload Image from Computer')}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                      PNG, JPG, or WebP • Landscape (Min 1280 × 720 px) • Max 5MB
                    </div>
                    {uploadError && (
                      <div style={{ marginTop: '8px', fontSize: '0.76rem', color: '#f87171', fontWeight: 600 }}>
                        ⚠️ {uploadError}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={publicBg.imageDataUrl}
                        alt="Background"
                        style={{
                          width: '68px',
                          height: '42px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff' }}>
                          {publicBg.imageFileName || 'Background Image'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                          {publicBg.imageDimensions
                            ? `${publicBg.imageDimensions.width} × ${publicBg.imageDimensions.height} px • Landscape`
                            : 'Landscape Image'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid var(--border-subtle)',
                          color: '#cbd5e1',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {isRw ? 'Hindura' : 'Change'}
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {isRw ? 'Gukuraho' : 'Remove'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Light Mode Settings (Stacked vertically) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff' }}>
                    {isRw ? 'Uburyo bwa Manywa (Light Mode)' : 'Light Mode'}
                  </div>

                  {/* Light Image Opacity */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px' }}>
                      <span>{isRw ? 'Urumuri rw’Ifoto' : 'Image Opacity'}</span>
                      <span style={{ fontWeight: 600, color: '#cbd5e1' }}>
                        {Math.round((publicBg.lightImageOpacity ?? 0.20) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round((publicBg.lightImageOpacity ?? 0.20) * 100)}
                      onChange={(e) => updatePublicBg({ lightImageOpacity: Number(e.target.value) / 100 })}
                      style={{ width: '100%', cursor: 'pointer', accentColor: '#64748b' }}
                    />
                  </div>

                  {/* Light Gradient Opacity */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px' }}>
                      <span>{isRw ? 'Urumuri rw’Amabara' : 'Gradient Opacity'}</span>
                      <span style={{ fontWeight: 600, color: '#cbd5e1' }}>
                        {Math.round((publicBg.lightGradientOpacity ?? 0.85) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round((publicBg.lightGradientOpacity ?? 0.85) * 100)}
                      onChange={(e) => updatePublicBg({ lightGradientOpacity: Number(e.target.value) / 100 })}
                      style={{ width: '100%', cursor: 'pointer', accentColor: '#64748b' }}
                    />
                  </div>
                </div>

                {/* 3. Dark Mode Settings (Stacked vertically) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff' }}>
                    {isRw ? 'Uburyo bw’Ijoro (Dark Mode)' : 'Dark Mode'}
                  </div>

                  {/* Dark Image Opacity */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px' }}>
                      <span>{isRw ? 'Urumuri rw’Ifoto' : 'Image Opacity'}</span>
                      <span style={{ fontWeight: 600, color: '#cbd5e1' }}>
                        {Math.round((publicBg.darkImageOpacity ?? 0.15) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round((publicBg.darkImageOpacity ?? 0.15) * 100)}
                      onChange={(e) => updatePublicBg({ darkImageOpacity: Number(e.target.value) / 100 })}
                      style={{ width: '100%', cursor: 'pointer', accentColor: '#64748b' }}
                    />
                  </div>

                  {/* Dark Gradient Opacity */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px' }}>
                      <span>{isRw ? 'Urumuri rw’Amabara' : 'Gradient Opacity'}</span>
                      <span style={{ fontWeight: 600, color: '#cbd5e1' }}>
                        {Math.round((publicBg.darkGradientOpacity ?? 0.70) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round((publicBg.darkGradientOpacity ?? 0.70) * 100)}
                      onChange={(e) => updatePublicBg({ darkGradientOpacity: Number(e.target.value) / 100 })}
                      style={{ width: '100%', cursor: 'pointer', accentColor: '#64748b' }}
                    />
                  </div>
                </div>

                {/* Save Changes button directly below settings */}
                {onSave && (
                  <div>
                    <button
                      type="button"
                      onClick={onSave}
                      disabled={isSaving}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        backgroundColor: '#0284c7',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        opacity: isSaving ? 0.7 : 1,
                        transition: 'background-color 0.15s ease',
                        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                        width: '100%',
                      }}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Live Preview */}
              <div
                style={{
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                  backgroundColor: previewTheme === 'light' ? '#ffffff' : '#0b0f17',
                  position: 'relative',
                  transition: 'background-color 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '360px',
                }}
              >
                {/* Preview mode switch bar */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: previewTheme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(11, 15, 23, 0.85)',
                    backdropFilter: 'blur(8px)',
                    borderBottom: previewTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: previewTheme === 'light' ? '#0f172a' : '#f8fafc',
                    }}
                  >
                    {isRw ? 'Igaragara ry’Ako Kanya' : 'Live Preview'}
                  </span>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setPreviewTheme('light')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '5px',
                        border: 'none',
                        backgroundColor: previewTheme === 'light' ? '#0284c7' : 'rgba(148, 163, 184, 0.15)',
                        color: previewTheme === 'light' ? '#ffffff' : '#94a3b8',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTheme('dark')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '5px',
                        border: 'none',
                        backgroundColor: previewTheme === 'dark' ? '#0284c7' : 'rgba(148, 163, 184, 0.15)',
                        color: previewTheme === 'dark' ? '#ffffff' : '#94a3b8',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                {/* Preview Body Layering */}
                <div
                  style={{
                    flex: 1,
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '280px',
                  }}
                >
                  {/* Image Layer in Preview */}
                  {publicBg.enabled && (publicBg.imageDataUrl || DEFAULT_PUBLIC_BG_URL) ? (
                    <img
                      src={publicBg.imageDataUrl || DEFAULT_PUBLIC_BG_URL}
                      alt=""
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity:
                          previewTheme === 'light'
                            ? publicBg.lightImageOpacity ?? 0.20
                            : publicBg.darkImageOpacity ?? 0.15,
                        pointerEvents: 'none',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        fontSize: '0.76rem',
                        color: previewTheme === 'light' ? '#94a3b8' : '#64748b',
                      }}
                    >
                      {isRw ? 'Nta foto igaragara (Feature irazimije)' : 'Feature is OFF'}
                    </div>
                  )}

                  {/* Gradient Layer in Preview */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background:
                        previewTheme === 'light'
                          ? 'radial-gradient(ellipse 100% 800px at 50% 0%, rgba(16, 185, 129, 0.22) 0%, rgba(14, 165, 233, 0.14) 45%, transparent 80%)'
                          : 'radial-gradient(ellipse 100% 800px at 50% 0%, rgba(16, 185, 129, 0.18) 0%, rgba(14, 165, 233, 0.10) 45%, transparent 80%)',
                    opacity:
                      previewTheme === 'light'
                        ? publicBg.lightGradientOpacity ?? 0.85
                        : publicBg.darkGradientOpacity ?? 0.70,
                    pointerEvents: 'none',
                  }}
                />

                {/* Sample Content Typography in Preview */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    textAlign: 'center',
                    padding: '16px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: previewTheme === 'light' ? '#0f172a' : '#f8fafc',
                    }}
                  >
                    Sifo Driving Academy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 1: Navigation & Tab Visibility (Left) + About Us & Who We Are (Right) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
            gap: '20px',
            alignItems: 'start',
          }}
        >
          {/* ── PUBLIC NAVIGATION TABS & TOPBAR VISIBILITY MANAGER ── */}
          <div
            className="glass-panel"
            style={{
              width: '100%',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
          {/* Header & Overview */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(56, 189, 248, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                  }}
                >
                  <Navigation size={20} color="#38bdf8" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                    {isRw ? 'Amafishi yo Hejuru n\'Ibyo Abashyitsi Babona' : 'Navigation & Tab Visibility'}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    {isRw
                      ? 'Genzura amafishi agaragara hejuru ku rubuga rw\'abashyitsi.'
                      : 'Control which sections are visible in the topbar.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

              <button
                type="button"
                onClick={handleResetNavTabs}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Reset to default tab order and visibility"
              >
                <RotateCcw size={13} />
                <span>{isRw ? 'Subiza ku Miterere' : 'Reset Defaults'}</span>
              </button>
            </div>
          </div>

          {/* Tabs Management Cards Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {navTabs.map((tab, index) => {
              const isFirst = index === 0;
              const isLast = index === navTabs.length - 1;

              return (
                <div
                  key={tab.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: tab.isEnabled ? '1px solid var(--border-subtle)' : '1px dashed rgba(255, 255, 255, 0.1)',
                    background: tab.isEnabled ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                    opacity: tab.isEnabled ? 1 : 0.62,
                    transition: 'all 0.2s ease',
                    gap: '12px',
                  }}
                >
                  {/* Left: Reorder Controls + Tab Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    {/* Position badge & Up/Down buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                        }}
                      >
                        {index + 1}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => handleMoveNavTab(index, 'up')}
                          style={{
                            width: '22px',
                            height: '16px',
                            borderRadius: '4px',
                            border: 'none',
                            background: isFirst ? 'transparent' : 'rgba(255, 255, 255, 0.08)',
                            color: isFirst ? '#475569' : '#ffffff',
                            cursor: isFirst ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                          }}
                          title="Move tab earlier in topbar"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => handleMoveNavTab(index, 'down')}
                          style={{
                            width: '22px',
                            height: '16px',
                            borderRadius: '4px',
                            border: 'none',
                            background: isLast ? 'transparent' : 'rgba(255, 255, 255, 0.08)',
                            color: isLast ? '#475569' : '#ffffff',
                            cursor: isLast ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                          }}
                          title="Move tab later in topbar"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Labels & Path */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#ffffff' }}>
                        {isRw ? (tab.labelKinyarwanda || tab.label) : tab.label}
                      </span>
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontFamily: 'monospace',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#38bdf8',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {tab.path}
                      </span>
                    </div>
                  </div>

                  {/* Right: Toggle Switch & Countdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {tab.id === 'home' && homeCountdown !== null && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontFamily: 'monospace',
                            color: isDark ? '#a1a1aa' : '#52525b',
                            fontWeight: 600,
                          }}
                        >
                          {homeCountdown}s
                        </span>
                        <button
                          type="button"
                          onClick={handleCancelHomeDisable}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            border: isDark ? '1px solid #3f3f46' : '1px solid #d4d4d8',
                            background: 'transparent',
                            color: isDark ? '#f4f4f5' : '#18181b',
                            fontSize: '0.72rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          {isRw ? 'Hagarika' : 'Cancel'}
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={tab.id === 'home' && homeCountdown !== null}
                      onClick={() => handleToggleNavTab(tab.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: tab.id === 'home' && homeCountdown !== null ? 'not-allowed' : 'pointer',
                        color: tab.isEnabled ? '#38bdf8' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0,
                        opacity: tab.id === 'home' && homeCountdown !== null ? 0.4 : 1,
                        transition: 'transform 0.15s ease, color 0.15s ease, opacity 0.15s ease',
                      }}
                      title={
                        tab.id === 'home' && homeCountdown !== null
                          ? 'Countdown in progress'
                          : tab.isEnabled
                          ? 'Click to hide this tab from public visitors'
                          : 'Click to show this tab on public topbar'
                      }
                    >
                      {tab.isEnabled ? <ToggleRight size={34} /> : <ToggleLeft size={34} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

          {/* About Us & Who We Are Content Manager */}
          <div
            className="glass-panel"
            style={{
              width: '100%',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
          {/* Header & Quick Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                }}
              >
                <Users size={20} color="#38bdf8" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                  {isRw ? 'Ibyerekeye Sifo Drive & Abo Turi Bo' : 'About Us & Who We Are'}
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                  {isRw
                    ? 'Hindura inyandiko z\'Ibyerekeye Twebwe n\'Abo Turi Bo zigaragara ku rupapuro rw\'ahabanza.'
                    : 'Edit the About Us headline, intro text, and Who We Are description on the Home page.'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetAboutUs}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Reset to default copy"
            >
              <RotateCcw size={13} />
              <span>{isRw ? 'Subiza ku Miterere' : 'Reset Defaults'}</span>
            </button>
          </div>

          {/* Language Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => setAboutUsLangTab('en')}
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: aboutUsLangTab === 'en' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: aboutUsLangTab === 'en' ? '#38bdf8' : '#94a3b8',
                fontWeight: aboutUsLangTab === 'en' ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setAboutUsLangTab('rw')}
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: aboutUsLangTab === 'rw' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: aboutUsLangTab === 'rw' ? '#38bdf8' : '#94a3b8',
                fontWeight: aboutUsLangTab === 'rw' ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Ikinyarwanda (Kinyarwanda)
            </button>
          </div>

          {/* Form Fields for Active Language */}
          {aboutUsLangTab === 'en' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Section Title (English)
                </label>
                <input
                  type="text"
                  value={currentAboutUs.aboutUsTitle ?? ''}
                  onChange={(e) => handleAboutUsFieldChange('aboutUsTitle', e.target.value)}
                  placeholder="About Us"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Section Subtitle / Tagline (English)
                </label>
                <textarea
                  rows={2}
                  value={currentAboutUs.aboutUsSubtitle ?? ''}
                  onChange={(e) => handleAboutUsFieldChange('aboutUsSubtitle', e.target.value)}
                  placeholder="Dedicated to modernizing driver education in Rwanda..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Who We Are Card Title (English)
                </label>
                <input
                  type="text"
                  value={currentAboutUs.whoWeAreTitle ?? ''}
                  onChange={(e) => handleAboutUsFieldChange('whoWeAreTitle', e.target.value)}
                  placeholder="Who We Are"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Who We Are Description (English)
                </label>
                <textarea
                  rows={4}
                  value={currentAboutUs.whoWeAreDesc ?? ''}
                  onChange={(e) => handleAboutUsFieldChange('whoWeAreDesc', e.target.value)}
                  placeholder="Rwanda's premier digital driving academy ecosystem connecting learners..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Umutwe w'Icyiciro (Ikinyarwanda)
                </label>
                <input
                  type="text"
                  value={currentAboutUs.aboutUsTitleRw ?? ''}
                  onChange={(e) => handleAboutUsFieldChange('aboutUsTitleRw', e.target.value)}
                  placeholder="Ibyerekeye Sifo Drive"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Ibisobanuro Rusange by'Icyiciro (Ikinyarwanda)
                </label>
                <textarea
                  rows={2}
                  value={currentAboutUs.aboutUsSubtitleRw ?? ''}
                  onChange={(e) => handleAboutUsFieldChange('aboutUsSubtitleRw', e.target.value)}
                  placeholder="Twiyemeje kuvugurura uburezi bwo gutwara ibinyabiziga mu Rwanda..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Umutwe w'Ikarita y'Abo Turi Bo (Ikinyarwanda)
                </label>
                <input
                  type="text"
                  value={currentAboutUs.whoWeAreTitleRw ?? ''}
                  onChange={(e) => handleAboutUsFieldChange('whoWeAreTitleRw', e.target.value)}
                  placeholder="Abo Turi Bo"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Ibisobanuro Byimbitse by'Abo Turi Bo (Ikinyarwanda)
                </label>
                <textarea
                  rows={4}
                  value={currentAboutUs.whoWeAreDescRw ?? ''}
                  onChange={(e) => handleAboutUsFieldChange('whoWeAreDescRw', e.target.value)}
                  placeholder="Urubuga rw'ikoranabuhanga mu Rwanda rwunganira abanyeshuri..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Contact & Support Details (Left) + Legal & Regulatory (Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Contact & Support Details + Homepage Statistics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Contact & Support Details Manager */}
          <div
            className="glass-panel"
            style={{
              width: '100%',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Header & Quick Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(56, 189, 248, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                  }}
                >
                  <PhoneCall size={20} color="#38bdf8" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                    {isRw ? 'Amakuru yo Kutwandikira & Ubufasha' : 'Contact & Support Details'}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                    {isRw
                      ? 'Hindura inyandiko iri munsi y\'ikirango cya Sifo (mbere y\'Amategeko), aderesi, telefone, na imeli bigaragara munsi ku mbuga zose.'
                      : 'Edit brand description under Sifo logo, address, telephone hotline, and support email displayed in the footer.'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetContact}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Reset contact details to defaults"
              >
                <RotateCcw size={13} />
                <span>{isRw ? 'Subiza ku Miterere' : 'Reset Defaults'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Brand Description under Sifo Logo (English & Kinyarwanda) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#334155', marginBottom: '4px' }}>
                  {isRw ? 'Inyandiko munsi y’Ikirango cya Sifo (Icyongereza)' : 'Footer Summary under Sifo Logo (English)'}
                </label>
                <div style={{ fontSize: '0.74rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '6px' }}>
                  {isRw
                    ? 'Inyandiko y\'Icyongereza igaragara munsi y\'ikirango cya Sifo mbere y\'igice cy\'Amategeko (Legal & Regulatory).'
                    : 'Text displayed directly under the Sifo logo in the footer, right before the Legal & Regulatory section.'}
                </div>
                <textarea
                  rows={3}
                  value={currentContact.brandDescription ?? ''}
                  onChange={(e) => handleContactFieldChange('brandDescription', e.target.value)}
                  placeholder="e.g. Rwanda's leading digital driving academy. Preparing future drivers with high-standard theory..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#334155', marginBottom: '4px' }}>
                  {isRw ? 'Inyandiko munsi y’Ikirango cya Sifo (Ikinyarwanda)' : 'Footer Summary under Sifo Logo (Kinyarwanda)'}
                </label>
                <div style={{ fontSize: '0.74rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '6px' }}>
                  {isRw
                    ? 'Inyandiko y\'Ikinyarwanda igaragara munsi y\'ikirango cya Sifo mbere y\'igice cy\'Amategeko.'
                    : 'Kinyarwanda translation for the brand summary under the Sifo logo.'}
                </div>
                <textarea
                  rows={3}
                  value={currentContact.brandDescriptionRw ?? ''}
                  onChange={(e) => handleContactFieldChange('brandDescriptionRw', e.target.value)}
                  placeholder="urugero: Ishuri Rikuru ry'Ikoranabuhanga ryo Gutwara Ibinyabiziga mu Rwanda..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#334155', marginBottom: '6px' }}>
                  Address / Physical Headquarters (English)
                </label>
                <input
                  type="text"
                  value={currentContact.address ?? ''}
                  onChange={(e) => handleContactFieldChange('address', e.target.value)}
                  placeholder="e.g. Kigali, Rwanda"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#334155', marginBottom: '6px' }}>
                  Aderesi / Icyicaro Gikuru (Ikinyarwanda)
                </label>
                <input
                  type="text"
                  value={currentContact.addressRw ?? ''}
                  onChange={(e) => handleContactFieldChange('addressRw', e.target.value)}
                  placeholder="urugero: Kigali, u Rwanda"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#334155', marginBottom: '6px' }}>
                    Support Phone Hotline
                  </label>
                  <input
                    type="text"
                    value={currentContact.phone ?? ''}
                    onChange={(e) => handleContactFieldChange('phone', e.target.value)}
                    placeholder="e.g. +250 788 123 456"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                      background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#334155', marginBottom: '6px' }}>
                    Support Email Address
                  </label>
                  <input
                    type="email"
                    value={currentContact.email ?? ''}
                    onChange={(e) => handleContactFieldChange('email', e.target.value)}
                    placeholder="e.g. support@sifodrive.rw"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                      background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Homepage Statistics & Numbers Manager */}
          <div
            className="glass-panel"
            style={{
              width: '100%',
              padding: '24px',
              borderRadius: '16px',
              border: isDark ? '1px solid var(--border-subtle)' : '1px solid #e2e8f0',
              background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            {/* Header & Quick Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(56, 189, 248, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                  }}
                >
                  <TrendingUp size={20} color="#38bdf8" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                    {isRw ? 'Imibare y’Ahabanza (Homepage Numbers)' : 'Homepage Statistics & Numbers'}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                    {isRw
                      ? 'Hindura imibare 4 y\'ingenzi igaragara ku rupapuro rw\'ahabanza munsi ya buto ya \'Gura Ikizamini\'.'
                      : 'Edit the 4 headline metrics displayed in the homepage counter under the Buy Exam button.'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetStats}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Reset statistics to default numbers"
              >
                <RotateCcw size={13} />
                <span>{isRw ? 'Subiza ku Miterere' : 'Reset Defaults'}</span>
              </button>
            </div>

            {/* Inputs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              {/* 1. Provisional Pass Rate */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#334155', marginBottom: '4px' }}>
                  {isRw ? 'Impuzandengo yo Gutsinda' : 'Provisional Pass Rate'}
                </label>
                <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '6px' }}>
                  {isRw ? 'Urugero: 98.4%' : 'Default: 98.4%'}
                </div>
                <input
                  type="text"
                  value={currentStats.passRate ?? ''}
                  onChange={(e) => handleStatsFieldChange('passRate', e.target.value)}
                  placeholder="98.4%"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                  }}
                />
              </div>

              {/* 2. Active Learners in Rwanda */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#334155', marginBottom: '4px' }}>
                  {isRw ? 'Abanyeshuri Bakiri Kwiga' : 'Active Learners in Rwanda'}
                </label>
                <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '6px' }}>
                  {isRw ? 'Urugero: 15,000+' : 'Default: 15,000+'}
                </div>
                <input
                  type="text"
                  value={currentStats.activeLearners ?? ''}
                  onChange={(e) => handleStatsFieldChange('activeLearners', e.target.value)}
                  placeholder="15,000+"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                  }}
                />
              </div>

              {/* 3. Total Exam */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#334155', marginBottom: '4px' }}>
                  {isRw ? 'Ibizamini Byose' : 'Total Exam'}
                </label>
                <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '6px' }}>
                  {isRw ? 'Urugero: 100+' : 'Default: 100+'}
                </div>
                <input
                  type="text"
                  value={currentStats.totalExams ?? ''}
                  onChange={(e) => handleStatsFieldChange('totalExams', e.target.value)}
                  placeholder="100+"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                  }}
                />
              </div>

              {/* 4. Service Concierge */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#334155', marginBottom: '4px' }}>
                  {isRw ? 'Ubufasha Bwihariye' : 'Service Concierge'}
                </label>
                <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '6px' }}>
                  {isRw ? 'Urugero: 24/7' : 'Default: 24/7'}
                </div>
                <input
                  type="text"
                  value={currentStats.serviceConcierge ?? ''}
                  onChange={(e) => handleStatsFieldChange('serviceConcierge', e.target.value)}
                  placeholder="24/7"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                  }}
                />
              </div>
            </div>

            {/* Live Preview Strip */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b' }}>
                {isRw ? 'Icyitegererezo cy\'Uko Bigaragara ku Ahabanza' : 'Live Homepage Preview'}
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  textAlign: 'center',
                  padding: '6px 0',
                }}
              >
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-light, #38bdf8)' }}>
                    {currentStats.passRate || '—'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    {isRw ? 'Impuzandengo yo Gutsinda' : 'Provisional Pass Rate'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-500, #10b981)' }}>
                    {currentStats.activeLearners || '—'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    {isRw ? 'Abanyeshuri Bakiri Kwiga' : 'Active Learners in Rwanda'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--secondary-400, #f59e0b)' }}>
                    {currentStats.totalExams || '—'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    {isRw ? 'Ibizamini Byose' : 'Total Exam'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ec4899' }}>
                    {currentStats.serviceConcierge || '—'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    {isRw ? 'Ubufasha Bwihariye' : 'Service Concierge'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Regulatory Manager */}
        <div
          className="glass-panel"
          style={{
            width: '100%',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Header & Quick Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                }}
              >
                <Shield size={20} color="#38bdf8" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                  {isRw ? 'Amategeko & Politiki' : 'Legal & Regulatory'}
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                  {isRw
                    ? 'Hindura ibikubiye muri Politiki yo Kurinda Amakuru n\'Amabwiriza agenga urubuga.'
                    : 'Edit document text for Privacy Policy and Terms & Conditions.'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetLegal}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Reset legal documents to defaults"
            >
              <RotateCcw size={13} />
              <span>{isRw ? 'Subiza ku Miterere' : 'Reset Defaults'}</span>
            </button>
          </div>

          {/* Language Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => setLegalLangTab('en')}
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: legalLangTab === 'en' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: legalLangTab === 'en' ? '#38bdf8' : '#94a3b8',
                fontWeight: legalLangTab === 'en' ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLegalLangTab('rw')}
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: legalLangTab === 'rw' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: legalLangTab === 'rw' ? '#38bdf8' : '#94a3b8',
                fontWeight: legalLangTab === 'rw' ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Ikinyarwanda (Kinyarwanda)
            </button>
          </div>

          {/* Form Fields for Active Language */}
          {legalLangTab === 'en' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
                  Privacy Policy Content (English)
                </label>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Displayed in modal dialog when visitors click "Privacy Policy" in the footer.
                </div>
                <textarea
                  rows={8}
                  value={currentLegal.privacyPolicyContent ?? ''}
                  onChange={(e) => handleLegalFieldChange('privacyPolicyContent', e.target.value)}
                  placeholder="Enter Privacy Policy document text..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
                  Terms & Conditions Content (English)
                </label>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Displayed in modal dialog when visitors click "Terms & Conditions" in the footer.
                </div>
                <textarea
                  rows={8}
                  value={currentLegal.termsAndConditionsContent ?? ''}
                  onChange={(e) => handleLegalFieldChange('termsAndConditionsContent', e.target.value)}
                  placeholder="Enter Terms & Conditions document text..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
                  Ibikubiye muri Politiki yo Kurinda Amakuru Bwite (Ikinyarwanda)
                </label>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Bigaragara mu idirishya rifunguka iyo umushyitsi akanze "Politiki yo Kurinda Amakuru Bwite".
                </div>
                <textarea
                  rows={8}
                  value={currentLegal.privacyPolicyContentRw ?? ''}
                  onChange={(e) => handleLegalFieldChange('privacyPolicyContentRw', e.target.value)}
                  placeholder="Andika inyandiko ya Politiki yo Kurinda Amakuru..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
                  Ibikubiye mu Mabwiriza n'Ibisabwa (Ikinyarwanda)
                </label>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Bigaragara mu idirishya rifunguka iyo umushyitsi akanze "Amabwiriza n'Ibisabwa".
                </div>
                <textarea
                  rows={8}
                  value={currentLegal.termsAndConditionsContentRw ?? ''}
                  onChange={(e) => handleLegalFieldChange('termsAndConditionsContentRw', e.target.value)}
                  placeholder="Andika inyandiko y'Amabwiriza n'Ibisabwa..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── TAB SETTINGS DIVIDER LINE ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: '1px',
          background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
          margin: '36px 0 28px 0',
        }}
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── AGENT SERVICES TAB SETTINGS ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className="glass-panel"
        style={{
          width: '100%',
          padding: '24px',
          borderRadius: '16px',
          border: isDark ? '1px solid var(--border-subtle)' : '1px solid #e2e8f0',
          background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
          boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        {/* Header & Quick Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <Briefcase size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                {isRw ? 'Serivisi za Agent' : 'Agent Services'}
              </h3>
              <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                {isRw
                  ? 'Igenamiterere ry’amahitamo ku ipaji ya serivisi.'
                  : 'Configure options on Services portal.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handleResetAgentServices}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#38bdf8';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <RotateCcw size={13} />
              <span>{isRw ? 'Subiza ku Miterere' : 'Reset Defaults'}</span>
            </button>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* ── HOW IT WORKS & BOOKING STEPS MANAGER ── */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div
          style={{
            marginTop: '8px',
            padding: '20px',
            borderRadius: '14px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            background: isDark ? 'rgba(0, 0, 0, 0.2)' : '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {/* Sub-header & Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? '#38bdf8' : '#0284c7',
                }}
              >
                <ListOrdered size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                  {isRw ? 'Uko Bikora & Intambwe zo Kwiyandikisha' : 'How It Works & Booking Steps'}
                </h4>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Language Switcher Tabs */}
              <div
                style={{
                  display: 'flex',
                  background: isDark ? 'rgba(0, 0, 0, 0.3)' : '#e2e8f0',
                  padding: '3px',
                  borderRadius: '8px',
                  gap: '4px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setStepsLangTab('en')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: stepsLangTab === 'en' ? (isDark ? 'rgba(56, 189, 248, 0.25)' : '#ffffff') : 'transparent',
                    color: stepsLangTab === 'en' ? (isDark ? '#38bdf8' : '#0284c7') : (isDark ? '#94a3b8' : '#64748b'),
                    fontWeight: stepsLangTab === 'en' ? 700 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setStepsLangTab('rw')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: stepsLangTab === 'rw' ? (isDark ? 'rgba(56, 189, 248, 0.25)' : '#ffffff') : 'transparent',
                    color: stepsLangTab === 'rw' ? (isDark ? '#38bdf8' : '#0284c7') : (isDark ? '#94a3b8' : '#64748b'),
                    fontWeight: stepsLangTab === 'rw' ? 700 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Ikinyarwanda
                </button>
              </div>

              {/* Add Step Button */}
              <button
                type="button"
                onClick={handleAddStep}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: isDark ? 'rgba(16, 185, 129, 0.2)' : '#10b981',
                  color: isDark ? '#34d399' : '#ffffff',
                  border: isDark ? '1px solid rgba(16, 185, 129, 0.35)' : 'none',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Plus size={14} />
                <span>{isRw ? 'Ongeraho Intambwe' : 'Add New Step'}</span>
              </button>

              {/* Reset Steps Button */}
              <button
                type="button"
                onClick={handleResetSteps}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: '#94a3b8',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title={isRw ? 'Subiza intambwe ku miterere y\'ibanze' : 'Reset steps to defaults'}
              >
                <RotateCcw size={12} />
                <span>{isRw ? 'Subiza ku Miterere' : 'Reset'}</span>
              </button>
            </div>
          </div>

          {/* Section Main Title Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#334155', marginBottom: '4px' }}>
              {stepsLangTab === 'en'
                ? 'Section Headline Title (English)'
                : 'Umutwe Mukuru w\'Igice (Ikinyarwanda)'}
            </label>
            <input
              type="text"
              value={stepsLangTab === 'en' ? (currentAgentServices.howItWorksTitle ?? 'How It Works & Booking Steps') : (currentAgentServices.howItWorksTitleRw ?? 'Uko Bikora & Ibyiza')}
              onChange={(e) => handleAgentServicesFieldChange(stepsLangTab === 'en' ? 'howItWorksTitle' : 'howItWorksTitleRw', e.target.value)}
              placeholder={stepsLangTab === 'en' ? 'How It Works & Booking Steps' : 'Uko Bikora & Ibyiza'}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                color: isDark ? '#ffffff' : '#0f172a',
                fontSize: '0.88rem',
                fontWeight: 600,
              }}
            />
          </div>

          {/* Steps List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentSteps.map((step, index) => {
              const isFirst = index === 0;
              const isLast = index === currentSteps.length - 1;

              return (
                <div
                  key={step.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                    background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {/* Step Row Header: Numbering, Reordering & Deletion */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(2, 132, 199, 0.12)',
                          color: isDark ? '#38bdf8' : '#0284c7',
                          border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(2, 132, 199, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                        }}
                      >
                        {step.stepNumber}
                      </div>

                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#334155' }}>
                        {stepsLangTab === 'en' ? (step.title || `Step ${step.stepNumber}`) : (step.titleRw || `Intambwe ya ${step.stepNumber}`)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => handleMoveStep(index, 'up')}
                        disabled={isFirst}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          background: 'rgba(255, 255, 255, 0.04)',
                          color: isFirst ? (isDark ? '#475569' : '#cbd5e1') : (isDark ? '#cbd5e1' : '#475569'),
                          cursor: isFirst ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title={isRw ? 'Kuzamura hejuru' : 'Move up'}
                      >
                        <ChevronUp size={14} />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => handleMoveStep(index, 'down')}
                        disabled={isLast}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          background: 'rgba(255, 255, 255, 0.04)',
                          color: isLast ? (isDark ? '#475569' : '#cbd5e1') : (isDark ? '#cbd5e1' : '#475569'),
                          cursor: isLast ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title={isRw ? 'Kumanura hasi' : 'Move down'}
                      >
                        <ChevronDown size={14} />
                      </button>

                      {/* Remove Step */}
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(step.id)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title={isRw ? 'Siba iyi ntambwe' : 'Delete this step'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Step Input Fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', marginBottom: '3px' }}>
                        {stepsLangTab === 'en' ? 'Step Title / Label (English)' : 'Umutwe w\'Intambwe (Ikinyarwanda)'}
                      </label>
                      <input
                        type="text"
                        value={stepsLangTab === 'en' ? step.title : step.titleRw}
                        onChange={(e) => handleUpdateStep(step.id, stepsLangTab === 'en' ? { title: e.target.value } : { titleRw: e.target.value })}
                        placeholder={stepsLangTab === 'en' ? 'e.g. Available Services' : 'Urugero: Serivisi Ubona'}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                          background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                          color: isDark ? '#ffffff' : '#0f172a',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', marginBottom: '3px' }}>
                        {stepsLangTab === 'en' ? 'Step Description / Detail (English)' : 'Ibisobanuro by\'Intambwe (Ikinyarwanda)'}
                      </label>
                      <input
                        type="text"
                        value={stepsLangTab === 'en' ? step.description : step.descriptionRw}
                        onChange={(e) => handleUpdateStep(step.id, stepsLangTab === 'en' ? { description: e.target.value } : { descriptionRw: e.target.value })}
                        placeholder={stepsLangTab === 'en' ? 'Explain what this step does...' : 'Sobanura ibikorwa muri iyi ntambwe...'}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                          background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                          color: isDark ? '#ffffff' : '#0f172a',
                          fontSize: '0.82rem',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subtle Separator between Steps and Booking Form */}
        <div
          style={{
            height: '1px',
            background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.9)',
            margin: '26px 0 24px 0',
          }}
        />

        {/* ── BOOKING FORM CONTROLS ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Sub-header & Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? '#38bdf8' : '#0284c7',
                }}
              >
                <ClipboardList size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                  {isRw ? 'Igenzura rya Fomu yo Kwiyandikisha' : 'Booking Form Controls'}
                </h4>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Language Switcher Tabs */}
              <div
                style={{
                  display: 'flex',
                  background: isDark ? 'rgba(0, 0, 0, 0.3)' : '#e2e8f0',
                  padding: '3px',
                  borderRadius: '8px',
                  gap: '4px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setBookingFormLangTab('en')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: bookingFormLangTab === 'en' ? (isDark ? 'rgba(56, 189, 248, 0.25)' : '#ffffff') : 'transparent',
                    color: bookingFormLangTab === 'en' ? (isDark ? '#38bdf8' : '#0284c7') : (isDark ? '#94a3b8' : '#64748b'),
                    fontWeight: bookingFormLangTab === 'en' ? 700 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setBookingFormLangTab('rw')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: bookingFormLangTab === 'rw' ? (isDark ? 'rgba(56, 189, 248, 0.25)' : '#ffffff') : 'transparent',
                    color: bookingFormLangTab === 'rw' ? (isDark ? '#38bdf8' : '#0284c7') : (isDark ? '#94a3b8' : '#64748b'),
                    fontWeight: bookingFormLangTab === 'rw' ? 700 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Ikinyarwanda
                </button>
              </div>

              {/* Manage Fields Button */}
              <button
                type="button"
                onClick={() => setIsManageFieldsModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #38bdf8' : '1px solid #0284c7',
                  background: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)',
                  color: isDark ? '#38bdf8' : '#0284c7',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title={isRw ? 'Guhitamo imyanya igaragara kuri fomu' : 'Configure visible form fields'}
              >
                <SlidersHorizontal size={13} />
                <span>Manage</span>
              </button>

              {/* Reset Booking Form Defaults */}
              <button
                type="button"
                onClick={handleResetBookingForm}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                  background: 'transparent',
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title={isRw ? 'Gusubiza fomu ku miterere y\'ibanze' : 'Reset form settings to defaults'}
              >
                <RotateCcw size={13} />
                <span>{isRw ? 'Kugarura Ibisanzwe' : 'Reset Form'}</span>
              </button>
            </div>
          </div>

          {/* Form Title & Subtitle Customization */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '14px',
              padding: '16px',
              borderRadius: '12px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
              background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', marginBottom: '4px' }}>
                {bookingFormLangTab === 'en' ? 'Form Title / Heading (English)' : 'Umutwe wa Fomu (Ikinyarwanda)'}
              </label>
              <input
                type="text"
                value={bookingFormLangTab === 'en' ? (currentBookingForm.formTitle || '') : (currentBookingForm.formTitleRw || '')}
                onChange={(e) =>
                  handleUpdateBookingForm(
                    bookingFormLangTab === 'en'
                      ? { formTitle: e.target.value }
                      : { formTitleRw: e.target.value }
                  )
                }
                placeholder={bookingFormLangTab === 'en' ? 'Book Agent Service' : 'Kora Gahunda ya Agent'}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                  color: isDark ? '#ffffff' : '#0f172a',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', marginBottom: '4px' }}>
                {bookingFormLangTab === 'en' ? 'Form Subtitle / Instructions (English)' : 'Amabwiriza ya Fomu (Ikinyarwanda)'}
              </label>
              <input
                type="text"
                value={bookingFormLangTab === 'en' ? (currentBookingForm.formSubtitle || '') : (currentBookingForm.formSubtitleRw || '')}
                onChange={(e) =>
                  handleUpdateBookingForm(
                    bookingFormLangTab === 'en'
                      ? { formSubtitle: e.target.value }
                      : { formSubtitleRw: e.target.value }
                  )
                }
                placeholder={
                  bookingFormLangTab === 'en'
                    ? 'Fill in your details below...'
                    : 'Uzuza iyi myirondoro, umu-ajenti aragufasha...'
                }
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                  color: isDark ? '#ffffff' : '#0f172a',
                  fontSize: '0.82rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', marginBottom: '4px' }}>
                {bookingFormLangTab === 'en' ? 'Submit Button Text (English)' : 'Inyandiko ya Buto yo Kohereza (Ikinyarwanda)'}
              </label>
              <input
                type="text"
                value={bookingFormLangTab === 'en' ? (currentBookingForm.submitButtonText || '') : (currentBookingForm.submitButtonTextRw || '')}
                onChange={(e) =>
                  handleUpdateBookingForm(
                    bookingFormLangTab === 'en'
                      ? { submitButtonText: e.target.value }
                      : { submitButtonTextRw: e.target.value }
                  )
                }
                placeholder={bookingFormLangTab === 'en' ? 'Submit Agent Service Request' : 'Ohereza Ubusabe bwa Agent'}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                  color: isDark ? '#ffffff' : '#0f172a',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', marginBottom: '4px' }}>
                {isRw ? 'Agace k\'Ikizamini Gasanzwe (Default Hub)' : 'Default Testing Center / Hub'}
              </label>
              <input
                type="text"
                value={currentBookingForm.defaultLocation || ''}
                onChange={(e) => handleUpdateBookingForm({ defaultLocation: e.target.value })}
                placeholder="e.g. Remera - Amahoro Police Test Center"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                  color: isDark ? '#ffffff' : '#0f172a',
                  fontSize: '0.82rem',
                }}
              />
            </div>
          </div>

          {/* Booking Form Dropdown Options Manager (Services, Districts, Centers, Sites, Teachers) */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
              background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Category Switcher Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0', paddingBottom: '12px' }}>
              {[
                { id: 'services' as const, label: isRw ? 'Serivisi' : 'Services' },
                { id: 'districts' as const, label: isRw ? 'Uturere' : 'Districts' },
                { id: 'centers' as const, label: isRw ? 'Ibigo by\'Ikizamini' : 'Testing Centers' },
                { id: 'sites' as const, label: isRw ? 'Working Sites' : 'Working Sites' },
                { id: 'teachers' as const, label: isRw ? 'Abarimu' : 'Teachers' },
              ].map((tab) => {
                const isActive = bookingOptionCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setBookingOptionCategory(tab.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: isActive
                        ? (isDark ? '1px solid #38bdf8' : '1px solid #0284c7')
                        : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0'),
                      background: isActive
                        ? (isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)')
                        : (isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc'),
                      color: isActive
                        ? (isDark ? '#38bdf8' : '#0284c7')
                        : (isDark ? '#94a3b8' : '#64748b'),
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Category Header & Add Button */}
            {(() => {
              const activeCat = getOptionCategoryConfig(bookingOptionCategory);
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                        {activeCat.title}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddDropdownOption(activeCat.field, activeCat.defaultKey, activeCat.isTranslatable)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: isDark ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid #0284c7',
                        background: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)',
                        color: isDark ? '#38bdf8' : '#0284c7',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Plus size={14} />
                      <span>{activeCat.addLabel}</span>
                    </button>
                  </div>

                  {/* List of Dynamic Options for Selected Category */}
                  {activeCat.options.length > 0 && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: activeCat.isTranslatable ? 'minmax(0, 1fr) minmax(0, 1fr) auto' : 'minmax(0, 1fr) auto',
                        gap: '8px',
                        padding: '0 2px',
                      }}
                    >
                      {activeCat.isTranslatable ? (
                        <>
                          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b' }}>
                            {isRw ? 'Izina (Icyongereza)' : 'Option Label (English)'}
                          </div>
                          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b' }}>
                            {isRw ? 'Ubusobanuro mu Kinyarwanda' : 'Kinyarwanda Translation'}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b' }}>
                          {isRw ? 'Izina' : 'Name'}
                        </div>
                      )}
                      <div style={{ width: '86px' }} />
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeCat.options.length === 0 ? (
                      <div
                        style={{
                          fontSize: '0.82rem',
                          color: isDark ? '#94a3b8' : '#64748b',
                          padding: '8px 0',
                          fontStyle: 'italic',
                        }}
                      >
                        {isRw
                          ? 'Nta mahitamo yateguwe. Kanda buto yo hejuru kugira ngo utangire.'
                          : 'No options configured. Click the button above to add one.'}
                      </div>
                    ) : (
                      activeCat.options.map((opt, index) => {
                        const isFirst = index === 0;
                        const isLast = index === activeCat.options.length - 1;

                        return (
                          <div
                            key={opt.id}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: activeCat.isTranslatable ? 'minmax(0, 1fr) minmax(0, 1fr) auto' : 'minmax(0, 1fr) auto',
                              gap: '8px',
                              alignItems: 'center',
                            }}
                          >
                            {activeCat.isTranslatable ? (
                              <>
                                <input
                                  type="text"
                                  value={opt.label}
                                  onChange={(e) => handleUpdateDropdownOption(activeCat.field, opt.id, { label: e.target.value })}
                                  placeholder={activeCat.placeholderEn}
                                  style={{
                                    width: '100%',
                                    padding: '7px 10px',
                                    borderRadius: '6px',
                                    border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                                    color: isDark ? '#ffffff' : '#0f172a',
                                    fontSize: '0.82rem',
                                    fontWeight: 500,
                                  }}
                                />

                                <input
                                  type="text"
                                  value={opt.labelRw}
                                  onChange={(e) => handleUpdateDropdownOption(activeCat.field, opt.id, { labelRw: e.target.value })}
                                  placeholder={activeCat.placeholderRw}
                                  style={{
                                    width: '100%',
                                    padding: '7px 10px',
                                    borderRadius: '6px',
                                    border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                                    color: isDark ? '#ffffff' : '#0f172a',
                                    fontSize: '0.82rem',
                                    fontWeight: 500,
                                  }}
                                />
                              </>
                            ) : (
                              <input
                                type="text"
                                value={opt.label}
                                onChange={(e) =>
                                  handleUpdateDropdownOption(activeCat.field, opt.id, {
                                    label: e.target.value,
                                    labelRw: e.target.value,
                                    key: e.target.value,
                                  })
                                }
                                placeholder={activeCat.placeholder}
                                style={{
                                  width: '100%',
                                  padding: '7px 10px',
                                  borderRadius: '6px',
                                  border: isDark ? '1px solid var(--border-subtle)' : '1px solid #cbd5e1',
                                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                                  color: isDark ? '#ffffff' : '#0f172a',
                                  fontSize: '0.82rem',
                                  fontWeight: 500,
                                }}
                              />
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => handleMoveDropdownOption(activeCat.field, index, 'up')}
                                disabled={isFirst}
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border-subtle)',
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  color: isFirst ? (isDark ? '#475569' : '#cbd5e1') : (isDark ? '#cbd5e1' : '#475569'),
                                  cursor: isFirst ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                title={isRw ? 'Kuzamura hejuru' : 'Move up'}
                              >
                                <ChevronUp size={13} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleMoveDropdownOption(activeCat.field, index, 'down')}
                                disabled={isLast}
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border-subtle)',
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  color: isLast ? (isDark ? '#475569' : '#cbd5e1') : (isDark ? '#cbd5e1' : '#475569'),
                                  cursor: isLast ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                title={isRw ? 'Kumanura hasi' : 'Move down'}
                              >
                                <ChevronDown size={13} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveDropdownOption(activeCat.field, opt.id)}
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                title={isRw ? 'Siba aya mahitamo' : 'Delete this option'}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              );
            })()}
          </div>

          {/* Field Requirements & Options */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
              background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                {isRw ? 'Ibisabwa Muri Fomu (Field Rules)' : 'Field Rules & Behavior'}
              </div>
              <div style={{ fontSize: '0.76rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                {isRw
                  ? 'Genzura niba amatariki cyangwa ikigo cy\'ikizamini ari itegeko cyangwa niba ibisobanuro byiyongereyeho biboneka.'
                  : 'Toggle mandatory requirements for date/center and show or hide optional notes.'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              {/* Require Date */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isDark ? '#e2e8f0' : '#1e293b' }}>
                  {isRw ? 'Gusaba Itariki Yiteguwe (Required)' : 'Require Preferred Date'}
                </span>
                <input
                  type="checkbox"
                  checked={currentBookingForm.requirePreferredDate ?? false}
                  onChange={(e) => handleUpdateBookingForm({ requirePreferredDate: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7' }}
                />
              </label>

              {/* Require Hub */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isDark ? '#e2e8f0' : '#1e293b' }}>
                  {isRw ? 'Gusaba Ikigo cy\'Ikizamini (Required)' : 'Require Testing Center'}
                </span>
                <input
                  type="checkbox"
                  checked={currentBookingForm.requireTestingCenter ?? false}
                  onChange={(e) => handleUpdateBookingForm({ requireTestingCenter: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7' }}
                />
              </label>

              {/* Show Notes Field */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isDark ? '#e2e8f0' : '#1e293b' }}>
                  {isRw ? 'Kugaragaza Umwanya w\'Ibisobanuro' : 'Show Additional Notes Field'}
                </span>
                <input
                  type="checkbox"
                  checked={currentBookingForm.showNotesField ?? true}
                  onChange={(e) => handleUpdateBookingForm({ showNotesField: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7' }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Globe size={18} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                {isRw ? 'Igenzura ry’Abashyitsi' : 'Guest Access Controls'}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* 1. Allow Public Guest Checkout */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Guest Pay-As-You-Go Checkout
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Allows visitors to buy mock tests with just a phone number via MoMo without account sign-up.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.allowPublicGuestCheckout ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, allowPublicGuestCheckout: e.target.checked });
                      showToast(`Guest Pay-As-You-Go ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0284c7' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Directly impacts the public pricing & mock exam checkout modal.
                </div>
              </div>

              {/* 2. Public Catalog Visibility */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Public Pricing & Course Catalog
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Show complete tuition packages, hourly fees, and subscription passes to public visitors.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.publicCatalogVisible ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, publicCatalogVisible: e.target.checked });
                      showToast(`Public catalog ${e.target.checked ? 'VISIBLE' : 'HIDDEN'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0284c7' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  When disabled, visitors are prompted to log in before viewing rates.
                </div>
              </div>

              {/* 3. Candidate Online Registration */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Public Self-Registration
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Allow prospective driving candidates to create student accounts directly online.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.publicSelfRegistration ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, publicSelfRegistration: e.target.checked });
                      showToast(`Self-Registration ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Disable during intake freeze or exclusive corporate cohorts.
                </div>
              </div>

              {/* 4. Free Road Signs Directory Access */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Open Road Signs Handbook
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Provides public access to Rwanda official road signs, markings, and traffic signals.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.publicSignsFreeAccess ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, publicSignsFreeAccess: e.target.checked });
                      showToast(`Public Road Signs ${e.target.checked ? 'OPEN' : 'LOCKED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0284c7' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Useful as a public good and SEO discovery magnet.
                </div>
              </div>

              {/* 5. Free Practice Exams on First Visit */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    Guest Complimentary Trial Exams
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                    Number of free practice exams granted to guest phone numbers upon first verification.
                  </div>
                </div>
                <select
                  value={platformConfig.guestTrialExamCount ?? 2}
                  onChange={(e) => {
                    setPlatformConfig({ ...platformConfig, guestTrialExamCount: Number(e.target.value) });
                    showToast(`Guest trial exams set to ${e.target.value}`, 'info');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value={0}>0 (Strictly Paid Only)</option>
                  <option value={1}>1 Free Trial Exam</option>
                  <option value={2}>2 Free Trial Exams (Recommended)</option>
                  <option value={3}>3 Free Trial Exams</option>
                  <option value={5}>5 Free Trial Exams</option>
                </select>
              </div>

              {/* 6. Anti-Bot Captcha Shield */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Anti-Bot Captcha Challenge
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Require Cloudflare Turnstile / Captcha validation before initiating MoMo payment push.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.captchaOnGuestCheckout ?? false}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, captchaOnGuestCheckout: e.target.checked });
                      showToast(`Guest Captcha ${e.target.checked ? 'ACTIVATED' : 'DEACTIVATED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#f59e0b' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Mitigates high-frequency SMS spam and fraudulent push requests.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-SECTION 2: STUDENT ── */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeSubSection === 'student' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <GraduationCap size={18} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                {isRw ? 'Uburyo bw’Igenzura ry’Abanyeshuri n’Ibizamini' : 'Candidate Learning & Examination Policies'}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* 1. Strict Fullscreen Exam Lockdown */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Strict Fullscreen Exam Lockdown
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Enforces fullscreen mode; auto-freezes session if candidate switches browser tabs.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.strictDeviceLockdown ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, strictDeviceLockdown: e.target.checked });
                      showToast(`Fullscreen Lockdown ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#ef4444' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Guarantees proctoring integrity and prevents online answer lookup during mock tests.
                </div>
              </div>

              {/* 2. Audio Question Narration */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Multilingual Voice Readout (TTS)
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Speaks questions and answer options aloud in natural Kinyarwanda and French.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.studentAudioNarration ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, studentAudioNarration: e.target.checked });
                      showToast(`Audio Question Narration ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Critical accessibility feature for candidates with reading difficulties.
                </div>
              </div>

              {/* 3. Instant Answer Explanations */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Instant Practice Feedback
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Reveals official traffic code reasoning immediately upon choosing an answer.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.studentInstantFeedback ?? false}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, studentInstantFeedback: e.target.checked });
                      showToast(`Instant Feedback ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0284c7' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Off by default for exam simulation mode; recommended for tutor study mode.
                </div>
              </div>

              {/* 4. Offline PWA Exam Caching */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Offline PWA Network Resilience
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Caches 20 active exam questions locally so cellular drops do not abort active tests.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.studentOfflinePwaMode ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, studentOfflinePwaMode: e.target.checked });
                      showToast(`Offline PWA Mode ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0284c7' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Syncs results automatically as soon as internet connection is restored.
                </div>
              </div>

              {/* 5. Exam Retake Cooldown Delay */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    Failed Exam Retake Cooldown
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                    Enforces study pause between consecutive failed exam attempts to prevent guessing.
                  </div>
                </div>
                <select
                  value={platformConfig.studentRetakeCooldownMinutes ?? 15}
                  onChange={(e) => {
                    setPlatformConfig({ ...platformConfig, studentRetakeCooldownMinutes: Number(e.target.value) });
                    showToast(`Retake cooldown set to ${e.target.value} minutes`, 'info');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value={0}>0 min (Immediate Retake Allowed)</option>
                  <option value={5}>5 minutes cooldown</option>
                  <option value={15}>15 minutes cooldown (Recommended)</option>
                  <option value={30}>30 minutes cooldown</option>
                </select>
              </div>

              {/* 6. Passing Score Benchmark */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    Official Exam Passing Mark
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                    Minimum score required to qualify for certificate and pass verification.
                  </div>
                </div>
                <select
                  value={platformConfig.studentPassingScorePercent ?? 80}
                  onChange={(e) => {
                    setPlatformConfig({ ...platformConfig, studentPassingScorePercent: Number(e.target.value) });
                    showToast(`Passing mark set to ${e.target.value}%`, 'info');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value={70}>70% (14 out of 20)</option>
                  <option value={75}>75% (15 out of 20)</option>
                  <option value={80}>80% (16 out of 20 - Rwanda Police Standard)</option>
                  <option value={85}>85% (17 out of 20)</option>
                  <option value={90}>90% (18 out of 20)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-SECTION 3: TUTORS ── */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeSubSection === 'tutors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Users size={18} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                {isRw ? 'Uburyo bw’Igenzura ry’Abarimu n’Inyigisho' : 'Instructor & Academic Operations Controls'}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* 1. Live WebRTC Virtual Classroom */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      WebRTC Live Virtual Classrooms
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Permit driving theory instructors to broadcast live video lectures and screen shares.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.tutorLiveClassWebRtc ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, tutorLiveClassWebRtc: e.target.checked });
                      showToast(`Virtual Classrooms ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0284c7' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Integrated with Canvas LMS module and attendance recording.
                </div>
              </div>

              {/* 2. QR Attendance Scanner */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      QR Attendance Ticket Scanner
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Allows practical driving instructors to scan student digital passes before lesson start.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.tutorQrAttendanceScan ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, tutorQrAttendanceScan: e.target.checked });
                      showToast(`QR Scanner ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Instantly prevents proxy attendance and validates session eligibility.
                </div>
              </div>

              {/* 3. Practical Driving GPS Logger */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Fleet GPS & Route Telematics
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Records driving lesson duration, speed, and hill start / parking maneuver checkpoints.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.tutorGpsRouteTracking ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, tutorGpsRouteTracking: e.target.checked });
                      showToast(`Fleet GPS Tracking ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0284c7' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Monitors instructor compliance and car utilization in Kigali circuits.
                </div>
              </div>

              {/* 4. Tutor-Student Direct Chat */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      In-App Cohort Messaging
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Enable moderated direct communication between students and assigned cohort tutors.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.tutorDirectMessaging ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, tutorDirectMessaging: e.target.checked });
                      showToast(`Tutor Messaging ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0284c7' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Conversations are archived and visible to training supervisors.
                </div>
              </div>

              {/* 5. Intelligent Instructor Auto-Dispatch */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Automated Instructor Dispatch
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Automatically assigns available driving instructors to student bookings based on car gear.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.tutorAutoDispatch ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, tutorAutoDispatch: e.target.checked });
                      showToast(`Auto-Dispatch ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Optimizes daily driving schedule without manual admin intervention.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-SECTION 4: ADMINS ── */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeSubSection === 'admins' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <ShieldCheck size={18} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                {isRw ? 'Igenzura ry’Umutekano n’Ubuyobozi Bukuru' : 'Administrative Governance & Risk Controls'}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* 1. Sandbox Simulation Mode */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: `1px solid ${platformConfig.sandboxSimulation ? 'rgba(56, 189, 248, 0.5)' : 'var(--border-subtle)'}`,
                  background: platformConfig.sandboxSimulation ? 'rgba(56, 189, 248, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Sandbox Simulation Mode
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Simulate MoMo push payments and test mock exams without charging real balances.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.sandboxSimulation}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, sandboxSimulation: e.target.checked });
                      showToast(
                        e.target.checked ? 'Sandbox Simulation mode ON' : 'Live Gateway mode ON',
                        'info'
                      );
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#38bdf8' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Safe staging environment for QA testing and admin training.
                </div>
              </div>

              {/* 2. Read-Only Mode */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: `1px solid ${platformConfig.readOnlyMode ? 'rgba(245, 158, 11, 0.5)' : 'var(--border-subtle)'}`,
                  background: platformConfig.readOnlyMode ? 'rgba(245, 158, 11, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Read-Only Database Lock
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Freezes financial balance deductions, enrollment changes, and grade submissions.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.readOnlyMode}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, readOnlyMode: e.target.checked });
                      showToast(
                        e.target.checked ? 'Read-Only Mode ENABLED' : 'Read-Only Mode DISABLED',
                        e.target.checked ? 'info' : 'success'
                      );
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#f59e0b' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Use during official accounting reconciliation or database snapshots.
                </div>
              </div>

              {/* 3. Canary Traffic Allocation */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Canary Beta Rollout Allocation
                    </div>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#38bdf8' }}>
                      {platformConfig.betaTestingCohortPercentage}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginBottom: '10px' }}>
                    Percentage of live candidate traffic routed through experimental features.
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={platformConfig.betaTestingCohortPercentage}
                    onChange={(e) =>
                      setPlatformConfig({
                        ...platformConfig,
                        betaTestingCohortPercentage: Number(e.target.value),
                      })
                    }
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#38bdf8' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: '4px' }}>
                    <span>0% (Staff Only)</span>
                    <span>25% (Standard)</span>
                    <span>100% (All)</span>
                  </div>
                </div>
              </div>

              {/* 4. Verbose Telemetry & Security Stream */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Verbose Security Telemetry
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Log real-time browser fingerprints, auth token exchanges, and IP changes in audit ledger.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.debugTelemetry}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, debugTelemetry: e.target.checked });
                      showToast(`Verbose Telemetry ${e.target.checked ? 'ON' : 'OFF'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Provides high-resolution diagnostics for exam integrity reviews.
                </div>
              </div>

              {/* 5. Enforce 2FA for Administrators */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Mandatory 2FA for Staff
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Require SMS OTP or authenticator app verification for all admin and tutor logins.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.adminTwoFactorRequired ?? false}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, adminTwoFactorRequired: e.target.checked });
                      showToast(`Staff 2FA requirement ${e.target.checked ? 'ENFORCED' : 'OPTIONAL'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#38bdf8' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Prevents compromised staff credentials from risking system data.
                </div>
              </div>

              {/* 6. Audit Log Retention */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    Audit Ledger Retention Period
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                    Duration before historical proctoring snapshots and access logs are archived.
                  </div>
                </div>
                <select
                  value={platformConfig.adminAuditLogRetentionDays ?? 90}
                  onChange={(e) => {
                    setPlatformConfig({ ...platformConfig, adminAuditLogRetentionDays: Number(e.target.value) });
                    showToast(`Audit log retention set to ${e.target.value} days`, 'info');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value={30}>30 Days (Fast rotation)</option>
                  <option value={90}>90 Days (Recommended)</option>
                  <option value={180}>180 Days (Semi-annual)</option>
                  <option value={365}>365 Days (1 Year Compliance)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-SECTION 5: GENERAL ── */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeSubSection === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Settings2 size={18} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                {isRw ? 'Uburyo Rusange bwa Sisitemu n’Ivugurura' : 'Core Infrastructure & Master Platform Switches'}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* 1. Maintenance Mode Master Switch */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: `1px solid ${platformConfig.maintenanceMode ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-subtle)'}`,
                  background: platformConfig.maintenanceMode ? 'rgba(239, 68, 68, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Maintenance Mode Master Switch
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Blocks public access and displays upgrade banner across the platform.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.maintenanceMode}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, maintenanceMode: e.target.checked });
                      showToast(
                        e.target.checked ? 'Maintenance Mode ACTIVATED' : 'Maintenance Mode DEACTIVATED',
                        e.target.checked ? 'error' : 'success'
                      );
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#ef4444' }}
                  />
                </div>
                {platformConfig.maintenanceMode && (
                  <div style={{ fontSize: '0.75rem', color: '#fca5a5', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '6px' }}>
                    ⚠️ Active: Non-administrators will see the maintenance landing screen.
                  </div>
                )}
              </div>

              {/* 2. Rate Limiting Shield */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    Anti-Abuse Rate Limiting Tier
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                    Protects API, USSD webhooks, and OTP endpoints from abuse.
                  </div>
                </div>
                <select
                  value={platformConfig.rateLimitingTier}
                  onChange={(e) => {
                    setPlatformConfig({ ...platformConfig, rateLimitingTier: e.target.value as any });
                    showToast(`Rate limiting tier updated to ${e.target.value}`, 'info');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="STANDARD">Standard (120 req/min, burst tolerant)</option>
                  <option value="AGGRESSIVE">Aggressive (Anti-DDoS, 30 req/min per IP)</option>
                  <option value="RELAXED">Relaxed (Unlimited for internal staff debugging)</option>
                </select>
              </div>

              {/* 3. AI Proctoring Strictness Tier */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    AI Proctoring Biometric Strictness
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                    Determines facial recognition tolerance and gaze deviation rules.
                  </div>
                </div>
                <select
                  value={platformConfig.aiProctoringStrictness}
                  onChange={(e) => {
                    setPlatformConfig({ ...platformConfig, aiProctoringStrictness: e.target.value as any });
                    showToast(`AI Proctoring strictness updated to ${e.target.value}`, 'info');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="LENIENT">Lenient (Snapshot capture only, zero auto-pause)</option>
                  <option value="MODERATE">Moderate (Face pose tracking + tab switch alerts)</option>
                  <option value="STRICT">Strict (Zero tolerance: auto-freeze on 2 violations)</option>
                </select>
              </div>

              {/* 4. SMS Notification Gateway */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      SMS Gateway Master Gate
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Master switch for dispatching SMS payment receipts, OTPs, and schedule alerts.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.smsGatewayEnabled ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, smsGatewayEnabled: e.target.checked });
                      showToast(`SMS Gateway ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  When disabled, OTP codes are logged to console without cellular charges.
                </div>
              </div>

              {/* 5. Platform Default Language */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    Platform Default Language
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                    Default interface language presented to new visitors before preference selection.
                  </div>
                </div>
                <select
                  value={platformConfig.defaultLanguage ?? 'rw'}
                  onChange={(e) => {
                    setPlatformConfig({ ...platformConfig, defaultLanguage: e.target.value as any });
                    showToast(`Default language set to ${e.target.value.toUpperCase()}`, 'info');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="rw">Kinyarwanda (Ikinyarwanda - Default)</option>
                  <option value="en">English (Official Business)</option>
                </select>
              </div>

              {/* 6. Maintenance Announcement Text */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    Maintenance Announcement Notice
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px', marginBottom: '8px' }}>
                    Custom message displayed to candidates on the maintenance screen.
                  </div>
                  <input
                    type="text"
                    value={platformConfig.maintenanceMessage}
                    onChange={(e) =>
                      setPlatformConfig({ ...platformConfig, maintenanceMessage: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* ── FEATURE FLAGS DIRECTORY & SIMULATOR FOR CURRENT SUB-SECTION ── */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FlaskConical size={18} color="#38bdf8" />
              <span>
                {isRw
                  ? `Ibikoresho n’Ibiranga Urubuga: ${currentSection.labelRw}`
                  : `${currentSection.label} Feature Flags & Runtime Switches`}
              </span>
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Showing {filteredFlags.length} managed flags in this scope
            </span>
          </div>

          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '11px' }} />
              <input
                type="text"
                placeholder="Search feature flags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'All' },
                { key: 'beta', label: 'Beta Labs' },
                { key: 'examinations', label: 'Exams' },
                { key: 'payments', label: 'Payments' },
                { key: 'lms', label: 'LMS' },
                { key: 'security', label: 'Security' },
              ].map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: selectedCategory === cat.key ? '#0284c7' : 'rgba(255, 255, 255, 0.04)',
                    color: selectedCategory === cat.key ? '#ffffff' : '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: selectedCategory === cat.key ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        {filteredFlags.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '32px',
              textAlign: 'center',
              borderRadius: '12px',
              border: '1px dashed var(--border-subtle)',
              color: '#94a3b8',
              fontSize: '0.86rem',
            }}
          >
            No feature flags found matching the criteria in {currentSection.label}.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            {filteredFlags.map((flag) => {
              const statusStyle = getStatusBadgeColor(flag.status);
              const riskStyle = getRiskBadgeColor(flag.riskLevel);

              return (
                <div
                  key={flag.id}
                  className="glass-panel"
                  style={{
                    padding: '18px',
                    borderRadius: '12px',
                    border: flag.isEnabled ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid var(--border-subtle)',
                    background: flag.isEnabled ? 'rgba(2, 132, 199, 0.03)' : 'rgba(255, 255, 255, 0.015)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    {/* Header Badges & Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text,
                            border: `1px solid ${statusStyle.border}`,
                          }}
                        >
                          {flag.status}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: riskStyle.bg,
                            color: riskStyle.text,
                          }}
                        >
                          {flag.riskLevel}
                        </span>
                        {flag.scope && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(56, 189, 248, 0.1)',
                              color: '#38bdf8',
                              textTransform: 'uppercase',
                            }}
                          >
                            {flag.scope}
                          </span>
                        )}
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                          {flag.version}
                        </span>
                      </div>

                      {/* Enable / Disable Switch */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: flag.isEnabled ? '#34d399' : '#64748b' }}>
                          {flag.isEnabled ? 'ON' : 'OFF'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleFlag(flag.id)}
                          aria-label={`Toggle ${flag.name}`}
                          style={{
                            width: '42px',
                            height: '22px',
                            borderRadius: '999px',
                            border: 'none',
                            backgroundColor: flag.isEnabled ? '#0284c7' : '#334155',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                            padding: 0,
                          }}
                        >
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              backgroundColor: '#ffffff',
                              position: 'absolute',
                              top: '3px',
                              left: flag.isEnabled ? '23px' : '3px',
                              transition: 'left 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            }}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 style={{ margin: '0 0 3px 0', fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                      {flag.name}
                    </h4>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '6px' }}>
                      {flag.id}
                    </div>

                    {/* Description */}
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>
                      {isRw && flag.descriptionKinyarwanda ? flag.descriptionKinyarwanda : flag.description}
                    </p>
                  </div>

                  {/* Footer Controls: Audience & Simulator */}
                  <div
                    style={{
                      paddingTop: '10px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Audience:</span>
                      <select
                        value={flag.targetAudience}
                        onChange={(e) => updateAudience(flag.id, e.target.value as any)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-subtle)',
                          color: '#cbd5e1',
                          fontSize: '0.74rem',
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="ALL">All Users</option>
                        <option value="BETA_TESTERS">Beta Cohort Only</option>
                        <option value="STAFF_ONLY">Internal Staff Only</option>
                        <option value="DISABLED">Completely Disabled</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartSimulation(flag)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(2, 132, 199, 0.1)',
                        border: '1px solid rgba(2, 132, 199, 0.25)',
                        color: '#38bdf8',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <Play size={12} />
                      Test in Sandbox
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── INTERACTIVE SANDBOX SIMULATION MODAL ── */}
      {simulatingFlag && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '640px',
              borderRadius: '16px',
              border: '1px solid rgba(2, 132, 199, 0.4)',
              background: '#090d16',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={18} color="#38bdf8" />
                <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#ffffff' }}>
                  Sandbox Simulator: {simulatingFlag.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSimulatingFlag(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                  }}
                >
                  RELEASE: {simulatingFlag.version}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  Target: <strong>{simulatingFlag.targetAudience}</strong>
                </span>
                {isSimulating && (
                  <span style={{ fontSize: '0.78rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Activity size={12} className="animate-spin" /> Running harness...
                  </span>
                )}
              </div>

              {/* Terminal Screen */}
              <div
                style={{
                  backgroundColor: '#030712',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '16px',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  color: '#38bdf8',
                  minHeight: '170px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                {simulationLogs.map((log, index) => (
                  <div key={index} style={{ color: log.includes('SUCCESS') ? '#34d399' : log.includes('RUNNING') ? '#fbbf24' : '#cbd5e1' }}>
                    {log}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '14px', fontSize: '0.76rem', color: '#94a3b8' }}>
                Harness executes in an isolated worker, verifying security permissions and sandbox fallback behavior.
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                type="button"
                onClick={() => setSimulatingFlag(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close Simulator
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Pop-out Alert Modal for Toggling Background Feature ── */}
      {pendingToggleState !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: 'rgba(15, 23, 42, 0.70)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCancelToggle();
          }}
        >
          <div
            style={{
              backgroundColor: isDark ? '#111827' : '#ffffff',
              color: isDark ? '#f8fafc' : '#0f172a',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0',
              borderRadius: '24px',
              maxWidth: '440px',
              width: '100%',
              padding: '32px 28px',
              boxShadow: isDark
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCancelToggle}
              aria-label="Close dialog"
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                color: isDark ? '#94a3b8' : '#64748b',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>

            {/* Warning Icon Badge */}
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '18px',
                margin: '0 auto 18px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: pendingToggleState
                  ? (isDark ? 'rgba(2, 132, 199, 0.18)' : '#e0f2fe')
                  : (isDark ? 'rgba(239, 68, 68, 0.18)' : '#fee2e2'),
                border: pendingToggleState
                  ? (isDark ? '1px solid rgba(2, 132, 199, 0.35)' : '1px solid #7dd3fc')
                  : (isDark ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid #fca5a5'),
              }}
            >
              <AlertCircle
                size={32}
                color={pendingToggleState ? (isDark ? '#38bdf8' : '#0284c7') : (isDark ? '#f87171' : '#dc2626')}
              />
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: '1.28rem',
                fontWeight: 800,
                color: isDark ? '#ffffff' : '#0f172a',
                margin: '0 0 10px 0',
                letterSpacing: '-0.01em',
              }}
            >
              {pendingToggleState
                ? (isRw ? "Gufungura Ifoto y'Inyuma?" : 'Enable Background Image?')
                : (isRw ? "Gufunga Ifoto y'Inyuma?" : 'Disable Background Image?')}
            </h3>

            {/* Description */}
            <p
              style={{
                fontSize: '0.9rem',
                color: isDark ? '#94a3b8' : '#334155',
                lineHeight: 1.55,
                margin: '0 0 24px 0',
                fontWeight: 500,
              }}
            >
              {pendingToggleState
                ? (isRw
                    ? "Ibi biratuma ifoto nshya y'inyuma igaragara kuri paji z'Intangiriro n'Ibiciro ku banyeshuri n'abashyitsi bose."
                    : 'This will display the custom background image on the public Home and Pricing pages for all visitors and students.')
                : (isRw
                    ? "Ibi birahisha ifoto y'inyuma, paji z'Intangiriro n'Ibiciro zisubire ku buryo busanzwe."
                    : 'This will hide the background image, returning the public Home and Pricing pages to their default look.')}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={handleCancelToggle}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: '12px',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid #cbd5e1',
                  color: isDark ? '#e2e8f0' : '#0f172a',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {isRw ? 'Hagarika' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleConfirmToggle}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: pendingToggleState ? '#0284c7' : '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: pendingToggleState
                    ? '0 4px 14px rgba(2, 132, 199, 0.35)'
                    : '0 4px 14px rgba(239, 68, 68, 0.35)',
                  transition: 'transform 0.15s ease, opacity 0.15s ease',
                }}
              >
                {pendingToggleState
                  ? (isRw ? 'Fungura' : 'Enable')
                  : (isRw ? 'Funga' : 'Disable')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Maintenance Mode Alert Modal for Home Tab ── */}
      {isHomeAlertOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: 'rgba(0, 0, 0, 0.70)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsHomeAlertOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: isDark ? '#18181b' : '#ffffff',
              color: isDark ? '#f4f4f5' : '#18181b',
              border: isDark ? '1px solid #27272a' : '1px solid #e4e4e7',
              borderRadius: '10px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                margin: '0 0 10px 0',
                color: isDark ? '#ffffff' : '#09090b',
              }}
            >
              {isRw ? "Gufunga Intangiriro" : "Disable Home Page"}
            </h3>

            <p
              style={{
                fontSize: '0.85rem',
                lineHeight: 1.5,
                margin: '0 0 20px 0',
                color: isDark ? '#a1a1aa' : '#52525b',
              }}
            >
              {isRw
                ? "Intangiriro ni paji rusange y'abashyitsi bose. Kuyifunga bivuze ko urubuga ruri mu mirimo yo kuvugurura. Numara kubyemeza, hazatangira umunota umwe wo kubara mbere y'uko impinduka zishyirwa mu bikorwa."
                : "Home is the public landing page for visitors. Disabling it means the website is under maintenance. If confirmed, a 1-minute countdown will begin before the change takes effect."}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsHomeAlertOpen(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  border: isDark ? '1px solid #3f3f46' : '1px solid #d4d4d8',
                  color: isDark ? '#f4f4f5' : '#18181b',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {isRw ? "Hagarika" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleConfirmHomeDisable}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isDark ? '#f4f4f5' : '#18181b',
                  color: isDark ? '#18181b' : '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isRw ? "Emeza" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Manage Booking Form Fields Modal ── */}
      {isManageFieldsModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsManageFieldsModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              color: isDark ? '#f1f5f9' : '#0f172a',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.8)' : '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)',
                    color: isDark ? '#38bdf8' : '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                    {isRw ? 'Gucunga Imyanya ya Buri Serivisi' : 'Manage Service Booking Fields'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManageFieldsModalOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
                  color: isDark ? '#cbd5e1' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Service Switcher Tabs */}
            <div
              style={{
                padding: '12px 24px 10px 24px',
                borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                background: isDark ? 'rgba(0, 0, 0, 0.25)' : '#f8fafc',
              }}
            >
              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: isDark ? '#94a3b8' : '#64748b',
                  marginBottom: '8px',
                }}
              >
                {isRw ? 'Hitamo Serivisi wo gucungira imyanya:' : 'Select Service to Configure Fields:'}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  scrollbarWidth: 'thin',
                }}
              >
                {currentServiceOptions.map((srv) => {
                  const sKey = srv.key || srv.id;
                  const isSelected = sKey === selectedManageServiceKey;
                  const srvLabel = isRw ? (srv.labelRw || srv.label) : srv.label;
                  const count = (srv.fields && Array.isArray(srv.fields))
                    ? srv.fields.length
                    : (currentBookingForm.serviceFieldsMap?.[sKey]?.length ?? (DEFAULT_SERVICE_FIELDS[sKey]?.length ?? ALL_BOOKING_FIELD_KEYS.length));

                  return (
                    <button
                      key={sKey}
                      type="button"
                      onClick={() => setActiveManageServiceKey(sKey)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: isSelected
                          ? (isDark ? '1px solid #38bdf8' : '1px solid #0284c7')
                          : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1'),
                        background: isSelected
                          ? (isDark ? 'rgba(56, 189, 248, 0.18)' : '#0284c7')
                          : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff'),
                        color: isSelected
                          ? (isDark ? '#38bdf8' : '#ffffff')
                          : (isDark ? '#cbd5e1' : '#475569'),
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{srvLabel}</span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          background: isSelected
                            ? (isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.25)')
                            : (isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'),
                          color: isSelected ? (isDark ? '#e0f2fe' : '#ffffff') : (isDark ? '#94a3b8' : '#64748b'),
                          fontWeight: 700,
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 24px',
                background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
                borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0',
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569' }}>
                {activeServiceFields.length} / {ALL_BOOKING_FIELD_KEYS.length}{' '}
                {isRw ? 'yemejwe kuri iyi serivisi' : 'fields active (ordered 1 to last)'}
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleSetAllServiceFields(selectedManageServiceKey, true)}
                  style={{
                    padding: '4px 9px',
                    borderRadius: '6px',
                    border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #bae6fd',
                    background: isDark ? 'rgba(56, 189, 248, 0.1)' : '#f0f9ff',
                    color: isDark ? '#38bdf8' : '#0284c7',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isRw ? 'Fungura Byose' : 'Enable All'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAllServiceFields(selectedManageServiceKey, false)}
                  style={{
                    padding: '4px 9px',
                    borderRadius: '6px',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
                    color: isDark ? '#94a3b8' : '#64748b',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isRw ? 'Funga Byose' : 'Disable All'}
                </button>
                <button
                  type="button"
                  onClick={() => handleResetServiceFields(selectedManageServiceKey)}
                  style={{
                    padding: '4px 9px',
                    borderRadius: '6px',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
                    color: isDark ? '#94a3b8' : '#64748b',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isRw ? 'Kugarura Ibifite' : 'Reset'}
                </button>
              </div>
            </div>

            {/* Fields List (Scrollable) */}
            <div
              style={{
                padding: '16px 24px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                flex: 1,
              }}
            >
              {activeServiceFields.length === 0 ? (
                <div
                  style={{
                    padding: '24px 16px',
                    textAlign: 'center',
                    color: isDark ? '#94a3b8' : '#64748b',
                    fontSize: '0.84rem',
                    background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
                    borderRadius: '10px',
                    border: isDark ? '1px dashed rgba(255, 255, 255, 0.1)' : '1px dashed #cbd5e1',
                  }}
                >
                  {isRw
                    ? 'Nta myanya iratoranywa kuri iyi serivisi. Kanda ku myanya yo hasi kugira ngo uyongereho.'
                    : 'No fields active for this service. Click any inactive field below to add it.'}
                </div>
              ) : (
                activeServiceFields.map((fieldKey, idx) => {
                  const def = BOOKING_FIELD_DEFINITIONS[fieldKey];
                  const fieldLabel = def ? (isRw ? def.labelRw : def.labelEn) : fieldKey;

                  return (
                    <div
                      key={fieldKey}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: isDark ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid #bae6fd',
                        background: isDark ? 'rgba(56, 189, 248, 0.05)' : '#f0f9ff',
                        gap: '12px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: isDark ? 'rgba(56, 189, 248, 0.2)' : '#0284c7',
                            color: isDark ? '#38bdf8' : '#ffffff',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          #{idx + 1}
                        </span>
                        <span
                          style={{
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            color: isDark ? '#ffffff' : '#0f172a',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {fieldLabel}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {/* Move Up Button */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveServiceField(selectedManageServiceKey, idx, 'up')}
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
                            background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                            color: idx === 0 ? (isDark ? '#475569' : '#cbd5e1') : (isDark ? '#cbd5e1' : '#334155'),
                            cursor: idx === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                          }}
                          title={isRw ? 'Kwerekeza hejuru' : 'Move Earlier'}
                        >
                          <ChevronUp size={14} />
                        </button>

                        {/* Move Down Button */}
                        <button
                          type="button"
                          disabled={idx === activeServiceFields.length - 1}
                          onClick={() => handleMoveServiceField(selectedManageServiceKey, idx, 'down')}
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
                            background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                            color: idx === activeServiceFields.length - 1 ? (isDark ? '#475569' : '#cbd5e1') : (isDark ? '#cbd5e1' : '#334155'),
                            cursor: idx === activeServiceFields.length - 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                          }}
                          title={isRw ? 'Kwerekeza hasi' : 'Move Later'}
                        >
                          <ChevronDown size={14} />
                        </button>

                        {/* Toggle Pill */}
                        <div
                          onClick={() => handleToggleServiceField(selectedManageServiceKey, fieldKey)}
                          style={{
                            width: '38px',
                            height: '20px',
                            borderRadius: '10px',
                            background: '#0284c7',
                            position: 'relative',
                            transition: 'background 0.2s ease',
                            cursor: 'pointer',
                            marginLeft: '4px',
                          }}
                          title={isRw ? 'Funga uyu mwanya' : 'Deactivate field'}
                        >
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: '#ffffff',
                              position: 'absolute',
                              top: '2px',
                              left: '20px',
                              transition: 'left 0.2s ease',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Inactive Fields Section */}
              {inactiveServiceFields.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: isDark ? '#64748b' : '#94a3b8',
                      marginBottom: '8px',
                    }}
                  >
                    {isRw ? 'Imyanya Idakoreshwa (Kanda kugira ngo uyongereho)' : 'Inactive Fields (Click to activate)'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {inactiveServiceFields.map((fieldKey) => {
                      const def = BOOKING_FIELD_DEFINITIONS[fieldKey];
                      const fieldLabel = def ? (isRw ? def.labelRw : def.labelEn) : fieldKey;

                      return (
                        <div
                          key={fieldKey}
                          onClick={() => handleToggleServiceField(selectedManageServiceKey, fieldKey)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '9px 14px',
                            borderRadius: '10px',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0',
                            background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          title={isRw ? 'Ongeraho uyu mwanya' : 'Activate field for this service'}
                        >
                          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: isDark ? '#64748b' : '#94a3b8' }}>
                            {fieldLabel}
                          </span>
                          <div
                            style={{
                              width: '38px',
                              height: '20px',
                              borderRadius: '10px',
                              background: isDark ? '#334155' : '#cbd5e1',
                              position: 'relative',
                              transition: 'background 0.2s ease',
                              flexShrink: 0,
                            }}
                          >
                            <div
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: '#ffffff',
                                position: 'absolute',
                                top: '2px',
                                left: '2px',
                                transition: 'left 0.2s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: '14px 24px',
                borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                background: isDark ? 'rgba(0, 0, 0, 0.2)' : '#f8fafc',
              }}
            >
              <button
                type="button"
                onClick={() => setIsManageFieldsModalOpen(false)}
                className="btn btn-primary"
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  padding: '7px 18px',
                  borderRadius: '8px',
                }}
              >
                {isRw ? 'Bika & Funga' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

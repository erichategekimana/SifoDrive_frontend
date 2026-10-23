import { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import type {
  SettingsTab,
  SubscriptionPlan,
  PricingSettings,
  GuestTrialConfig,
  OperationalRules,
  NotificationSettings,
  AcademyProfile,
  PlatformFeatureFlag,
  PlatformEnvironmentConfig,
  PublicBackgroundConfig,
} from '../types';

export const DEFAULT_PUBLIC_BG_URL = '/default-public-bg.jpg';

export const DEFAULT_PUBLIC_BACKGROUND: PublicBackgroundConfig = {
  enabled: false,
  imageDataUrl: DEFAULT_PUBLIC_BG_URL,
  imageFileName: 'Highway Landscape (Default)',
  lightImageOpacity: 0.20,
  lightGradientOpacity: 0.85,
  darkImageOpacity: 0.15,
  darkGradientOpacity: 0.70,
};

export const DEFAULT_PLATFORM_CONFIG: PlatformEnvironmentConfig = {
  maintenanceMode: false,
  maintenanceMessage: 'Sifo Drive is currently performing scheduled system upgrades. Regular services will resume shortly.',
  maintenanceMessageKinyarwanda: 'Sifo Drive iri gukora ivugurura rya sisitemu ryo kwagura serivisi. Serivisi zisanzwe zirasubukurwa mu mwanya muto.',
  readOnlyMode: false,
  sandboxSimulation: false,
  debugTelemetry: true,
  strictDeviceLockdown: true,
  aiProctoringStrictness: 'MODERATE',
  rateLimitingTier: 'STANDARD',
  betaTestingCohortPercentage: 25,

  // Public Sub-section Settings
  allowPublicGuestCheckout: true,
  publicCatalogVisible: true,
  publicSelfRegistration: true,
  publicSignsFreeAccess: true,
  guestTrialExamCount: 2,
  captchaOnGuestCheckout: false,
  publicBackground: DEFAULT_PUBLIC_BACKGROUND,

  // Student Sub-section Settings
  studentAudioNarration: true,
  studentInstantFeedback: false,
  studentOfflinePwaMode: true,
  studentRetakeCooldownMinutes: 15,
  studentPassingScorePercent: 80,

  // Tutor Sub-section Settings
  tutorLiveClassWebRtc: true,
  tutorQrAttendanceScan: true,
  tutorGpsRouteTracking: true,
  tutorDirectMessaging: true,
  tutorAutoDispatch: true,

  // Admin Sub-section Settings
  adminTwoFactorRequired: false,
  adminAuditLogRetentionDays: 90,
  adminConcurrentSessionLimit: 2,

  // General Sub-section Settings
  defaultLanguage: 'rw',
  smsGatewayEnabled: true,
};

export const DEFAULT_FEATURE_FLAGS: PlatformFeatureFlag[] = [
  {
    id: 'exam_fullscreen_lockdown',
    name: 'Fullscreen & Anti-Cheating Exam Lockdown',
    nameKinyarwanda: 'Gufunga ikizamini muri Ecran Yuzuye no kubuza gushukana',
    category: 'examinations',
    scope: 'student',
    description: 'Enforces fullscreen browser mode during practice and official exams. Automatically flags and limits tab switches.',
    descriptionKinyarwanda: 'Gutegeka gukorera ikizamini muri ecran yuzuye no kubuza gufungura andi mafishi mu gihe cyo gukora ikizamini.',
    isEnabled: true,
    status: 'STABLE',
    targetAudience: 'ALL',
    riskLevel: 'LOW',
    version: 'v2.4.0',
    lastToggledAt: '2026-10-23T08:00:00Z',
    toggledBy: 'System Administrator',
  },
  {
    id: 'ai_automated_proctoring',
    name: 'AI Automated Proctoring & Face Liveness',
    nameKinyarwanda: 'Ikoranabuhanga rya AI rigenzura isura n’umwirondoro w’ukora ikizamini',
    category: 'examinations',
    scope: 'student',
    description: 'Runs real-time webcam face tracking and periodic snapshot telemetry to guarantee the identity of the examination candidate.',
    descriptionKinyarwanda: 'Kugenzura isura y’umukandida mu gihe akora ikizamini hifashishijwe kamera ya mudasobwa.',
    isEnabled: true,
    status: 'BETA',
    targetAudience: 'ALL',
    riskLevel: 'MEDIUM',
    version: 'v2.6.0-beta',
    lastToggledAt: '2026-10-23T08:00:00Z',
    toggledBy: 'System Administrator',
  },
  {
    id: 'exam_audio_readout',
    name: 'Multilingual Audio Question Readout (Accessibility)',
    nameKinyarwanda: 'Gusoma ibibazo mu majwi mu Kinyarwanda no mu Gifaransa',
    category: 'examinations',
    scope: 'student',
    description: 'Provides native voice narration of questions and answers in Kinyarwanda and French for non-literate candidates.',
    descriptionKinyarwanda: 'Gutega amatwi ibibazo n’ibisubizo bisomwa mu majwi meza ku batabasha gusoma neza.',
    isEnabled: true,
    status: 'BETA',
    targetAudience: 'BETA_TESTERS',
    riskLevel: 'LOW',
    version: 'v2.5.2',
    lastToggledAt: '2026-10-22T19:00:00Z',
    toggledBy: 'System Administrator',
  },
  {
    id: 'exam_adaptive_irt',
    name: 'Adaptive Exam Question Difficulty (IRT Scoring Engine)',
    nameKinyarwanda: 'Kugena ubukana bw’ibibazo hagendewe ku bushobozi bw’umunyeshuri (IRT)',
    category: 'experimental',
    scope: 'student',
    description: 'Dynamically selects next questions based on candidate response patterns using Item Response Theory psychometrics.',
    descriptionKinyarwanda: 'Guhindura urwego rw’ibibazo bikurikira hagendewe ku buryo umukandida asubiza ibibazo bibanza.',
    isEnabled: false,
    status: 'ALPHA',
    targetAudience: 'STAFF_ONLY',
    riskLevel: 'HIGH',
    version: 'v3.0.0-alpha',
    lastToggledAt: '2026-10-20T12:00:00Z',
    toggledBy: 'Lead Architect',
  },
  {
    id: 'momo_automated_webhooks',
    name: 'Instant MTN MoMo & Airtel Money Webhooks',
    nameKinyarwanda: 'Kwakira no kwemeza ubwishyu bwa MoMo ako kanya',
    category: 'payments',
    scope: 'public',
    description: 'Instant auto-credit reconciliation when candidates pay for exam packages via Mobile Money USSD push.',
    descriptionKinyarwanda: 'Kongera ibizamini ako kanya mu gihe umunyeshuri amaze kwishyura akoresheje MTN MoMo cyangwa Airtel.',
    isEnabled: true,
    status: 'STABLE',
    targetAudience: 'ALL',
    riskLevel: 'LOW',
    version: 'v2.1.0',
    lastToggledAt: '2026-10-21T10:00:00Z',
    toggledBy: 'System Administrator',
  },
  {
    id: 'guest_one_click_checkout',
    name: 'Guest Pay-As-You-Go Public Checkout',
    nameKinyarwanda: 'Kugura ibizamini byihuse ku bashyitsi badafite konti',
    category: 'payments',
    scope: 'public',
    description: 'Allows unregistered candidates to purchase practice exam bundles with just their Rwandan phone number.',
    descriptionKinyarwanda: 'Kwemerera abantu bose kugura no gukora ibizamini batiriwe bafungura konti yuzuye.',
    isEnabled: true,
    status: 'STABLE',
    targetAudience: 'ALL',
    riskLevel: 'LOW',
    version: 'v2.2.0',
    lastToggledAt: '2026-10-22T14:00:00Z',
    toggledBy: 'System Administrator',
  },
  {
    id: 'webrtc_virtual_classroom',
    name: 'Live Interactive Virtual Classrooms (WebRTC)',
    nameKinyarwanda: 'Ibyumba by’amashuri imbona-nkubone ku murongo (WebRTC)',
    category: 'lms',
    scope: 'tutors',
    description: 'Interactive high-definition live video lectures, whiteboard sharing, and attendance tracking for driving theory classes.',
    descriptionKinyarwanda: 'Gukurikira amasomo y’amategeko y’umuhanda muri videwo imbona-nkubone n’abigisha.',
    isEnabled: true,
    status: 'STABLE',
    targetAudience: 'ALL',
    riskLevel: 'MEDIUM',
    version: 'v2.3.1',
    lastToggledAt: '2026-10-21T16:00:00Z',
    toggledBy: 'System Administrator',
  },
  {
    id: 'ai_traffic_sign_vision',
    name: 'AI Traffic Sign Camera Scanner (Vision Model)',
    nameKinyarwanda: 'Gufata ifoto y’icyapa cyo ku muhanda AI ikagisobanura',
    category: 'experimental',
    scope: 'student',
    description: 'Pre-release feature enabling students to photograph any road sign with their phone camera for instant AI explanation and quiz questions.',
    descriptionKinyarwanda: 'Gufotora icyapa cyo ku muhanda telefone igahita isobanura icyo gisobanura n’amategeko akigenga.',
    isEnabled: true,
    status: 'BETA',
    targetAudience: 'BETA_TESTERS',
    riskLevel: 'LOW',
    version: 'v2.7.0-beta',
    lastToggledAt: '2026-10-23T06:00:00Z',
    toggledBy: 'System Administrator',
  },
  {
    id: 'biometric_nida_verification',
    name: 'Rwanda National ID (NIDA) Digital Verification',
    nameKinyarwanda: 'Guhuza n’ikigo cy’indangamuntu NIDA mu kwemeza umwirondoro',
    category: 'security',
    scope: 'admins',
    description: 'Validates candidate national ID numbers against official identity records before issuing completion certificates.',
    descriptionKinyarwanda: 'Kugenzura nimero y’indangamuntu mbere yo gutanga icyemezo cyo gusoza amasomo.',
    isEnabled: false,
    status: 'ALPHA',
    targetAudience: 'STAFF_ONLY',
    riskLevel: 'HIGH',
    version: 'v1.0.0-rc1',
    lastToggledAt: '2026-10-18T09:00:00Z',
    toggledBy: 'Security Lead',
  },
  {
    id: 'anti_ddos_rate_limiting',
    name: 'Dynamic IP & Phone Rate Limiter Shield',
    nameKinyarwanda: 'Kwirinda ibitero no guhagarika ubutumwa bwinshi budasanzwe',
    category: 'security',
    scope: 'public',
    description: 'Protects MoMo payment requests and SMS OTP endpoints against spamming and brute-force abuse.',
    descriptionKinyarwanda: 'Gukumira abashobora kohereza ubutumwa bwinshi kuri seriveri mu buryo butemewe.',
    isEnabled: true,
    status: 'STABLE',
    targetAudience: 'ALL',
    riskLevel: 'LOW',
    version: 'v2.4.2',
    lastToggledAt: '2026-10-22T08:00:00Z',
    toggledBy: 'System Administrator',
  },
  {
    id: 'fleet_gps_telemetry',
    name: 'Live Training Fleet GPS & OBD-II Telematics',
    nameKinyarwanda: 'Gukurikirana imodoka z’ishuri ziri mu muhanda kuri GPS',
    category: 'core',
    scope: 'tutors',
    description: 'Real-time vehicle location and speed monitoring during practical in-car driving lessons in Kigali.',
    descriptionKinyarwanda: 'Kureba aho imodoka z’ishuri ziherereye mu gihe abanyeshuri bari kwiga gutwara.',
    isEnabled: true,
    status: 'STABLE',
    targetAudience: 'ALL',
    riskLevel: 'LOW',
    version: 'v1.8.0',
    lastToggledAt: '2026-10-19T11:00:00Z',
    toggledBy: 'Operations Lead',
  },
  {
    id: 'crypto_usdt_checkout',
    name: 'Web3 USDT Micro-Payments for Regional Candidates',
    nameKinyarwanda: 'Kwishyura ukoresheje amadolari ya Crypto (USDT)',
    category: 'experimental',
    scope: 'admins',
    description: 'Pre-release checkout adapter allowing regional candidates outside Rwanda to pay with stablecoins.',
    descriptionKinyarwanda: 'Kwemerera abantu baturutse mu bindi bihugu kwishyura ibizamini bakoresheje Crypto.',
    isEnabled: false,
    status: 'EXPERIMENTAL',
    targetAudience: 'DISABLED',
    riskLevel: 'HIGH',
    version: 'v0.9.0-dev',
    lastToggledAt: '2026-10-15T15:00:00Z',
    toggledBy: 'Fintech Specialist',
  },
];

export const useAdminSettingsData = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('platform');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // 0. Platform Settings & Feature Flags (with localStorage hydration fallback)
  const [platformConfig, setPlatformConfig] = useState<PlatformEnvironmentConfig>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_settings_platform_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_PLATFORM_CONFIG,
          ...parsed,
          publicBackground: {
            ...DEFAULT_PUBLIC_BACKGROUND,
            ...(parsed.publicBackground || {}),
            imageDataUrl: (parsed.publicBackground?.imageDataUrl && parsed.publicBackground.imageDataUrl.trim() !== '')
              ? parsed.publicBackground.imageDataUrl
              : DEFAULT_PUBLIC_BG_URL,
            imageFileName: parsed.publicBackground?.imageFileName || 'Highway Landscape (Default)',
          },
        };
      }
    } catch {}
    return DEFAULT_PLATFORM_CONFIG;
  });

  const [featureFlags, setFeatureFlags] = useState<PlatformFeatureFlag[]>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_settings_feature_flags');
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_FEATURE_FLAGS;
  });

  // Fetch shared platform configuration from server on mount so changes are unified
  useEffect(() => {
    const syncFromServer = async () => {
      try {
        const res = await fetch('/platform-settings-sync');
        if (res.ok) {
          const serverData = await res.json();
          if (serverData && serverData.publicBackground) {
            setPlatformConfig((prev) => {
              // If local has custom uploaded image that server doesn't have yet, push to server
              if (prev.publicBackground?.imageDataUrl && prev.publicBackground.imageDataUrl.startsWith('data:')) {
                fetch('/platform-settings-sync', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(prev),
                }).catch(() => {});
                return prev;
              }
              return {
                ...prev,
                ...serverData,
                publicBackground: {
                  ...DEFAULT_PUBLIC_BACKGROUND,
                  ...serverData.publicBackground,
                },
              };
            });
          } else if (platformConfig.publicBackground?.enabled) {
            // Push existing local config to server
            fetch('/platform-settings-sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(platformConfig),
            }).catch(() => {});
          }
        }
      } catch {}
    };
    syncFromServer();
  }, []);

  // Auto-save & real-time broadcast platform configuration changes
  useEffect(() => {
    try {
      localStorage.setItem('sifo_admin_settings_platform_config', JSON.stringify(platformConfig));
      window.dispatchEvent(new CustomEvent('sifo_platform_config_updated', { detail: platformConfig }));
      fetch('/platform-settings-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(platformConfig),
      }).catch(() => {});
    } catch (e) {
      console.warn('Failed to auto-save platformConfig', e);
    }
  }, [platformConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('sifo_admin_settings_feature_flags', JSON.stringify(featureFlags));
      window.dispatchEvent(new CustomEvent('sifo_feature_flags_updated', { detail: featureFlags }));
    } catch (e) {
      console.warn('Failed to auto-save featureFlags', e);
    }
  }, [featureFlags]);

  const handleResetPlatformDefaults = () => {
    setPlatformConfig(DEFAULT_PLATFORM_CONFIG);
    setFeatureFlags(DEFAULT_FEATURE_FLAGS);
    localStorage.removeItem('sifo_admin_settings_platform_config');
    localStorage.removeItem('sifo_admin_settings_feature_flags');
    window.dispatchEvent(new CustomEvent('sifo_platform_config_updated', { detail: DEFAULT_PLATFORM_CONFIG }));
    showToast('Platform settings reset to default state', 'info');
  };

  // 1. Pricing & Fee Schedule (with localStorage hydration fallback)
  const [pricing, setPricing] = useState<PricingSettings>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_settings_pricing');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      fullTuitionCourse: 120000,
      theoryOnlyCourse: 45000,
      practicalLessonPerHour: 12000,
      examCarRental: 25000,
      policeMockExamSitting: 2000,
      certificateVerificationFee: 10000,
      expressCertProcessing: 5000,
      corporatePerDriver: 250000,
      fleetDefensiveWorkshop: 650000,
      commercialHeavyVehicleCourse: 180000,
      weekendHolidaySurcharge: 3000,
      lateCancellationPenalty: 5000,
    };
  });

  // Guest & Free Trial Settings with Automatic Bundle Discounts
  const [guestTrialConfig, setGuestTrialConfig] = useState<GuestTrialConfig>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_settings_guest_trials');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      freeTrialExamsOnSignup: 1,
      singleExamPrice: 500,
      tier1Threshold: 5,
      tier1DiscountPercent: 5,
      tier2Threshold: 10,
      tier2DiscountPercent: 10,
      allowGuestPayAsYouGo: true,
      creditsNeverExpire: true,
    };
  });

  // Interactive bundle stepper state
  const [bundleCount, setBundleCount] = useState<number>(6);

  // Dynamic automatic calculation for Single & Multi-Exam bundles
  const calculateBundlePrice = (count: number, unitPrice: number = guestTrialConfig.singleExamPrice) => {
    const safeCount = Math.max(1, count);
    const rawTotal = safeCount * unitPrice;
    let discountPercent = 0;
    if (safeCount > guestTrialConfig.tier2Threshold) {
      discountPercent = guestTrialConfig.tier2DiscountPercent;
    } else if (safeCount > guestTrialConfig.tier1Threshold) {
      discountPercent = guestTrialConfig.tier1DiscountPercent;
    }
    const discountAmount = Math.round((rawTotal * discountPercent) / 100);
    const finalTotal = rawTotal - discountAmount;
    const unitEffective = Math.round(finalTotal / safeCount);
    return { count: safeCount, rawTotal, discountPercent, discountAmount, finalTotal, unitEffective };
  };

  // 2. Subscription Plans
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_settings_plans');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'plan_single_exam',
        name: 'Single & Multi-Exam Pass',
        category: 'Guest / Pay-As-You-Go',
        price: 500,
        interval: 'Per Exam Sitting',
        badge: '1 Free Trial Included',
        features: [
          '1 Free Trial Exam automatically granted upon registration',
          'Flexible bundle: use + and - to select any number of exams',
          'Buy > 5 exams: 5% automatic volume discount applied',
          'Buy > 10 exams: 10% automatic volume discount applied',
          'Official 20-question Rwanda Police timed simulation',
          'Exam credits never expire — practice at your own pace',
        ],
        isActive: true,
      },
      {
        id: 'plan_express_24h',
        name: '24-Hour Express Pass',
        category: 'Practice Quiz Bank',
        price: 1000,
        interval: '24 Hours',
        badge: 'Quick Prep',
        features: [
          'Unlimited access to all 400+ Kinyarwanda questions',
          'Official Police mock test simulation timer',
          'Instant answers with official law explanations',
          'Mobile-friendly practice anywhere',
        ],
        isActive: true,
      },
      {
        id: 'plan_weekly_pass',
        name: 'Weekly Student Pass',
        category: 'Practice & Flashcards',
        price: 4000,
        interval: '7 Days',
        badge: 'Popular',
        features: [
          'Full question bank with road sign recognition',
          'Category-by-category weak spots breakdown',
          'Pass readiness predictor score',
          'Priority mobile support in Kinyarwanda',
        ],
        isActive: true,
      },
      {
        id: 'plan_monthly_mastery',
        name: 'Full Course Theory Pass',
        category: 'Curriculum & Live Replays',
        price: 15000,
        interval: '30 Days',
        badge: 'Best Value',
        features: [
          'Complete multimedia video lesson catalog',
          'Live virtual theory classroom replays',
          'Unlimited practice exam sittings',
          'Official certificate eligibility upon completion',
        ],
        isActive: true,
      },
      {
        id: 'plan_enterprise_fleet',
        name: 'Corporate Fleet Safety Tier',
        category: 'Enterprise Training',
        price: 85000,
        interval: 'Per Month / 10 Drivers',
        badge: 'Enterprise',
        features: [
          'Admin dashboard for fleet training management',
          'Defensive driving & safety audit modules',
          'Driver pass certification tracking',
          'Quarterly compliance reports for RDB/Police',
        ],
        isActive: true,
      },
    ];
  });

  // 3. School Booking & Operational Rules
  const [rules, setRules] = useState<OperationalRules>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_settings_rules');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      maxLessonsPerWeek: 3,
      minAdvanceBookingHours: 12,
      cancellationCutoffHours: 6,
      maxConcurrentBookings: 2,
      lessonDurationMinutes: 60,
      openingTime: '07:30',
      closingTime: '18:30',
      maxInstructorHoursPerDay: 7,
      allowTransmissionChoice: true,
      openOnSaturdays: true,
      openOnSundays: false,
    };
  });

  // 4. Notifications & SMS Alerts
  const [notifications, setNotifications] = useState<NotificationSettings>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_settings_notifs');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      smsLessonReminderHoursBefore: 2,
      sendPaymentReceiptSms: true,
      sendExamScheduleSms: true,
      sendCertificateReadySms: true,
      dailyInstructorScheduleSms: true,
      alertAdminLowAttendance: true,
      lowAttendanceThreshold: 60,
    };
  });

  // 5. Academy Profile
  const [academy, setAcademy] = useState<AcademyProfile>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_settings_academy');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      name: 'Sifo Drive Academy Rwanda',
      licenseNumber: 'RDB-DRV-2023-8842',
      supportPhone: '+250 788 123 456',
      whatsappPhone: '+250 788 123 456',
      email: 'info@sifodrive.rw',
      mainBranch: 'Kigali, Nyarugenge (Camp Kigali Practical Yard)',
      secondBranch: 'Kicukiro, Sonatubes Theory Classroom',
      workingDaysLabel: 'Monday to Saturday, 07:30 - 18:30 CAT',
    };
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      try {
        localStorage.setItem('sifo_admin_settings_platform_config', JSON.stringify(platformConfig));
        localStorage.setItem('sifo_admin_settings_feature_flags', JSON.stringify(featureFlags));
        localStorage.setItem('sifo_admin_settings_pricing', JSON.stringify(pricing));
        localStorage.setItem('sifo_admin_settings_guest_trials', JSON.stringify(guestTrialConfig));
        localStorage.setItem('sifo_admin_settings_plans', JSON.stringify(plans));
        localStorage.setItem('sifo_admin_settings_rules', JSON.stringify(rules));
        localStorage.setItem('sifo_admin_settings_notifs', JSON.stringify(notifications));
        localStorage.setItem('sifo_admin_settings_academy', JSON.stringify(academy));
        window.dispatchEvent(new CustomEvent('sifo_platform_config_updated', { detail: platformConfig }));
        window.dispatchEvent(new CustomEvent('sifo_feature_flags_updated', { detail: featureFlags }));
        fetch('/platform-settings-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(platformConfig),
        }).catch(() => {});
        showToast('Changes saved successfully', 'success');
      } catch (err) {
        console.error('Error saving settings to storage:', err);
        showToast('Storage limit reached. Please use a smaller image file.', 'error');
      } finally {
        setIsSaving(false);
      }
    }, 150);
  };

  const handlePlanPriceChange = (id: string, newPrice: number) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, price: newPrice } : p))
    );
  };

  const handleTogglePlan = (id: string) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const formatRwf = (val: number) => {
    return new Intl.NumberFormat('en-RW').format(val) + ' RWF';
  };

  return {
    activeTab,
    setActiveTab,
    isSaving,
    platformConfig,
    setPlatformConfig,
    featureFlags,
    setFeatureFlags,
    handleResetPlatformDefaults,
    pricing,
    setPricing,
    guestTrialConfig,
    setGuestTrialConfig,
    bundleCount,
    setBundleCount,
    calculateBundlePrice,
    plans,
    setPlans,
    rules,
    setRules,
    notifications,
    setNotifications,
    academy,
    setAcademy,
    handleSave,
    handlePlanPriceChange,
    handleTogglePlan,
    formatRwf,
  };
};

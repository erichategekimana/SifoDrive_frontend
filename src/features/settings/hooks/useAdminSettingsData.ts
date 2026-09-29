import { useState } from 'react';
import { useToast } from '../../../context/ToastContext';
import type {
  SettingsTab,
  SubscriptionPlan,
  PricingSettings,
  GuestTrialConfig,
  OperationalRules,
  NotificationSettings,
  AcademyProfile,
} from '../types';

export const useAdminSettingsData = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('finance');
  const [isSaving, setIsSaving] = useState<boolean>(false);

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
      setIsSaving(false);
      localStorage.setItem('sifo_admin_settings_pricing', JSON.stringify(pricing));
      localStorage.setItem('sifo_admin_settings_guest_trials', JSON.stringify(guestTrialConfig));
      localStorage.setItem('sifo_admin_settings_plans', JSON.stringify(plans));
      localStorage.setItem('sifo_admin_settings_rules', JSON.stringify(rules));
      localStorage.setItem('sifo_admin_settings_notifs', JSON.stringify(notifications));
      localStorage.setItem('sifo_admin_settings_academy', JSON.stringify(academy));
      showToast('Platform settings and pricing updated successfully', 'success');
    }, 350);
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

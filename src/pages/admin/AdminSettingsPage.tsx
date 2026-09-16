import React, { useState } from 'react';
import {
  Settings,
  DollarSign,
  Layers,
  CalendarClock,
  Bell,
  Building2,
  Save,
  CheckCircle2,
  Check,
  Clock,
  Car,
  Award,
  Users,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Plus,
  Minus,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface SubscriptionPlan {
  id: string;
  name: string;
  category: string;
  price: number;
  interval: string;
  badge?: string;
  features: string[];
  isActive: boolean;
}

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'finance' | 'plans' | 'rules' | 'notifications' | 'academy'>('finance');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // 1. Pricing & Fee Schedule
  const [pricing, setPricing] = useState({
    // Student & Tuition Fees
    fullTuitionCourse: 120000,
    theoryOnlyCourse: 45000,
    practicalLessonPerHour: 12000,
    examCarRental: 25000,

    // Examinations & Certs
    policeMockExamSitting: 2000,
    certificateVerificationFee: 10000,
    expressCertProcessing: 5000,

    // Enterprise & Corporate
    corporatePerDriver: 250000,
    fleetDefensiveWorkshop: 650000,
    commercialHeavyVehicleCourse: 180000,

    // Surcharges & Penalties
    weekendHolidaySurcharge: 3000,
    lateCancellationPenalty: 5000,
  });

  // Guest & Free Trial Settings with Automatic Bundle Discounts
  const [guestTrialConfig, setGuestTrialConfig] = useState({
    freeTrialExamsOnSignup: 1,
    singleExamPrice: 500,
    tier1Threshold: 5, // > 5 exams
    tier1DiscountPercent: 5, // 5% discount
    tier2Threshold: 10, // > 10 exams
    tier2DiscountPercent: 10, // 10% discount
    allowGuestPayAsYouGo: true,
    creditsNeverExpire: true,
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
  const [plans, setPlans] = useState<SubscriptionPlan[]>([
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
  ]);

  // 3. School Booking & Operational Rules
  const [rules, setRules] = useState({
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
  });

  // 4. Notifications & SMS Alerts
  const [notifications, setNotifications] = useState({
    smsLessonReminderHoursBefore: 2,
    sendPaymentReceiptSms: true,
    sendExamScheduleSms: true,
    sendCertificateReadySms: true,
    dailyInstructorScheduleSms: true,
    alertAdminLowAttendance: true,
    lowAttendanceThreshold: 60,
  });

  // 5. Academy Profile
  const [academy, setAcademy] = useState({
    name: 'Sifo Drive Academy Rwanda',
    licenseNumber: 'RDB-DRV-2023-8842',
    supportPhone: '+250 788 123 456',
    whatsappPhone: '+250 788 123 456',
    email: 'info@sifodrive.rw',
    mainBranch: 'Kigali, Nyarugenge (Camp Kigali Practical Yard)',
    secondBranch: 'Kicukiro, Sonatubes Theory Classroom',
    workingDaysLabel: 'Monday to Saturday, 07:30 - 18:30 CAT',
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

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Settings size={26} color="var(--primary)" />
            Settings
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#94a3b8' }}>
            Manage school tuition, practical lesson fees, subscription passes, booking rules, and academy policies.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 20px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--primary)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.86rem',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}
        >
          {isSaving ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '2px',
          marginBottom: '24px',
          overflowX: 'auto',
        }}
      >
        {[
          { key: 'finance', label: 'Finance', icon: <DollarSign size={16} /> },
          { key: 'plans', label: 'Plans', icon: <Layers size={16} /> },
          { key: 'rules', label: 'Rules', icon: <CalendarClock size={16} /> },
          { key: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
          { key: 'academy', label: 'Academy', icon: <Building2 size={16} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '9px 18px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: isActive ? '2px solid #ffffff' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* 1. FINANCE: PRICING & FEES TAB */}
      {/* =================================================================== */}
      {activeTab === 'finance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Note */}
          <div
            className="glass-panel"
            style={{
              padding: '16px 20px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '0.86rem', color: '#94a3b8' }}>
              Base fees apply across learner registration, practical booking calendar, and Mobile Money checkout. All figures in <strong style={{ color: '#ffffff' }}>RWF</strong>.
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Updated rates apply immediately to new student checkouts.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* Student & Course Tuition Fees */}
            <div
              className="glass-panel"
              style={{
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Car size={18} color="#94a3b8" />
                <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Student Courses & Lessons</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                      Complete Driving Course Tuition
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                      {formatRwf(pricing.fullTuitionCourse)}
                    </span>
                  </div>
                  <input
                    type="number"
                    step={5000}
                    value={pricing.fullTuitionCourse}
                    onChange={(e) => setPricing({ ...pricing, fullTuitionCourse: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                    Full package: classroom theory, road signs, quiz pass, and practical road training.
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                      Theory Classroom Only
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                      {formatRwf(pricing.theoryOnlyCourse)}
                    </span>
                  </div>
                  <input
                    type="number"
                    step={1000}
                    value={pricing.theoryOnlyCourse}
                    onChange={(e) => setPricing({ ...pricing, theoryOnlyCourse: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                      In-Car Practical Lesson (per Hour)
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                      {formatRwf(pricing.practicalLessonPerHour)}
                    </span>
                  </div>
                  <input
                    type="number"
                    step={1000}
                    value={pricing.practicalLessonPerHour}
                    onChange={(e) => setPricing({ ...pricing, practicalLessonPerHour: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                    Rate per 60-minute in-vehicle practical lesson with instructor.
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                      Academy Car Rental for Police Exam
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                      {formatRwf(pricing.examCarRental)}
                    </span>
                  </div>
                  <input
                    type="number"
                    step={1000}
                    value={pricing.examCarRental}
                    onChange={(e) => setPricing({ ...pricing, examCarRental: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Examinations & Certificate Issuance */}
            <div
              className="glass-panel"
              style={{
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Award size={18} color="#94a3b8" />
                <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Exams & Certifications</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                      Police Mock Exam Sitting (Per Test)
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                      {formatRwf(pricing.policeMockExamSitting)}
                    </span>
                  </div>
                  <input
                    type="number"
                    step={500}
                    value={pricing.policeMockExamSitting}
                    onChange={(e) => setPricing({ ...pricing, policeMockExamSitting: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                    Proctored simulation timed against Rwanda National Police 20-question format.
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                      Official Certificate & QR Verification Hash
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                      {formatRwf(pricing.certificateVerificationFee)}
                    </span>
                  </div>
                  <input
                    type="number"
                    step={1000}
                    value={pricing.certificateVerificationFee}
                    onChange={(e) => setPricing({ ...pricing, certificateVerificationFee: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                      Express Certificate Dispatch (Same-Day)
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                      {formatRwf(pricing.expressCertProcessing)}
                    </span>
                  </div>
                  <input
                    type="number"
                    step={1000}
                    value={pricing.expressCertProcessing}
                    onChange={(e) => setPricing({ ...pricing, expressCertProcessing: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Corporate & Enterprise Fleet Rates */}
            <div
              className="glass-panel"
              style={{
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Briefcase size={18} color="#94a3b8" />
                <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Corporate & Enterprise</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                      Corporate Driver Training (Per Driver)
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                      {formatRwf(pricing.corporatePerDriver)}
                    </span>
                  </div>
                  <input
                    type="number"
                    step={10000}
                    value={pricing.corporatePerDriver}
                    onChange={(e) => setPricing({ ...pricing, corporatePerDriver: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                      Fleet Defensive Driving Workshop (Group)
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                      {formatRwf(pricing.fleetDefensiveWorkshop)}
                    </span>
                  </div>
                  <input
                    type="number"
                    step={25000}
                    value={pricing.fleetDefensiveWorkshop}
                    onChange={(e) => setPricing({ ...pricing, fleetDefensiveWorkshop: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                      Commercial / Heavy Vehicle Category Course
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                      {formatRwf(pricing.commercialHeavyVehicleCourse)}
                    </span>
                  </div>
                  <input
                    type="number"
                    step={10000}
                    value={pricing.commercialHeavyVehicleCourse}
                    onChange={(e) => setPricing({ ...pricing, commercialHeavyVehicleCourse: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Surcharges & Cancellation Penalties */}
            <div
              className="glass-panel"
              style={{
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Clock size={18} color="#94a3b8" />
                <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Surcharges & Penalties</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                      Weekend / Holiday Practical Surcharge
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                      +{formatRwf(pricing.weekendHolidaySurcharge)}
                    </span>
                  </div>
                  <input
                    type="number"
                    step={500}
                    value={pricing.weekendHolidaySurcharge}
                    onChange={(e) => setPricing({ ...pricing, weekendHolidaySurcharge: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                    Added automatically when students book slots on Saturdays or official holidays.
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                      Late Cancellation / No-Show Fee
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                      {formatRwf(pricing.lateCancellationPenalty)}
                    </span>
                  </div>
                  <input
                    type="number"
                    step={1000}
                    value={pricing.lateCancellationPenalty}
                    onChange={(e) => setPricing({ ...pricing, lateCancellationPenalty: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                    Deducted from student credit balance if cancelled within the lockout window.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. SUBSCRIPTION PLANS TAB */}
      {/* =================================================================== */}
      {activeTab === 'plans' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            className="glass-panel"
            style={{
              padding: '20px 24px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                Subscription & Access Packages
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '3px' }}>
                Manage pricing, durations, and active status for online study passes and corporate tiers.
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>
              {plans.filter((p) => p.isActive).length} of {plans.length} Plans Active
            </div>
          </div>

          {/* Guest Onboarding & Free Trial Configuration Banner */}
          <div
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(56, 189, 248, 0.03)',
              borderLeft: '4px solid #38bdf8',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={18} color="#38bdf8" />
              <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>
                Guest Onboarding & Flexible Multi-Exam Bundle Rules
              </span>
            </div>
            <p style={{ margin: '0 0 18px 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Guests can create an account and immediately receive <strong style={{ color: '#ffffff' }}>1 Free Trial Mock Exam</strong>. Users can adjust their bundle with <strong style={{ color: '#38bdf8' }}>+</strong> and <strong style={{ color: '#38bdf8' }}>-</strong> to buy any number of exams. Buying <strong style={{ color: '#34d399' }}>more than 5 exams grants a 5% discount</strong>, and <strong style={{ color: '#34d399' }}>more than 10 exams grants a 10% discount</strong>.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Free Trial on Registration
                </label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={guestTrialConfig.freeTrialExamsOnSignup}
                  onChange={(e) =>
                    setGuestTrialConfig({ ...guestTrialConfig, freeTrialExamsOnSignup: Number(e.target.value) })
                  }
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                  Auto-credited to new registered users.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Base Price per Single Exam (RWF)
                </label>
                <input
                  type="number"
                  step={100}
                  value={guestTrialConfig.singleExamPrice}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setGuestTrialConfig({ ...guestTrialConfig, singleExamPrice: val });
                    handlePlanPriceChange('plan_single_exam', val);
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                  Base unit price for 1 exam sitting.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Tier 1 Discount (&gt; 5 Exams)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={guestTrialConfig.tier1DiscountPercent}
                    onChange={(e) =>
                      setGuestTrialConfig({ ...guestTrialConfig, tier1DiscountPercent: Number(e.target.value) })
                    }
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: '0.86rem', color: '#94a3b8', fontWeight: 700 }}>%</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                  Applied when user selects &gt; 5 exams.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Tier 2 Discount (&gt; 10 Exams)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={guestTrialConfig.tier2DiscountPercent}
                    onChange={(e) =>
                      setGuestTrialConfig({ ...guestTrialConfig, tier2DiscountPercent: Number(e.target.value) })
                    }
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: '0.86rem', color: '#94a3b8', fontWeight: 700 }}>%</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                  Applied when user selects &gt; 10 exams.
                </div>
              </div>
            </div>

            {/* Quick bundle preset chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Quick Test Bundles:</span>
              {[
                { count: 1, label: '1 Exam (500 RWF)' },
                { count: 3, label: '3 Exams (1,500 RWF)' },
                { count: 6, label: '6 Exams (5% OFF → 2,850 RWF)' },
                { count: 12, label: '12 Exams (10% OFF → 5,400 RWF)' },
              ].map((chip) => (
                <button
                  key={chip.count}
                  type="button"
                  onClick={() => setBundleCount(chip.count)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: bundleCount === chip.count ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: bundleCount === chip.count ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: bundleCount === chip.count ? '#38bdf8' : '#cbd5e1',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#ffffff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={guestTrialConfig.allowGuestPayAsYouGo}
                  onChange={(e) => setGuestTrialConfig({ ...guestTrialConfig, allowGuestPayAsYouGo: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                Allow Guest Self-Checkout (MoMo / Airtel)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#ffffff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={guestTrialConfig.creditsNeverExpire}
                  onChange={(e) => setGuestTrialConfig({ ...guestTrialConfig, creditsNeverExpire: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                Exam Credits Never Expire (Valid until used)
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="glass-panel"
                style={{
                  padding: '24px',
                  borderRadius: '12px',
                  border: plan.isActive ? '1px solid var(--border-subtle)' : '1px dashed rgba(255, 255, 255, 0.1)',
                  background: plan.isActive ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '18px',
                  opacity: plan.isActive ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.04em' }}>
                        {plan.category}
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                        {plan.name}
                      </div>
                    </div>
                    {plan.badge && (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                        }}
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  {plan.id === 'plan_single_exam' ? (
                    <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
                          Select Bundle Size (+ / -)
                        </label>
                        <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>
                          Base: {formatRwf(guestTrialConfig.singleExamPrice)}
                        </span>
                      </div>

                      {/* Interactive + and - stepper */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          marginBottom: '10px',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setBundleCount((prev) => Math.max(1, prev - 1))}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Minus size={15} />
                        </button>

                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                            {bundleCount} {bundleCount === 1 ? 'Exam' : 'Exams'}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                            {bundleCount > 10 ? '10% Discount Applied' : bundleCount > 5 ? '5% Discount Applied' : 'Standard Rate'}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setBundleCount((prev) => Math.min(50, prev + 1))}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      {/* Calculated total card */}
                      {(() => {
                        const calc = calculateBundlePrice(bundleCount);
                        return (
                          <div
                            style={{
                              padding: '10px 14px',
                              borderRadius: '8px',
                              background: 'rgba(56, 189, 248, 0.06)',
                              border: '1px solid rgba(56, 189, 248, 0.2)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                                Auto-Calculated Price
                              </div>
                              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginTop: '1px' }}>
                                {formatRwf(calc.finalTotal)}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '1px' }}>
                                {calc.unitEffective} RWF / exam sitting
                              </div>
                            </div>
                            {calc.discountPercent > 0 && (
                              <div style={{ textAlign: 'right' }}>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    color: '#34d399',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                  }}
                                >
                                  {calc.discountPercent}% OFF
                                </span>
                                <div style={{ fontSize: '0.68rem', color: '#10b981', marginTop: '2px' }}>
                                  Saved {formatRwf(calc.discountAmount)}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>
                        Price (RWF) / Duration
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          step={500}
                          value={plan.price}
                          onChange={(e) => handlePlanPriceChange(plan.id, Number(e.target.value))}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-subtle)',
                            color: '#ffffff',
                            fontSize: '1rem',
                            fontWeight: 800,
                            outline: 'none',
                          }}
                        />
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                          / {plan.interval}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Feature list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#cbd5e1' }}>
                        <Check size={14} color="#38bdf8" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: plan.isActive ? '#ffffff' : '#64748b', fontWeight: 600 }}>
                    {plan.isActive ? 'Active on Student Portal' : 'Disabled (Hidden)'}
                  </span>
                  <button
                    onClick={() => handleTogglePlan(plan.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: plan.isActive ? '#38bdf8' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {plan.isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. RULES & BOOKING POLICIES */}
      {/* =================================================================== */}
      {activeTab === 'rules' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          <div
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <CalendarClock size={18} color="#94a3b8" />
              <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Booking Quotas & Deadlines</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Max Practical Lessons a Student Can Book Per Week
                </label>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={rules.maxLessonsPerWeek}
                  onChange={(e) => setRules({ ...rules, maxLessonsPerWeek: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                  Prevents single students from monopolizing limited car hours.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Minimum Advance Notice Required (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={48}
                  value={rules.minAdvanceBookingHours}
                  onChange={(e) => setRules({ ...rules, minAdvanceBookingHours: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                  Students cannot book slots starting within this cutoff window.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Free Cancellation Cutoff (Hours Before Lesson)
                </label>
                <input
                  type="number"
                  min={2}
                  max={24}
                  value={rules.cancellationCutoffHours}
                  onChange={(e) => setRules({ ...rules, cancellationCutoffHours: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                  Cancellations within this period incur the late cancellation penalty.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Max Active Upcoming Bookings
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={rules.maxConcurrentBookings}
                  onChange={(e) => setRules({ ...rules, maxConcurrentBookings: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          <div
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Clock size={18} color="#94a3b8" />
              <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Working Hours & Resources</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                    School Opens At
                  </label>
                  <input
                    type="time"
                    value={rules.openingTime}
                    onChange={(e) => setRules({ ...rules, openingTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                    School Closes At
                  </label>
                  <input
                    type="time"
                    value={rules.closingTime}
                    onChange={(e) => setRules({ ...rules, closingTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Max Teaching Hours Per Instructor Daily
                </label>
                <input
                  type="number"
                  min={4}
                  max={10}
                  value={rules.maxInstructorHoursPerDay}
                  onChange={(e) => setRules({ ...rules, maxInstructorHoursPerDay: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                  Enforces fatigue management and instructor safety policies.
                </div>
              </div>

              <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>Transmission Preference Choice</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Allow students to choose Manual vs Automatic car</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={rules.allowTransmissionChoice}
                    onChange={(e) => setRules({ ...rules, allowTransmissionChoice: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>Saturday Operations</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Accept student bookings on Saturdays</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={rules.openOnSaturdays}
                    onChange={(e) => setRules({ ...rules, openOnSaturdays: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. NOTIFICATIONS TAB */}
      {/* =================================================================== */}
      {activeTab === 'notifications' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          <div
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Bell size={18} color="#94a3b8" />
              <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Student SMS Notifications</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Practical Lesson SMS Reminder
                </label>
                <select
                  value={notifications.smsLessonReminderHoursBefore}
                  onChange={(e) =>
                    setNotifications({ ...notifications, smsLessonReminderHoursBefore: Number(e.target.value) })
                  }
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#1a1f2e',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                >
                  <option value={1}>1 Hour before session</option>
                  <option value={2}>2 Hours before session</option>
                  <option value={4}>4 Hours before session</option>
                  <option value={12}>12 Hours before session</option>
                </select>
              </div>

              <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>Tuition & Payment SMS Receipt</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Dispatched instantly upon MoMo payment</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.sendPaymentReceiptSms}
                    onChange={(e) => setNotifications({ ...notifications, sendPaymentReceiptSms: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>Police Mock Exam Schedule Notice</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>SMS with test time and designated room</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.sendExamScheduleSms}
                    onChange={(e) => setNotifications({ ...notifications, sendExamScheduleSms: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>Certificate Ready SMS</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>SMS with QR verification link when graduate completes</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.sendCertificateReadySms}
                    onChange={(e) => setNotifications({ ...notifications, sendCertificateReadySms: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Users size={18} color="#94a3b8" />
              <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Staff & Operational Alerts</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>Instructor Daily Schedule SMS</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Send daily morning schedule to instructors at 06:30 CAT</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.dailyInstructorScheduleSms}
                  onChange={(e) => setNotifications({ ...notifications, dailyInstructorScheduleSms: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>Low Learner Attendance Alert</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Flag students with less than 60% session attendance</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.alertAdminLowAttendance}
                  onChange={(e) => setNotifications({ ...notifications, alertAdminLowAttendance: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Low Attendance Warning Threshold (%)
                </label>
                <input
                  type="number"
                  min={30}
                  max={80}
                  value={notifications.lowAttendanceThreshold}
                  onChange={(e) =>
                    setNotifications({ ...notifications, lowAttendanceThreshold: Number(e.target.value) })
                  }
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. ACADEMY PROFILE TAB */}
      {/* =================================================================== */}
      {activeTab === 'academy' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          <div
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Building2 size={18} color="#94a3b8" />
              <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Academy Credentials & Contacts</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Registered Driving School Name
                </label>
                <input
                  type="text"
                  value={academy.name}
                  onChange={(e) => setAcademy({ ...academy, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  RDB / Ministry Licensing Code
                </label>
                <input
                  type="text"
                  value={academy.licenseNumber}
                  onChange={(e) => setAcademy({ ...academy, licenseNumber: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Main Support Helpline
                </label>
                <input
                  type="text"
                  value={academy.supportPhone}
                  onChange={(e) => setAcademy({ ...academy, supportPhone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  WhatsApp Concierge Hotline
                </label>
                <input
                  type="text"
                  value={academy.whatsappPhone}
                  onChange={(e) => setAcademy({ ...academy, whatsappPhone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Official Email
                </label>
                <input
                  type="email"
                  value={academy.email}
                  onChange={(e) => setAcademy({ ...academy, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          <div
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Building2 size={18} color="#94a3b8" />
              <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Branches & Training Grounds</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Primary Training Yard (Practical Driving)
                </label>
                <input
                  type="text"
                  value={academy.mainBranch}
                  onChange={(e) => setAcademy({ ...academy, mainBranch: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Secondary Classroom Branch (Theory & Code)
                </label>
                <input
                  type="text"
                  value={academy.secondBranch}
                  onChange={(e) => setAcademy({ ...academy, secondBranch: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Operational Schedule
                </label>
                <input
                  type="text"
                  value={academy.workingDaysLabel}
                  onChange={(e) => setAcademy({ ...academy, workingDaysLabel: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

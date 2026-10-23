export type SettingsTab = 'platform' | 'finance' | 'rules' | 'notifications' | 'academy';

export type PlatformSubSection = 'public' | 'student' | 'tutors' | 'admins' | 'general';

export interface PlatformFeatureFlag {
  id: string;
  name: string;
  nameKinyarwanda?: string;
  category: 'core' | 'examinations' | 'payments' | 'lms' | 'security' | 'experimental';
  scope?: PlatformSubSection;
  description: string;
  descriptionKinyarwanda?: string;
  isEnabled: boolean;
  status: 'STABLE' | 'BETA' | 'ALPHA' | 'EXPERIMENTAL';
  targetAudience: 'ALL' | 'BETA_TESTERS' | 'STAFF_ONLY' | 'DISABLED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  version: string;
  lastToggledAt?: string;
  toggledBy?: string;
}

export interface PublicBackgroundConfig {
  enabled: boolean;
  imageDataUrl: string;
  imageFileName?: string;
  imageDimensions?: { width: number; height: number };
  lightImageOpacity: number;
  lightGradientOpacity: number;
  darkImageOpacity: number;
  darkGradientOpacity: number;
}

export interface PlatformEnvironmentConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceMessageKinyarwanda: string;
  readOnlyMode: boolean;
  sandboxSimulation: boolean;
  debugTelemetry: boolean;
  strictDeviceLockdown: boolean;
  aiProctoringStrictness: 'LENIENT' | 'MODERATE' | 'STRICT';
  rateLimitingTier: 'STANDARD' | 'AGGRESSIVE' | 'RELAXED';
  betaTestingCohortPercentage: number;

  // Public Sub-section Settings
  allowPublicGuestCheckout?: boolean;
  publicCatalogVisible?: boolean;
  publicSelfRegistration?: boolean;
  publicSignsFreeAccess?: boolean;
  guestTrialExamCount?: number;
  captchaOnGuestCheckout?: boolean;
  publicBackground?: PublicBackgroundConfig;

  // Student Sub-section Settings
  studentAudioNarration?: boolean;
  studentInstantFeedback?: boolean;
  studentOfflinePwaMode?: boolean;
  studentRetakeCooldownMinutes?: number;
  studentPassingScorePercent?: number;

  // Tutor Sub-section Settings
  tutorLiveClassWebRtc?: boolean;
  tutorQrAttendanceScan?: boolean;
  tutorGpsRouteTracking?: boolean;
  tutorDirectMessaging?: boolean;
  tutorAutoDispatch?: boolean;

  // Admin Sub-section Settings
  adminTwoFactorRequired?: boolean;
  adminAuditLogRetentionDays?: number;
  adminConcurrentSessionLimit?: number;

  // General Sub-section Settings
  defaultLanguage?: 'rw' | 'en';
  smsGatewayEnabled?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  category: string;
  price: number;
  interval: string;
  badge?: string;
  features: string[];
  isActive: boolean;
}

export interface PricingSettings {
  fullTuitionCourse: number;
  theoryOnlyCourse: number;
  practicalLessonPerHour: number;
  examCarRental: number;
  policeMockExamSitting: number;
  certificateVerificationFee: number;
  expressCertProcessing: number;
  corporatePerDriver: number;
  fleetDefensiveWorkshop: number;
  commercialHeavyVehicleCourse: number;
  weekendHolidaySurcharge: number;
  lateCancellationPenalty: number;
}

export interface GuestTrialConfig {
  freeTrialExamsOnSignup: number;
  singleExamPrice: number;
  tier1Threshold: number;
  tier1DiscountPercent: number;
  tier2Threshold: number;
  tier2DiscountPercent: number;
  allowGuestPayAsYouGo: boolean;
  creditsNeverExpire: boolean;
}

export interface OperationalRules {
  maxLessonsPerWeek: number;
  minAdvanceBookingHours: number;
  cancellationCutoffHours: number;
  maxConcurrentBookings: number;
  lessonDurationMinutes: number;
  openingTime: string;
  closingTime: string;
  maxInstructorHoursPerDay: number;
  allowTransmissionChoice: boolean;
  openOnSaturdays: boolean;
  openOnSundays: boolean;
}

export interface NotificationSettings {
  smsLessonReminderHoursBefore: number;
  sendPaymentReceiptSms: boolean;
  sendExamScheduleSms: boolean;
  sendCertificateReadySms: boolean;
  dailyInstructorScheduleSms: boolean;
  alertAdminLowAttendance: boolean;
  lowAttendanceThreshold: number;
}

export interface AcademyProfile {
  name: string;
  licenseNumber: string;
  supportPhone: string;
  whatsappPhone: string;
  email: string;
  mainBranch: string;
  secondBranch: string;
  workingDaysLabel: string;
}

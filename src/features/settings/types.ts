export type SettingsTab = 'finance' | 'plans' | 'rules' | 'notifications' | 'academy';

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

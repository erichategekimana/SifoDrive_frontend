/**
 * Sifo Drive — Centralized API Endpoints Catalog
 * Versioned under /api/v1/
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const ApiEndpoints = {
  // Auth & Accounts
  AUTH: {
    REGISTER_GUEST: `${API_BASE_URL}/auth/register/guest/`,
    REGISTER_STUDENT: `${API_BASE_URL}/auth/register/student/`,
    UPGRADE_STUDENT: `${API_BASE_URL}/auth/upgrade/student/`,
    OTP_REQUEST: `${API_BASE_URL}/auth/otp/request/`,
    OTP_VERIFY: `${API_BASE_URL}/auth/otp/verify/`,
    TOKEN_REFRESH: `${API_BASE_URL}/auth/token/refresh/`,
    TOKEN_BLACKLIST: `${API_BASE_URL}/auth/token/blacklist/`,
    CONSENT_TERMS: `${API_BASE_URL}/auth/consent/terms/`,
    CONSENT_PRIVACY: `${API_BASE_URL}/auth/consent/privacy-policy/`,
    ME: `${API_BASE_URL}/auth/me/`,
    STUDENT_PROFILE: `${API_BASE_URL}/auth/me/student-profile/`,
  },

  // Learning Management System (LMS)
  LMS: {
    COURSES: `${API_BASE_URL}/lms/courses/`,
    COURSE_DETAIL: (id: string) => `${API_BASE_URL}/lms/courses/${id}/`,
    COURSE_MODULES: (courseId: string) => `${API_BASE_URL}/lms/courses/${courseId}/modules/`,
    MODULE_LESSONS: (moduleId: string) => `${API_BASE_URL}/lms/modules/${moduleId}/lessons/`,
    LESSON_DETAIL: (id: string) => `${API_BASE_URL}/lms/lessons/${id}/`,
    LESSON_QUESTIONS: (lessonId: string) => `${API_BASE_URL}/lms/lessons/${lessonId}/questions/`,
    ROAD_SIGNS: `${API_BASE_URL}/lms/road-signs/`,
    ROAD_SIGN_DETAIL: (id: string) => `${API_BASE_URL}/lms/road-signs/${id}/`,
    PROGRESS: `${API_BASE_URL}/lms/progress/`,
    PROGRESS_COMPLETE: `${API_BASE_URL}/lms/progress/complete/`,
    PROGRESS_QUIZ: `${API_BASE_URL}/lms/progress/quiz/`,
    PROGRESS_SUMMARY: `${API_BASE_URL}/lms/progress/summary/`,
    BOOKMARKS: `${API_BASE_URL}/lms/bookmarks/`,
  },

  // Live Classes & Google Meet Hub
  LIVE_CLASSES: {
    LIST: `${API_BASE_URL}/live-classes/classes/`,
    DETAIL: (id: string) => `${API_BASE_URL}/live-classes/classes/${id}/`,
    MY_ATTENDANCE: `${API_BASE_URL}/live-classes/my-attendance/`,
    COHORTS: `${API_BASE_URL}/live-classes/cohorts/`,
  },

  // Driving Test Booking Concierge (Irembo)
  BOOKING: {
    PRICING: `${API_BASE_URL}/booking/pricing/`,
    DISTRICTS: `${API_BASE_URL}/booking/districts/`,
    TEACHERS: `${API_BASE_URL}/booking/teachers/`,
    APPLY: `${API_BASE_URL}/booking/apply/`,
    MY_BOOKINGS: `${API_BASE_URL}/booking/my-bookings/`,
    DETAIL: (id: string) => `${API_BASE_URL}/booking/${id}/`,
    CANCEL: (id: string) => `${API_BASE_URL}/booking/${id}/cancel/`,
  },
} as const;

/**
 * Sifo Drive — Centralized API Endpoints Catalog
 * Versioned under /api/v1/
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const ApiEndpoints = {
  // Auth & Accounts
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login/`,
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
    USERS: `${API_BASE_URL}/auth/users/`,
    USERS_CREATE: `${API_BASE_URL}/auth/users/create/`,
    USER_DETAIL: (id: string) => `${API_BASE_URL}/auth/users/${id}/`,
    USER_ROLE: (id: string) => `${API_BASE_URL}/auth/users/${id}/role/`,
    USER_STATUS: (id: string) => `${API_BASE_URL}/auth/users/${id}/status/`,
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

  // System Administration (Exclusively SYSTEM_ADMIN)
  ADMIN: {
    STATS: `${API_BASE_URL}/auth/admin/stats/`,
    USERS: `${API_BASE_URL}/auth/users/`,
    USER_CREATE: `${API_BASE_URL}/auth/users/create/`,
    USER_DETAIL: (id: string) => `${API_BASE_URL}/auth/users/${id}/`,
    USER_ROLE: (id: string) => `${API_BASE_URL}/auth/users/${id}/role/`,
    USER_STATUS: (id: string) => `${API_BASE_URL}/auth/users/${id}/status/`,

    // LMS Studio
    COURSES: `${API_BASE_URL}/lms/courses/`,
    COURSE_CREATE: `${API_BASE_URL}/lms/courses/create/`,
    COURSE_UPDATE: (id: string) => `${API_BASE_URL}/lms/courses/${id}/edit/`,
    COURSE_DELETE: (id: string) => `${API_BASE_URL}/lms/courses/${id}/delete/`,
    COURSE_PUBLISH: (id: string) => `${API_BASE_URL}/lms/courses/${id}/publish/`,
    COURSE_UNPUBLISH: (id: string) => `${API_BASE_URL}/lms/courses/${id}/unpublish/`,
    COURSE_STATS: (id: string) => `${API_BASE_URL}/lms/courses/${id}/stats/`,
    MODULE_CREATE: `${API_BASE_URL}/lms/modules/`,
    LESSON_CREATE: `${API_BASE_URL}/lms/lessons/`,
    ROAD_SIGNS: `${API_BASE_URL}/lms/road-signs/`,
    ROAD_SIGN_CREATE: `${API_BASE_URL}/lms/road-signs/create/`,
    ROAD_SIGN_UPDATE: (id: string) => `${API_BASE_URL}/lms/road-signs/${id}/edit/`,
    QUESTIONS: `${API_BASE_URL}/lms/questions/`,
    QUESTION_CREATE: `${API_BASE_URL}/lms/questions/create/`,

    // Live Classes & Cohort Dispatch
    COHORTS: `${API_BASE_URL}/live-classes/cohorts/`,
    COHORT_DETAIL: (id: string) => `${API_BASE_URL}/live-classes/cohorts/${id}/`,
    COHORT_ASSIGN_STUDENTS: (id: string) => `${API_BASE_URL}/live-classes/cohorts/${id}/assign-students/`,
    COHORT_ASSIGN_TUTORS: (id: string) => `${API_BASE_URL}/live-classes/cohorts/${id}/assign-tutors/`,
    CLASSES: `${API_BASE_URL}/live-classes/classes/`,
    CLASS_RECURRING: `${API_BASE_URL}/live-classes/classes/recurring/`,
    CLASS_DETAIL: (id: string) => `${API_BASE_URL}/live-classes/classes/${id}/`,
    CLASS_START: (id: string) => `${API_BASE_URL}/live-classes/classes/${id}/start/`,
    CLASS_END: (id: string) => `${API_BASE_URL}/live-classes/classes/${id}/end/`,
    CLASS_CANCEL: (id: string) => `${API_BASE_URL}/live-classes/classes/${id}/cancel/`,
    CLASS_ATTENDANCE: (id: string) => `${API_BASE_URL}/live-classes/classes/${id}/attendance/`,

    // Irembo Booking Concierge Operations
    BOOKING_ORDERS: `${API_BASE_URL}/booking/admin/orders/`,
    BOOKING_ORDER_DETAIL: (id: string) => `${API_BASE_URL}/booking/admin/orders/${id}/`,
    BOOKING_ASSIGN_AGENT: (id: string) => `${API_BASE_URL}/booking/admin/orders/${id}/assign/`,
    BOOKING_STATUS_UPDATE: (id: string) => `${API_BASE_URL}/booking/admin/orders/${id}/status/`,
    BOOKING_COMPLETE: (id: string) => `${API_BASE_URL}/booking/admin/orders/${id}/complete/`,
    BOOKING_PRICING: `${API_BASE_URL}/booking/admin/pricing/`,
    BOOKING_PRICING_DETAIL: (id: string) => `${API_BASE_URL}/booking/admin/pricing/${id}/`,
    BOOKING_TEACHERS: `${API_BASE_URL}/booking/admin/teachers/`,
    BOOKING_TEACHER_DETAIL: (id: string) => `${API_BASE_URL}/booking/admin/teachers/${id}/`,

    // SMS Notifications & Communications
    NOTIFICATIONS_SMS_LOGS: `${API_BASE_URL}/notifications/admin/sms-logs/`,
    NOTIFICATIONS_SMS_LOG_DETAIL: (id: string) => `${API_BASE_URL}/notifications/admin/sms-logs/${id}/`,
    NOTIFICATIONS_SMS_RETRY: (id: string) => `${API_BASE_URL}/notifications/admin/sms-logs/${id}/retry/`,
    NOTIFICATIONS_BROADCAST: `${API_BASE_URL}/notifications/admin/broadcast/`,
    NOTIFICATIONS_TEMPLATES: `${API_BASE_URL}/notifications/admin/templates/`,
    NOTIFICATIONS_TEMPLATE_DETAIL: (id: string) => `${API_BASE_URL}/notifications/admin/templates/${id}/`,
    NOTIFICATIONS_TEST_SMS: `${API_BASE_URL}/notifications/admin/test-sms/`,
    NOTIFICATIONS_GATEWAY_STATUS: `${API_BASE_URL}/notifications/admin/gateway-status/`,

    // Examinations Hub & Certification Pipeline
    EXAM_SESSIONS: `${API_BASE_URL}/examinations/admin/sessions/`,
    EXAM_SESSION_DETAIL: (id: string) => `${API_BASE_URL}/examinations/admin/sessions/${id}/`,
    EXAM_SESSION_ACTION: (id: string) => `${API_BASE_URL}/examinations/admin/sessions/${id}/action/`,
    EXAM_PUBLISH: `${API_BASE_URL}/examinations/admin/publish/`,
    EXAM_CERTIFICATES: `${API_BASE_URL}/examinations/admin/certificates/`,
    EXAM_CERTIFICATE_DETAIL: (id: string) => `${API_BASE_URL}/examinations/admin/certificates/${id}/`,
    EXAM_CERTIFICATE_TEMPLATES: `${API_BASE_URL}/examinations/admin/templates/`,
    EXAM_CERTIFICATE_TEMPLATE_DETAIL: (id: string) => `${API_BASE_URL}/examinations/admin/templates/${id}/`,
    EXAM_QUESTIONS: `${API_BASE_URL}/examinations/admin/questions/`,
    EXAM_QUESTION_DETAIL: (id: string) => `${API_BASE_URL}/examinations/admin/questions/${id}/`,
    EXAM_CERTIFICATE_VERIFY: (hashOrCode: string) => `${API_BASE_URL}/examinations/verify/${hashOrCode}/`,

    // Security & Cryptographic Audit
    AUDIT_LOGS: `${API_BASE_URL}/audit/logs/`,
    AUDIT_LOG_DETAIL: (id: string) => `${API_BASE_URL}/audit/logs/${id}/`,
    AUDIT_INTEGRITY: `${API_BASE_URL}/audit/integrity/`,
    AUDIT_CRITICAL: `${API_BASE_URL}/audit/critical/`,
    AUDIT_USER_TRAIL: (userId: string) => `${API_BASE_URL}/audit/users/${userId}/`,

    // Analytics Hub
    ANALYTICS: (timeframe: string = '30d') => `${API_BASE_URL}/auth/admin/analytics/?timeframe=${encodeURIComponent(timeframe)}`,

    // Agents & Staff Hub
    STAFF: `${API_BASE_URL}/auth/staff/`,
    STAFF_METRICS: `${API_BASE_URL}/auth/staff/metrics/`,
    STAFF_DETAIL: (id: string) => `${API_BASE_URL}/auth/staff/${id}/`,
    AGENT_COMMISSIONS: `${API_BASE_URL}/auth/agent-commissions/`,
    AGENT_COMMISSION_RATES: `${API_BASE_URL}/auth/agent-commissions/rates/`,
    AGENT_PAYOUT: `${API_BASE_URL}/auth/agent-commissions/payout/`,
    AGENT_ONBOARD_CLIENT: `${API_BASE_URL}/auth/agent/onboard-client/`,
    AGENT_FACILITATE_SERVICE: `${API_BASE_URL}/auth/agent/facilitate-service/`,
  },
} as const;

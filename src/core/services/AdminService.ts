import { ApiEndpoints } from '../api/ApiEndpoints';
import { HttpClient } from '../api/HttpClient';
import { Logger } from '../utils/Logger';

const logger = new Logger('AdminService');

export interface AdminUserItem {
  id: string;
  phone_number: string;
  role: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  status: string;
  is_active?: boolean;
  student_id?: string | null;
  school_name?: string | null;
  station_quota?: number | null;
  has_national_id?: boolean;
  assigned_tutor_name?: string | null;
  national_id?: string | null;
  national_id_encrypted?: string | null;
  terms_of_service_accepted?: boolean;
  terms_of_service_accepted_at?: string | null;
  privacy_policy_accepted?: boolean;
  privacy_policy_accepted_at?: string | null;
  created_at: string;
  updated_at?: string;
  last_login?: string | null;
}

export interface PaginatedResult<T> {
  count: number;
  results: T[];
  next?: string | null;
  previous?: string | null;
}

export interface BookingOrderItem {
  id: string;
  applicant_name?: string;
  applicant_phone?: string;
  category: string;
  district: string;
  preferred_date?: string;
  status: 'PENDING' | 'SUBMITTED' | 'CODE_GENERATED' | 'PAID' | 'COMPLETED' | 'CANCELLED';
  application_number?: string | null;
  bill_id?: string | null;
  assigned_agent?: { id: string; full_name?: string; phone_number?: string } | null;
  created_at: string;
  amount?: number;
}

export interface CategoryPricingItem {
  id: string;
  category_code: string;
  category_name: string;
  base_fee_rwf: number;
  service_fee_rwf: number;
  total_fee_rwf: number;
  is_active: boolean;
}

export interface PartnerTeacherItem {
  id: string;
  name: string;
  phone_number: string;
  districts_served?: string[];
  vehicle_categories?: string[];
  is_active: boolean;
}

export interface CohortItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  student_count?: number;
  primary_tutor?: { id: string; full_name?: string } | null;
}

export interface LiveClassAdminItem {
  id: string;
  title: string;
  topic?: string;
  cohort_name?: string;
  cohort_code?: string;
  tutor_name?: string;
  scheduled_date?: string;
  start_time?: string;
  end_time?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  google_meet_url?: string;
  meeting_link?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  attendee_count?: number;
}

export interface SMSLogItem {
  id: string;
  recipient_phone: string;
  recipient?: string;
  phone_obfuscated?: string;
  message_body: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED' | 'PENDING' | string;
  message_type?: string;
  sender_id?: string;
  provider?: string;
  provider_message_id?: string;
  retry_count?: number;
  error_message?: string;
  provider_response?: any;
  sent_at?: string;
  delivered_at?: string;
  created_at: string;
}

export interface GatewayStatusItem {
  connected: boolean;
  provider: string;
  endpoint: string;
  sender_id?: string;
  recent_outbound_count?: number;
  status_code?: number;
  error?: string;
  message?: string;
}

export interface SMSTemplateItem {
  id: string;
  template_code?: string;
  code?: string;
  title_template?: string;
  name?: string;
  body_template?: string;
  body?: string;
  channel?: string;
  language?: string;
  notification_type?: string;
  description?: string;
  variables?: string[];
}

export interface AuditLogItem {
  id: string;
  action: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  actor_phone?: string;
  actor_role?: string;
  ip_address?: string;
  created_at: string;
  payload?: Record<string, unknown>;
  checksum_valid?: boolean;
}

export interface AuditIntegrityStats {
  verified: boolean;
  total_records: number;
  tampered_count: number;
  last_verified_hash?: string;
  system_integrity: 'SECURE' | 'COMPROMISED';
}

export interface AdminDashboardStats {
  total_registered_users: number;
  total_booking_orders: number;
  enrolled_students: number;
  total_graduated_students: number;
  lms_courses: number;
}

export class AdminService {
  private static instance: AdminService;
  private readonly http: HttpClient;

  private constructor() {
    this.http = HttpClient.getInstance();
  }

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  public async getDashboardStats(): Promise<AdminDashboardStats> {
    logger.debug('Fetching admin dashboard platform metrics');
    try {
      return await this.http.get<AdminDashboardStats>(ApiEndpoints.ADMIN.STATS);
    } catch {
      const [usersRes, studentsRes, bookingsRes, coursesRes] = await Promise.allSettled([
        this.getUsers({ page: 1 }),
        this.getUsers({ role: 'STUDENT', page: 1 }),
        this.getBookingOrders(),
        this.getCourses(),
      ]);

      return {
        total_registered_users: usersRes.status === 'fulfilled' ? usersRes.value.count : 0,
        total_booking_orders: bookingsRes.status === 'fulfilled' ? bookingsRes.value.count : 0,
        enrolled_students: studentsRes.status === 'fulfilled' ? studentsRes.value.count : 0,
        total_graduated_students: 0,
        lms_courses: coursesRes.status === 'fulfilled' ? coursesRes.value.length : 0,
      };
    }
  }

  // -------------------------------------------------------------------------
  // 1. User Management (System Admin Only)
  // -------------------------------------------------------------------------
  public async getUsers(params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
  }): Promise<PaginatedResult<AdminUserItem>> {
    logger.debug('Fetching user directory from backend');
    const query = new URLSearchParams();
    if (params?.role && params.role !== 'ALL') query.set('role', params.role);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));

    const url = `${ApiEndpoints.ADMIN.USERS}${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await this.http.get<any>(url);

    // Normalize pagination envelope if DRF Paginated vs direct array
    if (res && Array.isArray(res.results)) {
      return res as PaginatedResult<AdminUserItem>;
    }
    if (Array.isArray(res)) {
      return { count: res.length, results: res };
    }
    return { count: 0, results: [] };
  }

  public async createUser(payload: {
    phone_number: string;
    first_name: string;
    last_name: string;
    email?: string;
    role: string;
    password: string;
    school_name?: string;
    station_quota?: number;
  }): Promise<AdminUserItem> {
    logger.info('Creating new user account via admin', { role: payload.role });
    return await this.http.post<AdminUserItem>(ApiEndpoints.ADMIN.USER_CREATE, payload);
  }

  public async getUserDetail(userId: string): Promise<AdminUserItem> {
    logger.debug('Fetching user detail for inspection', { userId });
    return await this.http.get<AdminUserItem>(ApiEndpoints.ADMIN.USER_DETAIL(userId));
  }

  public async updateUserRole(userId: string, role: string): Promise<AdminUserItem> {
    logger.info('Updating user role', { userId, role });
    return await this.http.post<AdminUserItem>(ApiEndpoints.ADMIN.USER_ROLE(userId), { role });
  }

  public async updateUserStatus(
    userId: string,
    status: 'ACTIVE' | 'DEACTIVATED' | 'SUSPENDED' | 'BLACKLISTED',
    reason?: string
  ): Promise<AdminUserItem> {
    logger.info('Updating user account status', { userId, status });
    return await this.http.post<AdminUserItem>(ApiEndpoints.ADMIN.USER_STATUS(userId), { status, reason });
  }

  // -------------------------------------------------------------------------
  // 2. LMS Studio (Courses, Road Signs, Questions)
  // -------------------------------------------------------------------------
  public async getCourses(): Promise<any[]> {
    logger.debug('Fetching courses for System Admin studio');
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.COURSES);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.results)) return res.results;
    return [];
  }

  public async createCourse(payload: {
    title: string;
    title_rw?: string;
    code: string;
    description?: string;
    is_published?: boolean;
  }): Promise<any> {
    logger.info(`Creating course: ${payload.title}`);
    return this.http.post(ApiEndpoints.ADMIN.COURSE_CREATE, payload);
  }

  public async publishCourse(id: string): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.COURSE_PUBLISH(id), {});
  }

  public async unpublishCourse(id: string): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.COURSE_UNPUBLISH(id), {});
  }

  public async deleteCourse(id: string): Promise<void> {
    return this.http.delete(ApiEndpoints.ADMIN.COURSE_DELETE(id));
  }

  public async getCourseStats(id: string): Promise<any> {
    return this.http.get(ApiEndpoints.ADMIN.COURSE_STATS(id));
  }

  public async getRoadSigns(): Promise<any[]> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.ROAD_SIGNS);
    return Array.isArray(res) ? res : res?.results || [];
  }

  public async createRoadSign(payload: FormData | Record<string, any>): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.ROAD_SIGN_CREATE, payload);
  }

  public async getQuestions(params?: { category?: string }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    const url = `${ApiEndpoints.ADMIN.QUESTIONS}${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await this.http.get<any>(url);
    return Array.isArray(res) ? res : res?.results || [];
  }

  public async createQuestion(payload: any): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.QUESTION_CREATE, payload);
  }

  // -------------------------------------------------------------------------
  // 3. Irembo Booking Concierge Operations
  // -------------------------------------------------------------------------
  public async getBookingOrders(params?: {
    status?: string;
    search?: string;
  }): Promise<PaginatedResult<BookingOrderItem>> {
    logger.debug('Fetching Irembo admin orders queue');
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const url = `${ApiEndpoints.ADMIN.BOOKING_ORDERS}${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await this.http.get<any>(url);
    if (res && Array.isArray(res.results)) return res;
    if (Array.isArray(res)) return { count: res.length, results: res };
    return { count: 0, results: [] };
  }

  public async assignBookingAgent(orderId: string, agentId: string): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.BOOKING_ASSIGN_AGENT(orderId), { agent_id: agentId });
  }

  public async updateBookingStatus(orderId: string, payload: { status: string; notes?: string }): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.BOOKING_STATUS_UPDATE(orderId), payload);
  }

  public async completeBookingOrder(
    orderId: string,
    payload: { application_number: string; bill_id?: string; notes?: string }
  ): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.BOOKING_COMPLETE(orderId), payload);
  }

  public async getCategoryPricing(): Promise<CategoryPricingItem[]> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.BOOKING_PRICING);
    return Array.isArray(res) ? res : res?.results || [];
  }

  public async getPartnerTeachers(): Promise<PartnerTeacherItem[]> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.BOOKING_TEACHERS);
    return Array.isArray(res) ? res : res?.results || [];
  }

  // -------------------------------------------------------------------------
  // 4. Live Classes & Cohort Dispatch
  // -------------------------------------------------------------------------
  public async getCohorts(): Promise<CohortItem[]> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.COHORTS);
    return Array.isArray(res) ? res : res?.results || [];
  }

  public async createCohort(payload: {
    name: string;
    start_date: string;
    end_date: string;
    description?: string;
    code?: string;
  }): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.COHORTS, payload);
  }

  public async getLiveClasses(): Promise<LiveClassAdminItem[]> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.CLASSES);
    return Array.isArray(res) ? res : res?.results || [];
  }

  public async createLiveClass(payload: {
    title: string;
    cohort_id?: string;
    tutor_id?: string;
    scheduled_at: string;
    duration_minutes: number;
    meeting_link?: string;
  }): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.CLASSES, payload);
  }

  public async scheduleRecurringClasses(payload: {
    title: string;
    cohort?: string;
    tutor?: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    start_date: string;
    period_months: number;
    google_meet_url?: string;
    topic?: string;
    notes?: string;
  }): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.CLASS_RECURRING, payload);
  }

  public async startLiveClass(id: string): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.CLASS_START(id), {});
  }

  public async endLiveClass(id: string): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.CLASS_END(id), {});
  }

  public async cancelLiveClass(id: string, reason?: string): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.CLASS_CANCEL(id), { reason });
  }

  // -------------------------------------------------------------------------
  // 5. SMS Communications Hub
  // -------------------------------------------------------------------------
  public async getSmsLogs(params?: {
    page?: number;
    phone?: string;
    status?: string;
  }): Promise<PaginatedResult<SMSLogItem>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.phone) query.set('phone', params.phone);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    const url = `${ApiEndpoints.ADMIN.NOTIFICATIONS_SMS_LOGS}${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await this.http.get<any>(url);
    if (res && Array.isArray(res.results)) return res;
    if (Array.isArray(res)) return { count: res.length, results: res };
    return { count: 0, results: [] };
  }

  public async getGatewayStatus(): Promise<GatewayStatusItem> {
    return this.http.get<GatewayStatusItem>(ApiEndpoints.ADMIN.NOTIFICATIONS_GATEWAY_STATUS);
  }

  public async retrySms(id: string): Promise<SMSLogItem> {
    return this.http.post<SMSLogItem>(ApiEndpoints.ADMIN.NOTIFICATIONS_SMS_RETRY(id), {});
  }

  public async broadcastSms(payload: {
    audience: 'ALL' | 'STUDENTS' | 'GUESTS' | 'COHORT' | 'TUTORS';
    message: string;
    title?: string;
    cohort_id?: string;
  }): Promise<any> {
    logger.info(`Sending SMS broadcast to audience: ${payload.audience}`);
    return this.http.post(ApiEndpoints.ADMIN.NOTIFICATIONS_BROADCAST, payload);
  }

  public async getSmsTemplates(): Promise<SMSTemplateItem[]> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.NOTIFICATIONS_TEMPLATES);
    return Array.isArray(res) ? res : res?.results || [];
  }

  public async sendTestSms(phoneNumber: string, message: string, messageType: string = 'GENERAL'): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.NOTIFICATIONS_TEST_SMS, {
      phone_number: phoneNumber,
      message,
      message_type: messageType,
    });
  }

  // -------------------------------------------------------------------------
  // 6. Security & Cryptographic Audit
  // -------------------------------------------------------------------------
  public async getAuditLogs(params?: {
    action?: string;
    severity?: string;
    page?: number;
  }): Promise<PaginatedResult<AuditLogItem>> {
    const query = new URLSearchParams();
    if (params?.action) query.set('action', params.action);
    if (params?.severity) query.set('severity', params.severity);
    if (params?.page) query.set('page', String(params.page));

    const url = `${ApiEndpoints.ADMIN.AUDIT_LOGS}${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await this.http.get<any>(url);
    if (res && Array.isArray(res.results)) return res;
    if (Array.isArray(res)) return { count: res.length, results: res };
    return { count: 0, results: [] };
  }

  public async getIntegrityStats(): Promise<AuditIntegrityStats> {
    return this.http.get<AuditIntegrityStats>(ApiEndpoints.ADMIN.AUDIT_INTEGRITY);
  }

  public async getCriticalAuditEvents(): Promise<AuditLogItem[]> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.AUDIT_CRITICAL);
    return Array.isArray(res) ? res : res?.results || [];
  }

  // -------------------------------------------------------------------------
  // 7. Examination Lifecycle, Review Pipeline & Question Bank Studio
  // -------------------------------------------------------------------------
  public async getExamSessions(params?: {
    cohort?: string;
    status?: string;
    track?: string;
    search?: string;
    page?: number;
  }): Promise<PaginatedResult<ExamSessionItem>> {
    const query = new URLSearchParams();
    if (params?.cohort) query.set('cohort', params.cohort);
    if (params?.status) query.set('status', params.status);
    if (params?.track) query.set('track', params.track);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));

    const url = `${ApiEndpoints.ADMIN.EXAM_SESSIONS}${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await this.http.get<any>(url);
    if (res && Array.isArray(res.results)) return res;
    if (Array.isArray(res)) return { count: res.length, results: res };
    return { count: 0, results: [] };
  }

  public async getExamSessionDetail(id: string): Promise<ExamSessionDetailItem> {
    return this.http.get<ExamSessionDetailItem>(ApiEndpoints.ADMIN.EXAM_SESSION_DETAIL(id));
  }

  public async executeExamStageAction(
    id: string,
    action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES',
    notes?: string
  ): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.EXAM_SESSION_ACTION(id), { action, notes });
  }

  public async publishExams(payload: {
    publish_type: 'SINGLE' | 'BATCH' | 'COHORT';
    session_id?: string;
    session_ids?: string[];
    cohort_id?: string;
  }): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.EXAM_PUBLISH, payload);
  }

  public async getCertificates(params?: {
    track_type?: string;
    search?: string;
    page?: number;
  }): Promise<PaginatedResult<CertificateItem>> {
    const query = new URLSearchParams();
    if (params?.track_type) query.set('track_type', params.track_type);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));

    const url = `${ApiEndpoints.ADMIN.EXAM_CERTIFICATES}${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await this.http.get<any>(url);
    if (res && Array.isArray(res.results)) return res;
    if (Array.isArray(res)) return { count: res.length, results: res };
    return { count: 0, results: [] };
  }

  public async getCertificateTemplates(): Promise<CertificateTemplateItem[]> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.EXAM_CERTIFICATE_TEMPLATES);
    return Array.isArray(res) ? res : res?.results || [];
  }

  public async updateCertificateTemplate(
    id: string,
    data: Partial<CertificateTemplateItem>
  ): Promise<CertificateTemplateItem> {
    return this.http.patch<CertificateTemplateItem>(
      ApiEndpoints.ADMIN.EXAM_CERTIFICATE_TEMPLATE_DETAIL(id),
      data
    );
  }

  public async getQuestionBank(params?: {
    domain?: string;
    search?: string;
    is_active?: boolean;
    page?: number;
  }): Promise<PaginatedResult<AdminQuizQuestionItem>> {
    const query = new URLSearchParams();
    if (params?.domain) query.set('domain', params.domain);
    if (params?.search) query.set('search', params.search);
    if (params?.is_active !== undefined) query.set('is_active', String(params.is_active));
    if (params?.page) query.set('page', String(params.page));

    const url = `${ApiEndpoints.ADMIN.EXAM_QUESTIONS}${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await this.http.get<any>(url);
    if (res && Array.isArray(res.results)) return res;
    if (Array.isArray(res)) return { count: res.length, results: res };
    return { count: 0, results: [] };
  }

  public async updateQuizQuestion(
    id: string,
    data: Partial<AdminQuizQuestionItem>
  ): Promise<AdminQuizQuestionItem> {
    return this.http.patch<AdminQuizQuestionItem>(
      ApiEndpoints.ADMIN.EXAM_QUESTION_DETAIL(id),
      data
    );
  }

  public async verifyPublicCertificate(hashOrCode: string): Promise<any> {
    return this.http.get<any>(ApiEndpoints.ADMIN.EXAM_CERTIFICATE_VERIFY(hashOrCode));
  }
}

// ---------------------------------------------------------------------------
// Examination Types
// ---------------------------------------------------------------------------
export interface ExamSessionItem {
  id: string;
  student: string;
  student_name: string;
  student_phone: string;
  student_id_number?: string;
  cohort?: string | null;
  cohort_name?: string | null;
  track: 'B2C' | 'B2B';
  track_type: 'STUDENT' | 'GUEST' | 'ENTERPRISE';
  enterprise_name?: string;
  status:
    | 'PENDING'
    | 'ACTIVE'
    | 'SUBMITTED'
    | 'BOARD_REVIEW'
    | 'TRAINING_REVIEW'
    | 'SYSTEM_REVIEW'
    | 'APPROVED'
    | 'PUBLISHED'
    | 'FLAGGED'
    | 'REJECTED'
    | 'EXPIRED';
  score?: number | null;
  total_questions: number;
  passing_score: number;
  percentage?: number | null;
  passed?: boolean | null;
  started_at?: string | null;
  submitted_at?: string | null;
  board_decision?: string;
  board_reviewed_at?: string | null;
  training_decision?: string;
  training_reviewed_at?: string | null;
  approved_at?: string | null;
  published_at?: string | null;
  is_published: boolean;
  can_system_approve: boolean;
  can_publish: boolean;
  current_stage_label: string;
  certificate_id?: string | null;
  certificate_number?: string | null;
  created_at: string;
}

export interface SessionQuestionDetailItem {
  id: string;
  sequence_number: number;
  question_id: string;
  question_number?: number;
  domain?: string;
  question_text: string;
  question_text_kinyarwanda?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  selected_option: string;
  correct_option: string;
  is_correct?: boolean | null;
  answered_at?: string | null;
  image?: string | null;
  explanation?: string;
  explanation_kinyarwanda?: string;
}

export interface ProctoringEventItem {
  id: string;
  event_type: string;
  timestamp: string;
  snapshot_image?: string | null;
  flagged_reason?: string;
}

export interface ExamSessionDetailItem extends ExamSessionItem {
  board_reviewer?: { id: string; full_name?: string; phone_number?: string } | null;
  board_notes?: string;
  training_admin?: { id: string; full_name?: string; phone_number?: string } | null;
  training_notes?: string;
  approved_by?: { id: string; full_name?: string; phone_number?: string } | null;
  approval_notes?: string;
  published_by?: { id: string; full_name?: string; phone_number?: string } | null;
  questions: SessionQuestionDetailItem[];
  proctoring_events: ProctoringEventItem[];
  certificate?: {
    id: string;
    certificate_number: string;
    verification_hash: string;
    verification_url: string;
  } | null;
}

export interface CertificateItem {
  id: string;
  certificate_number: string;
  exam_session: string;
  student: string;
  student_name: string;
  student_code: string;
  track_type: 'STUDENT' | 'GUEST' | 'ENTERPRISE';
  enterprise_name?: string;
  cohort_name?: string;
  started_at?: string | null;
  completed_at: string;
  score: number;
  total_questions: number;
  passing_score: number;
  passed: boolean;
  issue_date: string;
  verification_hash: string;
  verification_url: string;
  template_snapshot: any;
  is_valid: boolean;
  created_at: string;
}

export interface CertificateTemplateItem {
  id: string;
  template_type: 'STUDENT' | 'GUEST' | 'ENTERPRISE';
  header_subtitle?: string;
  title: string;
  conferral_text?: string;
  course_name: string;
  declaration_text: string;
  confirmation_notes: string;
  logo_url: string;
  training_admin_name: string;
  training_admin_title: string;
  training_admin_signature: string;
  director_name: string;
  director_title: string;
  director_signature: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminQuizQuestionItem {
  id: string;
  question_number: number;
  domain: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question_text: string;
  question_text_kinyarwanda: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_a_kinyarwanda: string;
  option_b_kinyarwanda: string;
  option_c_kinyarwanda: string;
  option_d_kinyarwanda: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  explanation_kinyarwanda: string;
  image?: string | null;
  is_active: boolean;
  road_sign_id?: string | null;
  created_at: string;
  updated_at: string;
}

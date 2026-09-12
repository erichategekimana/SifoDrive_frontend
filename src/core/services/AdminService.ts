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
  student_id?: string | null;
  national_id?: string | null;
  national_id_encrypted?: string | null;
  terms_of_service_accepted?: boolean;
  privacy_policy_accepted?: boolean;
  created_at: string;
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
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  student_count?: number;
  primary_tutor?: { id: string; full_name?: string } | null;
}

export interface LiveClassAdminItem {
  id: string;
  title: string;
  cohort_name?: string;
  tutor_name?: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_link?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  attendee_count?: number;
}

export interface SMSLogItem {
  id: string;
  recipient: string;
  message_body: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED' | 'PENDING';
  message_type?: string;
  provider?: string;
  created_at: string;
}

export interface SMSTemplateItem {
  id: string;
  name: string;
  code: string;
  body: string;
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

  public async createCohort(payload: { name: string; start_date: string; end_date?: string }): Promise<any> {
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
  public async getSmsLogs(params?: { page?: number }): Promise<PaginatedResult<SMSLogItem>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    const url = `${ApiEndpoints.ADMIN.NOTIFICATIONS_SMS_LOGS}${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await this.http.get<any>(url);
    if (res && Array.isArray(res.results)) return res;
    if (Array.isArray(res)) return { count: res.length, results: res };
    return { count: 0, results: [] };
  }

  public async broadcastSms(payload: {
    audience: 'ALL' | 'STUDENTS' | 'GUESTS' | 'COHORT';
    message: string;
    cohort_id?: string;
  }): Promise<any> {
    logger.info(`Sending SMS broadcast to audience: ${payload.audience}`);
    return this.http.post(ApiEndpoints.ADMIN.NOTIFICATIONS_BROADCAST, payload);
  }

  public async getSmsTemplates(): Promise<SMSTemplateItem[]> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.NOTIFICATIONS_TEMPLATES);
    return Array.isArray(res) ? res : res?.results || [];
  }

  public async sendTestSms(phoneNumber: string, message: string): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.NOTIFICATIONS_TEST_SMS, {
      phone_number: phoneNumber,
      message,
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
}

import { ApiEndpoints } from '../api/ApiEndpoints';
import { HttpClient } from '../api/HttpClient';
import { LocalStorageService } from '../storage/LocalStorageService';
import { Logger } from '../utils/Logger';
import type { CohortActivityItem } from './TutorLmsService';

export type { CohortActivityItem };

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
  cohort_name?: string | null;
  cohort_id?: string | null;
  school_name?: string | null;
  station_quota?: number | null;
  has_national_id?: boolean;
  assigned_tutor_name?: string | null;
  assigned_tutor_id?: string | null;
  assigned_tutor_phone?: string | null;
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

export interface CurriculumItem {
  id: string;
  title: string;
  title_kinyarwanda?: string;
  code?: string;
  description?: string;
  description_kinyarwanda?: string;
  thumbnail?: string | null;
  sort_order?: number;
  is_published: boolean;
  published_at?: string | null;
  course_count: number;
  published_course_count: number;
  created_at: string;
  updated_at: string;
}

export interface CohortItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: 'queue' | 'open' | 'closed' | 'ended';
  identifier?: string;
  is_active: boolean;
  max_capacity?: number;
  student_count?: number;
  tutor_count?: number;
  ongoing_student_count?: number;
  schedule_description?: string;
  assigned_tutors?: Array<{ id: string; full_name?: string; phone_number?: string; email?: string }>;
  primary_tutor?: { id: string; full_name?: string } | null;
}

export interface LiveClassAdminItem {
  id: string;
  title: string;
  topic?: string;
  cohort?: string;
  cohort_id?: string;
  cohort_name?: string;
  cohort_code?: string;
  tutor?: string;
  tutor_id?: string;
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
  created_by_name?: string;
  created_by_role?: string;
  notes?: string;
  is_published?: boolean;
  recording_url?: string;
}

export interface LiveClassScheduleItem {
  id: string;
  title: string;
  topic?: string;
  cohort?: string;
  cohort_id?: string;
  cohort_name?: string;
  cohort_code?: string;
  tutor?: string;
  tutor_id?: string;
  tutor_name?: string;
  schedule_mode: 'SINGLE' | 'RECURRING';
  days_of_week: number[];
  start_time: string;
  end_time: string;
  start_date: string;
  end_date?: string;
  period_months?: number;
  period_unit?: 'months' | 'years';
  google_meet_url?: string;
  is_published?: boolean;
  notes?: string;
  is_active?: boolean;
  created_by_name?: string;
  created_by_role?: string;
  total_sessions_count: number;
  next_upcoming_session?: {
    id: string;
    title: string;
    scheduled_date: string;
    start_time: string;
    end_time: string;
    google_meet_url?: string;
    status: string;
  } | null;
  sessions?: LiveClassAdminItem[];
  created_at?: string;
}

export interface QuizQuestionItem {
  id?: string;
  sort_order?: number;
  original_question?: string | null;
  points: number;
  question_text: string;
  question_text_kinyarwanda?: string;
  question_text_french?: string;
  option_a: string;
  option_b: string;
  option_c?: string;
  option_d?: string;
  option_a_kinyarwanda?: string;
  option_b_kinyarwanda?: string;
  option_c_kinyarwanda?: string;
  option_d_kinyarwanda?: string;
  option_a_french?: string;
  option_b_french?: string;
  option_c_french?: string;
  option_d_french?: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  explanation_kinyarwanda?: string;
  explanation_french?: string;
  domain?: string;
}

export interface QuizItem {
  id: string;
  course: string;
  course_title: string;
  module?: string | null;
  module_title?: string | null;
  quiz_type?: 'LIVE_TIMED' | 'WORK_SUBMISSION';
  enable_proctoring?: boolean;
  max_tab_switches_allowed?: number;
  title: string;
  title_kinyarwanda?: string;
  title_french?: string;
  description?: string;
  description_kinyarwanda?: string;
  description_french?: string;
  open_date?: string | null;
  deadline?: string | null;
  closing_date?: string | null;
  allow_late_submission?: boolean;
  is_final_exam?: boolean;
  time_limit_minutes: number;
  total_score: number;
  calculated_total_points?: number;
  passing_score: number;
  rubric?: string;
  rubric_kinyarwanda?: string;
  rubric_french?: string;
  max_attempts: number;
  shuffle_questions: boolean;
  is_published: boolean;
  is_locked?: boolean;
  release_grades_immediately?: boolean;
  grades_published?: boolean;
  allow_tutor_scheduling?: boolean;
  allow_tutor_edit_instructions?: boolean;
  allow_tutor_edit_duration?: boolean;
  allow_tutor_edit_attempts?: boolean;
  status: 'DRAFT' | 'SCHEDULED' | 'OPEN' | 'CLOSED';
  question_count: number;
  created_by?: string | null;
  created_by_detail?: {
    id: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string;
  } | null;
  items?: QuizQuestionItem[];
  created_at: string;
  updated_at: string;
}

export interface QuizPayload {
  course: string;
  course_title?: string;
  module?: string | null;
  module_title?: string | null;
  quiz_type?: 'LIVE_TIMED' | 'WORK_SUBMISSION';
  enable_proctoring?: boolean;
  max_tab_switches_allowed?: number;
  title: string;
  title_kinyarwanda?: string;
  description?: string;
  description_kinyarwanda?: string;
  open_date?: string | null;
  deadline?: string | null;
  closing_date?: string | null;
  allow_late_submission?: boolean;
  is_final_exam?: boolean;
  time_limit_minutes?: number;
  total_score?: number;
  passing_score?: number;
  rubric?: string;
  rubric_kinyarwanda?: string;
  max_attempts?: number;
  shuffle_questions?: boolean;
  is_published?: boolean;
  release_grades_immediately?: boolean;
  allow_tutor_scheduling?: boolean;
  allow_tutor_edit_instructions?: boolean;
  allow_tutor_edit_duration?: boolean;
  allow_tutor_edit_attempts?: boolean;
  items?: QuizQuestionItem[];
}

export interface AdminExamItem {
  id: string;
  title: string;
  title_kinyarwanda?: string;
  title_french?: string;
  exam_type: 'STUDENT' | 'PUBLIC_PRACTICE';
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  cohort_id?: string | null;
  cohort_name?: string;
  open_date?: string | null;
  due_date?: string | null;
  closing_date?: string | null;
  instructions?: string;
  instructions_kinyarwanda?: string;
  instructions_french?: string;
  rubric?: string;
  rubric_kinyarwanda?: string;
  rubric_french?: string;
  is_published: boolean;
  total_questions: number;
  duration_minutes: number;
  points_per_question: number;
  passing_score: number;
  created_at: string;
  updated_at: string;
  created_by_name?: string;
  active_sessions_count: number;
  completed_sessions_count: number;
}

export interface AdminExamPayload {
  title: string;
  title_kinyarwanda?: string;
  title_french?: string;
  exam_type?: 'STUDENT' | 'PUBLIC_PRACTICE';
  status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  cohort_id?: string | null;
  cohort_name?: string;
  open_date?: string | null;
  due_date?: string | null;
  closing_date?: string | null;
  instructions?: string;
  instructions_kinyarwanda?: string;
  instructions_french?: string;
  rubric?: string;
  rubric_kinyarwanda?: string;
  rubric_french?: string;
  is_published?: boolean;
}

export interface CandidateExamQuestionItem {
  sequence_number: number;
  selected_option: string;
  answered_at?: string | null;
  id: string;
  question_number: number;
  domain: string;
  question_text: string;
  question_text_kinyarwanda?: string;
  question_text_french?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_a_kinyarwanda?: string;
  option_b_kinyarwanda?: string;
  option_c_kinyarwanda?: string;
  option_d_kinyarwanda?: string;
  option_a_french?: string;
  option_b_french?: string;
  option_c_french?: string;
  option_d_french?: string;
  image?: string | null;
  // Post-submission review fields:
  correct_option?: string;
  is_correct?: boolean | null;
  explanation?: string;
  explanation_kinyarwanda?: string;
  explanation_french?: string;
}

export interface CandidateSessionItem {
  id: string;
  session_token?: string;
  candidate_name?: string;
  candidate_phone?: string;
  exam_id?: string | null;
  exam_title: string;
  track: 'STUDENT' | 'GUEST' | 'PUBLIC' | 'B2B';
  status: string;
  started_at: string;
  expires_at?: string;
  submitted_at?: string | null;
  duration_minutes: number;
  time_remaining_seconds?: number;
  total_questions: number;
  answered_count?: number;
  violation_count?: number;
  score?: number | null;
  passing_score?: number;
  passed?: boolean | null;
  questions: CandidateExamQuestionItem[];
}

export interface StudentAvailableExamItem extends AdminExamItem {
  window_status: 'UPCOMING' | 'OPEN' | 'CLOSED';
  can_start: boolean;
  attempt?: {
    has_attempt: boolean;
    attempt_id?: string | null;
    status: string;
    score?: number | null;
    passed?: boolean | null;
    total_questions: number;
    passing_score: number;
    time_remaining_seconds: number;
  };
}

export interface ExamPackageItem {
  key: string;
  name: string;
  name_kinyarwanda?: string;
  name_french?: string;
  credits: number;
  price_rwf: number;
  badge?: string;
  description: string;
  min_exams?: number;
  max_exams?: number;
  default_exams?: number;
  price_per_exam_rwf?: number;
  is_active?: boolean;
  isActive?: boolean;
}

export interface ExamCreditBalance {
  identifier: string;
  is_registered?: boolean;
  credits: number;
  total_purchased: number;
  total_consumed: number;
  last_purchased_at?: string;
  transactions_count?: number;
  full_name?: string;
  candidate_name?: string;
  is_authorized?: boolean;
}


export interface QuizSubmissionItem {
  id: string;
  quiz: string;
  quiz_title: string;
  student: string;
  student_name: string;
  student_phone: string;
  cohort?: string | null;
  cohort_name?: string | null;
  attempt_number: number;
  quiz_type: 'LIVE_TIMED' | 'WORK_SUBMISSION';
  score: number | null;
  total_score: number;
  percentage: number | null;
  is_passed: boolean | null;
  is_grades_published?: boolean;
  student_answers?: Record<string, string>;
  work_submission_text?: string;
  work_submission_file?: string | null;
  work_submission_file_url?: string | null;
  question_breakdown?: Array<{
    item_id: string;
    order: number;
    question_text: string;
    question_text_kinyarwanda?: string;
    question_text_french?: string;
    points: number;
    options: Record<string, string>;
    options_kinyarwanda?: Record<string, string>;
    options_french?: Record<string, string>;
    correct_option: string;
    explanation?: string;
    explanation_kinyarwanda?: string;
    explanation_french?: string;
    student_answer?: string;
    is_correct: boolean;
    is_flagged_for_review?: boolean;
  }>;
  flagged_questions?: Array<string | number>;
  time_spent_seconds: number;
  tab_switch_count: number;
  proctoring_violations?: Array<{ timestamp: string; event?: string; reason?: string }>;
  is_flagged: boolean;
  is_auto_graded?: boolean;
  auto_score?: number | null;
  is_grade_overridden?: boolean;
  grade_overridden_by?: string | null;
  grade_overridden_by_name?: string | null;
  grade_overridden_at?: string | null;
  grade_override_reason?: string | null;
  feedback?: string;
  graded_by?: string | null;
  graded_by_name?: string | null;
  graded_at?: string | null;
  created_at: string;
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
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'INFO' | 'WARNING';
  created_at: string;
  timestamp?: string;
  performed_by_id?: string;
  performed_by_phone?: string;
  target_user_id?: string;
  object_type?: string;
  object_id?: string;
  ip_address?: string;
  request_id?: string;
  http_method?: string;
  endpoint?: string;
  context?: Record<string, unknown>;
  record_hash?: string;
  hash_valid?: boolean | null;
  actor_phone?: string;
  actor_role?: string;
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

export interface StaffUserItem {
  id: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  role: 'AGENT' | 'TUTOR' | 'TRAINING_ADMIN' | 'BOARD_REVIEWER' | 'ENTERPRISE_ADMIN' | 'SYSTEM_ADMIN' | string;
  status: string;
  is_active: boolean;
  school_name?: string;
  agent_code?: string;
  business_name?: string;
  district?: string;
  sector?: string;
  total_accrued_rwf?: number;
  total_paid_out_rwf?: number;
  pending_balance_rwf?: number;
  last_payout_date?: string | null;
  next_payout_due_date?: string | null;
  clients_onboarded_count?: number;
  assigned_cohorts_count?: number;
  last_login?: string | null;
  last_login_ip?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceCommissionConfigItem {
  id: string;
  service_type: string;
  service_name: string;
  default_client_price_rwf: number;
  commission_fee_rwf: number;
  is_active: boolean;
  notes?: string;
  updated_at?: string;
}

export interface AgentCommissionItem {
  id: string;
  agent: string;
  agent_name?: string;
  agent_phone?: string;
  agent_code?: string;
  client?: string;
  client_name?: string;
  client_phone?: string;
  service_type: string;
  service_reference?: string;
  amount_paid_by_client_rwf: number;
  commission_amount_rwf: number;
  status: 'ACCRUED' | 'PAID_OUT' | 'CANCELLED';
  paid_out_at?: string | null;
  payout_batch_id?: string;
  notes?: string;
  created_at: string;
}

export interface StaffMetricsSummary {
  total_staff: number;
  total_agents: number;
  total_tutors: number;
  total_training_admins: number;
  total_board_reviewers: number;
  total_enterprise_admins: number;
  total_commissions_generated_rwf: number;
  total_commissions_paid_out_rwf: number;
  total_unpaid_commission_balance_rwf: number;
}

export class AdminService {
  private static instance: AdminService;
  private readonly http: HttpClient;
  private readonly storage: LocalStorageService;

  private constructor() {
    this.http = HttpClient.getInstance();
    this.storage = LocalStorageService.getInstance();
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

  public async assignTutorToStudent(userId: string, tutorId: string | null): Promise<AdminUserItem> {
    logger.info('Assigning tutor to student', { userId, tutorId });
    return await this.http.post<AdminUserItem>(ApiEndpoints.ADMIN.USER_TUTOR(userId), { tutor_id: tutorId });
  }

  // -------------------------------------------------------------------------
  // 2. LMS Studio (Curricula, Courses, Road Signs, Questions)
  // -------------------------------------------------------------------------
  public async getCurricula(): Promise<CurriculumItem[]> {
    logger.debug('Fetching curricula');
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.CURRICULA);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.results)) return res.results;
    return [];
  }

  public async createCurriculum(payload: {
    title: string;
    title_kinyarwanda?: string;
    code?: string;
    description?: string;
    description_kinyarwanda?: string;
    sort_order?: number;
  }): Promise<CurriculumItem> {
    logger.info(`Creating curriculum: ${payload.title}`);
    return this.http.post(ApiEndpoints.ADMIN.CURRICULUM_CREATE, payload);
  }

  public async updateCurriculum(
    id: string,
    payload: Partial<{
      title: string;
      title_kinyarwanda: string;
      code: string;
      description: string;
      description_kinyarwanda: string;
      sort_order: number;
    }>
  ): Promise<CurriculumItem> {
    logger.info(`Updating curriculum ${id}`);
    return this.http.patch(ApiEndpoints.ADMIN.CURRICULUM_UPDATE(id), payload);
  }

  public async deleteCurriculum(id: string): Promise<void> {
    return this.http.delete(ApiEndpoints.ADMIN.CURRICULUM_DELETE(id));
  }

  public async publishCurriculum(id: string): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.CURRICULUM_PUBLISH(id), {});
  }

  public async unpublishCurriculum(id: string): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.CURRICULUM_UNPUBLISH(id), {});
  }

  public async getCurriculumCourses(id: string): Promise<any[]> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.CURRICULUM_COURSES(id));
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.results)) return res.results;
    return [];
  }

  public async getCourses(curriculumId?: string): Promise<any[]> {
    logger.debug('Fetching courses for LMS studio');
    const url = curriculumId
      ? `${ApiEndpoints.ADMIN.COURSES}?curriculum=${encodeURIComponent(curriculumId)}`
      : ApiEndpoints.ADMIN.COURSES;
    const res = await this.http.get<any>(url);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.results)) return res.results;
    return [];
  }

  public async createCourse(payload: {
    curriculum?: string;
    title: string;
    title_rw?: string;
    title_kinyarwanda?: string;
    code?: string;
    description?: string;
    description_kinyarwanda?: string;
    estimated_hours?: number;
    sort_order?: number;
    is_published?: boolean;
  }): Promise<any> {
    logger.info(`Creating course: ${payload.title}`);
    return this.http.post(ApiEndpoints.ADMIN.COURSE_CREATE, {
      ...payload,
      title_kinyarwanda: payload.title_kinyarwanda || payload.title_rw,
    });
  }

  public async updateCourse(
    id: string,
    payload: {
      curriculum?: string;
      title?: string;
      title_rw?: string;
      title_kinyarwanda?: string;
      code?: string;
      description?: string;
      description_kinyarwanda?: string;
      estimated_hours?: number;
      sort_order?: number;
    }
  ): Promise<any> {
    logger.info(`Updating course ${id}: ${payload.title || ''}`);
    return this.http.patch(ApiEndpoints.ADMIN.COURSE_UPDATE(id), {
      ...payload,
      title_kinyarwanda: payload.title_kinyarwanda || payload.title_rw,
    });
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

  public async getCourseHomepage(id: string): Promise<any> {
    return this.http.get(ApiEndpoints.LMS.COURSE_HOMEPAGE(id));
  }

  public async updateCourseHomepage(id: string, homepageData: any): Promise<any> {
    logger.info(`Updating course homepage for course ${id}`);
    return this.http.patch(ApiEndpoints.LMS.COURSE_HOMEPAGE(id), {
      homepage_data: homepageData,
    });
  }

  // ── Curriculum: Modules ───────────────────────────────────────────────────
  public async getCourseModules(courseId: string): Promise<any[]> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.COURSE_MODULES(courseId));
    return Array.isArray(res) ? res : res?.results || [];
  }

  public async createModule(payload: {
    course: string;
    title: string;
    description?: string;
    sort_order?: number;
    is_foundational?: boolean;
    is_student_only?: boolean;
    is_outside_resource?: boolean;
  }): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.MODULE_CREATE, payload);
  }

  public async updateModule(id: string, payload: Partial<{
    title: string;
    description: string;
    sort_order: number;
    is_foundational: boolean;
    is_student_only: boolean;
    is_outside_resource: boolean;
  }>): Promise<any> {
    return this.http.patch(ApiEndpoints.ADMIN.MODULE_UPDATE(id), payload);
  }

  public async deleteModule(id: string): Promise<void> {
    return this.http.delete(ApiEndpoints.ADMIN.MODULE_DELETE(id));
  }

  public async publishModule(id: string): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.MODULE_PUBLISH(id), {});
  }

  public async unpublishModule(id: string): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.MODULE_UNPUBLISH(id), {});
  }

  // ── Curriculum: Lessons & Learning Materials ──────────────────────────────
  public async getModuleLessons(moduleId: string): Promise<any[]> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.MODULE_LESSONS(moduleId));
    return Array.isArray(res) ? res : res?.results || [];
  }

  public async createLesson(payload: FormData | Record<string, any>): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.LESSON_CREATE, payload);
  }

  public async updateLesson(id: string, payload: FormData | Record<string, any>): Promise<any> {
    return this.http.patch(ApiEndpoints.ADMIN.LESSON_UPDATE(id), payload);
  }

  public async deleteLesson(id: string): Promise<void> {
    return this.http.delete(ApiEndpoints.ADMIN.LESSON_DELETE(id));
  }

  // ── Curriculum: Lesson Content Items (Multi-Content per Lesson) ────────────
  public async getLessonContents(lessonId: string): Promise<any[]> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.LESSON_CONTENTS(lessonId));
    return Array.isArray(res) ? res : res?.results || [];
  }

  public async createLessonContent(lessonId: string, payload: FormData | Record<string, any>): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.LESSON_CONTENTS(lessonId), payload);
  }

  public async updateLessonContent(contentId: string, payload: FormData | Record<string, any>): Promise<any> {
    return this.http.patch(ApiEndpoints.ADMIN.CONTENT_UPDATE(contentId), payload);
  }

  public async deleteLessonContent(contentId: string): Promise<void> {
    return this.http.delete(ApiEndpoints.ADMIN.CONTENT_DELETE(contentId));
  }

  public async reorderLessonContents(lessonId: string, contentIds: string[]): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.LESSON_CONTENTS_REORDER(lessonId), { content_ids: contentIds });
  }

  public async getRoadSigns(): Promise<any[]> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.ROAD_SIGNS);
    return Array.isArray(res) ? res : res?.results || [];
  }

  public async createRoadSign(payload: FormData | Record<string, any>): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.ROAD_SIGN_CREATE, payload);
  }

  public async getQuestions(params?: { category?: string; page_size?: number }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    query.set('page_size', String(params?.page_size || 500));
    const url = `${ApiEndpoints.ADMIN.QUESTIONS}?${query.toString()}`;
    const res = await this.http.get<any>(url);
    return Array.isArray(res) ? res : res?.results || [];
  }

  public async createQuestion(payload: any): Promise<any> {
    const storedUser = this.storage.getItem<any>('sifo_user');
    const authorId = storedUser?.id;
    return this.http.post(ApiEndpoints.ADMIN.QUESTION_CREATE, {
      ...payload,
      ...(authorId ? { created_by: authorId } : {}),
    });
  }

  // -------------------------------------------------------------------------
  // 2.2 LMS Quizzes (Quiz Bank Engine)
  // -------------------------------------------------------------------------
  // In-memory cache for quizzes
  private fallbackQuizzes: QuizItem[] = [];

  public async getQuizzes(params?: {
    course?: string;
    module?: string;
    status?: string;
    search?: string;
    cohort?: string;
  }): Promise<QuizItem[]> {
    try {
      const query = new URLSearchParams();
      if (params?.course) query.set('course', params.course);
      if (params?.module) query.set('module', params.module);
      if (params?.status) query.set('status', params.status);
      if (params?.search) query.set('search', params.search);
      if (params?.cohort) query.set('cohort', params.cohort);
      const url = `${ApiEndpoints.LMS.QUIZZES}${query.toString() ? `?${query.toString()}` : ''}`;
      const res = await this.http.get<any>(url);
      let list: QuizItem[] = [];
      if (Array.isArray(res)) list = res;
      else if (res?.data && Array.isArray(res.data)) list = res.data;
      else if (res?.results && Array.isArray(res.results)) list = res.results;

      if (res !== undefined && res !== null) {
        const formatted = list.map((item) => {
          const authorName = item.created_by_detail?.full_name || (item as any).created_by_name || 'Eric Hategekimana';
          return {
            ...item,
            created_by_detail: {
              id: item.created_by || item.created_by_detail?.id || 'admin-1',
              phone_number: item.created_by_detail?.phone_number || '+250788111222',
              first_name: item.created_by_detail?.first_name || authorName.split(' ')[0] || 'Eric',
              last_name: item.created_by_detail?.last_name || authorName.split(' ').slice(1).join(' ') || 'Hategekimana',
              full_name: authorName,
              role: item.created_by_detail?.role || (item as any).created_by_role || 'TRAINING_ADMIN',
            },
          };
        });
        this.fallbackQuizzes = formatted;
        return formatted;
      }
    } catch (err) {
      logger.warn('Failed to fetch quizzes from backend:', err);
    }

    return this.fallbackQuizzes.filter((q) => {
      if (params?.course && String(q.course) !== String(params.course)) return false;
      if (params?.module && String(q.module) !== String(params.module)) return false;
      if (params?.status && q.status.toLowerCase() !== params.status.toLowerCase()) return false;
      if (params?.search) {
        const s = params.search.toLowerCase();
        return (
          q.title.toLowerCase().includes(s) ||
          (q.title_kinyarwanda && q.title_kinyarwanda.toLowerCase().includes(s))
        );
      }
      return true;
    });
  }

  public async getQuizDetail(id: string): Promise<QuizItem> {
    try {
      const res = await this.http.get<any>(ApiEndpoints.LMS.QUIZ_DETAIL(id));
      if (res?.id || res?.data?.id) {
        const item = res?.data || res;
        const authorName = item.created_by_detail?.full_name || item.created_by_name || 'Eric Hategekimana';
        item.created_by_detail = {
          id: item.created_by || item.created_by_detail?.id || 'admin-1',
          phone_number: item.created_by_detail?.phone_number || '+250788111222',
          first_name: item.created_by_detail?.first_name || authorName.split(' ')[0] || 'Eric',
          last_name: item.created_by_detail?.last_name || authorName.split(' ').slice(1).join(' ') || 'Hategekimana',
          full_name: authorName,
          role: item.created_by_detail?.role || 'TRAINING_ADMIN',
        };
        return item;
      }
    } catch (err) {
      logger.warn(`Failed to fetch quiz detail for id ${id}:`, err);
    }
    const found = this.fallbackQuizzes.find((q) => q.id === id);
    if (found) return found;
    throw new Error(`Quiz with id "${id}" not found.`);
  }

  public async createQuiz(payload: QuizPayload): Promise<QuizItem> {
    const storedUser = this.storage.getItem<any>('sifo_user');
    const authorFirstName = storedUser?.first_name || storedUser?.firstName || 'Eric';
    const authorLastName = storedUser?.last_name || storedUser?.lastName || 'Hategekimana';
    const authorFullName = storedUser?.full_name || storedUser?.fullName || `${authorFirstName} ${authorLastName}`.trim();
    const authorRole = storedUser?.role || 'TRAINING_ADMIN';
    const authorPhone = storedUser?.phone_number || storedUser?.phoneNumber || '+250788111222';
    const authorId = storedUser?.id || `admin-${Date.now()}`;

    try {
      const res = await this.http.post<any>(ApiEndpoints.LMS.QUIZZES, {
        ...payload,
        created_by: authorId,
      });
      if (res?.id || res?.data?.id) {
        const item = res?.data || res;
        if (!item.created_by_detail || !item.created_by_detail.full_name) {
          item.created_by_detail = {
            id: authorId,
            phone_number: authorPhone,
            first_name: authorFirstName,
            last_name: authorLastName,
            full_name: authorFullName,
            role: authorRole,
          };
        }
        if (!item.created_by) {
          item.created_by = authorId;
        }
        if (!item.course_title && payload.course_title) {
          item.course_title = payload.course_title;
        }
        if (!item.module_title && payload.module_title) {
          item.module_title = payload.module_title;
        }
        this.fallbackQuizzes.unshift(item);
        return item;
      }
    } catch (err) {
      logger.error('Backend createQuiz failed:', err);
      throw err;
    }
    throw new Error('Failed to create quiz: invalid response from server.');
  }

  public async updateQuiz(id: string, payload: Partial<QuizPayload>): Promise<QuizItem> {
    try {
      const res = await this.http.patch<any>(ApiEndpoints.LMS.QUIZ_DETAIL(id), payload);
      if (res?.id || res?.data?.id) {
        const item = res?.data || res;
        this.fallbackQuizzes = this.fallbackQuizzes.map((q) => (q.id === id ? item : q));
        return item;
      }
    } catch (err) {
      logger.error('Backend updateQuiz failed:', err);
      throw err;
    }
    throw new Error('Failed to update quiz: invalid response from server.');
  }

  public async deleteQuiz(id: string): Promise<void> {
    try {
      await this.http.delete(ApiEndpoints.LMS.QUIZ_DETAIL(id));
      this.fallbackQuizzes = this.fallbackQuizzes.filter((q) => q.id !== id);
    } catch (err) {
      logger.error('Backend deleteQuiz failed:', err);
      throw err;
    }
  }

  public async togglePublishQuiz(id: string): Promise<QuizItem> {
    try {
      const res = await this.http.post<any>(ApiEndpoints.LMS.QUIZ_PUBLISH(id), {});
      if (res?.id || res?.data?.id) {
        const item = res?.data || res;
        this.fallbackQuizzes = this.fallbackQuizzes.map((q) => (q.id === id ? item : q));
        return item;
      }
    } catch (err) {
      logger.error('Backend togglePublishQuiz failed:', err);
      throw err;
    }
    throw new Error('Failed to toggle quiz publish state: invalid response from server.');
  }

  public async getCohortActivities(courseId?: string): Promise<CohortActivityItem[]> {
    try {
      const url = ApiEndpoints.LMS.STUDENT_COHORT_ACTIVITIES();
      const query = courseId && courseId !== 'ALL' ? `?course_id=${encodeURIComponent(courseId)}` : '';
      const res = await this.http.get<any>(`${url}${query}`);
      if (Array.isArray(res)) return res;
      if (res?.data && Array.isArray(res.data)) return res.data;
      if (res?.results && Array.isArray(res.results)) return res.results;
      return [];
    } catch (err) {
      logger.warn('Failed to fetch cohort activities:', err);
      return [];
    }
  }

  public async submitQuiz(
    quizId: string,
    payload: {
      cohort_id?: string;
      student_answers?: Record<string, string>;
      flagged_for_review_questions?: Array<string | number>;
      work_submission_text?: string;
      work_submission_file?: File | null;
      time_spent_seconds?: number;
      tab_switch_count?: number;
      proctoring_violations?: Array<{ timestamp: string; event?: string; reason?: string }>;
    }
  ): Promise<QuizSubmissionItem> {
    try {
      const formData = new FormData();
      if (payload.cohort_id) {
        formData.append('cohort_id', payload.cohort_id);
      }
      if (payload.student_answers) {
        formData.append('student_answers', JSON.stringify(payload.student_answers));
      }
      if (payload.flagged_for_review_questions) {
        formData.append('flagged_for_review_questions', JSON.stringify(payload.flagged_for_review_questions));
      }
      if (payload.work_submission_text) {
        formData.append('work_submission_text', payload.work_submission_text);
      }
      if (payload.work_submission_file) {
        formData.append('work_submission_file', payload.work_submission_file);
      }
      formData.append('time_spent_seconds', String(payload.time_spent_seconds || 0));
      formData.append('tab_switch_count', String(payload.tab_switch_count || 0));
      if (payload.proctoring_violations) {
        formData.append('proctoring_violations', JSON.stringify(payload.proctoring_violations));
      }

      const res = await this.http.post<any>(ApiEndpoints.LMS.QUIZ_SUBMIT(quizId), formData);
      return res?.data || res;
    } catch (err) {
      logger.error('Failed to submit quiz to backend:', err);
      throw err;
    }
  }

  public async publishQuizGrades(quizId: string, cohortId?: string): Promise<any> {
    try {
      const url = `${ApiEndpoints.LMS.QUIZZES}${quizId}/publish-grades/`;
      return await this.http.post(url, { cohort_id: cohortId });
    } catch (e) {
      logger.warn('Backend publish quiz grades failed, setting local state', e);
      localStorage.setItem(`sifo_quiz_grades_published_${quizId}`, 'true');
    }
  }

  public async getQuizSubmissions(quizId: string, isFlagged?: boolean, cohortId?: string): Promise<QuizSubmissionItem[]> {
    try {
      let url = ApiEndpoints.LMS.QUIZ_SUBMISSIONS(quizId);
      const params = new URLSearchParams();
      if (isFlagged !== undefined) {
        params.append('is_flagged', String(isFlagged));
      }
      if (cohortId) {
        params.append('cohort_id', cohortId);
      }
      const qs = params.toString();
      if (qs) {
        url += `?${qs}`;
      }
      const res = await this.http.get<any>(url);
      if (Array.isArray(res)) return res;
      if (res?.data && Array.isArray(res.data)) return res.data;
      if (res?.results && Array.isArray(res.results)) return res.results;
      if (res?.data?.results && Array.isArray(res.data.results)) return res.data.results;
      return [];
    } catch (err) {
      logger.warn('Failed to fetch quiz submissions:', err);
      return [];
    }
  }

  public async gradeQuizSubmission(
    quizId: string,
    submissionId: string,
    payload: { score: number; feedback?: string; reason?: string }
  ): Promise<QuizSubmissionItem> {
    try {
      const url = ApiEndpoints.LMS.QUIZ_GRADE_SUBMISSION(quizId, submissionId);
      const res = await this.http.post<any>(url, payload);
      return res?.data || res;
    } catch (err) {
      logger.warn('Failed to submit manual grade to backend:', err);
      return {} as any;
    }
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
    max_capacity?: number;
    schedule_description?: string;
    status?: 'queue' | 'open' | 'closed' | 'ended';
  }): Promise<any> {
    const storedUser = this.storage.getItem<any>('sifo_user');
    const authorId = storedUser?.id;
    return this.http.post(ApiEndpoints.ADMIN.COHORTS, {
      ...payload,
      ...(authorId ? { created_by: authorId } : {}),
    });
  }

  public async updateCohort(id: string, payload: Partial<CohortItem>): Promise<any> {
    logger.info(`Updating cohort ${id}`);
    return this.http.patch(ApiEndpoints.ADMIN.COHORT_DETAIL(id), payload);
  }

  public async setCohortStatus(id: string, status: 'queue' | 'open' | 'closed' | 'ended'): Promise<any> {
    logger.info(`Setting cohort ${id} status to ${status}`);
    return this.http.post(ApiEndpoints.ADMIN.COHORT_SET_STATUS(id), { status });
  }

  public async assignTutorsToCohort(cohortId: string, tutorIds: string[], action: 'assign' | 'unassign' = 'assign'): Promise<any> {
    logger.info(`Assigning tutors [${tutorIds.join(',')}] to cohort ${cohortId} (action=${action})`);
    return this.http.post(`${ApiEndpoints.ADMIN.COHORT_ASSIGN_TUTORS(cohortId)}?action=${action}`, { tutor_ids: tutorIds });
  }

  public async assignStudentsToCohort(cohortId: string, studentIds: string[], action: 'enroll' | 'unenroll' = 'enroll'): Promise<any> {
    logger.info(`Enrolling students [${studentIds.join(',')}] in cohort ${cohortId} (action=${action})`);
    return this.http.post(`${ApiEndpoints.ADMIN.COHORT_ASSIGN_STUDENTS(cohortId)}?action=${action}`, { student_ids: studentIds });
  }

  public async getLiveClasses(): Promise<LiveClassAdminItem[]> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.CLASSES);
    return Array.isArray(res) ? res : res?.results || [];
  }

  public async createLiveClass(payload: {
    title: string;
    topic?: string;
    cohort?: string;
    tutor?: string;
    scheduled_date: string;
    start_time: string;
    end_time: string;
    google_meet_url: string;
    is_published?: boolean;
    notes?: string;
  }): Promise<any> {
    const storedUser = this.storage.getItem<any>('sifo_user');
    const authorId = storedUser?.id;
    return this.http.post(ApiEndpoints.ADMIN.CLASSES, {
      ...payload,
      ...(authorId ? { created_by: authorId } : {}),
    });
  }

  public async scheduleRecurringClasses(payload: {
    title: string;
    cohort?: string;
    tutor?: string;
    day_of_week?: number;
    days_of_week?: number[];
    start_time: string;
    end_time: string;
    start_date: string;
    end_date?: string;
    period_months?: number;
    period_unit?: 'months' | 'years';
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

  public async updateLiveClass(id: string, payload: {
    title?: string;
    topic?: string;
    cohort?: string;
    tutor?: string;
    scheduled_date?: string;
    start_time?: string;
    end_time?: string;
    google_meet_url?: string;
    is_published?: boolean;
    notes?: string;
    status?: string;
  }): Promise<any> {
    logger.info(`Updating live class ${id}`);
    return this.http.patch(ApiEndpoints.ADMIN.CLASS_DETAIL(id), payload);
  }

  public async deleteLiveClass(id: string): Promise<any> {
    logger.info(`Deleting live class ${id}`);
    return this.http.delete(ApiEndpoints.ADMIN.CLASS_DETAIL(id));
  }

  public async getLiveClassSchedules(cohortId?: string): Promise<LiveClassScheduleItem[]> {
    const url = cohortId ? `${ApiEndpoints.ADMIN.SCHEDULES}?cohort=${cohortId}` : ApiEndpoints.ADMIN.SCHEDULES;
    const res = await this.http.get<any>(url);
    return Array.isArray(res) ? res : res?.results || [];
  }

  public async getLiveClassSchedule(id: string): Promise<LiveClassScheduleItem> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.SCHEDULE_DETAIL(id));
    return res?.data || res;
  }

  public async updateLiveClassSchedule(id: string, payload: Partial<LiveClassScheduleItem>): Promise<any> {
    logger.info(`Updating live class schedule ${id}`);
    return this.http.patch(ApiEndpoints.ADMIN.SCHEDULE_DETAIL(id), payload);
  }

  public async deleteLiveClassSchedule(id: string): Promise<any> {
    logger.info(`Deleting live class schedule ${id}`);
    return this.http.delete(ApiEndpoints.ADMIN.SCHEDULE_DETAIL(id));
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

  public async getUserAuditTrail(userId: string): Promise<AuditLogItem[]> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.AUDIT_USER_TRAIL(userId));
    if (res && Array.isArray(res.results)) return res.results;
    if (Array.isArray(res)) return res;
    return [];
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
    action: 'BOARD_DECISION' | 'TRAINING_DECISION' | 'SYSTEM_APPROVE' | 'REJECT' | string,
    decision: 'APPROVE' | 'REJECT' | string = 'APPROVE',
    notes?: string
  ): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.EXAM_SESSION_ACTION(id), {
      action,
      decision,
      notes: notes || '',
    });
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

  public async createQuizQuestion(
    data: Partial<AdminQuizQuestionItem>
  ): Promise<AdminQuizQuestionItem> {
    return this.http.post<AdminQuizQuestionItem>(
      ApiEndpoints.ADMIN.EXAM_QUESTIONS,
      data
    );
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

  public async deleteQuizQuestion(id: string): Promise<void> {
    return this.http.delete<void>(ApiEndpoints.ADMIN.EXAM_QUESTION_DETAIL(id));
  }

  public async getQuestionBankEditAccess(): Promise<{
    edit_access_enabled: boolean;
    updated_at: string | null;
    updated_by: string | null;
    can_manage_toggle: boolean;
  }> {
    const response = await this.http.get<{
      success: boolean;
      data: {
        edit_access_enabled: boolean;
        updated_at: string | null;
        updated_by: string | null;
        can_manage_toggle: boolean;
      };
    }>(ApiEndpoints.ADMIN.EXAM_QUESTION_EDIT_ACCESS);
    return (response as any)?.data || response;
  }

  public async setQuestionBankEditAccess(enabled: boolean): Promise<{
    edit_access_enabled: boolean;
    updated_at: string | null;
    updated_by: string | null;
    can_manage_toggle: boolean;
  }> {
    const response = await this.http.post<{
      success: boolean;
      data: {
        edit_access_enabled: boolean;
        updated_at: string | null;
        updated_by: string | null;
        can_manage_toggle: boolean;
      };
    }>(ApiEndpoints.ADMIN.EXAM_QUESTION_EDIT_ACCESS, {
      edit_access_enabled: enabled,
    });
    return (response as any)?.data || response;
  }

  // ---------------------------------------------------------------------------
  // Official Examination Windows (Independent of Quizzes)
  // ---------------------------------------------------------------------------
  public async getOfficialExams(params?: {
    search?: string;
    cohort?: string;
    status?: string;
    exam_type?: string;
  }): Promise<AdminExamItem[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.cohort && params.cohort !== 'ALL') query.set('cohort', params.cohort);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.exam_type && params.exam_type !== 'ALL') query.set('exam_type', params.exam_type);

    const url = `${ApiEndpoints.ADMIN.OFFICIAL_EXAMS}${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await this.http.get<any>(url);
    if (res && Array.isArray(res.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  }

  public async createOfficialExam(payload: AdminExamPayload): Promise<AdminExamItem> {
    const res = await this.http.post<any>(ApiEndpoints.ADMIN.OFFICIAL_EXAMS, payload);
    return res?.data || res;
  }

  public async updateOfficialExam(id: string, payload: Partial<AdminExamPayload>): Promise<AdminExamItem> {
    const res = await this.http.patch<any>(ApiEndpoints.ADMIN.OFFICIAL_EXAM_DETAIL(id), payload);
    return res?.data || res;
  }

  public async deleteOfficialExam(id: string): Promise<void> {
    await this.http.delete<void>(ApiEndpoints.ADMIN.OFFICIAL_EXAM_DETAIL(id));
  }

  public async togglePublishOfficialExam(id: string): Promise<AdminExamItem> {
    const res = await this.http.post<any>(ApiEndpoints.ADMIN.OFFICIAL_EXAM_TOGGLE_PUBLISH(id), {});
    return res?.data || res;
  }

  public async getOfficialExamAudit(idOrType: string): Promise<any> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.OFFICIAL_EXAM_AUDIT(idOrType));
    return res?.data || res;
  }

  // ---------------------------------------------------------------------------
  // Candidate Examination Runner & Proctoring (Student, Guest & Public)
  // ---------------------------------------------------------------------------
  public async getStudentAvailableExams(): Promise<StudentAvailableExamItem[]> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.STUDENT_OFFICIAL_EXAMS);
    if (res && Array.isArray(res.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  }

  public async startStudentExam(
    examId: string,
    payload?: { selfie_image?: string; preflight_checks?: any }
  ): Promise<CandidateSessionItem> {
    const res = await this.http.post<any>(ApiEndpoints.ADMIN.STUDENT_START_EXAM(examId), payload || {});
    return res?.data || res;
  }

  public async getCandidateSession(sessionId: string, phone?: string): Promise<CandidateSessionItem> {
    const sessionToken =
      sessionStorage.getItem(`sifo_exam_token_${sessionId}`) ||
      sessionStorage.getItem('sifo_active_exam_token') ||
      sessionStorage.getItem('sifo_exam_session_token') ||
      '';
    const params = new URLSearchParams();
    if (sessionToken) params.set('session_token', sessionToken);
    const candidatePhone = phone || new URLSearchParams(window.location.search).get('phone') || '';
    if (candidatePhone) params.set('phone', candidatePhone);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await this.http.get<any>(`${ApiEndpoints.ADMIN.CANDIDATE_SESSION_DETAIL(sessionId)}${qs}`, false);
    return res?.data || res;
  }

  public async recordCandidateAnswer(
    sessionId: string,
    sequenceNumber: number,
    selectedOption: string
  ): Promise<{ sequence_number: number; selected_option: string; answered_at: string }> {
    const sessionToken =
      sessionStorage.getItem(`sifo_exam_token_${sessionId}`) ||
      sessionStorage.getItem('sifo_active_exam_token') ||
      sessionStorage.getItem('sifo_exam_session_token') ||
      '';
    const candidatePhone = new URLSearchParams(window.location.search).get('phone') || '';
    const res = await this.http.post<any>(
      ApiEndpoints.ADMIN.CANDIDATE_SESSION_ANSWER(sessionId),
      {
        sequence_number: sequenceNumber,
        selected_option: selectedOption,
        session_token: sessionToken,
        phone_number: candidatePhone,
      },
      false
    );
    return res?.data || res;
  }

  public async recordCandidateProctorEvent(
    sessionId: string,
    eventType: string,
    snapshotImage?: string,
    metadata?: any,
    isViolation: boolean = true
  ): Promise<any> {
    const sessionToken =
      sessionStorage.getItem(`sifo_exam_token_${sessionId}`) ||
      sessionStorage.getItem('sifo_active_exam_token') ||
      sessionStorage.getItem('sifo_exam_session_token') ||
      '';
    const res = await this.http.post<any>(
      ApiEndpoints.ADMIN.CANDIDATE_SESSION_PROCTOR(sessionId),
      {
        event_type: eventType,
        snapshot_image: snapshotImage || '',
        metadata: metadata || {},
        is_violation: isViolation,
        session_token: sessionToken,
      },
      false
    );
    return res?.data || res;
  }

  public async submitCandidateExam(sessionId: string): Promise<CandidateSessionItem> {
    const sessionToken =
      sessionStorage.getItem(`sifo_exam_token_${sessionId}`) ||
      sessionStorage.getItem('sifo_active_exam_token') ||
      sessionStorage.getItem('sifo_exam_session_token') ||
      '';
    const candidatePhone = new URLSearchParams(window.location.search).get('phone') || '';
    const res = await this.http.post<any>(
      ApiEndpoints.ADMIN.CANDIDATE_SESSION_SUBMIT(sessionId),
      {
        session_token: sessionToken,
        phone_number: candidatePhone,
      },
      false
    );
    return res?.data || res;
  }

  public async getCandidateExamResults(sessionId: string): Promise<CandidateSessionItem> {
    const sessionToken =
      sessionStorage.getItem(`sifo_exam_token_${sessionId}`) ||
      sessionStorage.getItem('sifo_active_exam_token') ||
      sessionStorage.getItem('sifo_exam_session_token') ||
      '';
    const candidatePhone = new URLSearchParams(window.location.search).get('phone') || '';
    const params = new URLSearchParams();
    if (sessionToken) params.set('session_token', sessionToken);
    if (candidatePhone) params.set('phone', candidatePhone);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await this.http.get<any>(`${ApiEndpoints.ADMIN.CANDIDATE_SESSION_RESULTS(sessionId)}${qs}`, false);
    return res?.data || res;
  }

  // ---------------------------------------------------------------------------
  // Guest & Public Paid Examination
  // ---------------------------------------------------------------------------
  public async getPublicExamPackages(includeAll: boolean = false): Promise<ExamPackageItem[]> {
    const query = includeAll ? '?include_all=true' : '';
    const res = await this.http.get<any>(`${ApiEndpoints.ADMIN.PUBLIC_EXAM_PACKAGES}${query}`);
    if (res && Array.isArray(res.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  }

  public async updateExamPackages(packages: (ExamPackageItem | any)[]): Promise<ExamPackageItem[]> {
    const res = await this.http.post<any>(ApiEndpoints.ADMIN.PUBLIC_EXAM_PACKAGES, { packages });
    if (res && Array.isArray(res.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  }

  public async getPublicExamCredits(phone?: string, token?: string): Promise<ExamCreditBalance> {
    const candidateToken = token || sessionStorage.getItem('sifo_candidate_access_token') || '';
    const queryParts: string[] = [];
    if (phone) queryParts.push(`phone_number=${encodeURIComponent(phone)}`);
    if (candidateToken) queryParts.push(`token=${encodeURIComponent(candidateToken)}`);
    const query = queryParts.length ? `?${queryParts.join('&')}` : '';
    const res = await this.http.get<any>(`${ApiEndpoints.ADMIN.PUBLIC_EXAM_CREDITS}${query}`);
    return res?.data || res;
  }

  public async requestPublicExamOTP(phone_number: string, full_name?: string): Promise<{
    phone_number: string;
    expires_in_seconds: number;
  }> {
    const res = await this.http.post<any>(ApiEndpoints.ADMIN.PUBLIC_EXAM_OTP_REQUEST, {
      phone_number,
      full_name: full_name || '',
    });
    return res?.data || res;
  }

  public async verifyPublicExamOTP(phone_number: string, otp_code: string): Promise<{
    phone_number: string;
    access_token?: string;
    verified: boolean;
  }> {
    const res = await this.http.post<any>(ApiEndpoints.ADMIN.PUBLIC_EXAM_OTP_VERIFY, {
      phone_number,
      otp_code,
    });
    const data = res?.data || res;
    if (data?.access_token) {
      try {
        sessionStorage.setItem('sifo_candidate_access_token', data.access_token);
        const cleanPhone = (data.phone_number || phone_number || '').trim();
        if (cleanPhone) {
          sessionStorage.setItem(`sifo_candidate_token_${cleanPhone}`, data.access_token);
        }
      } catch {}
    }
    return data;
  }

  public async buyPublicExamCredits(payload: {
    package_key: string;
    paying_number: string;
    phone_number?: string;
    full_name?: string;
    exam_count?: number;
  }): Promise<any> {
    const res = await this.http.post<any>(ApiEndpoints.ADMIN.PUBLIC_EXAM_BUY, payload);
    return res?.data || res;
  }

  public async getPublicExamPaymentStatus(referenceId: string): Promise<any> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.PUBLIC_EXAM_PAYMENT_STATUS(referenceId));
    const data = res?.data || res;
    if (data?.access_token) {
      try {
        sessionStorage.setItem('sifo_candidate_access_token', data.access_token);
        if (data.phone_number) {
          sessionStorage.setItem(`sifo_candidate_token_${data.phone_number}`, data.access_token);
        }
      } catch {}
    }
    return data;
  }

  public async startPublicPracticeExam(phone?: string, token?: string): Promise<CandidateSessionItem> {
    const cleanPhone = (phone || '').trim();
    const candidateToken =
      token ||
      (cleanPhone ? sessionStorage.getItem(`sifo_candidate_token_${cleanPhone}`) : null) ||
      sessionStorage.getItem('sifo_candidate_access_token') ||
      undefined;

    const res = await this.http.post<any>(ApiEndpoints.ADMIN.PUBLIC_EXAM_START, {
      phone_number: cleanPhone,
      access_token: candidateToken,
    });
    const session: CandidateSessionItem = res?.data || res;
    if (session?.session_token) {
      try {
        sessionStorage.setItem(`sifo_exam_token_${session.id}`, session.session_token);
        sessionStorage.setItem('sifo_active_exam_token', session.session_token);
      } catch {}
    }
    return session;
  }

  public async getPublicExamHistory(phone?: string): Promise<any[]> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.PUBLIC_EXAM_HISTORY(phone));
    return Array.isArray(res) ? res : res?.data || [];
  }

  public async verifyPublicCertificate(hashOrCode: string): Promise<any> {
    return this.http.get<any>(ApiEndpoints.ADMIN.EXAM_CERTIFICATE_VERIFY(hashOrCode));
  }


  public async getPlatformAnalytics(timeframe: string = '30d'): Promise<PlatformAnalyticsData> {
    return this.http.get<PlatformAnalyticsData>(ApiEndpoints.ADMIN.ANALYTICS(timeframe));
  }

  // ---------------------------------------------------------------------------
  // Agents & Staff Hub
  // ---------------------------------------------------------------------------
  public async getStaffMetrics(): Promise<StaffMetricsSummary> {
    return this.http.get<StaffMetricsSummary>(ApiEndpoints.ADMIN.STAFF_METRICS);
  }

  public async getStaff(params?: { role?: string; search?: string }): Promise<StaffUserItem[]> {
    const q = new URLSearchParams();
    if (params?.role && params.role !== 'ALL') q.set('role', params.role);
    if (params?.search) q.set('search', params.search);
    const url = `${ApiEndpoints.ADMIN.STAFF}${q.toString() ? '?' + q.toString() : ''}`;
    const res = await this.http.get<any>(url);
    return Array.isArray(res) ? res : res?.results || [];
  }

  public async createStaff(payload: {
    phone_number: string;
    first_name: string;
    last_name: string;
    role: string;
    email?: string;
    password?: string;
    business_name?: string;
    national_id_number?: string;
    district?: string;
    sector?: string;
    school_name?: string;
  }): Promise<StaffUserItem> {
    return this.http.post<StaffUserItem>(ApiEndpoints.ADMIN.STAFF, payload);
  }

  public async updateStaff(id: string, payload: Partial<StaffUserItem>): Promise<StaffUserItem> {
    return this.http.patch<StaffUserItem>(ApiEndpoints.ADMIN.STAFF_DETAIL(id), payload);
  }

  public async deleteStaff(id: string): Promise<any> {
    return this.http.delete(ApiEndpoints.ADMIN.STAFF_DETAIL(id));
  }

  public async getCommissionRates(): Promise<ServiceCommissionConfigItem[]> {
    const res = await this.http.get<any>(ApiEndpoints.ADMIN.AGENT_COMMISSION_RATES);
    return Array.isArray(res) ? res : res?.results || [];
  }

  public async updateCommissionRate(payload: {
    service_type: string;
    commission_fee_rwf?: number;
    default_client_price_rwf?: number;
    notes?: string;
  }): Promise<ServiceCommissionConfigItem> {
    return this.http.patch<ServiceCommissionConfigItem>(ApiEndpoints.ADMIN.AGENT_COMMISSION_RATES, payload);
  }

  public async getAgentCommissions(params?: {
    agent_id?: string;
    service_type?: string;
    status?: string;
  }): Promise<AgentCommissionItem[]> {
    const q = new URLSearchParams();
    if (params?.agent_id) q.set('agent_id', params.agent_id);
    if (params?.service_type && params.service_type !== 'ALL') q.set('service_type', params.service_type);
    if (params?.status && params.status !== 'ALL') q.set('status', params.status);
    const url = `${ApiEndpoints.ADMIN.AGENT_COMMISSIONS}${q.toString() ? '?' + q.toString() : ''}`;
    const res = await this.http.get<any>(url);
    return Array.isArray(res) ? res : res?.results || [];
  }

  public async payoutAgentMonthly(payload: {
    agent_id: string;
    payout_amount?: number;
    notes?: string;
  }): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.AGENT_PAYOUT, payload);
  }

  public async onboardClientAsAgent(payload: {
    phone_number: string;
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
  }): Promise<any> {
    return this.http.post(ApiEndpoints.ADMIN.AGENT_ONBOARD_CLIENT, payload);
  }

  public async facilitateAgentService(payload: {
    client_phone: string;
    service_type: string;
    service_reference?: string;
    amount_paid_by_client_rwf?: number;
    notes?: string;
  }): Promise<AgentCommissionItem> {
    return this.http.post<AgentCommissionItem>(ApiEndpoints.ADMIN.AGENT_FACILITATE_SERVICE, payload);
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
  student_code?: string;
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
  violation_count?: number;
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
  timestamp?: string;
  created_at?: string;
  snapshot_image?: string | null;
  flagged_reason?: string;
  is_violation?: boolean;
  metadata?: any;
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
  question_text: string;
  question_text_kinyarwanda: string;
  question_text_french?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_a_kinyarwanda: string;
  option_b_kinyarwanda: string;
  option_c_kinyarwanda: string;
  option_d_kinyarwanda: string;
  option_a_french?: string;
  option_b_french?: string;
  option_c_french?: string;
  option_d_french?: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  explanation_kinyarwanda: string;
  explanation_french?: string;
  image?: string | null;
  option_a_image?: string | null;
  option_b_image?: string | null;
  option_c_image?: string | null;
  option_d_image?: string | null;
  is_active: boolean;
  road_sign_id?: string | null;
  created_at: string;
  updated_at: string;
  last_edited_by_name?: string | null;
  last_edited_by_role?: string | null;
  last_edited_at?: string | null;
  edit_reason?: string | null;
  edit_history?: Array<{
    edited_by_name: string;
    edited_by_role: string;
    edited_at: string;
    edit_reason: string;
  }>;
}

// ---------------------------------------------------------------------------
// Analytics Data Types
// ---------------------------------------------------------------------------
export interface AnalyticsExecutive {
  gross_revenue: number;
  total_users: number;
  enrolled_students: number;
  registered_guests: number;
  exam_pass_rate: number;
  certificates_issued: number;
  sms_delivery_rate: number;
  success_rate: number;
}

export interface AnalyticsFinanceProvider {
  provider: string;
  name: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface AnalyticsFeeStream {
  key: string;
  name: string;
  amount: number;
  percentage: number;
}

export interface AnalyticsRevenuePeriod {
  period: string;
  revenue: number;
  transactions: number;
}

export interface AnalyticsTransactionItem {
  id: string;
  payer_name: string;
  phone: string;
  provider: string;
  fee_type: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface AnalyticsFinance {
  gross_revenue: number;
  total_transactions: number;
  successful_transactions: number;
  pending_transactions: number;
  failed_transactions: number;
  success_rate: number;
  arpu: number;
  providers: AnalyticsFinanceProvider[];
  fee_streams: AnalyticsFeeStream[];
  revenue_trend: AnalyticsRevenuePeriod[];
  recent_transactions: AnalyticsTransactionItem[];
}

export interface AnalyticsDomainPerformance {
  domain: string;
  name: string;
  questions: number;
  avg_pass_rate: number;
}

export interface AnalyticsBookings {
  total: number;
  completed: number;
  confirmed: number;
  in_progress: number;
  cancelled: number;
  completion_rate: number;
}

export interface AnalyticsActivities {
  total_exams: number;
  passed_exams: number;
  failed_exams: number;
  pass_rate: number;
  avg_score: number;
  domain_performance: AnalyticsDomainPerformance[];
  bookings: AnalyticsBookings;
}

export interface AnalyticsCohortItem {
  id: string;
  name: string;
  start_date: string;
  students_count: number;
  avg_progress: number;
  status: string;
}

export interface AnalyticsStudents {
  total_enrolled: number;
  active_students: number;
  completion_rate: number;
  avg_course_progress: number;
  certificates_issued: number;
  cohorts: AnalyticsCohortItem[];
}

export interface AnalyticsFunnelStage {
  stage: string;
  count: number;
  rate: number;
  description: string;
}

export interface AnalyticsGuests {
  total_registered: number;
  mock_exam_attempts: number;
  guest_pass_rate: number;
  conversions: number;
  conversion_rate: number;
  funnel: AnalyticsFunnelStage[];
}

export interface AnalyticsOperations {
  sms_sent: number;
  sms_delivered: number;
  sms_failed: number;
  sms_delivery_rate: number;
  estimated_sms_cost_rwf: number;
  audit_events_count: number;
}

export interface PlatformAnalyticsData {
  timeframe: string;
  timeframe_label?: string;
  executive: AnalyticsExecutive;
  finance: AnalyticsFinance;
  activities: AnalyticsActivities;
  students: AnalyticsStudents;
  guests: AnalyticsGuests;
  operations: AnalyticsOperations;
}

import { HttpClient } from '../api/HttpClient';
import { ApiEndpoints } from '../api/ApiEndpoints';

export interface AssignedCurriculumRef {
  id: string;
  name?: string;
  title?: string;
  code?: string;
}

export interface AssignedCourseRef {
  id: string;
  title?: string;
  name?: string;
  code?: string;
  curriculum_id?: string;
}

export interface TutorAdminSummary {
  id: string;
  full_name: string;
  phone_number: string;
  email: string | null;
  status: string;
  assigned_curricula_count: number;
  assigned_courses_count: number;
  assigned_cohorts_count: number;
  assigned_curricula: AssignedCurriculumRef[];
  assigned_courses: AssignedCourseRef[];
}

export interface CohortSelectorItem {
  id: string;
  name: string;
  code: string;
  identifier?: string;
  status?: string;
  max_capacity?: number;
  schedule_description?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  student_count: number;
}

export interface CohortDeadlineItem {
  id: string;
  type: 'QUIZ' | 'ACTIVITY';
  title: string;
  cohort_id: string;
  cohort_name: string;
  cohort_identifier: string;
  course_id: string;
  course_title: string;
  due_date: string | null;
  is_extended?: boolean;
  submissions_count?: number;
  total_students?: number;
  status: 'OPEN' | 'UPCOMING' | 'PASSED';
}

export interface CohortCourseItem {
  id: string;
  title: string;
  code: string;
  curriculum_id: string;
  curriculum_name: string;
  modules_count?: number;
}

export interface CohortModuleItem {
  id: string;
  title: string;
  order: number;
  is_default_published: boolean;
  is_published: boolean;
  is_locked: boolean;
  unlock_date: string | null;
  lessons_count?: number;
}

export interface CohortQuizItem {
  id: string;
  title: string;
  pass_score: number;
  allow_tutor_scheduling: boolean;
  default_open_date: string | null;
  default_deadline: string | null;
  open_date: string | null;
  deadline: string | null;
  extended_deadline: string | null;
  extension_reason: string;
  is_published: boolean;
  is_locked: boolean;
}

export type ActivityType = 'ASSIGNMENT' | 'PRACTICAL_DRILL' | 'CASE_STUDY' | 'OBSERVATION';
export type SubmissionType = 'ONLINE_TEXT' | 'FILE_UPLOAD' | 'BOTH' | 'PRACTICAL_CHECKLIST';
export type SubmissionStatus = 'PENDING' | 'SUBMITTED' | 'GRADED' | 'RESUBMISSION_REQUESTED';

export interface CohortActivityItem {
  id: string;
  cohort: string;
  cohort_name?: string;
  course: string;
  course_title?: string;
  tutor: string;
  tutor_name?: string;
  title: string;
  activity_type: ActivityType;
  description: string;
  instructions: string;
  submission_type: SubmissionType;
  max_score: number;
  pass_score: number;
  open_date: string | null;
  due_date: string | null;
  allow_late_submissions: boolean;
  late_penalty_percent: number;
  is_published: boolean;
  submission_count: number;
  graded_count: number;
  my_submission?: StudentActivitySubmissionItem | null;
  created_at?: string;
  updated_at?: string;
}

export interface StudentActivitySubmissionItem {
  id: string;
  activity: string;
  activity_title?: string;
  student: string;
  student_name?: string;
  student_phone?: string;
  submission_type: SubmissionType;
  text_content: string;
  attachment_file: string | null;
  status: SubmissionStatus;
  score: number | null;
  max_score?: number;
  feedback: string;
  tutor: string | null;
  tutor_name?: string | null;
  submitted_at: string;
  graded_at: string | null;
}

export class TutorLmsService {
  private static instance: TutorLmsService;
  private http: HttpClient;

  private constructor() {
    this.http = HttpClient.getInstance();
  }

  public static getInstance(): TutorLmsService {
    if (!TutorLmsService.instance) {
      TutorLmsService.instance = new TutorLmsService();
    }
    return TutorLmsService.instance;
  }

  // --- Training Admin: Tutor Accreditation ---

  public async getAdminTutors(): Promise<TutorAdminSummary[]> {
    return this.http.get<TutorAdminSummary[]>(ApiEndpoints.LMS.ADMIN_TUTORS);
  }

  public async getTutorCurricula(tutorId: string): Promise<any[]> {
    const url = ApiEndpoints.LMS.ADMIN_TUTOR_CURRICULA(tutorId);
    return this.http.get<any[]>(url);
  }

  public async assignCurricula(tutorId: string, curriculumIds: string[]): Promise<{ message: string; assigned_curricula_ids: string[] }> {
    const url = ApiEndpoints.LMS.ADMIN_TUTOR_CURRICULA(tutorId);
    return this.http.post<{ message: string; assigned_curricula_ids: string[] }>(url, {
      curriculum_ids: curriculumIds,
    });
  }

  public async getTutorCourses(tutorId: string): Promise<any[]> {
    const url = ApiEndpoints.LMS.ADMIN_TUTOR_COURSES(tutorId);
    return this.http.get<any[]>(url);
  }

  public async assignCourses(tutorId: string, courseIds: string[]): Promise<{ message: string; assigned_course_ids: string[] }> {
    const url = ApiEndpoints.LMS.ADMIN_TUTOR_COURSES(tutorId);
    return this.http.post<{ message: string; assigned_course_ids: string[] }>(url, {
      course_ids: courseIds,
    });
  }

  // --- Tutor LMS Studio: Cohorts & Content Control ---

  public async getTutorCohorts(): Promise<CohortSelectorItem[]> {
    return this.http.get<CohortSelectorItem[]>(ApiEndpoints.LMS.TUTOR_COHORTS);
  }

  public async getTutorDeadlines(): Promise<CohortDeadlineItem[]> {
    try {
      const res = await this.http.get<any>(ApiEndpoints.LMS.TUTOR_DEADLINES);
      const data = res?.data || res || [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  public async getCohortCourses(cohortId: string): Promise<CohortCourseItem[]> {
    const url = ApiEndpoints.LMS.TUTOR_COHORT_COURSES(cohortId);
    return this.http.get<CohortCourseItem[]>(url);
  }

  public async getCohortModules(cohortId: string, courseId: string): Promise<CohortModuleItem[]> {
    const url = ApiEndpoints.LMS.TUTOR_COHORT_MODULES(cohortId, courseId);
    return this.http.get<CohortModuleItem[]>(url);
  }

  public async updateCohortModuleRelease(
    cohortId: string,
    moduleId: string,
    payload: { is_published?: boolean; is_locked?: boolean; unlock_date?: string | null }
  ): Promise<CohortModuleItem> {
    const url = ApiEndpoints.LMS.TUTOR_COHORT_MODULE_RELEASE(cohortId, moduleId);
    return this.http.post<CohortModuleItem>(url, payload);
  }

  public async getCohortQuizzes(cohortId: string, courseId: string): Promise<CohortQuizItem[]> {
    const url = ApiEndpoints.LMS.TUTOR_COHORT_QUIZZES(cohortId, courseId);
    return this.http.get<CohortQuizItem[]>(url);
  }

  public async scheduleCohortQuiz(
    cohortId: string,
    quizId: string,
    payload: {
      open_date?: string | null;
      deadline?: string | null;
      is_published?: boolean;
      is_locked?: boolean;
    }
  ): Promise<CohortQuizItem> {
    const url = ApiEndpoints.LMS.TUTOR_COHORT_QUIZ_SCHEDULE(cohortId, quizId);
    return this.http.post<CohortQuizItem>(url, payload);
  }

  public async extendCohortQuizDeadline(
    cohortId: string,
    quizId: string,
    payload: { extended_deadline: string; extension_reason: string }
  ): Promise<CohortQuizItem> {
    const url = ApiEndpoints.LMS.TUTOR_COHORT_QUIZ_EXTEND(cohortId, quizId);
    return this.http.post<CohortQuizItem>(url, payload);
  }

  // --- Tutor Activities Management ---

  public async getCohortActivities(cohortId: string, courseId?: string): Promise<CohortActivityItem[]> {
    let url = ApiEndpoints.LMS.TUTOR_COHORT_ACTIVITIES(cohortId);
    if (courseId) {
      url += `?course_id=${encodeURIComponent(courseId)}`;
    }
    return this.http.get<CohortActivityItem[]>(url);
  }

  public async createCohortActivity(cohortId: string, data: Partial<CohortActivityItem>): Promise<CohortActivityItem> {
    const url = ApiEndpoints.LMS.TUTOR_COHORT_ACTIVITIES(cohortId);
    return this.http.post<CohortActivityItem>(url, data);
  }

  public async updateCohortActivity(
    cohortId: string,
    activityId: string,
    data: Partial<CohortActivityItem>
  ): Promise<CohortActivityItem> {
    const url = ApiEndpoints.LMS.TUTOR_COHORT_ACTIVITY_DETAIL(cohortId, activityId);
    return this.http.patch<CohortActivityItem>(url, data);
  }

  public async deleteCohortActivity(cohortId: string, activityId: string): Promise<void> {
    const url = ApiEndpoints.LMS.TUTOR_COHORT_ACTIVITY_DETAIL(cohortId, activityId);
    await this.http.delete(url);
  }

  public async getActivitySubmissions(cohortId: string, activityId: string): Promise<StudentActivitySubmissionItem[]> {
    const url = ApiEndpoints.LMS.TUTOR_COHORT_ACTIVITY_SUBMISSIONS(cohortId, activityId);
    return this.http.get<StudentActivitySubmissionItem[]>(url);
  }

  public async gradeActivitySubmission(
    cohortId: string,
    activityId: string,
    submissionId: string,
    payload: { score: number; feedback?: string }
  ): Promise<StudentActivitySubmissionItem> {
    const url = ApiEndpoints.LMS.TUTOR_COHORT_ACTIVITY_GRADE(cohortId, activityId, submissionId);
    return this.http.post<StudentActivitySubmissionItem>(url, payload);
  }

  // --- Student Cohort Activities ---

  public async getStudentCohortActivities(cohortId?: string, courseId?: string): Promise<CohortActivityItem[]> {
    let url = ApiEndpoints.LMS.STUDENT_COHORT_ACTIVITIES(cohortId);
    if (courseId) {
      url += `?course_id=${encodeURIComponent(courseId)}`;
    }
    return this.http.get<CohortActivityItem[]>(url);
  }

  public async submitStudentActivity(
    cohortId: string,
    activityId: string,
    formData: FormData
  ): Promise<StudentActivitySubmissionItem> {
    const url = ApiEndpoints.LMS.STUDENT_COHORT_ACTIVITY_SUBMIT(cohortId, activityId);
    return this.http.post<StudentActivitySubmissionItem>(url, formData);
  }
}

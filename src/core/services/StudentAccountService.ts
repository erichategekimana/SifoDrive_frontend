import { ApiEndpoints } from '../api/ApiEndpoints';
import { HttpClient } from '../api/HttpClient';
import { Logger } from '../utils/Logger';

const logger = new Logger('StudentAccountService');

export interface ExamEligibilityCriteriaDTO {
  tuition_paid: boolean;
  attendance_rate: number;
  module_completion: number;
}

export interface ExamEligibilityDTO {
  eligible: boolean;
  reasons: string[];
  criteria: ExamEligibilityCriteriaDTO;
}

export interface StudentProfileDTO {
  preferred_language: string;
  license_category: string;
  enrollment_date: string | null;
  current_streak_days: number;
  longest_streak_days: number;
  last_activity_date: string | null;
}

export class StudentAccountService {
  private static instance: StudentAccountService;
  private readonly http: HttpClient;

  private constructor() {
    this.http = HttpClient.getInstance();
  }

  public static getInstance(): StudentAccountService {
    if (!StudentAccountService.instance) {
      StudentAccountService.instance = new StudentAccountService();
    }
    return StudentAccountService.instance;
  }

  public async getEligibility(): Promise<ExamEligibilityDTO> {
    try {
      logger.info('Fetching student exam eligibility pre-flight check');
      const res = await this.http.get<any>(ApiEndpoints.AUTH.STUDENT_ELIGIBILITY);
      return res.data || res;
    } catch (err) {
      logger.warn('Failed to fetch eligibility from backend, using safe fallback', err);
      return {
        eligible: false,
        reasons: ['Tuition fee has not been paid.'],
        criteria: {
          tuition_paid: false,
          attendance_rate: 0.8,
          module_completion: 0.65,
        },
      };
    }
  }

  public async getProfile(): Promise<StudentProfileDTO> {
    try {
      const res = await this.http.get<any>(ApiEndpoints.AUTH.STUDENT_PROFILE);
      return res.data || res;
    } catch {
      return {
        preferred_language: 'rw',
        license_category: 'B',
        enrollment_date: '2026-09-01',
        current_streak_days: 5,
        longest_streak_days: 12,
        last_activity_date: '2026-09-30',
      };
    }
  }

  public async updateProfile(data: Partial<StudentProfileDTO>): Promise<StudentProfileDTO> {
    const res = await this.http.patch<any>(ApiEndpoints.AUTH.STUDENT_PROFILE, data);
    return res.data || res;
  }
}

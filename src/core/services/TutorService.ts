import { ApiEndpoints } from '../api/ApiEndpoints';
import { HttpClient } from '../api/HttpClient';
import { Logger } from '../utils/Logger';

const logger = new Logger('TutorService');

export interface TutorStatsDTO {
  tutor_code: string;
  title: string;
  bio: string;
  specialization_categories: string[];
  default_meeting_url: string;
  is_available: boolean;
  max_capacity: number;
  total_students: number;
  active_students: number;
  rating: number;
  teaching_hours: number;
}

export interface TutorAssignedStudentDTO {
  id: string;
  full_name: string;
  phone_number: string;
  student_id: string | null;
  status: string;
  license_category: string;
  current_streak_days: number;
  exam_eligible: boolean;
  attendance_rate: number;
  module_completion: number;
  cohort_name?: string | null;
  cohort_identifier?: string | null;
}

export class TutorService {
  private static instance: TutorService;
  private readonly http: HttpClient;

  private constructor() {
    this.http = HttpClient.getInstance();
  }

  public static getInstance(): TutorService {
    if (!TutorService.instance) {
      TutorService.instance = new TutorService();
    }
    return TutorService.instance;
  }

  public async getStats(): Promise<TutorStatsDTO> {
    try {
      const res = await this.http.get<any>(ApiEndpoints.TUTOR.STATS);
      return res.data || res;
    } catch (err) {
      logger.warn('Failed to load tutor stats from API', err);
      return {
        tutor_code: '',
        title: '',
        bio: '',
        specialization_categories: [],
        default_meeting_url: '',
        is_available: true,
        max_capacity: 0,
        total_students: 0,
        active_students: 0,
        rating: 5.0,
        teaching_hours: 0,
      };
    }
  }

  public async getAssignedStudents(): Promise<TutorAssignedStudentDTO[]> {
    try {
      const res = await this.http.get<any>(ApiEndpoints.TUTOR.STUDENTS);
      const data = res.data || res || [];
      return Array.isArray(data) ? data : [];
    } catch (err) {
      logger.error('Failed to load assigned students from database:', err);
      return [];
    }
  }

  public async updateProfile(data: Partial<TutorStatsDTO>): Promise<any> {
    const res = await this.http.patch<any>(ApiEndpoints.TUTOR.PROFILE, data);
    return res.data || res;
  }
}

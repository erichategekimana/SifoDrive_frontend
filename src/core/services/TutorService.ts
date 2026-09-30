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
      logger.warn('Failed to load tutor stats from API, using fallback data', err);
      return {
        tutor_code: 'SIFO-TUT-001',
        title: 'Senior Traffic Law Instructor',
        bio: 'Certified Rwanda National Police Traffic Regulations Instructor with 8+ years experience.',
        specialization_categories: ['A', 'B', 'C'],
        default_meeting_url: 'https://meet.google.com/sifo-class-theory',
        is_available: true,
        max_capacity: 50,
        total_students: 24,
        active_students: 22,
        rating: 4.95,
        teaching_hours: 148,
      };
    }
  }

  public async getAssignedStudents(): Promise<TutorAssignedStudentDTO[]> {
    try {
      const res = await this.http.get<any>(ApiEndpoints.TUTOR.STUDENTS);
      return res.data || res || [];
    } catch (err) {
      logger.warn('Failed to load assigned students from API, using fallback list', err);
      return [
        {
          id: 'stu-1',
          full_name: 'Jean Paul Mugisha',
          phone_number: '+250788123456',
          student_id: 'SIFO-STU-2026-0042',
          status: 'ACTIVE',
          license_category: 'B',
          current_streak_days: 7,
          exam_eligible: true,
          attendance_rate: 0.88,
          module_completion: 1.0,
        },
        {
          id: 'stu-2',
          full_name: 'Aline Uwase',
          phone_number: '+250788654321',
          student_id: 'SIFO-STU-2026-0043',
          status: 'ACTIVE',
          license_category: 'B',
          current_streak_days: 3,
          exam_eligible: false,
          attendance_rate: 0.65,
          module_completion: 0.7,
        },
        {
          id: 'stu-3',
          full_name: 'Eric Nshimyumuremyi',
          phone_number: '+250788777888',
          student_id: 'SIFO-STU-2026-0045',
          status: 'ACTIVE',
          license_category: 'A',
          current_streak_days: 12,
          exam_eligible: true,
          attendance_rate: 0.95,
          module_completion: 1.0,
        },
      ];
    }
  }

  public async updateProfile(data: Partial<TutorStatsDTO>): Promise<any> {
    const res = await this.http.patch<any>(ApiEndpoints.TUTOR.PROFILE, data);
    return res.data || res;
  }
}

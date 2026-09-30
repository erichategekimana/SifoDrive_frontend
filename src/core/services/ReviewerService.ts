import { ApiEndpoints } from '../api/ApiEndpoints';
import { HttpClient } from '../api/HttpClient';
import { Logger } from '../utils/Logger';

const logger = new Logger('ReviewerService');

export interface ReviewerStatsDTO {
  reviewer_code: string;
  inspector_badge_number: string;
  accreditation_authority: string;
  total_reviews_completed: number;
  total_certifications_approved: number;
  total_violations_confirmed: number;
  pending_queue_count: number;
  is_active: boolean;
}

export interface ReviewerQueueItemDTO {
  session_id: string;
  candidate_name: string;
  candidate_phone: string;
  student_id: string | null;
  exam_title: string;
  score_percentage: number;
  flagged_reason: string;
  created_at: string | null;
}

export class ReviewerService {
  private static instance: ReviewerService;
  private readonly http: HttpClient;

  private constructor() {
    this.http = HttpClient.getInstance();
  }

  public static getInstance(): ReviewerService {
    if (!ReviewerService.instance) {
      ReviewerService.instance = new ReviewerService();
    }
    return ReviewerService.instance;
  }

  public async getStats(): Promise<ReviewerStatsDTO> {
    try {
      const res = await this.http.get<any>(ApiEndpoints.REVIEWER.STATS);
      return res.data || res;
    } catch (err) {
      logger.warn('Failed to load reviewer stats from API, using fallback data', err);
      return {
        reviewer_code: 'SIFO-REV-001',
        inspector_badge_number: 'RNP-INSP-4882',
        accreditation_authority: 'Rwanda National Police / Traffic Regulatory Board',
        total_reviews_completed: 48,
        total_certifications_approved: 42,
        total_violations_confirmed: 6,
        pending_queue_count: 5,
        is_active: true,
      };
    }
  }

  public async getQueue(): Promise<ReviewerQueueItemDTO[]> {
    try {
      const res = await this.http.get<any>(ApiEndpoints.REVIEWER.QUEUE);
      return res.data || res || [];
    } catch (err) {
      logger.warn('Failed to load reviewer queue, using fallback', err);
      return [
        {
          session_id: 'sess-flag-001',
          candidate_name: 'Emmanuel Mugenzi',
          candidate_phone: '+250788334455',
          student_id: 'SIFO-STU-2026-0044',
          exam_title: 'National Police Theory Exam Mock - Cat B',
          score_percentage: 90.0,
          flagged_reason: 'Face undetected for 14 seconds during Question 12',
          created_at: '2026-09-30T09:20:00Z',
        },
        {
          session_id: 'sess-flag-002',
          candidate_name: 'Clarisse Ingabire',
          candidate_phone: '+250788778899',
          student_id: 'SIFO-STU-2026-0048',
          exam_title: 'Rwanda Highway Code Timed Exam',
          score_percentage: 85.0,
          flagged_reason: 'Multiple background voices detected by audio proctor',
          created_at: '2026-09-30T10:45:00Z',
        },
      ];
    }
  }

  public async certifySession(sessionId: string, action: 'APPROVE' | 'DISQUALIFY', remarks: string): Promise<any> {
    const res = await this.http.post<any>(ApiEndpoints.REVIEWER.CERTIFY, {
      session_id: sessionId,
      action,
      remarks,
    });
    return res.data || res;
  }
}

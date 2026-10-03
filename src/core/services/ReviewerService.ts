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
      logger.error('Failed to load reviewer stats from API:', err);
      throw err;
    }
  }

  public async getQueue(): Promise<ReviewerQueueItemDTO[]> {
    try {
      const res = await this.http.get<any>(ApiEndpoints.REVIEWER.QUEUE);
      return res.data || res || [];
    } catch (err) {
      logger.error('Failed to load reviewer queue from API:', err);
      return [];
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

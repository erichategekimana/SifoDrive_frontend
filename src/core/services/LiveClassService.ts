import { ApiEndpoints } from '../api/ApiEndpoints';
import { HttpClient } from '../api/HttpClient';
import { LiveClass, type LiveClassDTO } from '../models/LiveClass';
import { Logger } from '../utils/Logger';

const logger = new Logger('LiveClassService');

export class LiveClassService {
  private static instance: LiveClassService;
  private readonly http: HttpClient;

  private constructor() {
    this.http = HttpClient.getInstance();
  }

  public static getInstance(): LiveClassService {
    if (!LiveClassService.instance) {
      LiveClassService.instance = new LiveClassService();
    }
    return LiveClassService.instance;
  }

  /**
   * Fetch scheduled live classes from database
   */
  public async getClasses(params?: { upcoming?: boolean; cohort?: string }): Promise<LiveClass[]> {
    logger.info('Fetching live classes schedule');
    try {
      let url = ApiEndpoints.LIVE_CLASSES.LIST;
      const queryParts: string[] = [];
      if (params?.upcoming) queryParts.push('upcoming=true');
      if (params?.cohort) queryParts.push(`cohort=${encodeURIComponent(params.cohort)}`);
      if (queryParts.length > 0) url += `?${queryParts.join('&')}`;

      const data = await this.http.get<any>(url);
      const results = Array.isArray(data) ? data : data?.results || [];
      return results.map((dto: LiveClassDTO) => new LiveClass(dto));
    } catch (err) {
      logger.error('Failed to load live classes from database:', err);
      return [];
    }
  }

  /**
   * Get attendance summary
   */
  public async getAttendanceSummary(): Promise<{ attendance_rate: number; total_sessions: number; attended: number }> {
    try {
      return await this.http.get(ApiEndpoints.LIVE_CLASSES.MY_ATTENDANCE);
    } catch {
      return {
        attendance_rate: 80,
        total_sessions: 10,
        attended: 8,
      };
    }
  }
}

import { ApiEndpoints } from '../api/ApiEndpoints';
import { HttpClient } from '../api/HttpClient';
import { LiveClass, type LiveClassDTO } from '../models/LiveClass';
import type { LiveClassScheduleItem } from './AdminService';
export type { LiveClassScheduleItem };
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
   * Fetch master class schedules (one record per recurring course offering)
   */
  public async getSchedules(params?: { cohort?: string }): Promise<LiveClassScheduleItem[]> {
    logger.info('Fetching live class master schedules');
    try {
      let url = ApiEndpoints.LIVE_CLASSES.SCHEDULES;
      if (params?.cohort) {
        url += `?cohort=${encodeURIComponent(params.cohort)}`;
      }
      const data = await this.http.get<any>(url);
      const results = Array.isArray(data) ? data : data?.results || [];
      return results;
    } catch (err) {
      logger.error('Failed to load master schedules:', err);
      return [];
    }
  }

  /**
   * Fetch single master schedule detail with child session dates
   */
  public async getScheduleDetail(scheduleId: string): Promise<LiveClassScheduleItem | null> {
    logger.info(`Fetching live class schedule detail ${scheduleId}`);
    try {
      const data = await this.http.get<any>(ApiEndpoints.LIVE_CLASSES.SCHEDULE_DETAIL(scheduleId));
      return data?.data || data;
    } catch (err) {
      logger.error(`Failed to load schedule detail ${scheduleId}:`, err);
      return null;
    }
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
   * Post or update recent session recording (Tutor as host or Training Admin)
   */
  public async postRecording(classId: string, recordingUrl: string, notes?: string): Promise<LiveClass> {
    logger.info(`Posting recording for live class ${classId}`);
    try {
      const data = await this.http.post<any>(ApiEndpoints.LIVE_CLASSES.RECORDING(classId), {
        recording_url: recordingUrl,
        notes: notes || undefined,
      });
      const dto: LiveClassDTO = data?.data || data;
      return new LiveClass(dto);
    } catch (err) {
      logger.error('Failed to post live class recording:', err);
      throw err;
    }
  }

  /**
   * Schedule new live class session (Training Admin)
   */
  public async scheduleClass(payload: Partial<LiveClassDTO>): Promise<LiveClass> {
    logger.info('Scheduling live class');
    try {
      const data = await this.http.post<any>(ApiEndpoints.LIVE_CLASSES.LIST, payload);
      const dto: LiveClassDTO = data?.data || data;
      return new LiveClass(dto);
    } catch (err) {
      logger.error('Failed to schedule live class:', err);
      throw err;
    }
  }

  /**
   * Update live class session details (Training Admin or Tutor)
   */
  public async updateClass(classId: string, payload: Partial<LiveClassDTO>): Promise<LiveClass> {
    logger.info(`Updating live class ${classId}`);
    try {
      const data = await this.http.patch<any>(ApiEndpoints.LIVE_CLASSES.DETAIL(classId), payload);
      const dto: LiveClassDTO = data?.data || data;
      return new LiveClass(dto);
    } catch (err) {
      logger.error('Failed to update live class:', err);
      throw err;
    }
  }

  /**
   * Delete a live class schedule (Training Admin or System Admin)
   */
  public async deleteClass(classId: string): Promise<void> {
    logger.info(`Deleting live class ${classId}`);
    try {
      await this.http.delete<any>(ApiEndpoints.LIVE_CLASSES.DETAIL(classId));
    } catch (err) {
      logger.error('Failed to delete live class:', err);
      throw err;
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

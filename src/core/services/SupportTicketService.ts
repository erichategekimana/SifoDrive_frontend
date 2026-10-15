import { ApiEndpoints } from '../api/ApiEndpoints';
import { HttpClient } from '../api/HttpClient';
import { Logger } from '../utils/Logger';

const logger = new Logger('SupportTicketService');

export interface HelpTicketDTO {
  id: string;
  user?: string;
  user_name?: string;
  user_phone?: string;
  user_role?: string;
  user_email?: string;
  recipient_role: 'TUTOR' | 'TECH_SUPPORT' | 'TRAINING_ADMIN';
  category: 'CONTENT_INQUIRY' | 'TECHNICAL_ISSUE' | 'EXAM_DISPUTE' | 'ACCOUNT_BILLING' | 'ADMINISTRATIVE' | 'OTHER';
  subject: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED';
  assigned_to?: string;
  assigned_to_name?: string;
  forwarded_by?: string;
  forwarded_by_name?: string;
  forwarded_at?: string;
  internal_notes?: string;
  response?: string;
  resolved_at?: string;
  feedback_rating?: 'LIKE' | 'DISLIKE' | null;
  feedback_resolution?: 'SOLVED' | 'UNSOLVED' | null;
  feedback_notes?: string;
  feedback_submitted_at?: string;
  created_at: string;
}

export interface AssignableUserDTO {
  id: string;
  full_name: string;
  phone_number: string;
  role: string;
  email: string;
}

export interface SupportAnnouncementDTO {
  id: string;
  title: string;
  author: string;
  author_name?: string;
  author_role?: string;
  date: string;
  category: string;
  content: string;
  is_pinned: boolean;
  course_id?: string;
  course_name?: string;
  course_title?: string;
  target_type?: 'SINGLE_COHORT' | 'ALL_ASSIGNED_COHORTS' | 'COURSE_WIDE';
  cohort_id?: string | null;
  cohort_name?: string | null;
  cohort_names?: string[];
  target_url?: string;
  created_at?: string;
}

export class SupportTicketService {
  private static instance: SupportTicketService;
  private readonly http: HttpClient;

  private constructor() {
    this.http = HttpClient.getInstance();
  }

  public static getInstance(): SupportTicketService {
    if (!SupportTicketService.instance) {
      SupportTicketService.instance = new SupportTicketService();
    }
    return SupportTicketService.instance;
  }

  public async getTickets(): Promise<HelpTicketDTO[]> {
    logger.info('Fetching help tickets');
    try {
      const res = await this.http.get<{ results?: HelpTicketDTO[] } | HelpTicketDTO[]>(
        ApiEndpoints.LMS.SUPPORT_TICKETS
      );
      if (Array.isArray(res)) return res;
      if (res && Array.isArray((res as any).data)) return (res as any).data;
      if (res && Array.isArray((res as any).results)) return (res as any).results;
      return [];
    } catch (err) {
      logger.error('Failed to load tickets from server:', err);
      return [];
    }
  }

  public async createTicket(payload: {
    recipient_role: 'TUTOR' | 'TECH_SUPPORT' | 'TRAINING_ADMIN';
    category: 'CONTENT_INQUIRY' | 'TECHNICAL_ISSUE' | 'EXAM_DISPUTE' | 'ACCOUNT_BILLING' | 'ADMINISTRATIVE' | 'OTHER';
    subject: string;
    message: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }): Promise<HelpTicketDTO> {
    logger.info(`Submitting new ticket: ${payload.subject}`);
    return this.http.post<HelpTicketDTO>(ApiEndpoints.LMS.SUPPORT_TICKETS, payload);
  }

  public async getAnnouncements(params?: { course_id?: string; cohort_id?: string }): Promise<SupportAnnouncementDTO[]> {
    logger.info('Fetching support bulletins and announcements', params);
    try {
      const query = new URLSearchParams();
      if (params?.course_id) query.append('course_id', params.course_id);
      if (params?.cohort_id) query.append('cohort_id', params.cohort_id);
      const qs = query.toString();
      const url = qs ? `${ApiEndpoints.LMS.SUPPORT_ANNOUNCEMENTS}?${qs}` : ApiEndpoints.LMS.SUPPORT_ANNOUNCEMENTS;

      const res = await this.http.get<SupportAnnouncementDTO[]>(url);
      if (Array.isArray(res)) return res;
      if (res && Array.isArray((res as any).data)) return (res as any).data;
      return [];
    } catch (err) {
      logger.error('Failed to load announcements:', err);
      return [];
    }
  }

  public async createAnnouncement(payload: {
    course_id?: string;
    title: string;
    content: string;
    target_type?: 'SINGLE_COHORT' | 'ALL_ASSIGNED_COHORTS' | 'PLATFORM_WIDE' | 'COURSE_WIDE';
    cohort_id?: string;
    category?: string;
    is_pinned?: boolean;
  }): Promise<SupportAnnouncementDTO> {
    logger.info(`Creating announcement: ${payload.title}`, payload);
    const res = await this.http.post<{ data: SupportAnnouncementDTO } | SupportAnnouncementDTO>(
      ApiEndpoints.LMS.SUPPORT_ANNOUNCEMENTS,
      payload
    );
    if (res && (res as any).data) return (res as any).data;
    return res as SupportAnnouncementDTO;
  }

  public async deleteAnnouncement(id: string): Promise<void> {
    logger.info(`Deleting announcement: ${id}`);
    await this.http.delete(ApiEndpoints.LMS.SUPPORT_ANNOUNCEMENT_DETAIL(id));
  }

  public async resolveTicket(
    id: string,
    response: string,
    status: 'RESOLVED' | 'CLOSED' = 'RESOLVED'
  ): Promise<HelpTicketDTO> {
    return this.http.patch<HelpTicketDTO>(ApiEndpoints.LMS.SUPPORT_TICKET_DETAIL(id), {
      response,
      status,
    });
  }

  public async forwardTicket(
    id: string,
    payload: { assigned_to: string; internal_notes?: string }
  ): Promise<HelpTicketDTO> {
    logger.info(`Forwarding ticket ${id} to user ${payload.assigned_to}`);
    return this.http.post<HelpTicketDTO>(ApiEndpoints.LMS.SUPPORT_TICKET_FORWARD(id), payload);
  }

  public async updateTicketStatus(
    id: string,
    payload: { status: string; response?: string; internal_notes?: string; assigned_to?: string }
  ): Promise<HelpTicketDTO> {
    logger.info(`Updating ticket status ${id} to ${payload.status}`);
    return this.http.patch<HelpTicketDTO>(ApiEndpoints.LMS.SUPPORT_TICKET_STATUS(id), payload);
  }

  public async submitFeedback(
    id: string,
    payload: {
      rating: 'LIKE' | 'DISLIKE';
      resolution: 'SOLVED' | 'UNSOLVED';
      notes?: string;
    }
  ): Promise<HelpTicketDTO> {
    logger.info(`Submitting feedback for ticket ${id}:`, payload);
    return this.http.post<HelpTicketDTO>(ApiEndpoints.LMS.SUPPORT_TICKET_FEEDBACK(id), payload);
  }

  public async getAssignableUsers(): Promise<AssignableUserDTO[]> {
    logger.info('Fetching assignable users for ticket forwarding');
    try {
      const res = await this.http.get<{ results?: AssignableUserDTO[] } | AssignableUserDTO[]>(
        ApiEndpoints.LMS.SUPPORT_ASSIGNABLE_USERS
      );
      if (Array.isArray(res)) return res;
      if (res && Array.isArray((res as any).data)) return (res as any).data;
      if (res && Array.isArray((res as any).results)) return (res as any).results;
      return [];
    } catch (err) {
      logger.error('Failed to load assignable users:', err);
      return [];
    }
  }
}

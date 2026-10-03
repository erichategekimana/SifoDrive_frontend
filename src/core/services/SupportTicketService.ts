import { ApiEndpoints } from '../api/ApiEndpoints';
import { HttpClient } from '../api/HttpClient';
import { Logger } from '../utils/Logger';

const logger = new Logger('SupportTicketService');

export interface HelpTicketDTO {
  id: string;
  user?: string;
  user_name?: string;
  user_phone?: string;
  recipient_role: 'TUTOR' | 'TECH_SUPPORT';
  category: 'CONTENT_INQUIRY' | 'TECHNICAL_ISSUE' | 'EXAM_DISPUTE' | 'ACCOUNT_BILLING' | 'OTHER';
  subject: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assigned_to?: string;
  assigned_to_name?: string;
  response?: string;
  resolved_at?: string;
  created_at: string;
}

export interface SupportAnnouncementDTO {
  id: string;
  title: string;
  author: string;
  date: string;
  category: string;
  content: string;
  is_pinned: boolean;
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
    recipient_role: 'TUTOR' | 'TECH_SUPPORT';
    category: 'CONTENT_INQUIRY' | 'TECHNICAL_ISSUE' | 'EXAM_DISPUTE' | 'ACCOUNT_BILLING' | 'OTHER';
    subject: string;
    message: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }): Promise<HelpTicketDTO> {
    logger.info(`Submitting new ticket: ${payload.subject}`);
    return this.http.post<HelpTicketDTO>(ApiEndpoints.LMS.SUPPORT_TICKETS, payload);
  }

  public async getAnnouncements(): Promise<SupportAnnouncementDTO[]> {
    logger.info('Fetching support bulletins and announcements');
    try {
      const res = await this.http.get<SupportAnnouncementDTO[]>(
        ApiEndpoints.LMS.SUPPORT_ANNOUNCEMENTS
      );
      if (Array.isArray(res)) return res;
      if (res && Array.isArray((res as any).data)) return (res as any).data;
      return [];
    } catch (err) {
      logger.error('Failed to load announcements:', err);
      return [];
    }
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
}

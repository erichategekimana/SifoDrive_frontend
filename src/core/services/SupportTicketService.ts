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
      if (res && Array.isArray(res.results)) return res.results;
      return [];
    } catch (err) {
      logger.warn('Failed to load tickets from server, using fallback sample tickets:', err);
      return [
        {
          id: 'tkt-001',
          recipient_role: 'TUTOR',
          category: 'CONTENT_INQUIRY',
          subject: "Icyapa cy'Umuvuduko muto usabwa",
          message: 'Mwaramutse mwarimu, ntabwo nasobanukiwe itandukaniro ry\'icyapa cy\'ubururu cyanditseho 30.',
          priority: 'MEDIUM',
          status: 'RESOLVED',
          assigned_to_name: 'Mwarimu Kamanzi',
          response: 'Ubururu buranga icyapa cyo gutegeka. Bisobanura ko utagomba kugendera munsi ya 30 km/h.',
          created_at: '2026-09-29T10:15:00Z',
          resolved_at: '2026-09-29T14:30:00Z',
        },
        {
          id: 'tkt-002',
          recipient_role: 'TECH_SUPPORT',
          category: 'TECHNICAL_ISSUE',
          subject: 'Video ya Module 2 irimo gucikagurika',
          message: 'Iyo ngeze kuri videwo ya kabiri y\'Amategeko y\'Umuhanda ntabwo irimo gufunguka neza.',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          assigned_to_name: 'Support Desk Sifo',
          response: 'Muraho! Twabibonye, itsinda ry\'ikoranabuhanga ririmo kubikosora mu minota 30.',
          created_at: '2026-09-30T08:00:00Z',
        },
      ];
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
      return [];
    } catch (err) {
      logger.warn('Failed to load announcements, returning fallback defaults:', err);
      return [
        {
          id: 'ann-001',
          title: "Gahunda y'Amasomo y'Imbonankubone (Live Google Meet Sessions)",
          author: 'Training Admin & Instructors',
          date: '2026-09-28',
          category: 'TRAINING',
          content: 'Amasomo yose y\'amatsinda azajya aba kuwa mbere no kuwa gatatu guhera 18:00 kugeza 20:00.',
          is_pinned: true,
        },
        {
          id: 'ann-002',
          title: 'Kwandikisha Ikizamini cya Polisi kuri Irembo',
          author: 'Tech Support Team',
          date: '2026-09-25',
          category: 'SYSTEM',
          content: 'Banza wemeze ko wagejeje 85% mu bizamini by\'igerageza hano kuri Sifo Drive kugira ngo wemererwe.',
          is_pinned: false,
        },
      ];
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

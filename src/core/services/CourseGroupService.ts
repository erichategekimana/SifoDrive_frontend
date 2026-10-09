import { ApiEndpoints } from '../api/ApiEndpoints';
import { HttpClient } from '../api/HttpClient';

export interface CourseRosterUserDTO {
  id: string;
  name: string;
  role: 'Instructor' | 'Student';
  student_id?: string | null;
  category: string;
  avatar_color: string;
  last_active: string;
}

export interface CourseGroupMessageDTO {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'Tutor' | 'Student';
  avatar_color: string;
  timestamp: string;
  text: string;
  created_at: string;
}

export interface CourseGroupMemberDTO {
  id: string;
  name: string;
  role: 'Instructor' | 'Student';
  avatar_color: string;
}

export interface CourseGroupDTO {
  id: string;
  name: string;
  description: string;
  category: string;
  creator_name: string;
  creator_role: 'Tutor' | 'Student';
  members_count: number;
  is_member: boolean;
  created_at_formatted: string;
  created_at: string;
}

export interface CourseGroupDetailDTO extends CourseGroupDTO {
  messages: CourseGroupMessageDTO[];
  members: CourseGroupMemberDTO[];
}

export interface CreateCourseGroupPayload {
  name: string;
  description?: string;
  category?: string;
}

export class CourseGroupService {
  private static instance: CourseGroupService;
  private readonly http: HttpClient;

  private constructor() {
    this.http = HttpClient.getInstance();
  }

  public static getInstance(): CourseGroupService {
    if (!CourseGroupService.instance) {
      CourseGroupService.instance = new CourseGroupService();
    }
    return CourseGroupService.instance;
  }

  /**
   * Fetch course participant roster (instructors and classmates).
   */
  public async getRoster(courseId: string): Promise<CourseRosterUserDTO[]> {
    const res = await this.http.get<{ data: CourseRosterUserDTO[] } | CourseRosterUserDTO[]>(
      ApiEndpoints.LMS.COURSE_ROSTER(courseId)
    );
    if (res && 'data' in res && Array.isArray(res.data)) {
      return res.data;
    }
    return Array.isArray(res) ? res : [];
  }

  /**
   * Fetch study groups for a course.
   */
  public async getGroups(courseId: string): Promise<CourseGroupDTO[]> {
    const res = await this.http.get<{ data: CourseGroupDTO[] } | CourseGroupDTO[]>(
      ApiEndpoints.LMS.COURSE_GROUPS(courseId)
    );
    if (res && 'data' in res && Array.isArray(res.data)) {
      return res.data;
    }
    return Array.isArray(res) ? res : [];
  }

  /**
   * Fetch full group details including messages and members.
   */
  public async getGroupDetail(groupId: string): Promise<CourseGroupDetailDTO> {
    const res = await this.http.get<{ data: CourseGroupDetailDTO } | CourseGroupDetailDTO>(
      ApiEndpoints.LMS.COURSE_GROUP_DETAIL(groupId)
    );
    if (res && 'data' in res && res.data) {
      return res.data;
    }
    return res as CourseGroupDetailDTO;
  }

  /**
   * Create a new study group for a course.
   */
  public async createGroup(courseId: string, payload: CreateCourseGroupPayload): Promise<CourseGroupDetailDTO> {
    const res = await this.http.post<{ data: CourseGroupDetailDTO } | CourseGroupDetailDTO>(
      ApiEndpoints.LMS.COURSE_GROUPS(courseId),
      payload
    );
    if (res && 'data' in res && res.data) {
      return res.data;
    }
    return res as CourseGroupDetailDTO;
  }

  /**
   * Join or leave a study group.
   */
  public async toggleJoinGroup(groupId: string): Promise<{ is_member: boolean; members_count: number }> {
    const res = await this.http.post<{ data: { is_member: boolean; members_count: number } }>(
      ApiEndpoints.LMS.COURSE_GROUP_TOGGLE_JOIN(groupId)
    );
    return res.data;
  }

  /**
   * Send a chat message in a study group.
   */
  public async sendMessage(groupId: string, content: string): Promise<CourseGroupMessageDTO> {
    const res = await this.http.post<{ data: CourseGroupMessageDTO } | CourseGroupMessageDTO>(
      ApiEndpoints.LMS.COURSE_GROUP_MESSAGES(groupId),
      { content }
    );
    if (res && 'data' in res && res.data) {
      return res.data;
    }
    return res as CourseGroupMessageDTO;
  }
}

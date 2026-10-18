import { ApiEndpoints } from '../api/ApiEndpoints';
import { HttpClient } from '../api/HttpClient';

export interface CourseRosterUserDTO {
  id: string;
  name: string;
  role: 'Instructor' | 'Student';
  student_id?: string | null;
  category: string;
  avatar_color: string;
  profile_photo?: string | null;
  last_active: string;
}

export interface CourseGroupMessageDTO {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'Tutor' | 'Student';
  avatar_color: string;
  profile_photo?: string | null;
  timestamp: string;
  text: string;
  created_at: string;
}

export interface CourseGroupMemberDTO {
  id: string;
  name: string;
  role: 'Instructor' | 'Student';
  student_id?: string | null;
  avatar_color: string;
  profile_photo?: string | null;
  is_creator?: boolean;
}

export interface CourseGroupDTO {
  id: string;
  course_id?: string;
  course_title?: string;
  name: string;
  description: string;
  category: string;
  creator_id?: string;
  creator_name: string;
  creator_role: 'Tutor' | 'Student';
  allow_students_to_add_members?: boolean;
  can_add_members?: boolean;
  can_manage_group?: boolean;
  members_count: number;
  is_member: boolean;
  created_at_formatted: string;
  created_at: string;
  last_activity?: string;
}

export interface CourseGroupDetailDTO extends CourseGroupDTO {
  messages: CourseGroupMessageDTO[];
  members: CourseGroupMemberDTO[];
}

export interface CreateCourseGroupPayload {
  course_id?: string;
  name: string;
  description?: string;
  category?: string;
  allow_students_to_add_members?: boolean;
}

export interface UpdateCourseGroupPayload {
  name?: string;
  description?: string;
  category?: string;
  allow_students_to_add_members?: boolean;
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
   * Fetch study groups for a single course.
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
   * Fetch all study groups across all courses accessible to the student.
   */
  public async getAllGroups(params?: {
    courseId?: string;
    myGroupsOnly?: boolean;
    search?: string;
  }): Promise<CourseGroupDTO[]> {
    const query = new URLSearchParams();
    if (params?.courseId) query.set('course_id', params.courseId);
    if (params?.myGroupsOnly) query.set('my_groups', 'true');
    if (params?.search) query.set('search', params.search);

    const queryString = query.toString();
    const url = `${ApiEndpoints.LMS.ALL_GROUPS}${queryString ? `?${queryString}` : ''}`;
    const res = await this.http.get<{ data: CourseGroupDTO[] } | CourseGroupDTO[]>(url);
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
   * Create a new study group across any of the student's courses.
   */
  public async createGlobalGroup(payload: CreateCourseGroupPayload): Promise<CourseGroupDetailDTO> {
    const res = await this.http.post<{ data: CourseGroupDetailDTO } | CourseGroupDetailDTO>(
      ApiEndpoints.LMS.ALL_GROUPS,
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
   * Add a single member to a group.
   */
  public async addMember(groupId: string, userId: string): Promise<CourseGroupDetailDTO> {
    const res = await this.http.post<{ data: CourseGroupDetailDTO } | CourseGroupDetailDTO>(
      ApiEndpoints.LMS.COURSE_GROUP_MEMBERS(groupId),
      { user_id: userId }
    );
    if (res && 'data' in res && res.data) {
      return res.data;
    }
    return res as CourseGroupDetailDTO;
  }

  /**
   * Add multiple members to a group.
   */
  public async addMembers(groupId: string, userIds: string[]): Promise<CourseGroupDetailDTO> {
    const res = await this.http.post<{ data: CourseGroupDetailDTO } | CourseGroupDetailDTO>(
      ApiEndpoints.LMS.COURSE_GROUP_MEMBERS(groupId),
      { user_ids: userIds }
    );
    if (res && 'data' in res && res.data) {
      return res.data;
    }
    return res as CourseGroupDetailDTO;
  }

  /**
   * Update study group settings (permissions, name, description, etc).
   */
  public async updateGroupSettings(
    groupId: string,
    payload: UpdateCourseGroupPayload
  ): Promise<CourseGroupDetailDTO> {
    const res = await this.http.patch<{ data: CourseGroupDetailDTO } | CourseGroupDetailDTO>(
      ApiEndpoints.LMS.COURSE_GROUP_DETAIL(groupId),
      payload
    );
    if (res && 'data' in res && res.data) {
      return res.data;
    }
    return res as CourseGroupDetailDTO;
  }

  /**
   * Remove a member from a group (by group creator or instructor).
   */
  public async removeMember(groupId: string, userId: string): Promise<CourseGroupDetailDTO> {
    const res = await this.http.delete<{ data: CourseGroupDetailDTO } | CourseGroupDetailDTO>(
      ApiEndpoints.LMS.COURSE_GROUP_MEMBER_REMOVE(groupId, userId)
    );
    if (res && 'data' in res && res.data) {
      return res.data;
    }
    return res as CourseGroupDetailDTO;
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


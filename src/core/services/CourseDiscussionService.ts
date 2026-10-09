import { ApiEndpoints } from '../api/ApiEndpoints';
import { HttpClient } from '../api/HttpClient';

export interface DiscussionReplyDTO {
  id: string;
  topic_id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  is_author_tutor: boolean;
  parent_id?: string | null;
  content: string;
  likes_count: number;
  has_liked: boolean;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface DiscussionTopicDTO {
  id: string;
  course_id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  is_author_tutor: boolean;
  title: string;
  content: string;
  is_locked: boolean;
  is_pinned: boolean;
  replies_count: number;
  likes_count: number;
  has_liked: boolean;
  date: string;
  created_at: string;
  updated_at: string;
  replies?: DiscussionReplyDTO[];
}

export class CourseDiscussionService {
  private static instance: CourseDiscussionService;
  private readonly http: HttpClient;

  private constructor() {
    this.http = HttpClient.getInstance();
  }

  public static getInstance(): CourseDiscussionService {
    if (!CourseDiscussionService.instance) {
      CourseDiscussionService.instance = new CourseDiscussionService();
    }
    return CourseDiscussionService.instance;
  }

  /**
   * Fetch all discussion topics for a given course.
   */
  public async getDiscussions(courseId: string): Promise<DiscussionTopicDTO[]> {
    const res = await this.http.get<{ data: DiscussionTopicDTO[] } | DiscussionTopicDTO[]>(
      ApiEndpoints.LMS.COURSE_DISCUSSIONS(courseId)
    );
    if (Array.isArray(res)) return res;
    if (res && Array.isArray((res as any).data)) return (res as any).data;
    return [];
  }

  /**
   * Create a new discussion topic in a course.
   */
  public async createDiscussion(
    courseId: string,
    payload: { title: string; content: string; is_pinned?: boolean }
  ): Promise<DiscussionTopicDTO> {
    const res = await this.http.post<{ data: DiscussionTopicDTO } | DiscussionTopicDTO>(
      ApiEndpoints.LMS.COURSE_DISCUSSIONS(courseId),
      payload
    );
    if (res && (res as any).data) return (res as any).data;
    return res as DiscussionTopicDTO;
  }

  /**
   * Fetch topic details along with threaded replies.
   */
  public async getDiscussionDetail(topicId: string): Promise<DiscussionTopicDTO> {
    const res = await this.http.get<{ data: DiscussionTopicDTO } | DiscussionTopicDTO>(
      ApiEndpoints.LMS.DISCUSSION_DETAIL(topicId)
    );
    if (res && (res as any).data) return (res as any).data;
    return res as DiscussionTopicDTO;
  }

  /**
   * Delete a discussion topic (tutors or authors).
   */
  public async deleteDiscussion(topicId: string): Promise<void> {
    await this.http.delete(ApiEndpoints.LMS.DISCUSSION_DETAIL(topicId));
  }

  /**
   * Lock or unlock a discussion topic (tutors only).
   */
  public async toggleLockDiscussion(topicId: string): Promise<{ is_locked: boolean }> {
    const res = await this.http.post<{ data: { is_locked: boolean } } | { is_locked: boolean }>(
      ApiEndpoints.LMS.DISCUSSION_TOGGLE_LOCK(topicId),
      {}
    );
    if (res && (res as any).data) return (res as any).data;
    return res as { is_locked: boolean };
  }

  /**
   * Like or unlike a discussion topic.
   */
  public async toggleLikeDiscussion(
    topicId: string
  ): Promise<{ has_liked: boolean; likes_count: number }> {
    const res = await this.http.post<
      { data: { has_liked: boolean; likes_count: number } } | { has_liked: boolean; likes_count: number }
    >(ApiEndpoints.LMS.DISCUSSION_TOGGLE_LIKE(topicId), {});
    if (res && (res as any).data) return (res as any).data;
    return res as { has_liked: boolean; likes_count: number };
  }

  /**
   * Post a reply to a discussion topic or nested reply.
   */
  public async createReply(
    topicId: string,
    payload: { content: string; parent_id?: string | null }
  ): Promise<DiscussionReplyDTO> {
    const res = await this.http.post<{ data: DiscussionReplyDTO } | DiscussionReplyDTO>(
      ApiEndpoints.LMS.DISCUSSION_REPLIES(topicId),
      payload
    );
    if (res && (res as any).data) return (res as any).data;
    return res as DiscussionReplyDTO;
  }

  /**
   * Like or unlike a reply / comment.
   */
  public async toggleLikeReply(
    topicId: string,
    replyId: string
  ): Promise<{ has_liked: boolean; likes_count: number }> {
    const res = await this.http.post<
      { data: { has_liked: boolean; likes_count: number } } | { has_liked: boolean; likes_count: number }
    >(ApiEndpoints.LMS.DISCUSSION_REPLY_TOGGLE_LIKE(topicId, replyId), {});
    if (res && (res as any).data) return (res as any).data;
    return res as { has_liked: boolean; likes_count: number };
  }

  /**
   * Delete a reply (tutors or authors).
   */
  public async deleteReply(topicId: string, replyId: string): Promise<void> {
    await this.http.delete(ApiEndpoints.LMS.DISCUSSION_REPLY_DELETE(topicId, replyId));
  }
}

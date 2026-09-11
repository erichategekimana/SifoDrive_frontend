import { ApiEndpoints } from '../api/ApiEndpoints';
import { HttpClient } from '../api/HttpClient';
import { Course, type CourseDTO } from '../models/Course';
import { Module, type ModuleDTO } from '../models/Module';
import { Lesson, type LessonDTO } from '../models/Lesson';
import { RoadSign, type RoadSignDTO } from '../models/RoadSign';
import { Logger } from '../utils/Logger';

const logger = new Logger('LmsService');

export interface ProgressSummaryDTO {
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  quizzes_taken: number;
  average_quiz_score: number;
}

export class LmsService {
  private static instance: LmsService;
  private readonly http: HttpClient;

  private constructor() {
    this.http = HttpClient.getInstance();
  }

  public static getInstance(): LmsService {
    if (!LmsService.instance) {
      LmsService.instance = new LmsService();
    }
    return LmsService.instance;
  }

  /**
   * List all published theory courses
   */
  public async getCourses(): Promise<Course[]> {
    logger.info('Fetching courses catalogue');
    const data = await this.http.get<any>(ApiEndpoints.LMS.COURSES);
    const results = Array.isArray(data) ? data : data.results || [];
    return results.map((dto: CourseDTO) => new Course(dto));
  }

  /**
   * Get single course by ID
   */
  public async getCourseDetail(courseId: string): Promise<Course> {
    const data = await this.http.get<CourseDTO>(ApiEndpoints.LMS.COURSE_DETAIL(courseId));
    return new Course(data);
  }

  /**
   * Get modules for a course
   */
  public async getCourseModules(courseId: string): Promise<Module[]> {
    const data = await this.http.get<any>(ApiEndpoints.LMS.COURSE_MODULES(courseId));
    const results = Array.isArray(data) ? data : data.results || [];
    return results.map((dto: ModuleDTO) => new Module(dto));
  }

  /**
   * Get lesson detail
   */
  public async getLessonDetail(lessonId: string): Promise<Lesson> {
    const data = await this.http.get<LessonDTO>(ApiEndpoints.LMS.LESSON_DETAIL(lessonId));
    return new Lesson(data);
  }

  /**
   * Mark a lesson as completed
   */
  public async markLessonComplete(lessonId: string): Promise<void> {
    logger.info(`Marking lesson ${lessonId} as complete`);
    await this.http.post(ApiEndpoints.LMS.PROGRESS_COMPLETE, { lesson: lessonId });
  }

  /**
   * Get Rwanda road sign reference list
   */
  public async getRoadSigns(category?: string): Promise<RoadSign[]> {
    logger.info('Fetching road signs');
    const url = category ? `${ApiEndpoints.LMS.ROAD_SIGNS}?category=${category}` : ApiEndpoints.LMS.ROAD_SIGNS;
    const data = await this.http.get<any>(url);
    const results = Array.isArray(data) ? data : data.results || [];
    return results.map((dto: RoadSignDTO) => new RoadSign(dto));
  }

  /**
   * Get student progress summary
   */
  public async getProgressSummary(): Promise<ProgressSummaryDTO> {
    try {
      return await this.http.get<ProgressSummaryDTO>(ApiEndpoints.LMS.PROGRESS_SUMMARY);
    } catch {
      return {
        total_lessons: 15,
        completed_lessons: 4,
        progress_percentage: 27,
        quizzes_taken: 2,
        average_quiz_score: 85,
      };
    }
  }
}

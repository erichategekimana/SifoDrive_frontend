/**
 * Sifo Drive — Lesson Domain Model
 */

export type LessonType = 'TEXT' | 'AUDIO' | 'VIDEO' | 'ROAD_SIGN' | 'QUIZ';

export interface LessonDTO {
  id: string;
  module: string;
  title: string;
  lesson_type: LessonType;
  order?: number;
  sort_order?: number;
  content?: string;
  content_text?: string;
  video_url?: string | null;
  audio_url?: string | null;
  media_url?: string | null;
  media_file?: string | null;
  duration_minutes?: number;
  is_free_preview?: boolean;
  is_student_only?: boolean;
  isStudentOnly?: boolean;
  isCompleted?: boolean;
  is_completed?: boolean;
  question_count?: number;
}

export class Lesson {
  public readonly id: string;
  public readonly moduleId: string;
  public readonly title: string;
  public readonly lessonType: LessonType;
  public readonly order: number;
  public readonly content: string;
  public readonly videoUrl: string | null;
  public readonly audioUrl: string | null;
  public readonly durationMinutes: number;
  public readonly isFreePreview: boolean;
  public readonly isStudentOnly: boolean;
  public readonly isCompleted: boolean;
  public readonly questionCount: number;

  constructor(dto: LessonDTO) {
    this.id = dto.id;
    this.moduleId = dto.module;
    this.title = dto.title;
    this.lessonType = dto.lesson_type;
    this.order = dto.order ?? dto.sort_order ?? 0;
    this.content = dto.content || dto.content_text || '';
    this.videoUrl = dto.video_url || dto.media_url || null;
    this.audioUrl = dto.audio_url || (dto.lesson_type === 'AUDIO' ? (dto.media_file || dto.media_url || null) : null) || null;
    this.durationMinutes = dto.duration_minutes ?? 10;
    this.isFreePreview = Boolean(dto.is_free_preview);
    this.isStudentOnly = Boolean(dto.isStudentOnly ?? dto.is_student_only ?? false);
    this.isCompleted = Boolean(dto.isCompleted ?? dto.is_completed);
    this.questionCount = dto.question_count ?? 0;
  }

  public getFormattedDuration(): string {
    return `${this.durationMinutes} min`;
  }

  public getBadgeLabel(): string {
    switch (this.lessonType) {
      case 'ROAD_SIGN': return 'Road Sign';
      case 'QUIZ': return 'Practice Quiz';
      case 'VIDEO': return 'Video';
      case 'AUDIO': return 'Audio';
      default: return 'Article';
    }
  }
}


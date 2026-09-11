/**
 * Sifo Drive — Lesson Domain Model
 */

export type LessonType = 'TEXT' | 'AUDIO' | 'VIDEO' | 'ROAD_SIGN' | 'QUIZ';

export interface LessonDTO {
  id: string;
  module: string;
  title: string;
  lesson_type: LessonType;
  order: number;
  content?: string;
  video_url?: string | null;
  audio_url?: string | null;
  duration_minutes?: number;
  is_free_preview?: boolean;
  isCompleted?: boolean;
  is_completed?: boolean;
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
  public readonly isCompleted: boolean;

  constructor(dto: LessonDTO) {
    this.id = dto.id;
    this.moduleId = dto.module;
    this.title = dto.title;
    this.lessonType = dto.lesson_type;
    this.order = dto.order ?? 0;
    this.content = dto.content || '';
    this.videoUrl = dto.video_url ?? null;
    this.audioUrl = dto.audio_url ?? null;
    this.durationMinutes = dto.duration_minutes ?? 10;
    this.isFreePreview = Boolean(dto.is_free_preview);
    this.isCompleted = Boolean(dto.isCompleted ?? dto.is_completed);
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

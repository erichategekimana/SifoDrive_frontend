/**
 * Sifo Drive — Lesson & Multi-Content Domain Model
 */

export type LessonType = 'TEXT' | 'AUDIO' | 'VIDEO' | 'ROAD_SIGN' | 'QUIZ' | 'MULTI';

export type LessonContentType = 'TEXT' | 'AUDIO' | 'VIDEO' | 'IMAGE' | 'DOCUMENT';

export type DocumentFormatType = 'PDF' | 'POWERPOINT' | 'PRESENTATION' | 'CANVA' | 'OTHER';

export interface LessonContentDTO {
  id: string;
  lesson?: string;
  title?: string;
  content_type: LessonContentType;
  document_type?: DocumentFormatType;
  sort_order?: number;
  duration_minutes?: number;
  content_text?: string;
  media_file?: string | null;
  media_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export class LessonContentItem {
  public readonly id: string;
  public readonly lessonId?: string;
  public readonly title: string;
  public readonly contentType: LessonContentType;
  public readonly documentType: DocumentFormatType;
  public readonly sortOrder: number;
  public readonly durationMinutes: number;
  public readonly contentText: string;
  public readonly mediaFile: string | null;
  public readonly mediaUrl: string | null;

  constructor(dto: LessonContentDTO) {
    this.id = dto.id;
    this.lessonId = dto.lesson;
    this.title = dto.title || '';
    this.contentType = dto.content_type || 'TEXT';
    this.documentType = dto.document_type || 'OTHER';
    this.sortOrder = dto.sort_order ?? 1;
    this.durationMinutes = dto.duration_minutes ?? 0;
    this.contentText = dto.content_text || '';
    this.mediaFile = dto.media_file || null;
    this.mediaUrl = dto.media_url || null;
  }

  public getBadgeLabel(): string {
    switch (this.contentType) {
      case 'TEXT': return 'Text';
      case 'AUDIO': return 'Audio';
      case 'VIDEO': return 'Video';
      case 'IMAGE': return 'Image';
      case 'DOCUMENT': {
        switch (this.documentType) {
          case 'PDF': return 'PDF Document';
          case 'POWERPOINT': return 'PowerPoint';
          case 'CANVA': return 'Canva Presentation';
          case 'PRESENTATION': return 'Slides Presentation';
          default: return 'Document';
        }
      }
      default: return 'Content';
    }
  }
}

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
  is_outside_resource?: boolean;
  isOutsideResource?: boolean;
  isCompleted?: boolean;
  is_completed?: boolean;
  question_count?: number;
  content_count?: number;
  content_types?: string[];
  contents?: LessonContentDTO[];
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
  public readonly isOutsideResource: boolean;
  public readonly isCompleted: boolean;
  public readonly questionCount: number;
  public readonly contentCount: number;
  public readonly contentTypes: string[];
  public readonly contents: LessonContentItem[];

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
    this.isOutsideResource = Boolean(dto.isOutsideResource ?? dto.is_outside_resource ?? false);
    this.isCompleted = Boolean(dto.isCompleted ?? dto.is_completed);
    this.questionCount = dto.question_count ?? 0;
    this.contentCount = dto.content_count ?? (dto.contents?.length ?? 0);
    this.contentTypes = dto.content_types ?? (dto.contents ? Array.from(new Set(dto.contents.map(c => c.content_type))) : []);
    this.contents = (dto.contents || []).map((c) => new LessonContentItem(c));
  }

  public getFormattedDuration(): string {
    return `${this.durationMinutes} min`;
  }

  public getBadgeLabel(): string {
    if (this.contents && this.contents.length > 1) {
      return `${this.contents.length} Contents`;
    }
    switch (this.lessonType) {
      case 'ROAD_SIGN': return 'Road Sign';
      case 'QUIZ': return 'Practice Quiz';
      case 'VIDEO': return 'Video';
      case 'AUDIO': return 'Audio';
      case 'MULTI': return 'Multi-Content';
      default: return 'Article';
    }
  }
}



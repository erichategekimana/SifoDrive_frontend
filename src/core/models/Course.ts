/**
 * Sifo Drive — Course Domain Model
 */

export interface CourseDTO {
  id: string;
  title: string;
  slug?: string;
  description: string;
  order?: number;
  is_published?: boolean;
  isPublished?: boolean;
  estimated_hours?: number;
  estimatedHours?: number;
  thumbnail_url?: string | null;
  thumbnailUrl?: string | null;
  modules_count?: number;
  lessons_count?: number;
  progress_percentage?: number;
}

export class Course {
  public readonly id: string;
  public readonly title: string;
  public readonly slug: string;
  public readonly description: string;
  public readonly order: number;
  public readonly isPublished: boolean;
  public readonly estimatedHours: number;
  public readonly thumbnailUrl: string | null;
  public readonly modulesCount: number;
  public readonly lessonsCount: number;
  public readonly progressPercentage: number;

  constructor(dto: CourseDTO) {
    this.id = dto.id;
    this.title = dto.title;
    this.slug = dto.slug || '';
    this.description = dto.description || '';
    this.order = dto.order ?? 0;
    this.isPublished = Boolean(dto.isPublished ?? dto.is_published ?? true);
    this.estimatedHours = dto.estimatedHours ?? dto.estimated_hours ?? 12;
    this.thumbnailUrl = dto.thumbnailUrl ?? dto.thumbnail_url ?? null;
    this.modulesCount = dto.modules_count ?? 0;
    this.lessonsCount = dto.lessons_count ?? 0;
    this.progressPercentage = dto.progress_percentage ?? 0;
  }

  public isComplete(): boolean {
    return this.progressPercentage >= 100;
  }

  public getFormattedDuration(): string {
    return `${this.estimatedHours} Hours Theory`;
  }
}

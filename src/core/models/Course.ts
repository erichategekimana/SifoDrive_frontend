/**
 * Sifo Drive — Course Domain Model
 */

import { Module, type ModuleDTO } from './Module';

export interface CourseDTO {
  id: string;
  title: string;
  code?: string;
  slug?: string;
  description: string;
  curriculum?: string;
  curriculum_title?: string;
  curriculum_code?: string;
  order?: number;
  sort_order?: number;
  is_published?: boolean;
  isPublished?: boolean;
  estimated_hours?: number;
  estimatedHours?: number;
  thumbnail_url?: string | null;
  thumbnailUrl?: string | null;
  thumbnail?: string | null;
  module_count?: number;
  modules_count?: number;
  lesson_count?: number;
  lessons_count?: number;
  progress_percentage?: number;
  modules?: ModuleDTO[];
}

export class Course {
  public readonly id: string;
  public readonly title: string;
  public readonly code: string;
  public readonly slug: string;
  public readonly description: string;
  public readonly curriculumTitle: string;
  public readonly order: number;
  public readonly isPublished: boolean;
  public readonly estimatedHours: number;
  public readonly thumbnailUrl: string | null;
  public readonly modulesCount: number;
  public readonly lessonsCount: number;
  public readonly progressPercentage: number;
  public readonly modules: Module[];

  constructor(dto: CourseDTO) {
    this.id = dto.id;
    this.title = dto.title;
    this.code = dto.code || dto.curriculum_code || 'THEORY';
    this.slug = dto.slug || '';
    this.description = dto.description || '';
    this.curriculumTitle = dto.curriculum_title || 'Rwanda Highway Code';
    this.order = dto.order ?? dto.sort_order ?? 0;
    this.isPublished = Boolean(dto.isPublished ?? dto.is_published ?? true);
    this.estimatedHours = dto.estimatedHours ?? dto.estimated_hours ?? 12;
    this.thumbnailUrl = dto.thumbnailUrl ?? dto.thumbnail_url ?? dto.thumbnail ?? null;
    this.modules = (dto.modules || []).map((m) => new Module(m));
    this.modulesCount = dto.modules_count ?? dto.module_count ?? this.modules.length;
    this.lessonsCount = dto.lessons_count ?? dto.lesson_count ?? this.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
    this.progressPercentage = dto.progress_percentage ?? 0;
  }

  public isComplete(): boolean {
    return this.progressPercentage >= 100;
  }

  public getFormattedDuration(): string {
    return `${this.estimatedHours} Hours Theory`;
  }
}


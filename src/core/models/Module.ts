/**
 * Sifo Drive — Module Domain Model
 */

import { Lesson, type LessonDTO } from './Lesson';

export interface ModuleDTO {
  id: string;
  course: string;
  title: string;
  description: string;
  order?: number;
  sort_order?: number;
  is_published?: boolean;
  isPublished?: boolean;
  is_student_only?: boolean;
  isStudentOnly?: boolean;
  is_foundational?: boolean;
  isFoundational?: boolean;
  is_outside_resource?: boolean;
  isOutsideResource?: boolean;
  is_locked?: boolean;
  isLocked?: boolean;
  lessons?: LessonDTO[];
}

export class Module {
  public readonly id: string;
  public readonly courseId: string;
  public readonly title: string;
  public readonly description: string;
  public readonly order: number;
  public readonly isPublished: boolean;
  public readonly isLocked: boolean;
  public readonly isStudentOnly: boolean;
  public readonly isFoundational: boolean;
  public readonly isOutsideResource: boolean;
  public readonly lessons: Lesson[];

  constructor(dto: ModuleDTO) {
    this.id = dto.id;
    this.courseId = dto.course;
    this.title = dto.title;
    this.description = dto.description || '';
    this.order = dto.order ?? dto.sort_order ?? 0;
    this.isPublished = Boolean(dto.isPublished ?? dto.is_published ?? true);
    this.isLocked = Boolean(dto.isLocked ?? dto.is_locked ?? false);
    this.isStudentOnly = Boolean(dto.isStudentOnly ?? dto.is_student_only ?? false);
    this.isFoundational = Boolean(dto.isFoundational ?? dto.is_foundational ?? false);
    this.isOutsideResource = Boolean(dto.isOutsideResource ?? dto.is_outside_resource ?? false);
    this.lessons = (dto.lessons || []).map((l) => new Lesson(l));
  }

  public get completedLessonsCount(): number {
    return this.lessons.filter((l) => l.isCompleted).length;
  }

  public get completionPercentage(): number {
    if (this.lessons.length === 0) return 0;
    return Math.round((this.completedLessonsCount / this.lessons.length) * 100);
  }
}


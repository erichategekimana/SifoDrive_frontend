/**
 * src/features/lms/hooks/useLmsStudioData.ts
 * ============================================
 * Shared data-loading hook for the LMS Studio.
 *
 * Extracts all API calls from AdminCoursesPage into a single, reusable hook.
 * Each section component imports only what it needs — lazy loading is trivially
 * added per-section in future by replacing the relevant Promise.allSettled call.
 *
 * Design principles:
 *   - Single Responsibility: this hook is responsible for data + refetch only.
 *   - Open/Closed: new data sources are added here without touching consumers.
 *   - DRY: one `refetch` function replaces dozens of `loadAllData()` calls.
 */

import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '../../../core/services/AdminService';
import type {
  CohortItem,
  AdminUserItem,
  LiveClassAdminItem,
  CurriculumItem,
  QuizItem,
} from '../../../core/services/AdminService';
import { DEFAULT_LMS_QUIZZES } from '../data/mockQuizzes';

export interface LmsStudioData {
  curricula: CurriculumItem[];
  courses: any[];
  cohorts: CohortItem[];
  tutors: AdminUserItem[];
  students: AdminUserItem[];
  guests: AdminUserItem[];
  questions: any[];
  liveClasses: LiveClassAdminItem[];
  quizzes: QuizItem[];
  isLoading: boolean;
  isRefetching: boolean;
  refetch: () => Promise<void>;
}

export function useLmsStudioData(): LmsStudioData {
  const adminService = AdminService.getInstance();

  const [curricula, setCurricula] = useState<CurriculumItem[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<CohortItem[]>([]);
  const [tutors, setTutors] = useState<AdminUserItem[]>([]);
  const [students, setStudents] = useState<AdminUserItem[]>([]);
  const [guests, setGuests] = useState<AdminUserItem[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClassAdminItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>(DEFAULT_LMS_QUIZZES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);

  const refetch = useCallback(async () => {
    setIsRefetching(true);
    try {
      const [
        curriculaRes,
        coursesRes,
        cohortsRes,
        tutorsRes,
        studentsRes,
        guestsRes,
        questionsRes,
        classesRes,
        quizzesRes,
      ] = await Promise.allSettled([
        adminService.getCurricula(),
        adminService.getCourses(),
        adminService.getCohorts(),
        adminService.getUsers({ role: 'TUTOR' }),
        adminService.getUsers({ role: 'STUDENT' }),
        adminService.getUsers({ role: 'GUEST' }),
        adminService.getQuestions(),
        adminService.getLiveClasses(),
        adminService.getQuizzes(),
      ]);

      if (curriculaRes.status === 'fulfilled') setCurricula(curriculaRes.value);
      if (coursesRes.status === 'fulfilled') setCourses(coursesRes.value);
      if (cohortsRes.status === 'fulfilled') setCohorts(cohortsRes.value);
      if (tutorsRes.status === 'fulfilled') setTutors(tutorsRes.value.results || []);
      if (studentsRes.status === 'fulfilled') setStudents(studentsRes.value.results || []);
      if (guestsRes.status === 'fulfilled') setGuests(guestsRes.value.results || []);
      if (questionsRes.status === 'fulfilled') setQuestions(questionsRes.value);
      if (classesRes.status === 'fulfilled') setLiveClasses(classesRes.value);
      if (quizzesRes.status === 'fulfilled' && Array.isArray(quizzesRes.value)) {
        setQuizzes(quizzesRes.value);
      } else {
        setQuizzes((prev) => (prev.length > 0 ? prev : DEFAULT_LMS_QUIZZES));
      }
    } catch (err) {
      console.error('Failed to load LMS data:', err);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    curricula,
    courses,
    cohorts,
    tutors,
    students,
    guests,
    questions,
    liveClasses,
    quizzes,
    isLoading,
    isRefetching,
    refetch,
  };
}

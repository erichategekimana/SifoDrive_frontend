import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  X,
  Pencil,
  Lock,
  AlertCircle,
  Users,
  GraduationCap,
  HelpCircle,
  Video,
  Search,
  Check,
  ArrowRightLeft,
  CheckSquare,
  Square,
  Layers,
  FileText,
  Headphones,
  Compass,
  PlayCircle,
  ArrowLeft,
  ExternalLink,
  Power,
  PowerOff,
  UserPlus,
  UserCheck,
  Award,
  Calendar,
  Clock,
  FileCheck,
  ListChecks,
  Sparkles,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { AdminService } from '../../core/services/AdminService';
import type {
  CohortItem,
  AdminUserItem,
  LiveClassAdminItem,
  CurriculumItem,
  QuizItem,
  QuizQuestionItem,
  QuizPayload,
} from '../../core/services/AdminService';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';

type LMSStudioSection = 'curricula' | 'cohorts' | 'learners' | 'quizzes' | 'tutors';

export const AdminCoursesPage: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useTranslation();
  const isTrainingAdmin = user?.isTrainingAdmin();
  const isSystemAdmin = user?.isSystemAdmin();

  const [activeSection, setActiveSection] = useState<LMSStudioSection>('curricula');
  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Data states
  const [curricula, setCurricula] = useState<CurriculumItem[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<CohortItem[]>([]);
  const [tutors, setTutors] = useState<AdminUserItem[]>([]);
  const [students, setStudents] = useState<AdminUserItem[]>([]);
  const [guests, setGuests] = useState<AdminUserItem[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClassAdminItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [quizCourseFilter, setQuizCourseFilter] = useState<string>('ALL');
  const [quizStatusFilter, setQuizStatusFilter] = useState<string>('ALL');

  // Quiz Builder Modal States
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);
  const [isEditQuizMode, setIsEditQuizMode] = useState<boolean>(false);
  const [editingQuizId, setEditingQuizId] = useState<string>('');
  const [quizActiveTab, setQuizActiveTab] = useState<'settings' | 'questions' | 'rubric'>('settings');

  // Quiz Form fields
  const [quizCourseId, setQuizCourseId] = useState<string>('');
  const [quizModuleId, setQuizModuleId] = useState<string>('');
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [quizTitleRw, setQuizTitleRw] = useState<string>('');
  const [quizDescription, setQuizDescription] = useState<string>('');
  const [quizDescriptionRw, setQuizDescriptionRw] = useState<string>('');
  const [quizOpenDate, setQuizOpenDate] = useState<string>('');
  const [quizDeadline, setQuizDeadline] = useState<string>('');
  const [quizTimeLimit, setQuizTimeLimit] = useState<number>(30);
  const [quizTotalScore, setQuizTotalScore] = useState<number>(100);
  const [quizPassingScore, setQuizPassingScore] = useState<number>(70);
  const [quizMaxAttempts, setQuizMaxAttempts] = useState<number>(1);
  const [quizShuffle, setQuizShuffle] = useState<boolean>(false);
  const [quizRubric, setQuizRubric] = useState<string>('');
  const [quizRubricRw, setQuizRubricRw] = useState<string>('');
  const [quizItems, setQuizItems] = useState<QuizQuestionItem[]>([]);
  const calculatedTotalScore = useMemo(() => {
    return quizItems.reduce((acc, q) => acc + (Math.max(1, Number(q.points) || 1)), 0);
  }, [quizItems]);
  const [quizAvailableModules, setQuizAvailableModules] = useState<any[]>([]);

  // Bank Picker Modal States (within Quiz Builder)
  const [isBankPickerModalOpen, setIsBankPickerModalOpen] = useState<boolean>(false);
  const [bankPickerSearch, setBankPickerSearch] = useState<string>('');
  const [bankPickerDomain, setBankPickerDomain] = useState<string>('ALL');
  const [selectedBankQuestionIds, setSelectedBankQuestionIds] = useState<string[]>([]);
  const [isLoadingBankQuestions, setIsLoadingBankQuestions] = useState<boolean>(false);

  // Scratch Question Form State (within Quiz Builder)
  const [isAddingScratchQuestion, setIsAddingScratchQuestion] = useState<boolean>(false);
  const [scratchQuestionText, setScratchQuestionText] = useState<string>('');
  const [scratchQuestionTextRw, setScratchQuestionTextRw] = useState<string>('');
  const [scratchOptionA, setScratchOptionA] = useState<string>('');
  const [scratchOptionB, setScratchOptionB] = useState<string>('');
  const [scratchOptionC, setScratchOptionC] = useState<string>('');
  const [scratchOptionD, setScratchOptionD] = useState<string>('');
  const [scratchOptionARw, setScratchOptionARw] = useState<string>('');
  const [scratchOptionBRw, setScratchOptionBRw] = useState<string>('');
  const [scratchOptionCRw, setScratchOptionCRw] = useState<string>('');
  const [scratchOptionDRw, setScratchOptionDRw] = useState<string>('');
  const [scratchCorrectOption, setScratchCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [scratchPoints, setScratchPoints] = useState<number>(1);
  const [scratchExplanation, setScratchExplanation] = useState<string>('');
  const [scratchExplanationRw, setScratchExplanationRw] = useState<string>('');
  const [scratchDomain, setScratchDomain] = useState<string>('PRIORITY');
  const [scratchDifficulty, setScratchDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');

  // Inspection Modal (Oversight View)
  const [inspectingQuiz, setInspectingQuiz] = useState<QuizItem | null>(null);
  const [isSavingQuiz, setIsSavingQuiz] = useState<boolean>(false);

  // Search & Filters
  const [curriculumSearch, setCurriculumSearch] = useState<string>('');
  const [courseSearch, setCourseSearch] = useState<string>('');
  const [cohortSearch, setCohortSearch] = useState<string>('');
  const [learnerSearch, setLearnerSearch] = useState<string>('');
  const [learnerRoleFilter, setLearnerRoleFilter] = useState<'ALL' | 'STUDENT' | 'GUEST'>('ALL');
  const [learnerCohortFilter, setLearnerCohortFilter] = useState<string>('ALL');
  const [learnerTutorFilter, setLearnerTutorFilter] = useState<string>('ALL');
  const [learnerStatusFilter, setLearnerStatusFilter] = useState<string>('ALL');
  const [quizSearch, setQuizSearch] = useState<string>('');

  // Curriculum Modals
  const [isCreateCurriculumModalOpen, setIsCreateCurriculumModalOpen] = useState<boolean>(false);
  const [isEditCurriculumModalOpen, setIsEditCurriculumModalOpen] = useState<boolean>(false);
  const [editingCurriculumId, setEditingCurriculumId] = useState<string>('');
  const [currCode, setCurrCode] = useState<string>('');
  const [currTitle, setCurrTitle] = useState<string>('');
  const [currTitleRw, setCurrTitleRw] = useState<string>('');
  const [currDescription, setCurrDescription] = useState<string>('');
  const [currDescriptionRw, setCurrDescriptionRw] = useState<string>('');

  // Course Modals
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState<boolean>(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState<boolean>(false);
  const [editingCourseId, setEditingCourseId] = useState<string>('');
  const [courseCurriculumId, setCourseCurriculumId] = useState<string>('');
  const [courseCode, setCourseCode] = useState<string>('');
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [courseTitleRw, setCourseTitleRw] = useState<string>('');
  const [courseDescription, setCourseDescription] = useState<string>('');
  const [courseHours, setCourseHours] = useState<number>(10);
  const [courseSortOrder, setCourseSortOrder] = useState<number>(1);

  // Cohort Modal
  const [isCreateCohortModalOpen, setIsCreateCohortModalOpen] = useState<boolean>(false);
  const [newCohortName, setNewCohortName] = useState<string>('');
  const [newCohortCode, setNewCohortCode] = useState<string>('');
  const [newCohortStart, setNewCohortStart] = useState<string>('');
  const [newCohortEnd, setNewCohortEnd] = useState<string>('');
  const [newCohortCapacity, setNewCohortCapacity] = useState<number>(50);
  const [newCohortSchedule, setNewCohortSchedule] = useState<string>('');

  // Assign Tutors to Cohort Modal
  const [isAssignTutorModalOpen, setIsAssignTutorModalOpen] = useState<boolean>(false);
  const [selectedCohortForTutors, setSelectedCohortForTutors] = useState<CohortItem | null>(null);
  const [selectedTutorIdsForCohort, setSelectedTutorIdsForCohort] = useState<string[]>([]);
  const [tutorModalSearch, setTutorModalSearch] = useState<string>('');

  // Assign / Change Student Cohort Modal
  const [isChangeCohortModalOpen, setIsChangeCohortModalOpen] = useState<boolean>(false);
  const [selectedLearner, setSelectedLearner] = useState<AdminUserItem | null>(null);
  const [targetCohortId, setTargetCohortId] = useState<string>('');

  // Assign Tutor to Student Modal
  const [isStudentTutorModalOpen, setIsStudentTutorModalOpen] = useState<boolean>(false);
  const [targetStudentTutorId, setTargetStudentTutorId] = useState<string>('');

  // Enroll / Add Student Modal
  const [isEnrollStudentModalOpen, setIsEnrollStudentModalOpen] = useState<boolean>(false);
  const [newStudentFirstName, setNewStudentFirstName] = useState<string>('');
  const [newStudentLastName, setNewStudentLastName] = useState<string>('');
  const [newStudentPhone, setNewStudentPhone] = useState<string>('+250');
  const [newStudentEmail, setNewStudentEmail] = useState<string>('');
  const [newStudentPassword, setNewStudentPassword] = useState<string>('Student@123');
  const [newStudentRole, setNewStudentRole] = useState<'STUDENT' | 'GUEST'>('STUDENT');
  const [newStudentCohortId, setNewStudentCohortId] = useState<string>('');
  const [newStudentTutorId, setNewStudentTutorId] = useState<string>('');

  // View Student Details Modal
  const [isStudentDetailsModalOpen, setIsStudentDetailsModalOpen] = useState<boolean>(false);
  const [studentDetailsUser, setStudentDetailsUser] = useState<AdminUserItem | null>(null);

  // Live Class Modal
  const [isScheduleClassModalOpen, setIsScheduleClassModalOpen] = useState<boolean>(false);
  const [classTitle, setClassTitle] = useState<string>('');
  const [classCohortId, setClassCohortId] = useState<string>('');
  const [classTutorId, setClassTutorId] = useState<string>('');
  const [classScheduledAt, setClassScheduledAt] = useState<string>('');
  const [classDuration, setClassDuration] = useState<number>(60);
  const [classMeetingLink, setClassMeetingLink] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // ── Curriculum: Course Modules & Lessons Builder State ────────────────────
  const [selectedCourseForCurriculum, setSelectedCourseForCurriculum] = useState<any | null>(null);
  const [courseModules, setCourseModules] = useState<any[]>([]);
  const [isModulesLoading, setIsModulesLoading] = useState<boolean>(false);
  const [selectedModule, setSelectedModule] = useState<any | null>(null);
  const [moduleLessons, setModuleLessons] = useState<any[]>([]);
  const [isLessonsLoading, setIsLessonsLoading] = useState<boolean>(false);
  const [roadSignsList, setRoadSignsList] = useState<any[]>([]);

  // Module Modal State
  const [isModuleModalOpen, setIsModuleModalOpen] = useState<boolean>(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [modTitle, setModTitle] = useState<string>('');
  const [modDescription, setModDescription] = useState<string>('');
  const [modSortOrder, setModSortOrder] = useState<number>(1);
  const [modIsFoundational, setModIsFoundational] = useState<boolean>(false);

  // Lesson Modal State
  const [isLessonModalOpen, setIsLessonModalOpen] = useState<boolean>(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lesTitle, setLesTitle] = useState<string>('');
  const [lesType, setLesType] = useState<'TEXT' | 'AUDIO' | 'VIDEO' | 'ROAD_SIGN' | 'QUIZ'>('TEXT');
  const [lesContentText, setLesContentText] = useState<string>('');
  const [lesMediaUrl, setLesMediaUrl] = useState<string>('');
  const [lesMediaFile, setLesMediaFile] = useState<File | null>(null);
  const [lesRoadSignId, setLesRoadSignId] = useState<string>('');
  const [lesDurationMinutes, setLesDurationMinutes] = useState<number>(15);
  const [lesIsFreePreview, setLesIsFreePreview] = useState<boolean>(false);
  const [lesIsStudentOnly, setLesIsStudentOnly] = useState<boolean>(false);
  const [lesSortOrder, setLesSortOrder] = useState<number>(1);

  const adminService = AdminService.getInstance();
  const { success, warning, error: toastError } = useToast();

  const loadAllData = async () => {
    setIsLoading(true);
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
      if (quizzesRes.status === 'fulfilled') setQuizzes(quizzesRes.value);
    } catch (err) {
      console.error('Failed to load LMS data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // -------------------------------------------------------------------------
  // 0. Curriculum Handlers
  // -------------------------------------------------------------------------
  const handleOpenCreateCurriculum = () => {
    setCurrCode('');
    setCurrTitle('');
    setCurrTitleRw('');
    setCurrDescription('');
    setCurrDescriptionRw('');
    setIsCreateCurriculumModalOpen(true);
  };

  const handleCreateCurriculum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currTitle.trim()) {
      warning('Curriculum Title is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminService.createCurriculum({
        code: currCode.trim().toUpperCase() || undefined,
        title: currTitle.trim(),
        title_kinyarwanda: currTitleRw.trim() || undefined,
        description: currDescription.trim() || undefined,
        description_kinyarwanda: currDescriptionRw.trim() || undefined,
      });
      success(`Curriculum "${currTitle}" created.`);
      setIsCreateCurriculumModalOpen(false);
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to create curriculum.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditCurriculum = (curr: CurriculumItem) => {
    setEditingCurriculumId(curr.id);
    setCurrCode(curr.code || '');
    setCurrTitle(curr.title || '');
    setCurrTitleRw(curr.title_kinyarwanda || '');
    setCurrDescription(curr.description || '');
    setCurrDescriptionRw(curr.description_kinyarwanda || '');
    setIsEditCurriculumModalOpen(true);
  };

  const handleUpdateCurriculum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currTitle.trim()) {
      warning('Curriculum Title is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminService.updateCurriculum(editingCurriculumId, {
        code: currCode.trim().toUpperCase() || undefined,
        title: currTitle.trim(),
        title_kinyarwanda: currTitleRw.trim() || undefined,
        description: currDescription.trim() || undefined,
        description_kinyarwanda: currDescriptionRw.trim() || undefined,
      });
      success(`Curriculum "${currTitle}" updated.`);
      setIsEditCurriculumModalOpen(false);
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update curriculum.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCurriculum = async (currId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete curriculum "${title}"?`)) return;
    try {
      await adminService.deleteCurriculum(currId);
      success(`Curriculum "${title}" deleted.`);
      if (selectedCurriculum?.id === currId) {
        setSelectedCurriculum(null);
      }
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to delete curriculum.');
    }
  };

  const handleTogglePublishCurriculum = async (curr: CurriculumItem) => {
    try {
      if (curr.is_published) {
        await adminService.unpublishCurriculum(curr.id);
        warning(`Curriculum "${curr.title}" unpublished and moved to draft.`);
      } else {
        await adminService.publishCurriculum(curr.id);
        success(`Curriculum "${curr.title}" published.`);
      }
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update curriculum status.');
    }
  };

  // -------------------------------------------------------------------------
  // 1. Course Handlers
  // -------------------------------------------------------------------------
  const handleTogglePublish = async (course: any) => {
    const modCount = course.module_count ?? course.modules_count ?? 0;
    if (!course.is_published && modCount === 0) {
      warning('Cannot publish an empty course. Training admin must add course modules before publishing.');
      return;
    }

    try {
      if (course.is_published) {
        await adminService.unpublishCourse(course.id);
        warning(`Course "${course.title}" unpublished and moved to draft.`);
      } else {
        await adminService.publishCourse(course.id);
        success(`Course "${course.title}" is published and live for learners.`);
      }
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Could not update course publication status.');
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete course "${title}"?`)) return;
    try {
      await adminService.deleteCourse(courseId);
      success(`Course "${title}" has been deleted.`);
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Could not delete course.');
    }
  };

  const handleOpenCreateCourse = (targetCurriculumId?: string) => {
    setCourseTitle('');
    setCourseTitleRw('');
    setCourseCode('');
    setCourseDescription('');
    setCourseHours(10);
    setCourseSortOrder(courses.length + 1);
    setCourseCurriculumId(targetCurriculumId || selectedCurriculum?.id || (curricula[0]?.id || ''));
    setIsCreateCourseModalOpen(true);
  };

  const handleOpenEditCourse = (c: any) => {
    setEditingCourseId(c.id);
    setCourseTitle(c.title || '');
    setCourseTitleRw(c.title_rw || c.title_kinyarwanda || '');
    setCourseCode(c.code || (c.id ? c.id.slice(0, 8).toUpperCase() : ''));
    setCourseDescription(c.description || '');
    setCourseHours(c.estimated_hours || 10);
    setCourseSortOrder(c.sort_order || 1);
    setCourseCurriculumId(c.curriculum || '');
    setIsEditCourseModalOpen(true);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) {
      warning('Course Title is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminService.createCourse({
        curriculum: courseCurriculumId || undefined,
        title: courseTitle.trim(),
        title_rw: courseTitleRw.trim() || undefined,
        code: courseCode.trim().toUpperCase() || undefined,
        description: courseDescription.trim() || undefined,
        estimated_hours: Number(courseHours) || 10,
        sort_order: Number(courseSortOrder) || 1,
        is_published: false,
      });
      success(`Created draft course "${courseTitle}".`);
      setIsCreateCourseModalOpen(false);
      setCourseTitle('');
      setCourseTitleRw('');
      setCourseCode('');
      setCourseDescription('');
      setCourseHours(10);
      setCourseSortOrder(1);
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to create course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) {
      warning('Course Title is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminService.updateCourse(editingCourseId, {
        curriculum: courseCurriculumId || undefined,
        title: courseTitle.trim(),
        title_rw: courseTitleRw.trim() || undefined,
        code: courseCode.trim().toUpperCase() || undefined,
        description: courseDescription.trim() || undefined,
        estimated_hours: Number(courseHours) || 10,
        sort_order: Number(courseSortOrder) || 1,
      });
      success(`Updated course "${courseTitle}".`);
      setIsEditCourseModalOpen(false);
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // 2. Cohort Handlers
  // -------------------------------------------------------------------------
  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCohortName.trim() || !newCohortStart || !newCohortEnd) {
      warning('Cohort name, start date, and end date are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminService.createCohort({
        name: newCohortName.trim(),
        code: newCohortCode.trim().toUpperCase() || undefined,
        start_date: newCohortStart,
        end_date: newCohortEnd,
        max_capacity: Number(newCohortCapacity) || 50,
        schedule_description: newCohortSchedule.trim() || undefined,
      });
      success(`Created cohort "${newCohortName}".`);
      setIsCreateCohortModalOpen(false);
      setNewCohortName('');
      setNewCohortCode('');
      setNewCohortStart('');
      setNewCohortEnd('');
      setNewCohortSchedule('');
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to create cohort.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // 2. Cohort & Tutor Assignment Handlers
  // -------------------------------------------------------------------------
  const handleOpenAssignTutorsModal = (cohort: CohortItem) => {
    setSelectedCohortForTutors(cohort);
    const assignedIds = (cohort.assigned_tutors || []).map((t) => t.id);
    setSelectedTutorIdsForCohort(assignedIds);
    setTutorModalSearch('');
    setIsAssignTutorModalOpen(true);
  };

  const handleToggleTutorSelection = (tutorId: string) => {
    setSelectedTutorIdsForCohort((prev) =>
      prev.includes(tutorId) ? prev.filter((id) => id !== tutorId) : [...prev, tutorId]
    );
  };

  const handleSelectAllFilteredTutors = (filteredIds: string[]) => {
    setSelectedTutorIdsForCohort((prev) => Array.from(new Set([...prev, ...filteredIds])));
  };

  const handleDeselectAllFilteredTutors = (filteredIds: string[]) => {
    setSelectedTutorIdsForCohort((prev) => prev.filter((id) => !filteredIds.includes(id)));
  };

  const handleSaveCohortTutors = async () => {
    if (!selectedCohortForTutors) return;
    setIsSubmitting(true);
    try {
      const originalIds = (selectedCohortForTutors.assigned_tutors || []).map((t) => t.id);
      const toAssign = selectedTutorIdsForCohort.filter((id) => !originalIds.includes(id));
      const toUnassign = originalIds.filter((id) => !selectedTutorIdsForCohort.includes(id));

      if (toAssign.length > 0) {
        await adminService.assignTutorsToCohort(selectedCohortForTutors.id, toAssign, 'assign');
      }
      if (toUnassign.length > 0) {
        await adminService.assignTutorsToCohort(selectedCohortForTutors.id, toUnassign, 'unassign');
      }

      success(`Tutor assignments updated for cohort "${selectedCohortForTutors.name}".`);
      setIsAssignTutorModalOpen(false);
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to save tutor assignments.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCohortActive = async (cohort: CohortItem) => {
    if (cohort.is_active) {
      const ongoing = cohort.ongoing_student_count ?? 0;
      if (ongoing > 0) {
        warning(
          `Cannot deactivate cohort "${cohort.name}". There are ${ongoing} active student(s) currently enrolled who have not completed or withdrawn from the course.`
        );
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to deactivate cohort "${cohort.name}"? All students have completed or withdrawn.`
      );
      if (!confirmed) return;

      setIsSubmitting(true);
      try {
        await adminService.updateCohort(cohort.id, { is_active: false });
        success(`Cohort "${cohort.name}" has been deactivated.`);
        loadAllData();
      } catch (err: any) {
        const msg =
          err?.response?.data?.is_active ||
          err?.response?.data?.detail ||
          err?.message ||
          'Failed to deactivate cohort.';
        toastError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        await adminService.updateCohort(cohort.id, { is_active: true });
        success(`Cohort "${cohort.name}" is now active.`);
        loadAllData();
      } catch (err: any) {
        toastError(err?.message || 'Failed to activate cohort.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // -------------------------------------------------------------------------
  // 3. Student / Guest Handlers
  // -------------------------------------------------------------------------
  const handleOpenChangeCohort = (learner: AdminUserItem) => {
    setSelectedLearner(learner);
    setTargetCohortId(learner.cohort_id || '');
    setIsChangeCohortModalOpen(true);
  };

  const handleSaveStudentCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLearner) return;
    setIsSubmitting(true);
    try {
      if (targetCohortId) {
        if (selectedLearner.cohort_id && selectedLearner.cohort_id !== targetCohortId) {
          await adminService.assignStudentsToCohort(selectedLearner.cohort_id, [selectedLearner.id], 'unenroll');
        }
        await adminService.assignStudentsToCohort(targetCohortId, [selectedLearner.id], 'enroll');
        success(`Assigned ${selectedLearner.full_name || selectedLearner.phone_number} to cohort.`);
      } else if (selectedLearner.cohort_id) {
        await adminService.assignStudentsToCohort(selectedLearner.cohort_id, [selectedLearner.id], 'unenroll');
        success(`Removed ${selectedLearner.full_name || selectedLearner.phone_number} from cohort.`);
      }
      setIsChangeCohortModalOpen(false);
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update cohort assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenStudentTutorModal = (learner: AdminUserItem) => {
    setSelectedLearner(learner);
    setTargetStudentTutorId(learner.assigned_tutor_id || '');
    setIsStudentTutorModalOpen(true);
  };

  const handleSaveStudentTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLearner) return;
    setIsSubmitting(true);
    try {
      await adminService.assignTutorToStudent(selectedLearner.id, targetStudentTutorId || null);
      success(`Updated tutor for ${selectedLearner.full_name || selectedLearner.phone_number}.`);
      setIsStudentTutorModalOpen(false);
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update tutor assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEnrollStudentModal = () => {
    setNewStudentFirstName('');
    setNewStudentLastName('');
    setNewStudentPhone('+250');
    setNewStudentEmail('');
    setNewStudentPassword('Student@123');
    setNewStudentRole('STUDENT');
    setNewStudentCohortId('');
    setNewStudentTutorId('');
    setIsEnrollStudentModalOpen(true);
  };

  const handleEnrollStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentFirstName.trim() || !newStudentLastName.trim() || !newStudentPhone.trim() || !newStudentPassword) {
      warning('Please fill in first name, last name, phone, and password.');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await adminService.createUser({
        first_name: newStudentFirstName.trim(),
        last_name: newStudentLastName.trim(),
        phone_number: newStudentPhone.trim(),
        email: newStudentEmail.trim() || undefined,
        password: newStudentPassword,
        role: newStudentRole,
      });

      if (newStudentCohortId && created.id) {
        try {
          await adminService.assignStudentsToCohort(newStudentCohortId, [created.id], 'enroll');
        } catch (cErr) {
          console.warn('Initial cohort assignment error:', cErr);
        }
      }

      if (newStudentTutorId && created.id) {
        try {
          await adminService.assignTutorToStudent(created.id, newStudentTutorId);
        } catch (tErr) {
          console.warn('Initial tutor assignment error:', tErr);
        }
      }

      success(`Successfully enrolled ${created.full_name || created.first_name} (${created.role}).`);
      setIsEnrollStudentModalOpen(false);
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to enroll student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStudentStatus = async (learner: AdminUserItem) => {
    const nextStatus = learner.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setIsSubmitting(true);
    try {
      await adminService.updateUserStatus(learner.id, nextStatus, 'Updated via LMS Studio');
      success(`Updated status for ${learner.full_name || learner.phone_number} to ${nextStatus}.`);
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update account status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromoteGuestToStudent = async (learner: AdminUserItem) => {
    setIsSubmitting(true);
    try {
      await adminService.updateUserRole(learner.id, 'STUDENT');
      success(`Promoted ${learner.full_name || learner.phone_number} to Student.`);
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to promote to student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenStudentDetails = (learner: AdminUserItem) => {
    setStudentDetailsUser(learner);
    setIsStudentDetailsModalOpen(true);
  };

  // -------------------------------------------------------------------------
  // 4. Live Class Handlers
  // -------------------------------------------------------------------------
  const handleScheduleClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classTitle.trim() || !classScheduledAt) {
      warning('Title and scheduled time are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminService.createLiveClass({
        title: classTitle.trim(),
        cohort_id: classCohortId || undefined,
        tutor_id: classTutorId || undefined,
        scheduled_at: classScheduledAt,
        duration_minutes: Number(classDuration) || 60,
        meeting_link: classMeetingLink.trim() || undefined,
      });
      success(`Scheduled live class "${classTitle}".`);
      setIsScheduleClassModalOpen(false);
      setClassTitle('');
      setClassCohortId('');
      setClassTutorId('');
      setClassScheduledAt('');
      setClassMeetingLink('');
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to schedule class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // 5. Curriculum Builder Handlers
  // -------------------------------------------------------------------------
  const handleOpenCurriculumBuilder = async (course: any) => {
    setSelectedCourseForCurriculum(course);
    if (!selectedCurriculum && course.curriculum) {
      const parentCurr = curricula.find((c) => String(c.id) === String(course.curriculum));
      if (parentCurr) setSelectedCurriculum(parentCurr);
    }
    setIsModulesLoading(true);
    setSelectedModule(null);
    setModuleLessons([]);
    try {
      const [mods, signs] = await Promise.all([
        adminService.getCourseModules(course.id),
        roadSignsList.length === 0 ? adminService.getRoadSigns().catch(() => []) : Promise.resolve(roadSignsList),
      ]);
      const sorted = (mods || []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setCourseModules(sorted);
      if (roadSignsList.length === 0 && Array.isArray(signs)) {
        setRoadSignsList(signs);
      }
      if (sorted.length > 0) {
        handleSelectModule(sorted[0]);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to load course modules.');
    } finally {
      setIsModulesLoading(false);
    }
  };

  const handleSelectModule = async (mod: any) => {
    setSelectedModule(mod);
    setIsLessonsLoading(true);
    try {
      const lessons = await adminService.getModuleLessons(mod.id);
      const sorted = (lessons || []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setModuleLessons(sorted);
    } catch (err: any) {
      toastError(err?.message || 'Failed to load module lessons.');
    } finally {
      setIsLessonsLoading(false);
    }
  };

  const handleOpenCreateModule = () => {
    setEditingModuleId(null);
    setModTitle('');
    setModDescription('');
    setModSortOrder(courseModules.length + 1);
    setModIsFoundational(false);
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod: any) => {
    setEditingModuleId(mod.id);
    setModTitle(mod.title || '');
    setModDescription(mod.description || '');
    setModSortOrder(mod.sort_order ?? 1);
    setModIsFoundational(!!mod.is_foundational);
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modTitle.trim()) {
      warning('Module title is required.');
      return;
    }
    if (!selectedCourseForCurriculum) return;
    setIsSubmitting(true);
    try {
      if (editingModuleId) {
        await adminService.updateModule(editingModuleId, {
          title: modTitle.trim(),
          description: modDescription.trim() || undefined,
          sort_order: Number(modSortOrder) || 1,
          is_foundational: modIsFoundational,
        });
        success('Updated module successfully.');
      } else {
        await adminService.createModule({
          course: selectedCourseForCurriculum.id,
          title: modTitle.trim(),
          description: modDescription.trim() || undefined,
          sort_order: Number(modSortOrder) || (courseModules.length + 1),
          is_foundational: modIsFoundational,
        });
        success('Created new module.');
      }
      setIsModuleModalOpen(false);
      const mods = await adminService.getCourseModules(selectedCourseForCurriculum.id);
      const sorted = (mods || []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setCourseModules(sorted);
      if (editingModuleId && selectedModule?.id === editingModuleId) {
        const updated = sorted.find((m: any) => m.id === editingModuleId);
        if (updated) setSelectedModule(updated);
      } else if (!selectedModule && sorted.length > 0) {
        handleSelectModule(sorted[0]);
      }
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to save module.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublishModule = async (mod: any) => {
    if (!selectedCourseForCurriculum) return;
    try {
      if (mod.is_published) {
        await adminService.unpublishModule(mod.id);
        success(`Unpublished module "${mod.title}".`);
      } else {
        await adminService.publishModule(mod.id);
        success(`Published module "${mod.title}".`);
      }
      const mods = await adminService.getCourseModules(selectedCourseForCurriculum.id);
      const sorted = (mods || []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setCourseModules(sorted);
      if (selectedModule?.id === mod.id) {
        const updated = sorted.find((m: any) => m.id === mod.id);
        if (updated) setSelectedModule(updated);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to toggle module publish status.');
    }
  };

  const handleDeleteModule = async (moduleId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete module "${title}" and all its lessons?`)) return;
    if (!selectedCourseForCurriculum) return;
    try {
      await adminService.deleteModule(moduleId);
      success(`Deleted module "${title}".`);
      const mods = await adminService.getCourseModules(selectedCourseForCurriculum.id);
      const sorted = (mods || []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setCourseModules(sorted);
      if (selectedModule?.id === moduleId) {
        if (sorted.length > 0) {
          handleSelectModule(sorted[0]);
        } else {
          setSelectedModule(null);
          setModuleLessons([]);
        }
      }
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to delete module.');
    }
  };

  const handleOpenCreateLesson = () => {
    if (!selectedModule) {
      warning('Please select a module first.');
      return;
    }
    setEditingLessonId(null);
    setLesTitle('');
    setLesType('TEXT');
    setLesContentText('');
    setLesMediaUrl('');
    setLesMediaFile(null);
    setLesRoadSignId('');
    setLesDurationMinutes(15);
    setLesIsFreePreview(false);
    setLesIsStudentOnly(false);
    setLesSortOrder(moduleLessons.length + 1);
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (les: any) => {
    setEditingLessonId(les.id);
    setLesTitle(les.title || '');
    setLesType(les.lesson_type || 'TEXT');
    setLesContentText(les.content_text || '');
    setLesMediaUrl(les.media_url || '');
    setLesMediaFile(null);
    setLesRoadSignId(les.road_sign || '');
    setLesDurationMinutes(les.duration_minutes || 15);
    setLesIsFreePreview(!!les.is_free_preview);
    setLesIsStudentOnly(!!les.is_student_only);
    setLesSortOrder(les.sort_order ?? 1);
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesTitle.trim()) {
      warning('Lesson title is required.');
      return;
    }
    if (!selectedModule) return;

    if (lesType === 'TEXT' && !lesContentText.trim()) {
      warning('Please enter article / guide content for TEXT lessons.');
      return;
    }
    if (lesType === 'AUDIO' && !lesMediaFile && !lesMediaUrl.trim()) {
      warning('Please upload an audio file or provide a streaming audio URL.');
      return;
    }
    if (lesType === 'VIDEO' && !lesMediaFile && !lesMediaUrl.trim()) {
      warning('Please upload a video file or provide a video streaming / YouTube link.');
      return;
    }

    setIsSubmitting(true);
    try {
      let payload: FormData | Record<string, any>;
      if (lesMediaFile) {
        const fd = new FormData();
        fd.append('module', selectedModule.id);
        fd.append('title', lesTitle.trim());
        fd.append('lesson_type', lesType);
        fd.append('sort_order', String(lesSortOrder));
        fd.append('duration_minutes', String(lesDurationMinutes));
        fd.append('is_free_preview', String(lesIsFreePreview));
        fd.append('is_student_only', String(lesIsStudentOnly));
        if (lesContentText.trim()) fd.append('content_text', lesContentText.trim());
        if (lesMediaUrl.trim()) fd.append('media_url', lesMediaUrl.trim());
        fd.append('media_file', lesMediaFile);
        if (lesRoadSignId) fd.append('road_sign', lesRoadSignId);
        payload = fd;
      } else {
        payload = {
          module: selectedModule.id,
          title: lesTitle.trim(),
          lesson_type: lesType,
          sort_order: Number(lesSortOrder) || 1,
          duration_minutes: Number(lesDurationMinutes) || 15,
          is_free_preview: Boolean(lesIsFreePreview),
          is_student_only: Boolean(lesIsStudentOnly),
          content_text: lesContentText.trim() || undefined,
          media_url: lesMediaUrl.trim() || undefined,
          road_sign: lesRoadSignId || undefined,
        };
      }

      if (editingLessonId) {
        await adminService.updateLesson(editingLessonId, payload);
        success('Updated lesson successfully.');
      } else {
        await adminService.createLesson(payload);
        success('Created lesson successfully.');
      }
      setIsLessonModalOpen(false);
      const lessons = await adminService.getModuleLessons(selectedModule.id);
      const sorted = (lessons || []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setModuleLessons(sorted);
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to save lesson.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete lesson "${title}"?`)) return;
    if (!selectedModule) return;
    try {
      await adminService.deleteLesson(lessonId);
      success(`Deleted lesson "${title}".`);
      const lessons = await adminService.getModuleLessons(selectedModule.id);
      const sorted = (lessons || []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setModuleLessons(sorted);
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to delete lesson.');
    }
  };

  // Filtered lists
  const filteredCurricula = useMemo(() => {
    return curricula.filter((curr) => {
      if (!curriculumSearch) return true;
      const q = curriculumSearch.toLowerCase();
      return (
        curr.title?.toLowerCase().includes(q) ||
        curr.title_kinyarwanda?.toLowerCase().includes(q) ||
        curr.code?.toLowerCase().includes(q) ||
        curr.description?.toLowerCase().includes(q)
      );
    });
  }, [curricula, curriculumSearch]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (selectedCurriculum && String(c.curriculum) !== String(selectedCurriculum.id)) {
        return false;
      }
      if (!courseSearch) return true;
      const q = courseSearch.toLowerCase();
      return (
        c.title?.toLowerCase().includes(q) ||
        c.title_rw?.toLowerCase().includes(q) ||
        c.title_kinyarwanda?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    });
  }, [courses, courseSearch, selectedCurriculum]);

  const filteredCohorts = useMemo(() => {
    return cohorts.filter((c) => {
      if (!cohortSearch) return true;
      const q = cohortSearch.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    });
  }, [cohorts, cohortSearch]);

  const filteredModalTutors = useMemo(() => {
    if (!tutorModalSearch.trim()) return tutors;
    const q = tutorModalSearch.toLowerCase();
    return tutors.filter(
      (t) =>
        t.full_name?.toLowerCase().includes(q) ||
        t.phone_number?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q)
    );
  }, [tutors, tutorModalSearch]);

  const allLearners = useMemo(() => {
    const combined: AdminUserItem[] = [];
    if (learnerRoleFilter === 'ALL' || learnerRoleFilter === 'STUDENT') {
      combined.push(...students);
    }
    if (learnerRoleFilter === 'ALL' || learnerRoleFilter === 'GUEST') {
      combined.push(...guests);
    }
    return combined.filter((u) => {
      if (learnerStatusFilter !== 'ALL' && u.status !== learnerStatusFilter) return false;
      if (learnerCohortFilter !== 'ALL' && u.cohort_id !== learnerCohortFilter) return false;
      if (learnerTutorFilter !== 'ALL' && u.assigned_tutor_id !== learnerTutorFilter) return false;
      if (!learnerSearch) return true;
      const q = learnerSearch.toLowerCase();
      return (
        u.phone_number?.toLowerCase().includes(q) ||
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.student_id?.toLowerCase().includes(q)
      );
    });
  }, [students, guests, learnerRoleFilter, learnerStatusFilter, learnerCohortFilter, learnerTutorFilter, learnerSearch]);

  const fetchBankQuestions = async () => {
    setIsLoadingBankQuestions(true);
    try {
      const qList = await adminService.getQuestions();
      setQuestions(qList);
    } catch (e: any) {
      console.error('Failed to load question bank:', e);
    } finally {
      setIsLoadingBankQuestions(false);
    }
  };



  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      if (quizCourseFilter !== 'ALL' && quiz.course !== quizCourseFilter) return false;
      if (quizStatusFilter !== 'ALL' && quiz.status !== quizStatusFilter) return false;
      if (!quizSearch) return true;
      const search = quizSearch.toLowerCase();
      return (
        quiz.title?.toLowerCase().includes(search) ||
        quiz.title_kinyarwanda?.toLowerCase().includes(search) ||
        quiz.course_title?.toLowerCase().includes(search) ||
        quiz.module_title?.toLowerCase().includes(search) ||
        quiz.description?.toLowerCase().includes(search)
      );
    });
  }, [quizzes, quizCourseFilter, quizStatusFilter, quizSearch]);

  const filteredBankPickerQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (bankPickerDomain !== 'ALL' && q.domain !== bankPickerDomain) return false;
      if (!bankPickerSearch) return true;
      const search = bankPickerSearch.toLowerCase();
      return (
        q.question_text?.toLowerCase().includes(search) ||
        q.question_text_rw?.toLowerCase().includes(search) ||
        q.question_text_kinyarwanda?.toLowerCase().includes(search) ||
        String(q.question_number || '').includes(search)
      );
    });
  }, [questions, bankPickerDomain, bankPickerSearch]);

  const handleOpenCreateQuiz = () => {
    setIsEditQuizMode(false);
    setEditingQuizId('');
    setQuizActiveTab('settings');
    const defaultCourseId = courses[0]?.id || '';
    setQuizCourseId(defaultCourseId);
    setQuizModuleId('');
    setQuizTitle('');
    setQuizTitleRw('');
    setQuizDescription('');
    setQuizDescriptionRw('');
    setQuizOpenDate('');
    setQuizDeadline('');
    setQuizTimeLimit(30);
    setQuizTotalScore(100);
    setQuizPassingScore(70);
    setQuizMaxAttempts(1);
    setQuizShuffle(false);
    setQuizRubric('Each question carries equal weight unless specified. Answer all questions within the allocated time limit. Passing threshold is 70%.');
    setQuizRubricRw('Buri kibazo gifite agaciro kangana. Subiza ibibazo byose mu gihe cyagenwe. Amanota yo gutsinda ni 70%.');
    setQuizItems([]);
    if (defaultCourseId) {
      adminService.getCourseModules(defaultCourseId).then(setQuizAvailableModules).catch(() => setQuizAvailableModules([]));
    }
    if (questions.length === 0) {
      fetchBankQuestions();
    }
    setIsQuizModalOpen(true);
  };

  const handleOpenEditQuiz = async (quiz: QuizItem) => {
    try {
      setIsLoading(true);
      const detail = await adminService.getQuizDetail(quiz.id);
      setIsEditQuizMode(true);
      setEditingQuizId(detail.id);
      setQuizActiveTab('settings');
      setQuizCourseId(detail.course);
      setQuizModuleId(detail.module || '');
      setQuizTitle(detail.title || '');
      setQuizTitleRw(detail.title_kinyarwanda || '');
      setQuizDescription(detail.description || '');
      setQuizDescriptionRw(detail.description_kinyarwanda || '');
      setQuizOpenDate(detail.open_date ? detail.open_date.slice(0, 16) : '');
      setQuizDeadline(detail.deadline ? detail.deadline.slice(0, 16) : '');
      setQuizTimeLimit(detail.time_limit_minutes || 0);
      setQuizTotalScore(detail.total_score || 100);
      setQuizPassingScore(detail.passing_score || 70);
      setQuizMaxAttempts(detail.max_attempts || 1);
      setQuizShuffle(detail.shuffle_questions || false);
      setQuizRubric(detail.rubric || '');
      setQuizRubricRw(detail.rubric_kinyarwanda || '');
      setQuizItems(detail.items || []);

      if (detail.course) {
        adminService.getCourseModules(detail.course).then(setQuizAvailableModules).catch(() => setQuizAvailableModules([]));
      }
      setIsQuizModalOpen(true);
    } catch (err: any) {
      toastError(err?.message || 'Failed to load quiz details for editing.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseChangeInQuiz = async (cId: string) => {
    setQuizCourseId(cId);
    setQuizModuleId('');
    if (cId) {
      try {
        const mods = await adminService.getCourseModules(cId);
        setQuizAvailableModules(mods);
      } catch {
        setQuizAvailableModules([]);
      }
    } else {
      setQuizAvailableModules([]);
    }
  };

  const handleSaveQuiz = async () => {
    if (!quizTitle.trim()) {
      warning('Please enter a quiz title.');
      return;
    }
    if (!quizCourseId) {
      warning('Please select a course for this quiz.');
      return;
    }
    if (quizItems.length === 0) {
      warning('A quiz must have at least 1 question. Author or pull questions from the bank.');
      return;
    }

    if (isSystemAdmin && !isTrainingAdmin) {
      const scratchCount = quizItems.filter(item => !item.original_question).length;
      if (scratchCount > 0) {
        warning('System Admin can only create/update quizzes by pulling and customizing items from the Question Bank. Scratch authoring is reserved for Training Admin.');
        return;
      }
    }

    setIsSavingQuiz(true);
    try {
      const payload: QuizPayload = {
        course: quizCourseId,
        module: quizModuleId || null,
        title: quizTitle.trim(),
        title_kinyarwanda: quizTitleRw.trim(),
        description: quizDescription.trim(),
        description_kinyarwanda: quizDescriptionRw.trim(),
        open_date: quizOpenDate ? new Date(quizOpenDate).toISOString() : null,
        deadline: quizDeadline ? new Date(quizDeadline).toISOString() : null,
        time_limit_minutes: Number(quizTimeLimit) || 0,
        total_score: quizItems.length > 0 ? calculatedTotalScore : (Number(quizTotalScore) || 100),
        passing_score: Number(quizPassingScore) || 70,
        max_attempts: Number(quizMaxAttempts) || 1,
        shuffle_questions: quizShuffle,
        rubric: quizRubric.trim(),
        rubric_kinyarwanda: quizRubricRw.trim(),
        items: quizItems.map((item, idx) => ({
          ...item,
          sort_order: idx + 1,
        })),
      };

      if (isEditQuizMode && editingQuizId) {
        const updated = await adminService.updateQuiz(editingQuizId, payload);
        success(`Quiz "${updated.title}" updated successfully.`);
      } else {
        const created = await adminService.createQuiz(payload);
        success(`Quiz "${created.title}" created successfully with ${created.question_count} questions.`);
      }

      setIsQuizModalOpen(false);
      const updatedList = await adminService.getQuizzes();
      setQuizzes(updatedList);
    } catch (err: any) {
      toastError(err?.message || 'Failed to save quiz.');
    } finally {
      setIsSavingQuiz(false);
    }
  };

  const handleDeleteQuiz = async (quiz: QuizItem) => {
    if (!window.confirm(`Are you sure you want to delete quiz "${quiz.title}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await adminService.deleteQuiz(quiz.id);
      success(`Quiz "${quiz.title}" deleted.`);
      setQuizzes(prev => prev.filter(q => q.id !== quiz.id));
    } catch (err: any) {
      toastError(err?.message || 'Failed to delete quiz.');
    }
  };

  const handleTogglePublishQuiz = async (quiz: QuizItem) => {
    try {
      const res = await adminService.togglePublishQuiz(quiz.id);
      success(`Quiz ${res.is_published ? 'published' : 'unpublished'}.`);
      setQuizzes(prev => prev.map(q => q.id === quiz.id ? { ...q, is_published: res.is_published, status: res.status } : q));
    } catch (err: any) {
      toastError(err?.message || 'Failed to toggle publish state.');
    }
  };

  const handleAddBankQuestionsToQuiz = (bankQuestions: any[]) => {
    const newItems: QuizQuestionItem[] = bankQuestions.map(bq => ({
      original_question: bq.id,
      points: 1,
      question_text: bq.question_text || bq.question_text_rw || bq.question_text_kinyarwanda || '',
      question_text_kinyarwanda: bq.question_text_kinyarwanda || bq.question_text_rw || '',
      option_a: bq.option_a || bq.option_a_rw || '',
      option_b: bq.option_b || bq.option_b_rw || '',
      option_c: bq.option_c || bq.option_c_rw || '',
      option_d: bq.option_d || bq.option_d_rw || '',
      option_a_kinyarwanda: bq.option_a_kinyarwanda || bq.option_a_rw || '',
      option_b_kinyarwanda: bq.option_b_kinyarwanda || bq.option_b_rw || '',
      option_c_kinyarwanda: bq.option_c_kinyarwanda || bq.option_c_rw || '',
      option_d_kinyarwanda: bq.option_d_kinyarwanda || bq.option_d_rw || '',
      correct_option: bq.correct_option || 'A',
      explanation: bq.explanation || bq.explanation_kinyarwanda || bq.explanation_rw || '',
      explanation_kinyarwanda: bq.explanation_kinyarwanda || bq.explanation_rw || '',
      domain: bq.domain || 'PRIORITY',
      difficulty: bq.difficulty || 'MEDIUM',
    }));
    setQuizItems(prev => [...prev, ...newItems]);
    setIsBankPickerModalOpen(false);
    setSelectedBankQuestionIds([]);
    success(`Added ${newItems.length} question(s) from Question Bank.`);
  };

  const handleAddScratchQuestion = () => {
    if (!scratchQuestionText.trim()) {
      warning('Please enter question text.');
      return;
    }
    if (!scratchOptionA.trim() || !scratchOptionB.trim()) {
      warning('At least Options A and B must be provided.');
      return;
    }
    const newItem: QuizQuestionItem = {
      original_question: null,
      points: Number(scratchPoints) || 1,
      question_text: scratchQuestionText.trim(),
      question_text_kinyarwanda: scratchQuestionTextRw.trim(),
      option_a: scratchOptionA.trim(),
      option_b: scratchOptionB.trim(),
      option_c: scratchOptionC.trim(),
      option_d: scratchOptionD.trim(),
      option_a_kinyarwanda: scratchOptionARw.trim(),
      option_b_kinyarwanda: scratchOptionBRw.trim(),
      option_c_kinyarwanda: scratchOptionCRw.trim(),
      option_d_kinyarwanda: scratchOptionDRw.trim(),
      correct_option: scratchCorrectOption,
      explanation: scratchExplanation.trim(),
      explanation_kinyarwanda: scratchExplanationRw.trim(),
      domain: scratchDomain,
      difficulty: scratchDifficulty,
    };
    setQuizItems(prev => [...prev, newItem]);
    setScratchQuestionText('');
    setScratchQuestionTextRw('');
    setScratchOptionA('');
    setScratchOptionB('');
    setScratchOptionC('');
    setScratchOptionD('');
    setScratchOptionARw('');
    setScratchOptionBRw('');
    setScratchOptionCRw('');
    setScratchOptionDRw('');
    setScratchCorrectOption('A');
    setScratchPoints(1);
    setScratchExplanation('');
    setScratchExplanationRw('');
    setIsAddingScratchQuestion(false);
    success('Question authored and added to quiz.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            {isTrainingAdmin ? t('admin.courses.trainingAdminTitle') : t('admin.courses.systemAdminTitle')}
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isTrainingAdmin
              ? t('admin.courses.trainingAdminSubtitle')
              : t('admin.courses.systemAdminSubtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={loadAllData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            <span>{t('admin.dashboard.refresh')}</span>
          </button>
        </div>
      </div>

      {/* Functional Section Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '12px',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => {
            setSelectedCourseForCurriculum(null);
            setSelectedCurriculum(null);
            setActiveSection('curricula');
          }}
          className={`btn btn-sm ${activeSection === 'curricula' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
        >
          <Layers size={15} />
          <span>{t('admin.courses.tabCurricula')} ({curricula.length})</span>
        </button>

        <button
          onClick={() => {
            setSelectedCourseForCurriculum(null);
            setSelectedCurriculum(null);
            setActiveSection('cohorts');
          }}
          className={`btn btn-sm ${activeSection === 'cohorts' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
        >
          <GraduationCap size={15} />
          <span>{t('admin.courses.tabCohorts')} ({cohorts.length})</span>
        </button>

        <button
          onClick={() => {
            setSelectedCourseForCurriculum(null);
            setSelectedCurriculum(null);
            setActiveSection('learners');
          }}
          className={`btn btn-sm ${activeSection === 'learners' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
        >
          <Users size={15} />
          <span>{t('admin.courses.tabLearners')} ({students.length + guests.length})</span>
        </button>

        <button
          onClick={() => {
            setSelectedCourseForCurriculum(null);
            setSelectedCurriculum(null);
            setActiveSection('quizzes');
          }}
          className={`btn btn-sm ${activeSection === 'quizzes' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
        >
          <HelpCircle size={15} />
          <span>{t('admin.courses.tabQuizzes')} ({quizzes.length})</span>
        </button>

        <button
          onClick={() => {
            setSelectedCourseForCurriculum(null);
            setSelectedCurriculum(null);
            setActiveSection('tutors');
          }}
          className={`btn btn-sm ${activeSection === 'tutors' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
        >
          <Video size={15} />
          <span>{t('admin.courses.tabTutors')} ({tutors.length})</span>
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <Spinner message="Loading LMS Studio data..." />
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* SECTION: CURRICULA & COURSES (HIERARCHICAL)                               */}
          {/* ========================================================================= */}
          {activeSection === 'curricula' && (
            selectedCourseForCurriculum ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Top Banner / Breadcrumb */}
                <div
                  style={{
                    padding: '16px 22px',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <button
                      onClick={() => setSelectedCourseForCurriculum(null)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
                    >
                      <ArrowLeft size={15} />
                      <span>{t('admin.courses.backToCourses')}</span>
                    </button>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {language === 'rw' && selectedCourseForCurriculum.title_rw
                            ? selectedCourseForCurriculum.title_rw
                            : selectedCourseForCurriculum.title}
                        </h2>
                        {selectedCourseForCurriculum.is_published ? (
                          <Badge variant="success">{t('admin.courses.publishedBadge')}</Badge>
                        ) : (
                          <Badge variant="warning">{t('admin.courses.draftBadgeUpper')}</Badge>
                        )}
                        <span style={{ fontSize: '0.75rem', color: '#0284c7', fontFamily: 'monospace', background: 'rgba(2, 132, 199, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
                          {selectedCourseForCurriculum.code || 'CODE'}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {t('admin.courses.trainingAdminSubtitle')}
                      </p>
                    </div>
                  </div>

                  {/* Add Module is only visible to Training Admin / Content Author (Read-only for System Admin) */}
                  {!isSystemAdmin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={handleOpenCreateModule}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#0284c7' }}
                      >
                        <Plus size={15} />
                        <span>{t('admin.courses.addModule')}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Two-Column Studio Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '20px', alignItems: 'start' }}>
                  {/* Left Column: Modules List */}
                  <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layers size={17} color="var(--primary)" />
                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                          {t('admin.courses.modulesTitle')} ({courseModules.length})
                        </h3>
                      </div>
                      {!isSystemAdmin && (
                        <button
                          onClick={handleOpenCreateModule}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '3px' }}
                        >
                          <Plus size={13} />
                          <span>{t('admin.courses.new')}</span>
                        </button>
                      )}
                    </div>

                    {isModulesLoading ? (
                      <div style={{ padding: '40px', textAlign: 'center' }}>
                        <Spinner />
                      </div>
                    ) : courseModules.length === 0 ? (
                      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                        <p style={{ margin: '0 0 12px' }}>
                          {t('admin.courses.noModulesYet')}
                        </p>
                        {!isSystemAdmin && (
                          <button onClick={handleOpenCreateModule} className="btn btn-primary btn-sm">
                            {t('admin.courses.createFirstModule')}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
                        {courseModules.map((mod, idx) => {
                          const isSelected = selectedModule?.id === mod.id;
                          return (
                            <div
                              key={mod.id}
                              onClick={() => handleSelectModule(mod)}
                              style={{
                                padding: '12px 14px',
                                borderRadius: 'var(--radius-lg)',
                                marginBottom: '6px',
                                cursor: 'pointer',
                                background: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                                border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                                    #{mod.sort_order ?? idx + 1}
                                  </span>
                                  <span style={{ fontWeight: 700, color: isSelected ? 'var(--primary-light)' : '#ffffff', fontSize: '0.88rem' }}>
                                    {mod.title}
                                  </span>
                                </div>

                                {!isSystemAdmin && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={() => handleTogglePublishModule(mod)}
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: '3px 6px', fontSize: '0.7rem' }}
                                      title={mod.is_published ? t('admin.courses.unpublishModuleTitle') : t('admin.courses.publishModuleTitle')}
                                    >
                                      {mod.is_published ? <EyeOff size={12} /> : <Eye size={12} />}
                                    </button>
                                    <button
                                      onClick={() => handleOpenEditModule(mod)}
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: '3px 6px', fontSize: '0.7rem' }}
                                      title={t('admin.courses.editModuleTitle')}
                                    >
                                      <Pencil size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteModule(mod.id, mod.title)}
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: '3px 6px', fontSize: '0.7rem', color: 'var(--danger)' }}
                                      title={t('admin.courses.deleteModuleTitle')}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {mod.description && (
                                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {mod.description}
                                </p>
                              )}

                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                {mod.is_foundational && (
                                  <Badge variant="warning">{t('admin.courses.foundationalBadge')}</Badge>
                                )}
                                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                  {mod.lesson_count ?? 0} {mod.lesson_count === 1 ? t('admin.courses.lessonWord') : t('admin.courses.lessonsWord')}
                                </span>
                                {mod.is_published ? (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>
                                    {t('admin.courses.liveBadge')}
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {t('admin.courses.draftBadge')}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Lessons for Selected Module */}
                  <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
                    {selectedModule ? (
                      <>
                        <div
                          style={{
                            padding: '16px 22px',
                            borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <BookOpen size={18} color="var(--primary)" />
                              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                                {selectedModule.title}
                              </h3>
                              {selectedModule.is_published ? (
                                <Badge variant="success">{t('admin.courses.publishedBadge')}</Badge>
                              ) : (
                                <Badge variant="neutral">{t('admin.courses.draftBadgeUpper')}</Badge>
                              )}
                            </div>
                            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {selectedModule.description || t('admin.courses.trainingAdminSubtitle')}
                            </p>
                          </div>

                          {!isSystemAdmin && (
                            <button
                              onClick={handleOpenCreateLesson}
                              className="btn btn-primary btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
                            >
                              <Plus size={15} />
                              <span>{t('admin.courses.addLessonBtn')}</span>
                            </button>
                          )}
                        </div>

                        {isLessonsLoading ? (
                          <div style={{ padding: '60px', textAlign: 'center' }}>
                            <Spinner />
                          </div>
                        ) : moduleLessons.length === 0 ? (
                          <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.08)', marginBottom: '16px' }}>
                              <BookOpen size={32} color="var(--primary)" />
                            </div>
                            <h4 style={{ margin: '0 0 6px', color: '#ffffff', fontSize: '1rem', fontWeight: 700 }}>
                              {t('admin.courses.noLessonsYet')}
                            </h4>
                            <p style={{ margin: '0 0 16px', fontSize: '0.84rem', maxWidth: '400px', marginInline: 'auto' }}>
                              {t('admin.courses.selectModuleToView')}
                            </p>
                            {!isSystemAdmin && (
                              <button onClick={handleOpenCreateLesson} className="btn btn-primary btn-sm">
                                <Plus size={14} style={{ marginRight: '6px' }} />
                                {t('admin.courses.addFirstLesson')}
                              </button>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {moduleLessons.map((les, lIdx) => {
                              const isText = les.lesson_type === 'TEXT';
                              const isAudio = les.lesson_type === 'AUDIO';
                              const isVideo = les.lesson_type === 'VIDEO';
                              const isRoadSign = les.lesson_type === 'ROAD_SIGN';
                              const isQuiz = les.lesson_type === 'QUIZ';

                              const typeLabel = isText
                                ? t('admin.courses.text')
                                : isAudio
                                ? t('admin.courses.audio')
                                : isVideo
                                ? t('admin.courses.video')
                                : isRoadSign
                                ? t('admin.courses.roadSign')
                                : t('admin.courses.quiz');

                              return (
                                <div
                                  key={les.id}
                                  style={{
                                    padding: '16px 20px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    gap: '16px',
                                    borderBottom: '1px solid var(--border-subtle)',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                                    {/* Type Icon Badge */}
                                    <div
                                      style={{
                                        width: '38px',
                                        height: '38px',
                                        borderRadius: 'var(--radius-md)',
                                        background: isAudio
                                          ? 'rgba(168, 85, 247, 0.15)'
                                          : isVideo
                                          ? 'rgba(6, 182, 212, 0.15)'
                                          : isRoadSign
                                          ? 'rgba(245, 158, 11, 0.15)'
                                          : isQuiz
                                          ? 'rgba(16, 185, 129, 0.15)'
                                          : 'rgba(59, 130, 246, 0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                      }}
                                    >
                                      {isAudio && <Headphones size={18} color="#c084fc" />}
                                      {isVideo && <Video size={18} color="#22d3ee" />}
                                      {isRoadSign && <Compass size={18} color="#fbbf24" />}
                                      {isQuiz && <HelpCircle size={18} color="#34d399" />}
                                      {isText && <FileText size={18} color="var(--primary-light)" />}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                          #{les.sort_order ?? lIdx + 1}
                                        </span>
                                        <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                                          {les.title}
                                        </h4>
                                        <span
                                          style={{
                                            fontSize: '0.68rem',
                                            fontWeight: 700,
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            background: isAudio
                                              ? 'rgba(168, 85, 247, 0.2)'
                                              : isVideo
                                              ? 'rgba(6, 182, 212, 0.2)'
                                              : isRoadSign
                                              ? 'rgba(245, 158, 11, 0.2)'
                                              : isQuiz
                                              ? 'rgba(16, 185, 129, 0.2)'
                                              : 'rgba(59, 130, 246, 0.2)',
                                            color: isAudio
                                              ? '#d8b4fe'
                                              : isVideo
                                              ? '#67e8f9'
                                              : isRoadSign
                                              ? '#fde68a'
                                              : isQuiz
                                              ? '#6ee7b7'
                                              : '#93c5fd',
                                          }}
                                        >
                                          {typeLabel}
                                        </span>

                                        {les.is_free_preview && (
                                          <Badge variant="success">{t('admin.courses.freePreviewBadge')}</Badge>
                                        )}
                                        {les.is_student_only && (
                                          <Badge variant="neutral">{t('admin.courses.enrolledOnlyBadge')}</Badge>
                                        )}
                                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                          ~{les.duration_minutes || 15} min
                                        </span>
                                      </div>

                                      {/* Snippet / Content Preview */}
                                      {isText && les.content_text && (
                                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)', maxHeight: '38px', overflow: 'hidden' }}>
                                          {les.content_text.slice(0, 160)}...
                                        </p>
                                      )}

                                      {isAudio && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                          <Headphones size={13} color="#c084fc" />
                                          <span>
                                            {t('admin.courses.audioMaterialLabel')}
                                            {les.media_url ? (
                                              <a href={les.media_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-light)', textDecoration: 'underline' }}>
                                                {t('admin.courses.listenStream')}{' '}
                                                <ExternalLink size={11} style={{ display: 'inline', marginLeft: '2px' }} />
                                              </a>
                                            ) : les.media_file ? (
                                              t('admin.courses.uploadedMp3')
                                            ) : (
                                              t('admin.courses.noAudioSource')
                                            )}
                                          </span>
                                        </div>
                                      )}

                                      {isVideo && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                          <PlayCircle size={13} color="#22d3ee" />
                                          <span>
                                            {t('admin.courses.videoStreamLabel')}
                                            {les.media_url ? (
                                              <a href={les.media_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-light)', textDecoration: 'underline' }}>
                                                {t('admin.courses.watchVideo')}{' '}
                                                <ExternalLink size={11} style={{ display: 'inline', marginLeft: '2px' }} />
                                              </a>
                                            ) : les.media_file ? (
                                              t('admin.courses.uploadedMp4')
                                            ) : (
                                              t('admin.courses.noVideoSource')
                                            )}
                                          </span>
                                        </div>
                                      )}

                                      {isRoadSign && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                          <Compass size={13} color="#fbbf24" />
                                          <span>
                                            {t('admin.courses.roadSignLabel')}
                                            {les.road_sign || t('admin.courses.attachedInLesson')}
                                          </span>
                                        </div>
                                      )}

                                      {isQuiz && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                          <HelpCircle size={13} color="#34d399" />
                                          <span>
                                            {t('admin.courses.typeQuiz')} — {les.question_count ?? 0}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {!isSystemAdmin && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <button
                                        onClick={() => handleOpenEditLesson(les)}
                                        className="btn btn-secondary btn-sm"
                                        style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        title={t('admin.courses.editLesson')}
                                      >
                                        <Pencil size={12} />
                                        <span>{t('admin.courses.edit')}</span>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteLesson(les.id, les.title)}
                                        className="btn btn-secondary btn-sm"
                                        style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--danger)' }}
                                        title={t('admin.courses.deleteLesson')}
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <Layers size={36} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                        <h4 style={{ margin: '0 0 6px', color: '#ffffff', fontSize: '1rem', fontWeight: 700 }}>
                          {t('admin.courses.selectModule')}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.84rem' }}>
                          {t('admin.courses.selectModuleToView')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : selectedCurriculum ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Curriculum Header & Breadcrumb */}
                <div
                  style={{
                    padding: '16px 22px',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <button
                      onClick={() => {
                        setSelectedCurriculum(null);
                        setCourseSearch('');
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
                    >
                      <ArrowLeft size={15} />
                      <span>{t('admin.courses.backToCurricula')}</span>
                    </button>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {language === 'rw' && selectedCurriculum.title_kinyarwanda
                            ? selectedCurriculum.title_kinyarwanda
                            : selectedCurriculum.title}
                        </h2>
                        {selectedCurriculum.is_published ? (
                          <Badge variant="success">{t('admin.courses.publishedBadge')}</Badge>
                        ) : (
                          <Badge variant="warning">{t('admin.courses.draftBadgeUpper')}</Badge>
                        )}
                        <span style={{ fontSize: '0.75rem', color: '#818cf8', fontFamily: 'monospace', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                          {selectedCurriculum.code || 'RW-CURR'}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {(language === 'rw' && selectedCurriculum.description_kinyarwanda ? selectedCurriculum.description_kinyarwanda : selectedCurriculum.description) || t('admin.courses.coursesUnderCurriculum')}
                      </p>
                    </div>
                  </div>

                  {isSystemAdmin && (
                    <button
                      onClick={() => handleOpenCreateCourse(selectedCurriculum.id)}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={15} />
                      <span>{t('admin.courses.createCourse')}</span>
                    </button>
                  )}
                </div>

                {/* Courses under this Curriculum */}
                <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
                  <div
                    style={{
                      padding: '18px 24px',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ position: 'relative', width: '280px' }}>
                      <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder={t('admin.courses.searchCoursesPlaceholder')}
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px 8px 36px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.84rem',
                        }}
                      />
                    </div>
                  </div>

                  {filteredCourses.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {t('admin.courses.noCoursesInCurriculum')}
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                            <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                              {t('admin.courses.codeCol')}
                            </th>
                            <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                              {t('admin.courses.titleCol')}
                            </th>
                            <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                              {t('admin.courses.descCol')}
                            </th>
                            <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                              {t('admin.courses.statusCol')}
                            </th>
                            <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                              {t('admin.courses.modulesCol')}
                            </th>
                            <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                              {t('admin.courses.actionsCol')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCourses.map((c) => {
                            const modCount = c.module_count ?? c.modules_count ?? 0;
                            const isEmpty = modCount === 0;
                            const displayCode = c.code || (c.id ? c.id.slice(0, 8).toUpperCase() : 'RW-LMS');

                            return (
                              <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--primary-light)', fontFamily: 'monospace' }}>
                                  {displayCode}
                                </td>
                                <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ffffff' }}>
                                  <div>{language === 'rw' && (c.title_rw || c.title_kinyarwanda) ? (c.title_rw || c.title_kinyarwanda) : c.title}</div>
                                  {c.estimated_hours ? (
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>
                                      ~{c.estimated_hours} {t('admin.courses.hrsStudyTime')}
                                    </div>
                                  ) : null}
                                </td>
                                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {c.title_rw || c.description || '—'}
                                  </div>
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                  {c.is_published ? (
                                    <Badge variant="success">{t('admin.courses.publishedBadge')}</Badge>
                                  ) : isEmpty ? (
                                    <Badge variant="warning">{t('admin.courses.draftEmpty')}</Badge>
                                  ) : (
                                    <Badge variant="neutral">
                                      {t('admin.courses.draftWithMods', { count: modCount })}
                                    </Badge>
                                  )}
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                  {isEmpty ? (
                                    <span style={{ color: 'var(--warning)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                                      <AlertCircle size={14} />
                                      {t('admin.courses.awaitingContent')}
                                    </span>
                                  ) : (
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                                      {modCount} {modCount === 1 ? t('admin.courses.lessonWord') : t('admin.courses.modulesTitle')}
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {/* Modules & Lessons button */}
                                    <button
                                      onClick={() => handleOpenCurriculumBuilder(c)}
                                      className="btn btn-primary btn-sm"
                                      style={{ fontSize: '0.75rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                      title={t('admin.courses.modulesBtnTitle')}
                                    >
                                      <BookOpen size={13} />
                                      <span>{t('admin.courses.modulesBtn')}</span>
                                    </button>

                                    {/* Course Publishing, Edit, and Delete are strictly for System Admin */}
                                    {isSystemAdmin && (
                                      <>
                                        {c.is_published ? (
                                          <button
                                            onClick={() => handleTogglePublish(c)}
                                            className="btn btn-secondary btn-sm"
                                            style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                            title={t('admin.courses.unpublish')}
                                          >
                                            <EyeOff size={13} />
                                            <span>{t('admin.courses.unpublish')}</span>
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => handleTogglePublish(c)}
                                            className="btn btn-secondary btn-sm"
                                            style={{
                                              fontSize: '0.75rem',
                                              padding: '4px 8px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '4px',
                                              opacity: isEmpty ? 0.75 : 1,
                                              borderColor: isEmpty ? 'rgba(234, 179, 8, 0.4)' : undefined,
                                              color: isEmpty ? 'var(--warning)' : undefined,
                                            }}
                                            title={isEmpty ? 'Cannot publish empty course. Training admin must add modules first.' : 'Publish course'}
                                          >
                                            {isEmpty ? <Lock size={13} /> : <Eye size={13} />}
                                            <span>{t('admin.courses.publish')}</span>
                                          </button>
                                        )}

                                        <button
                                          onClick={() => handleOpenEditCourse(c)}
                                          className="btn btn-secondary btn-sm"
                                          style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-light)' }}
                                          title={t('admin.courses.editCourse')}
                                        >
                                          <Pencil size={13} />
                                          <span>{t('admin.courses.editCourse')}</span>
                                        </button>

                                        <button
                                          onClick={() => handleDeleteCourse(c.id, c.title)}
                                          className="btn btn-secondary btn-sm"
                                          style={{ fontSize: '0.75rem', padding: '4px 8px', color: 'var(--danger)' }}
                                          title={t('admin.courses.deleteCourse')}
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* LEVEL 1: CURRICULA LIST */
              <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative', width: '280px' }}>
                      <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder={t('admin.courses.searchCurriculaPlaceholder')}
                        value={curriculumSearch}
                        onChange={(e) => setCurriculumSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px 8px 36px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.84rem',
                        }}
                      />
                    </div>
                  </div>

                  {isSystemAdmin && (
                    <button
                      onClick={handleOpenCreateCurriculum}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={15} />
                      <span>{t('admin.courses.createCurriculum')}</span>
                    </button>
                  )}
                </div>

                {filteredCurricula.length === 0 ? (
                  <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {t('admin.courses.noCurriculaFound')}
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                          <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {t('admin.courses.codeCol')}
                          </th>
                          <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {t('admin.courses.titleCol')}
                          </th>
                          <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {t('admin.courses.descCol')}
                          </th>
                          <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {t('admin.courses.statusCol')}
                          </th>
                          <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {t('admin.courses.coursesCount')}
                          </th>
                          <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {t('admin.courses.actionsCol')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCurricula.map((curr) => {
                          const courseCount = curr.course_count || 0;
                          return (
                            <tr
                              key={curr.id}
                              style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                              onClick={(e) => {
                                if ((e.target as HTMLElement).closest('button')) return;
                                setSelectedCurriculum(curr);
                              }}
                            >
                              <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--primary-light)', fontFamily: 'monospace' }}>
                                {curr.code || 'RW-CURR'}
                              </td>
                              <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ffffff' }}>
                                <div>{language === 'rw' && curr.title_kinyarwanda ? curr.title_kinyarwanda : curr.title}</div>
                                {curr.title_kinyarwanda && language !== 'rw' && (
                                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>
                                    {curr.title_kinyarwanda}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', maxWidth: '260px' }}>
                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {(language === 'rw' && curr.description_kinyarwanda ? curr.description_kinyarwanda : curr.description) || '—'}
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                {curr.is_published ? (
                                  <Badge variant="success">{t('admin.courses.publishedBadge')}</Badge>
                                ) : (
                                  <Badge variant="warning">{t('admin.courses.draftBadgeUpper')}</Badge>
                                )}
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCurriculum(curr);
                                  }}
                                  className="btn btn-secondary btn-sm"
                                  style={{
                                    fontSize: '0.78rem',
                                    padding: '4px 10px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}
                                  title={t('admin.courses.viewCourses')}
                                >
                                  <BookOpen size={13} color="var(--primary-light)" />
                                  <span style={{ fontWeight: 700 }}>{courseCount}</span>
                                  <span>{courseCount === 1 ? t('admin.courses.tabCourses') : t('admin.courses.coursesCount')}</span>
                                </button>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCurriculum(curr);
                                    }}
                                    className="btn btn-primary btn-sm"
                                    style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    title={t('admin.courses.viewCourses')}
                                  >
                                    <BookOpen size={13} />
                                    <span>{t('admin.courses.viewCourses')}</span>
                                  </button>

                                  {isSystemAdmin ? (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTogglePublishCurriculum(curr);
                                        }}
                                        className="btn btn-secondary btn-sm"
                                        style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        title={curr.is_published ? t('admin.courses.unpublishCurriculum') : t('admin.courses.publishCurriculum')}
                                      >
                                        {curr.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                                        <span>{curr.is_published ? t('admin.courses.unpublish') : t('admin.courses.publish')}</span>
                                      </button>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenEditCurriculum(curr);
                                        }}
                                        className="btn btn-secondary btn-sm"
                                        style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-light)' }}
                                        title={t('admin.courses.editCurriculum')}
                                      >
                                        <Pencil size={13} />
                                        <span>{t('admin.courses.edit')}</span>
                                      </button>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteCurriculum(curr.id, curr.title);
                                        }}
                                        className="btn btn-secondary btn-sm"
                                        style={{ fontSize: '0.75rem', padding: '4px 8px', color: 'var(--danger)' }}
                                        title={t('admin.courses.deleteCurriculum')}
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </>
                                  ) : (
                                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                                      {curr.is_published ? 'Published' : 'Draft'}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: COHORTS & TUTOR ALLOCATION                                     */}
          {/* ========================================================================= */}
          {activeSection === 'cohorts' && (
            <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
              <div
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ position: 'relative', width: '280px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search cohorts..."
                    value={cohortSearch}
                    onChange={(e) => setCohortSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.84rem',
                    }}
                  />
                </div>

                <button
                  onClick={() => setIsCreateCohortModalOpen(true)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={15} />
                  <span>Create Cohort</span>
                </button>
              </div>

              {filteredCohorts.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No cohorts registered. Create a student cohort to begin scheduling classes and assigning tutors.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Code</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Cohort Name</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Duration</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Enrolled / Capacity</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Assigned Tutors</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCohorts.map((co) => {
                        const studentCount = co.student_count || 0;
                        const maxCap = co.max_capacity || 50;
                        const assignedTutorsList = co.assigned_tutors || [];
                        const ongoingCount = co.ongoing_student_count ?? 0;

                        return (
                          <tr key={co.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--primary-light)', fontFamily: 'monospace' }}>
                              {co.code || 'COHORT'}
                            </td>
                            <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ffffff' }}>
                              <div>{co.name}</div>
                              {co.schedule_description && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>
                                  {co.schedule_description}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              {co.is_active ? (
                                <Badge variant="success">ACTIVE</Badge>
                              ) : (
                                <Badge variant="neutral">INACTIVE</Badge>
                              )}
                            </td>
                            <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                              {co.start_date} to {co.end_date || 'Open'}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 700, color: '#ffffff' }}>{studentCount}</span>
                                <span style={{ color: 'var(--text-muted)' }}>/ {maxCap}</span>
                              </div>
                              {co.ongoing_student_count !== undefined && (
                                ongoingCount === 0 ? (
                                  <div style={{ fontSize: '0.72rem', color: '#4ade80', marginTop: '3px', fontWeight: 600 }}>
                                    0 Ongoing (Eligible to Deactivate)
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                                    {ongoingCount} ongoing learner{ongoingCount > 1 ? 's' : ''}
                                  </div>
                                )
                              )}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              {assignedTutorsList.length === 0 ? (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None assigned</span>
                              ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {assignedTutorsList.map((tut) => (
                                    <span
                                      key={tut.id}
                                      style={{
                                        fontSize: '0.74rem',
                                        padding: '2px 8px',
                                        borderRadius: 'var(--radius-sm)',
                                        background: 'rgba(56, 189, 248, 0.12)',
                                        color: '#38bdf8',
                                        border: '1px solid rgba(56, 189, 248, 0.25)',
                                      }}
                                    >
                                      {tut.full_name || tut.phone_number}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                  onClick={() => handleOpenAssignTutorsModal(co)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                  title="Assign or update tutors for this cohort"
                                >
                                  <Users size={13} />
                                  <span>Assign Tutors</span>
                                </button>

                                {co.is_active ? (
                                  <button
                                    onClick={() => handleToggleCohortActive(co)}
                                    disabled={isSubmitting}
                                    className="btn btn-secondary btn-sm"
                                    style={{
                                      fontSize: '0.75rem',
                                      padding: '4px 10px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      color: ongoingCount > 0 ? 'var(--text-muted)' : 'var(--danger)',
                                      borderColor: ongoingCount > 0 ? 'var(--border-subtle)' : 'rgba(239, 68, 68, 0.35)',
                                    }}
                                    title={
                                      ongoingCount > 0
                                        ? `Cannot deactivate: ${ongoingCount} active student(s) still ongoing`
                                        : 'Deactivate cohort'
                                    }
                                  >
                                    <PowerOff size={13} />
                                    <span>Deactivate</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleToggleCohortActive(co)}
                                    disabled={isSubmitting}
                                    className="btn btn-secondary btn-sm"
                                    style={{
                                      fontSize: '0.75rem',
                                      padding: '4px 10px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      color: '#4ade80',
                                      borderColor: 'rgba(34, 197, 94, 0.35)',
                                    }}
                                    title="Activate cohort"
                                  >
                                    <Power size={13} />
                                    <span>Activate</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 3: STUDENTS & GUESTS MANAGEMENT                                   */}
          {/* ========================================================================= */}
          {activeSection === 'learners' && (
            <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Search */}
                  <div style={{ position: 'relative', width: '260px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Search by name, phone, student ID..."
                      value={learnerSearch}
                      onChange={(e) => setLearnerSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 36px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        fontSize: '0.84rem',
                      }}
                    />
                  </div>

                  {/* Role Buttons */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => setLearnerRoleFilter('ALL')}
                      className={`btn btn-sm ${learnerRoleFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    >
                      All ({students.length + guests.length})
                    </button>
                    <button
                      onClick={() => setLearnerRoleFilter('STUDENT')}
                      className={`btn btn-sm ${learnerRoleFilter === 'STUDENT' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    >
                      Students ({students.length})
                    </button>
                    <button
                      onClick={() => setLearnerRoleFilter('GUEST')}
                      className={`btn btn-sm ${learnerRoleFilter === 'GUEST' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    >
                      Guests ({guests.length})
                    </button>
                  </div>

                  {/* Filter by Cohort */}
                  <select
                    value={learnerCohortFilter}
                    onChange={(e) => setLearnerCohortFilter(e.target.value)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.80rem',
                    }}
                  >
                    <option value="ALL">All Cohorts</option>
                    {cohorts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code || 'COHORT'})
                      </option>
                    ))}
                  </select>

                  {/* Filter by Tutor */}
                  <select
                    value={learnerTutorFilter}
                    onChange={(e) => setLearnerTutorFilter(e.target.value)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.80rem',
                    }}
                  >
                    <option value="ALL">All Tutors</option>
                    {tutors.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name || t.phone_number}
                      </option>
                    ))}
                  </select>

                  {/* Filter by Status */}
                  <select
                    value={learnerStatusFilter}
                    onChange={(e) => setLearnerStatusFilter(e.target.value)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.80rem',
                    }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="DEACTIVATED">Deactivated</option>
                  </select>
                </div>

                {/* Enroll Student Action */}
                <button
                  onClick={handleOpenEnrollStudentModal}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: 'var(--radius-lg)' }}
                >
                  <UserPlus size={16} />
                  <span>{t('admin.courses.enrollStudent') || 'Enroll Student'}</span>
                </button>
              </div>

              {allLearners.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No learners found matching the search criteria.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>{t('admin.courses.learnerCol') || 'Learner / Student'}</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>{t('admin.courses.phoneCol') || 'Phone'}</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Role</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>{t('admin.courses.statusCol') || 'Status'}</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>{t('admin.courses.cohortCol') || 'Assigned Cohort'}</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>{t('admin.courses.tutorCol') || 'Assigned Tutor'}</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>{t('admin.courses.registeredCol') || 'Registered'}</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allLearners.map((lrn) => {
                        const initials = (lrn.full_name || lrn.phone_number)
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase();

                        return (
                          <tr key={lrn.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            {/* Learner Info */}
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: lrn.role === 'STUDENT' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                                    color: lrn.role === 'STUDENT' ? '#38bdf8' : '#a855f7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    flexShrink: 0,
                                  }}
                                >
                                  {initials || 'U'}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.90rem' }}>
                                    {lrn.full_name || 'Anonymous User'}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                    {lrn.student_id ? (
                                      <span
                                        style={{
                                          fontSize: '0.70rem',
                                          color: 'var(--primary-light)',
                                          background: 'rgba(56, 189, 248, 0.12)',
                                          padding: '1px 6px',
                                          borderRadius: 'var(--radius-sm)',
                                          fontFamily: 'monospace',
                                          fontWeight: 600,
                                        }}
                                      >
                                        {lrn.student_id}
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>No Student ID</span>
                                    )}
                                    {lrn.email && (
                                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                        {lrn.email}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Phone */}
                            <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.84rem' }}>
                              {lrn.phone_number}
                            </td>

                            {/* Role */}
                            <td style={{ padding: '14px 16px' }}>
                              <Badge variant={lrn.role === 'STUDENT' ? 'info' : 'neutral'}>
                                {lrn.role}
                              </Badge>
                            </td>

                            {/* Status */}
                            <td style={{ padding: '14px 16px' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: '999px',
                                  background:
                                    lrn.status === 'ACTIVE'
                                      ? 'rgba(34, 197, 94, 0.15)'
                                      : lrn.status === 'SUSPENDED'
                                      ? 'rgba(245, 158, 11, 0.15)'
                                      : 'rgba(239, 68, 68, 0.15)',
                                  color:
                                    lrn.status === 'ACTIVE'
                                      ? '#22c55e'
                                      : lrn.status === 'SUSPENDED'
                                      ? '#f59e0b'
                                      : '#ef4444',
                                }}
                              >
                                <span
                                  style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background:
                                      lrn.status === 'ACTIVE'
                                        ? '#22c55e'
                                        : lrn.status === 'SUSPENDED'
                                        ? '#f59e0b'
                                        : '#ef4444',
                                  }}
                                />
                                {lrn.status || 'ACTIVE'}
                              </span>
                            </td>

                            {/* Assigned Cohort */}
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {lrn.cohort_name ? (
                                  <span style={{ fontWeight: 600, color: '#38bdf8', fontSize: '0.84rem' }}>
                                    {lrn.cohort_name}
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.80rem' }}>Unassigned</span>
                                )}
                                <button
                                  onClick={() => handleOpenChangeCohort(lrn)}
                                  className="btn btn-secondary btn-sm"
                                  title={lrn.cohort_name ? 'Change Cohort' : 'Assign Cohort'}
                                  style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <ArrowRightLeft size={11} />
                                  <span>{lrn.cohort_name ? 'Change' : 'Assign'}</span>
                                </button>
                              </div>
                            </td>

                            {/* Assigned Tutor */}
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {lrn.assigned_tutor_name ? (
                                  <span style={{ fontWeight: 600, color: '#a78bfa', fontSize: '0.84rem' }}>
                                    {lrn.assigned_tutor_name}
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.80rem' }}>No Tutor</span>
                                )}
                                <button
                                  onClick={() => handleOpenStudentTutorModal(lrn)}
                                  className="btn btn-secondary btn-sm"
                                  title={lrn.assigned_tutor_name ? 'Change Tutor' : 'Assign Tutor'}
                                  style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <UserCheck size={11} />
                                  <span>{lrn.assigned_tutor_name ? 'Change' : 'Assign'}</span>
                                </button>
                              </div>
                            </td>

                            {/* Registered */}
                            <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.80rem' }}>
                              {lrn.created_at ? lrn.created_at.slice(0, 10) : '—'}
                            </td>

                            {/* Actions */}
                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                {/* View Details */}
                                <button
                                  onClick={() => handleOpenStudentDetails(lrn)}
                                  className="btn btn-secondary btn-sm"
                                  title="View Student Profile"
                                  style={{ padding: '6px 9px' }}
                                >
                                  <Eye size={13} />
                                </button>

                                {/* Promote Guest */}
                                {lrn.role === 'GUEST' && (
                                  <button
                                    onClick={() => handlePromoteGuestToStudent(lrn)}
                                    className="btn btn-secondary btn-sm"
                                    title="Promote to Student"
                                    style={{ padding: '6px 9px', color: '#38bdf8' }}
                                  >
                                    <Award size={13} />
                                  </button>
                                )}

                                {/* Status Toggle */}
                                <button
                                  onClick={() => handleToggleStudentStatus(lrn)}
                                  className="btn btn-secondary btn-sm"
                                  title={lrn.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                                  style={{
                                    padding: '6px 9px',
                                    color: lrn.status === 'ACTIVE' ? 'var(--text-muted)' : '#22c55e',
                                  }}
                                >
                                  {lrn.status === 'ACTIVE' ? <PowerOff size={13} /> : <Power size={13} />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 4: PRACTICE QUIZZES & QUESTION BANK                               */}
          {/* ========================================================================= */}
          {/* ========================================================================= */}
          {/* SECTION 4: QUIZ BANK & COURSE ASSESSMENTS                                 */}
          {/* ========================================================================= */}
          {activeSection === 'quizzes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header Bar */}
              <div
                className="glass-panel"
                style={{
                  borderRadius: 'var(--radius-xl)',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      {t('admin.courses.tabQuizBank')}
                    </h2>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {quizzes.length} Quizzes
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Create Quiz Button */}
                  <button
                    type="button"
                    onClick={handleOpenCreateQuiz}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: 'var(--radius-lg)', fontWeight: 700 }}
                  >
                    <Plus size={16} />
                    <span>{t('admin.courses.createQuiz')}</span>
                  </button>
                </div>
              </div>

              {/* Course Quizzes Directory */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Status Metrics Strip - Canvas minimalist clean design */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
                        <ListChecks size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>{quizzes.length}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Quizzes</div>
                      </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                          {quizzes.filter(q => q.status === 'OPEN').length}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active & Open</div>
                      </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
                        <Clock size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                          {quizzes.filter(q => q.status === 'SCHEDULED').length}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scheduled</div>
                      </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
                        <FileCheck size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                          {quizzes.filter(q => q.status === 'DRAFT').length}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Draft Mode</div>
                      </div>
                    </div>
                  </div>

                  {/* Filter bar */}
                  <div
                    className="glass-panel"
                    style={{
                      borderRadius: 'var(--radius-xl)',
                      padding: '14px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ position: 'relative', width: '280px' }}>
                        <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          placeholder="Search quizzes, courses, modules..."
                          value={quizSearch}
                          onChange={(e) => setQuizSearch(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px 8px 36px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-subtle)',
                            color: '#ffffff',
                            fontSize: '0.84rem',
                          }}
                        />
                      </div>

                      <select
                        value={quizCourseFilter}
                        onChange={(e) => setQuizCourseFilter(e.target.value)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.84rem',
                        }}
                      >
                        <option value="ALL">All Courses ({courses.length})</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>

                      <select
                        value={quizStatusFilter}
                        onChange={(e) => setQuizStatusFilter(e.target.value)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.84rem',
                        }}
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="OPEN">Open (Live Now)</option>
                        <option value="SCHEDULED">Scheduled (Future Open Date)</option>
                        <option value="CLOSED">Closed (Deadline Passed)</option>
                        <option value="DRAFT">Draft</option>
                      </select>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Showing {filteredQuizzes.length} of {quizzes.length} quizzes
                    </div>
                  </div>

                  {/* Quizzes Table */}
                  <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                    {filteredQuizzes.length === 0 ? (
                      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                        <div
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#60a5fa',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px auto',
                          }}
                        >
                          <ListChecks size={28} />
                        </div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                          No quizzes found
                        </h4>
                        <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                          {quizSearch || quizCourseFilter !== 'ALL' || quizStatusFilter !== 'ALL'
                            ? 'No quizzes matched your filter criteria. Try resetting the filters.'
                            : t('admin.courses.noQuizzesFound')}
                        </p>
                        <button
                          type="button"
                          onClick={handleOpenCreateQuiz}
                          className="btn btn-primary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                          <Plus size={16} />
                          <span>{t('admin.courses.createQuiz')}</span>
                        </button>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                          <thead>
                            <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                              <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Quiz & Course Scope</th>
                              <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                              <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Availability Window</th>
                              <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Assessment Rules</th>
                              <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Questions</th>
                              <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Author / Oversight</th>
                              <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredQuizzes.map((quiz) => {
                              const statusColors: Record<string, { bg: string; text: string; border: string }> = {
                                OPEN: { bg: 'rgba(255, 255, 255, 0.08)', text: '#ffffff', border: 'var(--border-subtle)' },
                                SCHEDULED: { bg: 'rgba(255, 255, 255, 0.04)', text: 'var(--text-secondary)', border: 'var(--border-subtle)' },
                                CLOSED: { bg: 'rgba(255, 255, 255, 0.03)', text: 'var(--text-muted)', border: 'var(--border-subtle)' },
                                DRAFT: { bg: 'rgba(255, 255, 255, 0.03)', text: 'var(--text-muted)', border: 'var(--border-subtle)' },
                              };
                              const col = statusColors[quiz.status] || statusColors.DRAFT;

                              return (
                                <tr
                                  key={quiz.id}
                                  style={{
                                    borderBottom: '1px solid var(--border-subtle)',
                                    transition: 'background 0.2s',
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                  {/* Title & Scope */}
                                  <td style={{ padding: '16px 18px' }}>
                                    <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>
                                      {quiz.title}
                                    </div>
                                    {quiz.title_kinyarwanda && (
                                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        {quiz.title_kinyarwanda}
                                      </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                                      <span
                                        style={{
                                          fontSize: '0.72rem',
                                          padding: '2px 8px',
                                          borderRadius: '4px',
                                          background: 'rgba(255, 255, 255, 0.04)',
                                          color: 'var(--text-secondary)',
                                          border: '1px solid var(--border-subtle)',
                                          fontWeight: 500,
                                        }}
                                      >
                                        Course: {quiz.course_title}
                                      </span>
                                      {quiz.module_title && (
                                        <span
                                          style={{
                                            fontSize: '0.72rem',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: 'rgba(255, 255, 255, 0.04)',
                                            color: 'var(--text-secondary)',
                                            border: '1px solid var(--border-subtle)',
                                            fontWeight: 500,
                                          }}
                                        >
                                          Module: {quiz.module_title}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Status */}
                                  <td style={{ padding: '16px 18px' }}>
                                    <span
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        padding: '3px 8px',
                                        borderRadius: '4px',
                                        background: col.bg,
                                        color: col.text,
                                        border: `1px solid ${col.border}`,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.04em',
                                      }}
                                    >
                                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: col.text }} />
                                      {quiz.status}
                                    </span>
                                  </td>

                                  {/* Availability Window */}
                                  <td style={{ padding: '16px 18px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.78rem' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: quiz.open_date ? '#ffffff' : 'var(--text-muted)' }}>
                                        <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                                        <span>Open: {quiz.open_date ? new Date(quiz.open_date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Immediately'}</span>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: quiz.deadline ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                                        <Clock size={13} style={{ color: 'var(--text-muted)' }} />
                                        <span>Due: {quiz.deadline ? new Date(quiz.deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No deadline'}</span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Rules */}
                                  <td style={{ padding: '16px 18px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
                                      <div style={{ fontWeight: 700, color: '#ffffff' }}>
                                        {quiz.total_score} Pts • Pass {quiz.passing_score}%
                                      </div>
                                      <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                                        {quiz.time_limit_minutes > 0 ? `${quiz.time_limit_minutes} min limit` : 'No time limit'} • {quiz.max_attempts > 0 ? `${quiz.max_attempts} attempt(s)` : 'Unlimited attempts'}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Question count */}
                                  <td style={{ padding: '16px 18px' }}>
                                    <span
                                      style={{
                                        fontWeight: 600,
                                        fontSize: '0.82rem',
                                        color: '#ffffff',
                                        background: 'rgba(255, 255, 255, 0.04)',
                                        padding: '3px 8px',
                                        borderRadius: '4px',
                                        border: '1px solid var(--border-subtle)',
                                      }}
                                    >
                                      {quiz.question_count} Qs
                                    </span>
                                  </td>

                                  {/* Author / Oversight */}
                                  <td style={{ padding: '16px 18px' }}>
                                    {quiz.created_by_detail ? (
                                      <div style={{ fontSize: '0.78rem' }}>
                                        <div style={{ fontWeight: 700, color: '#ffffff' }}>
                                          {quiz.created_by_detail.full_name}
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                                          {quiz.created_by_detail.role.replace('_', ' ')} • {quiz.created_by_detail.phone_number}
                                        </div>
                                      </div>
                                    ) : (
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>System Staff</span>
                                    )}
                                  </td>

                                  {/* Actions */}
                                  <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                      {/* Inspect */}
                                      <button
                                        type="button"
                                        title="Inspect Quiz & Rubric"
                                        onClick={() => setInspectingQuiz(quiz)}
                                        style={{
                                          width: '32px',
                                          height: '32px',
                                          borderRadius: '8px',
                                          border: '1px solid var(--border-subtle)',
                                          background: 'var(--bg-surface-elevated)',
                                          color: 'var(--text-secondary)',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        <Eye size={15} />
                                      </button>

                                      {/* Edit */}
                                      <button
                                        type="button"
                                        title="Edit Quiz"
                                        onClick={() => handleOpenEditQuiz(quiz)}
                                        style={{
                                          width: '32px',
                                          height: '32px',
                                          borderRadius: '8px',
                                          border: '1px solid rgba(59, 130, 246, 0.3)',
                                          background: 'rgba(59, 130, 246, 0.1)',
                                          color: '#60a5fa',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        <Pencil size={14} />
                                      </button>

                                      {/* Publish / Unpublish */}
                                      <button
                                        type="button"
                                        title={quiz.is_published ? 'Unpublish Quiz' : 'Publish Quiz'}
                                        onClick={() => handleTogglePublishQuiz(quiz)}
                                        style={{
                                          width: '32px',
                                          height: '32px',
                                          borderRadius: '8px',
                                          border: quiz.is_published ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--border-subtle)',
                                          background: quiz.is_published ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-surface-elevated)',
                                          color: quiz.is_published ? '#4ade80' : 'var(--text-muted)',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        {quiz.is_published ? <Power size={14} /> : <PowerOff size={14} />}
                                      </button>

                                      {/* Delete */}
                                      <button
                                        type="button"
                                        title="Delete Quiz"
                                        onClick={() => handleDeleteQuiz(quiz)}
                                        style={{
                                          width: '32px',
                                          height: '32px',
                                          borderRadius: '8px',
                                          border: '1px solid rgba(239, 68, 68, 0.3)',
                                          background: 'rgba(239, 68, 68, 0.1)',
                                          color: '#f87171',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 5: TUTORS & LIVE CLASSES                                          */}
          {/* ========================================================================= */}
          {activeSection === 'tutors' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Tutors Directory */}
              <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                    Active Facilitators & Tutors ({tutors.length})
                  </h3>
                </div>

                {tutors.length === 0 ? (
                  <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No tutors registered in the system.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                          <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Tutor Name</th>
                          <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Phone</th>
                          <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Email</th>
                          <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tutors.map((tut) => (
                          <tr key={tut.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ffffff' }}>
                              {tut.full_name || 'Tutor User'}
                            </td>
                            <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                              {tut.phone_number}
                            </td>
                            <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                              {tut.email || '—'}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <Badge variant={tut.status === 'ACTIVE' ? 'success' : 'neutral'}>
                                {tut.status || 'ACTIVE'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Scheduled Live Classes */}
              <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                    Scheduled Live Classes & Cohort Sessions
                  </h3>
                  <button
                    onClick={() => setIsScheduleClassModalOpen(true)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={15} />
                    <span>Schedule Class</span>
                  </button>
                </div>

                {liveClasses.length === 0 ? (
                  <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No live classes currently scheduled. Click "Schedule Class" to dispatch a session.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                          <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Class Title</th>
                          <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Cohort</th>
                          <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Tutor</th>
                          <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Schedule</th>
                          <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                          <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Meeting Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {liveClasses.map((cls) => (
                          <tr key={cls.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ffffff' }}>
                              {cls.title}
                            </td>
                            <td style={{ padding: '14px 16px', color: 'var(--primary-light)' }}>
                              {cls.cohort_name || 'Open Class'}
                            </td>
                            <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                              {cls.tutor_name || 'Unassigned'}
                            </td>
                            <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                              {cls.scheduled_at ? cls.scheduled_at.replace('T', ' ').slice(0, 16) : 'TBD'} ({cls.duration_minutes || 60} min)
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <Badge variant={cls.status === 'COMPLETED' ? 'success' : cls.status === 'SCHEDULED' ? 'info' : 'neutral'}>
                                {cls.status}
                              </Badge>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              {cls.meeting_link || cls.google_meet_url ? (
                                <a
                                  href={cls.meeting_link || cls.google_meet_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#38bdf8', textDecoration: 'underline', fontSize: '0.82rem' }}
                                >
                                  Google Meet
                                </a>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}

      {/* 0a. Create Curriculum Modal */}
      {isCreateCurriculumModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', borderRadius: 'var(--radius-2xl)', padding: '28px', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers size={22} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  {t('admin.courses.createCurriculum')}
                </h3>
              </div>
              <button onClick={() => setIsCreateCurriculumModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCurriculum} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.curriculumCodeLabel')}
                </label>
                <input
                  type="text"
                  placeholder="RW-CURR-CAT-B"
                  value={currCode}
                  onChange={(e) => setCurrCode(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.curriculumTitleLabel')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Category B National Curriculum"
                  value={currTitle}
                  onChange={(e) => setCurrTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.curriculumTitleRwLabel')}
                </label>
                <input
                  type="text"
                  placeholder="Integanyanyigisho y'Icyiciro B"
                  value={currTitleRw}
                  onChange={(e) => setCurrTitleRw(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.curriculumDescLabel')}
                </label>
                <textarea
                  rows={2}
                  placeholder="Curriculum overview and competencies..."
                  value={currDescription}
                  onChange={(e) => setCurrDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.curriculumDescRwLabel')}
                </label>
                <textarea
                  rows={2}
                  placeholder="Ibisobanuro by'integanyanyigisho..."
                  value={currDescriptionRw}
                  onChange={(e) => setCurrDescriptionRw(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsCreateCurriculumModalOpen(false)} className="btn btn-secondary">
                  {t('admin.dashboard.cancel')}
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? '...' : t('admin.courses.createCurriculum')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 0b. Edit Curriculum Modal */}
      {isEditCurriculumModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', borderRadius: 'var(--radius-2xl)', padding: '28px', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Pencil size={22} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  {t('admin.courses.editCurriculum')}
                </h3>
              </div>
              <button onClick={() => setIsEditCurriculumModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateCurriculum} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.curriculumCodeLabel')}
                </label>
                <input
                  type="text"
                  value={currCode}
                  onChange={(e) => setCurrCode(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.curriculumTitleLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={currTitle}
                  onChange={(e) => setCurrTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.curriculumTitleRwLabel')}
                </label>
                <input
                  type="text"
                  value={currTitleRw}
                  onChange={(e) => setCurrTitleRw(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.curriculumDescLabel')}
                </label>
                <textarea
                  rows={2}
                  value={currDescription}
                  onChange={(e) => setCurrDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.curriculumDescRwLabel')}
                </label>
                <textarea
                  rows={2}
                  value={currDescriptionRw}
                  onChange={(e) => setCurrDescriptionRw(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsEditCurriculumModalOpen(false)} className="btn btn-secondary">
                  {t('admin.dashboard.cancel')}
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? '...' : t('admin.courses.saveChanges')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Create Course Modal */}
      {isCreateCourseModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', borderRadius: 'var(--radius-2xl)', padding: '28px', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={22} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>Create New Course</h3>
              </div>
              <button onClick={() => setIsCreateCourseModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.selectCurriculum')}
                </label>
                <select
                  value={courseCurriculumId}
                  onChange={(e) => setCourseCurriculumId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                >
                  <option value="">-- {t('admin.courses.selectCurriculum')} --</option>
                  {curricula.map((curr) => (
                    <option key={curr.id} value={curr.id}>
                      {curr.code ? `[${curr.code}] ` : ''}{language === 'rw' && curr.title_kinyarwanda ? curr.title_kinyarwanda : curr.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Course Code</label>
                <input
                  type="text"
                  placeholder="RW-TH-01"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Title (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="Rwandan Highway Code & Traffic Rules"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Title (Kinyarwanda)</label>
                <input
                  type="text"
                  placeholder="Amategeko y'Umuhanda mu Rwanda"
                  value={courseTitleRw}
                  onChange={(e) => setCourseTitleRw(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Course syllabus and preparation..."
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsCreateCourseModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">{isSubmitting ? 'Creating...' : 'Create Course'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Course Modal */}
      {isEditCourseModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', borderRadius: 'var(--radius-2xl)', padding: '28px', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Pencil size={22} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>Edit Course Details</h3>
              </div>
              <button onClick={() => setIsEditCourseModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.selectCurriculum')}
                </label>
                <select
                  value={courseCurriculumId}
                  onChange={(e) => setCourseCurriculumId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                >
                  <option value="">-- {t('admin.courses.selectCurriculum')} --</option>
                  {curricula.map((curr) => (
                    <option key={curr.id} value={curr.id}>
                      {curr.code ? `[${curr.code}] ` : ''}{language === 'rw' && curr.title_kinyarwanda ? curr.title_kinyarwanda : curr.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Course Code</label>
                <input
                  type="text"
                  placeholder="RW-TH-01"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Title (English) *</label>
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Title (Kinyarwanda)</label>
                <input
                  type="text"
                  value={courseTitleRw}
                  onChange={(e) => setCourseTitleRw(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Estimated Hours</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={courseHours}
                  onChange={(e) => setCourseHours(parseInt(e.target.value) || 10)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Description</label>
                <textarea
                  rows={3}
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsEditCourseModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Create Cohort Modal */}
      {isCreateCohortModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', borderRadius: 'var(--radius-2xl)', padding: '28px', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GraduationCap size={22} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>Create New Cohort</h3>
              </div>
              <button onClick={() => setIsCreateCohortModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCohort} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Cohort Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Kigali Morning Batch - October 2026"
                  value={newCohortName}
                  onChange={(e) => setNewCohortName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Cohort Code</label>
                <input
                  type="text"
                  placeholder="COH-2026-OCT-AM"
                  value={newCohortCode}
                  onChange={(e) => setNewCohortCode(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newCohortStart}
                    onChange={(e) => setNewCohortStart(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>End Date *</label>
                  <input
                    type="date"
                    required
                    value={newCohortEnd}
                    onChange={(e) => setNewCohortEnd(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Max Capacity</label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={newCohortCapacity}
                    onChange={(e) => setNewCohortCapacity(parseInt(e.target.value) || 50)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Schedule Description</label>
                  <input
                    type="text"
                    placeholder="Mon, Wed, Fri 09:00 - 11:00 CAT"
                    value={newCohortSchedule}
                    onChange={(e) => setNewCohortSchedule(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsCreateCohortModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">{isSubmitting ? 'Creating...' : 'Create Cohort'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Assign Tutors to Cohort Modal */}
      {isAssignTutorModalOpen && selectedCohortForTutors && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '620px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-2xl)', padding: '26px', border: '1px solid var(--border-medium)', background: 'var(--bg-surface)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: '#ffffff' }}>
                    Assign Tutors to Cohort
                  </h3>
                  <Badge variant={selectedCohortForTutors.is_active ? 'success' : 'neutral'}>
                    {selectedCohortForTutors.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Cohort: <strong style={{ color: '#ffffff' }}>{selectedCohortForTutors.name}</strong> ({selectedCohortForTutors.code || 'COHORT'}) • Select tutors from the list below.
                </p>
              </div>
              <button
                onClick={() => setIsAssignTutorModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                title="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search & Bulk Select Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search tutors by name, phone, email..."
                  value={tutorModalSearch}
                  onChange={(e) => setTutorModalSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleSelectAllFilteredTutors(filteredModalTutors.map((t) => t.id))}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.74rem', padding: '5px 10px' }}
                  title="Select all matching tutors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => handleDeselectAllFilteredTutors(filteredModalTutors.map((t) => t.id))}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.74rem', padding: '5px 10px' }}
                  title="Deselect all matching tutors"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Selection Counter Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', marginBottom: '12px', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                Selected: <strong style={{ color: 'var(--primary-light)' }}>{selectedTutorIdsForCohort.length}</strong> of {tutors.length} tutors
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                Click tutor row or checkbox to toggle
              </span>
            </div>

            {/* Scrollable Tutor Selection List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '360px', paddingRight: '4px' }}>
              {filteredModalTutors.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                  {tutors.length === 0 ? 'No tutors registered in the system directory.' : 'No tutors match your search.'}
                </div>
              ) : (
                filteredModalTutors.map((tut) => {
                  const isSelected = selectedTutorIdsForCohort.includes(tut.id);
                  const isOriginallyAssigned = (selectedCohortForTutors.assigned_tutors || []).some((at) => at.id === tut.id);

                  return (
                    <div
                      key={tut.id}
                      onClick={() => handleToggleTutorSelection(tut.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-lg)',
                        cursor: 'pointer',
                        userSelect: 'none',
                        background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-surface-elevated)',
                        border: isSelected ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid var(--border-subtle)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isSelected ? (
                            <CheckSquare size={19} color="#38bdf8" />
                          ) : (
                            <Square size={19} color="var(--text-muted)" />
                          )}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, color: isSelected ? '#ffffff' : 'var(--text-primary)', fontSize: '0.88rem' }}>
                              {tut.full_name || 'Tutor'}
                            </span>
                            {isOriginallyAssigned && (
                              <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 600 }}>
                                Currently Assigned
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                            {tut.phone_number} {tut.email ? `• ${tut.email}` : ''}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: isSelected ? '#38bdf8' : 'var(--text-muted)' }}>
                        {isSelected ? 'Selected' : 'Click to select'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => setIsAssignTutorModalOpen(false)}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveCohortTutors}
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size={16} />
                    <span>Saving Assignments...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Save Tutor Assignments ({selectedTutorIdsForCohort.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Assign / Change Student Cohort Modal */}
      {isChangeCohortModalOpen && selectedLearner && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', borderRadius: 'var(--radius-2xl)', padding: '28px', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  Assign Cohort for Learner
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedLearner.full_name || selectedLearner.phone_number} ({selectedLearner.role})
                </p>
              </div>
              <button onClick={() => setIsChangeCohortModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStudentCohort} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Select Target Cohort
                </label>
                <select
                  value={targetCohortId}
                  onChange={(e) => setTargetCohortId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                  }}
                >
                  <option value="">-- Unassigned (Remove from Cohort) --</option>
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code || 'COHORT'}) — {c.student_count || 0}/{c.max_capacity || 50} enrolled
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsChangeCohortModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Saving...' : 'Save Cohort Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5b. Assign Tutor to Student Modal */}
      {isStudentTutorModalOpen && selectedLearner && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', borderRadius: 'var(--radius-2xl)', padding: '28px', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  Assign Personal Tutor
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedLearner.full_name || selectedLearner.phone_number} ({selectedLearner.role})
                </p>
              </div>
              <button onClick={() => setIsStudentTutorModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStudentTutor} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Select Assigned Tutor
                </label>
                <select
                  value={targetStudentTutorId}
                  onChange={(e) => setTargetStudentTutorId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                  }}
                >
                  <option value="">-- No Tutor (Unassign) --</option>
                  {tutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name || 'Tutor'} ({t.phone_number})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsStudentTutorModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Saving...' : 'Save Tutor Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5c. Enroll / Add Student Modal */}
      {isEnrollStudentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', borderRadius: 'var(--radius-2xl)', padding: '28px', border: '1px solid var(--border-medium)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserPlus size={22} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  Enroll New Student
                </h3>
              </div>
              <button onClick={() => setIsEnrollStudentModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEnrollStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jean"
                    value={newStudentFirstName}
                    onChange={(e) => setNewStudentFirstName(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Mugabo"
                    value={newStudentLastName}
                    onChange={(e) => setNewStudentLastName(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Phone Number (+250) *</label>
                <input
                  type="text"
                  required
                  placeholder="+250788123456"
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.88rem', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="student@example.rw"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Initial Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Student@123"
                    value={newStudentPassword}
                    onChange={(e) => setNewStudentPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Role</label>
                  <select
                    value={newStudentRole}
                    onChange={(e) => setNewStudentRole(e.target.value as any)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.88rem' }}
                  >
                    <option value="STUDENT">Student (Full LMS Access)</option>
                    <option value="GUEST">Guest (Free Materials Only)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Assign Cohort (Optional)</label>
                  <select
                    value={newStudentCohortId}
                    onChange={(e) => setNewStudentCohortId(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.88rem' }}
                  >
                    <option value="">-- No Initial Cohort --</option>
                    {cohorts.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code || 'COHORT'})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Assign Personal Tutor (Optional)</label>
                <select
                  value={newStudentTutorId}
                  onChange={(e) => setNewStudentTutorId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.88rem' }}
                >
                  <option value="">-- No Initial Tutor --</option>
                  {tutors.map((t) => (
                    <option key={t.id} value={t.id}>{t.full_name || 'Tutor'} ({t.phone_number})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsEnrollStudentModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isSubmitting ? <Spinner size={16} /> : <UserPlus size={16} />}
                  <span>{isSubmitting ? 'Enrolling...' : 'Enroll Student'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5d. View Student Details Modal */}
      {isStudentDetailsModalOpen && studentDetailsUser && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '560px', borderRadius: 'var(--radius-2xl)', padding: '28px', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: studentDetailsUser.role === 'STUDENT' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                    color: studentDetailsUser.role === 'STUDENT' ? '#38bdf8' : '#a855f7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                  }}
                >
                  {(studentDetailsUser.full_name || studentDetailsUser.phone_number).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                    {studentDetailsUser.full_name || 'Anonymous User'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                    <Badge variant={studentDetailsUser.role === 'STUDENT' ? 'info' : 'neutral'}>
                      {studentDetailsUser.role}
                    </Badge>
                    <Badge variant={studentDetailsUser.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {studentDetailsUser.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsStudentDetailsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
              {/* Student ID */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Student ID</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>
                  {studentDetailsUser.student_id || 'Not Assigned'}
                </span>
              </div>

              {/* Phone & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Phone Number</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#ffffff' }}>{studentDetailsUser.phone_number}</div>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Email Address</div>
                  <div style={{ fontWeight: 600, color: '#ffffff' }}>{studentDetailsUser.email || 'None on file'}</div>
                </div>
              </div>

              {/* Cohort & Tutor */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Enrolled Cohort</div>
                  <div style={{ fontWeight: 700, color: studentDetailsUser.cohort_name ? '#38bdf8' : 'var(--text-muted)' }}>
                    {studentDetailsUser.cohort_name || 'Unassigned'}
                  </div>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Assigned Tutor</div>
                  <div style={{ fontWeight: 700, color: studentDetailsUser.assigned_tutor_name ? '#a78bfa' : 'var(--text-muted)' }}>
                    {studentDetailsUser.assigned_tutor_name || 'No Tutor Assigned'}
                  </div>
                </div>
              </div>

              {/* Registration Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Registered On</span>
                <span style={{ color: '#ffffff' }}>
                  {studentDetailsUser.created_at ? new Date(studentDetailsUser.created_at).toLocaleDateString() : '—'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => {
                  setIsStudentDetailsModalOpen(false);
                  handleOpenChangeCohort(studentDetailsUser);
                }}
                className="btn btn-secondary btn-sm"
              >
                <ArrowRightLeft size={13} />
                <span>Change Cohort</span>
              </button>
              <button
                onClick={() => {
                  setIsStudentDetailsModalOpen(false);
                  handleOpenStudentTutorModal(studentDetailsUser);
                }}
                className="btn btn-secondary btn-sm"
              >
                <UserCheck size={13} />
                <span>Change Tutor</span>
              </button>
              <button
                type="button"
                onClick={() => setIsStudentDetailsModalOpen(false)}
                className="btn btn-primary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Schedule Live Class Modal */}
      {isScheduleClassModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', borderRadius: 'var(--radius-2xl)', padding: '28px', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Video size={22} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>Schedule Live Class</h3>
              </div>
              <button onClick={() => setIsScheduleClassModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleClass} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Class Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Priority Rules & Defensive Driving Q&A"
                  value={classTitle}
                  onChange={(e) => setClassTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Target Cohort</label>
                  <select
                    value={classCohortId}
                    onChange={(e) => setClassCohortId(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                  >
                    <option value="">Open Platform (All Cohorts)</option>
                    {cohorts.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Assigned Tutor</label>
                  <select
                    value={classTutorId}
                    onChange={(e) => setClassTutorId(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                  >
                    <option value="">-- Choose Tutor --</option>
                    {tutors.map((tut) => (
                      <option key={tut.id} value={tut.id}>{tut.full_name || tut.phone_number}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Scheduled Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={classScheduledAt}
                    onChange={(e) => setClassScheduledAt(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Duration (min)</label>
                  <input
                    type="number"
                    min={15}
                    max={240}
                    value={classDuration}
                    onChange={(e) => setClassDuration(parseInt(e.target.value) || 60)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Google Meet / Meeting Link</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={classMeetingLink}
                  onChange={(e) => setClassMeetingLink(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsScheduleClassModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">{isSubmitting ? 'Scheduling...' : 'Schedule Class'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Module Create / Edit Modal */}
      {isModuleModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', borderRadius: 'var(--radius-2xl)', padding: '28px', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Layers size={22} color="var(--primary)" />
              <h3 style={{ margin: 0 }}>
                {editingModuleId
                  ? t('admin.courses.modalEditModule')
                  : t('admin.courses.modalCreateModule')}
              </h3>
            </div>

            <form onSubmit={handleSaveModule} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.moduleTitleLabel')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('admin.courses.moduleTitlePlaceholder')}
                  value={modTitle}
                  onChange={(e) => setModTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.moduleDescLabel')}
                </label>
                <textarea
                  rows={3}
                  placeholder={t('admin.courses.moduleDescPlaceholder')}
                  value={modDescription}
                  onChange={(e) => setModDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('admin.courses.moduleSortOrderLabel')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={modSortOrder}
                    onChange={(e) => setModSortOrder(parseInt(e.target.value) || 1)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                  />
                </div>

                <div style={{ marginTop: '22px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', color: '#ffffff' }}>
                    <input
                      type="checkbox"
                      checked={modIsFoundational}
                      onChange={(e) => setModIsFoundational(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span>{t('admin.courses.moduleFoundationalLabel')}</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModuleModalOpen(false)} className="btn btn-secondary">
                  {t('admin.courses.cancelBtn')}
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting
                    ? t('admin.courses.saving')
                    : editingModuleId
                    ? t('admin.courses.saveChanges')
                    : t('admin.courses.createModuleBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Lesson Create / Edit Modal with Text, Audio, Video, Road Sign */}
      {isLessonModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', borderRadius: 'var(--radius-2xl)', padding: '28px', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <BookOpen size={22} color="var(--primary)" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  {editingLessonId
                    ? t('admin.courses.modalEditLesson')
                    : t('admin.courses.modalAddLesson')}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {t('admin.courses.modulePrefix')} {selectedModule?.title}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveLesson} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('admin.courses.lessonTitleLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('admin.courses.lessonTitlePlaceholder')}
                    value={lesTitle}
                    onChange={(e) => setLesTitle(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('admin.courses.materialTypeLabel')}
                  </label>
                  <select
                    value={lesType}
                    onChange={(e) => setLesType(e.target.value as any)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                  >
                    <option value="TEXT">
                      {t('admin.courses.typeText')}
                    </option>
                    <option value="AUDIO">
                      {t('admin.courses.typeAudio')}
                    </option>
                    <option value="VIDEO">
                      {t('admin.courses.typeVideo')}
                    </option>
                    <option value="ROAD_SIGN">
                      {t('admin.courses.typeRoadSign')}
                    </option>
                    <option value="QUIZ">
                      {t('admin.courses.typeQuiz')}
                    </option>
                  </select>
                </div>
              </div>

              {/* Dynamic Type Fields */}
              {lesType === 'TEXT' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('admin.courses.lessonTextLabel')}
                  </label>
                  <textarea
                    rows={8}
                    required
                    placeholder={t('admin.courses.lessonTextPlaceholder')}
                    value={lesContentText}
                    onChange={(e) => setLesContentText(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical', fontFamily: 'sans-serif' }}
                  />
                </div>
              )}

              {lesType === 'AUDIO' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('admin.courses.uploadAudioLabel')}
                    </label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setLesMediaFile(file);
                      }}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                    />
                  </div>

                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                    {t('admin.courses.orAudioStream')}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('admin.courses.audioStreamUrlLabel')}
                    </label>
                    <input
                      type="url"
                      placeholder="https://cdn.example.com/audio/lesson-01.mp3"
                      value={lesMediaUrl}
                      onChange={(e) => setLesMediaUrl(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('admin.courses.audioTranscriptLabel')}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={t('admin.courses.audioTranscriptPlaceholder')}
                      value={lesContentText}
                      onChange={(e) => setLesContentText(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical' }}
                    />
                  </div>
                </div>
              )}

              {lesType === 'VIDEO' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('admin.courses.uploadVideoLabel')}
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setLesMediaFile(file);
                      }}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                    />
                  </div>

                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                    {t('admin.courses.orVideoStream')}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('admin.courses.videoStreamUrlLabel')}
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=... or https://cdn.example.com/video.mp4"
                      value={lesMediaUrl}
                      onChange={(e) => setLesMediaUrl(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('admin.courses.videoNotesLabel')}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={t('admin.courses.videoNotesPlaceholder')}
                      value={lesContentText}
                      onChange={(e) => setLesContentText(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical' }}
                    />
                  </div>
                </div>
              )}

              {lesType === 'ROAD_SIGN' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('admin.courses.chooseRoadSignLabel')}
                    </label>
                    <select
                      value={lesRoadSignId}
                      onChange={(e) => setLesRoadSignId(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                    >
                      <option value="">{t('admin.courses.chooseRoadSignPlaceholder')}</option>
                      {roadSignsList.map((rs: any) => (
                        <option key={rs.id} value={rs.id}>
                          {rs.code ? `[${rs.code}] ` : ''}{rs.name || rs.title || 'Road Sign'} ({rs.category || 'General'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('admin.courses.roadSignDescriptionLabel')}
                    </label>
                    <textarea
                      rows={4}
                      placeholder={t('admin.courses.roadSignDescriptionPlaceholder')}
                      value={lesContentText}
                      onChange={(e) => setLesContentText(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical' }}
                    />
                  </div>
                </div>
              )}

              {lesType === 'QUIZ' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('admin.courses.quizInstructionsLabel')}
                  </label>
                  <textarea
                    rows={4}
                    placeholder={t('admin.courses.quizInstructionsPlaceholder')}
                    value={lesContentText}
                    onChange={(e) => setLesContentText(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical' }}
                  />
                </div>
              )}

              {/* Common Lesson Settings */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('admin.courses.estDurationLabel')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={lesDurationMinutes}
                    onChange={(e) => setLesDurationMinutes(parseInt(e.target.value) || 15)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('admin.courses.sortOrderLabel')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={lesSortOrder}
                    onChange={(e) => setLesSortOrder(parseInt(e.target.value) || 1)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '10px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', color: '#ffffff' }}>
                  <input
                    type="checkbox"
                    checked={lesIsFreePreview}
                    onChange={(e) => setLesIsFreePreview(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span>{t('admin.courses.freePreviewLabel')}</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', color: '#ffffff' }}>
                  <input
                    type="checkbox"
                    checked={lesIsStudentOnly}
                    onChange={(e) => setLesIsStudentOnly(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span>{t('admin.courses.studentOnlyLabel')}</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsLessonModalOpen(false)} className="btn btn-secondary">
                  {t('admin.courses.cancelBtn')}
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting
                    ? t('admin.courses.saving')
                    : editingLessonId
                    ? t('admin.courses.saveChanges')
                    : t('admin.courses.createLessonBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. Quiz Builder Modal (Multi-tab: Settings, Question Composer, Rubric)   */}
      {/* ========================================================================= */}
      {isQuizModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '860px', maxHeight: '92vh', overflowY: 'auto', borderRadius: 'var(--radius-2xl)', padding: '28px', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
                  <ListChecks size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                    {isEditQuizMode ? t('admin.courses.editQuiz') : t('admin.courses.createQuiz')}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsQuizModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setQuizActiveTab('settings')}
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: quizActiveTab === 'settings' ? '2px solid var(--primary-color)' : '2px solid transparent',
                  color: quizActiveTab === 'settings' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Sliders size={15} />
                <span>{t('admin.courses.tabSettings')}</span>
              </button>

              <button
                type="button"
                onClick={() => setQuizActiveTab('questions')}
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: quizActiveTab === 'questions' ? '2px solid var(--primary-color)' : '2px solid transparent',
                  color: quizActiveTab === 'questions' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <HelpCircle size={15} />
                <span>{t('admin.courses.tabQuestions')}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                  }}
                >
                  {quizItems.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setQuizActiveTab('rubric')}
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: quizActiveTab === 'rubric' ? '2px solid var(--primary-color)' : '2px solid transparent',
                  color: quizActiveTab === 'rubric' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <FileCheck size={15} />
                <span>{t('admin.courses.tabRubric')}</span>
              </button>
            </div>

            {/* TAB 1: SETTINGS & SCHEDULE */}
            {quizActiveTab === 'settings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Target Course *
                    </label>
                    <select
                      value={quizCourseId}
                      onChange={(e) => handleCourseChangeInQuiz(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                    >
                      <option value="">-- Choose Course --</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Target Module (Optional)
                    </label>
                    <select
                      value={quizModuleId}
                      onChange={(e) => setQuizModuleId(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                    >
                      <option value="">-- Course-wide (No specific module) --</option>
                      {quizAvailableModules.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('admin.courses.quizTitle')} *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Priority Rules & Intersection Knowledge Check"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('admin.courses.quizTitleRw')}
                    </label>
                    <input
                      type="text"
                      placeholder="Umutwe w'isuzuma mu Kinyarwanda..."
                      value={quizTitleRw}
                      onChange={(e) => setQuizTitleRw(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('admin.courses.quizDescription')}
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Summary and goals of this quiz assessment..."
                      value={quizDescription}
                      onChange={(e) => setQuizDescription(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('admin.courses.quizDescriptionRw')}
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ibisobanuro by'isuzuma mu Kinyarwanda..."
                      value={quizDescriptionRw}
                      onChange={(e) => setQuizDescriptionRw(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical' }}
                    />
                  </div>
                </div>

                {/* Scheduling */}
                <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={15} style={{ color: '#60a5fa' }} />
                    <span>Availability Window & Deadlines</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        {t('admin.courses.openDate')}
                      </label>
                      <input
                        type="datetime-local"
                        value={quizOpenDate}
                        onChange={(e) => setQuizOpenDate(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        If left blank, quiz opens immediately upon publishing.
                      </span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        {t('admin.courses.deadline')}
                      </label>
                      <input
                        type="datetime-local"
                        value={quizDeadline}
                        onChange={(e) => setQuizDeadline(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        Optional: submissions after this timestamp are blocked.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantitative Rules */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {t('admin.courses.timeLimit')}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={quizTimeLimit}
                      onChange={(e) => setQuizTimeLimit(parseInt(e.target.value) || 0)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>0 = unlimited</span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {t('admin.courses.totalScore')}
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`${calculatedTotalScore} pts`}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        cursor: 'not-allowed',
                        opacity: 0.9,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {t('admin.courses.passingScore')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={quizPassingScore}
                      onChange={(e) => setQuizPassingScore(parseInt(e.target.value) || 70)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {t('admin.courses.maxAttempts')}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={quizMaxAttempts}
                      onChange={(e) => setQuizMaxAttempts(parseInt(e.target.value) || 1)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff' }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>0 = unlimited</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="quizShuffleCheckbox"
                    checked={quizShuffle}
                    onChange={(e) => setQuizShuffle(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="quizShuffleCheckbox" style={{ fontSize: '0.84rem', color: '#ffffff', cursor: 'pointer' }}>
                    {t('admin.courses.shuffleQuestions')}
                  </label>
                </div>
              </div>
            )}

            {/* TAB 2: QUESTION COMPOSER */}
            {quizActiveTab === 'questions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Control bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '14px 18px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{quizItems.length} Question{quizItems.length === 1 ? '' : 's'} Configured</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                        Total Score: {calculatedTotalScore} pts
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBankQuestionIds([]);
                        setBankPickerSearch('');
                        setIsBankPickerModalOpen(true);
                        if (questions.length === 0) {
                          fetchBankQuestions();
                        }
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={14} />
                      <span>{t('admin.courses.fromBank')}</span>
                    </button>

                    {/* Scratch authoring button: only rendered for Training Admin */}
                    {isTrainingAdmin && (
                      <button
                        type="button"
                        onClick={() => setIsAddingScratchQuestion(true)}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Sparkles size={14} />
                        <span>{t('admin.courses.scratchQuestion')}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Items List */}
                {quizItems.length === 0 ? (
                  <div style={{ padding: '48px 24px', textAlign: 'center', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-medium)', background: 'rgba(255,255,255,0.01)' }}>
                    <HelpCircle size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
                    <h5 style={{ margin: '0 0 6px 0', fontSize: '0.96rem', fontWeight: 700, color: '#ffffff' }}>
                      No questions attached yet
                    </h5>
                    <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Assemble this quiz by pulling questions from the bank{isTrainingAdmin ? ' or authoring custom ones from scratch' : ''}.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setIsBankPickerModalOpen(true)}
                        className="btn btn-secondary btn-sm"
                      >
                        Select from Bank
                      </button>
                      {isTrainingAdmin && (
                        <button
                          type="button"
                          onClick={() => setIsAddingScratchQuestion(true)}
                          className="btn btn-primary btn-sm"
                        >
                          Author from Scratch
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                    {quizItems.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '16px',
                          borderRadius: 'var(--radius-lg)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        {/* Item Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                              #{idx + 1}
                            </span>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-subtle)',
                              }}
                            >
                              {item.original_question ? 'From Bank' : 'Custom Question'}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Domain: {item.domain || 'PRIORITY'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Points:</label>
                              <input
                                type="number"
                                min={1}
                                max={1000}
                                value={item.points || 1}
                                onChange={(e) => {
                                  const val = Math.max(1, parseInt(e.target.value) || 1);
                                  setQuizItems(prev => prev.map((q, qIdx) => qIdx === idx ? { ...q, points: val } : q));
                                }}
                                style={{ width: '56px', padding: '3px 6px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontWeight: 700, fontSize: '0.84rem', textAlign: 'center' }}
                              />
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>pts</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setQuizItems(prev => prev.filter((_, qIdx) => qIdx !== idx))}
                              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', transition: 'color 0.15s' }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                              title="Remove Question"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Prompt */}
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff' }}>
                          {item.question_text}
                        </div>
                        {item.question_text_kinyarwanda && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {item.question_text_kinyarwanda}
                          </div>
                        )}

                        {/* Options preview - minimalist Canvas style */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.78rem' }}>
                          {['A', 'B', 'C', 'D'].map((optKey) => {
                            const optText = (item as any)[`option_${optKey.toLowerCase()}`];
                            if (!optText) return null;
                            const isCorrect = item.correct_option === optKey;
                            return (
                              <div
                                key={optKey}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  background: isCorrect ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.02)',
                                  border: isCorrect ? '1px solid var(--border-medium)' : '1px solid var(--border-subtle)',
                                  color: isCorrect ? '#ffffff' : 'var(--text-secondary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontWeight: isCorrect ? 600 : 400,
                                }}
                              >
                                <span style={{ fontWeight: 700 }}>{optKey}.</span>
                                <span style={{ flex: 1 }}>{optText}</span>
                                {isCorrect && <Check size={12} style={{ color: 'var(--text-secondary)' }} />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: RUBRIC & SCORING GUIDELINES */}
            {quizActiveTab === 'rubric' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('admin.courses.rubric')}
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Comprehensive grading rubric, evaluation criteria, time allocation advice, and guidelines..."
                    value={quizRubric}
                    onChange={(e) => setQuizRubric(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('admin.courses.rubricRw')}
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Amabwiriza n'ibipimo by'amanota mu Kinyarwanda..."
                    value={quizRubricRw}
                    onChange={(e) => setQuizRubricRw(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', resize: 'vertical' }}
                  />
                </div>

                {/* Pre-flight Review Summary */}
                <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.88rem', marginBottom: '10px' }}>
                    Quiz Summary Review
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.8rem' }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>Questions:</span> <strong style={{ color: '#ffffff' }}>{quizItems.length} items</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Total Score:</span> <strong style={{ color: '#ffffff' }}>{calculatedTotalScore} pts</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Passing:</span> <strong style={{ color: '#ffffff' }}>{quizPassingScore}%</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Time Limit:</span> <strong style={{ color: '#ffffff' }}>{quizTimeLimit > 0 ? `${quizTimeLimit} mins` : 'Unlimited'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Open Date:</span> <strong style={{ color: '#ffffff' }}>{quizOpenDate ? new Date(quizOpenDate).toLocaleDateString() : 'Immediate'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Deadline:</span> <strong style={{ color: '#ffffff' }}>{quizDeadline ? new Date(quizDeadline).toLocaleDateString() : 'None'}</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setIsQuizModalOpen(false)}
                className="btn btn-secondary"
              >
                {t('admin.courses.cancelBtn')}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {quizActiveTab !== 'settings' && (
                  <button
                    type="button"
                    onClick={() => setQuizActiveTab(quizActiveTab === 'rubric' ? 'questions' : 'settings')}
                    className="btn btn-secondary"
                  >
                    Previous
                  </button>
                )}

                {quizActiveTab !== 'rubric' ? (
                  <button
                    type="button"
                    onClick={() => setQuizActiveTab(quizActiveTab === 'settings' ? 'questions' : 'rubric')}
                    className="btn btn-primary"
                  >
                    Next Tab
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSavingQuiz}
                    onClick={handleSaveQuiz}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontWeight: 800 }}
                  >
                    {isSavingQuiz ? (
                      <>
                        <Spinner size={16} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>{isEditQuizMode ? 'Update Quiz' : 'Finalize & Save Quiz'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. Question Bank Picker Modal (Multi-select from central question pool) */}
      {/* ========================================================================= */}
      {isBankPickerModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', maxHeight: '88vh', overflowY: 'auto', borderRadius: 'var(--radius-2xl)', padding: '24px', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  {t('admin.courses.selectBankQuestions')}
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Choose 1, 5, 20, or any number of questions to link to this course quiz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBankPickerModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter bank items..."
                  value={bankPickerSearch}
                  onChange={(e) => setBankPickerSearch(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem' }}
                />
              </div>

              <select
                value={bankPickerDomain}
                onChange={(e) => setBankPickerDomain(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem' }}
              >
                <option value="ALL">All Domains</option>
                <option value="PRIORITY">Priority Rules</option>
                <option value="SIGNAGE">Road Signs</option>
                <option value="SPEED">Speed Limits</option>
                <option value="LEGAL">Legal Framework</option>
                <option value="SAFETY">Vehicle Safety</option>
                <option value="PARKING">Parking & Stopping</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  const allVisibleIds = filteredBankPickerQuestions.map(q => q.id);
                  if (selectedBankQuestionIds.length === allVisibleIds.length) {
                    setSelectedBankQuestionIds([]);
                  } else {
                    setSelectedBankQuestionIds(allVisibleIds);
                  }
                }}
                className="btn btn-secondary btn-sm"
              >
                {selectedBankQuestionIds.length === filteredBankPickerQuestions.length && filteredBankPickerQuestions.length > 0
                  ? 'Deselect All'
                  : 'Select All Visible'}
              </button>
            </div>

            {/* Questions list with checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '440px', overflowY: 'auto' }}>
              {isLoadingBankQuestions ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-secondary)' }}>
                  <Spinner size={24} />
                  <p style={{ margin: '12px 0 0', fontSize: '0.85rem' }}>Loading questions from Question Bank...</p>
                </div>
              ) : filteredBankPickerQuestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-secondary)' }}>
                  <HelpCircle size={36} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                  <p style={{ margin: '0 0 6px', fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>
                    {questions.length === 0 ? 'No questions loaded from Question Bank' : 'No questions match the current filter or search'}
                  </p>
                  <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {questions.length === 0 ? 'Click below to fetch the Question Bank questions.' : 'Try adjusting your search keywords or domain selection.'}
                  </p>
                  {questions.length === 0 && (
                    <button
                      type="button"
                      onClick={fetchBankQuestions}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <RefreshCw size={14} />
                      <span>Fetch Question Bank</span>
                    </button>
                  )}
                </div>
              ) : (
                filteredBankPickerQuestions.slice(0, 300).map((q) => {
                  const isSelected = selectedBankQuestionIds.includes(q.id);
                  const qText = q.question_text || q.question_text_rw || q.question_text_kinyarwanda || '';
                  const qRw = q.question_text_rw || q.question_text_kinyarwanda || '';
                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        setSelectedBankQuestionIds(prev =>
                          prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id]
                        );
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'var(--bg-surface-elevated)',
                        border: isSelected ? '1px solid var(--border-medium)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ paddingTop: '2px' }}>
                        {isSelected ? <CheckSquare size={16} color="#ffffff" /> : <Square size={16} color="var(--text-muted)" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            #{q.question_number || 'Bank'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {q.domain || 'PRIORITY'} • {q.difficulty || 'MEDIUM'}
                          </span>
                          {q.correct_option && (
                            <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', fontWeight: 600 }}>
                              Answer: Option {q.correct_option}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.4 }}>
                          {qText}
                        </div>
                        {qRw && qText !== qRw && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>
                            {qRw}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <span style={{ color: q.correct_option === 'A' ? '#ffffff' : 'var(--text-muted)', fontWeight: q.correct_option === 'A' ? 600 : 400 }}>A: {q.option_a || q.option_a_rw}</span>
                          <span style={{ color: q.correct_option === 'B' ? '#ffffff' : 'var(--text-muted)', fontWeight: q.correct_option === 'B' ? 600 : 400 }}>B: {q.option_b || q.option_b_rw}</span>
                          {(q.option_c || q.option_c_rw) && <span style={{ color: q.correct_option === 'C' ? '#ffffff' : 'var(--text-muted)', fontWeight: q.correct_option === 'C' ? 600 : 400 }}>C: {q.option_c || q.option_c_rw}</span>}
                          {(q.option_d || q.option_d_rw) && <span style={{ color: q.correct_option === 'D' ? '#ffffff' : 'var(--text-muted)', fontWeight: q.correct_option === 'D' ? 600 : 400 }}>D: {q.option_d || q.option_d_rw}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <strong>{selectedBankQuestionIds.length}</strong> question(s) selected
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsBankPickerModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedBankQuestionIds.length === 0}
                  onClick={() => {
                    const chosen = questions.filter(q => selectedBankQuestionIds.includes(q.id));
                    handleAddBankQuestionsToQuiz(chosen);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Add {selectedBankQuestionIds.length} to Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. Scratch Question Modal (Training Admin full pedagogical flexibility)  */}
      {/* ========================================================================= */}
      {isAddingScratchQuestion && isTrainingAdmin && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', borderRadius: 'var(--radius-2xl)', padding: '24px', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  {t('admin.courses.scratchQuestion')}
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Compose custom question prompt, options, correct answers, and feedback explanation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingScratchQuestion(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Question Prompt (English) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. When approaching a roundabout without priority signage, who has the right of way?"
                  value={scratchQuestionText}
                  onChange={(e) => setScratchQuestionText(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Question Prompt (Kinyarwanda)
                </label>
                <input
                  type="text"
                  placeholder="Ikibazo mu Kinyarwanda..."
                  value={scratchQuestionTextRw}
                  onChange={(e) => setScratchQuestionTextRw(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
                />
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Multiple-Choice Options & Correct Answer
                </label>
                {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                  <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: scratchCorrectOption === opt ? '#ffffff' : 'var(--text-muted)', width: '60px' }}>
                      <input
                        type="radio"
                        name="correctScratchOpt"
                        checked={scratchCorrectOption === opt}
                        onChange={() => setScratchCorrectOption(opt)}
                      />
                      <span>Opt {opt}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={`Option ${opt} (English)...`}
                      value={
                        opt === 'A' ? scratchOptionA :
                        opt === 'B' ? scratchOptionB :
                        opt === 'C' ? scratchOptionC : scratchOptionD
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (opt === 'A') setScratchOptionA(val);
                        else if (opt === 'B') setScratchOptionB(val);
                        else if (opt === 'C') setScratchOptionC(val);
                        else setScratchOptionD(val);
                      }}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: scratchCorrectOption === opt ? '1px solid var(--border-medium)' : '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem' }}
                    />
                    <input
                      type="text"
                      placeholder={`Option ${opt} (Kinyarwanda)...`}
                      value={
                        opt === 'A' ? scratchOptionARw :
                        opt === 'B' ? scratchOptionBRw :
                        opt === 'C' ? scratchOptionCRw : scratchOptionDRw
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (opt === 'A') setScratchOptionARw(val);
                        else if (opt === 'B') setScratchOptionBRw(val);
                        else if (opt === 'C') setScratchOptionCRw(val);
                        else setScratchOptionDRw(val);
                      }}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: scratchCorrectOption === opt ? '1px solid var(--border-medium)' : '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem' }}
                    />
                  </div>
                ))}
              </div>

              {/* Extra details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Points Weight
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={scratchPoints}
                    onChange={(e) => setScratchPoints(parseInt(e.target.value) || 1)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Domain
                  </label>
                  <select
                    value={scratchDomain}
                    onChange={(e) => setScratchDomain(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem' }}
                  >
                    <option value="PRIORITY">Priority Rules</option>
                    <option value="SIGNAGE">Road Signs</option>
                    <option value="SPEED">Speed Limits</option>
                    <option value="LEGAL">Legal Framework</option>
                    <option value="SAFETY">Vehicle Safety</option>
                    <option value="PARKING">Parking & Stopping</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Difficulty
                  </label>
                  <select
                    value={scratchDifficulty}
                    onChange={(e) => setScratchDifficulty(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem' }}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Answer Explanation & Pedagogical Feedback
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why the selected option is correct per Rwanda Highway Code..."
                  value={scratchExplanation}
                  onChange={(e) => setScratchExplanation(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <button
                type="button"
                onClick={() => setIsAddingScratchQuestion(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddScratchQuestion}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                <span>Add Question to Quiz</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 12. Quiz Inspection Modal (System Admin & Training Admin Oversight)      */}
      {/* ========================================================================= */}
      {inspectingQuiz && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '780px', maxHeight: '88vh', overflowY: 'auto', borderRadius: 'var(--radius-2xl)', padding: '28px', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                    {inspectingQuiz.title}
                  </h3>
                  <Badge variant="neutral">
                    {inspectingQuiz.status}
                  </Badge>
                </div>
                {inspectingQuiz.title_kinyarwanda && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    {inspectingQuiz.title_kinyarwanda}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setInspectingQuiz(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Oversight metadata card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', padding: '16px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', fontSize: '0.84rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Course: </span>
                <strong style={{ color: '#ffffff' }}>{inspectingQuiz.course_title}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Module: </span>
                <strong style={{ color: '#ffffff' }}>{inspectingQuiz.module_title || 'Course-wide'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Created By: </span>
                <strong style={{ color: '#ffffff' }}>
                  {inspectingQuiz.created_by_detail ? `${inspectingQuiz.created_by_detail.full_name} (${inspectingQuiz.created_by_detail.role})` : 'System Staff'}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Contact: </span>
                <strong style={{ color: '#ffffff' }}>{inspectingQuiz.created_by_detail?.phone_number || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Created At: </span>
                <strong style={{ color: '#ffffff' }}>{new Date(inspectingQuiz.created_at).toLocaleString()}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Last Updated: </span>
                <strong style={{ color: '#ffffff' }}>{new Date(inspectingQuiz.updated_at).toLocaleString()}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Open Date: </span>
                <strong style={{ color: '#ffffff' }}>{inspectingQuiz.open_date ? new Date(inspectingQuiz.open_date).toLocaleString() : 'Immediate'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Deadline: </span>
                <strong style={{ color: '#ffffff' }}>{inspectingQuiz.deadline ? new Date(inspectingQuiz.deadline).toLocaleString() : 'No deadline'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Score / Passing: </span>
                <strong style={{ color: '#ffffff' }}>{inspectingQuiz.total_score} pts (Pass {inspectingQuiz.passing_score}%)</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Time Limit & Retakes: </span>
                <strong style={{ color: '#ffffff' }}>{inspectingQuiz.time_limit_minutes > 0 ? `${inspectingQuiz.time_limit_minutes} mins` : 'Unlimited'} • {inspectingQuiz.max_attempts > 0 ? `${inspectingQuiz.max_attempts} attempts` : 'Unlimited'}</strong>
              </div>
            </div>

            {/* Rubric */}
            <div>
              <h5 style={{ margin: '0 0 6px 0', fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                Grading Rubric & Student Guidelines
              </h5>
              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', fontSize: '0.84rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                {inspectingQuiz.rubric || 'No rubric provided.'}
                {inspectingQuiz.rubric_kinyarwanda && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <strong>Kinyarwanda:</strong><br />
                    {inspectingQuiz.rubric_kinyarwanda}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
              <button
                type="button"
                onClick={() => setInspectingQuiz(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const q = inspectingQuiz;
                  setInspectingQuiz(null);
                  handleOpenEditQuiz(q);
                }}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Pencil size={14} />
                <span>Edit This Quiz</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


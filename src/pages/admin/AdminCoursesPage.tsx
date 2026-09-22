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
} from 'lucide-react';
import { AdminService } from '../../core/services/AdminService';
import type { CohortItem, AdminUserItem, LiveClassAdminItem } from '../../core/services/AdminService';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';

type LMSStudioSection = 'courses' | 'cohorts' | 'learners' | 'quizzes' | 'tutors';

export const AdminCoursesPage: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useTranslation();
  const isTrainingAdmin = user?.isTrainingAdmin();
  const isSystemAdmin = user?.isSystemAdmin();

  const [activeSection, setActiveSection] = useState<LMSStudioSection>('courses');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Data states
  const [courses, setCourses] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<CohortItem[]>([]);
  const [tutors, setTutors] = useState<AdminUserItem[]>([]);
  const [students, setStudents] = useState<AdminUserItem[]>([]);
  const [guests, setGuests] = useState<AdminUserItem[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClassAdminItem[]>([]);

  // Search & Filters
  const [courseSearch, setCourseSearch] = useState<string>('');
  const [cohortSearch, setCohortSearch] = useState<string>('');
  const [learnerSearch, setLearnerSearch] = useState<string>('');
  const [learnerRoleFilter, setLearnerRoleFilter] = useState<'ALL' | 'STUDENT' | 'GUEST'>('ALL');
  const [quizDomainFilter, setQuizDomainFilter] = useState<string>('ALL');
  const [quizSearch, setQuizSearch] = useState<string>('');

  // Course Modals
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState<boolean>(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState<boolean>(false);
  const [editingCourseId, setEditingCourseId] = useState<string>('');
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
        coursesRes,
        cohortsRes,
        tutorsRes,
        studentsRes,
        guestsRes,
        questionsRes,
        classesRes,
      ] = await Promise.allSettled([
        adminService.getCourses(),
        adminService.getCohorts(),
        adminService.getUsers({ role: 'TUTOR' }),
        adminService.getUsers({ role: 'STUDENT' }),
        adminService.getUsers({ role: 'GUEST' }),
        adminService.getQuestions(),
        adminService.getLiveClasses(),
      ]);

      if (coursesRes.status === 'fulfilled') setCourses(coursesRes.value);
      if (cohortsRes.status === 'fulfilled') setCohorts(cohortsRes.value);
      if (tutorsRes.status === 'fulfilled') setTutors(tutorsRes.value.results || []);
      if (studentsRes.status === 'fulfilled') setStudents(studentsRes.value.results || []);
      if (guestsRes.status === 'fulfilled') setGuests(guestsRes.value.results || []);
      if (questionsRes.status === 'fulfilled') setQuestions(questionsRes.value);
      if (classesRes.status === 'fulfilled') setLiveClasses(classesRes.value);
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
  // 1. Course Handlers
  // -------------------------------------------------------------------------
  const handleTogglePublish = async (course: any) => {
    const modCount = course.module_count ?? course.modules_count ?? 0;
    if (!course.is_published && modCount === 0) {
      warning('Cannot publish an empty course. Training admin must add curriculum modules before publishing.');
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

  const handleOpenEditCourse = (c: any) => {
    setEditingCourseId(c.id);
    setCourseTitle(c.title || '');
    setCourseTitleRw(c.title_rw || '');
    setCourseCode(c.code || (c.id ? c.id.slice(0, 8).toUpperCase() : ''));
    setCourseDescription(c.description || '');
    setCourseHours(c.estimated_hours || 10);
    setCourseSortOrder(c.sort_order || 1);
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
        title: courseTitle.trim(),
        title_rw: courseTitleRw.trim() || undefined,
        code: courseCode.trim().toUpperCase() || undefined as any,
        description: courseDescription.trim() || undefined,
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
    if (!selectedLearner || !targetCohortId) {
      warning('Please select a target cohort.');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminService.assignStudentsToCohort(targetCohortId, [selectedLearner.id], 'enroll');
      success(`Assigned ${selectedLearner.full_name || selectedLearner.phone_number} to cohort.`);
      setIsChangeCohortModalOpen(false);
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to assign learner to cohort.');
    } finally {
      setIsSubmitting(false);
    }
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
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (!courseSearch) return true;
      const q = courseSearch.toLowerCase();
      return (
        c.title?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    });
  }, [courses, courseSearch]);

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
      if (!learnerSearch) return true;
      const q = learnerSearch.toLowerCase();
      return (
        u.phone_number?.toLowerCase().includes(q) ||
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.student_id?.toLowerCase().includes(q)
      );
    });
  }, [students, guests, learnerRoleFilter, learnerSearch]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (quizDomainFilter !== 'ALL' && q.domain !== quizDomainFilter) return false;
      if (!quizSearch) return true;
      const search = quizSearch.toLowerCase();
      return (
        q.question_text?.toLowerCase().includes(search) ||
        q.question_text_rw?.toLowerCase().includes(search) ||
        String(q.question_number || '').includes(search)
      );
    });
  }, [questions, quizDomainFilter, quizSearch]);

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
          onClick={() => setActiveSection('courses')}
          className={`btn btn-sm ${activeSection === 'courses' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
        >
          <BookOpen size={15} />
          <span>{t('admin.courses.tabCourses')} ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('cohorts')}
          className={`btn btn-sm ${activeSection === 'cohorts' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
        >
          <GraduationCap size={15} />
          <span>{t('admin.courses.tabCohorts')} ({cohorts.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('learners')}
          className={`btn btn-sm ${activeSection === 'learners' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
        >
          <Users size={15} />
          <span>{t('admin.courses.tabLearners')} ({students.length + guests.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('quizzes')}
          className={`btn btn-sm ${activeSection === 'quizzes' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-lg)' }}
        >
          <HelpCircle size={15} />
          <span>{t('admin.courses.tabQuizzes')} ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('tutors')}
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
          {/* SECTION 1: CURRICULUM COURSES                                             */}
          {/* ========================================================================= */}
          {activeSection === 'courses' && (
            selectedCourseForCurriculum ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* System Admin Read-Only Inspector Alert */}
                {isSystemAdmin && (
                  <div
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      padding: '12px 18px',
                      borderRadius: 'var(--radius-xl)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '0.86rem',
                      color: '#93c5fd',
                    }}
                  >
                    <Eye size={20} color="#60a5fa" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: '#ffffff' }}>Executive Curriculum Inspector (Read-Only): </strong>
                      You have full oversight over curriculum modules, lessons, audio/video lectures, and road signs prepared by the Training Admin. System Admin initializes courses and manages publishing, but does not author module materials.
                    </div>
                  </div>
                )}

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
            ) : (
              <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
                {/* Training Admin Role Guidance Banner */}
                {isTrainingAdmin && (
                  <div
                    style={{
                      margin: '18px 24px 0',
                      padding: '12px 18px',
                      borderRadius: 'var(--radius-xl)',
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '0.84rem',
                      color: '#fef3c7',
                    }}
                  >
                    <AlertCircle size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: '#f59e0b' }}>{t('admin.courses.roleNoticeTitle')}: </strong>
                      {t('admin.courses.roleNoticeDesc')}
                    </div>
                  </div>
                )}

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

                  {/* Create Course is strictly for System Admin */}
                  {isSystemAdmin && (
                    <button
                      onClick={() => setIsCreateCourseModalOpen(true)}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={15} />
                      <span>{t('admin.courses.createCourse')}</span>
                    </button>
                  )}
                </div>

                {filteredCourses.length === 0 ? (
                  <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {isTrainingAdmin
                      ? t('admin.courses.noCoursesFoundTraining')
                      : t('admin.courses.noCoursesFoundSystem')}
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
                                <div>{language === 'rw' && c.title_rw ? c.title_rw : c.title}</div>
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
                                  {/* Curriculum Studio button */}
                                  <button
                                    onClick={() => handleOpenCurriculumBuilder(c)}
                                    className="btn btn-primary btn-sm"
                                    style={{ fontSize: '0.75rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    title={t('admin.courses.curriculumBtnTitle')}
                                  >
                                    <BookOpen size={13} />
                                    <span>{t('admin.courses.curriculumBtn')}</span>
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
                  padding: '18px 24px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', width: '280px' }}>
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

                  <div style={{ display: 'flex', gap: '6px' }}>
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
                </div>
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
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Learner</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Phone</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Role</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Assigned Cohort</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Registered</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allLearners.map((lrn) => (
                        <tr key={lrn.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ffffff' }}>
                            <div>{lrn.full_name || 'Anonymous User'}</div>
                            {lrn.student_id && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--primary-light)', fontFamily: 'monospace' }}>
                                {lrn.student_id}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            {lrn.phone_number}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <Badge variant={lrn.role === 'STUDENT' ? 'info' : 'neutral'}>
                              {lrn.role}
                            </Badge>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {lrn.cohort_name ? (
                              <span style={{ fontWeight: 600, color: '#38bdf8' }}>{lrn.cohort_name}</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Unassigned</span>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {lrn.created_at ? lrn.created_at.slice(0, 10) : '—'}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <button
                              onClick={() => handleOpenChangeCohort(lrn)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <ArrowRightLeft size={13} />
                              <span>{lrn.cohort_name ? 'Change Cohort' : 'Assign Cohort'}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 4: PRACTICE QUIZZES & QUESTION BANK                               */}
          {/* ========================================================================= */}
          {activeSection === 'quizzes' && (
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', width: '280px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Search questions (Kinyarwanda or EN)..."
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
                    value={quizDomainFilter}
                    onChange={(e) => setQuizDomainFilter(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.84rem',
                    }}
                  >
                    <option value="ALL">All Domains</option>
                    <option value="PRIORITY">Priority Rules & Intersections</option>
                    <option value="SIGNAGE">Traffic Signage & Markings</option>
                    <option value="SPEED">Speed Limits & Overtaking</option>
                    <option value="LEGAL">Legal Framework & Penalties</option>
                    <option value="SAFETY">Vehicle Safety & First Aid</option>
                    <option value="PARKING">Parking & Stopping Rules</option>
                  </select>
                </div>
              </div>

              {filteredQuestions.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No quiz questions found matching the selected filter.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600, width: '70px' }}>#</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Question Prompt</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Correct Option</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Domain</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQuestions.slice(0, 50).map((q, idx) => (
                        <tr key={q.id || idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--primary-light)', fontFamily: 'monospace' }}>
                            {q.question_number || idx + 1}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#ffffff' }}>
                            <div style={{ fontWeight: 600 }}>{q.question_text_rw || q.question_text}</div>
                            {q.explanation_rw && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Ibisobanuro: {q.explanation_rw}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <Badge variant="success">Option {q.correct_option || 'A'}</Badge>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {q.domain || 'PRIORITY'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredQuestions.length > 50 && (
                    <div style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Showing top 50 of {filteredQuestions.length} practice questions.
                    </div>
                  )}
                </div>
              )}
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
                  required
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
                  <option value="">-- Choose a Cohort --</option>
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
                <button type="submit" disabled={isSubmitting || !targetCohortId} className="btn btn-primary">
                  {isSubmitting ? 'Assigning...' : 'Save Cohort Assignment'}
                </button>
              </div>
            </form>
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
    </div>
  );
};

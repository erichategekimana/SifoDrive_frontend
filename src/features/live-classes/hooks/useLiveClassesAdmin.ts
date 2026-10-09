import { useState, useEffect, useMemo } from 'react';
import {
  AdminService,
  type CohortItem,
  type LiveClassAdminItem,
  type LiveClassScheduleItem,
} from '../../../core/services/AdminService';
import { useToast } from '../../../context/ToastContext';
import { useTranslation } from '../../../context/I18nContext';

export const useLiveClassesAdmin = () => {
  const { t, language } = useTranslation();

  const dayOptions = useMemo(() => [
    { value: 0, label: t('admin.liveClasses.dayOptions.monday') },
    { value: 1, label: t('admin.liveClasses.dayOptions.tuesday') },
    { value: 2, label: t('admin.liveClasses.dayOptions.wednesday') },
    { value: 3, label: t('admin.liveClasses.dayOptions.thursday') },
    { value: 4, label: t('admin.liveClasses.dayOptions.friday') },
    { value: 5, label: t('admin.liveClasses.dayOptions.saturday') },
    { value: 6, label: t('admin.liveClasses.dayOptions.sunday') },
  ], [t]);

  const periodOptions = useMemo(() => [
    { value: 1, label: t('admin.liveClasses.periodOptions.oneMonth') },
    { value: 2, label: t('admin.liveClasses.periodOptions.twoMonths') },
    { value: 3, label: t('admin.liveClasses.periodOptions.threeMonths') },
    { value: 6, label: t('admin.liveClasses.periodOptions.sixMonths') },
  ], [t]);

  const weekdaysList = useMemo(() => [
    { key: 'mon', label: t('admin.liveClasses.weekdays.mon') },
    { key: 'tue', label: t('admin.liveClasses.weekdays.tue') },
    { key: 'wed', label: t('admin.liveClasses.weekdays.wed') },
    { key: 'thu', label: t('admin.liveClasses.weekdays.thu') },
    { key: 'fri', label: t('admin.liveClasses.weekdays.fri') },
    { key: 'sat', label: t('admin.liveClasses.weekdays.sat') },
    { key: 'sun', label: t('admin.liveClasses.weekdays.sun') },
  ], [t]);

  const [classes, setClasses] = useState<LiveClassAdminItem[]>([]);
  const [schedules, setSchedules] = useState<LiveClassScheduleItem[]>([]);
  const [cohorts, setCohorts] = useState<CohortItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'CALENDAR' | 'TABLE'>('TABLE');

  // Calendar State
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<LiveClassAdminItem | null>(null);

  // Modals
  const [isCohortModalOpen, setIsCohortModalOpen] = useState<boolean>(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState<boolean>(false);

  // Cohort Form State
  const [cohortName, setCohortName] = useState<string>('');
  const [cohortStartDate, setCohortStartDate] = useState<string>('');
  const [cohortEndDate, setCohortEndDate] = useState<string>('');
  const [cohortDescription, setCohortDescription] = useState<string>('');

  // Class Scheduling State
  const [scheduleMode, setScheduleMode] = useState<'SINGLE' | 'RECURRING'>('RECURRING');
  const [classTitle, setClassTitle] = useState<string>('');
  const [classCohortId, setClassCohortId] = useState<string>('');
  const [classStartTime, setClassStartTime] = useState<string>('14:00');
  const [classEndTime, setClassEndTime] = useState<string>('15:30');
  const [classMeetLink, setClassMeetLink] = useState<string>('');
  const [classTopic, setClassTopic] = useState<string>('');

  // Single Session Specific
  const [singleDate, setSingleDate] = useState<string>('');

  // Helper for End Date Calculation
  const calculateEndDate = (startDate: string, value: number, unit: 'months' | 'years'): string => {
    if (!startDate) return '';
    const [y, m, d] = startDate.split('-').map(Number);
    if (!y || !m || !d) return '';
    const dateObj = new Date(y, m - 1, d);
    if (unit === 'years') {
      dateObj.setFullYear(dateObj.getFullYear() + value);
    } else {
      dateObj.setMonth(dateObj.getMonth() + value);
    }
    const resY = dateObj.getFullYear();
    const resM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const resD = String(dateObj.getDate()).padStart(2, '0');
    return `${resY}-${resM}-${resD}`;
  };

  // Recurring Schedule Specific
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [recurringDays, setRecurringDays] = useState<number[]>([1]); // Default Tuesday
  const [recurringDay, setRecurringDay] = useState<number>(1);
  const [recurringPeriodValue, setRecurringPeriodValue] = useState<number>(3);
  const [recurringPeriodUnit, setRecurringPeriodUnit] = useState<'months' | 'years'>('months');
  const [recurringStartDate, setRecurringStartDate] = useState<string>(todayStr);
  const [recurringEndDate, setRecurringEndDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    const resY = d.getFullYear();
    const resM = String(d.getMonth() + 1).padStart(2, '0');
    const resD = String(d.getDate()).padStart(2, '0');
    return `${resY}-${resM}-${resD}`;
  });
  const [recurringPeriodMonths, setRecurringPeriodMonths] = useState<number>(3);

  const handleStartDateChange = (newStart: string) => {
    setRecurringStartDate(newStart);
    setRecurringEndDate(calculateEndDate(newStart, recurringPeriodValue, recurringPeriodUnit));
  };

  const handlePeriodValueChange = (newVal: number) => {
    setRecurringPeriodValue(newVal);
    setRecurringPeriodMonths(recurringPeriodUnit === 'years' ? newVal * 12 : newVal);
    setRecurringEndDate(calculateEndDate(recurringStartDate, newVal, recurringPeriodUnit));
  };

  const handlePeriodUnitChange = (newUnit: 'months' | 'years') => {
    setRecurringPeriodUnit(newUnit);
    setRecurringPeriodMonths(newUnit === 'years' ? recurringPeriodValue * 12 : recurringPeriodValue);
    setRecurringEndDate(calculateEndDate(recurringStartDate, recurringPeriodValue, newUnit));
  };

  // Edit Class State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<LiveClassAdminItem | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editTopic, setEditTopic] = useState<string>('');
  const [editCohortId, setEditCohortId] = useState<string>('');
  const [editScheduledDate, setEditScheduledDate] = useState<string>('');
  const [editStartTime, setEditStartTime] = useState<string>('14:00');
  const [editEndTime, setEditEndTime] = useState<string>('15:30');
  const [editMeetLink, setEditMeetLink] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('SCHEDULED');

  // Edit Schedule State (Master Schedule)
  const [isEditScheduleModalOpen, setIsEditScheduleModalOpen] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<LiveClassScheduleItem | null>(null);
  const [editScheduleTitle, setEditScheduleTitle] = useState<string>('');
  const [editScheduleTopic, setEditScheduleTopic] = useState<string>('');
  const [editScheduleCohortId, setEditScheduleCohortId] = useState<string>('');
  const [editScheduleStartTime, setEditScheduleStartTime] = useState<string>('14:00');
  const [editScheduleEndTime, setEditScheduleEndTime] = useState<string>('15:30');
  const [editScheduleMeetLink, setEditScheduleMeetLink] = useState<string>('');
  const [editScheduleNotes, setEditScheduleNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminService = AdminService.getInstance();
  const { success, warning, error: toastError } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [classesRes, cohortsRes, schedulesRes] = await Promise.allSettled([
        adminService.getLiveClasses(),
        adminService.getCohorts(),
        adminService.getLiveClassSchedules(),
      ]);

      if (classesRes.status === 'fulfilled') setClasses(classesRes.value);
      if (cohortsRes.status === 'fulfilled') setCohorts(cohortsRes.value);
      if (schedulesRes.status === 'fulfilled') setSchedules(schedulesRes.value);
    } catch (err) {
      console.error('Failed loading live classes, cohorts, and schedules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const todayStr = new Date().toISOString().split('T')[0];
    setSingleDate(todayStr);
    setRecurringStartDate(todayStr);
  }, []);

  // Cohort Creation
  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cohortName.trim()) {
      warning('Cohort name is required.');
      return;
    }
    if (!cohortStartDate || !cohortEndDate) {
      warning('Both Start Date and End Date are required.');
      return;
    }
    if (cohortEndDate < cohortStartDate) {
      warning('End Date cannot precede Start Date.');
      return;
    }
    if (cohortDescription.length > 165) {
      warning('Description cannot exceed 165 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createCohort({
        name: cohortName.trim(),
        start_date: cohortStartDate,
        end_date: cohortEndDate,
        description: cohortDescription.trim(),
      });
      success(`Created cohort ${cohortName}.`);
      setIsCohortModalOpen(false);
      setCohortName('');
      setCohortStartDate('');
      setCohortEndDate('');
      setCohortDescription('');
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Could not create cohort.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Class Scheduling (Single or Recurring)
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classTitle.trim()) {
      warning('Class title is required.');
      return;
    }
    const meetLink = classMeetLink.trim();
    if (!/^https?:\/\//i.test(meetLink)) {
      warning('A Google Meet link is required (create it in Google Meet and give the tutor host access).');
      return;
    }
    if (classStartTime >= classEndTime) {
      warning('Start time must be before end time.');
      return;
    }

    // The cohort's tutor hosts the session and later posts the recording.
    const selectedCohort = cohorts.find((c) => c.id === classCohortId);
    const hostTutorId = selectedCohort?.primary_tutor?.id || selectedCohort?.assigned_tutors?.[0]?.id;

    setIsSubmitting(true);
    try {
      if (scheduleMode === 'RECURRING') {
        const targetDays = recurringDays.length > 0 ? recurringDays : [recurringDay];
        if (targetDays.length === 0) {
          warning(t('admin.liveClasses.selectDaysRequired') || 'Please select at least one day in a week.');
          return;
        }
        if (recurringEndDate && recurringStartDate && recurringEndDate < recurringStartDate) {
          warning('End date must be on or after start date.');
          return;
        }

        await adminService.scheduleRecurringClasses({
          title: classTitle.trim(),
          cohort: classCohortId || undefined,
          tutor: hostTutorId,
          days_of_week: targetDays,
          day_of_week: targetDays[0],
          start_time: classStartTime,
          end_time: classEndTime,
          start_date: recurringStartDate,
          end_date: recurringEndDate || undefined,
          period_months: recurringPeriodUnit === 'years' ? recurringPeriodValue * 12 : recurringPeriodValue,
          period_unit: recurringPeriodUnit,
          google_meet_url: meetLink,
          topic: classTopic.trim() || undefined,
        });
        const unitLabel = recurringPeriodUnit === 'years'
          ? `${recurringPeriodValue} ${recurringPeriodValue > 1 ? t('admin.liveClasses.years') : t('admin.liveClasses.year')}`
          : `${recurringPeriodValue} ${t('admin.liveClasses.months')}`;
        success(`Scheduled recurring classes for ${unitLabel}.`);
      } else {
        await adminService.createLiveClass({
          title: classTitle.trim(),
          cohort: classCohortId || undefined,
          tutor: hostTutorId,
          scheduled_date: singleDate,
          start_time: classStartTime,
          end_time: classEndTime,
          google_meet_url: meetLink,
          topic: classTopic.trim() || undefined,
          is_published: true,
        });
        success(`Scheduled live class ${classTitle}.`);
      }

      setIsClassModalOpen(false);
      setClassTitle('');
      setClassTopic('');
      setClassMeetLink('');
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to schedule class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClassAction = async (classId: string, action: 'START' | 'END' | 'CANCEL') => {
    try {
      if (action === 'START') await adminService.startLiveClass(classId);
      if (action === 'END') await adminService.endLiveClass(classId);
      if (action === 'CANCEL') await adminService.cancelLiveClass(classId, 'Cancelled by administrator');

      success(`Class ${action.toLowerCase()}ed.`);
      if (selectedClass?.id === classId) {
        setSelectedClass(null);
      }
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Operation failed.');
    }
  };

  const handleOpenEditModal = (cls: LiveClassAdminItem) => {
    setEditingClass(cls);
    setEditTitle(cls.title || '');
    setEditTopic(cls.topic || '');
    setEditCohortId(cls.cohort || cls.cohort_id || '');
    setEditScheduledDate(cls.scheduled_date || (cls.scheduled_at ? cls.scheduled_at.split('T')[0] : ''));
    setEditStartTime(cls.start_time ? cls.start_time.slice(0, 5) : '14:00');
    setEditEndTime(cls.end_time ? cls.end_time.slice(0, 5) : '15:30');
    setEditMeetLink(cls.google_meet_url || cls.meeting_link || '');
    setEditStatus(cls.status || 'SCHEDULED');
    setIsEditModalOpen(true);
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    if (!editTitle.trim()) {
      warning('Class title is required.');
      return;
    }
    const meetLink = editMeetLink.trim();
    if (!/^https?:\/\//i.test(meetLink)) {
      warning('A Google Meet link is required.');
      return;
    }
    if (editStartTime >= editEndTime) {
      warning('Start time must be before end time.');
      return;
    }

    const selectedCohort = cohorts.find((c) => c.id === editCohortId);
    const hostTutorId = selectedCohort?.primary_tutor?.id || selectedCohort?.assigned_tutors?.[0]?.id;

    setIsSubmitting(true);
    try {
      await adminService.updateLiveClass(editingClass.id, {
        title: editTitle.trim(),
        topic: editTopic.trim() || undefined,
        cohort: editCohortId || undefined,
        tutor: hostTutorId || undefined,
        scheduled_date: editScheduledDate,
        start_time: editStartTime,
        end_time: editEndTime,
        google_meet_url: meetLink,
        status: editStatus,
      });
      success(`Updated live class schedule for "${editTitle}".`);
      setIsEditModalOpen(false);
      setEditingClass(null);
      if (selectedClass?.id === editingClass.id) {
        setSelectedClass(null);
      }
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update live class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    setIsSubmitting(true);
    try {
      await adminService.deleteLiveClass(classId);
      success('Live class schedule deleted successfully.');
      setIsEditModalOpen(false);
      setEditingClass(null);
      if (selectedClass?.id === classId) {
        setSelectedClass(null);
      }
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to delete live class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditSchedule = (schedule: LiveClassScheduleItem) => {
    setEditingSchedule(schedule);
    setEditScheduleTitle(schedule.title || '');
    setEditScheduleTopic(schedule.topic || '');
    setEditScheduleCohortId(schedule.cohort || schedule.cohort_id || '');
    setEditScheduleStartTime(schedule.start_time ? schedule.start_time.slice(0, 5) : '14:00');
    setEditScheduleEndTime(schedule.end_time ? schedule.end_time.slice(0, 5) : '15:30');
    setEditScheduleMeetLink(schedule.google_meet_url || '');
    setEditScheduleNotes(schedule.notes || '');
    setIsEditScheduleModalOpen(true);
  };

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;
    if (!editScheduleTitle.trim()) {
      warning('Class title is required.');
      return;
    }
    const meetLink = editScheduleMeetLink.trim();
    if (!/^https?:\/\//i.test(meetLink)) {
      warning('A Google Meet link is required.');
      return;
    }
    if (editScheduleStartTime >= editScheduleEndTime) {
      warning('Start time must be before end time.');
      return;
    }

    const selectedCohort = cohorts.find((c) => c.id === editScheduleCohortId);
    const hostTutorId = selectedCohort?.primary_tutor?.id || selectedCohort?.assigned_tutors?.[0]?.id;

    setIsSubmitting(true);
    try {
      await adminService.updateLiveClassSchedule(editingSchedule.id, {
        title: editScheduleTitle.trim(),
        topic: editScheduleTopic.trim() || undefined,
        cohort: editScheduleCohortId || undefined,
        tutor: hostTutorId || undefined,
        start_time: editScheduleStartTime,
        end_time: editScheduleEndTime,
        google_meet_url: meetLink,
        notes: editScheduleNotes.trim() || undefined,
      });
      success(`Updated class schedule for "${editScheduleTitle}".`);
      setIsEditScheduleModalOpen(false);
      setEditingSchedule(null);
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update schedule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    setIsSubmitting(true);
    try {
      await adminService.deleteLiveClassSchedule(scheduleId);
      success('Class schedule and all associated sessions deleted successfully.');
      setIsEditScheduleModalOpen(false);
      setEditingSchedule(null);
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to delete schedule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar Calculation Helpers
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const calendarDays = useMemo(() => {
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

    const days: { date: Date | null; dayNumber: number | null; dateString: string | null }[] = [];

    // Preceding empty slots
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ date: null, dayNumber: null, dateString: null });
    }

    // Days in current month
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(year, month, day);
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ date: d, dayNumber: day, dateString });
    }

    return days;
  }, [year, month]);

  const classesByDate = useMemo(() => {
    const map = new Map<string, LiveClassAdminItem[]>();
    for (const c of classes) {
      let dateKey = c.scheduled_date;
      if (!dateKey && c.scheduled_at) {
        dateKey = c.scheduled_at.split('T')[0];
      }
      if (dateKey) {
        const existing = map.get(dateKey) || [];
        existing.push(c);
        map.set(dateKey, existing);
      }
    }
    return map;
  }, [classes]);

  const handleDayClick = (dateString: string) => {
    setSingleDate(dateString);
    setRecurringStartDate(dateString);
    const dayOfWeek = (new Date(dateString).getDay() + 6) % 7;
    setRecurringDay(dayOfWeek);
    setIsClassModalOpen(true);
  };

  const nextMonth = () => setCalendarDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const todayMonth = () => setCalendarDate(new Date());

  const monthName = calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return {
    t,
    language,
    dayOptions,
    periodOptions,
    weekdaysList,
    classes,
    schedules,
    cohorts,
    isLoading,
    viewMode,
    setViewMode,
    calendarDate,
    setCalendarDate,
    selectedClass,
    setSelectedClass,
    isCohortModalOpen,
    setIsCohortModalOpen,
    isClassModalOpen,
    setIsClassModalOpen,
    cohortName,
    setCohortName,
    cohortStartDate,
    setCohortStartDate,
    cohortEndDate,
    setCohortEndDate,
    cohortDescription,
    setCohortDescription,
    scheduleMode,
    setScheduleMode,
    classTitle,
    setClassTitle,
    classCohortId,
    setClassCohortId,
    classStartTime,
    setClassStartTime,
    classEndTime,
    setClassEndTime,
    classMeetLink,
    setClassMeetLink,
    classTopic,
    setClassTopic,
    singleDate,
    setSingleDate,
    recurringDay,
    setRecurringDay,
    recurringDays,
    setRecurringDays,
    recurringPeriodValue,
    setRecurringPeriodValue,
    recurringPeriodUnit,
    setRecurringPeriodUnit,
    recurringStartDate,
    setRecurringStartDate,
    recurringEndDate,
    setRecurringEndDate,
    handleStartDateChange,
    handlePeriodValueChange,
    handlePeriodUnitChange,
    recurringPeriodMonths,
    setRecurringPeriodMonths,
    isSubmitting,
    calendarDays,
    classesByDate,
    monthName,
    loadData,
    handleCreateCohort,
    handleScheduleSubmit,
    handleClassAction,
    handleDayClick,
    isEditModalOpen,
    setIsEditModalOpen,
    editingClass,
    setEditingClass,
    editTitle,
    setEditTitle,
    editTopic,
    setEditTopic,
    editCohortId,
    setEditCohortId,
    editScheduledDate,
    setEditScheduledDate,
    editStartTime,
    setEditStartTime,
    editEndTime,
    setEditEndTime,
    editMeetLink,
    setEditMeetLink,
    editStatus,
    setEditStatus,
    handleOpenEditModal,
    handleUpdateClass,
    handleDeleteClass,
    isEditScheduleModalOpen,
    setIsEditScheduleModalOpen,
    editingSchedule,
    setEditingSchedule,
    editScheduleTitle,
    setEditScheduleTitle,
    editScheduleTopic,
    setEditScheduleTopic,
    editScheduleCohortId,
    setEditScheduleCohortId,
    editScheduleStartTime,
    setEditScheduleStartTime,
    editScheduleEndTime,
    setEditScheduleEndTime,
    editScheduleMeetLink,
    setEditScheduleMeetLink,
    editScheduleNotes,
    setEditScheduleNotes,
    handleOpenEditSchedule,
    handleUpdateSchedule,
    handleDeleteSchedule,
    nextMonth,
    prevMonth,
    todayMonth,
  };
};

import { useState, useEffect, useMemo } from 'react';
import {
  AdminService,
  type CohortItem,
  type LiveClassAdminItem,
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

  // Recurring Schedule Specific
  const [recurringDay, setRecurringDay] = useState<number>(1);
  const [recurringStartDate, setRecurringStartDate] = useState<string>('');
  const [recurringPeriodMonths, setRecurringPeriodMonths] = useState<number>(3);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminService = AdminService.getInstance();
  const { success, warning, error: toastError } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [classesRes, cohortsRes] = await Promise.allSettled([
        adminService.getLiveClasses(),
        adminService.getCohorts(),
      ]);

      if (classesRes.status === 'fulfilled') setClasses(classesRes.value);
      if (cohortsRes.status === 'fulfilled') setCohorts(cohortsRes.value);
    } catch (err) {
      console.error('Failed loading live classes and cohorts:', err);
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

    setIsSubmitting(true);
    try {
      if (scheduleMode === 'RECURRING') {
        await adminService.scheduleRecurringClasses({
          title: classTitle.trim(),
          cohort: classCohortId || undefined,
          day_of_week: Number(recurringDay),
          start_time: classStartTime,
          end_time: classEndTime,
          start_date: recurringStartDate,
          period_months: Number(recurringPeriodMonths),
          google_meet_url: classMeetLink.trim() || undefined,
          topic: classTopic.trim() || undefined,
        });
        success(`Scheduled recurring classes for ${recurringPeriodMonths} months.`);
      } else {
        const scheduledAt = `${singleDate}T${classStartTime}:00`;
        const [sh, sm] = classStartTime.split(':').map(Number);
        const [eh, em] = classEndTime.split(':').map(Number);
        const durationMin = (eh * 60 + em) - (sh * 60 + sm) || 60;

        await adminService.createLiveClass({
          title: classTitle.trim(),
          cohort_id: classCohortId || undefined,
          scheduled_at: scheduledAt,
          duration_minutes: durationMin > 0 ? durationMin : 60,
          meeting_link: classMeetLink.trim() || undefined,
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
    recurringStartDate,
    setRecurringStartDate,
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
    nextMonth,
    prevMonth,
    todayMonth,
  };
};

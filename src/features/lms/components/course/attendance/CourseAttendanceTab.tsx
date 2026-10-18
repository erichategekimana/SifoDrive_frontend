import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Check,
  X,
  RefreshCw,
  ChevronDown,
  Save,
  Eye,
} from 'lucide-react';
import type { Course } from '../../../../../core/models/Course';
import {
  TutorLmsService,
  type CohortSelectorItem,
  type CohortStudentItem,
} from '../../../../../core/services/TutorLmsService';
import {
  LiveClassService,
  type ClassAttendanceItem,
  type BatchAttendancePayloadItem,
} from '../../../../../core/services/LiveClassService';
import type { LiveClass } from '../../../../../core/models/LiveClass';
import { useToast } from '../../../../../context/ToastContext';
import { Spinner } from '../../../../../components/common/Spinner';
import { StudentAttendanceDrawer } from './StudentAttendanceDrawer';

export interface CourseAttendanceTabProps {
  course: Course;
  cohortId?: string | null;
  tutorCohorts?: CohortSelectorItem[];
  onCohortChange?: (cohortId: string) => void;
}

type AttendanceStatusType = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';

interface LocalStudentAttendanceState {
  studentId: string;
  studentName: string;
  studentPhone: string;
  profilePhoto?: string | null;
  status: AttendanceStatusType;
  minutesAttended: number;
  notes: string;
  existingRecordId?: string;
}

const getDayKey = (dateStr?: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dt = new Date(y, m, d);
    const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return dayMap[dt.getDay()] || '';
  }
  return '';
};

const getDayLabel = (dayKey: string): string => {
  const map: Record<string, string> = {
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
    sun: 'Sun',
  };
  return map[dayKey] || dayKey.toUpperCase();
};

const formatDateLabel = (dateStr?: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dt = new Date(y, m, d);
    return dt.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return dateStr;
};

const DAY_OPTIONS = [
  { key: 'ALL', label: 'All Days' },
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

export const getSessionEffectiveStatus = (cls?: {
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
}): 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' => {
  if (!cls) return 'SCHEDULED';
  if (cls.status === 'CANCELLED' || cls.status === 'RESCHEDULED') {
    return cls.status;
  }
  if (!cls.scheduledDate) return (cls.status as any) || 'SCHEDULED';

  const parts = cls.scheduledDate.split('T')[0].split('-').map(Number);
  if (parts.length !== 3) return (cls.status as any) || 'SCHEDULED';

  const now = new Date();
  let startH = 0, startM = 0;
  if (cls.startTime) {
    const sp = cls.startTime.split(':').map(Number);
    startH = sp[0] || 0;
    startM = sp[1] || 0;
  }

  let endH = startH + 1, endM = startM;
  if (cls.endTime) {
    const ep = cls.endTime.split(':').map(Number);
    endH = ep[0] || 0;
    endM = ep[1] || 0;
  }

  const startDt = new Date(parts[0], parts[1] - 1, parts[2], startH, startM, 0);
  const endDt = new Date(parts[0], parts[1] - 1, parts[2], endH, endM, 0);

  if (now > endDt) {
    return 'COMPLETED';
  } else if (now >= startDt && now <= endDt) {
    return 'IN_PROGRESS';
  } else {
    return 'SCHEDULED';
  }
};

export const CourseAttendanceTab: React.FC<CourseAttendanceTabProps> = ({
  course,
  cohortId: propCohortId,
  tutorCohorts: propTutorCohorts,
  onCohortChange,
}) => {
  const { success: toastSuccess, error: toastError } = useToast();

  // 1. Cohort resolution
  const [cohorts, setCohorts] = useState<CohortSelectorItem[]>(propTutorCohorts || []);
  const [activeCohortId, setActiveCohortId] = useState<string>(() => {
    return propCohortId || (propTutorCohorts && propTutorCohorts[0]?.id) || '';
  });

  // Sync if prop changes
  useEffect(() => {
    if (propCohortId && propCohortId !== activeCohortId) {
      setActiveCohortId(propCohortId);
    }
  }, [propCohortId]);

  useEffect(() => {
    if (propTutorCohorts && propTutorCohorts.length > 0) {
      setCohorts(propTutorCohorts);
      if (!activeCohortId) {
        setActiveCohortId(propTutorCohorts[0].id);
      }
    } else if (cohorts.length === 0) {
      TutorLmsService.getInstance()
        .getTutorCohorts()
        .then((data) => {
          setCohorts(data);
          if (data.length > 0 && !activeCohortId) {
            setActiveCohortId(data[0].id);
          }
        })
        .catch((err) => console.error('Failed to load cohorts:', err));
    }
  }, [propTutorCohorts]);

  const handleSelectCohort = (id: string) => {
    setActiveCohortId(id);
    if (onCohortChange) {
      onCohortChange(id);
    }
  };

  // 3. Operational Data states
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<CohortStudentItem[]>([]);
  const [existingAttendance, setExistingAttendance] = useState<ClassAttendanceItem[]>([]);

  // Roll call local working state
  const [rosterAttendance, setRosterAttendance] = useState<Record<string, LocalStudentAttendanceState>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState<boolean>(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState<boolean>(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);
  const [isLoadingAttendanceRecords, setIsLoadingAttendanceRecords] = useState<boolean>(false);

  // Filters & Drawer
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [inspectStudentId, setInspectStudentId] = useState<string | null>(null);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL');

  // 4. Fetch Live Classes for the selected cohort
  const loadClasses = useCallback(async () => {
    if (!activeCohortId) {
      setClasses([]);
      setSelectedClassId('');
      setSelectedDayFilter('ALL');
      setIsLoadingClasses(false);
      return;
    }
    setIsLoadingClasses(true);
    try {
      const list = await LiveClassService.getInstance().getClasses({
        cohort: activeCohortId,
      });
      setClasses(list);
      if (list.length > 0) {
        // Default to the first session (or in-progress/recent session)
        const recentOrFirst = list.find((c) => {
          const st = getSessionEffectiveStatus(c);
          return st === 'IN_PROGRESS' || st === 'COMPLETED';
        }) || list[0];
        setSelectedClassId(recentOrFirst.id);
        const dayKey = getDayKey(recentOrFirst.scheduledDate);
        if (dayKey) {
          setSelectedDayFilter(dayKey);
        }
      } else {
        setSelectedClassId('');
        setSelectedDayFilter('ALL');
      }
    } catch (err) {
      console.error('Failed to load classes for cohort:', err);
    } finally {
      setIsLoadingClasses(false);
    }
  }, [activeCohortId]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // 5. Fetch Enrolled Students for the selected cohort
  const loadStudents = useCallback(async () => {
    if (!activeCohortId) {
      setStudents([]);
      return;
    }
    setIsLoadingStudents(true);
    try {
      const studentList = await TutorLmsService.getInstance().getCohortStudents(activeCohortId);
      setStudents(studentList);
    } catch (err) {
      console.error('Failed to load cohort students:', err);
    } finally {
      setIsLoadingStudents(false);
    }
  }, [activeCohortId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // 6. When selectedClassId changes, fetch existing attendance records from database
  const loadClassAttendance = useCallback(async () => {
    if (!selectedClassId) {
      setExistingAttendance([]);
      return;
    }
    setIsLoadingAttendanceRecords(true);
    try {
      const records = await LiveClassService.getInstance().getClassAttendance(selectedClassId);
      setExistingAttendance(records);
    } catch (err) {
      console.error('Failed to load class attendance records:', err);
      setExistingAttendance([]);
    } finally {
      setIsLoadingAttendanceRecords(false);
    }
  }, [selectedClassId]);

  useEffect(() => {
    loadClassAttendance();
  }, [loadClassAttendance]);

  // 7. Initialize / merge local working attendance state when students or existingAttendance change
  useEffect(() => {
    if (students.length === 0) {
      setRosterAttendance({});
      return;
    }

    const map: Record<string, LocalStudentAttendanceState> = {};
    const existingMap = new Map<string, ClassAttendanceItem>();
    existingAttendance.forEach((rec: any) => {
      const studentId = typeof rec.student === 'object' && rec.student !== null
        ? rec.student.id || rec.student.pk
        : rec.student || rec.student_id;
      if (studentId) {
        existingMap.set(String(studentId), rec);
      }
    });

    students.forEach((stu) => {
      const exist = existingMap.get(stu.id);
      map[stu.id] = {
        studentId: stu.id,
        studentName: stu.name || `${stu.first_name || ''} ${stu.last_name || ''}`.trim() || 'Learner',
        studentPhone: stu.phone_number || '',
        profilePhoto: stu.profile_photo || exist?.student_photo || null,
        status: (exist?.status as AttendanceStatusType) || 'ABSENT',
        minutesAttended: exist?.minutes_attended || 0,
        notes: exist?.notes || '',
        existingRecordId: exist?.id,
      };
    });

    setRosterAttendance(map);
  }, [students, existingAttendance]);

  // Quick Action: Mark all students
  const handleMarkAll = (status: AttendanceStatusType) => {
    setRosterAttendance((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        next[id] = { ...next[id], status };
      });
      return next;
    });
  };

  // Update single student
  const handleUpdateStudentStatus = (studentId: string, status: AttendanceStatusType) => {
    setRosterAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };


  const handleUpdateStudentNotes = (studentId: string, notes: string) => {
    setRosterAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      },
    }));
  };

  // 8. Save Batch Attendance to Database
  const handleSaveAttendance = async () => {
    if (!selectedClassId) {
      toastError('Please select a live class session first.');
      return;
    }

    const records: BatchAttendancePayloadItem[] = Object.values(rosterAttendance).map((item) => ({
      student_id: item.studentId,
      status: item.status,
      minutes_attended: item.minutesAttended,
      notes: item.notes,
    }));

    if (records.length === 0) {
      toastError('No student attendance records to submit.');
      return;
    }

    setIsSavingAttendance(true);
    try {
      const result = await LiveClassService.getInstance().batchRecordAttendance(
        selectedClassId,
        records
      );
      const isAlreadyRecorded = existingAttendance.length > 0;
      toastSuccess(
        isAlreadyRecorded
          ? `Successfully updated attendance records for ${result.updated_count || records.length} students.`
          : `Successfully saved attendance records for ${result.updated_count || records.length} students.`
      );
      
      // Reload fresh database records and synchronize directly to student list
      const freshRecords = await LiveClassService.getInstance().getClassAttendance(selectedClassId);
      setExistingAttendance(freshRecords);

      const freshMap = new Map<string, ClassAttendanceItem>();
      freshRecords.forEach((rec: any) => {
        const studentId = typeof rec.student === 'object' && rec.student !== null
          ? rec.student.id || rec.student.pk
          : rec.student || rec.student_id;
        if (studentId) {
          freshMap.set(String(studentId), rec);
        }
      });

      setRosterAttendance((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((id) => {
          const fresh = freshMap.get(id);
          if (fresh) {
            next[id] = {
              ...next[id],
              status: fresh.status as AttendanceStatusType,
              minutesAttended: fresh.minutes_attended ?? next[id].minutesAttended,
              notes: fresh.notes ?? next[id].notes,
              existingRecordId: fresh.id,
            };
          }
        });
        return next;
      });
    } catch (err: any) {
      console.error('Failed to save attendance batch:', err);
      toastError(err?.message || 'Failed to save attendance records. Please try again.');
    } finally {
      setIsSavingAttendance(false);
    }
  };

  // 9. Computed metrics & filtered lists
  const selectedClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || null;
  }, [classes, selectedClassId]);


  // Handle Day change
  const handleDayChange = (newDay: string) => {
    setSelectedDayFilter(newDay);
    if (newDay === 'ALL') {
      if (!selectedClassId && classes.length > 0) {
        setSelectedClassId(classes[0].id);
      }
      return;
    }
    const matching = classes.filter((c) => getDayKey(c.scheduledDate) === newDay);
    if (matching.length > 0) {
      const currentClassMatches = selectedClass && getDayKey(selectedClass.scheduledDate) === newDay;
      if (!currentClassMatches) {
        setSelectedClassId(matching[0].id);
      }
    } else {
      setSelectedClassId('');
    }
  };

  // Available unique dates matching current Day filter
  const availableDates = useMemo(() => {
    const matching = selectedDayFilter === 'ALL'
      ? classes
      : classes.filter((c) => getDayKey(c.scheduledDate) === selectedDayFilter);

    const dates: { dateStr: string; dayKey: string }[] = [];
    const seen = new Set<string>();

    matching.forEach((c) => {
      if (c.scheduledDate && !seen.has(c.scheduledDate)) {
        seen.add(c.scheduledDate);
        dates.push({
          dateStr: c.scheduledDate,
          dayKey: getDayKey(c.scheduledDate),
        });
      }
    });

    return dates;
  }, [classes, selectedDayFilter]);

  // Handle Date change
  const handleDateChange = (newDate: string) => {
    if (!newDate) {
      setSelectedClassId('');
      return;
    }
    const matching = classes.filter((c) => c.scheduledDate === newDate);
    if (matching.length > 0) {
      const dayKey = getDayKey(newDate);
      if (dayKey && selectedDayFilter !== 'ALL' && selectedDayFilter !== dayKey) {
        setSelectedDayFilter(dayKey);
      }
      const currentOnDate = matching.find((c) => c.id === selectedClassId);
      if (!currentOnDate) {
        setSelectedClassId(matching[0].id);
      }
    } else {
      setSelectedClassId('');
    }
  };

  // Available sessions/times for the currently active date
  const availableTimeSessions = useMemo(() => {
    const currentDate = selectedClass?.scheduledDate;
    if (!currentDate) return [];
    return classes.filter((c) => c.scheduledDate === currentDate);
  }, [classes, selectedClass]);


  const filteredStudentList = useMemo(() => {
    return Object.values(rosterAttendance).filter((item) => {
      const matchesSearch =
        item.studentName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.studentPhone.includes(searchFilter);
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rosterAttendance, searchFilter, statusFilter]);

  const attendanceStats = useMemo(() => {
    const list = Object.values(rosterAttendance);
    const present = list.filter((s) => s.status === 'PRESENT').length;
    const late = list.filter((s) => s.status === 'LATE').length;
    const absent = list.filter((s) => s.status === 'ABSENT').length;
    const excused = list.filter((s) => s.status === 'EXCUSED').length;
    // EXCUSED weights the exact same as PRESENT
    const attendedCount = present + late + excused;
    const rate = list.length > 0 ? Math.round((attendedCount / list.length) * 100) : 0;

    return {
      total: list.length,
      present,
      late,
      absent,
      excused,
      attendedCount,
      rate,
    };
  }, [rosterAttendance]);

  if (isLoadingClasses && classes.length === 0 && cohorts.length === 0) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <Spinner message="Loading course attendance console..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* ━━━━━━━━ 1. TOP HEADER & COHORT SELECTOR ━━━━━━━━ */}
      <div
        style={{
          padding: '20px 24px',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827', margin: 0 }}>
            {course.title} Attendance
          </h2>
        </div>

        {/* Cohort Selector */}
        {cohorts.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>
              Active Cohort:
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={activeCohortId}
                onChange={(e) => handleSelectCohort(e.target.value)}
                style={{
                  padding: '8px 32px 8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#F9FAFB',
                  color: '#111827',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  appearance: 'none',
                  cursor: 'pointer',
                  minWidth: '220px',
                }}
              >
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.code ? `(${c.code})` : ''} - {c.student_count || 0} Learners
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B7280' }}
              />
            </div>
          </div>
        )}
      </div>


      {/* ━━━━━━━━ 3. SESSION ATTENDANCE ROLL CALL ━━━━━━━━ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Class Session Selector & Details Bar */}
          <div
            style={{
              padding: '18px 20px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              {/* Three Coordinated Dropdowns: Day, Date, Time */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                {/* 1. Day Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1F2937', whiteSpace: 'nowrap' }}>
                    Day:
                  </label>
                  <select
                    value={selectedDayFilter}
                    onChange={(e) => handleDayChange(e.target.value)}
                    disabled={classes.length === 0}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                      color: '#111827',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      cursor: classes.length === 0 ? 'not-allowed' : 'pointer',
                      minWidth: '110px',
                    }}
                  >
                    <option value="ALL">All Days</option>
                    {DAY_OPTIONS.filter((d) => d.key !== 'ALL').map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Date Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1F2937', whiteSpace: 'nowrap' }}>
                    Date:
                  </label>
                  <select
                    value={selectedClass?.scheduledDate || ''}
                    onChange={(e) => handleDateChange(e.target.value)}
                    disabled={availableDates.length === 0}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                      color: '#111827',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      cursor: availableDates.length === 0 ? 'not-allowed' : 'pointer',
                      minWidth: '160px',
                    }}
                  >
                    {availableDates.length === 0 ? (
                      <option value="">No dates available</option>
                    ) : (
                      availableDates.map((d) => (
                        <option key={d.dateStr} value={d.dateStr}>
                          {getDayLabel(d.dayKey)}, {formatDateLabel(d.dateStr)}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* 3. Time Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1F2937', whiteSpace: 'nowrap' }}>
                    Time:
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    disabled={availableTimeSessions.length === 0}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                      color: '#111827',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      cursor: availableTimeSessions.length === 0 ? 'not-allowed' : 'pointer',
                      minWidth: '190px',
                    }}
                  >
                    {availableTimeSessions.length === 0 ? (
                      <option value="">No sessions</option>
                    ) : (
                      availableTimeSessions.map((cls) => {
                        const start = cls.startTime ? cls.startTime.slice(0, 5) : '';
                        const end = cls.endTime ? cls.endTime.slice(0, 5) : '';
                        const timeStr = start && end ? `${start} - ${end}` : start || 'Session';
                        const status = getSessionEffectiveStatus(cls);
                        return (
                          <option key={cls.id} value={cls.id}>
                            {timeStr} • [{status}]
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>
              </div>


            </div>
          </div>

          {/* Controls Bar: Batch Actions, Search, Status Filter & Save Button */}
          <div
            style={{
              padding: '14px 20px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {/* Quick Bulk Marking */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#4B5563' }}>Bulk Mark:</span>
              <button
                type="button"
                onClick={() => handleMarkAll('PRESENT')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  border: '1px solid #86EFAC',
                  backgroundColor: '#F0FDF4',
                  color: '#15803D',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Check size={13} />
                <span>All Present</span>
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('ABSENT')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  border: '1px solid #FECACA',
                  backgroundColor: '#FEF2F2',
                  color: '#B91C1C',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <X size={13} />
                <span>All Absent</span>
              </button>
            </div>

            {/* Filter by Status & Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Search */}
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    fontSize: '0.82rem',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#F9FAFB',
                  }}
                />
              </div>

              {/* Status Select */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.82rem',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  color: '#374151',
                  fontWeight: 600,
                }}
              >
                <option value="ALL">All Statuses ({students.length})</option>
                <option value="PRESENT">Present</option>
                <option value="LATE">Late</option>
                <option value="ABSENT">Absent</option>
                <option value="EXCUSED">Excused</option>
              </select>

              {/* Save / Update Attendance Button */}
              {(() => {
                const isAlreadyRecorded = existingAttendance.length > 0;
                return (
                  <button
                    type="button"
                    onClick={handleSaveAttendance}
                    disabled={isSavingAttendance || !selectedClassId || students.length === 0}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isAlreadyRecorded ? '#0055A5' : '#058728',
                      color: '#FFFFFF',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: isSavingAttendance || !selectedClassId ? 'not-allowed' : 'pointer',
                      opacity: isSavingAttendance || !selectedClassId ? 0.7 : 1,
                      boxShadow: isAlreadyRecorded
                        ? '0 1px 2px rgba(0, 85, 165, 0.2)'
                        : '0 1px 2px rgba(5, 135, 40, 0.2)',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {isSavingAttendance ? (
                      <>
                        <RefreshCw size={14} className="spin" />
                        <span>{isAlreadyRecorded ? 'Updating...' : 'Saving Records...'}</span>
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        <span>
                          {isAlreadyRecorded ? 'Update' : 'Save Attendance'} ({attendanceStats.present} P, {attendanceStats.absent} A)
                        </span>
                      </>
                    )}
                  </button>
                );
              })()}
            </div>
          </div>

          {/* Student Roll Call Table */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              overflow: 'hidden',
            }}
          >
            {isLoadingStudents || isLoadingAttendanceRecords ? (
              <div style={{ padding: '60px 0', textAlign: 'center' }}>
                <Spinner message="Loading cohort roster and attendance records..." />
              </div>
            ) : filteredStudentList.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280', fontSize: '0.90rem' }}>
                {students.length === 0
                  ? 'No students enrolled in this cohort yet.'
                  : 'No students match the active search or status filter.'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '12px 18px', fontWeight: 800 }}>Student</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800 }}>STATUS</th>
                      <th style={{ padding: '12px 18px', fontWeight: 800 }}>Session Notes</th>
                      <th style={{ padding: '12px 18px', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudentList.map((item) => {
                      const initials = item.studentName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <tr
                          key={item.studentId}
                          style={{
                            borderBottom: '1px solid #F3F4F6',
                            backgroundColor:
                              item.status === 'PRESENT'
                                ? '#FFFFFF'
                                : item.status === 'LATE'
                                  ? '#FFFDF5'
                                  : item.status === 'ABSENT'
                                    ? '#FEF8F8'
                                    : '#FFFFFF',
                          }}
                        >
                          {/* Student Info */}
                          <td style={{ padding: '12px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '50%',
                                  backgroundColor: '#E0F2FE',
                                  color: '#0055A5',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.78rem',
                                  fontWeight: 800,
                                  flexShrink: 0,
                                  overflow: 'hidden',
                                }}
                              >
                                {item.profilePhoto ? (
                                  <img
                                    src={item.profilePhoto}
                                    alt={item.studentName}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  initials
                                )}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.90rem' }}>
                                  {item.studentName}
                                </div>
                                <div style={{ fontSize: '0.76rem', color: '#6B7280' }}>
                                  {item.studentPhone || 'No phone recorded'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Status Pill Buttons */}
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              {(['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'] as AttendanceStatusType[]).map(
                                (st) => {
                                  const isSelected = item.status === st;
                                  let bg = '#F3F4F6';
                                  let fg = '#4B5563';
                                  let border = '#E5E7EB';
                                  let label = st.slice(0, 1);

                                  if (st === 'PRESENT') {
                                    label = 'Present';
                                    if (isSelected) {
                                      bg = '#DCFCE7';
                                      fg = '#15803D';
                                      border = '#86EFAC';
                                    }
                                  } else if (st === 'LATE') {
                                    label = 'Late';
                                    if (isSelected) {
                                      bg = '#FEF3C7';
                                      fg = '#B45309';
                                      border = '#FDE68A';
                                    }
                                  } else if (st === 'ABSENT') {
                                    label = 'Absent';
                                    if (isSelected) {
                                      bg = '#FEE2E2';
                                      fg = '#B91C1C';
                                      border = '#FECACA';
                                    }
                                  } else if (st === 'EXCUSED') {
                                    label = 'Excused';
                                    if (isSelected) {
                                      bg = '#E0F2FE';
                                      fg = '#0369A1';
                                      border = '#BAE6FD';
                                    }
                                  }

                                  return (
                                    <button
                                      key={st}
                                      type="button"
                                      onClick={() => handleUpdateStudentStatus(item.studentId, st)}
                                      style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.74rem',
                                        fontWeight: isSelected ? 800 : 600,
                                        backgroundColor: bg,
                                        color: fg,
                                        border: `1px solid ${border}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        boxShadow: isSelected ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
                                      }}
                                    >
                                      {label}
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          </td>


                          {/* Notes */}
                          <td style={{ padding: '12px 18px' }}>
                            <input
                              type="text"
                              value={item.notes}
                              onChange={(e) => handleUpdateStudentNotes(item.studentId, e.target.value)}
                              placeholder="Optional remarks or excuse note..."
                              style={{
                                width: '100%',
                                padding: '4px 8px',
                                fontSize: '0.80rem',
                                borderRadius: '4px',
                                border: '1px solid #E5E7EB',
                                backgroundColor: '#FAFAFA',
                              }}
                            />
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => setInspectStudentId(item.studentId)}
                              style={{
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: '#0055A5',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                              }}
                            >
                              <Eye size={13} />
                              <span>History</span>
                            </button>
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

      {/* ━━━━━━━━ 6. STUDENT HISTORICAL AUDIT DRAWER ━━━━━━━━ */}
      {inspectStudentId && (
        <StudentAttendanceDrawer
          studentId={inspectStudentId}
          onClose={() => setInspectStudentId(null)}
        />
      )}
    </div>
  );
};

export default CourseAttendanceTab;

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Bell,
  X,
  CheckCircle,
  Users,
  ChevronRight,
  FileQuestion,
  Award,
  Video,
  UserCheck,
} from 'lucide-react';
import type { CourseWorkspaceTab } from './CourseSecondaryNav';
import type { CourseAssignmentItem } from '../types';
import { AdminService, type QuizItem } from '../../../../../core/services/AdminService';
import { LiveClassService } from '../../../../../core/services/LiveClassService';
import type { LiveClass } from '../../../../../core/models/LiveClass';
import { TutorLmsService, type CohortActivityItem } from '../../../../../core/services/TutorLmsService';
import { CourseGroupService, type CourseGroupDTO } from '../../../../../core/services/CourseGroupService';

export interface TodoItem {
  id: string;
  title: string;
  points?: number | string;
  dueDate: string;
  rawDateMs: number;
  type: 'quiz' | 'exam' | 'activity' | 'class' | 'discussion' | 'event';
  targetTab?: CourseWorkspaceTab;
  meetUrl?: string;
}

interface FeedbackItem {
  id: string;
  title: string;
  score: string;
  date: string;
  status: 'passed' | 'reviewed';
}

interface CourseRightSidebarProps {
  onNavigateTab: (tab: CourseWorkspaceTab) => void;
  onOpenGroup?: (groupId: string) => void;
  isTutor?: boolean;
  assignments?: CourseAssignmentItem[];
  courseId?: string;
  cohortId?: string | null;
  groups?: CourseGroupDTO[];
}

const formatDueDateLabel = (dateStr?: string | null, defaultLabel = 'Upcoming'): string => {
  if (!dateStr) return defaultLabel;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const month = d.toLocaleDateString(undefined, { month: 'short' });
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    return `${month} ${day} at ${formattedHours}:${minutes}${ampm}`;
  } catch {
    return dateStr;
  }
};

export const CourseRightSidebar: React.FC<CourseRightSidebarProps> = ({
  onNavigateTab,
  onOpenGroup,
  isTutor = false,
  assignments,
  courseId,
  cohortId,
  groups,
}) => {
  const navigate = useNavigate();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [classesData, setClassesData] = useState<LiveClass[]>([]);
  const [activitiesData, setActivitiesData] = useState<CohortActivityItem[]>([]);
  const [fetchedQuizzes, setFetchedQuizzes] = useState<QuizItem[]>([]);
  const [courseGroups, setCourseGroups] = useState<CourseGroupDTO[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadRealData = async () => {
      try {
        const [clsRes, actRes, qzRes, grpRes] = await Promise.allSettled([
          LiveClassService.getInstance().getClasses(cohortId ? { cohort: cohortId } : undefined),
          TutorLmsService.getInstance().getStudentCohortActivities(),
          AdminService.getInstance().getQuizzes(),
          courseId ? CourseGroupService.getInstance().getGroups(courseId) : Promise.resolve([]),
        ]);

        if (!isMounted) return;
        if (clsRes.status === 'fulfilled') setClassesData(clsRes.value || []);
        if (actRes.status === 'fulfilled') setActivitiesData(actRes.value || []);
        if (qzRes.status === 'fulfilled') setFetchedQuizzes(qzRes.value || []);
        if (grpRes.status === 'fulfilled') setCourseGroups(grpRes.value || []);
      } catch (err) {
        console.warn('Failed to load real data for sidebar To Do:', err);
      }
    };
    loadRealData();
    return () => {
      isMounted = false;
    };
  }, [cohortId, courseId]);

  // Compute top 5 upcoming dates prioritizing quizzes, exams, and class activities
  const todoList: TodoItem[] = useMemo(() => {
    const priorityItems: TodoItem[] = [];
    const secondaryItems: TodoItem[] = [];
    const seenIds = new Set<string>();

    // 1. Quizzes from props assignments (if passed)
    if (assignments && assignments.length > 0) {
      for (const a of assignments) {
        if (seenIds.has(a.id) || dismissedIds.has(a.id)) continue;
        seenIds.add(a.id);
        const isExam = a.isFinalExam || a.type?.toLowerCase().includes('exam') || a.title?.toLowerCase().includes('exam');
        const rawMs = a.rawDueDate ? new Date(a.rawDueDate).getTime() : Number.MAX_SAFE_INTEGER;
        priorityItems.push({
          id: a.id,
          title: a.title,
          points: a.points,
          dueDate: a.dueDate || 'Upcoming',
          rawDateMs: isNaN(rawMs) ? Number.MAX_SAFE_INTEGER : rawMs,
          type: isExam ? 'exam' : 'quiz',
          targetTab: 'assignments',
        });
      }
    } else if (fetchedQuizzes && fetchedQuizzes.length > 0) {
      // Fallback: Quizzes from AdminService
      for (const q of fetchedQuizzes) {
        if (!q.is_published || q.status === 'DRAFT') continue;
        if (courseId && q.course && String(q.course) !== String(courseId)) continue;
        if (seenIds.has(q.id) || dismissedIds.has(q.id)) continue;
        seenIds.add(q.id);
        const isExam = q.is_final_exam || q.title?.toLowerCase().includes('exam');
        const dueDateStr = q.deadline || q.closing_date || q.open_date;
        const rawMs = dueDateStr ? new Date(dueDateStr).getTime() : Number.MAX_SAFE_INTEGER;
        priorityItems.push({
          id: q.id,
          title: q.title,
          points: q.total_score || q.calculated_total_points || 20,
          dueDate: formatDueDateLabel(dueDateStr),
          rawDateMs: isNaN(rawMs) ? Number.MAX_SAFE_INTEGER : rawMs,
          type: isExam ? 'exam' : 'quiz',
          targetTab: 'assignments',
        });
      }
    }

    // 2. Class activities / cohort activities (quizzes, exams, assignments -> priority; discussions -> secondary)
    if (activitiesData && activitiesData.length > 0) {
      for (const act of activitiesData) {
        if (seenIds.has(act.id) || dismissedIds.has(act.id)) continue;
        seenIds.add(act.id);
        const rawMs = act.due_date ? new Date(act.due_date).getTime() : Number.MAX_SAFE_INTEGER;
        const actType = act.activity_type?.toUpperCase();

        if (actType === 'QUIZ' || actType === 'EXAM' || actType === 'ASSIGNMENT' || actType === 'ACTIVITY') {
          priorityItems.push({
            id: act.id,
            title: act.title,
            points: act.max_score,
            dueDate: formatDueDateLabel(act.due_date),
            rawDateMs: isNaN(rawMs) ? Number.MAX_SAFE_INTEGER : rawMs,
            type: actType === 'EXAM' ? 'exam' : actType === 'QUIZ' ? 'quiz' : 'activity',
            targetTab: 'assignments',
          });
        } else if (actType === 'DISCUSSION') {
          secondaryItems.push({
            id: act.id,
            title: act.title,
            points: act.max_score ? `${act.max_score} pts` : undefined,
            dueDate: formatDueDateLabel(act.due_date),
            rawDateMs: isNaN(rawMs) ? Number.MAX_SAFE_INTEGER : rawMs,
            type: 'discussion',
            targetTab: 'discussions',
          });
        } else {
          // Event / other
          secondaryItems.push({
            id: act.id,
            title: act.title,
            dueDate: formatDueDateLabel(act.due_date),
            rawDateMs: isNaN(rawMs) ? Number.MAX_SAFE_INTEGER : rawMs,
            type: 'event',
            targetTab: 'live',
          });
        }
      }
    }

    // 3. Upcoming Live Classes / Cohort sessions -> Secondary
    if (classesData && classesData.length > 0) {
      for (const cls of classesData) {
        if (seenIds.has(cls.id) || dismissedIds.has(cls.id)) continue;
        seenIds.add(cls.id);
        const timePart = cls.startTime ? cls.startTime.slice(0, 5) : '18:00';
        const rawMs = cls.scheduledDate ? new Date(`${cls.scheduledDate}T${timePart}:00`).getTime() : Number.MAX_SAFE_INTEGER;
        secondaryItems.push({
          id: cls.id,
          title: `Live Class: ${cls.title}`,
          dueDate: `${cls.scheduledDate} • ${cls.getFormattedTimeRange()}`,
          rawDateMs: isNaN(rawMs) ? Number.MAX_SAFE_INTEGER : rawMs,
          type: 'class',
          targetTab: 'live',
          meetUrl: cls.googleMeetUrl,
        });
      }
    }

    // Sort priority items by rawDateMs ascending (nearest upcoming first)
    priorityItems.sort((a, b) => a.rawDateMs - b.rawDateMs);

    // Sort secondary items by rawDateMs ascending (nearest upcoming first)
    secondaryItems.sort((a, b) => a.rawDateMs - b.rawDateMs);

    // Prioritization Rule:
    // Top 5 upcoming dates total.
    // Quizzes, exams, or class activities are the priorities.
    // If there are 6 upcoming quizzes, to do list will only be filled with quizzes (top 5).
    // If only 2 upcoming quizzes, there will still be 3 free slots available for other upcoming dates.
    const MAX_ITEMS = 5;
    const topPriority = priorityItems.slice(0, MAX_ITEMS);
    const freeSlots = MAX_ITEMS - topPriority.length;
    const topSecondary = freeSlots > 0 ? secondaryItems.slice(0, freeSlots) : [];

    return [...topPriority, ...topSecondary];
  }, [assignments, fetchedQuizzes, activitiesData, classesData, dismissedIds, courseId]);

  // Top 3 recent active groups
  const topGroups = useMemo(() => {
    const list = groups && groups.length > 0 ? groups : courseGroups;
    return list.slice(0, 3);
  }, [groups, courseGroups]);

  const recentFeedback: FeedbackItem[] = useMemo(() => {
    if (!assignments || assignments.length === 0) return [];
    return assignments
      .filter((a) => Boolean(a.score && a.gradesPublished))
      .slice(0, 3)
      .map((a) => ({
        id: a.id,
        title: a.title,
        score: a.score || '',
        date: a.dueDate || 'Graded',
        status: 'passed',
      }));
  }, [assignments]);

  const handleDismissTodo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const handleItemClick = (item: TodoItem) => {
    if (item.targetTab) {
      onNavigateTab(item.targetTab);
    } else if (item.type === 'class') {
      onNavigateTab('live');
    } else if (item.type === 'discussion') {
      onNavigateTab('discussions');
    } else {
      onNavigateTab('assignments');
    }
  };

  const renderTodoIcon = (type: TodoItem['type']) => {
    switch (type) {
      case 'quiz':
        return <FileQuestion size={16} color="#0055A5" style={{ marginTop: '2px', flexShrink: 0 }} />;
      case 'exam':
        return <Award size={16} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />;
      case 'activity':
        return <CheckCircle size={16} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />;
      case 'class':
        return <Video size={16} color="#0055A5" style={{ marginTop: '2px', flexShrink: 0 }} />;
      case 'discussion':
        return <Bell size={16} color="#7C3AED" style={{ marginTop: '2px', flexShrink: 0 }} />;
      default:
        return <Calendar size={16} color="#2563EB" style={{ marginTop: '2px', flexShrink: 0 }} />;
    }
  };

  return (
    <aside
      aria-label="Course actions and sidebar"
      style={{
        width: '300px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        paddingLeft: '20px',
        borderLeft: '1px solid #E5E7EB',
      }}
    >
      {/* 1. Quick Action Buttons (matching Canvas LMS) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => navigate('/calendar')}
          className="canvas-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '10px',
            fontSize: '0.92rem',
            padding: '9px 14px',
            fontWeight: 500,
            color: '#2D3B45',
            backgroundColor: '#F5F5F5',
            border: '1px solid #C7CDD1',
            borderRadius: '3px',
            width: '100%',
            cursor: 'pointer',
          }}
        >
          <Calendar size={16} color="#0055A5" />
          <span>View Course Calendar</span>
        </button>

        <button
          onClick={() => onNavigateTab('announcements')}
          className="canvas-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '10px',
            fontSize: '0.92rem',
            padding: '9px 14px',
            fontWeight: 500,
            color: '#2D3B45',
            backgroundColor: '#F5F5F5',
            border: '1px solid #C7CDD1',
            borderRadius: '3px',
            width: '100%',
          }}
        >
          <Bell size={16} color="#0055A5" />
          <span>View Course Notifications</span>
        </button>
      </div>

      {/* 2. To Do Section */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            borderBottom: '1px solid #E5E7EB',
            paddingBottom: '8px',
          }}
        >
          <h4
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#C22B14',
              margin: 0,
            }}
          >
            To Do
          </h4>
          <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>
            {todoList.length} items
          </span>
        </div>

        {todoList.length === 0 ? (
          <div
            style={{
              fontSize: '0.85rem',
              color: '#6B7280',
              fontStyle: 'italic',
              padding: '12px 0',
              textAlign: 'center',
            }}
          >
            Nothing due right now. You are all caught up!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todoList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '9px 10px',
                  borderRadius: '3px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #F1F5F9',
                  cursor: 'pointer',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#F1F5F9';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
                  {renderTodoIcon(item.type)}
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: 600,
                        color: '#0055A5',
                        lineHeight: 1.35,
                        textDecoration: 'underline',
                      }}
                    >
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#555555', marginTop: '3px' }}>
                      {item.points !== undefined ? `${item.points} pts • ` : ''}{item.dueDate}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDismissTodo(item.id, e)}
                  title="Dismiss from To Do"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    padding: '2px',
                    marginLeft: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#D9381E')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Course Groups Section */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            borderBottom: '1px solid #E5E7EB',
            paddingBottom: '8px',
          }}
        >
          <h4
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#C22B14',
              margin: 0,
            }}
          >
            Course Groups
          </h4>
          <button
            onClick={() => onNavigateTab('people')}
            style={{
              background: 'none',
              border: 'none',
              color: '#0055A5',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            View All
          </button>
        </div>

        {topGroups.length === 0 ? (
          <div
            style={{
              fontSize: '0.85rem',
              color: '#6B7280',
              fontStyle: 'italic',
              padding: '12px 0',
              textAlign: 'center',
            }}
          >
            No active course groups yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topGroups.map((grp) => (
              <div
                key={grp.id}
                onClick={() => {
                  onNavigateTab('people');
                  if (onOpenGroup) onOpenGroup(grp.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '3px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #F1F5F9',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease, border-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#F1F5F9';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                  <Users size={16} color="#0055A5" style={{ flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#0055A5',
                        textDecoration: 'underline',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {grp.name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6B7280',
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{grp.members_count} {grp.members_count === 1 ? 'member' : 'members'}</span>
                      {grp.last_activity && (
                        <>
                          <span>•</span>
                          <span>{grp.last_activity}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight size={14} color="#9CA3AF" style={{ flexShrink: 0, marginLeft: '6px' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tutor Quick Action: Attendance & Readiness */}
      {isTutor && (
        <div style={{ marginTop: '4px' }}>
          <button
            type="button"
            onClick={() => onNavigateTab('attendance')}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '4px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#F8FAFC',
              color: '#0055A5',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            }}
          >
            <UserCheck size={16} color="#058728" />
            <span>Take Session Attendance</span>
          </button>
        </div>
      )}

      {/* 4. Recent Feedback Section (Students only) */}
      {!isTutor && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              borderBottom: '1px solid #E5E7EB',
              paddingBottom: '8px',
            }}
          >
            <h4
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#C22B14',
                margin: 0,
              }}
            >
              Recent Feedback
            </h4>
            <button
              onClick={() => onNavigateTab('grades')}
              style={{
                background: 'none',
                border: 'none',
                color: '#0055A5',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Grades
            </button>
          </div>

          {recentFeedback.length === 0 ? (
            <div style={{ fontSize: '0.82rem', color: '#64748B', fontStyle: 'italic', padding: '8px 0' }}>
              No graded feedback published yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentFeedback.map((fb) => (
              <div
                key={fb.id}
                onClick={() => onNavigateTab('grades')}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '3px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #F1F5F9',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
              >
                <CheckCircle size={16} color="#058728" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#0055A5',
                      lineHeight: 1.3,
                      textDecoration: 'underline',
                    }}
                  >
                    {fb.title}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#166534', fontWeight: 700, marginTop: '2px' }}>
                    {fb.score}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#888888', marginTop: '1px' }}>{fb.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </aside>
  );
};

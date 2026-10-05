import React, { useState } from 'react';
import {
  Activity,
  Calendar,
  Bell,
  X,
  CheckCircle,
  Users,
  ChevronRight,
  FileQuestion,
} from 'lucide-react';
import type { CourseWorkspaceTab } from './CourseSecondaryNav';

interface TodoItem {
  id: string;
  title: string;
  points: number;
  dueDate: string;
  type: 'quiz' | 'assignment' | 'discussion';
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
}

export const CourseRightSidebar: React.FC<CourseRightSidebarProps> = ({
  onNavigateTab,
  onOpenGroup,
  isTutor = false,
}) => {
  const [todoList, setTodoList] = useState<TodoItem[]>([
    {
      id: 'todo-1',
      title: 'Quiz 3: Intersections & Priority Rules',
      points: 100,
      dueDate: 'Oct 6 at 11:59pm',
      type: 'quiz',
    },
    {
      id: 'todo-2',
      title: 'Mock Exam: Speed Limits & Signs (20 Questions)',
      points: 20,
      dueDate: 'Oct 8 at 8:00pm',
      type: 'quiz',
    },
    {
      id: 'todo-3',
      title: 'Discussion Post: Overtaking on Steep Slopes',
      points: 15,
      dueDate: 'Oct 10 at 11:59pm',
      type: 'discussion',
    },
  ]);

  const courseGroups = [
    {
      id: 'grp-1',
      name: 'Kigali Theory Study Group 1',
      membersCount: 8,
      lastActivity: '10m ago',
    },
    {
      id: 'grp-2',
      name: 'Roundabout Mastery Circle',
      membersCount: 5,
      lastActivity: '1h ago',
    },
    {
      id: 'grp-3',
      name: 'Weekend Cat B Learners',
      membersCount: 12,
      lastActivity: 'Yesterday',
    },
  ];

  const recentFeedback: FeedbackItem[] = [
    {
      id: 'fb-1',
      title: 'Road Signs Identification Quiz',
      score: '19 / 20 pts',
      date: 'Oct 2 at 4:15pm',
      status: 'passed',
    },
    {
      id: 'fb-2',
      title: 'Right-of-Way Priority Assessment',
      score: '100% (20/20)',
      date: 'Sep 29 at 8:40pm',
      status: 'passed',
    },
    {
      id: 'fb-3',
      title: 'Mechanical Safety & Police Signals',
      score: '18 / 20 pts',
      date: 'Sep 25 at 6:30pm',
      status: 'passed',
    },
  ];

  const handleDismissTodo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTodoList((prev) => prev.filter((item) => item.id !== id));
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
          <Activity size={16} color="#0055A5" />
          <span>View Course Stream</span>
        </button>

        <button
          onClick={() => onNavigateTab('live')}
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
                onClick={() => onNavigateTab('assignments')}
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
                  <FileQuestion size={16} color="#0055A5" style={{ marginTop: '2px', flexShrink: 0 }} />
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
                      {item.points} points • {item.dueDate}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {courseGroups.map((grp) => (
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
                padding: '8px 12px',
                borderRadius: '3px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #F1F5F9',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                <Users size={15} color="#0055A5" style={{ flexShrink: 0 }} />
                <span
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
                </span>
              </div>
              <ChevronRight size={14} color="#9CA3AF" />
            </div>
          ))}
        </div>
      </div>

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
        </div>
      )}
    </aside>
  );
};

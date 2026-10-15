import React from 'react';
import { Menu, ChevronRight, Users } from 'lucide-react';
import type { CourseWorkspaceTab } from '../types/courseWorkspace.types';

export interface CourseBreadcrumbsProps {
  courseTitle: string;
  onBackToCourses?: () => void;
  navCollapsed: boolean;
  setNavCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  activeTab: CourseWorkspaceTab;
  setActiveTab: (tab: CourseWorkspaceTab) => void;
  selectedLessonId: string | null;
  activeLessonTitle?: string | null;
  handleCloseLesson: () => void;
  selectedAssignmentId: string | null;
  selectedAssignmentTitle?: string | null;
  handleCloseAssignment: () => void;
  isGradingView: boolean;
  handleExitGradingView: () => void;
  reviewParam: string | null;
  reviewParamTitle?: string | null;
  handleCloseGradeReview: () => void;
  activeGroupId: string | null;
  handleCloseGroup: () => void;
  reviewSubmissionsActivity: any | null;
  setReviewSubmissionsActivity: (act: any | null) => void;
  isTutor: boolean;
  tutorCohorts: any[];
  activeCohortId: string | null;
  onCohortChange: (cohortId: string) => void;
}

export const CourseBreadcrumbs: React.FC<CourseBreadcrumbsProps> = ({
  courseTitle,
  onBackToCourses,
  navCollapsed: _navCollapsed,
  setNavCollapsed,
  activeTab,
  setActiveTab,
  selectedLessonId,
  activeLessonTitle,
  handleCloseLesson,
  selectedAssignmentId,
  selectedAssignmentTitle,
  handleCloseAssignment,
  isGradingView,
  handleExitGradingView,
  reviewParam,
  reviewParamTitle,
  handleCloseGradeReview,
  activeGroupId,
  handleCloseGroup,
  reviewSubmissionsActivity,
  setReviewSubmissionsActivity,
  isTutor,
  tutorCohorts,
  activeCohortId,
  onCohortChange,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 32px 12px 24px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #D0D5DD',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={() => setNavCollapsed((prev) => !prev)}
          className="canvas-btn"
          title="Toggle Course Navigation"
          style={{
            padding: '6px 8px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Menu size={20} color="#2D3B45" />
        </button>

        {/* Breadcrumb Trail matching Canvas LMS: Hamburger > Courses > Course_Title > Modules > Lesson_Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.02rem', flexWrap: 'wrap' }}>
          {onBackToCourses && (
            <>
              <button
                onClick={onBackToCourses}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0055A5',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1.02rem',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Courses
              </button>
              <ChevronRight size={15} color="#9CA3AF" />
            </>
          )}
          <span
            onClick={() => {
              setActiveTab('home');
              handleCloseLesson();
            }}
            style={{
              color: '#1E293B',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {courseTitle.replace(/\s+/g, '_')}
          </span>

          {activeTab !== 'home' && (
            <>
              <ChevronRight size={15} color="#9CA3AF" />
              <span
                onClick={() => {
                  if (activeTab === 'assignments') {
                    handleCloseAssignment();
                  } else if (activeTab === 'modules') {
                    handleCloseLesson();
                  } else if (activeTab === 'people') {
                    handleCloseGroup();
                  } else if (activeTab === 'grades') {
                    handleCloseGradeReview();
                  }
                }}
                style={{
                  color:
                    (selectedLessonId && activeTab === 'modules') ||
                    (selectedAssignmentId && activeTab === 'assignments') ||
                    (reviewParam && activeTab === 'grades') ||
                    (activeTab === 'people' && activeGroupId)
                      ? '#0055A5'
                      : '#2D3B45',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  cursor:
                    (selectedLessonId && activeTab === 'modules') ||
                    (selectedAssignmentId && activeTab === 'assignments') ||
                    (reviewParam && activeTab === 'grades') ||
                    (activeTab === 'people' && activeGroupId)
                      ? 'pointer'
                      : 'default',
                  textDecoration:
                    (selectedLessonId && activeTab === 'modules') ||
                    (selectedAssignmentId && activeTab === 'assignments') ||
                    (reviewParam && activeTab === 'grades') ||
                    (activeTab === 'people' && activeGroupId)
                      ? 'underline'
                      : 'none',
                }}
              >
                {activeTab}
              </span>
            </>
          )}

          {activeTab === 'grades' && reviewParam && (
            <>
              <ChevronRight size={15} color="#9CA3AF" />
              <span style={{ color: '#2D3B45', fontWeight: 600 }}>
                {reviewParam === 'attendance'
                  ? 'Roll Call Attendance'
                  : reviewParamTitle || 'Assessment Review'}
              </span>
            </>
          )}

          {activeTab === 'people' && activeGroupId && (
            <>
              <ChevronRight size={15} color="#9CA3AF" />
              <span style={{ color: '#2D3B45', fontWeight: 600 }}>
                Group Chat
              </span>
            </>
          )}

          {activeTab === 'modules' && selectedLessonId && activeLessonTitle && (
            <>
              <ChevronRight size={15} color="#9CA3AF" />
              <span style={{ color: '#2D3B45', fontWeight: 600 }}>
                {activeLessonTitle}
              </span>
            </>
          )}

          {activeTab === 'assignments' && selectedAssignmentId && (
            <>
              <ChevronRight size={15} color="#9CA3AF" />
              <span
                onClick={() => {
                  if (isGradingView) {
                    handleExitGradingView();
                  }
                }}
                style={{
                  color: isGradingView ? '#0055A5' : '#2D3B45',
                  fontWeight: 600,
                  cursor: isGradingView ? 'pointer' : 'default',
                  textDecoration: isGradingView ? 'underline' : 'none',
                }}
              >
                {selectedAssignmentTitle || 'Assessment'}
              </span>
              {isGradingView && isTutor && (
                <>
                  <ChevronRight size={15} color="#9CA3AF" />
                  <span style={{ color: '#2D3B45', fontWeight: 700 }}>Grading</span>
                </>
              )}
            </>
          )}

          {reviewSubmissionsActivity && (
            <>
              <ChevronRight size={15} color="#9CA3AF" />
              <span
                onClick={() => setReviewSubmissionsActivity(null)}
                style={{
                  color: '#0055A5',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {reviewSubmissionsActivity.title}
              </span>
              <ChevronRight size={15} color="#9CA3AF" />
              <span style={{ color: '#2D3B45', fontWeight: 700 }}>
                Submissions
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right side of Top Bar: Tutor Cohort Selector */}
      {isTutor && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#F8FAFC',
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} color="#0055A5" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
              Active Cohort:
            </span>
          </div>
          {tutorCohorts.length > 0 ? (
            <select
              id="tutor-cohort-selector"
              value={activeCohortId || ''}
              onChange={(e) => onCohortChange(e.target.value)}
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#1E293B',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {tutorCohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>Default Cohort</span>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseBreadcrumbs;

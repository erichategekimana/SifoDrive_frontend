import React from 'react';
import {
  ArrowLeft,
  CheckCircle,
  Award,
  Check,
  Lock,
  Clock,
} from 'lucide-react';
import type { CourseAssignmentItem } from '../types/courseWorkspace.types';

interface TutorGradingViewProps {
  currentAsg: CourseAssignmentItem;
  activeCohortName: string;
  submissionsWithStudent: any[];
  assignmentFilter: 'all' | 'completed' | 'pending';
  setAssignmentFilter: (filter: 'all' | 'completed' | 'pending') => void;
  onExitGradingView: () => void;
  onAutoGradeCompleted: (asgId: string) => void;
  onPublishGrades: (asgId: string) => void;
  onSelectStudentForGrading: (student: any) => void;
}

export const TutorGradingView: React.FC<TutorGradingViewProps> = ({
  currentAsg,
  activeCohortName,
  submissionsWithStudent,
  assignmentFilter,
  setAssignmentFilter,
  onExitGradingView,
  onAutoGradeCompleted,
  onPublishGrades,
  onSelectStudentForGrading,
}) => {
  const isOpenPassed = !currentAsg.rawOpenDate || new Date(currentAsg.rawOpenDate) <= new Date();
  const isDuePassed = !currentAsg.rawDueDate || new Date(currentAsg.rawDueDate) <= new Date();
  const canPublish = isOpenPassed && isDuePassed;
  const gradedCount = submissionsWithStudent.filter((s) => s.score).length;

  const completedList = submissionsWithStudent.filter((s) => s.completed);
  const pendingList = submissionsWithStudent.filter((s) => !s.completed);
  const filteredList =
    assignmentFilter === 'completed'
      ? completedList
      : assignmentFilter === 'pending'
      ? pendingList
      : submissionsWithStudent;

  const completionPercent = Math.round(
    (completedList.length / (submissionsWithStudent.length || 1)) * 100
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Bar: Back Button & Context Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={onExitGradingView}
            className="canvas-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            title="Return to Assignment Details"
          >
            <ArrowLeft size={14} />
            <span>Back to Assignment Details</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                {currentAsg.title}
              </h2>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
              Cohort: <strong style={{ color: '#1E293B' }}>{activeCohortName}</strong> &bull; Due: {currentAsg.dueDate || 'No Due Date'} &bull; Points: {currentAsg.points}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onAutoGradeCompleted(currentAsg.id)}
            className="canvas-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '0.76rem',
              fontWeight: 600,
              backgroundColor: '#F8FAFC',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            title="Auto-grade all completed submissions without recorded scores"
          >
            <CheckCircle size={13} color="#0055A5" />
            <span>Auto-Grade Completed</span>
          </button>
        </div>
      </div>

      {/* Assessment Grading & Student Roster */}
      <div
        id="assignment-grading-section"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '20px',
          backgroundColor: '#FFFFFF',
          borderRadius: '6px',
          border: '1px solid #CBD5E1',
        }}
      >
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingBottom: '14px',
            borderBottom: '2px solid #E2E8F0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #BFDBFE',
              }}
            >
              <Award size={18} color="#0055A5" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                Assessment Grading & Student Roster
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0 0' }}>
                Grade cohort submissions, review scores, track completion, and release grades once due date has arrived.
              </p>
            </div>
          </div>
        </div>

        {/* Tutor Action Toolbar & Grade Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            backgroundColor: '#F8FAFC',
            padding: '14px 18px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
                Roster Completion
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0055A5', marginTop: '1px' }}>
                {completedList.length} of {submissionsWithStudent.length} ({completionPercent}%)
              </div>
            </div>
            <div style={{ height: '26px', width: '1px', backgroundColor: '#CBD5E1' }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
                Graded Submissions
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#334155', marginTop: '1px' }}>
                {gradedCount} of {submissionsWithStudent.length}
              </div>
            </div>
            <div style={{ height: '26px', width: '1px', backgroundColor: '#CBD5E1' }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
                Grade Publishing Status
              </div>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: currentAsg.gradesPublished ? '#15803D' : !canPublish ? '#B45309' : '#0055A5',
                  marginTop: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                {currentAsg.gradesPublished ? (
                  <>
                    <Check size={14} color="#15803D" />
                    <span>Grades Published to Students</span>
                  </>
                ) : !isOpenPassed ? (
                  <>
                    <Lock size={13} color="#B45309" />
                    <span>Awaiting Open Date ({currentAsg.openDate})</span>
                  </>
                ) : !isDuePassed ? (
                  <>
                    <Clock size={13} color="#B45309" />
                    <span>Awaiting Due Date ({currentAsg.dueDate})</span>
                  </>
                ) : (
                  <>
                    <Clock size={13} color="#0055A5" />
                    <span>Dates Passed — Ready to Publish</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!currentAsg.gradesPublished ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onPublishGrades(currentAsg.id)}
                  disabled={!canPublish}
                  className="canvas-btn"
                  style={{
                    padding: '7px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    backgroundColor: canPublish ? '#0055A5' : '#94A3B8',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: canPublish ? 'pointer' : 'not-allowed',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: canPublish ? 1 : 0.75,
                  }}
                  title={
                    canPublish
                      ? 'Publish grades to all students in this cohort'
                      : !isOpenPassed
                      ? `Grades cannot be published until the open date has arrived (${currentAsg.openDate})`
                      : `Grades cannot be published until the due date has passed (${currentAsg.dueDate})`
                  }
                >
                  {canPublish ? <Check size={14} /> : <Lock size={14} />}
                  <span>
                    {canPublish
                      ? 'Publish Grades'
                      : !isOpenPassed
                      ? 'Grades Locked (Open Date Pending)'
                      : 'Grades Locked (Due Date Pending)'}
                  </span>
                </button>
              </div>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#15803D',
                  backgroundColor: '#DCFCE7',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: '1px solid #BBF7D0',
                }}
              >
                <Check size={14} />
                <span>Grades Published to Students</span>
              </span>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: '8px',
          }}
        >
          <button
            onClick={() => setAssignmentFilter('all')}
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: 'none',
              background: assignmentFilter === 'all' ? '#0055A5' : '#F1F5F9',
              color: assignmentFilter === 'all' ? '#FFFFFF' : '#475569',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            All Students ({submissionsWithStudent.length})
          </button>
          <button
            onClick={() => setAssignmentFilter('completed')}
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: 'none',
              background: assignmentFilter === 'completed' ? '#0055A5' : '#F1F5F9',
              color: assignmentFilter === 'completed' ? '#FFFFFF' : '#475569',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Completed ({completedList.length})
          </button>
          <button
            onClick={() => setAssignmentFilter('pending')}
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: 'none',
              background: assignmentFilter === 'pending' ? '#0055A5' : '#F1F5F9',
              color: assignmentFilter === 'pending' ? '#FFFFFF' : '#475569',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Not Completed ({pendingList.length})
          </button>
        </div>

        {/* Student Submissions Table */}
        <div className="canvas-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '12px 18px',
              backgroundColor: '#F8FAFC',
              borderBottom: '1px solid #E5E7EB',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1.2fr 1fr 1.2fr 1fr',
              fontWeight: 700,
              fontSize: '0.78rem',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <div>Student Name</div>
            <div>Student ID</div>
            <div>Status</div>
            <div>Score</div>
            <div>Submitted Date</div>
            <div style={{ textAlign: 'right' }}>Grading Action</div>
          </div>

          <div>
            {filteredList.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontSize: '0.86rem' }}>
                No students found for this filter.
              </div>
            ) : (
              filteredList.map((st) => (
                <div
                  key={st.studentId}
                  onClick={() =>
                    onSelectStudentForGrading({
                      studentId: st.studentId,
                      name: st.name,
                      studentRollNo: st.studentRollNo,
                      category: st.category,
                      score: st.score || '',
                      feedback: st.feedback || '',
                      completed: st.completed,
                      submissionId: (st as any).submissionId,
                      rawSubmission: (st as any).rawSubmission,
                    })
                  }
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid #F1F5F9',
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1.2fr 1fr 1.2fr 1fr',
                    alignItems: 'center',
                    fontSize: '0.84rem',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  title={`Click to view submission and grade ${st.name}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: '#F1F5F9',
                        color: '#1E293B',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #CBD5E1',
                      }}
                    >
                      {st.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1E293B' }}>{st.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{st.category}</div>
                    </div>
                  </div>

                  <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {st.studentRollNo}
                  </div>

                  <div>
                    {st.completed ? (
                      st.isLate ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: '#B45309',
                            backgroundColor: '#FEF3C7',
                            padding: '3px 8px',
                            borderRadius: '3px',
                            border: '1px solid #FDE68A',
                          }}
                        >
                          <Clock size={12} />
                          <span>Late ({st.daysLate || 1} day{st.daysLate === 1 ? '' : 's'} late)</span>
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: '#15803D',
                            backgroundColor: '#F0FDF4',
                            padding: '3px 8px',
                            borderRadius: '3px',
                            border: '1px solid #DCFCE7',
                          }}
                        >
                          <Check size={12} />
                          <span>Completed</span>
                        </span>
                      )
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          color: '#64748B',
                          backgroundColor: '#F8FAFC',
                          padding: '3px 8px',
                          borderRadius: '3px',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <Clock size={12} />
                        <span>Not Completed</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, color: st.completed ? '#0055A5' : '#94A3B8' }}>
                      {st.score || '—'}
                    </div>
                    {Boolean((st as any).rawSubmission?.is_grade_overridden) && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#92400E',
                          backgroundColor: '#FEF3C7',
                          border: '1px solid #FDE68A',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          marginTop: '3px',
                        }}
                        title={`Original auto score: ${(st as any).rawSubmission?.auto_score ?? 'auto'} pts. Edited by ${(st as any).rawSubmission?.grade_overridden_by_name || 'Tutor'}`}
                      >
                        <span>Edited by {(st as any).rawSubmission?.grade_overridden_by_name || 'Tutor'}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ color: '#64748B', fontSize: '0.78rem' }}>
                    {st.submittedAt || '—'}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStudentForGrading({
                          studentId: st.studentId,
                          name: st.name,
                          studentRollNo: st.studentRollNo,
                          category: st.category,
                          score: st.score || '',
                          feedback: st.feedback || '',
                          completed: st.completed,
                          submissionId: (st as any).submissionId,
                          rawSubmission: (st as any).rawSubmission,
                        });
                      }}
                      className="canvas-btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: '#FFFFFF',
                        color: st.completed ? '#0055A5' : '#64748B',
                        border: `1px solid ${st.completed ? '#0055A5' : '#CBD5E1'}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                      title={st.completed ? `Grade or update score for ${st.name}` : `View submission status for ${st.name}`}
                    >
                      {st.completed ? (
                        <>
                          <Award size={13} />
                          <span>{st.score ? 'Edit Grade' : 'Grade'}</span>
                        </>
                      ) : (
                        <>
                          <Clock size={13} />
                          <span>Pending</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorGradingView;

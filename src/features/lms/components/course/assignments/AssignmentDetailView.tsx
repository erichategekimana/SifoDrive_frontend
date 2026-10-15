import React from 'react';
import {
  ArrowLeft,
  Lock,
  Unlock,
  Edit2,
  Users,
  Check,
  Loader2,
  Award,
  Settings,
  CheckCircle,
  Clock,
  FileText,
  Download,
  ExternalLink,
  PenTool,
  ChevronRight,
  Presentation,
  BookOpen,
} from 'lucide-react';
import { PdfViewer } from '../../common/PdfViewer';
import type { CourseAssignmentItem } from '../types';
import { formatD } from '../utils/dateUtils';

export interface AssignmentDetailViewProps {
  currentAsg: CourseAssignmentItem;
  isTutor: boolean;
  activeCohortName: string;
  togglingLockActivityId?: string | null;
  publishingGradesActivityId?: string | null;
  togglingQuizLockId?: string | null;
  onCloseAssignment: () => void;
  onToggleActivityLock: (actRaw: any) => void;
  onEditActivity: (actRaw: any) => void;
  onReviewSubmissions: (actRaw: any) => void;
  onPublishGradesDirect: (actRaw: any) => void;
  onToggleQuizLock: (quizId: string) => void;
  onUpdateQuiz: (asg: CourseAssignmentItem) => void;
  onOpenGradingView: () => void;
  onWorkOnActivity: (actRaw: any) => void;
  onTakeQuiz: (quizId: string) => void;
}

export const AssignmentDetailView: React.FC<AssignmentDetailViewProps> = ({
  currentAsg,
  isTutor,
  activeCohortName,
  togglingLockActivityId,
  publishingGradesActivityId,
  togglingQuizLockId,
  onCloseAssignment,
  onToggleActivityLock,
  onEditActivity,
  onReviewSubmissions,
  onPublishGradesDirect,
  onToggleQuizLock,
  onUpdateQuiz,
  onOpenGradingView,
  onWorkOnActivity,
  onTakeQuiz,
}) => {
  const isAct = Boolean(currentAsg.isCohortActivity && currentAsg.activityRaw);
  const actRaw = currentAsg.activityRaw;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Bar: Context Header */}
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
          {isTutor && (
            <button
              type="button"
              onClick={onCloseAssignment}
              className="canvas-btn"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                backgroundColor: '#FFFFFF',
                color: '#334155',
                border: '1px solid #CBD5E1',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Assignments</span>
            </button>
          )}
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
            {currentAsg.title}
          </h2>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '4px',
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: isAct ? '#EFF6FF' : '#F1F5F9',
              color: isAct ? '#1D4ED8' : '#475569',
            }}
          >
            {currentAsg.type}
          </span>
          {isTutor && (
            <span
              style={{
                padding: '3px 10px',
                borderRadius: '4px',
                fontSize: '0.74rem',
                fontWeight: 700,
                backgroundColor: currentAsg.isLocked ? '#FEE2E2' : '#DCFCE7',
                color: currentAsg.isLocked ? '#DC2626' : '#15803D',
                border: `1px solid ${currentAsg.isLocked ? '#FECACA' : '#BBF7D0'}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {currentAsg.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
              <span>{currentAsg.isLocked ? 'Locked for Cohort' : 'Unlocked for Cohort'}</span>
            </span>
          )}
        </div>

        {/* Tutor Actions Toolbar */}
        {isTutor && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isAct && actRaw ? (
              <>
                <button
                  type="button"
                  disabled={togglingLockActivityId === actRaw.id}
                  onClick={() => onToggleActivityLock(actRaw)}
                  className="canvas-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    backgroundColor: currentAsg.isLocked ? '#0055A5' : '#FFFFFF',
                    color: currentAsg.isLocked ? '#FFFFFF' : '#475569',
                    border: '1px solid #CBD5E1',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  title={currentAsg.isLocked ? `Unlock for ${activeCohortName}` : `Lock for ${activeCohortName}`}
                >
                  {currentAsg.isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                  <span>{currentAsg.isLocked ? 'Unlock' : 'Lock'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onEditActivity(actRaw)}
                  className="canvas-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    border: '1px solid #CBD5E1',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  title="Edit Activity"
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => onReviewSubmissions(actRaw)}
                  className="canvas-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    backgroundColor: '#0055A5',
                    color: '#FFFFFF',
                    border: '1px solid #0055A5',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                  title="Review student submissions and award grades"
                >
                  <Users size={14} />
                  <span>Submissions ({actRaw.submission_count || 0})</span>
                </button>
                {actRaw.grades_published ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      backgroundColor: '#DCFCE7',
                      color: '#15803D',
                      borderRadius: '4px',
                      border: '1px solid #BBF7D0',
                    }}
                    title="Grades are published and visible to cohort students"
                  >
                    <Check size={14} />
                    <span>Grades Published</span>
                  </span>
                ) : actRaw.open_date && new Date(actRaw.open_date).getTime() > Date.now() ? (
                  <button
                    type="button"
                    disabled
                    className="canvas-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      backgroundColor: '#F3F4F6',
                      color: '#9CA3AF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '4px',
                      cursor: 'not-allowed',
                    }}
                    title={`Grades cannot be published until the activity has opened (${new Date(actRaw.open_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })})`}
                  >
                    <Lock size={13} />
                    <span>Grades Locked (Open Date Pending)</span>
                  </button>
                ) : actRaw.due_date && new Date(actRaw.due_date).getTime() > Date.now() ? (
                  <button
                    type="button"
                    disabled
                    className="canvas-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      backgroundColor: '#F3F4F6',
                      color: '#9CA3AF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '4px',
                      cursor: 'not-allowed',
                    }}
                    title={`Grades cannot be published until the activity deadline has passed (${new Date(actRaw.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })})`}
                  >
                    <Lock size={13} />
                    <span>Grades Locked (Due Date Pending)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={publishingGradesActivityId === actRaw.id}
                    onClick={() => onPublishGradesDirect(actRaw)}
                    className="canvas-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      backgroundColor: '#15803D',
                      color: '#FFFFFF',
                      border: '1px solid #15803D',
                      borderRadius: '4px',
                      cursor: publishingGradesActivityId === actRaw.id ? 'wait' : 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                    title="Publish grades to make scores visible to students"
                  >
                    {publishingGradesActivityId === actRaw.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Award size={14} />
                    )}
                    <span>Publish Grades</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={togglingQuizLockId === currentAsg.id}
                  onClick={() => onToggleQuizLock(currentAsg.id)}
                  className="canvas-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    backgroundColor: currentAsg.isLocked ? '#0055A5' : '#FFFFFF',
                    color: currentAsg.isLocked ? '#FFFFFF' : '#475569',
                    border: '1px solid #CBD5E1',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    opacity: togglingQuizLockId === currentAsg.id ? 0.7 : 1,
                  }}
                  title={currentAsg.isLocked ? `Unlock for ${activeCohortName}` : `Lock for ${activeCohortName}`}
                >
                  {togglingQuizLockId === currentAsg.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : currentAsg.isLocked ? (
                    <Unlock size={14} />
                  ) : (
                    <Lock size={14} />
                  )}
                  <span>{currentAsg.isLocked ? 'Unlock' : 'Lock'}</span>
                </button>
                <button
                  onClick={() => onUpdateQuiz(currentAsg)}
                  className="canvas-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    border: '1px solid #CBD5E1',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  title="Update Quiz Rules & Settings"
                >
                  <Settings size={14} />
                  <span>Update</span>
                </button>
                <button
                  onClick={onOpenGradingView}
                  className="canvas-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    backgroundColor: '#0055A5',
                    color: '#FFFFFF',
                    border: '1px solid #0055A5',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                  title="Go to Grading page: grade student submissions, view completion status and release grades"
                >
                  <Award size={14} />
                  <span>Grading</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* STUDENT VIEW: Personal Submission Details & Work on Activity / Take Quiz Button (FIRST BLOCK) */}
      {!isTutor && (
        isAct && actRaw ? (
          (() => {
            const studentSub = actRaw.submission || (actRaw as any).my_submission;
            const hasSubmitted = Boolean(studentSub && (studentSub.id || studentSub.status || studentSub.submitted_at));
            const isGradesPublished = Boolean(actRaw.grades_published);
            const hasScore = isGradesPublished && studentSub && studentSub.score !== null;

            if (hasSubmitted) {
              return (
                <div
                  className="canvas-card"
                  style={{
                    padding: '22px',
                    border: hasScore ? '1px solid #BBF7D0' : '1px solid #BAE6FD',
                    backgroundColor: hasScore ? '#F0FDF4' : '#F0F9FF',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      {hasScore ? (
                        <>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '0.75rem', fontWeight: 800 }}>
                            <CheckCircle size={14} />
                            <span>OFFICIAL GRADE RELEASED</span>
                          </div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 850, color: '#15803D', marginTop: '8px' }}>
                            Score: {studentSub.score} / {actRaw.max_score || actRaw.total_points || 100} Points
                          </div>
                          <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '3px' }}>
                            {studentSub.score >= (actRaw.passing_points || 70) ? (
                              <strong style={{ color: '#15803D' }}>Passing grade benchmark achieved.</strong>
                            ) : (
                              <strong style={{ color: '#B45309' }}>Passing benchmark not met. Review tutor feedback.</strong>
                            )}
                            {studentSub.submitted_at && ` • Submitted on ${formatD(studentSub.submitted_at)}`}
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '4px', backgroundColor: '#DBEAFE', color: '#1D4ED8', fontSize: '0.75rem', fontWeight: 800 }}>
                            <CheckCircle size={14} />
                            <span>ACTIVITY SUBMITTED</span>
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', marginTop: '8px' }}>
                            Submission Received
                          </div>
                          <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
                            Your activity submission was successfully received. Your tutor is currently reviewing cohort submissions. Points and instructor feedback will be displayed here once grades are officially published.
                          </div>
                          {studentSub.submitted_at && (
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '6px' }}>
                              Submitted on: <strong>{formatD(studentSub.submitted_at)}</strong>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontSize: '0.8rem',
                          color: '#334155',
                          backgroundColor: '#FFFFFF',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <Award size={13} color="#0055A5" />
                          <span><strong>Total Points:</strong> {currentAsg.points} pts</span>
                        </span>
                        <span style={{ color: '#CBD5E1' }}>•</span>
                        <span><strong>Passing:</strong> {actRaw.passing_points || 70} pts</span>
                      </div>
                    </div>
                  </div>

                  {/* Tutor Feedback Block (when published) */}
                  {hasScore && (studentSub.tutor_feedback || (studentSub as any).feedback) && (
                    <div
                      style={{
                        marginTop: '16px',
                        padding: '14px 18px',
                        borderRadius: '6px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #BBF7D0',
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '4px' }}>
                        Instructor Feedback & Remarks
                      </div>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#1F2937', fontStyle: 'italic', lineHeight: 1.5 }}>
                        "{studentSub.tutor_feedback || (studentSub as any).feedback}"
                      </p>
                    </div>
                  )}

                  {/* Student Submitted Attachment / Details (if any) */}
                  {(() => {
                    const subAtt = studentSub.attachment_file || studentSub.attachment || studentSub.submission_file;
                    const subTxt = studentSub.submission_text || studentSub.text_content;
                    if (!subAtt && !studentSub.submission_link && !subTxt) return null;

                    const isSubPdf = Boolean(
                      subAtt &&
                        (/\.pdf(\?.*)?$/i.test(subAtt) ||
                          subAtt.toLowerCase().includes('.pdf') ||
                          studentSub.submission_method === 'pdf_upload')
                    );

                    return (
                      <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div
                          style={{
                            padding: '12px 16px',
                            borderRadius: '6px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={16} color="#64748B" />
                            <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                              Your Submitted Work:
                            </span>
                            {subTxt && (
                              <span style={{ fontSize: '0.82rem', color: '#1E293B' }}>
                                "{subTxt.slice(0, 80)}{subTxt.length > 80 ? '...' : ''}"
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {subAtt && (
                              <a
                                href={subAtt}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="canvas-btn"
                                style={{
                                  padding: '5px 12px',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  color: '#0055A5',
                                  backgroundColor: '#EFF6FF',
                                  border: '1px solid #BFDBFE',
                                  borderRadius: '4px',
                                  textDecoration: 'none',
                                }}
                              >
                                <Download size={13} />
                                <span>Download File</span>
                              </a>
                            )}
                            {studentSub.submission_link && (
                              <a
                                href={studentSub.submission_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="canvas-btn"
                                style={{
                                  padding: '5px 12px',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  color: '#0055A5',
                                  backgroundColor: '#EFF6FF',
                                  border: '1px solid #BFDBFE',
                                  borderRadius: '4px',
                                  textDecoration: 'none',
                                }}
                              >
                                <ExternalLink size={13} />
                                <span>Open Submitted Link</span>
                              </a>
                            )}
                          </div>
                        </div>
                        {/* Inline PDF Viewer for Student's Submitted Document */}
                        {isSubPdf && subAtt && (
                          <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                            <PdfViewer url={subAtt} title="Your Submitted PDF" minHeight="420px" />
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            }

            const isBeforeOpenDate = Boolean(actRaw.open_date && new Date(actRaw.open_date) > new Date());

            // Student has NOT submitted yet -> Render "Work on Activity" button
            return (
              <div
                className="canvas-card"
                style={{
                  padding: '22px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
                      Your Activity Status
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B' }}>
                        {currentAsg.title}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                        {isBeforeOpenDate
                          ? `This activity is scheduled to open on ${currentAsg.openDate}. You can review instructions, learning materials, and the rubric below, but submissions cannot be made before the open date.`
                          : 'Review the instructions and learning materials below, or click below to submit your work.'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '0.8rem',
                        color: '#334155',
                        backgroundColor: '#F1F5F9',
                        padding: '5px 12px',
                        borderRadius: '4px',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Award size={13} color="#0055A5" />
                        <span><strong>Total Points:</strong> {currentAsg.points} pts</span>
                      </span>
                      <span style={{ color: '#CBD5E1' }}>•</span>
                      <span><strong>Passing:</strong> {actRaw.passing_points || 70} pts</span>
                    </div>

                    {currentAsg.isLocked ? (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          backgroundColor: '#F1F5F9',
                          color: '#64748B',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}
                      >
                        <Lock size={15} />
                        <span>Activity is currently locked by your instructor</span>
                      </div>
                    ) : isBeforeOpenDate ? (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '9px 18px',
                          backgroundColor: '#F8FAFC',
                          color: '#475569',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <Clock size={16} color="#0055A5" />
                        <span>Opens on {currentAsg.openDate}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onWorkOnActivity(actRaw)}
                        className="canvas-btn canvas-btn-primary"
                        style={{
                          padding: '10px 24px',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                        }}
                      >
                        <PenTool size={16} />
                        <span>Work on Activity</span>
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <div
            className="canvas-card"
            style={{
              padding: '22px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
                  Assessment Status
                </div>
                {(() => {
                  let currentStudentId = 'u-4';
                  try {
                    const rawUser = localStorage.getItem('sifo_user');
                    if (rawUser) currentStudentId = JSON.parse(rawUser).id || currentStudentId;
                  } catch {}

                  const isQuizBeforeOpen = Boolean(
                    (currentAsg.rawOpenDate && new Date(currentAsg.rawOpenDate) > new Date()) ||
                    currentAsg.status === 'Scheduled'
                  );

                  const studentSub = currentAsg.submissions.find(
                    (s) => s.studentId === currentStudentId
                  );

                  if (studentSub && studentSub.completed) {
                    if (currentAsg.gradesPublished && studentSub.score) {
                      return (
                        <div style={{ marginTop: '4px' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803D' }}>
                            Score: {studentSub.score}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                            {studentSub.feedback ? (
                              <span>
                                Instructor Feedback: <em>"{studentSub.feedback}"</em>
                              </span>
                            ) : (
                              'Completed & Graded • Official Record Logged'
                            )}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#15803D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle size={16} color="#15803D" /> Submitted
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                          Your answers have been submitted. Results will be visible once your instructor publishes the grades.
                        </div>
                      </div>
                    );
                  }

                  if (currentAsg.status === 'Graded') {
                    if (currentAsg.gradesPublished && currentAsg.score) {
                      return (
                        <div style={{ marginTop: '4px' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803D' }}>
                            Score: {currentAsg.score}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                            Completed & Graded • Passing Grade Achieved
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#15803D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle size={16} color="#15803D" /> Submitted
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                          Official records pending release by instructor.
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div style={{ marginTop: '4px' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B' }}>
                        {currentAsg.title}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                        {isQuizBeforeOpen
                          ? `This quiz is scheduled to open on ${currentAsg.openDate}. You can review instructions, time limit, and rubric below, but you cannot take this quiz until it opens.`
                          : 'Review the rubrics and guidelines below before starting.'}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '0.8rem',
                    color: '#334155',
                    backgroundColor: '#F1F5F9',
                    padding: '5px 12px',
                    borderRadius: '4px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={13} color="#0055A5" />
                    <span><strong>Duration:</strong> {currentAsg.timeLimit}</span>
                  </span>
                  <span style={{ color: '#CBD5E1' }}>•</span>
                  <span><strong>Attempts:</strong> {currentAsg.attemptsAllowed || 1}</span>
                </div>

                {currentAsg.isLocked ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      backgroundColor: '#F1F5F9',
                      color: '#64748B',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    <Lock size={15} />
                    <span>Quiz is currently locked by your instructor</span>
                  </div>
                ) : (() => {
                  const isQuizBeforeOpen = Boolean(
                    (currentAsg.rawOpenDate && new Date(currentAsg.rawOpenDate) > new Date()) ||
                    currentAsg.status === 'Scheduled'
                  );

                  if (isQuizBeforeOpen) {
                    return (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '9px 18px',
                          backgroundColor: '#F8FAFC',
                          color: '#475569',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <Clock size={16} color="#0055A5" />
                        <span>Opens on {currentAsg.openDate}</span>
                      </div>
                    );
                  }

                  let currentStudentId = 'u-4';
                  try {
                    const rawUser = localStorage.getItem('sifo_user');
                    if (rawUser) currentStudentId = JSON.parse(rawUser).id || currentStudentId;
                  } catch {}

                  const attemptsKey = `sifo_quiz_attempts_${currentAsg.id}_${currentStudentId}`;
                  const generalAttemptsKey = `sifo_quiz_attempts_${currentAsg.id}`;
                  const studentSub = currentAsg.submissions.find(
                    (s) => s.studentId === currentStudentId && s.completed
                  );

                  const attemptsCount = Math.max(
                    Number(localStorage.getItem(attemptsKey) || 0),
                    Number(localStorage.getItem(generalAttemptsKey) || 0),
                    studentSub ? 1 : 0
                  );

                  const maxAttempts = currentAsg.attemptsAllowed || 1; // 0 means unlimited
                  const hasAttemptsRemaining = maxAttempts === 0 || attemptsCount < maxAttempts;

                  if (!hasAttemptsRemaining) {
                    return (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          backgroundColor: '#F0FDF4',
                          color: '#15803D',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          border: '1px solid #DCFCE7',
                        }}
                      >
                        <CheckCircle size={15} color="#15803D" />
                        <span>All {maxAttempts} {maxAttempts === 1 ? 'Attempt' : 'Attempts'} Completed</span>
                      </div>
                    );
                  }

                  const buttonLabel = attemptsCount === 0 ? 'Take Quiz' : 'Retake Quiz';

                  return (
                    <button
                      onClick={() => onTakeQuiz(currentAsg.id)}
                      className="canvas-btn canvas-btn-primary"
                      style={{
                        padding: '10px 24px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <span>{buttonLabel}</span>
                      <ChevronRight size={16} />
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        )
      )}

      {/* Common Assessment / Activity Metadata Summary */}
      <div
        className="canvas-card"
        style={{
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
        }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', color: '#1E293B', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.02em' }}>Due Date</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#475569', marginTop: '2px' }}>
            {currentAsg.dueDate}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#1E293B', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.02em' }}>Available</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#475569', marginTop: '2px' }}>
            {currentAsg.openDate}
          </div>
        </div>
        {isAct ? (
          <div>
            <div style={{ fontSize: '0.8rem', color: '#1E293B', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.02em' }}>Submission Methods</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0055A5', marginTop: '2px' }}>
              {Array.isArray(actRaw?.allowed_submission_methods) && actRaw.allowed_submission_methods.length > 0
                ? actRaw.allowed_submission_methods
                    .map((m: string) =>
                      m === 'online_text' ? 'Text Response' :
                      m === 'pdf_upload' ? 'PDF Upload' :
                      m === 'image_upload' ? 'Image Upload' :
                      m === 'link' ? 'Link / Drive' : m
                    )
                    .join(', ')
                : 'Online Text & Files'}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '0.8rem', color: '#1E293B', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.02em' }}>Closing</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#475569', marginTop: '2px' }}>
              {currentAsg.closingDate}
            </div>
          </div>
        )}
        <div>
          <div style={{ fontSize: '0.8rem', color: '#1E293B', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.02em' }}>
            {isAct ? 'Total Points & Passing' : 'Points & Time Limit'}
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#0055A5', marginTop: '2px' }}>
            {currentAsg.points} pts {isAct ? `• Pass: ${actRaw?.passing_points || 70} pts` : `• ${currentAsg.timeLimit}`}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#1E293B', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.02em' }}>Late Submission</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 500, color: currentAsg.allowLateSubmission ? '#B45309' : '#64748B', marginTop: '2px' }}>
            {currentAsg.allowLateSubmission
              ? `Allowed until closing cutoff`
              : 'Strict Deadline — No late submissions'}
          </div>
        </div>
      </div>

      {/* Attached Learning Materials for Activity (Google Slides, Attachment Files, Links) */}
      {isAct && actRaw && (actRaw.attachment_url || actRaw.attachment) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Google Slides presentation */}
          {(actRaw.resource_type === 'GOOGLE_SLIDES' ||
            (actRaw.attachment_url && actRaw.attachment_url.includes('docs.google.com/presentation'))) && (
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '8px',
                backgroundColor: '#FEF3C7',
                border: '1px solid #FDE68A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    backgroundColor: '#FDE68A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#B45309',
                  }}
                >
                  <Presentation size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#92400E' }}>
                    Google Slides Presentation Attached
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#B45309', marginTop: '2px' }}>
                    Your instructor provided interactive slides for this activity. Click to review before submitting.
                  </div>
                </div>
              </div>
              <a
                href={actRaw.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="canvas-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  backgroundColor: '#B45309',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                }}
              >
                <span>Open Google Slides</span>
                <ExternalLink size={14} />
              </a>
            </div>
          )}

          {/* Uploaded File / PDF / Diagram */}
          {Boolean(actRaw.attachment_file || actRaw.attachment) && (
            (() => {
              const actDocUrl = actRaw.attachment_file || actRaw.attachment;
              const isPdf =
                actRaw.resource_type === 'PDF' ||
                Boolean(
                  actDocUrl &&
                    (/\.pdf(\?.*)?$/i.test(actDocUrl) ||
                      actDocUrl.toLowerCase().includes('.pdf'))
                );
              const isImg =
                actRaw.resource_type === 'IMAGE' ||
                Boolean(
                  actDocUrl &&
                    /\.(png|jpe?g|webp|gif|svg)$/i.test(actDocUrl)
                );

              if (isPdf) {
                return (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      Activity Reference Document (PDF):
                    </div>
                    <PdfViewer
                      url={actDocUrl}
                      title={actRaw.title || 'Activity Reference PDF'}
                      minHeight="520px"
                    />
                  </div>
                );
              }

              if (isImg) {
                return (
                  <div
                    style={{
                      marginTop: '10px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      padding: '12px',
                      backgroundColor: '#F8FAFC',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '8px', textAlign: 'left' }}>
                      Activity Reference Diagram:
                    </div>
                    <img
                      src={actDocUrl || undefined}
                      alt="Activity Reference"
                      style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: '6px', objectFit: 'contain' }}
                    />
                  </div>
                );
              }

              return (
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        backgroundColor: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1D4ED8',
                      }}
                    >
                      <FileText size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#1E293B' }}>
                        Activity Reference Document
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                        Supporting study and practical material provided by instructor.
                      </div>
                    </div>
                  </div>
                  <a
                    href={actDocUrl || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="canvas-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      backgroundColor: '#FFFFFF',
                      color: '#0055A5',
                      border: '1px solid #0055A5',
                      borderRadius: '6px',
                      textDecoration: 'none',
                    }}
                  >
                    <Download size={14} />
                    <span>Download / View Resource</span>
                  </a>
                </div>
              );
            })()
          )}

          {/* External Resource Link (or External PDF) */}
          {actRaw.attachment_url &&
            !actRaw.attachment_url.includes('docs.google.com/presentation') && (
              (() => {
                const isUrlPdf = Boolean(
                  /\.pdf(\?.*)?$/i.test(actRaw.attachment_url) ||
                    actRaw.attachment_url.toLowerCase().includes('.pdf')
                );
                if (isUrlPdf) {
                  return (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                        Activity Reference Link (PDF):
                      </div>
                      <PdfViewer
                        url={actRaw.attachment_url}
                        title={actRaw.title || 'External PDF Resource'}
                        minHeight="520px"
                      />
                    </div>
                  );
                }
                return (
                  <div
                    style={{
                      padding: '12px 18px',
                      borderRadius: '6px',
                      backgroundColor: '#F0F9FF',
                      border: '1px solid #BAE6FD',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ExternalLink size={16} color="#0284C7" />
                      <span style={{ fontSize: '0.84rem', color: '#0369A1', fontWeight: 600 }}>
                        External Learning Link: {actRaw.attachment_url}
                      </span>
                    </div>
                    <a
                      href={actRaw.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="canvas-btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        backgroundColor: '#0284C7',
                        color: '#FFFFFF',
                        borderRadius: '4px',
                        textDecoration: 'none',
                      }}
                    >
                      <span>Open Link</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                );
              })()
            )}
        </div>
      )}

      {/* Instructions & Requirements Section */}
      <div className="canvas-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#DC2626', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={17} color="#DC2626" />
          <span>Instructions & Requirements</span>
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
          {currentAsg.instructions}
        </p>

        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#475569', margin: '0 0 10px 0' }}>
            Evaluation Rubric & Breakdown
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentAsg.rubrics.map((rubric, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '4px',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.82rem',
                }}
              >
                <span style={{ color: '#1E293B', fontWeight: 500 }}>{rubric.criteria}</span>
                <span style={{ fontWeight: 700, color: '#0055A5' }}>{rubric.points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailView;

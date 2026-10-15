import React from 'react';
import {
  Clock,
  CheckCircle,
  Plus,
  Lock,
  Unlock,
  Award,
  BookOpen,
  FileText,
  Presentation,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Users,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import type { CourseAssignmentItem } from '../types/courseWorkspace.types';
import type { CohortActivityItem } from '../../../../../core/services/TutorLmsService';

interface AssignmentListProps {
  isTutor: boolean;
  visibleAssignments: CourseAssignmentItem[];
  cohortStudents: any[];
  activeCohortName: string;
  togglingLockActivityId: string | null;
  togglingQuizLockId: string | null;
  deletingActivityId: string | null;
  onOpenAssignment: (id: string) => void;
  onCreateActivity: () => void;
  onEditActivity: (act: CohortActivityItem) => void;
  onDeleteActivity: (act: CohortActivityItem) => void;
  onToggleActivityLock: (act: CohortActivityItem) => void;
  onToggleQuizLock: (quizId: string) => void;
  onReviewSubmissions: (act: CohortActivityItem) => void;
}

export const AssignmentList: React.FC<AssignmentListProps> = ({
  isTutor,
  visibleAssignments,
  cohortStudents,
  activeCohortName,
  togglingLockActivityId,
  togglingQuizLockId,
  deletingActivityId,
  onOpenAssignment,
  onCreateActivity,
  onEditActivity,
  onDeleteActivity,
  onToggleActivityLock,
  onToggleQuizLock,
  onReviewSubmissions,
}) => {
  return (
    <>
      {isTutor && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
          <button
            type="button"
            onClick={onCreateActivity}
            className="canvas-btn canvas-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            <span>Create Activity</span>
          </button>
        </div>
      )}

      {/* UPCOMING & ACTIVE ASSIGNMENTS BLOCK */}
      <div className="canvas-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB', fontWeight: 700, fontSize: '0.88rem', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="#64748B" />
            <span>Upcoming & Active Assignments ({visibleAssignments.filter(a => a.status === 'Open' || a.status === 'Scheduled').length})</span>
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
            {isTutor ? 'Click to inspect submissions & grade' : 'Click to read instructions & open assignment'}
          </span>
        </div>
        <div>
          {visibleAssignments.filter(a => a.status === 'Open' || a.status === 'Scheduled').length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
              No upcoming or scheduled assignments at this time.
            </div>
          ) : (
            visibleAssignments
              .filter(a => a.status === 'Open' || a.status === 'Scheduled')
              .map((item) => {
                const isAct = Boolean(item.isCohortActivity && item.activityRaw);
                const act = item.activityRaw;

                const isGoogleSlides =
                  act &&
                  (act.resource_type === 'GOOGLE_SLIDES' ||
                    (act.attachment_url && act.attachment_url.includes('docs.google.com/presentation')));
                const isPdf =
                  act &&
                  (act.resource_type === 'PDF' ||
                    Boolean(
                      (act.attachment_url && (/\.pdf(\?.*)?$/i.test(act.attachment_url) || act.attachment_url.toLowerCase().includes('.pdf'))) ||
                      (act.attachment && (/\.pdf(\?.*)?$/i.test(act.attachment) || act.attachment.toLowerCase().includes('.pdf')))
                    ));
                const isImage =
                  act &&
                  (act.resource_type === 'IMAGE' ||
                    (act.attachment_url && /\.(png|jpe?g|webp|gif)$/i.test(act.attachment_url)));

                const totalRoster = item.submissions?.length || cohortStudents.length;
                const completedCount = item.submissions?.filter((s) => s.completed).length || 0;
                const completionPct = Math.round((completedCount / totalRoster) * 100);

                return (
                  <div
                    key={item.id}
                    onClick={() => onOpenAssignment(item.id)}
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      backgroundColor: '#FFFFFF',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {isAct ? (
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: isGoogleSlides
                              ? '#FEF3C7'
                              : isPdf
                              ? '#FEE2E2'
                              : isImage
                              ? '#E0F2FE'
                              : '#F1F5F9',
                            color: isGoogleSlides
                              ? '#D97706'
                              : isPdf
                              ? '#DC2626'
                              : isImage
                              ? '#0284C7'
                              : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isGoogleSlides ? (
                            <Presentation size={18} />
                          ) : isPdf ? (
                            <FileText size={18} />
                          ) : isImage ? (
                            <ImageIcon size={18} />
                          ) : (
                            <BookOpen size={18} />
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Award size={18} />
                        </div>
                      )}

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                            {item.title}
                          </span>

                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: '#F1F5F9',
                              color: '#475569',
                            }}
                          >
                            {item.type}
                          </span>

                          {item.status === 'Scheduled' && (
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: '#EFF6FF',
                                color: '#1D4ED8',
                                border: '1px solid #DBEAFE',
                              }}
                            >
                              Scheduled
                            </span>
                          )}

                          {isGoogleSlides && (
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: '#FEF3C7',
                                color: '#B45309',
                                border: '1px solid #FDE68A',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Presentation size={11} />
                              <span>Google Slides</span>
                            </span>
                          )}
                          {isPdf && (
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: '#FEE2E2',
                                color: '#B91C1C',
                                border: '1px solid #FECACA',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <FileText size={11} />
                              <span>PDF Attached</span>
                            </span>
                          )}
                          {isImage && (
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: '#E0F2FE',
                                color: '#0369A1',
                                border: '1px solid #BAE6FD',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <ImageIcon size={11} />
                              <span>Diagram</span>
                            </span>
                          )}

                          {isTutor && (
                            item.isLocked ? (
                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  backgroundColor: '#FEE2E2',
                                  color: '#DC2626',
                                  border: '1px solid #FECACA',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Lock size={11} />
                                <span>Locked</span>
                              </span>
                            ) : (
                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  backgroundColor: '#DCFCE7',
                                  color: '#15803D',
                                  border: '1px solid #BBF7D0',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Unlock size={11} />
                                <span>Unlocked</span>
                              </span>
                            )
                          )}

                          {!isTutor && (item.isSubmitted || item.studentSubmitted) && !item.gradesPublished && (
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: '#FEF3C7',
                                color: '#B45309',
                                border: '1px solid #FDE68A',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Clock size={11} />
                              <span>Submitted</span>
                            </span>
                          )}
                          {!isTutor && item.score && item.gradesPublished && (
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: '#DCFCE7',
                                color: '#15803D',
                                border: '1px solid #BBF7D0',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <CheckCircle size={11} />
                              <span>Score: {item.score}</span>
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                          {item.openDate !== 'Open Access' ? `Opens: ${item.openDate} • ` : ''}Due: {item.dueDate} • {item.points} pts
                        </div>
                      </div>
                    </div>

                    {/* Right side controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {isTutor ? (
                        isAct ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              disabled={togglingLockActivityId === act!.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleActivityLock(act!);
                              }}
                              className="canvas-btn"
                              style={{
                                padding: '5px 10px',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                backgroundColor: item.isLocked ? '#0055A5' : '#FFFFFF',
                                color: item.isLocked ? '#FFFFFF' : '#475569',
                                border: '1px solid #CBD5E1',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                              title={item.isLocked ? `Unlock for ${activeCohortName}` : `Lock for ${activeCohortName}`}
                            >
                              {item.isLocked ? <Unlock size={12} /> : <Lock size={12} />}
                              <span>{item.isLocked ? 'Unlock' : 'Lock'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditActivity(act!);
                              }}
                              className="canvas-btn"
                              style={{
                                padding: '5px 10px',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                backgroundColor: '#FFFFFF',
                                color: '#475569',
                                border: '1px solid #CBD5E1',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                              title="Edit Activity"
                            >
                              <Edit2 size={12} />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onReviewSubmissions(act!);
                              }}
                              className="canvas-btn"
                              style={{
                                padding: '5px 12px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                backgroundColor: '#0055A5',
                                color: '#FFFFFF',
                                border: '1px solid #0055A5',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                              title="Review student submissions & award grades"
                            >
                              <Users size={12} />
                              <span>Submissions ({act?.submission_count || 0})</span>
                            </button>

                            <button
                              type="button"
                              disabled={deletingActivityId === act!.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteActivity(act!);
                              }}
                              className="canvas-btn"
                              style={{
                                padding: '5px 8px',
                                fontSize: '0.74rem',
                                backgroundColor: '#FFFFFF',
                                color: '#DC2626',
                                border: '1px solid #FECACA',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                              title="Delete Activity"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                              type="button"
                              disabled={togglingQuizLockId === item.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleQuizLock(item.id);
                              }}
                              className="canvas-btn"
                              style={{
                                padding: '5px 10px',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                backgroundColor: item.isLocked ? '#0055A5' : '#FFFFFF',
                                color: item.isLocked ? '#FFFFFF' : '#475569',
                                border: '1px solid #CBD5E1',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                opacity: togglingQuizLockId === item.id ? 0.7 : 1,
                              }}
                              title={item.isLocked ? `Unlock for ${activeCohortName}` : `Lock for ${activeCohortName}`}
                            >
                              {togglingQuizLockId === item.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : item.isLocked ? (
                                <Unlock size={12} />
                              ) : (
                                <Lock size={12} />
                              )}
                              <span>{item.isLocked ? 'Unlock' : 'Lock'}</span>
                            </button>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                                {completedCount} / {totalRoster} completed
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '1px' }}>
                                {completionPct}% completion rate
                              </div>
                            </div>
                            <span
                              className="canvas-btn"
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: '#F1F5F9',
                                color: '#475569',
                                border: '1px solid #CBD5E1',
                                borderRadius: '4px',
                              }}
                            >
                              <Users size={13} />
                              <span>Manage & Grade</span>
                            </span>
                          </div>
                        )
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                            {item.score ? 'View Submission & Grade' : 'View Instructions & Details'}
                          </span>
                          <ChevronRight size={15} color="#94A3B8" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* PAST ASSIGNMENTS BLOCK */}
      <div className="canvas-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB', fontWeight: 700, fontSize: '0.88rem', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} color="#64748B" />
            <span>Past Assignments ({visibleAssignments.filter(a => a.status === 'Past' || a.status === 'Closed').length})</span>
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
            {isTutor ? 'Inspect past submissions & records' : 'Completed & graded assessments'}
          </span>
        </div>
        <div>
          {visibleAssignments.filter(a => a.status === 'Past' || a.status === 'Closed').length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
              No past assignments recorded.
            </div>
          ) : (
            visibleAssignments
              .filter(a => a.status === 'Past' || a.status === 'Closed')
              .map((item) => {
                const isAct = Boolean(item.isCohortActivity && item.activityRaw);
                const act = item.activityRaw;

                const isGoogleSlides =
                  act &&
                  (act.resource_type === 'GOOGLE_SLIDES' ||
                    (act.attachment_url && act.attachment_url.includes('docs.google.com/presentation')));
                const isPdf =
                  act &&
                  (act.resource_type === 'PDF' ||
                    Boolean(
                      (act.attachment_url && (/\.pdf(\?.*)?$/i.test(act.attachment_url) || act.attachment_url.toLowerCase().includes('.pdf'))) ||
                      (act.attachment && (/\.pdf(\?.*)?$/i.test(act.attachment) || act.attachment.toLowerCase().includes('.pdf')))
                    ));
                const isImage =
                  act &&
                  (act.resource_type === 'IMAGE' ||
                    (act.attachment_url && /\.(png|jpe?g|webp|gif)$/i.test(act.attachment_url)));

                const totalRoster = item.submissions?.length || cohortStudents.length;
                const completedCount = item.submissions?.filter((s) => s.completed).length || 0;
                const completionPct = Math.round((completedCount / totalRoster) * 100);

                return (
                  <div
                    key={item.id}
                    onClick={() => onOpenAssignment(item.id)}
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      backgroundColor: '#FFFFFF',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {isAct ? (
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: isGoogleSlides
                              ? '#FEF3C7'
                              : isPdf
                              ? '#FEE2E2'
                              : isImage
                              ? '#E0F2FE'
                              : '#F1F5F9',
                            color: isGoogleSlides
                              ? '#D97706'
                              : isPdf
                              ? '#DC2626'
                              : isImage
                              ? '#0284C7'
                              : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isGoogleSlides ? (
                            <Presentation size={18} />
                          ) : isPdf ? (
                            <FileText size={18} />
                          ) : isImage ? (
                            <ImageIcon size={18} />
                          ) : (
                            <BookOpen size={18} />
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Award size={18} />
                        </div>
                      )}

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                            {item.title}
                          </span>

                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: '#F1F5F9',
                              color: '#475569',
                            }}
                          >
                            {item.type}
                          </span>

                          {isGoogleSlides && (
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: '#FEF3C7',
                                color: '#B45309',
                                border: '1px solid #FDE68A',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Presentation size={11} />
                              <span>Google Slides</span>
                            </span>
                          )}
                          {isPdf && (
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: '#FEE2E2',
                                color: '#B91C1C',
                                border: '1px solid #FECACA',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <FileText size={11} />
                              <span>PDF Attached</span>
                            </span>
                          )}
                          {isImage && (
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: '#E0F2FE',
                                color: '#0369A1',
                                border: '1px solid #BAE6FD',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <ImageIcon size={11} />
                              <span>Diagram</span>
                            </span>
                          )}

                          {!isTutor && item.score && (
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: '#DCFCE7',
                                color: '#15803D',
                                border: '1px solid #BBF7D0',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <CheckCircle size={11} />
                              <span>Score: {item.score}</span>
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                          Due: {item.dueDate} • {item.points} pts
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {isTutor ? (
                        isAct ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onReviewSubmissions(act!);
                              }}
                              className="canvas-btn"
                              style={{
                                padding: '5px 12px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                backgroundColor: '#0055A5',
                                color: '#FFFFFF',
                                border: '1px solid #0055A5',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                            >
                              <Users size={12} />
                              <span>Submissions ({act?.submission_count || 0})</span>
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                                {completedCount} / {totalRoster} completed
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '1px' }}>
                                {completionPct}% completion rate
                              </div>
                            </div>
                            <span
                              className="canvas-btn"
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: '#F1F5F9',
                                color: '#475569',
                                border: '1px solid #CBD5E1',
                                borderRadius: '4px',
                              }}
                            >
                              <Users size={13} />
                              <span>Manage & Grade</span>
                            </span>
                          </div>
                        )
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ textAlign: 'right' }}>
                            {item.isCohortActivity ? (
                              item.studentSubmitted ? (
                                <>
                                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: item.score ? '#15803D' : '#0055A5' }}>
                                    {item.score ? `Score: ${item.score}` : 'Submitted'}
                                  </span>
                                  <div style={{ fontSize: '0.68rem', color: item.score ? '#15803D' : '#64748B' }}>
                                    {item.score ? 'Graded & Published' : 'Awaiting Grade Release'}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>
                                    Not Submitted
                                  </span>
                                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                                    Pending Student Work
                                  </div>
                                </>
                              )
                            ) : (
                              <>
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                                  Score: {item.score || (item.gradesPublished ? 'Graded' : 'Completed')}
                                </span>
                                <div style={{ fontSize: '0.68rem', color: item.score || item.gradesPublished ? '#15803D' : '#64748B' }}>
                                  {item.score || item.gradesPublished ? 'Graded & Recorded' : 'Submission Completed'}
                                </div>
                              </>
                            )}
                          </div>
                          <ChevronRight size={15} color="#94A3B8" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </>
  );
};

export default AssignmentList;
